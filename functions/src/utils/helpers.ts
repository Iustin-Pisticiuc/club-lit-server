import { youtube_v3 } from "googleapis";

export const buildYoutubeResponse = (
  youtubeApiResponse: youtube_v3.Schema$SearchResult[]
) => {
  const formattedResponse = youtubeApiResponse.map(
    (item: youtube_v3.Schema$SearchResult) => {
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
