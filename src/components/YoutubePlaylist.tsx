import { motion } from 'framer-motion';
import { useState } from 'react';
import { Volume2, Play, Bookmark } from 'lucide-react';
import { useAuth, useUser } from '@clerk/nextjs'; // Import Clerk hooks
import Image from 'next/image';
import axios from 'axios';
import LoginDialog from './LoginDialog';

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
  const [bookmarkedPlaylists, setBookmarkedPlaylists] = useState<{ [key: number]: boolean }>(
    {}
  );

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
      setShowLoginDialog(true);
      return;
    }

    const playlist = playlists[index];
    const userId = user?.id;

    try {
      // Check if the playlist is already bookmarked
      const checkResponse = await axios.get('/api/bookmark', {
        params: { userId, link: playlist.link },
      });

      if (checkResponse.data.isBookmarked) {
        // Playlist is already bookmarked, so show a message and return
        console.log('Playlist already bookmarked.');
        return;
      }

      // If not bookmarked, proceed to bookmark it
      await axios.post('/api/bookmark', {
        userId: userId,
        bookmarkableId: playlist.link, // Use the link as a unique identifier
        bookmarkableType: 'Playlist',
        details: {
          playlist: {
            title: playlist.title,
            link: playlist.link,
            thumbnail: playlist.thumbnail,
            channel: playlist.channel,
          },
        },
      });

      // Update the bookmark state for the specific playlist
      setBookmarkedPlaylists((prev) => ({
        ...prev,
        [index]: true, // Set bookmark to true for the specific playlist
      }));

      console.log('Bookmarked playlist');
    } catch (error) {
      console.error('Error checking or saving bookmark:', error);
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
      {showLoginDialog && <LoginDialog setShowLoginDialog={setShowLoginDialog} />}

      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-b from-gray-900 to-gray-950 p-10 rounded-2xl flex flex-col gap-12 shadow-2xl border border-gray-800/50 backdrop-blur-xl" 
      >
        <motion.h3 className="text-2xl text-center font-bold bg-clip-text text-transparent bg-gray-50">
          YouTube Playlists
        </motion.h3>

        {/* Scrollable Container */}
        <div
          className="overflow-y-auto max-h-[515px] scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800/50" // Reduced max-h-
          style={{
            scrollbarWidth: 'thin', // For Firefox
          }}
        >
          <div className="space-y-8">
            {displayedPlaylists.map((playlist, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="w-full max-w-[600px] bg-gradient-to-b from-gray-800 to-gray-900 text-white flex lg:flex-row flex-col rounded-xl overflow-hidden shadow-2xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300"
              >
                <div
                  className="relative flex-shrink-0 w-full md:w-[200px] justify-center items-center flex lg:w-[250px] group" // Reduced width
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
                      width={300} // Reduced width
                      height={200} // Reduced height
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
                        <Play className="w-6 h-6" /> {/* Reduced icon size */}
                        <span className="text-md font-semibold">Play All</span> {/* Reduced text size */}
                      </motion.div>
                    </motion.div>
                  </a>
                  <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-black/90 px-2 py-1 rounded-full text-xs ">
                    <Volume2 className="w-3 h-3" /> {/* Reduced icon size */}
                    <span className="font-medium">Playlist</span>
                  </div>
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold leading-tight line-clamp-2">
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
                      className="inline-block px-4 py-1 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-normal transition-all duration-300 hover:from-red-500 hover:to-pink-500 hover:shadow-lg hover:shadow-red-500/25 active:scale-95 text-center"
                    >
                      Watch Playlist
                    </a>
                    <button
                      onClick={() => handleBookmarkClick(index)}
                      className="p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all duration-300"
                    >
                      <Bookmark
                        className={`w-4 h-4 ${
                          bookmarkedPlaylists[index]
                            ? 'text-purple-500 fill-purple-500' // Bookmarked state
                            : 'text-gray-300' // Default state
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
            className="w-full max-w-[600px] mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/25"
          >
            {showAll ? 'Show Less' : 'Show More '}
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}
