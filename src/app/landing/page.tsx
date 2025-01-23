"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import YouTubePlaylist from "@/components/YoutubePlaylist";
import MediumBlogs from "@/components/MediumBlogs";
import CourseraCourses from "@/components/CourseraCourses";
import UdemyCourses from "@/components/UdemyCourses";
import { ApiResponse } from "@/types";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import WorldResourceLoader from "@/components/Loading";

export default function LandingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query");
  const [searchQuery, setSearchQuery] = useState(query || "");
  const [responses, setResponses] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const placeholders = ["Enter your Topic", "Generate a Roadmap"];

  useEffect(() => {
    if (!query) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/fetchall?query=${query}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data: ApiResponse = await response.json();
        setResponses(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [query]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/landing?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 200,
      },
    },
  };

  return (
    <div className="min-h-screen  flex flex-col justify-center items-center p-8">
      <AnimatePresence mode="wait">
        {!isLoading && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-4xl mb-12"
          >
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleChange}
              onSubmit={onSubmit}
              disabled={isLoading}
            />
          </motion.div>
        )}

        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center gap-6"
          >
            <WorldResourceLoader />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-8xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {responses && (
                <>
                  
                
                    <YouTubePlaylist playlists={responses.youtube?.playlists || []} />
                  

                  <motion.div
                    variants={itemVariants}
                    className="bg-gradient-to-b from-[] p-8 rounded-2xl shadow-2xl border border-gray-800/50 backdrop-blur-xl flex flex-col gap-12"
                  >
                    <div>
                    
                      <CourseraCourses courses={responses.coursera?.courses || []} />
                    </div>
                    <div>
                    
                      <UdemyCourses courses={responses.udemy?.courses || []} />
                    </div>
                  </motion.div>

            
                    <MediumBlogs blogs={responses.medium?.blogs || []} />
                  
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}