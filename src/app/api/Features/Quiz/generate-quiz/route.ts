// pages/api/generate-quiz.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from "@clerk/nextjs/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface QuizConfig {
  topic: string;
  level: string;
  numQuestions: number;
  includeAnalysis?: boolean; // New optional field for requesting analysis
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ResponseData {
  quiz: Question[];
  analysis?: string; // Optional analysis field for premium users
  quizzesRemaining?: number; // For free users
  limitReached?: boolean; // Flag for when limit is reached
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = getAuth(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Get user details from database
    const user = await prisma.user.findUnique({
      where: { id: userId }, // Assuming the Clerk userId is stored in the prisma User.id field
      select: {
        id: true,
        plan: true,
        subscriptionStatus: true,
        quizRecords: {
          select: { id: true },
          orderBy: { createdAt: 'desc' },
          take: 100, // Looking at recent history to count quizzes
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is premium
    const isPremium = user.plan === 'PREMIUM' && 
                     (user.subscriptionStatus === 'ACTIVE' || 
                      user.subscriptionStatus === 'AUTHENTICATED');
    
    // Count quizzes for free users (within the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentQuizCount = await prisma.quizRecord.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });
    
    // Parse request body
    const { topic, level, numQuestions, includeAnalysis = false } = await request.json() as QuizConfig;
    
    // Validate required fields
    if (!topic || !level || !numQuestions) {
      return NextResponse.json({ error: 'Missing quiz configuration' }, { status: 400 });
    }
    
    if (numQuestions < 1 || numQuestions > 20) {
      return NextResponse.json(
        { error: 'Number of questions must be between 1 and 20' },
        { status: 400 }
      );
    }

    // Check quota for free users
    const FREE_QUIZ_LIMIT = 5;
    if (!isPremium && recentQuizCount >= FREE_QUIZ_LIMIT) {
      return NextResponse.json({
        error: 'Quiz generation limit reached',
        message: 'Free users can only generate 5 quizzes per month. Upgrade to premium for unlimited quizzes.',
        limitReached: true
      }, { status: 403 });
    }

    // Block analysis requests for free users
    if (includeAnalysis && !isPremium) {
      return NextResponse.json({
        error: 'Feature not available',
        message: 'Quiz analysis is only available for premium users.',
        requiresPremium: true
      }, { status: 403 });
    }

    // Build prompt instructions
    let promptInstructions = `
    Generate a quiz on the topic "${topic}" for ${level} level with exactly ${numQuestions} questions.
    Each question should:
    1. Be relevant to the topic and appropriate for the specified difficulty level
    2. Have 4 multiple-choice options with only one correct answer
    3. Test practical knowledge rather than theoretical definitions
    4. Be challenging but fair for the specified level
    Return the response as a JSON object with the following structure:
    {
      "quiz": [
        {
          "question": "Question text here?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": "The correct option from the options array"
        }
      ]`;
    
    // Add analysis instructions for premium users
    if (isPremium && includeAnalysis) {
      promptInstructions += `,
      "analysis": "A detailed analysis of the quiz content, including key learning areas covered, skills tested, and suggestions for further study on ${topic} at ${level} level."`;
    }
    
    promptInstructions += `\n}\n`;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      throw new Error("Missing Gemini API key");
    }

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptInstructions }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      throw new Error(`Gemini API error: ${JSON.stringify(errorData)}`);
    }

    const geminiData = await geminiResponse.json();
    let quiz: Question[];
    let analysis: string | undefined;

    try {
      const responseText = geminiData.candidates[0].content.parts[0].text;
      const jsonMatch = responseText.match(/(\{[\s\S]*\})/);
      
      if (jsonMatch && jsonMatch[1]) {
        const parsedData = JSON.parse(jsonMatch[1]);
        quiz = parsedData.quiz;
        
        // Get analysis if user is premium and requested it
        if (isPremium && includeAnalysis && parsedData.analysis) {
          analysis = parsedData.analysis;
        }
      } else {
        throw new Error("Could not parse JSON from Gemini response");
      }
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      quiz = getMockQuestions({ topic, level, numQuestions });
      
      // Mock analysis for premium users
      if (isPremium && includeAnalysis) {
        analysis = `This is a mock analysis for the ${topic} quiz at ${level} level.`;
      }
    }

    // Save quiz record to track usage
    await prisma.quizRecord.create({
      data: {
        userId: user.id,
        topic,
        level,
        score: { correct: 0, total: numQuestions }, // Initial score
      },
    });

    // Prepare response based on user plan
    const responseData: ResponseData = {
      quiz,
    };
    
    // Add analysis for premium users
    if (isPremium && includeAnalysis && analysis) {
      responseData.analysis = analysis;
    }
    
    // Add remaining quota info for free users
    if (!isPremium) {
      const quizzesRemaining = Math.max(0, FREE_QUIZ_LIMIT - (recentQuizCount + 1));
      responseData.quizzesRemaining = quizzesRemaining;
      responseData.limitReached = quizzesRemaining === 0;
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to generate quiz questions' }, { status: 500 });
  }
}

function getMockQuestions(config: QuizConfig): Question[] {
  const { topic, level, numQuestions } = config;
  const questions: Question[] = [];
  
  for (let i = 0; i < numQuestions; i++) {
    questions.push({
      question: `What is a key concept in ${topic} for ${level} learners?`,
      options: [
        `Concept A`,
        `Concept B`,
        `Concept C`,
        `Concept D`,
      ],
      correctAnswer: `Concept A`,
    });
  }
  
  return questions;
}

