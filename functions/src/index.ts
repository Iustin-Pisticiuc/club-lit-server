import { addSongToQueue, getVotedSongs, incrementVotes } from "./routes/songs";
import { getYoutubeSongs } from "./routes/youtube";

exports.getYoutubeSongs = getYoutubeSongs;
exports.addSongToQueue = addSongToQueue;
exports.getVotedSongs = getVotedSongs;
exports.incrementVotes = incrementVotes;
