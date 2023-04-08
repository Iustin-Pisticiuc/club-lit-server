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

export type UsersFirebaseResponseType = {
  id: string;
  email: string;
  name: string;
  role: string;
  leftSearches: number;
  allTimeVoted: number;
  leftVotes: number;
};
