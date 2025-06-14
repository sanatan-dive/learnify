// src/app/api/generateGoalRoadmap/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { getAuth } from "@clerk/nextjs/server";

// Initialize Prisma
const prisma = new PrismaClient();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Enhanced schema validation for goal-based learning
const GoalRoadmapSchema = z.object({
  topic: z.string().min(1),
  targetRole: z.string().min(1),
  timeframe: z.number().min(4).max(52), // 4 weeks to 1 year
  experience: z.enum(['beginner', 'intermediate', 'advanced']),
  focus: z.array(z.string()).optional().default([])
});



// Function to check if user can create more roadmaps
async function checkRoadmapLimit(userId: string): Promise<{ canCreate: boolean; remainingCount?: number; message?: string }> {
  try {
    // Get user with their plan
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        plan: true,
        subscriptionStatus: true
      }
    });

    if (!user) {
      return { canCreate: false, message: 'User not found' };
    }

    // Premium users have unlimited access
    if (user.plan === 'PREMIUM' && user.subscriptionStatus === 'ACTIVE') {
      return { canCreate: true };
    }

    // For free users, check weekly limit
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Get Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const weeklyRoadmapCount = await prisma.roadmap.count({
      where: {
        userId: userId,
        createdAt: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      }
    });

    const FREE_WEEKLY_LIMIT = 3;
    const remainingCount = Math.max(0, FREE_WEEKLY_LIMIT - weeklyRoadmapCount);

    if (weeklyRoadmapCount >= FREE_WEEKLY_LIMIT) {
      return { 
        canCreate: false, 
        remainingCount: 0,
        message: `Free users can create up to ${FREE_WEEKLY_LIMIT} roadmaps per week. You've reached your limit. Upgrade to Premium for unlimited roadmaps.`
      };
    }

    return { 
      canCreate: true, 
      remainingCount 
    };

  } catch (error) {
    console.error('Error checking roadmap limit:', error);
    return { canCreate: false, message: 'Error checking roadmap limits' };
  }
}

function generateGoalBasedPrompt(settings: z.infer<typeof GoalRoadmapSchema>) {
  const { topic, targetRole, timeframe, experience, focus } = settings;
  
  return `You are an expert career coach and curriculum designer. Create a comprehensive, week-by-week learning roadmap to help someone become a ${targetRole} specializing in ${topic} within ${timeframe} weeks.

LEARNER PROFILE:
- Target Role: ${targetRole}
- Subject: ${topic}
- Experience Level: ${experience}
- Timeline: ${timeframe} weeks
- Focus Areas: ${focus.length > 0 ? focus.join(', ') : 'Balanced approach'}

REQUIREMENTS:
1. Create exactly ${timeframe} weekly learning phases
2. Each week should build progressively on previous weeks
3. Include both theoretical knowledge and practical application
4. Balance learning with hands-on projects
5. Consider industry-relevant skills and current trends
6. Provide specific, actionable learning objectives

STRUCTURE YOUR RESPONSE EXACTLY AS FOLLOWS:

Week 1: [Week Title]
Learning Topics:
- [Specific topic 1 with brief description]
- [Specific topic 2 with brief description]
- [Specific topic 3 with brief description]
Resources:
- [Resource type: Specific resource name or description]
- [Resource type: Specific resource name or description]
- [Resource type: Specific resource name or description]

Week 2: [Week Title]
Learning Topics:
- [Specific topic 1 with brief description]
- [Specific topic 2 with brief description]
- [Specific topic 3 with brief description]
Resources:
- [Resource type: Specific resource name or description]
- [Resource type: Specific resource name or description]
- [Resource type: Specific resource name or description]

[Continue for all ${timeframe} weeks...]

GUIDELINES:
- Make each week's title descriptive and motivating
- Ensure logical progression from fundamentals to advanced concepts
- Include hands-on projects every 2-3 weeks
- Add portfolio-building activities in later weeks
- Include interview preparation in final weeks
- Adapt complexity based on ${experience} level
- Focus heavily on ${focus.join(' and ') || 'practical skills'}
- Make resources specific and actionable (courses, books, projects, tools)
- Each week should have 3-4 learning topics and 3-4 resources

Do not include any introductory text, explanations, or formatting beyond the specified structure.`;
}

function parseGoalRoadmapResponse(text: string) {
  const weeks = [];
  const weekSections = text.split(/Week \d+:/);
  
  // Remove empty first element
  weekSections.shift();
  
  for (let i = 0; i < weekSections.length; i++) {
    const section = weekSections[i].trim();
    const lines = section.split('\n').map(line => line.trim()).filter(line => line);
    
    if (lines.length === 0) continue;
    
    const weekTitle = `Week ${i + 1}: ${lines[0]}`;
    let currentSection = '';
    const topics: string[] = [];
    const resources: string[] = [];
    
    for (let j = 1; j < lines.length; j++) {
      const line = lines[j];
      
      if (line === 'Learning Topics:') {
        currentSection = 'topics';
        continue;
      } else if (line === 'Resources:') {
        currentSection = 'resources';
        continue;
      }
      
      if (line.startsWith('-')) {
        const content = line.substring(1).trim();
        if (currentSection === 'topics' && content) {
          topics.push(content);
        } else if (currentSection === 'resources' && content) {
          resources.push(content);
        }
      }
    }
    
    if (topics.length > 0 || resources.length > 0) {
      weeks.push({
        week: i + 1,
        title: weekTitle,
        topics: topics,
        resources: resources,
        completed: false,
        progress: 0
      });
    }
  }
  
  return weeks;
}

function generateAIFeedback(roadmap: any, settings: z.infer<typeof GoalRoadmapSchema>) {
  const feedback = [];
  
  // Timeline feedback
  if (settings.timeframe < 8) {
    feedback.push({
      type: 'adjustment',
      message: `Your ${settings.timeframe}-week timeline is quite ambitious. Consider focusing on the most essential skills first.`,
      actionable: true
    });
  } else if (settings.timeframe > 20) {
    feedback.push({
      type: 'suggestion',
      message: `With ${settings.timeframe} weeks, you have excellent time for deep learning. Consider adding specialized advanced topics.`,
      actionable: true
    });
  }
  
  // Experience level feedback
  if (settings.experience === 'beginner') {
    feedback.push({
      type: 'encouragement',
      message: `Great choice starting your ${settings.targetRole} journey! The roadmap includes solid fundamentals.`,
      actionable: false
    });
  }
  
  // Focus areas feedback
  if (settings.focus.includes('Portfolio Building')) {
    feedback.push({
      type: 'suggestion',
      message: `Excellent focus on portfolio building! Consider documenting your learning journey publicly for better visibility.`,
      actionable: true
    });
  }
  
  if (settings.focus.includes('Interview Prep')) {
    feedback.push({
      type: 'suggestion',
      message: `Smart to include interview preparation. Practice coding challenges regularly throughout the program.`,
      actionable: true
    });
  }
  
  return feedback;
}

export async function POST(request: NextRequest) {
  try {
    // Get user authentication
    const { userId } = getAuth(request);
    
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check roadmap creation limit
    const limitCheck = await checkRoadmapLimit(userId);
    
    if (!limitCheck.canCreate) {
      return NextResponse.json(
        { 
          error: 'Roadmap limit reached, Please upgrade your plan',
          message: limitCheck.message,
          upgrade: true // Signal frontend to show upgrade option
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const settings = GoalRoadmapSchema.parse(body);

    // Generate prompt based on goal settings
    const prompt = generateGoalBasedPrompt(settings);

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
      .replace(/\*\*/g, '') // Remove bold markdown
      .trim();

    // Parse the response into structured weekly format
    const weeks = parseGoalRoadmapResponse(cleanedText);

    // Generate AI feedback and suggestions
    const aiFeedback = generateAIFeedback({ weeks }, settings);

    // Create final goal-based roadmap
    const roadmapData = {
      title: `${settings.targetRole} Learning Path`,
      goalDescription: `Become a ${settings.targetRole} specializing in ${settings.topic} within ${settings.timeframe} weeks`,
      totalWeeks: settings.timeframe,
      weeks: weeks,
      currentWeek: 1,
      settings: settings,
      aiFeedback: aiFeedback,
      createdAt: new Date().toISOString()
    };

    // Validate that we have the expected number of weeks
    if (weeks.length !== settings.timeframe) {
      console.warn(`Expected ${settings.timeframe} weeks, got ${weeks.length} weeks`);
      
      // Fill missing weeks if needed
      while (weeks.length < settings.timeframe) {
        const weekNum = weeks.length + 1;
        weeks.push({
          week: weekNum,
          title: `Week ${weekNum}: Advanced Studies`,
          topics: [
            'Advanced concepts review',
            'Specialized skills development',
            'Industry best practices'
          ],
          resources: [
            'Advanced tutorials and documentation',
            'Community forums and discussions',
            'Portfolio refinement'
          ],
          completed: false,
          progress: 0
        });
      }
    }

    // Save roadmap to database
    const savedRoadmap = await prisma.roadmap.create({
      data: {
        userId: userId,
        title: roadmapData.title,
        topic: settings.topic,
        targetRole: settings.targetRole,
        timeframe: settings.timeframe,
        experience: settings.experience,
        focus: settings.focus,
        roadmapData: roadmapData,
        currentWeek: 1
      }
    });

    // Add database ID to response
    const finalRoadmap = {
      ...roadmapData,
      id: savedRoadmap.id,
      remainingCreations: limitCheck.remainingCount ? limitCheck.remainingCount - 1 : undefined
    };

    return NextResponse.json(finalRoadmap);
    
  } catch (error) {
    console.error('Error generating goal-based roadmap:', error);
    
    // Handle different types of errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data', 
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    // Handle Gemini API errors
    if (error instanceof Error && error.message.includes('API')) {
      return NextResponse.json(
        { error: 'Failed to generate roadmap: AI service error' },
        { status: 500 }
      );
    }

    // Handle parsing errors
    if (error instanceof Error && error.message.includes('parse')) {
      return NextResponse.json(
        { error: 'Failed to process roadmap structure' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate goal-based roadmap' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve roadmap templates, examples, or user's roadmap stats
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  
  if (type === 'templates') {
    const templates = [
      {
        id: 'frontend-dev',
        title: 'Frontend Developer',
        description: 'React, JavaScript, CSS, and modern frontend tools',
        suggestedWeeks: 12,
        focus: ['Practical Projects', 'Portfolio Building']
      },
      {
        id: 'fullstack-dev',
        title: 'Full-Stack Developer',
        description: 'Frontend + Backend development with modern stack',
        suggestedWeeks: 16,
        focus: ['Practical Projects', 'Industry Skills', 'Portfolio Building']
      },
      {
        id: 'data-scientist',
        title: 'Data Scientist',
        description: 'Python, ML, statistics, and data analysis',
        suggestedWeeks: 20,
        focus: ['Theory', 'Practical Projects', 'Certifications']
      },
      {
        id: 'mobile-dev',
        title: 'Mobile Developer',
        description: 'React Native or Flutter for cross-platform apps',
        suggestedWeeks: 14,
        focus: ['Practical Projects', 'Portfolio Building', 'Industry Skills']
      }
    ];
    
    return NextResponse.json({ templates });
  }

  if (type === 'limits') {
    try {
     const { userId } = getAuth(request);
      
      if (!userId) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      const limitCheck = await checkRoadmapLimit(userId);
      
      // Get user plan for frontend display
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true, subscriptionStatus: true }
      });

      return NextResponse.json({
        canCreate: limitCheck.canCreate,
        remainingCount: limitCheck.remainingCount,
        message: limitCheck.message,
        plan: user?.plan,
        subscriptionStatus: user?.subscriptionStatus,
        weeklyLimit: user?.plan === 'FREE' ? 3 : null
      });

    } catch (error) {
      console.error('Error checking limits:', error);
      return NextResponse.json(
        { error: 'Failed to check roadmap limits' },
        { status: 500 }
      );
    }
  }
  
  return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
}