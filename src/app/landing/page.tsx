// src/app/landing/page.tsx
"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import YouTubePlaylist from "@/components/YoutubePlaylist";
import MediumBlogs from "@/components/MediumBlogs";
import CourseraCourses from "@/components/CourseraCourses";
import UdemyCourses from "@/components/UdemyCourses";
import { ApiResponse } from "@/types";

export default function LandingPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [responses, setResponses] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Hit the fetchall API
        const response = await fetch(`/api/fetchall?query=${query}`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        // Parse the response
        const data: ApiResponse = await response.json();
        console.log(data); // Log the response

        setResponses(data);
      } catch (error) {
        console.error("Error fetching data from APIs:", error);
      } finally {
        // Set loading state to false
        setIsLoading(false);
      }
    };

    // Call the fetchData function
    fetchData();
  }, [query]); // Re-run effect when the query changes

  return (
    <div className="min-h-screen flex flex-col gap-8 justify-center items-center">
      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
          <p className="text-lg text-white">Loading...</p>
        </div>
      ) : (
        <>
      
          <div className="mt-8 w-full flex gap-8 max-w-4xl">
            {responses && (
              <>
                {/* Display YouTube Playlists */}
                <div className="mt-4">
                  <h3 className="text-xl text-white font-semibold mb-4">
                    YouTube Playlists
                  </h3>
                  <YouTubePlaylist playlists={responses.youtube?.playlists || []} />
                </div>
                  {/* Display Coursera Courses */}
               <div className="flex flex-col">
               <div className="mt-4">
                  <h3 className="text-xl text-white font-semibold mb-4">
                    Coursera Courses
                  </h3>
                  <CourseraCourses courses={responses.coursera?.courses || []} />
                </div>

                {/* Display Udemy Courses */}
                <div className="mt-4">
                  <h3 className="text-xl text-white font-semibold mb-4">
                    Udemy Courses
                  </h3>
                  <UdemyCourses courses={responses.udemy?.courses || []} />
                </div>
               </div>
                {/* Display Medium Blogs */}
                {/* <div className="mt-4">
                  <h3 className="text-xl text-white font-semibold mb-4">
                    Medium Blogs
                  </h3>
                  <MediumBlogs blogs={responses.medium?.blogs || []} />
                </div> */}

                
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}