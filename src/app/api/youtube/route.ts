import { NextResponse } from "next/server";
import axios from "axios";

// Types for better type safety
interface PlaylistData {
  title: string;
  link: string;
  thumbnail: string;
  channel: string;
}

interface ApiResponse {
  playlists: PlaylistData[];
  timestamp: string;
  query: string;
}

interface ApiError {
  error: string;
  details?: string;
}

// YouTube Data API configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || "";
const YOUTUBE_API_URL = process.env.YOUTUBE_API_URL || "https://www.googleapis.com/youtube/v3/search";

export async function GET(request: Request): Promise<NextResponse<ApiResponse | ApiError>> {
  try {
    // Input validation
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Call YouTube Data API
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: "snippet",
        q: query,
        type: "playlist", // Filter results to only playlists
        maxResults: 10, // Limit the number of results
        key: YOUTUBE_API_KEY,
      },
    });

    // Extract playlist data from API response
    const playlists: PlaylistData[] = response.data.items.map((item: any) => ({
      title: item.snippet.title,
      link: `https://www.youtube.com/playlist?list=${item.id.playlistId}`,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
      channel: item.snippet.channelTitle,
    }));

    return NextResponse.json({
      playlists,
      timestamp: new Date().toISOString(),
      query,
    });
  } catch (error) {
    console.error("YouTube API error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch YouTube playlists",
        details:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}