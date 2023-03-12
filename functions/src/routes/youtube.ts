import { google } from "googleapis";
import { buildYoutubeResponse } from "../utils/helpers";
import { onRequest as firebaseRequest } from "firebase-functions/v1/https";
import * as admin from "firebase-admin";
import customCors from "../config/cors";

admin.initializeApp();

const youtube = google.youtube({
  version: "v3",
});

export const getVideo = firebaseRequest((req, res) => {
  customCors(req, res, () => {
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
  });
});

// export const addMessage = firebaseRequest((req, res) => {
//   customCors(req, res, async () => {
//     console.log(req.headers.authorization, req.headers);

//     // Grab the text parameter.
//     const original = req.query.text;
//     // Push the new message into Firestore using the Firebase Admin SDK.
//     const writeResult = await admin
//       .firestore()
//       .collection("messages")
//       .add({ original: original });
//     // Send back a message that we've successfully written the message
//     res.json({ result: `Message with ID: ${writeResult.id} added.` });
//   });
// });
