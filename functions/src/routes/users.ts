import {
  onCall as firebaseCall,
  CallableContext,
  HttpsError,
} from "firebase-functions/v1/https";

import { isTokenValid } from "../utils/helpers";
import {
  getDocumentQuerySnapshotData,
  getDocumentReference,
  getDocumentSnapshot,
  getDocumentSnapshotData,
} from "../utils/firebase-helpers";

export const addUser = firebaseCall(async (_, context: CallableContext) => {
  if (
    !context.auth ||
    !context.auth.uid ||
    !isTokenValid(context.auth.token.exp)
  ) {
    throw new HttpsError("failed-precondition", "Please authenticate");
  }

  const { uid, email, name } = context.auth.token;

  const userData = await getDocumentSnapshot("users", uid);

  if (userData && !userData.exists) {
    const userFields = {
      name,
      email,
      leftVotes: 5,
      leftSearches: 2,
      allTimeVoted: 0,
      role: "user",
    };

    const usersReference = getDocumentReference("users", uid);

    const response = usersReference

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
  return {};
});

export const getUserById = firebaseCall(async (_, context: CallableContext) => {
  if (
    !context.auth ||
    !context.auth.uid ||
    !isTokenValid(context.auth.token.exp)
  ) {
    throw new HttpsError("failed-precondition", "Please authenticate");
  }

  const user = await getDocumentSnapshotData("users", context.auth.uid);

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

    const usersData = await getDocumentQuerySnapshotData("users");

    const usersPromises: Promise<any>[] = [];

    usersData.forEach((user) => {
      usersPromises.push(user.ref.update({ leftVotes: 5 }));
    });

    const response = await Promise.all(usersPromises)
      .then(() => {
        return { message: "Today users searches reseted!" };
      })
      .catch((err) => {
        console.log("Error on reseting users search", err);
        return { message: "Searches were not reseted!" };
      });

    return response;
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

    const usersData = await getDocumentQuerySnapshotData("users");

    const usersPromises: Promise<any>[] = [];

    usersData.forEach((user) => {
      usersPromises.push(user.ref.update({ leftSearches: 2 }));
    });

    const response = await Promise.all(usersPromises)
      .then(() => {
        return { message: "Today users searches reseted!" };
      })
      .catch((err) => {
        console.log("Error on reseting users search", err);
        return { message: "Searches were not reseted!" };
      });

    return response;
  }
);
