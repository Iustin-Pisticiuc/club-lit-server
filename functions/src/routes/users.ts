import {
  onCall as firebaseCall,
  CallableContext,
  HttpsError,
} from "firebase-functions/v1/https";
import * as admin from "firebase-admin";

import { isTokenValid } from "../utils/helpers";

export const addUser = firebaseCall(async (_, context: CallableContext) => {
  if (
    !context.auth ||
    !context.auth.uid ||
    !isTokenValid(context.auth.token.exp)
  ) {
    throw new HttpsError("failed-precondition", "Please authenticate");
  }

  const { uid, email, name } = context.auth.token;

  const usersCollection = admin.firestore().collection("users");

  const user = await admin.firestore().collection("users").doc(uid).get();

  if (user.exists) {
    return { message: "User alreary exists" };
  } else {
    const userFields = {
      name,
      email,
      leftVotes: 5,
      leftSearches: 2,
      allTimeVoted: 0,
      role: "user",
    };

    const response = usersCollection
      .doc(uid)
      .create(userFields)
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
  if (
    !context.auth ||
    !context.auth.uid ||
    !isTokenValid(context.auth.token.exp)
  ) {
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

export const resetTodayUserVotedTimes = firebaseCall(
  async (_, context: CallableContext) => {
    if (
      !context.auth ||
      !context.auth.uid ||
      !isTokenValid(context.auth.token.exp)
    ) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }

    const usersCollection = admin.firestore().collection("users");

    await usersCollection
      .get()
      .then((response) => {
        response.docs.map((user) => {
          user.ref.update({
            leftVotes: 5,
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
    if (
      !context.auth ||
      !context.auth.uid ||
      !isTokenValid(context.auth.token.exp)
    ) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }

    const usersCollection = admin.firestore().collection("users");

    await usersCollection
      .get()
      .then((response) => {
        response.docs.map((user) => {
          user.ref.update({
            leftSearches: 2,
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
