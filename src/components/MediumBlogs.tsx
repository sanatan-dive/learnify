"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Bookmark } from "lucide-react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import LoginDialog from "./LoginDialog";

interface MediumBlogsProps {
  blogs: {
    title: string;
    link: string;
    author?: string;
    description?: string;
  }[];
}

export default function MediumBlogs({ blogs }: MediumBlogsProps) {
  const [showAll, setShowAll] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{
    [key: number]: boolean;
  }>({});
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState<{
    [key: number]: boolean;
  }>({});
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { isSignedIn } = useAuth();

  if (!blogs || blogs.length === 0) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-white text-center py-8"
      >
        No blogs available.
      </motion.p>
    );
  }

  const displayedBlogs = showAll ? blogs : blogs.slice(0, 2);

  const toggleDescription = (index: number) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleBookmarkClick = (index: number) => {
    if (!isSignedIn) {
      setShowLoginDialog(true);
      return;
    }
    setBookmarkedBlogs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
    console.log(
      bookmarkedBlogs[index] ? "Removed from bookmarks" : "Bookmarked blog"
    );
  };

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

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6" // Reduced space-y-6 to space-y-4
    >
      {showLoginDialog && (
        <LoginDialog setShowLoginDialog={setShowLoginDialog} />
      )}

      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-b from-[#1b1b1b] to-[#242424] p-8 flex flex-col gap-8 rounded-2xl shadow-2xl border border-gray-800/50 backdrop-blur-xl" // Reduced padding and gap
      >
        <motion.h3 className="text-xl text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Medium Blogs
        </motion.h3>

        {/* Scrollable Container */}
        <div
          className="overflow-y-auto max-h-[550px] scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800/50"
          style={{
            scrollbarWidth: "thin", // For Firefox
          }}
        >
          <div className="space-y-8"> {/* Reduced space-y-6 to space-y-4 */}
            {displayedBlogs.map((blog, index) => {
              const isDescriptionExpanded = expandedDescriptions[index];
              const description = blog.description || "";
              const shouldTruncate = description.length > 100;

              return (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-r from-[#1b1b1b] to-[#242424] p-6 flex gap-6 rounded-xl shadow-2xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300" // Reduced padding
                >
                  <div className="space-y-7 flex-1"> {/* Reduced space-y-4 to space-y-3 */}
                    <h3 className="text-lg text-white font-bold leading-tight"> {/* Reduced text size */}
                      {blog.title}
                    </h3>

                    <p className="text-xs text-gray-400 font-medium"> {/* Reduced text size */}
                      By {blog.author || "Unknown Author"}
                    </p>

                    <motion.div
                      initial={false}
                      animate={{ height: "auto" }}
                      className="relative"
                    >
                      <p className="text-xs text-gray-300 leading-relaxed"> {/* Reduced text size */}
                        {shouldTruncate && !isDescriptionExpanded
                          ? `${description.slice(0, 100)}...`
                          : description}
                      </p>
                      {shouldTruncate && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleDescription(index)}
                          className="text-blue-400 hover:text-blue-300 ml-1 text-xs font-medium focus:outline-none" // Reduced text size
                        >
                          {isDescriptionExpanded ? "Read Less" : "Read More"}
                        </motion.button>
                      )}
                    </motion.div>

                    <motion.div className="pt- flex items-center justify-between"> {/* Reduced padding */}
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={blog.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-5 px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 text-xs group" // Reduced padding and text size
                      >
                        Read Blog
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" /> {/* Reduced icon size */}
                      </motion.a>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.0 }}
                        onClick={() => handleBookmarkClick(index)}
                        className="p-1.5 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all duration-300" // Reduced padding
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            bookmarkedBlogs[index]
                              ? "text-purple-500 fill-purple-500"
                              : "text-gray-300"
                          }`} // Reduced icon size
                        />
                      </motion.button>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {blogs.length > 2 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/25 text-sm" // Reduced padding and margin
          >
            {showAll ? "Show Less" : "Show More & Scroll"}
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}