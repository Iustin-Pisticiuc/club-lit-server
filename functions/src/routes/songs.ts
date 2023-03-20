import { onRequest as firebaseRequest } from "firebase-functions/v1/https";
import * as admin from "firebase-admin";

import { corsHandler } from "../config/cors";
import { FieldValue } from "firebase-admin/firestore";
import { verifyIdToken } from "../config/authenticate";

export const voteSong = firebaseRequest((req, res) => {
  corsHandler(req, res, async () => {
    const token = await verifyIdToken(req.get("Authorization"));

    if (token) {
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
    } else {
      res.send({ status: 401, message: "unauthorized" });
    }
  });
});

export const getVotedSongs = firebaseRequest((req, res) => {
  corsHandler(req, res, async () => {
    const token = await verifyIdToken(req.get("Authorization"));

    if (token) {
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
    } else {
      res.send({ status: 401, message: "unauthorized" });
    }
  });
});

export const incrementVotes = firebaseRequest((req, res) => {
  corsHandler(req, res, async () => {
    const token = await verifyIdToken(req.get("Authorization"));

    if (token) {
      const { id } = req.body;
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
    } else {
      res.send({ status: 401, message: "unauthorized" });
    }
  });
});
