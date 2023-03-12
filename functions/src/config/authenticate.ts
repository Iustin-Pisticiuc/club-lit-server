import admin from "firebase-admin";

const { auth } = admin;

module.exports = () => async (req: any, res: any, next: any) => {
  // initialize the firebase application
  admin.initializeApp();

  try {
    // retrieve the authorization header
    const { authorization } = req.headers;
    // eslint-disable-next-line no-unsafe-optional-chaining
    const { 1: idToken } = authorization.split("Bearer ");

    // verify the user id token
    const decodedToken = await auth().verifyIdToken(idToken);

    // set it on the request variable so we can use on the next routes
    req.locals = { user: decodedToken };

    return next();
  } catch (error) {
    console.log(error);

    return res.sendStatus(401);
  }
};
