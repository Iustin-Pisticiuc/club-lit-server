import { google } from "googleapis";
import { onRequest as firebaseRequest } from "firebase-functions/v1/https";
import * as admin from "firebase-admin";

import { buildYoutubeResponse } from "../utils/helpers";
import { corsHandler } from "../config/cors";
import { FieldValue } from "firebase-admin/firestore";

admin.initializeApp();

const youtube = google.youtube({
  version: "v3",
});

export const getYoutubeSongs = firebaseRequest((req, res) => {
  corsHandler(req, res, () => {
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

export const voteSong = firebaseRequest((req, res) => {
  corsHandler(req, res, async () => {
    const { title, thumbnails, channelTitle, publishedAt, id } = req.body;

    const songRef = await admin
      .firestore()
      .collection("voted-songs")
      .doc(id)
      .get();

    if (songRef.exists) {
      res.send({ message: "This song was already voted" });
    } else {
      const songToVote = {
        title,
        thumbnails,
        channelTitle,
        publishedAt,
        votedTimes: 1,
      };

      admin
        .firestore()
        .collection("voted-songs")
        .doc(id)
        .set(songToVote)
        .then(() => {
          res.send({ message: "Congrats! Your vote has been recorded" });
        })
        .catch((err) => {
          res.send({ message: "Error on voting" });
          console.log("Error on voting", err);
        });
    }
  });
});

// export interface VotedSongs extends DocumentData {
//   id: string;
//   song: {
//     publishedAt: string;
//     title: string;
//     thumbnails: {
//       url: string;
//     };
//     channelTitle: string;
//   };
// }

export const getVotedSongs = firebaseRequest((req, res) => {
  corsHandler(req, res, async () => {
    const songs: any[] = [];

    await admin
      .firestore()
      .collection("voted-songs")
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
      });

    res.send(songs);
  });
});

export const incrementVotes = firebaseRequest((req, res) => {
  corsHandler(req, res, async () => {
    const { id } = req.body;
    console.log(id);

    const songToIncrementVote = admin
      .firestore()
      .collection("voted-songs")
      .doc(id);

    await songToIncrementVote
      .update({
        votedTimes: FieldValue.increment(1),
      })
      .then((response) => {
        console.log(response);
        res.send(response);
      })
      .catch((err) => {
        console.log(err);
        res.send(err);
      });
  });
});
