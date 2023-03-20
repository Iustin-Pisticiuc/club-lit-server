import { getYoutubeSongs } from "./routes/youtube";
import {
  addSongToQueue,
  getVotedSongs,
  incrementSongVotes,
} from "./routes/songs";
import {
  addUser,
  incrementUserVotedTimes,
  resetTodayUserVotedTime,
  getUserById,
} from "./routes/users";

// youtube function
exports.getYoutubeSongs = getYoutubeSongs;

// songs functions
exports.addSongToQueue = addSongToQueue;
exports.getVotedSongs = getVotedSongs;
exports.incrementSongVotes = incrementSongVotes;

// users functions
exports.addUser = addUser;
exports.incrementUserVotedTimes = incrementUserVotedTimes;
exports.resetTodayUserVotedTime = resetTodayUserVotedTime;
exports.getUserById = getUserById;
