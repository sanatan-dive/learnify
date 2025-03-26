// pages/api/generate-quiz.ts
import { NextRequest, NextResponse } from 'next/server';

interface QuizConfig {
  topic: string;
  level: string;
  numQuestions: number;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ResponseData {
  quiz: Question[];
}

export async function POST(request: NextRequest) {
  try {
    const { topic, level, numQuestions } = await request.json() as QuizConfig;

    if (!topic || !level || !numQuestions) {
      return NextResponse.json({ error: 'Missing quiz configuration' }, { status: 400 });
    }

    if (numQuestions < 1 || numQuestions > 20) {
      return NextResponse.json(
        { error: 'Number of questions must be between 1 and 20' },
        { status: 400 }
      );
    }

    const promptInstructions = `
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
  ]
}
`;

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
    try {
      const responseText = geminiData.candidates[0].content.parts[0].text;
      const jsonMatch = responseText.match(/(\{[\s\S]*\})/);
      if (jsonMatch && jsonMatch[1]) {
        const parsedData = JSON.parse(jsonMatch[1]);
        quiz = parsedData.quiz;
      } else {
        throw new Error("Could not parse JSON from Gemini response");
      }
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      quiz = getMockQuestions({ topic, level, numQuestions });
    }

    const responseData: ResponseData = {
      quiz,
    };

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