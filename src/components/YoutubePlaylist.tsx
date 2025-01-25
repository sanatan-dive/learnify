import { motion } from "framer-motion";
import { useState } from "react";
import { Volume2, Play, Bookmark } from "lucide-react";
import { useAuth, useUser } from "@clerk/nextjs"; // Import Clerk hooks
import Image from "next/image";
import axios from "axios";
import LoginDialog from "./LoginDialog";
import { PrismaClient } from "@prisma/client";

// Initialize Prisma client
const prisma = new PrismaClient();

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
  const { isSignedIn, user } = useUser(); 
  const [bookmarkedPlaylists, setBookmarkedPlaylists] = useState<{
    [key: number]: boolean;
  }>({}); // Track bookmarked playlists by index

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

  const handleBookmarkClick = async (index: number) => {
    if (!isSignedIn) {
      setShowLoginDialog(true); // Show custom dialog if user is not logged in
      return;
    }
  
    const playlist = playlists[index];
  
    try {
      
      const fetchedPlaylist = await prisma.playlist.findUnique({
        where: { link: playlist.link }, 
      });
  
      if (!fetchedPlaylist) {
        console.error("Playlist not found in the database");
        return;
      }
  
      // Send API request to save the bookmark using the playlist's ID
      await axios.post("/api/bookmark", {
        userId: user?.id, 
        bookmarkableId: fetchedPlaylist.id, // Use the ID from the fetched playlist
        bookmarkableType: "Playlist", 
        details: {
          playlist: {
            title: playlist.title,
            link: playlist.link,
            thumbnail: playlist.thumbnail,
            channel: playlist.channel,
          },
        },
      });
  
      // Toggle bookmark state for the playlist
      setBookmarkedPlaylists((prev) => ({
        ...prev,
        [index]: !prev[index], // Toggle the bookmark state for the specific playlist
      }));
  
      console.log(
        bookmarkedPlaylists[index] ? "Removed from bookmarks" : "Bookmarked playlist"
      );
    } catch (error) {
      console.error("Error saving bookmark:", error);
    }
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
        <LoginDialog setShowLoginDialog={setShowLoginDialog} />
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
                      className="w-full h-full object-cover"
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                      className="absolute inset-0 bg-black/75 flex items-center justify-center backdrop-blur-sm"
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
                      className="inline-block px-6 py-1 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-normal transition-all duration-300 hover:from-red-500 hover:to-pink-500 hover:shadow-lg hover:shadow-red-500/25 active:scale-95 text-center"
                    >
                      Watch Playlist
                    </a>
                    <button
                      onClick={() => handleBookmarkClick(index)} 
                      className="p-2.5 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all duration-300"
                    >
                      <Bookmark
                        className={`w-5 h-5 ${
                          bookmarkedPlaylists[index]
                            ? "text-purple-500 fill-purple-500" // Bookmarked state
                            : "text-gray-300" // Default state
                        }`}
                      />
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
