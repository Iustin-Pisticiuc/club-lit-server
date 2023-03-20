import { google } from "googleapis";
import { onRequest as firebaseRequest } from "firebase-functions/v1/https";
import * as admin from "firebase-admin";

import { buildYoutubeResponse } from "../utils/helpers";
import { corsHandler } from "../config/cors";
import { verifyIdToken } from "../config/authenticate";

admin.initializeApp();

const youtube = google.youtube({
  version: "v3",
});

export const getYoutubeSongs = firebaseRequest((req, res) => {
  corsHandler(req, res, async () => {
    const token = await verifyIdToken(req.get("Authorization"));

    if (token) {
      const title = req.query.title as string;

      youtube.search
        .list({
          key: process.env.YOUTUBE_API_KEY,
          part: ["snippet"],
          q: title,
          maxResults: 20,
        })
        .then((response) => {
          const {
            data: { items },
          } = response;

          if (items) {
            res.send(buildYoutubeResponse(items));
          }
        })
        .catch((err) => {
          res.send(err);
        });
    } else {
      res.send({ status: 401, message: "unauthorized" });
    }
  });
});
