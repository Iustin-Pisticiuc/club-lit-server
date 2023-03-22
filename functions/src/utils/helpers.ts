import { HttpsError } from "firebase-functions/v1/https";
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
          id: item.id,
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

export const isTokenValid = (expirationDate: number) => {
  if (Date.now() >= expirationDate * 1000) {
    return false;
  }
  return true;
};

export const isUsageSearchExceeded = (user: any) => {
  if (user.leftSearches <= 0) {
    throw new HttpsError(
      "permission-denied",
      "The number of searches for today have been reached."
    );
  }
};

export const isUsageVotesExceeded = (user: any) => {
  if (user.leftVotes <= 0) {
    throw new HttpsError(
      "permission-denied",
      "The number votes for today have been reached."
    );
  }
};
