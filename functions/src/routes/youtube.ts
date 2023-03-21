import { google } from "googleapis";
import {
  CallableContext,
  HttpsError,
  onCall as firebaseCall,
} from "firebase-functions/v1/https";

import { buildYoutubeResponse } from "../utils/helpers";

const youtube = google.youtube({
  version: "v3",
});

export const getYoutubeSongs = firebaseCall(
  async (title, context: CallableContext) => {
    if (!context.auth || !context.auth.uid) {
      throw new HttpsError("failed-precondition", "Please authenticate");
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

    return response;
  }
);
