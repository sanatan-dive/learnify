"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
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

  const [topic, setTopic] = useState<string>(initialTopic);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [visiblePhases, setVisiblePhases] = useState<number>(0);

  const fetchRoadmap = async (query: string) => {
    if (!query) return;
    setLoading(true);
    setError(null);
    setVisiblePhases(0); // Reset animation state

    try {
      const response = await fetch("/api/generateRoadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: query }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate roadmap");
      }

      const data = await response.json();
      setRoadmap(data);

      // Reveal phases one by one in sequence
      for (let i = 0; i < data.steps.length; i++) {
        setTimeout(() => {
          setVisiblePhases((prev) => prev + 1);
        }, (i + 1) * 1000);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

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
    <div className="flex flex-col items-center overflow-scroll z-50 p-6 bg-gradient-to-r from-[#181818] to-[#1f1f1f] rounded-lg shadow-lg">
      <h1 className="text-2xl font-semibold text-center mb-4">Learning Roadmap Generator</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={topic}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setTopic(e.target.value)}
          placeholder="Enter a topic (e.g., machine learning, web development)"
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none text-black focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-md shadow-md hover:opacity-80 transition disabled:opacity-50"
        >
          {loading ? "Generating..." : "Generate Roadmap"}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-center">{error}</p>
        </div>
      )}

      {roadmap && (
        <div
          id="roadmap"
          className="mt-8 w-full bg-gradient-t from-[#444343] to-[#a19f9f] p-6 rounded-lg shadow-md"
          style={{ height: "70vh", overflowY: "auto" }} // Fixed height and scrollable
        >
          <h2 className="text-2xl font-bold mb-6 text-center">{roadmap.title}</h2>
          <div className="space-y-8">
            <AnimatePresence>
              {roadmap.steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: -30 }}
                  animate={visiblePhases > index ? { opacity: 1, y: 0 } : {}}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: index * 0.2 }}
                  className="relative"
                >
                  {/* Step Number and Title */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center mb-4 cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <h3 className="ml-4 text-xl font-semibold">{step.phase}</h3>
                  </motion.div>

                  {/* Step Content */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={visiblePhases > index ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.3 + 0.5 }}
                    className="ml-12 p-4 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  >
                    <ul className="list-disc ml-4 space-y-2">
                      {step.topics.map((topic, topicIndex) => (
                        <li key={topicIndex} className="text-gray-700">{topic}</li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Animated Connector (Only if not the last step) */}
                  {index < roadmap.steps.length  && visiblePhases > index && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 120 }} // Expands downward
                      transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.3 + 0.5 }}
                      className="absolute left-4 top-12 w-0.5 bg-blue-500"
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Download Button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleDownload}
              className="py-2 px-4 bg-gradient-to-r from-blue-400 to-purple-500 text-white rounded-md shadow-md hover:opacity-80 transition"
            >
              Download Roadmap
            </button>
          </div>
        </div>
      )}
    </div>
  );
}