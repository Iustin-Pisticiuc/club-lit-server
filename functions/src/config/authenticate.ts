import admin from "firebase-admin";

const { auth } = admin;

export const verifyIdToken = async (authorizationToken: string | undefined) => {
  if (!admin.apps.length) {
    admin.initializeApp();
  }

  console.log({ authorizationToken });

  try {
    if (authorizationToken) {
      const { 1: idToken } = authorizationToken.split("Bearer ");

      // verify the user id token
      const decodedToken = await auth().verifyIdToken(idToken);

      // set it on the request variable so we can use on the next routes
      return decodedToken;
    }
    return;
  } catch (error) {
    console.log(error);
    return { error };
  }
};
