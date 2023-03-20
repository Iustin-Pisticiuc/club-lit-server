import admin from "firebase-admin";

const { auth } = admin;

export const verifyIdToken = async (authorizationToken: string | undefined) => {
  if (!admin.apps.length) {
    admin.initializeApp();
  }

  try {
    if (authorizationToken) {
      const { 1: idToken } = authorizationToken.split("Bearer ");

      // verify the user id token
      const decodedToken = await auth().verifyIdToken(idToken);

      const { name, uid: userId, email } = decodedToken;

      // set it on the request variable so we can use on the next routes
      return { name, userId, email };
    }
    return;
  } catch (error) {
    console.log(error);
    return { error };
  }
};
