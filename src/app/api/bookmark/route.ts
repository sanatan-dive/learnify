import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";
import { NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    const { bookmarkableId, bookmarkableType, details } = await req.json();

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

    // Check if the bookmarkableId exists for the correct type
    let bookmarkableExists = false;
    if (bookmarkableType === "Blog") {
      const blog = await prisma.blog.findUnique({
        where: { id: bookmarkableId },
      });
    
      if (blog) {
        bookmarkableExists = true;
      }
    } else if (bookmarkableType === "Course") {
      const course = await prisma.course.findUnique({
        where: { id: bookmarkableId },
      });
      if (course) {
        bookmarkableExists = true;
      }
    } else if (bookmarkableType === "Playlist") {
      const playlist = await prisma.playlist.findUnique({
        where: { id: bookmarkableId },
      });
      if (playlist) {
        bookmarkableExists = true;
      }
    }

    if (!bookmarkableExists) {
      console.log(bookmarkableId)
      console.log(`No ${bookmarkableType} found with provided ID`);
      return NextResponse.json({ error: `No ${bookmarkableType} found with provided ID` }, { status: 404 });
    }

    let bookmarkData: any = {
      userId,
      bookmarkableId,
      bookmarkableType,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (bookmarkableType === "Blog") {
      const { title, link, author, description } = details.blog;
      bookmarkData = { 
        ...bookmarkData, 
        blogTitle: title,
        blogLink: link,
        blogAuthor: author,
        blogDescription: description,
      };
    } else if (bookmarkableType === "Course") {
      const { name, registrationLink, description, rating, thumbnail, workload } = details.course;
      bookmarkData = { 
        ...bookmarkData, 
        courseName: name,
        courseLink: registrationLink,
        courseDescription: description,
        courseRating: rating,
        courseThumbnail: thumbnail,
        courseWorkload: workload,
      };
    } else if (bookmarkableType === "Playlist") {
      const { title, link, thumbnail, channel } = details.playlist;
      bookmarkData = { 
        ...bookmarkData, 
        playlistTitle: title,
        playlistLink: link,
        playlistThumbnail: thumbnail,
        playlistChannel: channel,
      };
    } else {
      return NextResponse.json({ error: "Invalid bookmarkableType" }, { status: 400 });
    }

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
