"use client";
import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconArrowLeft,
  IconBookmark,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState as useStateHook } from "react";
import YouTubePlaylist from "@/components/YoutubePlaylist";
import MediumBlogs from "@/components/MediumBlogs";
import CourseraCourses from "@/components/CourseraCourses";
import UdemyCourses from "@/components/UdemyCourses";
import { ApiResponse } from "@/types";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";
import WorldResourceLoader from "@/components/Loading";
import { Suspense } from "react";

export default function SidebarDemo() {
  const links = [
    
    {
      label: "Profile",
      href: "#",
      icon: (
        <IconUserBolt className="text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Bookmarks",
      href: "#",
      icon: (
        <IconBookmark className="text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row w-full flex-1 max-w-8xl mx-auto border border-neutral-700 dark:border-neutral-600 overflow-hidden",
        "h-screen  text-white"
      )}
    >
      {!isLoading && (
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between bg-stone-900 gap-10 dark:bg-black">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              {open ? <Logo /> : <LogoIcon />}
              <div className="mt-8 flex flex-col gap-2">
                {links.map((link, idx) => (
                  <SidebarLink 
                    key={idx} 
                    link={link} 
                    className="hover:bg-neutral-800 transition-colors duration-200" 
                  />
                ))}
              </div>
            </div>
            <div>
              <SidebarLink
                link={{
                  label: "Manu Arora",
                  href: "#",
                  icon: (
                    <Image
                      src="https://assets.aceternity.com/manu.png"
                      className="h-7 w-7 flex-shrink-0 rounded-full"
                      width={50}
                      height={50}
                      alt="Avatar"
                    />
                  ),
                }}
                className="hover:bg-neutral-800 transition-colors duration-200"
              />
            </div>
          </SidebarBody>
        </Sidebar>
      )}
      <LandingPageContent setIsLoading={setIsLoading} />
    </div>
  );
}

export const Logo = () => {

  return (
 
 <Link
 
 href="#"
 
 className="font-normal flex space-x-2 items-center text-sm text-white py-1 relative z-20"
 
 >
 
 <div className="h-5 w-6 bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
 
 <motion.span
 
 initial={{ opacity: 0 }}
 
 animate={{ opacity: 1 }}
 
 className="font-medium text-white whitespace-pre"
 
 >
 
  Learnify
 
 </motion.span>
 
 </Link>
 
  );
 
 };
 
 export const LogoIcon = () => {
 
 return (
 
 <Link
 
 href="#"
 
 className="font-normal flex space-x-2 items-center text-sm text-white py-1 relative z-20"
 
 >
 
 <div className="h-5 w-6 bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
 
 </Link>
 
  );
 
 };

function LandingPageContent({ 
  setIsLoading 
}: { 
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>> 
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("query");
  const [searchQuery, setSearchQuery] = useStateHook(query || "");
  const [responses, setResponses] = useStateHook<ApiResponse | null>(null);
  const [localIsLoading, setLocalIsLoading] = useStateHook(false);

  const placeholders = ["Enter your Topic", "Generate a Roadmap"];

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
    <div className="min-h-screen flex flex-col justify-center items-center p-8 w-full  text-white">
      <AnimatePresence mode="wait">
        {!localIsLoading && (
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800/50">
              {responses && (
                <>
                  <YouTubePlaylist playlists={responses.youtube?.playlists || []} />

                  <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-12"
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