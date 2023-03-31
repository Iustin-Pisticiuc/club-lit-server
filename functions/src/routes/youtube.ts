import { google } from "googleapis";
import {
  CallableContext,
  HttpsError,
  onCall as firebaseCall,
} from "firebase-functions/v1/https";

import {
  buildYoutubeResponse,
  isTokenValid,
  isUsageSearchExceeded,
} from "../utils/helpers";
import { FieldValue } from "firebase-admin/firestore";
import {
  getDocumentReference,
  getDocumentSnapshotData,
} from "../utils/firebase-helpers";

const youtube = google.youtube({
  version: "v3",
});

export const getYoutubeSongs = firebaseCall(
  async (title, context: CallableContext) => {
    if (
      !context.auth ||
      !context.auth.uid ||
      !isTokenValid(context.auth.token.exp)
    ) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }

    const userData = await getDocumentSnapshotData("users", context.auth.uid);

    if (userData && isUsageSearchExceeded(userData)) {
      throw new HttpsError(
        "permission-denied",
        "The number votes for today have been reached."
      );
    }

    const response = youtube.search
      .list({
        key: process.env.YOUTUBE_API_KEY,
        part: ["snippet"],
        q: title,
        maxResults: 20,
      })
      .then((response) => {
        const items = response.data.items;
        if (items) {
          return buildYoutubeResponse(items);
        }
        return [];
      })
      .catch((err) => {
        console.log("Error on youtube search", err);

        return { message: "Error on youtube search" };
      });

    const usersReference = getDocumentReference("users", context.auth.uid);

    usersReference
      .update({
        leftSearches: FieldValue.increment(-1),
      })
      .then(() => {
        return { message: "Search incremented! 🎉" };
      })
      .catch((err) => {
        console.log("Error on incrementing search!", err);
        return { message: "Error on incrementing search!" };
      });

    return response;
  }
);
