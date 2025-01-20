// src/app/api/fetchall/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: Request) {
  // Extract the query from the request URL
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Define the API endpoints with absolute URLs
    const baseUrl = new URL(request.url).origin; // Get the base URL of the application
    const apiEndpoints = [
      { name: "medium", url: `${baseUrl}/api/medium?query=${query}` },
      { name: "coursera", url: `${baseUrl}/api/coursera?query=${query}` },
      { name: "udemy", url: `${baseUrl}/api/udemy?query=${query}` },
      { name: "youtube", url: `${baseUrl}/api/youtube?query=${query}` },
    ];

    // Use Promise.all to hit all APIs concurrently with axios.get
    const responses = await Promise.all(
      apiEndpoints.map(async (endpoint) => {
        const response = await axios.get(endpoint.url);
        if (response.status !== 200) {
          throw new Error(`Failed to fetch from ${endpoint.name}`);
        }
        return response.data;
      })
    );

    // Combine the responses into a single object
    const combinedResponse = {
      medium: responses[0],
      coursera: responses[1],
      udemy: responses[2],
      youtube: responses[3],
    };

    // Return the combined response
    return NextResponse.json(combinedResponse);
  } catch (error) {
    console.error("Error fetching data from APIs:", error);
    return NextResponse.json(
      { error: "Failed to fetch data from APIs" },
      { status: 500 }
    );
  }
}