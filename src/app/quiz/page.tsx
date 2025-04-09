// pages/quiz.tsx
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

// For simplicity, assume we have a function to get the current user's ID
// In a real app, you'd get this from a session, token, or auth context
const getCurrentUserId = () => {
  // Replace this with your actual authentication logic
  return "user-id-from-auth"; // Example user ID (or null if not authenticated)
};

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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const difficultyOptions = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    const userId = getCurrentUserId();
    setIsAuthenticated(!!userId);

    if (userId) {
      const fetchQuizRecords = async () => {
        setRecordsLoading(true);
        try {
          const response = await fetch('/api/Features/Quiz/quiz-records', {
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
          setError('An error occurred while fetching quiz records');
        } finally {
          setRecordsLoading(false);
        }
      };

      fetchQuizRecords();
    } else {
      setRecordsLoading(false);
    }
  }, []);

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
  };

  const renderRecordsStep = () => (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Your Quiz History</h2>
      {isAuthenticated === null || recordsLoading ? (
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : !isAuthenticated ? (
        <p className="text-center text-gray-400">
          Please log in to view your quiz history and take new quizzes.
        </p>
      ) : quizRecords.length === 0 ? (
        <p className="text-center text-gray-400">No quiz records found. Take a new quiz to get started!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizRecords.map((record) => (
            <Card key={record.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg text-white">{record.topic}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-200 mb-2">
                  Difficulty: {record.level.charAt(0).toUpperCase() + record.level.slice(1)}
                </p>
                <p className="text-gray-200 mb-2">
                  Score: <span className="text-green-500">{record.score.correct}</span>/{record.score.total}
                </p>
                <p className="text-gray-400 text-sm">
                  Taken on: {new Date(record.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {isAuthenticated && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => setStep(0)}
            className="px-8 py-2 bg-gradient-to-r from-blue-800 via-blue-500 to-blue-800 hover:bg-gradient-to-r hover:from-blue-900 hover:via-blue-600 hover:to-blue-900 text-white rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
          >
            Take a New Quiz
          </Button>
        </div>
      )}
    </div>
  );

  const renderTopicStep = () => (
    <Dialog open={step === 0} onOpenChange={() => setStep(0)}>
      <DialogContent className="bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Your Quiz Topic</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter a specific subject or broad topic area to test your knowledge.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={quizConfig.topic}
          onChange={(e) => updateConfig('topic', e.target.value)}
          placeholder="e.g., React Hooks, Climate Change, DevOps"
          className="mt-4 bg-gray-800 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
        />
        <Button
          onClick={() => setStep(1)}
          disabled={!quizConfig.topic.trim()}
          className="mt-4 bg-blue-600 hover:bg-blue-700"
        >
          Next
        </Button>
      </DialogContent>
    </Dialog>
  );

  const renderDifficultyStep = () => (
    <Dialog open={step === 1} onOpenChange={() => setStep(1)}>
      <DialogContent className="bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl">Select Difficulty Level</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a difficulty that matches your expertise.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-between mt-4 gap-4">
          {difficultyOptions.map((option) => (
            <Button
              key={option}
              onClick={() => {
                updateConfig('level', option);
                setStep(2);
              }}
              className={`flex-1 py-3 text-lg font-medium rounded-lg transition-all duration-200 ${
                quizConfig.level === option
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderQuestionCountStep = () => (
    <Dialog open={step === 2} onOpenChange={() => setStep(2)}>
      <DialogContent className="bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl">Number of Questions</DialogTitle>
          <DialogDescription className="text-gray-400">
            Select how many questions you want in your quiz (1-20).
          </DialogDescription>
        </DialogHeader>
        <Input
          type="number"
          value={quizConfig.numQuestions}
          onChange={(e) => updateConfig('numQuestions', Number(e.target.value))}
          placeholder="5-20 questions"
          min="1"
          max="20"
          className="mt-4 bg-gray-800 text-white border-gray-600 focus:ring-blue-500 focus:border-blue-500"
        />
        <Button
          onClick={handleGenerateQuiz}
          disabled={!quizConfig.numQuestions || loading}
          className="mt-4 bg-blue-600 hover:bg-blue-700 flex items-center"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Quiz'
          )}
        </Button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </DialogContent>
    </Dialog>
  );

  const renderQuizDisplay = () => (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          {quizConfig.topic} Quiz ({quizConfig.level.charAt(0).toUpperCase() + quizConfig.level.slice(1)})
        </h2>
        {submittedAnswers && (
          <div className="flex items-center gap-4">
            <div className="text-lg font-medium">
              Score: <span className="text-green-600">{score.correct}</span>/{score.total}
            </div>
            <Button onClick={handleRetakeQuiz} className="bg-blue-600 hover:bg-blue-700">
              Retake Quiz
            </Button>
            <Button onClick={() => setStep(4)} className="bg-gray-600 hover:bg-gray-700">
              Back to History
            </Button>
          </div>
        )}
      </div>

      {quiz.map((question, questionIndex) => (
        <Card key={questionIndex} className="mb-4 bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg text-white">Question {questionIndex + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium mb-3 text-gray-200">{question.question}</p>
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => {
                const isSelected = selectedAnswers[questionIndex] === option;
                const isCorrect = submittedAnswers && option === question.correctAnswer;
                const isIncorrect = submittedAnswers && isSelected && option !== question.correctAnswer;

                return (
                  <div
                    key={optionIndex}
                    className={`flex items-start p-2 rounded-md cursor-pointer transition-all duration-200 ${
                      isSelected ? 'bg-blue-700' : ''
                    } ${isCorrect ? 'bg-green-600' : ''} ${isIncorrect ? 'bg-red-700' : ''}`}
                    onClick={() => handleSelectAnswer(questionIndex, option)}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                        isSelected && !submittedAnswers
                          ? 'bg-blue-500 text-white'
                          : isCorrect
                          ? 'bg-green-500 text-white'
                          : isIncorrect
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {String.fromCharCode(65 + optionIndex)}
                    </div>
                    <p className="flex-1 text-gray-200">{option}</p>
                    {submittedAnswers && isCorrect && (
                      <CheckCircle className="text-green-500 ml-2" size={20} />
                    )}
                    {submittedAnswers && isIncorrect && (
                      <XCircle className="text-red-500 ml-2" size={20} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {!submittedAnswers && (
        <div className="flex justify-center mt-8 gap-4">
          <Button
            className="px-8 py-2 bg-blue-600 hover:bg-blue-700"
            onClick={handleSubmitQuiz}
            disabled={Object.keys(selectedAnswers).length !== quiz.length}
          >
            Submit Quiz
          </Button>
          <Button onClick={() => setStep(4)} className="px-8 py-2 bg-gray-600 hover:bg-gray-700">
            Cancel
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen  text-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-5xl font-bold text-center mb-4"> Quiz Generator</h1>
        <p className="text-xl text-center mb-8 text-gray-400">
          Create custom quizzes tailored to your learning needs
        </p>

        {step === 0 && renderTopicStep()}
        {step === 1 && renderDifficultyStep()}
        {step === 2 && renderQuestionCountStep()}
        {step === 3 && renderQuizDisplay()}
        {step === 4 && renderRecordsStep()}
      </div>
    </div>
  );
}