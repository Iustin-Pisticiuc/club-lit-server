import {
  onCall as firebaseCall,
  HttpsError,
  CallableContext,
} from "firebase-functions/v1/https";
import * as admin from "firebase-admin";

import { FieldValue } from "firebase-admin/firestore";
import { isTokenValid, isUsageVotesExceeded } from "../utils/helpers";
import { YoutubeFirebaseResponseType } from "../dtos/types";

export const addSongToQueue = firebaseCall(
  async (data, context: CallableContext) => {
    if (
      !context.auth ||
      !context.auth.uid ||
      !isTokenValid(context.auth.token.exp)
    ) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }

    const { title, thumbnails, channelTitle, publishedAt, id } = data;

    const votedSongsCollection = admin.firestore().collection("voted-songs");

    const songRef = await votedSongsCollection.doc(id).get();

    if (songRef.exists) {
      return {
        message:
          // eslint-disable-next-line max-len
          "This song was already voted. Please go into Voted Songs tab and increment the vote.",
      };
    } else {
      const usersCollection = admin
        .firestore()
        .collection("users")
        .doc(context.auth.uid);

      const user = await usersCollection.get().then((snapshot) => {
        return snapshot.data();
      });

      isUsageVotesExceeded(user);

      const songToVote = {
        title,
        thumbnails,
        channelTitle,
        publishedAt,
        votedTimes: 1,
      };

      const response: Promise<{ message: string }> = votedSongsCollection
        .doc(id)
        .set(songToVote)
        .then(() => {
          return {
            message: "Congrats, your song was added to queue! 🎉",
          };
        })
        .catch((err) => {
          console.log("Error on adding song to queue!", err);
          return { message: "Error on adding song to queue" };
        });

      usersCollection
        .update({
          leftVotes: FieldValue.increment(-1),
          allTimeVoted: FieldValue.increment(1),
        })
        .then(() => {
          return { message: "Your vote has been recorded! 🎉" };
        })
        .catch((err: any) => {
          console.log("Error on recording vote!", err);
          return { message: "Error on recording vote!" };
        });

      return response;
    }
  }
);

export const getVotedSongs = firebaseCall(
  async (_, context: CallableContext) => {
    if (
      !context.auth ||
      !context.auth.uid ||
      !isTokenValid(context.auth.token.exp)
    ) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }

    const votedSongsCollection = admin.firestore().collection("voted-songs");

    const songs: YoutubeFirebaseResponseType[] = [];

    await votedSongsCollection
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const id = doc.id;

          const { publishedAt, votedTimes, title, thumbnails, channelTitle } =
            doc.data();

          songs.push({
            id,
            publishedAt,
            votedTimes,
            title,
            thumbnails,
            channelTitle,
          });
        });
      })
      .catch((err) => {
        console.log("Error getting songs", err);
        return { message: "Error getting songs!" };
      });

    return songs;
  }
);

export const incrementSongAndUserVotes = firebaseCall(
  async (id: string, context: CallableContext) => {
    if (
      !context.auth ||
      !context.auth.uid ||
      !isTokenValid(context.auth.token.exp)
    ) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }

    const usersCollection = admin
      .firestore()
      .collection("users")
      .doc(context.auth.uid);

    const user = await usersCollection.get().then((snapshot) => {
      return snapshot.data();
    });

    isUsageVotesExceeded(user);

    const votedSongsCollection = admin.firestore().collection("voted-songs");

    const songToIncrementVote = votedSongsCollection.doc(id);

    const response = await songToIncrementVote
      .update({
        votedTimes: FieldValue.increment(1),
      })
      .then(() => {
        return { message: "Your vote has been recorded! 🎉" };
      })
      .catch((err) => {
        console.log(err);
        return { message: "Error on recording vote!" };
      });

    await usersCollection
      .update({
        leftVotes: FieldValue.increment(-1),
        allTimeVoted: FieldValue.increment(1),
      })
      .then(() => {
        return { message: "Your vote has been recorded! 🎉" };
      })
      .catch((err: any) => {
        console.log("Error on recording vote!", err);
        return { message: "Error on recording vote!" };
      });

    return response;
  }
);
