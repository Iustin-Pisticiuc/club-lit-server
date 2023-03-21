import admin from "firebase-admin";

import { getYoutubeSongs } from "./routes/youtube";
import {
  addSongToQueue,
  getVotedSongs,
  incrementSongVotes,
} from "./routes/songs";
import {
  addUser,
  incrementUserVotedTimes,
  incrementUserSearchedTimes,
  resetTodayUserSearchedTimes,
  resetTodayUserVotedTime,
  getUserById,
} from "./routes/users";

admin.initializeApp();

// youtube function
exports.getYoutubeSongs = getYoutubeSongs;

// songs functions
exports.addSongToQueue = addSongToQueue;
exports.getVotedSongs = getVotedSongs;
exports.incrementSongVotes = incrementSongVotes;

// users functions
exports.addUser = addUser;
exports.incrementUserSearchedTimes = incrementUserSearchedTimes;
exports.incrementUserVotedTimes = incrementUserVotedTimes;
exports.resetTodayUserSearchedTimes = resetTodayUserSearchedTimes;
exports.resetTodayUserVotedTime = resetTodayUserVotedTime;
exports.getUserById = getUserById;
