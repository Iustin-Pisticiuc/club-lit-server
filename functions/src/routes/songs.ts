import { onRequest as firebaseRequest } from "firebase-functions/v1/https";
import * as admin from "firebase-admin";

import { corsHandler } from "../config/cors";
import { FieldValue } from "firebase-admin/firestore";
import { verifyIdToken } from "../config/authenticate";

export const addSongToQueue = firebaseRequest((req, res) => {
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
        res.send({
          message:
            // eslint-disable-next-line max-len
            "This song was already voted. Please go into Voted Songs tab and increment the vote.",
        });
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
            res.send({ message: "Congrats, your song was added to queue! 🎉" });
          })
          .catch((err) => {
            res.send({ message: "Error on adding song to queue" });
            console.log("Error on adding song to queue!", err);
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
          res.send({ message: "Error getting songs!" });
        });

      res.send(songs);
    } else {
      res.send({ status: 401, message: "unauthorized" });
    }
  });
});

export const incrementSongVotes = firebaseRequest((req, res) => {
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
        .then(() => {
          res.send({ message: "Vote incremented! 🎉" });
        })
        .catch((err) => {
          console.log(err);
          res.send({ message: "Error on incrementing vote!" });
        });
    } else {
      res.send({ status: 401, message: "unauthorized" });
    }
  });
});
