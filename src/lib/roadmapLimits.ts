// src/lib/roadmapLimits.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RoadmapLimitResult {
  canCreate: boolean;
  remainingCount?: number;
  message?: string;
  plan?: 'FREE' | 'PREMIUM';
  isWeeklyLimitReached?: boolean;
}

export const ROADMAP_LIMITS = {
  FREE_WEEKLY_LIMIT: 3,
  PREMIUM_UNLIMITED: true
} as const;

/**
 * Check if a user can create more roadmaps based on their plan and usage
 */
export async function checkUserRoadmapLimits(userId: string): Promise<RoadmapLimitResult> {
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
      return { 
        canCreate: false, 
        message: 'User not found' 
      };
    }

    // Premium users with active subscription have unlimited access
    if (user.plan === 'PREMIUM' && user.subscriptionStatus === 'ACTIVE') {
      return { 
        canCreate: true,
        plan: 'PREMIUM'
      };
    }

    // For free users, check weekly limit
    const { startOfWeek, endOfWeek } = getCurrentWeekBounds();

    const weeklyRoadmapCount = await prisma.roadmap.count({
      where: {
        userId: userId,
        createdAt: {
          gte: startOfWeek,
          lt: endOfWeek
        }
      }
    });

    const remainingCount = Math.max(0, ROADMAP_LIMITS.FREE_WEEKLY_LIMIT - weeklyRoadmapCount);
    const isWeeklyLimitReached = weeklyRoadmapCount >= ROADMAP_LIMITS.FREE_WEEKLY_LIMIT;

    if (isWeeklyLimitReached) {
      return { 
        canCreate: false, 
        remainingCount: 0,
        plan: 'FREE',
        isWeeklyLimitReached: true,
        message: `Free users can create up to ${ROADMAP_LIMITS.FREE_WEEKLY_LIMIT} roadmaps per week. You've reached your weekly limit. Upgrade to Premium for unlimited roadmaps.`
      };
    }

    return { 
      canCreate: true, 
      remainingCount,
      plan: 'FREE',
      isWeeklyLimitReached: false
    };

  } catch (error) {
    console.error('Error checking roadmap limits:', error);
    return { 
      canCreate: false, 
      message: 'Error checking roadmap limits. Please try again.' 
    };
  }
}

/**
 * Get user's roadmap usage statistics
 */
export async function getUserRoadmapStats(userId: string) {
  try {
    const { startOfWeek, endOfWeek } = getCurrentWeekBounds();
    
    const [weeklyCount, totalCount, user] = await Promise.all([
      prisma.roadmap.count({
        where: {
          userId: userId,
          createdAt: {
            gte: startOfWeek,
            lt: endOfWeek
          }
        }
      }),
      prisma.roadmap.count({
        where: { userId: userId }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { 
          plan: true,
          subscriptionStatus: true
        }
      })
    ]);

    const remainingThisWeek = user?.plan === 'FREE' 
      ? Math.max(0, ROADMAP_LIMITS.FREE_WEEKLY_LIMIT - weeklyCount)
      : null;

    return {
      weeklyCount,
      totalCount,
      remainingThisWeek,
      plan: user?.plan,
      subscriptionStatus: user?.subscriptionStatus,
      weeklyLimit: user?.plan === 'FREE' ? ROADMAP_LIMITS.FREE_WEEKLY_LIMIT : null
    };

  } catch (error) {
    console.error('Error getting roadmap stats:', error);
    throw new Error('Failed to get roadmap statistics');
  }
}

/**
 * Get the bounds of the current week (Sunday to Sunday)
 */// src/app/api/generateGoalRoadmap/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

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

export const runtime = 'edge';

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
    const roadmap = {
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


    return NextResponse.json(roadmap);
    
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

// GET endpoint to retrieve roadmap templates or examples
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
  
  return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
}
export function getCurrentWeekBounds() {
  const now = new Date();
  const startOfWeek = new Date(now);
  
  // Set to Sunday of current week
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  return { startOfWeek, endOfWeek };
}

/**
 * Check if user needs to upgrade to create more roadmaps
 */
export function shouldShowUpgradePrompt(limitResult: RoadmapLimitResult): boolean {
  return limitResult.plan === 'FREE' && 
         (limitResult.isWeeklyLimitReached || (limitResult.remainingCount ?? 0) <= 1);
}

/**
 * Get upgrade message based on current usage
 */
export function getUpgradeMessage(limitResult: RoadmapLimitResult): string | null {
  if (limitResult.plan === 'PREMIUM') return null;
  
  if (limitResult.isWeeklyLimitReached) {
    return "You've reached your weekly limit of 3 roadmaps. Upgrade to Premium for unlimited roadmap creation!";
  }
  
  if (limitResult.remainingCount === 1) {
    return "You have 1 roadmap creation left this week. Upgrade to Premium for unlimited access!";
  }
  
  if (limitResult.remainingCount === 0) {
    return "Upgrade to Premium to create unlimited roadmaps and unlock all features!";
  }
  
  return null;
}