import {
  onCall as firebaseCall,
  HttpsError,
  CallableContext,
} from "firebase-functions/v1/https";

import { checkAdminOrSuperAdmin, isTokenValid } from "../utils/helpers";
import {
  getDocumentQuerySnapshotData,
  getDocumentReference,
  getDocumentSnapshotData,
} from "../utils/firebase-helpers";
import moment from "moment";

export const getCurrentSession = firebaseCall(
  async (_, context: CallableContext) => {
    if (
      !context.auth ||
      !context.auth.uid ||
      !isTokenValid(context.auth.token.exp)
    ) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }

    const currentSession = await getDocumentSnapshotData("session", "session1");

    return currentSession;
  }
);

export const sessionStatus = firebaseCall(
  async (_, context: CallableContext) => {
    if (
      !context.auth ||
      !context.auth.uid ||
      !isTokenValid(context.auth.token.exp)
    ) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }

    const currentSession: any = await getDocumentSnapshotData(
      "session",
      "session1"
    );

    if (currentSession && currentSession.isOpen) {
      return { message: "Session open" };
    }
    return { message: "Session closed" };
  }
);

export const startNewSession = firebaseCall(
  async (_, context: CallableContext) => {
    if (
      !context.auth ||
      !context.auth.uid ||
      !isTokenValid(context.auth.token.exp)
    ) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }

    const userData = await getDocumentSnapshotData("users", context.auth.uid);

    if (userData && checkAdminOrSuperAdmin(userData)) {
      throw new HttpsError("failed-precondition", "Permision denied");
    }

    const users = await getDocumentQuerySnapshotData("users");

    users.forEach((doc) => {
      doc.ref
        .update({
          leftVotes: 5,
          leftSearches: 2,
        })
        .then(() => {
          return { message: "User vote and searches has been reseted! 🎉" };
        })
        .catch((err: any) => {
          console.log("Error on reseting user vote and searches!", err);
          return { message: "Error on reseting user vote and searches!" };
        });
    });

    const session = getDocumentReference("session", "session1");

    const response = await session
      .set({
        isOpen: true,
        startedAt: moment().format(),
        sessionStartedBy: context.auth.uid,
        sessionEndedBy: "",
      })
      .then(() => {
        return { message: "New session started 🎉" };
      })
      .catch((err) => {
        console.log(err);
        return { message: "Error on starting a new session" };
      });

    return response;
  }
);

export const endCurrentSession = firebaseCall(
  async (_, context: CallableContext) => {
    if (
      !context.auth ||
      !context.auth.uid ||
      !isTokenValid(context.auth.token.exp)
    ) {
      throw new HttpsError("failed-precondition", "Please authenticate");
    }

    const userData = await getDocumentSnapshotData("users", context.auth.uid);

    if (userData && checkAdminOrSuperAdmin(userData)) {
      throw new HttpsError("failed-precondition", "Permision denied");
    }

    const session = getDocumentReference("session", "session1");

    const votesData = await getDocumentQuerySnapshotData("voted-songs");

    votesData.forEach((doc) => {
      const { playedAt } = doc.data();

      if (!playedAt) {
        doc.ref
          .update({
            playedAt: moment().format(),
          })
          .then(() => {
            return { message: "Current session ended" };
          })
          .catch((err) => {
            console.log(err);
            return { message: "Error on ending current session" };
          });
      }
    });

    const response = session
      .set({
        isOpen: false,
        endedAt: moment().format(),
        sessionEndedBy: context.auth.uid,
        sessionStartedBy: "",
      })
      .then(() => {
        return { message: "Current session closed" };
      })
      .catch((err) => {
        console.log(err);
        return { message: "Error on starting a new session" };
      });

    return response;
  }
);
