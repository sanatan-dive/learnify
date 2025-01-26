import { NextResponse } from "next/server";
import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const baseUrl = new URL(request.url).origin;
    const apiEndpoints = [
      { name: "medium", url: `${baseUrl}/api/medium?query=${query}` },
      { name: "coursera", url: `${baseUrl}/api/coursera?query=${query}` },
      { name: "udemy", url: `${baseUrl}/api/udemy?query=${query}` },
      { name: "youtube", url: `${baseUrl}/api/youtube?query=${query}` },
    ];

    const responses = await Promise.all(
      apiEndpoints.map(async (endpoint) => {
        const response = await axios.get(endpoint.url);
        if (response.status !== 200) {
          throw new Error(`Failed to fetch from ${endpoint.name}`);
        }
        return { name: endpoint.name, data: response.data };
      })
    );

    const mediumBlogs = responses.find((res) => res.name === "medium")?.data || [];
    const courseraCourses = responses.find((res) => res.name === "coursera")?.data || [];
    const udemyCourses = responses.find((res) => res.name === "udemy")?.data || [];
    const youtubePlaylists = responses.find((res) => res.name === "youtube")?.data || [];

    const results = {
      medium: mediumBlogs,
      coursera: courseraCourses,
      udemy: udemyCourses,
      youtube: youtubePlaylists,
    };

    return NextResponse.json({
      query,
      results,
    });
  } catch (error) {
    console.error("Error fetching data from APIs:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from APIs" },
      { status: 500 }
    );
  }
}