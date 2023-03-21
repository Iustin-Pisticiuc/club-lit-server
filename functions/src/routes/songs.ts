import {
  onCall as firebaseCall,
  HttpsError,
  CallableContext,
} from "firebase-functions/v1/https";
import * as admin from "firebase-admin";

import { FieldValue } from "firebase-admin/firestore";

export const addSongToQueue = firebaseCall(
  async (data, context: CallableContext) => {
    if (!context.auth || !context.auth.uid) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }
    const votedSongsCollection = admin.firestore().collection("voted-songs");

    const { title, thumbnails, channelTitle, publishedAt, id } = data;

    const songRef = await votedSongsCollection.doc(id).get();

    if (songRef.exists) {
      return {
        message:
          // eslint-disable-next-line max-len
          "This song was already voted. Please go into Voted Songs tab and increment the vote.",
      };
    } else {
      const songToVote = {
        title,
        thumbnails,
        channelTitle,
        publishedAt,
        votedTimes: 1,
      };

      const response = votedSongsCollection
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

      return response;
    }
  }
);

export const getVotedSongs = firebaseCall(
  async (_, context: CallableContext) => {
    if (!context.auth || !context.auth.uid) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }
    const votedSongsCollection = admin.firestore().collection("voted-songs");

    const songs: any[] = [];

    await votedSongsCollection
      .get()
      .then((snapshot) => {
        snapshot.forEach((doc) => {
          const song = doc.data();
          const id = doc.id;

          songs.push({ id, ...song });
        });
      })
      .catch((err) => {
        console.log("Error getting songs", err);
        return { message: "Error getting songs!" };
      });

    return songs;
  }
);

export const incrementSongVotes = firebaseCall(
  async (id: string, context: CallableContext) => {
    if (!context.auth || !context.auth.uid) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }
    const votedSongsCollection = admin.firestore().collection("voted-songs");

    const songToIncrementVote = votedSongsCollection.doc(id);

    const response = songToIncrementVote
      .update({
        votedTimes: FieldValue.increment(1),
      })
      .then(() => {
        return { message: "Vote incremented! 🎉" };
      })
      .catch((err) => {
        console.log(err);
        return { message: "Error on incrementing vote!" };
      });

    return response;
  }
);
