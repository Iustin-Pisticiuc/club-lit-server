import {
  onCall as firebaseCall,
  CallableContext,
  HttpsError,
} from "firebase-functions/v1/https";
import * as admin from "firebase-admin";

import { FieldValue } from "firebase-admin/firestore";

export const addUser = firebaseCall(async (_, context: CallableContext) => {
  if (!context.auth || !context.auth.uid) {
    throw new HttpsError("failed-precondition", "Please authenticate");
  }

  const usersCollection = admin.firestore().collection("users");

  const { uid, email, name } = context.auth.token;

  const user = await admin.firestore().collection("users").doc(uid).get();

  if (user.exists) {
    return { message: "User alreary exists" };
  } else {
    const response = usersCollection
      .doc(uid)
      .create({
        name,
        email,
        todayVotedTimes: 0,
        todaySongsSearched: 0,
        allTimeVoted: 0,
        role: "user",
      })
      .then(() => {
        return { message: "User sucessfully added!" };
      })
      .catch((err) => {
        console.log("Error on adding user!", err);
        return { message: "Error on adding user" };
      });
    return response;
  }
});

export const getUserById = firebaseCall(async (_, context: CallableContext) => {
  if (!context.auth || !context.auth.uid) {
    throw new HttpsError("failed-precondition", "Please authenticate");
  }
  const usersCollection = admin.firestore().collection("users");

  const user = await usersCollection
    .doc(context.auth.uid)
    .get()
    .then((snapshot) => {
      return snapshot.data();
    });

  return user;
});

export const incrementUserVotedTimes = firebaseCall(
  async (_, context: CallableContext) => {
    if (!context.auth || !context.auth.uid) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }

    const user = admin.firestore().collection("users").doc(context.auth.uid);

    const response = user
      .update({
        todayVotedTimes: FieldValue.increment(1),
        allTimeVoted: FieldValue.increment(1),
      })
      .then(() => {
        return { message: "Vote incremented! 🎉" };
      })
      .catch((err) => {
        console.log("Error on incrementing vote!", err);
        return { message: "Error on incrementing vote!" };
      });

    return response;
  }
);

export const incrementUserSearchedTimes = firebaseCall(
  async (_, context: CallableContext) => {
    if (!context.auth || !context.auth.uid) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }

    const user = admin.firestore().collection("users").doc(context.auth.uid);

    const response = await user
      .update({
        todaySongsSearched: FieldValue.increment(1),
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

export const resetTodayUserVotedTime = firebaseCall(
  async (_, context: CallableContext) => {
    if (!context.auth || !context.auth.uid) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }
    const usersCollection = admin.firestore().collection("users");

    await usersCollection
      .get()
      .then((response) => {
        response.docs.map((user) => {
          user.ref.update({
            todayVotedTimes: 0,
          });
        });
      })
      .catch((err: any) => {
        console.log("Error on reseting users votes", err);
        return { message: "Votes were not reseted!" };
      });

    return { message: "Today users votes reseted!" };
  }
);

export const resetTodayUserSearchedTimes = firebaseCall(
  async (_, context: CallableContext) => {
    if (!context.auth || !context.auth.uid) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }
    const usersCollection = admin.firestore().collection("users");

    await usersCollection
      .get()
      .then((response) => {
        response.docs.map((user) => {
          user.ref.update({
            todaySongsSearched: 0,
          });
        });
      })
      .catch((err) => {
        console.log("Error on reseting users search", err);
        return { message: "Votes were not reseted!" };
      });
    return { message: "Today users votes reseted!" };
  }
);
