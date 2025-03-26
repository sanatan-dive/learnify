"use client"

import { useState, useEffect, FormEvent, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from "html-to-image";

interface RoadmapStep {
  phase: string;
  topics: string[];
}

interface Roadmap {
  title: string;
  steps: RoadmapStep[];
}

export default function RoadmapForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTopic = searchParams.get("query") || "";

  const [topic, setTopic] = useState(initialTopic);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visiblePhases, setVisiblePhases] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const [lineHeight, setLineHeight] = useState(0);

  const fetchRoadmap = async (query: string) => {
    if (!query) return;
    setLoading(true);
    setError(null);
    setVisiblePhases(0);

    try {
      const response = await fetch("/api/generateRoadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: query }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate roadmap");
      }

      const data: Roadmap = await response.json();
      setRoadmap(data);

      for (let i = 0; i < data.steps.length + 1; i++) {
        setTimeout(() => {
          setVisiblePhases((prev) => prev + 1);
        }, (i + 1) * 800);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (listRef.current) {
      setLineHeight(listRef.current.offsetHeight);
    }
  }, [roadmap]);

  useEffect(() => {
    if (initialTopic) {
      fetchRoadmap(initialTopic);
    }
  }, [initialTopic]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic) return;
    router.push(`?query=${encodeURIComponent(topic)}`);
    fetchRoadmap(topic);
  };

  const handleDownload = async () => {
    const roadmapElement = document.getElementById("roadmap");
    if (roadmapElement) {
      try {
        const dataUrl = await toPng(roadmapElement);
        const link = document.createElement("a");
        link.download = "roadmap.png";
        link.href = dataUrl;
        link.click();
      } catch (error) {
        console.error("Error downloading roadmap:", error);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center min-h-screen w-full overflow-y-auto  text-slate-100 p-6"
    >
      <motion.div 
        className="w-full max-w-4xl"
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-violet-100 to-purple-400 bg-clip-text text-transparent">
          Learning Roadmap Generator
        </h1>

        <form 
          onSubmit={handleSubmit} 
          className="relative space-y-4 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="relative"
          >
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g., machine learning, web development)"
              required
              className="w-full p-4 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-slate-100 placeholder-slate-400"
            />
          </motion.div>
          
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate Roadmap"}
          </motion.button>
        </form>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-900/50 border border-red-700 rounded-lg mb-8"
          >
            <p className="text-red-200 text-center">{error}</p>
          </motion.div>
        )}

        {roadmap && (
          <div
            className="overflow-y-auto max-h-screen scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800/50"
            style={{
              scrollbarWidth: 'thin', // For Firefox
            }}
          >
            <motion.div
              id="roadmap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-lg shadow-xl p-8"
            >
              <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {roadmap.title}
              </h2>
              
              <div className="space-y-6">
                <AnimatePresence>
                  {roadmap.steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={visiblePhases > index ? { opacity: 1, x: 0 } : {}}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5, delay: index * 0.2 }}
                      className="relative"
                    >
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="flex items-center mb-4"
                      >
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                          {index + 1}
                        </div>
                        <h3 className="ml-4 text-xl font-semibold text-slate-100">{step.phase}</h3>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={visiblePhases > index ? { opacity: 1 } : {}}
                        transition={{ duration: 0.5, delay: index * 0.3 + 0.2 }}
                        className="ml-14 p-6 bg-slate-700/50 rounded-lg shadow-lg hover:shadow-xl transition-all"
                      >
                        <ul ref={index === 0 ? listRef : null} className="space-y-3">
                          {step.topics.map((topic, topicIndex) => (
                            <motion.li
                              key={topicIndex}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: (index * 0.2) + (topicIndex * 0.1) }}
                              className="text-slate-300 flex items-center"
                            >
                              <div className="w-2 h-2 bg-purple-400 rounded-full mr-3" />
                              {topic}
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>

                      {index < roadmap.steps.length  && visiblePhases > index && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: lineHeight }}
                          transition={{ duration: 0.5, delay: index * 0.3 + 0.5 }}
                          className="absolute left-5 top-16 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <motion.div 
                className="mt-12 flex justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <motion.button
                  onClick={handleDownload}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Download Roadmap
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}