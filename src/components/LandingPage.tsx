import React, { useState as useStateHook, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import WorldResourceLoader from "@/components/Loading";
import YouTubePlaylist from "@/components/YoutubePlaylist";
import MediumBlogs from "@/components/MediumBlogs";
import CourseraCourses from "@/components/CourseraCourses";
import UdemyCourses from "@/components/UdemyCourses";
import { ApiResponse } from "@/types";
import SkeletonLoader from "@/components/Loading";
import { RainbowButton } from "./ui/rainbow-button";

interface LandingPageContentProps {
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LandingPageContent = ({ setIsLoading }: LandingPageContentProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query");
  const [searchQuery, setSearchQuery] = useStateHook(query || "");
  const [responses, setResponses] = useStateHook<ApiResponse | null>(null);
  const [localIsLoading, setLocalIsLoading] = useStateHook(false);

  const placeholders = ["Enter your Topic", "Learn Anything", "Master Anything"];

  useEffect(() => {
    if (!query) return;

    const fetchData = async () => {
      setLocalIsLoading(true);
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
        setLocalIsLoading(false);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [query, setIsLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/landing?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  const onRoadmap = ()=>{

    if (searchQuery.trim()) {
      router.push(`/roadmap?query=${encodeURIComponent(searchQuery)}`);
    }

  }

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
    <div className="min-h-screen flex flex-col justify-center items-center p-10 w-full text-white relative">
      {/* Generate Roadmap Button */}
      
        
      

      <AnimatePresence >
        {!localIsLoading && (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-4xl mb-10"
          >
            <PlaceholdersAndVanishInput
              placeholders={placeholders}
              onChange={handleChange}
              onSubmit={onSubmit}
              disabled={localIsLoading}
            />
          </motion.div>
        )}

        {localIsLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center w-full max-w-8xl"
          >
            <SkeletonLoader/>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full max-w-8xl"
          >
              <RainbowButton
        onClick={onRoadmap}
        className="absolute top-4 right-4 px-6 py-2 bg-gradient-to-r from-[#467cbf] via-[#0016d6] to-[#467cbf]  text-white rounded-full shadow-lg hover:opacity-80 transition hover:scale-105 "
      >
        Generate a Roadmap
      
      </RainbowButton>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
              {responses && (
                <>
                  <YouTubePlaylist playlists={responses?.results?.youtube?.playlists || []} />
                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-8"
                  >
                    <div>
                      <CourseraCourses courses={responses?.results?.coursera?.courses || []} />
                    </div>
                    <div>
                      <UdemyCourses courses={responses?.results?.udemy?.courses || []} />
                    </div>
                  </motion.div>
                  <MediumBlogs blogs={responses?.results?.medium?.blogs || []} />
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
