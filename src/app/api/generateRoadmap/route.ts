// src/app/api/generateRoadmap/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Schema validation
const TopicSchema = z.object({
  topic: z.string().min(1)
});

export const runtime = 'edge';

function generatePrompt(topic: string) {
  return `You are an expert in educational curriculum design. Your task is to create a structured and highly effective learning roadmap for mastering ${topic}. 

The roadmap should be divided into three well-defined phases: Fundamentals, Intermediate, and Advanced. Each phase must focus on progressively deepening the learner's understanding. Ensure that the topics are comprehensive, logically ordered, and practical for real-world application.

Structure your response exactly as follows:

Phase 1: Fundamentals
- Key foundational concept 1
- Key foundational concept 2
- Key foundational concept 3
- Additional essential topic if necessary

Phase 2: Intermediate
- Intermediate-level concept 1
- Intermediate-level concept 2
- Intermediate-level concept 3
- Additional important topic if necessary

Phase 3: Advanced
- Advanced concept 1
- Advanced concept 2
- Advanced concept 3
- Cutting-edge or specialized topic if applicable

Ensure that each topic is specific, relevant, and actionable for someone learning ${topic}. Exclude any introductory explanations or unnecessary text. The response must be concise, structured, and easy to follow.`;
}

function parseResponse(text: string) {
  const phases = text.split('\n\n');
  const steps = [];

  for (const phase of phases) {
    const lines = phase.trim().split('\n');
    if (lines.length === 0) continue;

    const phaseTitle = lines[0].split(':')[0].trim();
    const topics = lines
      .slice(1)
      .filter(line => line.startsWith('-'))
      .map(line => line.replace('-', '').trim());

    if (phaseTitle && topics.length > 0) {
      steps.push({
        phase: phaseTitle,
        topics
      });
    }
  }

  return steps;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const { topic } = TopicSchema.parse(body);

    // Generate prompt
    const prompt = generatePrompt(topic);

    // Get response from Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    if (!generatedText) {
      throw new Error('No response generated');
    }

    // Parse the response into structured format
    const steps = parseResponse(generatedText);

    // Create final roadmap
    const roadmap = {
      title: `Learning Roadmap for ${topic}`,
      steps: steps
    };

    return NextResponse.json(roadmap);
  } catch (error) {
    console.error('Error:', error);
    
    // Handle different types of errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors.map(e => e.message).join(', ') },
        { status: 400 }
      );
    }

    // Handle Gemini API errors
    if (error instanceof Error && error.message.includes('API')) {
      return NextResponse.json(
        { error: 'Failed to generate roadmap: API error' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate roadmap' },
      { status: 500 }
    );
  }
}