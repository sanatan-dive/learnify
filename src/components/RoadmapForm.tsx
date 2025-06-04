"use client"
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, Target, BookOpen, CheckCircle, Circle, Edit3, Save, X, MessageCircle, Lightbulb, TrendingUp, Download } from "lucide-react";
import html2canvas from 'html2canvas';

interface WeeklyGoal {
  week: number;
  title: string;
  topics: string[];
  resources: string[];
  completed: boolean;
  progress: number;
}

interface Roadmap {
  title: string;
  goalDescription: string;
  totalWeeks: number;
  weeks: WeeklyGoal[];
  currentWeek: number;
  aiFeedback?: AIFeedback[];
}

interface GoalSettings {
  topic: string;
  targetRole: string;
  timeframe: number; // in weeks
  experience: string;
  focus: string[];
}

interface AIFeedback {
  type: 'suggestion' | 'adjustment' | 'encouragement';
  message: string;
  actionable: boolean;
}

export default function EnhancedRoadmapGenerator() {
  const [step, setStep] = useState<'setup' | 'roadmap'>('setup');
  const [goalSettings, setGoalSettings] = useState<GoalSettings>({
    topic: '',
    targetRole: '',
    timeframe: 12,
    experience: 'beginner',
    focus: []
  });
  
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<AIFeedback[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  
  const roadmapRef = useRef<HTMLDivElement>(null);

  // Real API call to generate roadmap
  const generateRoadmap = async (settings: GoalSettings) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/Features/generateRoadmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: settings.topic,
          targetRole: settings.targetRole,
          timeframe: settings.timeframe,
          experience: settings.experience,
          focus: settings.focus
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const roadmapData = await response.json();
      
      setRoadmap(roadmapData);
      setStep('roadmap');
      
      // Set AI feedback if available
      if (roadmapData.aiFeedback) {
        setFeedback(roadmapData.aiFeedback);
      }
      
    } catch (err) {
      console.error('Error generating roadmap:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate roadmap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadRoadmap = async () => {
    if (!roadmapRef.current) return;
    
    setDownloading(true);
    
    try {
      // Temporarily hide the download button and edit buttons for cleaner screenshot
      const downloadBtn = document.querySelector('[data-download-btn]') as HTMLElement;
      const editButtons = document.querySelectorAll('[data-edit-btn]') as NodeListOf<HTMLElement>;
      const backButton = document.querySelector('[data-back-btn]') as HTMLElement;
      const feedbackButton = document.querySelector('[data-feedback-btn]') as HTMLElement;
      
      if (downloadBtn) downloadBtn.style.display = 'none';
      if (backButton) backButton.style.display = 'none';
      if (feedbackButton) feedbackButton.style.display = 'none';
      editButtons.forEach(btn => btn.style.display = 'none');
      
      // Configure html2canvas options for better quality
      const canvas = await html2canvas(roadmapRef.current, {
        //@ts-ignore
        backgroundColor: '#0f172a', // slate-900 background
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        width: roadmapRef.current.scrollWidth,
        height: roadmapRef.current.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });
      
      // Create download link
      const link = document.createElement('a');
      link.download = `${roadmap?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'learning_roadmap'}_roadmap.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      // Restore hidden elements
      if (downloadBtn) downloadBtn.style.display = '';
      if (backButton) backButton.style.display = '';
      if (feedbackButton) feedbackButton.style.display = '';
      editButtons.forEach(btn => btn.style.display = '');
      
    } catch (error) {
      console.error('Error downloading roadmap:', error);
      alert('Failed to download roadmap. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const updateWeekProgress = (weekIndex: number, progress: number) => {
    if (!roadmap) return;
    
    const updatedWeeks = roadmap.weeks.map((week, index) => 
      index === weekIndex 
        ? { ...week, progress, completed: progress === 100 }
        : week
    );
    
    setRoadmap({ ...roadmap, weeks: updatedWeeks });
  };

  const editWeekContent = (weekIndex: number, field: 'topics' | 'resources', newContent: string[]) => {
    if (!roadmap) return;
    
    const updatedWeeks = roadmap.weeks.map((week, index) => 
      index === weekIndex 
        ? { ...week, [field]: newContent }
        : week
    );
    
    setRoadmap({ ...roadmap, weeks: updatedWeeks });
  };

  const saveWeekChanges = (weekIndex: number) => {
    const topicsTextarea = document.querySelector(`#topics-${weekIndex}`) as HTMLTextAreaElement;
    const resourcesTextarea = document.querySelector(`#resources-${weekIndex}`) as HTMLTextAreaElement;
    
    if (topicsTextarea && resourcesTextarea) {
      const newTopics = topicsTextarea.value.split('\n').filter(topic => topic.trim() !== '');
      const newResources = resourcesTextarea.value.split('\n').filter(resource => resource.trim() !== '');
      
      editWeekContent(weekIndex, 'topics', newTopics);
      editWeekContent(weekIndex, 'resources', newResources);
    }
    
    setEditingWeek(null);
  };

  if (step === 'setup') {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }}
        className="min-h-screen  text-white p-6"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4 font-serif ">
              Roadmap Generator
            </h1>
            <p className="text-lg text-slate-300">Define your learning goals and get a personalized, structured roadmap</p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl"
          >
            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-200">
                <p className="font-medium">Error generating roadmap:</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            <div className="space-y-8">
              <div>
                <label className="block text-sm font-medium mb-3 text-slate-300">What do you want to learn?</label>
                <input
                  type="text"
                  value={goalSettings.topic}
                  onChange={(e) => setGoalSettings(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="e.g., React, Python, Machine Learning"
                  className="w-full p-4 bg-slate-700 rounded-lg border border-slate-600 focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-slate-300">What's your target role?</label>
                <input
                  type="text"
                  value={goalSettings.targetRole}
                  onChange={(e) => setGoalSettings(prev => ({ ...prev, targetRole: e.target.value }))}
                  placeholder="e.g., Frontend Developer, Data Scientist, Full-Stack Engineer"
                  className="w-full p-4 bg-slate-700 rounded-lg border border-slate-600 focus:ring-2 focus:ring-purple-400 focus:border-transparent text-white placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-3 text-slate-300">Learning Timeline</label>
                  <select
                    value={goalSettings.timeframe}
                    onChange={(e) => setGoalSettings(prev => ({ ...prev, timeframe: parseInt(e.target.value) }))}
                    className="w-full p-4 bg-slate-700 rounded-lg border border-slate-600 focus:ring-2 focus:ring-purple-400 text-white"
                  >
                    <option value={8}>8 weeks (Intensive)</option>
                    <option value={12}>12 weeks (Balanced)</option>
                    <option value={16}>16 weeks (Comprehensive)</option>
                    <option value={24}>24 weeks (In-depth)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-3 text-slate-300">Experience Level</label>
                  <select
                    value={goalSettings.experience}
                    onChange={(e) => setGoalSettings(prev => ({ ...prev, experience: e.target.value }))}
                    className="w-full p-4 bg-slate-700 rounded-lg border border-slate-600 focus:ring-2 focus:ring-purple-400 text-white"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-3 text-slate-300">Focus Areas (Select all that apply)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['Theory', 'Practical Projects', 'Industry Skills', 'Certifications', 'Portfolio Building', 'Interview Prep'].map((focus) => (
                    <label key={focus} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={goalSettings.focus.includes(focus)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setGoalSettings(prev => ({ ...prev, focus: [...prev.focus, focus] }));
                          } else {
                            setGoalSettings(prev => ({ ...prev, focus: prev.focus.filter(f => f !== focus) }));
                          }
                        }}
                        className="rounded border-slate-600 text-purple-400 focus:ring-purple-400 bg-slate-700"
                      />
                      <span className="text-sm text-slate-300">{focus}</span>
                    </label>
                  ))}
                </div>
              </div>

              <motion.button
                onClick={() => generateRoadmap(goalSettings)}
                disabled={loading || !goalSettings.topic || !goalSettings.targetRole}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 bg-gradient-to-r from-blue-400 to-blue-600 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Generating Your Roadmap...</span>
                  </div>
                ) : (
                  'Generate My Roadmap'
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="min-h-screen bg-slate-900 rounded-lg text-white p-6"
    >
      <div className="max-w-6xl mx-auto" ref={roadmapRef}>
        {/* Header */}
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <button
              data-back-btn
              onClick={() => setStep('setup')}
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
            >
              <span>← Back to Setup</span>
            </button>
            
            {feedback.length > 0 && (
              <button
                data-feedback-btn
                onClick={() => setShowFeedback(!showFeedback)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>AI Feedback ({feedback.length})</span>
              </button>
            )}
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            {roadmap?.title}
          </h1>
          <p className="text-slate-300 text-lg mt-2">{roadmap?.goalDescription}</p>
          
          <div className="flex items-center space-x-6 mt-4 text-sm text-slate-400">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{roadmap?.totalWeeks} weeks total</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Week {roadmap?.currentWeek} of {roadmap?.totalWeeks}</span>
            </div>
          </div>
        </motion.div>

        {/* AI Feedback Panel */}
        <AnimatePresence>
          {showFeedback && feedback.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 bg-slate-800/50 backdrop-blur-sm rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <span>AI Insights & Suggestions</span>
              </h3>
              
              <div className="space-y-3">
                {feedback.map((item, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    item.type === 'suggestion' ? 'bg-blue-900/30 border-blue-400' :
                    item.type === 'adjustment' ? 'bg-orange-900/30 border-orange-400' :
                    'bg-green-900/30 border-green-400'
                  }`}>
                    <p className="text-slate-200">{item.message}</p>
                    {item.actionable && (
                      <button className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                        Apply Suggestion →
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weekly Roadmap */}
        <div className="grid gap-6">
          {roadmap?.weeks.map((week, index) => (
            <motion.div
              key={week.week}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border ${
                week.week === roadmap.currentWeek ? 'border-purple-400 shadow-lg shadow-purple-400/20' : 'border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold ${
                    week.completed ? 'bg-green-500 text-white' : 
                    week.week === roadmap.currentWeek ? 'bg-purple-500 text-white' : 
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {week.completed ? <CheckCircle className="w-6 h-6" /> : week.week}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">{week.title}</h3>
                    <div className="flex items-center space-x-2 text-sm text-slate-400">
                      <Clock className="w-4 h-4" />
                      <span>Week {week.week}</span>
                      <span>•</span>
                      <span>{week.progress}% Complete</span>
                    </div>
                  </div>
                </div>
                
                <button
                  data-edit-btn
                  onClick={() => setEditingWeek(editingWeek === index ? null : index)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  {editingWeek === index ? <X className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-400">Progress</span>
                  <span className="text-sm text-slate-400">{week.progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${week.progress}%` }}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                  />
                </div>
                <div className="flex space-x-2 mt-2">
                  {[0, 25, 50, 75, 100].map((progress) => (
                    <button
                      key={progress}
                      onClick={() => updateWeekProgress(index, progress)}
                      className={`px-3 py-1 text-xs rounded ${
                        week.progress === progress ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      }`}
                    >
                      {progress}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Topics */}
                <div>
                  <h4 className="font-medium text-slate-200 mb-3 flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Learning Topics</span>
                  </h4>
                  <div className="space-y-2">
                    {week.topics.map((topic, topicIndex) => (
                      <div key={topicIndex} className="flex items-center space-x-2 text-slate-300">
                        <Circle className="w-3 h-3 text-purple-400 flex-shrink-0" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                <div>
                  <h4 className="font-medium text-slate-200 mb-3 flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4" />
                    <span>Resources</span>
                  </h4>
                  <div className="space-y-2">
                    {week.resources.map((resource, resourceIndex) => (
                      <div key={resourceIndex} className="flex items-center space-x-2 text-slate-300">
                        <Circle className="w-3 h-3 text-blue-400 flex-shrink-0" />
                        <span>{resource}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Edit Mode */}
              <AnimatePresence>
                {editingWeek === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-slate-700"
                  >
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Edit Topics</label>
                        <textarea
                          id={`topics-${index}`}
                          defaultValue={week.topics.join('\n')}
                          className="w-full p-3 bg-slate-700 rounded border border-slate-600 focus:ring-2 focus:ring-purple-400 text-slate-200"
                          rows={4}
                          placeholder="One topic per line"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-slate-300">Edit Resources</label>
                        <textarea
                          id={`resources-${index}`}
                          defaultValue={week.resources.join('\n')}
                          className="w-full p-3 bg-slate-700 rounded border border-slate-600 focus:ring-2 focus:ring-purple-400 text-slate-200"
                          rows={4}
                          placeholder="One resource per line"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-3 mt-4">
                      <button
                        onClick={() => setEditingWeek(null)}
                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveWeekChanges(index)}
                        className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors flex items-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Download Button - Fixed at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed  top-6 right-6 z-50"
      >
        <button
          data-download-btn
          onClick={downloadRoadmap}
          disabled={downloading}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              <span>Download Roadmap</span>
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}