// import * as admin from "firebase-admin";
// admin.initializeApp();

import "./routes/youtube";
import { addMessage, getVideo } from "./routes/youtube";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
exports.getVideo = getVideo;
exports.addMessage = addMessage;
