import React, { useState as useStateHook, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
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

// Create a separate component for the search params logic
const LandingPageContentInner = ({ setIsLoading }: LandingPageContentProps) => {
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
        const baseUrl = window.location.origin;
        
        // Set up the API endpoints
        const apiEndpoints = [
          { name: "medium", url: `${baseUrl}/api/Resources/medium?query=${query}` },
          { name: "coursera", url: `${baseUrl}/api/Resources/coursera?query=${query}` },
          { name: "udemy", url: `${baseUrl}/api/Resources/udemy?query=${query}` },
          { name: "youtube", url: `${baseUrl}/api/Resources/youtube?query=${query}` },
        ];

        // console.log(`Starting parallel API calls for query: ${query}`);
        const startTime = Date.now();

        // Make parallel requests to all APIs simultaneously
        const responses = await Promise.all(
          apiEndpoints.map(async (endpoint) => {
            try {
              // console.log(`Fetching from ${endpoint.name}...`);
              const response = await fetch(endpoint.url);
              
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
              
              const data = await response.json();
              // console.log(`✅ ${endpoint.name} completed successfully`);
              return { data, error: null };
            } catch (error) {
              console.error(`❌ ${endpoint.name} failed:`, error);
              //@ts-ignore
              return { data: null, error: error.message };
            }
          })
        );

        const endTime = Date.now();
        // console.log(`All API calls completed in ${endTime - startTime}ms`);

        // Parse the responses into a results object
        const results = apiEndpoints.reduce((acc, endpoint, index) => {
          acc[endpoint.name] = responses[index]?.data || [];
          return acc;
        }, {} as Record<string, any>);

        // Log summary
        const successCount = responses.filter(r => r.data !== null).length;
        // console.log(`Successfully fetched from ${successCount}/${apiEndpoints.length} APIs`);

        // Create the response object matching your ApiResponse type
        const apiResponse: ApiResponse = {
          //@ts-ignore
          query,
          results,
          metadata: {
            totalApis: apiEndpoints.length,
            successfulApis: successCount,
            executionTimeMs: endTime - startTime,
          }
        };
        
        setResponses(apiResponse);
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

  const onRoadmap = () => {
    if (searchQuery.trim()) {
      router.push(`/roadmap`);
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
    <div className=" p-10 h-screen flex flex-col justify-center items-center w-full text-white relative">
      {/* Generate Roadmap Button */}
      <AnimatePresence>
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
              // disabled={localIsLoading}
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

// Fallback component for Suspense
const SearchParamsFallback = () => (
  <div className="p-10 h-screen flex flex-col justify-center items-center w-full text-white relative">
    <SkeletonLoader />
  </div>
);

// Main export with Suspense wrapper
export const LandingPageContent = ({ setIsLoading }: LandingPageContentProps) => {
  return (
    <Suspense fallback={<SearchParamsFallback />}>
      <LandingPageContentInner setIsLoading={setIsLoading} />
    </Suspense>
  );
};