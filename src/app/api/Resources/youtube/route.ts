import { NextResponse } from "next/server";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface PlaylistData {
  query: string;
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

// Ensure env vars are present
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = process.env.YOUTUBE_API_URL || "https://www.googleapis.com/youtube/v3/search";

if (!YOUTUBE_API_KEY && process.env.NODE_ENV === "development") {
  console.warn("⚠️ Missing YOUTUBE_API_KEY environment variable.");
}

export async function GET(request: Request): Promise<NextResponse<ApiResponse | ApiError>> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Check DB first
    const existingPlaylists = await prisma.playlist.findMany({ where: { query } });
    if (existingPlaylists.length > 0) {
      return NextResponse.json({
        playlists: existingPlaylists,
        timestamp: new Date().toISOString(),
        query,
      });
    }

    // Check API key presence
    if (!YOUTUBE_API_KEY) {
      return NextResponse.json(
        { error: "Missing YouTube API Key on server" },
        { status: 500 }
      );
    }

    // Fetch from YouTube
    const response = await axios.get(YOUTUBE_API_URL, {
      params: {
        part: "snippet",
        q: query,
        type: "playlist",
        maxResults: 10,
        key: YOUTUBE_API_KEY,
      },
    });

    const playlists: PlaylistData[] = response.data.items.map((item: any) => ({
      query,
      title: item.snippet.title,
      link: `https://www.youtube.com/playlist?list=${item.id.playlistId}`,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "",
      channel: item.snippet.channelTitle,
    }));

    // Save to DB
    const savedPlaylists = await Promise.all(
      playlists.map((playlist) =>
        prisma.playlist.upsert({
          where: { link: playlist.link },
          update: {
            title: playlist.title,
            thumbnail: playlist.thumbnail,
            channel: playlist.channel,
            query: playlist.query,
          },
          create: {
            title: playlist.title,
            link: playlist.link,
            thumbnail: playlist.thumbnail,
            channel: playlist.channel,
            query: playlist.query,
          },
        })
      )
    );

    return NextResponse.json({
      playlists: savedPlaylists,
      timestamp: new Date().toISOString(),
      query,
    });

  } catch (error: any) {
    console.error("❌ YouTube API/Server error:", error.response?.data || error.message || error);

    return NextResponse.json(
      {
        error: "Failed to fetch YouTube playlists",
        details:
          process.env.NODE_ENV === "development"
            ? error.message
            : undefined,
      },
      { status: 500 }
    );
  }
}
