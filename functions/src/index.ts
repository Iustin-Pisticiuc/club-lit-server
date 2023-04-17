import admin from "firebase-admin";

import { getYoutubeSongs } from "./routes/youtube";
import {
  addSongToQueue,
  getVotedSongs,
  incrementSongAndUserVotes,
  deleteVotedSong,
  updateSongPlayedAt,
} from "./routes/songs";
import {
  addUser,
  getUserById,
  getAllUsers,
  resetSingleUserTimes,
  resetAllUsersTimes,
} from "./routes/users";
import {
  startNewSession,
  endCurrentSession,
  getCurrentSession,
  sessionStatus,
} from "./routes/session";

admin.initializeApp();

// session functions
exports.endCurrentSession = endCurrentSession;
exports.startNewSession = startNewSession;
exports.getCurrentSession = getCurrentSession;
exports.sessionStatus = sessionStatus;

// youtube function
exports.getYoutubeSongs = getYoutubeSongs;

// songs functions
exports.addSongToQueue = addSongToQueue;
exports.getVotedSongs = getVotedSongs;
exports.incrementSongAndUserVotes = incrementSongAndUserVotes;
exports.deleteVotedSong = deleteVotedSong;
exports.updateSongPlayedAt = updateSongPlayedAt;

// users functions
exports.addUser = addUser;
exports.resetSingleUserTimes = resetSingleUserTimes;
exports.getUserById = getUserById;
exports.getAllUsers = getAllUsers;
exports.resetAllUsersTimes = resetAllUsersTimes;
