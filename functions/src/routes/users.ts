import {
  onCall as firebaseCall,
  CallableContext,
  HttpsError,
} from "firebase-functions/v1/https";

import { checkSuperAdmin, isTokenValid } from "../utils/helpers";
import {
  getDocumentQuerySnapshotData,
  getDocumentReference,
  getDocumentSnapshot,
  getDocumentSnapshotData,
} from "../utils/firebase-helpers";
import { UsersFirebaseResponseType } from "../dtos/types";

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

export const getAllUsers = firebaseCall(async (_, context: CallableContext) => {
  if (
    !context.auth ||
    !context.auth.uid ||
    !isTokenValid(context.auth.token.exp)
  ) {
    throw new HttpsError("failed-precondition", "Please authenticate");
  }

  const userData = await getDocumentSnapshotData("users", context.auth.uid);

  if (userData && checkSuperAdmin(userData)) {
    throw new HttpsError("failed-precondition", "Permision denied");
  }

  const usersSnapshot = await getDocumentQuerySnapshotData("users");

  const users: UsersFirebaseResponseType[] = [];

  usersSnapshot.forEach((doc) => {
    const id = doc.id;

    const { email, name, role, leftSearches, allTimeVoted, leftVotes } =
      doc.data();

    users.push({
      id,
      email,
      name,
      role,
      leftSearches,
      allTimeVoted,
      leftVotes,
    });
  });

  if (users.length) {
    return users;
  }

  return { message: "Something went wrong! 🎉" };
});

export const resetSingleUserTimes = firebaseCall(
  async (id, context: CallableContext) => {
    if (
      !context.auth ||
      !context.auth.uid ||
      !isTokenValid(context.auth.token.exp)
    ) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }

    const userData = await getDocumentSnapshotData("users", context.auth.uid);

    if (userData && checkSuperAdmin(userData)) {
      throw new HttpsError("failed-precondition", "Permision denied");
    }

    const user = getDocumentReference("users", id);

    const response = await user
      .update({
        leftVotes: 5,
        leftSearches: 2,
      })
      .then(() => {
        return { message: "User votes and searches has been reseted! 🎉" };
      })
      .catch((err: any) => {
        console.log("Error on reseting user vote and searches!", err);
        return { message: "Error on reseting user vote and searches!" };
      });

    return response;
  }
);

export const resetAllUsersTimes = firebaseCall(
  async (_, context: CallableContext) => {
    if (
      !context.auth ||
      !context.auth.uid ||
      !isTokenValid(context.auth.token.exp)
    ) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }

    const userData = await getDocumentSnapshotData("users", context.auth.uid);

    if (userData && checkSuperAdmin(userData)) {
      throw new HttpsError("failed-precondition", "Permision denied");
    }

    const users = await getDocumentQuerySnapshotData("users");
    const usersToUpdate: Promise<any>[] = [];

    users.forEach((doc) => {
      usersToUpdate.push(
        doc.ref.update({
          leftVotes: 5,
          leftSearches: 2,
        })
      );
    });

    console.log(usersToUpdate);

    const response = Promise.all(usersToUpdate)
      .then(() => {
        return { message: "Users votes and searches has been reseted! 🎉" };
      })
      .catch((err: any) => {
        console.log("Error on reseting user vote and searches!", err);
        return { message: "Error on reseting user vote and searches!" };
      });

    return response;
  }
);
