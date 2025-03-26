import { NextResponse } from "next/server";
import axios from "axios";
import { PrismaClient, Courseracourse } from "@prisma/client";

const prisma = new PrismaClient();
const API_KEY = process.env.COURSERA_API_KEY || "";
const API_URL = process.env.COURSERA_API_URL || "https://api.coursera.org/api/courses.v1";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim() || "free";

    // Check if courses with the given query already exist in the database
    const existingCourses = await prisma.courseracourse.findMany({
      where: { query },
    });

    if (existingCourses.length > 0) {
      return NextResponse.json({
        courses: existingCourses,
        timestamp: new Date().toISOString(),
        query,
      });
    }

    // Fetch data from the Coursera API if not found in the database
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

    // Map response data into our Prisma model structure
    const courses: Omit<Courseracourse, "id" | "createdAt" | "updatedAt">[] =
      response.data.elements.map((course: any) => ({
        query, // Associate the query with the course
        name: course.name,
        description: course.description || "No description available",
        workload: course.workload || "Not available",
        thumbnail: course.photoUrl || "No thumbnail available",
        registrationLink: `https://www.coursera.org/learn/${course.slug}`,
      }));

    // Save courses to the database using upsert
    const savedCourses = await Promise.all(
      courses.map(async (course) =>
        prisma.courseracourse.upsert({
          where: { registrationLink: course.registrationLink },
          update: {
            name: course.name,
            description: course.description,
            workload: course.workload,
            thumbnail: course.thumbnail,
          },
          create: {
            query: course.query, // Save the search query with the course
            name: course.name,
            description: course.description,
            workload: course.workload,
            thumbnail: course.thumbnail,
            registrationLink: course.registrationLink,
          },
        })
      )
    );

    return NextResponse.json({
      courses: savedCourses,
      timestamp: new Date().toISOString(),
      query,
    });
  } catch (error) {
    console.error("Coursera API error:", error);

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