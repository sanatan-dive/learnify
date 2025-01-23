import { NextResponse } from "next/server";
import axios from "axios";
import Error from "next/error";

const API_KEY = process.env.COURSERA_API_KEY || "";
const API_URL = process.env.COURSERA_API_URL || "https://api.coursera.org/api/courses.v1";

export async function GET(request: Request) {
  try {
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "free"; 

    const response = await axios.get(API_URL, {
      params: {
        q: "search",
        query: `${query} free`, 
        includes: "instructorIds,partnerIds",
        limit: 10, 
        fields: "name,description,workload,instructorIds,partnerIds,photoUrl,slug",
      },
      headers: {
        Authorization: `Bearer ${API_KEY}`,
      },
    });

    const courses = response.data.elements.map((course: any) => {
      return {
        name: course.name,
        description: course.description,
        workload: course.workload || "Not available",
        thumbnail: course.photoUrl || "No thumbnail available",
        registrationLink: `https://www.coursera.org/learn/${course.slug}`,
      };
    });

    return NextResponse.json({ courses });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data || error.message },
        { status: 500 }
      );
    } else {
      return NextResponse.json(
        { error: "An unexpected error occurred" },
        { status: 500 }
      );
    }
  }
}