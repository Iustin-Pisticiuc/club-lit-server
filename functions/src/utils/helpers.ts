import { youtube_v3 as YoutubeV3 } from "googleapis";

export const buildYoutubeResponse = (
  youtubeApiResponse: YoutubeV3.Schema$SearchResult[]
) => {
  const formattedResponse = youtubeApiResponse.map(
    (item: YoutubeV3.Schema$SearchResult) => {
      const { snippet } = item;

      if (snippet) {
        const decodedTitle = snippet.title
          ?.replace(/&quot;/g, "'")
          .replace(/&amp;/g, "&")
          .replace(/&apos;/g, "'")
          .replace(/&gt;/g, ">")
          .replace(/&lt;/g, "<")
          .replace(/&quot/g, "'");

        const formatedPublishedAt = snippet.publishedAt
          ?.replace("T", " ")
          .replace("Z", "");

        return {
          title: decodedTitle,
          thumbnails: snippet.thumbnails?.high,
          channelTitle: snippet.channelTitle,
          publishedAt: formatedPublishedAt,
        };
      }
      return {};
    }
  );

  return formattedResponse;
};
