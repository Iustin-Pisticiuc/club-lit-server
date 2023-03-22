import { DocumentData } from "firebase-admin/firestore";

export type YoutubeFirebaseResponseType = {
  id: string;
  publishedAt: string;
  votedTimes: number;
  title: string;
  thumbnails: {
    url: string;
    width: number;
    height: number;
  };
  channelTitle: string;
};

export type UserFirestoreType = DocumentData &
  undefined & {
    name: string;
    email?: string;
    todayVotedTimes: number;
    todaySongsSearched: number;
    allTimeVoted: number;
    role: "user" | "admin" | "superAdmin";
    numberOfVotesPerDay: number;
    numberOfSearchesPerDay: number;
  };
