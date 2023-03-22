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
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

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

    const usersCollection = admin
      .firestore()
      .collection("users")
      .doc(context.auth.uid);

    const user = await usersCollection.get().then((snapshot) => {
      return snapshot.data();
    });

    isUsageSearchExceeded(user);

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

    usersCollection
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
