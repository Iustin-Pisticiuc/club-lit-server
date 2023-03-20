import { voteSong, getVotedSongs, incrementVotes } from "./routes/songs";
import { getYoutubeSongs } from "./routes/youtube";

exports.getYoutubeSongs = getYoutubeSongs;
exports.voteSong = voteSong;
exports.getVotedSongs = getVotedSongs;
exports.incrementVotes = incrementVotes;
