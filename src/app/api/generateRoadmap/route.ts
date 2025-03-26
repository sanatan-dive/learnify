// src/app/api/generateRoadmap/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Schema validation
const TopicSchema = z.object({
  topic: z.string().min(1)
});

export const runtime = 'edge';

function generatePrompt(topic: string) {
  return `You are an expert in educational curriculum design. Your task is to create a structured, professional, and highly effective learning roadmap for mastering ${topic}. The roadmap should align with the latest industry trends and best practices.

The roadmap should be divided into three well-defined phases: Fundamentals, Intermediate, and Advanced. Each phase must focus on progressively deepening the learner's understanding. Ensure that the topics are comprehensive, logically ordered, and practical for real-world application.

Structure your response exactly as follows:

Phase 1: Fundamentals
- Key foundational concept 1
  - Brief description 
- Key foundational concept 2
  - Brief description 
- Key foundational concept 3
  - Brief description
- Additional essential topic if necessary
  - Brief description 

Phase 2: Intermediate
- Intermediate-level concept 1
  - Brief description 
- Intermediate-level concept 2
  - Brief description 
- Intermediate-level concept 3
  - Brief description 
- Additional important topic if necessary
  - Brief description 

Phase 3: Advanced
- Advanced concept 1
  - Brief description 
- Advanced concept 2
  - Brief description 
- Advanced concept 3
  - Brief description 
- Cutting-edge or specialized topic if applicable
  - Brief description 

Ensure that each topic is specific, relevant, and actionable for someone learning ${topic}. Exclude any introductory explanations, unnecessary text, or formatting like quotes or markdown. The response must be concise, structured, and easy to follow.`;
}

function parseResponse(text: string) {
  const phases = text.split('\n\n');
  const steps = [];

  for (const phase of phases) {
    const lines = phase.trim().split('\n');
    if (lines.length === 0) continue;

    const phaseTitle = lines[0].split(':')[0].trim();
    const topics = [];
    let currentTopic = '';

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('-')) {
        if (currentTopic) {
          topics.push(currentTopic);
        }
        currentTopic = line.replace('-', '').trim();
      } else if (line.startsWith('  -')) {
        const description = line.replace('  -', '').trim();
        if (currentTopic) {
          topics.push(`${currentTopic}: ${description}`);
          currentTopic = '';
        }
      }
    }

    if (currentTopic) {
      topics.push(currentTopic);
    }

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

    // Clean the response text
    const cleanedText = generatedText
      .replace(/"/g, '') // Remove quotes
      .replace(/```/g, '') // Remove markdown code blocks
      .trim();

    // Parse the response into structured format
    const steps = parseResponse(cleanedText);

    // Create final roadmap
    const roadmap = {
      title: `Learning Roadmap for ${topic}`,
      steps: steps
    };

    // console.log('Generated roadmap:', roadmap);

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