"use client"
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle, Target, Award, Brain, TrendingUp, BookOpen, Plus, ChevronRight, Clock, Trophy, Star, CrossIcon, ArrowLeftToLine } from 'lucide-react'
import { Prisma } from '@prisma/client';
import { useUser } from '@clerk/nextjs';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface QuizConfig {
  topic: string;
  level: string;
  numQuestions: number;
}

interface QuizRecord {
  id: string;
  topic: string;
  level: string;
  score: { correct: number; total: number };
  createdAt: string;
}

type QuizStep = 0 | 1 | 2 | 3 | 4;

// Mock API functions

export default function QuizPage() {
  const [step, setStep] = useState<QuizStep>(4);
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    topic: '',
    level: '',
    numQuestions: 5,
  });
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<boolean>(false);
  const [score, setScore] = useState<{ correct: number; total: number }>({ correct: 0, total: 0 });
  const [quizRecords, setQuizRecords] = useState<QuizRecord[]>([]);
  const [recordsLoading, setRecordsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const difficultyOptions = ['beginner', 'intermediate', 'advanced'];
  const { user } = useUser();
  const userId = user?.id

  useEffect(() => {
  if (!userId) {
    setIsAuthenticated(false);
    setRecordsLoading(false);
    return;
  }

  setIsAuthenticated(true);
  setRecordsLoading(true);

  const fetchQuizRecords = async () => {
    try {
      const response = await fetch(`/api/Features/Quiz/quiz-records?userId=${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        setQuizRecords(data.records || []);
      } else {
        setError(data.error || 'Failed to fetch quiz records');
      }
    } catch (err) {
      setError('An errore occurred while fetching quiz records');
    } finally {
      setRecordsLoading(false);
    }
  };

  fetchQuizRecords();
}, [userId]);


   const updateConfig = <K extends keyof QuizConfig>(key: K, value: QuizConfig[K]) => {
    setQuizConfig((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleGenerateQuiz = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/Features/Quiz/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quizConfig),
      });

      const data = await response.json();

      if (response.ok) {
        if (Array.isArray(data.quiz) && data.quiz.length > 0) {
          setQuiz(data.quiz);
          setStep(3);
        } else {
          throw new Error('Invalid quiz format received');
        }
      } else {
        throw new Error(data.error || 'Failed to generate quiz');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An unexpected error occurred while generating the quiz'
      );
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  
  

 const handleSelectAnswer = (questionIndex: number, option: string) => {
    if (submittedAnswers) return;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    let correctCount = 0;
    quiz.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });

    const newScore = {
      correct: correctCount,
      total: quiz.length,
    };

    setScore(newScore);
    setSubmittedAnswers(true);

    // Save the quiz record
    try {
      await fetch('/api/Features/Quiz/quiz-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: quizConfig.topic,
          level: quizConfig.level,
          score: newScore,
        }),
      });
      // Refresh records after saving
      const response = await fetch('/api/Features/Quiz/quiz-records', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        setQuizRecords(data.records || []);
      }
    } catch (err) {
      console.error('Error saving quiz record:', err);
    }
  };

  

  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setSubmittedAnswers(false);
    setScore({ correct: 0, total: 0 });
    setShowSuccess(false);
  };

  const handleNewQuiz = () => {
    setQuizConfig({ topic: '', level: '', numQuestions: 5 });
    setSelectedAnswers({});
    setSubmittedAnswers(false);
    setScore({ correct: 0, total: 0 });
    setQuiz([]);
    setError(null);
    setShowSuccess(false);
    setStep(0);
  };

  const renderUserAnalysis = () => (
    <Card className="bg-[#121835] border border-[#1F3B8A]/30 min-h-[374px] hover:border-[#4F7DFB]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#1F3B8A]/20 group">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-[#E0F2FF] group-hover:text-white transition-colors duration-300">
          <div className="p-2 bg-gradient-to-br from-[#1F3B8A] to-[#254EDB] rounded-lg group-hover:scale-110 transition-transform duration-300">
            <Brain className="w-5 h-5 text-white" />
          </div>
          User Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#A0A0A0]">Overall Performance</span>
            <span className="text-2xl font-bold text-[#E0F2FF] ">78%</span>
          </div>
          <div className="w-full bg-[#0A0F2C] rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#1F3B8A] via-[#4F7DFB] to-[#78A3FB] h-3 rounded-full transition-all duration-1000 ease-out " 
              style={{width: '78%'}}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-[#0A0F2C] rounded-lg hover:bg-[#1A1F3C] transition-colors duration-300 group/stat">
            <div className="text-3xl font-bold text-[#E0F2FF] group-hover/stat:scale-110 transition-transform duration-300">{quizRecords.length}</div>
            <div className="text-xs text-[#A0A0A0] mt-1">Quizzes Taken</div>
          </div>
          <div className="text-center p-4 bg-[#0A0F2C] rounded-lg hover:bg-[#1A1F3C] transition-colors duration-300 group/stat">
            <div className="text-3xl font-bold text-[#E0F2FF] group-hover/stat:scale-110 transition-transform duration-300">15</div>
            <div className="text-xs text-[#A0A0A0] mt-1">Topics Mastered</div>
          </div>
        </div>
      <div className='flex gap-4'>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#4F7DFB]" />
            <span className="text-sm text-[#A0A0A0]">Strong Areas</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['JavaScript', 'React', 'CSS'].map((skill, index) => (
              <span 
                key={skill}
                className="px-3 py-1 bg-gradient-to-r from-green-900/50 to-green-800/50 text-green-300 text-xs rounded-full border border-green-700/30 hover:border-green-500/50 transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[#4F7DFB]" />
            <span className="text-sm text-[#A0A0A0]">Focus Areas</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Algorithms', 'Backend'].map((skill, index) => (
              <span 
                key={skill}
                className="px-3 py-1 bg-gradient-to-r from-red-900/50 to-red-800/50 text-red-300 text-xs rounded-full border border-red-700/30 hover:border-red-500/50 transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderQuizAnalysis = () => (
    <Card className="bg-[#121835] border border-[#1F3B8A]/30 hover:border-[#4F7DFB]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#1F3B8A]/20 group">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-[#E0F2FF] group-hover:text-white transition-colors duration-300">
          <div className="p-2 bg-gradient-to-br from-[#1F3B8A] to-[#254EDB] rounded-lg group-hover:scale-110 transition-transform duration-300">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          Quiz Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Avg Score', value: '85%', icon: Trophy },
            { label: 'Difficulty', value: '3.2', icon: Target },
            { label: 'Avg Time', value: '12m', icon: Clock }
          ].map(({ label, value, icon: Icon }, index) => (
            <div 
              key={label}
              className="text-center p-3 bg-[#0A0F2C] rounded-lg hover:bg-[#1A1F3C] transition-all duration-300 group/metric hover:scale-105"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <Icon className="w-5 h-5 text-[#4F7DFB] mx-auto mb-2 group-hover/metric:text-[#78A3FB] transition-colors duration-300" />
              <div className="text-xl font-bold text-[#E0F2FF]">{value}</div>
              <div className="text-xs text-[#A0A0A0]">{label}</div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium text-[#E0F2FF] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#4F7DFB]" />
            Popular Topics
          </h4>
          <div className="space-y-3">
            {[
              { topic: 'JavaScript', percentage: 90 },
              { topic: 'React', percentage: 75 },
              { topic: 'Python', percentage: 60 },
              { topic: 'CSS', percentage: 45 }
            ].map(({ topic, percentage }, index) => (
              <div 
                key={topic} 
                className="flex justify-between items-center group/topic"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <span className="text-sm text-[#A0A0A0] group-hover/topic:text-[#C0C0C0] transition-colors duration-300">{topic}</span>
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-[#0A0F2C] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#1F3B8A] to-[#4F7DFB] h-2 rounded-full transition-all duration-1000 ease-out" 
                      style={{width: `${percentage}%`}}
                    ></div>
                  </div>
                  <span className="text-sm text-[#E0F2FF] w-10 text-right font-medium">{percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderQuizHistory = () => (
    <Card className="bg-[#121835] border border-[#1F3B8A]/30 hover:border-[#4F7DFB]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#1F3B8A]/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-[#E0F2FF]">
          <div className="p-2 bg-gradient-to-br from-[#1F3B8A] to-[#254EDB] rounded-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          Quiz History
          <span className="ml-auto text-sm text-[#A0A0A0] bg-[#0A0F2C] px-2 py-1 rounded-full">
            {quizRecords.length} completed
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-80 overflow-y-auto">
        {recordsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#4F7DFB]" />
          </div>
        ) : quizRecords.length === 0 ? (
          <div className="text-center py-8">
            <Trophy className="w-12 h-12 text-[#4F7DFB] mx-auto mb-4 opacity-50" />
            <p className="text-[#A0A0A0]">No quiz records found</p>
            <p className="text-sm text-[#A0A0A0] mt-2">Take your first quiz to get started!</p>
          </div>
        ) : (
          quizRecords.map((record, index) => (
            <div 
              key={record.id} 
              className="p-4 bg-[#0A0F2C] rounded-lg border border-[#1F3B8A]/20 hover:border-[#4F7DFB]/40 hover:bg-[#1A1F3C] transition-all duration-300 group hover:scale-[1.02] hover:shadow-lg"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-[#E0F2FF] text-sm group-hover:text-white transition-colors duration-300">{record.topic}</h4>
                <span className="text-xs text-[#A0A0A0] group-hover:text-[#C0C0C0] transition-colors duration-300">
                  {new Date(record.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs px-3 py-1 bg-[#1F3B8A]/30 text-[#4F7DFB] rounded-full border border-[#1F3B8A]/50 capitalize group-hover:bg-[#1F3B8A]/50 transition-colors duration-300">
                  {record.level}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-[#E0F2FF] font-medium">
                    {record.score.correct}/{record.score.total}
                  </span>
                  <div className="w-16 bg-[#0A0F2C] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#1F3B8A] to-[#4F7DFB] h-2 rounded-full transition-all duration-500" 
                      style={{width: `${(record.score.correct / record.score.total) * 100}%`}}
                    ></div>
                  </div>
                  <span className="text-xs text-[#4F7DFB] font-medium">
                    {Math.round((record.score.correct / record.score.total) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );

  const renderMainDashboard = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold   mb-4 font-serif">
          Quiz generator
        </h1>
        <p className="text-xl text-[#A0A0A0]">
          Create custom quizzes tailored to your learning needs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Actions */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br min-h-[398px] from-[#121835] to-[#0A0F2C] border-[#1F3B8A]/50 hover:border-[#4F7DFB] transition-all duration-500 hover:shadow-2xl hover:shadow-[#1F3B8A]/30 group overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#1F3B8A]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-[#E0F2FF] group-hover:text-white transition-colors duration-300">
                <div className="p-3 bg-gradient-to-br from-[#1F3B8A] to-[#254EDB] rounded-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <Target className="w-6 h-6 text-white" />
                </div>
                Start New Quiz
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative z-10">
              <p className="text-[#A0A0A0] group-hover:text-[#C0C0C0] transition-colors duration-300">
                Challenge yourself with a custom quiz on any topic you choose:
              </p>
              <ul className="space-y-3 p-2">
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#4F7DFB] group-hover:bg-[#1F3B8A] transition-colors duration-300"></div>
                  <p className="text-[#A0A0A0] group-hover:text-[#C0C0C0] transition-colors duration-300">
                    Choose a topic
                  </p>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#4F7DFB] group-hover:bg-[#1F3B8A] transition-colors duration-300"></div>
                  <p className="text-[#A0A0A0] group-hover:text-[#C0C0C0] transition-colors duration-300">
                    Set the level
                  </p>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#4F7DFB] group-hover:bg-[#1F3B8A] transition-colors duration-300"></div>
                  <p className="text-[#A0A0A0] group-hover:text-[#C0C0C0] transition-colors duration-300">
                    Set the number of questions
                  </p>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-[#4F7DFB] group-hover:bg-[#1F3B8A] transition-colors duration-300"></div>
                  <p className="text-[#A0A0A0] group-hover:text-[#C0C0C0] transition-colors duration-300">
                    Start the quiz
                  </p>
                </li>
              </ul>
              <Button
                onClick={handleNewQuiz}
                className="w-full bg-gradient-to-r from-[#1F3B8A] to-[#254EDB] hover:from-[#254EDB] hover:to-[#4F7DFB] text-white font-medium py-4 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#1F3B8A]/50 group/btn"
              >
                <Plus className="w-5 h-5 mr-2 group-hover/btn:rotate-90 transition-transform duration-300" />
                Create New Quiz
                <ChevronRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform duration-300" />
              </Button>
            </CardContent>
          </Card>

          {renderUserAnalysis()}
          
        </div>

        {/* Right Column - Quiz History */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {renderQuizHistory()}
          {renderQuizAnalysis()}
        </div>
        
      </div>
    </div>
  );

  const renderConfigStep = (stepNumber: QuizStep, title: string, description: string, children: React.ReactNode) => (
    <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md bg-[#121835] border-[#1F3B8A]/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <CardHeader className="text-center">
         
          <div className="w-16 h-16 bg-gradient-to-br from-[#1F3B8A] to-[#254EDB] rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-white">{stepNumber}</span>
          </div>
          <CardTitle className="text-2xl text-[#E0F2FF]">{title}</CardTitle>
          <p className="text-[#A0A0A0] mt-2">{description}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {children}
        </CardContent>
      </Card>
    </div>
  );

  const renderQuizDisplay = () => (
    <div className="space-y-8">
      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#121835] border-[#1F3B8A]/50 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-[#E0F2FF] mb-2">Quiz Completed!</h3>
            <p className="text-[#A0A0A0]">
              Score: <span className="text-[#4F7DFB] font-bold">{score.correct}/{score.total}</span>
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-[#E0F2FF] mb-2">
            {quizConfig.topic}
          </h2>
          <p className="text-[#A0A0A0] capitalize">
            {quizConfig.level} level • {quiz.length} questions
          </p>
        </div>
        {submittedAnswers && (
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#4F7DFB]">
                {Math.round((score.correct / score.total) * 100)}%
              </div>
              <div className="text-sm text-[#A0A0A0]">
                {score.correct}/{score.total} correct
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={handleRetakeQuiz} 
                className="bg-[#1F3B8A] hover:bg-[#254EDB] transition-all duration-300 hover:scale-105"
              >
                Retake Quiz
              </Button>
              <Button 
                onClick={() => setStep(4)} 
                className="bg-[#0A0F2C] hover:bg-[#1A1F3C] border border-[#1F3B8A]/50 hover:border-[#4F7DFB] transition-all duration-300"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {quiz.map((question, questionIndex) => {
          const isAnswered = selectedAnswers[questionIndex] !== undefined;
          
          return (
            <Card 
              key={questionIndex} 
              className={`bg-[#121835] border transition-all duration-500 hover:shadow-lg ${
                isAnswered && submittedAnswers 
                  ? selectedAnswers[questionIndex] === question.correctAnswer
                    ? 'border-green-500/50 shadow-green-500/20'
                    : 'border-red-500/50 shadow-red-500/20'
                  : 'border-[#1F3B8A]/30 hover:border-[#4F7DFB]/50'
              }`}
              style={{ animationDelay: `${questionIndex * 100}ms` }}
            >
              <CardHeader>
                <CardTitle className="text-lg text-[#E0F2FF] flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isAnswered && submittedAnswers
                      ? selectedAnswers[questionIndex] === question.correctAnswer
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-[#1F3B8A] text-white'
                  }`}>
                    {questionIndex + 1}
                  </div>
                  Question {questionIndex + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium mb-4 text-[#E0F2FF] text-lg leading-relaxed">
                  {question.question}
                </p>
                <div className="space-y-3">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = selectedAnswers[questionIndex] === option;
                    const isCorrect = submittedAnswers && option === question.correctAnswer;
                    const isIncorrect = submittedAnswers && isSelected && option !== question.correctAnswer;

                    return (
                      <div
                        key={optionIndex}
                        className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-300 border ${
                          isCorrect 
                            ? 'bg-green-900/30 border-green-500/50 shadow-green-500/20' 
                            : isIncorrect 
                            ? 'bg-red-900/30 border-red-500/50 shadow-red-500/20'
                            : isSelected && !submittedAnswers
                            ? 'bg-[#1F3B8A]/30 border-[#4F7DFB] shadow-[#4F7DFB]/20'
                            : 'bg-[#0A0F2C] border-[#1F3B8A]/20 hover:border-[#4F7DFB]/40 hover:bg-[#1A1F3C]'
                        } ${!submittedAnswers ? 'hover:scale-[1.02]' : ''}`}
                        onClick={() => handleSelectAnswer(questionIndex, option)}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold text-sm transition-all duration-300 ${
                            isCorrect
                              ? 'bg-green-500 text-white'
                              : isIncorrect
                              ? 'bg-red-500 text-white'
                              : isSelected && !submittedAnswers
                              ? 'bg-[#4F7DFB] text-white'
                              : 'bg-[#1F3B8A]/50 text-[#A0A0A0]'
                          }`}
                        >
                          {String.fromCharCode(65 + optionIndex)}
                        </div>
                        <p className="flex-1 text-[#E0F2FF]">{option}</p>
                        {submittedAnswers && (
                          <div className="ml-4">
                            {isCorrect ? (
                              <CheckCircle className="text-green-500 animate-bounce" size={24} />
                            ) : isIncorrect ? (
                              <XCircle className="text-red-500 animate-pulse" size={24} />
                            ) : null}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!submittedAnswers && (
        <div className="flex justify-center gap-4 pt-8">
          <Button
            className="px-8 py-4 bg-gradient-to-r from-[#1F3B8A] to-[#254EDB] hover:from-[#254EDB] hover:to-[#4F7DFB] text-white font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#1F3B8A]/50 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmitQuiz}
            disabled={Object.keys(selectedAnswers).length !== quiz.length}
          >
            <Trophy className="w-5 h-5 mr-2" />
            Submit Quiz
          </Button>
          <Button 
            onClick={() => setStep(4)} 
            className="px-8 py-4 bg-[#0A0F2C] hover:bg-[#1A1F3C] border border-[#1F3B8A]/50 hover:border-[#4F7DFB] text-[#E0F2FF] transition-all duration-300 hover:scale-105"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto px-6 py-8">
        {step === 4 && renderMainDashboard()}
        {step === 3 && renderQuizDisplay()}

        {step === 0 && renderConfigStep(
          1,
          "Choose Your Quiz Topic",
          "Enter a specific subject or broad topic area to test your knowledge.",
          <>
            <Input
              value={quizConfig.topic}
              onChange={(e) => updateConfig('topic', e.target.value)}
              placeholder="e.g., React Hooks, Climate Change, DevOps"
              className="bg-[#0A0F2C] text-[#E0F2FF] border-[#1F3B8A]/50 focus:border-[#4F7DFB] focus:ring-[#4F7DFB]/20 placeholder-[#A0A0A0] transition-all duration-300"
            />
            <Button
              onClick={() => setStep(1)}
              disabled={!quizConfig.topic.trim()}
              className="w-full bg-gradient-to-r from-[#1F3B8A] to-[#254EDB] hover:from-[#254EDB] hover:to-[#4F7DFB] disabled:opacity-50 transition-all duration-300 hover:scale-105"
            >
              Next Step
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </>
        )}

        {step === 1 && renderConfigStep(
          2,
          "Select Difficulty Level",
          "Choose a difficulty that matches your expertise.",
          <div className="grid grid-cols-1 gap-3">
            {difficultyOptions.map((option, index) => (
              <Button
                key={option}
                onClick={() => {
                  updateConfig('level', option);
                  setStep(2);
                }}
                className={`py-4 text-lg font-medium rounded-lg transition-all duration-300 hover:scale-105 ${
                  quizConfig.level === option
                    ? 'bg-gradient-to-r from-[#1F3B8A] to-[#254EDB] text-white'
                    : 'bg-[#0A0F2C] text-[#A0A0A0] hover:bg-[#1A1F3C] hover:text-[#E0F2FF] border border-[#1F3B8A]/20 hover:border-[#4F7DFB]/50'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </Button>
            ))}
          </div>
        )}

        {step === 2 && renderConfigStep(
          3,
          "Number of Questions",
          "Select how many questions you want in your quiz (1-20).",
          <>
            <Input
              type="number"
              value={quizConfig.numQuestions}
              onChange={(e) => updateConfig('numQuestions', Number(e.target.value))}
              placeholder="5-20 questions"
              min="1"
              max="20"
              className="bg-[#0A0F2C] text-[#E0F2FF] border-[#1F3B8A]/50 focus:border-[#4F7DFB] focus:ring-[#4F7DFB]/20 placeholder-[#A0A0A0] transition-all duration-300"
            />
            <Button
              onClick={handleGenerateQuiz}
              disabled={!quizConfig.numQuestions || loading}
              className="w-full bg-gradient-to-r from-[#1F3B8A] to-[#254EDB] hover:from-[#254EDB] hover:to-[#4F7DFB] disabled:opacity-50 transition-all duration-300 hover:scale-105"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Quiz...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-5 w-5" />
                  Generate Quiz
                </>
              )}
            </Button>
            {error && (
              <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}