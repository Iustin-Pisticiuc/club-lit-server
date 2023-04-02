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

  return formattedResponse.filter((res) => res.id?.kind !== "youtube#channel");
};

export const isTokenValid = (expirationDate: number) => {
  if (Date.now() >= expirationDate * 1000) {
    return false;
  }
  return true;
};

export const isUsageSearchExceeded = (user: any) => {
  if (user.leftSearches <= 0) {
    return true;
  }
  return false;
};

export const isUsageVotesExceeded = (user: any) => {
  if (user.leftVotes <= 0) {
    return true;
  }
  return false;
};

export const checkAdminOrSuperAdmin = (user: any) => {
  if (user && user.role === "admin" && user.role === "super-admin") {
    return true;
  }
  return false;
};

export const checkAdmin = (user: any) => {
  if (user && user.role === "admin") {
    return true;
  }
  return false;
};
