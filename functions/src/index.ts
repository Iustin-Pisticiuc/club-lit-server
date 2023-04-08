import admin from "firebase-admin";

import { getYoutubeSongs } from "./routes/youtube";
import {
  addSongToQueue,
  getVotedSongs,
  incrementSongAndUserVotes,
  deleteVotedSong,
} from "./routes/songs";
import {
  addUser,
  resetTodayUserSearchedTimes,
  resetTodayUserVotedTimes,
  getUserById,
  getAllUsers,
  resetUserTimes,
} from "./routes/users";

admin.initializeApp();

// youtube function
exports.getYoutubeSongs = getYoutubeSongs;

// songs functions
exports.addSongToQueue = addSongToQueue;
exports.getVotedSongs = getVotedSongs;
exports.incrementSongAndUserVotes = incrementSongAndUserVotes;
exports.deleteVotedSong = deleteVotedSong;

// users functions
exports.addUser = addUser;
exports.resetTodayUserSearchedTimes = resetTodayUserSearchedTimes;
exports.resetTodayUserVotedTimes = resetTodayUserVotedTimes;
exports.getUserById = getUserById;
exports.getAllUsers = getAllUsers;
exports.resetUserTimes = resetUserTimes;
