"use client"
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface MentorBotProps {
  appContext?: string;
  currentChat?: string;
  userContext?: {
    userId: string;
    courseName?: string;
    currentLesson?: string;
    learningGoals?: string[];
  };
}

const MentorBot: React.FC<MentorBotProps> = ({ 
  appContext = "Learnify Learning Platform", 
  currentChat = "",
  userContext 
}) => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isInitialized) {
      initializeBot();
      setIsInitialized(true);
    }
  }, [isOpen, isInitialized]);

  const initializeBot = () => {
    const userName = user?.firstName || user?.username || 'there';
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: `Hey ${userName}! 👋 I'm Alex, your personal teaching assistant here on Learnify! 

I'm here to help you with:
• Explaining complex concepts in simple terms
• Providing study tips and learning strategies  
• Answering questions about your coursework
• Giving personalized feedback on your progress
• Helping you stay motivated and on track

Whether you're stuck on a problem, need clarification on a topic, or just want some study guidance, I'm here to support your learning journey. What can I help you with today?`,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/Features/Mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          conversationHistory: messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.content
          })),
          appContext,
          currentChat,
          userContext: {
            ...userContext,
            userId: user?.id || 'anonymous',
            userName: user?.firstName || user?.username || 'Student'
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Alex');
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error("Sorry, I'm having trouble connecting right now. Please try again!");
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment!",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleBot = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 w-80 h-96 border border-[#1A1F3C] rounded-lg shadow-2xl z-50 flex flex-col backdrop-blur-sm" style={{ backgroundColor: '#0A0F2C' }}>
          {/* Header */}
          <div className="text-white p-3 rounded-t-lg flex items-center justify-between" style={{ backgroundColor: '#1F3B8A' }}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0F4FF' }}>
                <Bot style={{ color: '#1F3B8A' }} className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm" style={{ color: '#F0F4FF' }}>Alex - Teaching Assistant</h3>
                <p className="text-xs" style={{ color: '#C0C0C0' }}>Online • Ready to help</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:opacity-80 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3" style={{ backgroundColor: '#121835' }}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-2 rounded-lg text-sm ${
                    message.isUser
                      ? 'rounded-br-none'
                      : 'border rounded-bl-none'
                  }`}
                  style={{
                    backgroundColor: message.isUser ? '#254EDB' : '#1A1F3C',
                    color: message.isUser ? '#FFFFFF' : '#FFFFFF',
                    borderColor: message.isUser ? 'transparent' : '#4F7DFB'
                  }}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs mt-1" style={{ color: '#A0A0A0' }}>
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="border rounded-lg rounded-bl-none p-2" style={{ backgroundColor: '#1A1F3C', borderColor: '#4F7DFB' }}>
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: '#78A3FB' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t rounded-b-lg" style={{ borderColor: '#1A1F3C', backgroundColor: '#121835' }}>
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Alex anything..."
                className="flex-1 p-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  backgroundColor: '#1A1F3C',
                  borderColor: '#4F7DFB',
                  color: '#FFFFFF',
                  // @ts-ignore
                  focusRingColor: '#78A3FB'
                }}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="text-white p-2 rounded-lg hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                style={{ backgroundColor: '#254EDB' }}
                onMouseEnter={(e) => {
                  if (!isLoading && inputMessage.trim()) {
                    e.currentTarget.style.backgroundColor = '#4F7DFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading && inputMessage.trim()) {
                    e.currentTarget.style.backgroundColor = '#254EDB';
                  }
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={toggleBot}
        className={`fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'hover:opacity-80' : 'hover:opacity-90'
        }`}
        style={{
          backgroundColor: isOpen ? '#1A1F3C' : '#254EDB',
          border: isOpen ? '1px solid #4F7DFB' : 'none'
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = '#4F7DFB';
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = '#254EDB';
          }
        }}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </>
  );
};

export default MentorBot;