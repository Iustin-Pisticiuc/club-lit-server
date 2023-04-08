import { HttpsError } from "firebase-functions/v1/https";
import { youtube_v3 as YoutubeV3 } from "googleapis";

export const buildYoutubeResponse = (
  youtubeApiResponse: YoutubeV3.Schema$SearchResult[]
) => {
  const youtubeResponse = youtubeApiResponse
    .filter((item) => item.id?.kind !== "youtube#channel")
    .map((item: YoutubeV3.Schema$SearchResult) => {
      const { snippet } = item;

      if (!snippet) {
        throw new HttpsError("not-found", "Not found");
      }

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
        id: item.id?.videoId,
        title: decodedTitle,
        thumbnails: snippet.thumbnails?.high,
        channelTitle: snippet.channelTitle,
        publishedAt: formatedPublishedAt,
      };
    });

  return youtubeResponse;
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

export const checkSuperAdmin = (user: any) => {
  if (user && user.role === "super-admin") {
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
