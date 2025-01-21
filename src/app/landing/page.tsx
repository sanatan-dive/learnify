"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

  const placeholders = [
    "Enter your Topic",
    "Generate a Roadmap"
  ];

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

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-8">
      {!isLoading && (
        <div className="w-full max-w-4xl mb-10">
          <PlaceholdersAndVanishInput
            placeholders={placeholders}
            onChange={handleChange}
            onSubmit={onSubmit}
            disabled={isLoading}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center gap-4">
          
          <WorldResourceLoader />
         
         
        </div>
      ) : (
        <div className="w-full z-50 max-w-8xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {responses && (
              <>
                <div className="bg-[#1a1919] p-8 rounded-lg shadow-lg">
                  <h3 className="text-2xl text-white text-center font-semibold mb-6">
                    YouTube Playlists
                  </h3>
                  <YouTubePlaylist playlists={responses.youtube?.playlists || []} />
                </div>

                <div className="bg-[#1a1919] p-8 rounded-lg shadow-lg flex flex-col gap-10">
                  <div>
                    <h3 className="text-2xl text-center text-white font-semibold mb-6">
                      Coursera Courses
                    </h3>
                    <CourseraCourses courses={responses.coursera?.courses || []} />
                  </div>
                  <div>
                    <h3 className="text-2xl text-center text-white font-semibold mb-6">
                      Udemy Courses
                    </h3>
                    <UdemyCourses courses={responses.udemy?.courses || []} />
                  </div>
                </div>

                <div className="bg-[#1a1919] p-8 rounded-lg shadow-lg">
                  <h3 className="text-2xl text-white text-center font-semibold mb-6">
                    Medium Blogs
                  </h3>
                  <MediumBlogs blogs={responses.medium?.blogs || []} />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 