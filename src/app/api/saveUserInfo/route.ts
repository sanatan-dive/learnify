// src/app/api/saveUserInfo/route.ts

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, fullName, imageUrl, userId } = await req.json();

    if (!email || !fullName || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if the user already exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User already exists" }, { status: 200 });
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email: email,
        firstName: fullName.split(" ")[0], // Assuming fullName is like "John Doe"
        lastName: fullName.split(" ")[1] || "",
        imageUrl: imageUrl || "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "User saved successfully", user: newUser });
  } catch (error) {
    console.error("Error saving user info:", error);
    return NextResponse.json({ error: "Failed to save user info" }, { status: 500 });
  }
}
