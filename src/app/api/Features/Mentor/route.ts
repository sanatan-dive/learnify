// app/api/Features/Mentor/route.ts (App Router)

import { NextRequest, NextResponse } from 'next/server';

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface MentorBotRequest {
  message: string;
  conversationHistory: ConversationMessage[];
  appContext: string;
  currentChat: string;
  userContext?: {
    userId: string;
    courseName?: string;
    currentLesson?: string;
    learningGoals?: string[];
  };
}

// OpenRouter API configuration  
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY; // Add this to your .env.local
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Learnify';

class MentorBotService {
  private buildSystemPrompt(appContext: string, userContext?: any, currentChat?: string): string {
    return `You are Alex, a friendly and knowledgeable teaching assistant for the ${appContext} platform. Your personality is:

PERSONALITY TRAITS:
- Encouraging and supportive, always maintaining a positive attitude
- Patient and understanding, never making students feel bad for not knowing something  
- Enthusiastic about learning and helping others succeed
- Uses friendly, conversational language with appropriate emojis
- Provides clear, step-by-step explanations
- Asks follow-up questions to ensure understanding

YOUR ROLE:
- Help students understand complex concepts by breaking them down simply
- Provide study strategies and learning tips tailored to individual needs
- Answer questions about coursework and assignments
- Offer encouragement and motivation when students are struggling
- Give constructive feedback on student progress
- Suggest additional resources when helpful

CONTEXT AWARENESS:
${userContext ? `
- Student ID: ${userContext.userId}
- Current Course: ${userContext.courseName || 'Not specified'}
- Current Lesson: ${userContext.currentLesson || 'Not specified'}
- Learning Goals: ${userContext.learningGoals?.join(', ') || 'Not specified'}
` : ''}
${currentChat ? `
- Current conversation context: ${currentChat}
` : ''}

GUIDELINES:
- Keep responses conversational and helpful
- Use examples and analogies when explaining concepts
- Always be encouraging, even when correcting mistakes
- Ask if the student needs clarification or has follow-up questions
- Suggest practical next steps or exercises when appropriate
- If you don't know something, admit it honestly and suggest where they might find the answer

Remember: You're not just providing information, you're mentoring and supporting the student's learning journey!`;
  }

  private async callOpenRouter(
    systemPrompt: string, 
    conversationHistory: ConversationMessage[], 
    newMessage: string
  ): Promise<string> {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key is not configured');
    }

    try {
      // Build messages array for OpenAI format
      const messages = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: newMessage }
      ];

      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': SITE_URL,
          'X-Title': SITE_NAME,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-r1-0528-qwen3-8b:free', // Using GPT-4o-mini for cost efficiency
          messages: messages,
          temperature: 0.7,
          max_tokens: 500,
          top_p: 0.9,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      
      if (data.choices && data.choices[0]?.message?.content) {
        return data.choices[0].message.content.trim();
      } else {
        throw new Error('Unexpected response format from OpenRouter');
      }
    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      throw error;
    }
  }

  // This method is no longer needed with OpenRouter's chat completion format
  // but keeping it commented for reference
  /*
  private buildConversationPrompt(
    systemPrompt: string,
    conversationHistory: ConversationMessage[],
    newMessage: string
  ): string {
    let prompt = systemPrompt + '\n\nConversation:\n';
    
    // Add conversation history
    conversationHistory.forEach((msg) => {
      const role = msg.role === 'user' ? 'Student' : 'Alex';
      prompt += `${role}: ${msg.content}\n`;
    });
    
    // Add new message
    prompt += `Student: ${newMessage}\nAlex:`;
    
    return prompt;
  }
  */

  async generateResponse(request: MentorBotRequest): Promise<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(
        request.appContext,
        request.userContext,
        request.currentChat
      );

      const response = await this.callOpenRouter(
        systemPrompt,
        request.conversationHistory,
        request.message
      );
      
      // Clean up the response (less cleaning needed with OpenAI format)
      let cleanResponse = response.trim();

      // Fallback response if empty or too short
      if (!cleanResponse || cleanResponse.length < 10) {
        cleanResponse = "I understand you're asking about that! Could you provide a bit more detail so I can give you the most helpful response? I'm here to support your learning! 😊";
      }

      return cleanResponse;
    } catch (error) {
      console.error('Error generating mentor bot response:', error);
      
      // Fallback responses based on error type
      if (error instanceof Error && error.message.includes('key')) {
        return "I'm having some technical difficulties right now. Please check that the OpenRouter API is properly configured. In the meantime, feel free to ask me anything and I'll do my best to help! 🤖";
      }
      
      return "I'm experiencing some technical issues at the moment, but I'm still here to help! Could you try rephrasing your question? I want to make sure I give you the best support possible! 💪";
    }
  }
}

// App Router Handler - Named export for POST method
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const mentorBot = new MentorBotService();
    const response = await mentorBot.generateResponse(body as MentorBotRequest);
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        response: "I'm having some technical difficulties right now, but I'm still here to help! Please try again in a moment. 🤖"
      },
      { status: 500 }
    );
  }
}

// Optional: Add other HTTP methods if needed
export async function GET() {
  return NextResponse.json({ message: 'Mentor Bot API is running' });
}