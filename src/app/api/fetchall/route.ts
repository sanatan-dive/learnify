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
// Set up the API endpoints
const apiEndpoints = [
 { name: "medium", url: `${baseUrl}/api/medium?query=${query}` },
 { name: "coursera", url: `${baseUrl}/api/coursera?query=${query}` },
 { name: "udemy", url: `${baseUrl}/api/udemy?query=${query}` },
 { name: "youtube", url: `${baseUrl}/api/youtube?query=${query}` },
 ];
// Make parallel requests to the APIs
const responses = await Promise.all(
 apiEndpoints.map((endpoint) => axios.get(endpoint.url).catch(() => null)) // Catch errors and prevent breaking
 );
// Parse the responses into a results object
const results = apiEndpoints.reduce((acc, endpoint, index) => {
 acc[endpoint.name] = responses[index]?.data || [];
return acc;
 }, {} as Record<string, any>);
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