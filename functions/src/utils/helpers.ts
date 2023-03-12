import { youtube_v3 as YoutubeV3 } from "googleapis";

export const buildYoutubeResponse = (
  youtubeApiResponse: YoutubeV3.Schema$SearchResult[]
) => {
  const formattedResponse = youtubeApiResponse.map(
    (item: YoutubeV3.Schema$SearchResult) => {
      const { snippet } = item;
      if (snippet) {
        return {
          title: snippet.title,
          thumbnails: snippet.thumbnails?.default,
          channelTitle: snippet.channelTitle,
          publishedAt: snippet.publishedAt,
        };
      }
      return {};
    }
  );

  return formattedResponse;
};
