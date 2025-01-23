"use client";

import Image from "next/image";
import { useState } from "react";
import { Volume2, Play, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth, SignInButton } from "@clerk/nextjs"; // Import Clerk hooks

interface YouTubePlaylistProps {
  playlists: {
    title: string;
    link: string;
    thumbnail: string;
    channel: string;
  }[];
}

export default function YouTubePlaylist({ playlists }: YouTubePlaylistProps) {
  const [showAll, setShowAll] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showLoginDialog, setShowLoginDialog] = useState(false); // State for custom dialog
  const { isSignedIn } = useAuth(); // Get auth state from Clerk

  if (!playlists || playlists.length === 0) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-white text-center py-8"
      >
        No playlists available.
      </motion.p>
    );
  }

  const displayedPlaylists = showAll ? playlists : playlists.slice(0, 3);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleBookmarkClick = () => {
    if (!isSignedIn) {
      setShowLoginDialog(true); // Show custom dialog if user is not logged in
      return;
    }
    // Handle bookmark logic here for logged-in users
    console.log("Bookmarking playlist...");
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Custom Dialog Box */}
      {showLoginDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-neutral-900 p-6 rounded-lg shadow-lg max-w-sm w-full border border-gray-800/50"
          >
            <h2 className="text-xl font-semibold text-white mb-4">
              Login Required
            </h2>
            <p className="text-gray-400 mb-6">
              To bookmark this playlist, please log in or sign up.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowLoginDialog(false)}
                className="px-4 py-2 bg-gray-700/50 text-white rounded-lg hover:bg-gray-600/50 transition-all"
              >
                Cancel
              </button>
              <SignInButton>
                <button className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-500 hover:to-pink-500 transition-all">
                  Login / Sign Up
                </button>
              </SignInButton>
            </div>
          </motion.div>
        </div>
      )}

      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-b from-[#1b1b1b] to-[#242424] p-8 rounded-2xl flex flex-col gap-8 shadow-2xl border border-gray-800/50 backdrop-blur-xl"
      >
        <motion.h3 className="text-2xl text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          YouTube Playlists
        </motion.h3>

        {/* Scrollable Container */}
        <div
          className="overflow-y-auto max-h-[600px] scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800/50"
          style={{
            scrollbarWidth: "thin", // For Firefox
          }}
        >
          <div className="space-y-6">
            {displayedPlaylists.map((playlist, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="w-full max-w-[600px] bg-gradient-to-b from-[#1b1b1b] to-[#242424] text-white flex 2xl:flex-row flex-col rounded-xl overflow-hidden shadow-2xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300"
              >
                <div
                  className="relative flex-shrink-0 w-full md:w-[250px] justify-center items-center flex lg:w-[300px] group"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <a
                    href={playlist.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-video group-hover:scale-105 transition-all duration-300"
                  >
                    <Image
                      src={playlist.thumbnail}
                      alt={playlist.title}
                      width={400}
                      height={250}
                      className="w-full h-full object-cover "
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                      className="absolute inset-0 bg-black/75  flex items-center justify-center backdrop-blur-sm"
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className="flex items-center gap-2 text-white"
                      >
                        <Play className="w-8 h-8" />
                        <span className="text-lg font-semibold">Play All</span>
                      </motion.div>
                    </motion.div>
                  </a>
                  <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/90 px-3 py-1.5 rounded-full text-xs backdrop-blur-sm">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="font-medium">Playlist</span>
                  </div>
                </div>
                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold leading-tight line-clamp-2">
                      {playlist.title}
                    </h2>
                    <p className="text-sm text-gray-400 font-medium">
                      {playlist.channel}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <a
                      href={playlist.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium transition-all duration-300 hover:from-red-500 hover:to-pink-500 hover:shadow-lg hover:shadow-red-500/25 active:scale-95 text-center"
                    >
                      Watch Playlist
                    </a>
                    <button
                      onClick={handleBookmarkClick}
                      className="p-2.5 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all duration-300"
                    >
                      <Bookmark className="w-5 h-5 text-gray-300" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {playlists.length > 3 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAll(!showAll)}
            className="w-full max-w-[600px] mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/25"
          >
            {showAll ? "Show Less" : "Show More"}
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}