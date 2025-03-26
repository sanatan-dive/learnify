// pages/api/quiz-records.ts
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuth, currentUser } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

interface QuizRecord {
  id: string;
  topic: string;
  level: string;
  score: { correct: number; total: number };
  createdAt: string;
}

interface QuizRecordRequest {
  topic: string;
  level: string;
  score: { correct: number; total: number };
}

interface QuizRecordsResponse {
  records: QuizRecord[];
}

interface ApiError {
  error: string;
  details?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse<QuizRecordsResponse | ApiError>> {
  try {
    // Get the authenticated user's ID from Clerk
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Check if the user exists in the database, create if not
    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
      }

      // Create a new user in the database
      dbUser = await prisma.user.create({
        data: {
          id: userId, // Use Clerk's user ID
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          imageUrl: clerkUser.imageUrl || '',
        },
      });
    }

    // Fetch quiz records for the user
    const records = await prisma.quizRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Map the records to match the expected frontend format
    const formattedRecords = records.map((record) => ({
      id: record.id,
      topic: record.topic,
      level: record.level,
      score: record.score as { correct: number; total: number },
      createdAt: record.createdAt.toISOString(),
    }));

    return NextResponse.json({ records: formattedRecords });
  } catch (error) {
    console.error('Error fetching quiz records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quiz records' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<QuizRecord | ApiError>> {
  try {
    // Get the authenticated user's ID from Clerk
    const { userId } = getAuth(request);
    if (!userId) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    }

    // Check if the user exists in the database, create if not
    let dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      const clerkUser = await currentUser();
      if (!clerkUser) {
        return NextResponse.json({ error: 'User not found in Clerk' }, { status: 404 });
      }

      // Create a new user in the database
      dbUser = await prisma.user.create({
        data: {
          id: userId, // Use Clerk's user ID
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          firstName: clerkUser.firstName || '',
          lastName: clerkUser.lastName || '',
          imageUrl: clerkUser.imageUrl || '',
        },
      });
    }

    const { topic, level, score } = await request.json() as QuizRecordRequest;

    if (!topic || !level || !score) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newRecord = await prisma.quizRecord.create({
      data: {
        userId,
        topic,
        level,
        score,
      },
    });

    const formattedRecord: QuizRecord = {
      id: newRecord.id,
      topic: newRecord.topic,
      level: newRecord.level,
      score: newRecord.score as { correct: number; total: number },
      createdAt: newRecord.createdAt.toISOString(),
    };

    return NextResponse.json(formattedRecord);
  } catch (error) {
    console.error('Error saving quiz record:', error);
    return NextResponse.json(
      { error: 'Failed to save quiz record' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}