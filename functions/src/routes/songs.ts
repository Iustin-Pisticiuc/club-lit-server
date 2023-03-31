import {
  onCall as firebaseCall,
  HttpsError,
  CallableContext,
} from "firebase-functions/v1/https";

import { FieldValue } from "firebase-admin/firestore";
import {
  checkAdminOrSuperAdmin,
  isTokenValid,
  isUsageVotesExceeded,
} from "../utils/helpers";
import { YoutubeFirebaseResponseType } from "../dtos/types";
import {
  getDocumentSnapshotData,
  getDocumentReference,
  getDocumentSnapshot,
  getDocumentQuerySnapshotData,
} from "../utils/firebase-helpers";

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

    const userData = await getDocumentSnapshotData("users", context.auth.uid);

    if (userData && isUsageVotesExceeded(userData)) {
      throw new HttpsError(
        "permission-denied",
        "The number votes for today have been reached."
      );
    }

    const deletedSongSnapshot = await getDocumentSnapshot("deleted-songs", id);

    if (deletedSongSnapshot && deletedSongSnapshot.exists) {
      throw new HttpsError(
        "permission-denied",
        "This song is not allowed to be added to list"
      );
    }

    const votedSongSnapshot = await getDocumentSnapshot("voted-songs", id);

    if (votedSongSnapshot && votedSongSnapshot.exists) {
      throw new HttpsError(
        "permission-denied",
        // eslint-disable-next-line max-len
        "This song was already voted. Please go into Voted Songs tab and add your vote there."
      );
    }

    const votedSongReference = getDocumentReference("voted-songs", id);

    const response: Promise<{ message: string }> = votedSongReference
      .set({
        title,
        thumbnails,
        channelTitle,
        publishedAt,
        votedTimes: 1,
      })
      .then(() => {
        return {
          message: "Congrats, your song was added to queue! 🎉",
        };
      })
      .catch((err: any) => {
        console.log("Error on adding song to queue!", err);
        return { message: "Error on adding song to queue" };
      });

    const userReference = getDocumentReference("users", context.auth.uid);

    userReference
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

export const getVotedSongs = firebaseCall(
  async (_, context: CallableContext) => {
    if (
      !context.auth ||
      !context.auth.uid ||
      !isTokenValid(context.auth.token.exp)
    ) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }

    const songs: YoutubeFirebaseResponseType[] = [];

    const votesData = await getDocumentQuerySnapshotData("voted-songs");

    votesData.forEach((doc) => {
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

    const userData = await getDocumentSnapshotData("users", context.auth.uid);

    if (userData && isUsageVotesExceeded(userData)) {
      throw new HttpsError(
        "permission-denied",
        "The number votes for today have been reached."
      );
    }

    const songToIncrementVote = getDocumentReference("voted-songs", id);

    const response = await songToIncrementVote
      .update({
        votedTimes: FieldValue.increment(1),
      })
      .then(() => {
        return { message: "Your vote has been recorded! 🎉" };
      })
      .catch((err: any) => {
        console.log(err);
        return { message: "Error on recording vote!" };
      });

    const user = getDocumentReference("users", context.auth.uid);

    await user
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

export const deleteVotedSong = firebaseCall(
  async (id: string, context: CallableContext) => {
    if (
      !context.auth ||
      !context.auth.uid ||
      !isTokenValid(context.auth.token.exp)
    ) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }

    const userData = await getDocumentSnapshotData("users", context.auth.uid);

    if (userData && checkAdminOrSuperAdmin(userData)) {
      throw new HttpsError(
        "permission-denied",
        "The number votes for today have been reached."
      );
    }

    const songToDelete = getDocumentReference("voted-songs", id);

    const response = await songToDelete
      .delete()
      .then(() => {
        return { message: "Song deleted! 🎉" };
      })
      .catch((err: any) => {
        console.log("Error on deleting song!", err);
        return { message: "Error on deleting song!" };
      });

    const deletedSongsReference = getDocumentReference("deleted-songs", id);

    await deletedSongsReference
      .set({
        id,
        deletedAt: new Date().toLocaleString("en-GB", {
          timeZone: "UTC",
        }),
      })
      .then(() => {
        return { message: "Song added to delete collection! 🎉" };
      })
      .catch((err: any) => {
        console.log("Error on adding song on delete collection!", err);
        return { message: "Error on adding song on delete collection!" };
      });

    return response;
  }
);
