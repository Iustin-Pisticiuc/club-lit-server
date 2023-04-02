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
