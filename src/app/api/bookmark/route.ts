import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const { bookmarkableId, bookmarkableType } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return NextResponse.json({ error: "User does not exist" }, { status: 404 });
    }

    if (!bookmarkableId || !bookmarkableType) {
      return NextResponse.json({ error: "Missing bookmarkableId or bookmarkableType" }, { status: 400 });
    }

    // Check if the bookmarkable ID exists for the provided type
    let bookmarkData: any = { userId, createdAt: new Date(), updatedAt: new Date() };
    let uniqueFieldKey = "";

    if (bookmarkableType === "Blog") {
      const blog = await prisma.blog.findUnique({
        where: { id: bookmarkableId },
      });
      if (!blog) {
        return NextResponse.json({ error: "No Blog found with the provided ID" }, { status: 404 });
      }
      bookmarkData.blogLink = blog.link;
      uniqueFieldKey = "blogLink";
    } else if (bookmarkableType === "Courseracourse") {
      const course = await prisma.courseracourse.findUnique({
        where: { id: bookmarkableId },
      });
      if (!course) {
        return NextResponse.json({ error: "No Coursera Course found with the provided ID" }, { status: 404 });
      }
      bookmarkData.courseraLink = course.registrationLink;
      uniqueFieldKey = "courseraLink";
    } else if (bookmarkableType === "Udemycourse") {
      const course = await prisma.udemycourse.findUnique({
        where: { id: bookmarkableId },
      });
      if (!course) {
        return NextResponse.json({ error: "No Udemy Course found with the provided ID" }, { status: 404 });
      }
      bookmarkData.udemyLink = course.registrationLink;
      uniqueFieldKey = "udemyLink";
    } else if (bookmarkableType === "Playlist") {
      const playlist = await prisma.playlist.findUnique({
        where: { id: bookmarkableId },
      });
      if (!playlist) {
        return NextResponse.json({ error: "No Playlist found with the provided ID" }, { status: 404 });
      }
      bookmarkData.playlistLink = playlist.link;
      uniqueFieldKey = "playlistLink";
    } else {
      return NextResponse.json({ error: "Invalid bookmarkableType" }, { status: 400 });
    }

    // Check if the bookmark already exists
    const whereClause: any = {};

if (uniqueFieldKey && bookmarkData[uniqueFieldKey]) {
  whereClause[uniqueFieldKey] = bookmarkData[uniqueFieldKey];
}

const existingBookmark = await prisma.bookmark.findUnique({
  where: whereClause,
});


    if (existingBookmark) {
      return NextResponse.json({ error: "Bookmark already exists" }, { status: 409 });
    }

    // Create the bookmark
    const bookmark = await prisma.bookmark.create({
      data: bookmarkData,
    });

    return NextResponse.json({ bookmark });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred:", error);
    }
    return NextResponse.json({ error: "Failed to save bookmark" }, { status: 500 });
  }
}
