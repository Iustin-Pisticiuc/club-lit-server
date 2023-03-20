import { onRequest as firebaseRequest } from "firebase-functions/v1/https";
import * as admin from "firebase-admin";

import { corsHandler } from "../config/cors";
import { FieldValue } from "firebase-admin/firestore";
import { verifyIdToken } from "../config/authenticate";

export const addUser = firebaseRequest((req, res) => {
  corsHandler(req, res, async () => {
    const token = await verifyIdToken(req.get("Authorization"));

    if (token && token?.userId) {
      const { userId, email, name } = token;

      const user = await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .get();

      if (user.exists) {
        res.send({ message: "User alreary exists" });
      } else {
        admin
          .firestore()
          .collection("users")
          .doc(userId)
          .create({
            name,
            email,
            todayVotedTimes: 0,
            todaySongsSearched: 0,
            allTimeVoted: 0,
            role: "user",
          })
          .then(() => {
            res.send({ message: "User sucessfully added!" });
          })
          .catch((err) => {
            res.send({ message: "Error on adding user" });
            console.log("Error on adding user!", err);
          });
      }
    } else {
      res.send({ status: 401, message: "unauthorized" });
    }
  });
});

export const getUserById = firebaseRequest((req, res) => {
  corsHandler(req, res, async () => {
    const token = await verifyIdToken(req.get("Authorization"));

    if (token && token?.userId) {
      const { userId } = token;

      await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .get()
        .then((response) => res.send(response.data()));
    } else {
      res.send({ status: 401, message: "unauthorized" });
    }
  });
});

export const incrementUserVotedTimes = firebaseRequest((req, res) => {
  corsHandler(req, res, async () => {
    const token = await verifyIdToken(req.get("Authorization"));

    const youtubeSearch = req.query.youtubeSearch as string;

    if (token && token?.userId) {
      const { userId } = token;

      const user = admin.firestore().collection("users").doc(userId);

      if (youtubeSearch) {
        await user
          .update({
            todaySongsSearched: FieldValue.increment(1),
          })
          .then(() => {
            res.send({ message: "Vote incremented! 🎉" });
          })
          .catch((err) => {
            console.log(err);
            res.send({ message: "Error on incrementing vote!" });
          });
      } else {
        await user
          .update({
            todayVotedTimes: FieldValue.increment(1),
            allTimeVoted: FieldValue.increment(1),
          })
          .then(() => {
            res.send({ message: "Vote incremented! 🎉" });
          })
          .catch((err) => {
            console.log(err);
            res.send({ message: "Error on incrementing vote!" });
          });
      }
    } else {
      res.send({ status: 401, message: "unauthorized" });
    }
  });
});

export const resetTodayUserVotedTime = firebaseRequest((req, res) => {
  corsHandler(req, res, async () => {
    const token = await verifyIdToken(req.get("Authorization"));

    if (token && token?.userId) {
      try {
        await admin
          .firestore()
          .collection("users")
          .get()
          .then((response) => {
            response.docs.map((user) => {
              user.ref.update({
                todayVotedTimes: 0,
              });
            });
          });
        res.send({ message: "All votes reseted!" });
      } catch (err) {
        console.log(err);
        res.send({ message: "Votes were not reseted!" });
      }
    } else {
      res.send({ status: 401, message: "unauthorized" });
    }
  });
});
