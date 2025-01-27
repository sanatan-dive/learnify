"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowRight, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth, SignInButton, useUser } from "@clerk/nextjs";
import LoginDialog from "./LoginDialog";
import axios from "axios";

interface CourseraCoursesProps {
  courses: {
    name: string;
    registrationLink: string;
    description: string;
    rating: number;
    thumbnail: string;
    workload: string;
  }[];
}

export default function CourseraCourses({ courses }: CourseraCoursesProps) {
  const [showAll, setShowAll] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{
    [key: number]: boolean;
  }>({});
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { isSignedIn,user } = useUser();
  const [bookmarkedCourses, setBookmarkedCourses] = useState<{
    [key: number]: boolean;
  }>({});

  if (!courses || courses.length === 0) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-white text-center py-8"
      >
        No courses available.
      </motion.p>
    );
  }

  const displayedCourses = showAll ? courses : courses.slice(0, 1);

  const truncateDescription = (description: string, wordLimit: number) => {
    const words = description.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return description;
  };

  const toggleDescription = (index: number) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleBookmarkClick = async (index: number) => {
    if (!isSignedIn) {
      setShowLoginDialog(true);
      return;
    }
    const courseracourse = courses[index];
    
    try {
    const response = await axios.post('/api/bookmark', {
      userId: user?.id,
      bookmarkableId: courseracourse.registrationLink, 
      bookmarkableType: 'Courseracourse',
      detail: {
        courseracourse: {
          title: courseracourse.name,
          link: courseracourse.registrationLink,
          thumbnail: courseracourse.thumbnail,
          workload: courseracourse.workload,
          description: courseracourse.description,
      }
      },
    })  
    } catch (error) {
      
    }
    setBookmarkedCourses((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
   
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
      className="space-y-4" // Reduced space-y-6 to space-y-4
    >
      {showLoginDialog && (
        <LoginDialog setShowLoginDialog={setShowLoginDialog} />
      )}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-b from-[#1b1b1b] to-[#242424] p-4 rounded-2xl shadow-2xl border border-gray-800/50 backdrop-blur-xl flex flex-col gap-4" 
      >
        <motion.h3 className="text-xl text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Coursera Courses
        </motion.h3>

        <div
          className="overflow-y-auto max-h-[220px] scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800/50" 
          style={{
            scrollbarWidth: "thin",
          }}
        >
          <div className="space-y-4"> {/* Reduced space-y-6 to space-y-4 */}
            {displayedCourses.map((course, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-[#1b1b1b] to-[#242424] text-white rounded-xl overflow-hidden shadow-2xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300"
              >
                <div className="relative w-full h-[100px] group overflow-hidden"> {/* Reduced height */}
                  <Image
                    src={course.thumbnail}
                    alt={course.name}
                    width={400}
                    height={100} // Reduced height
                    className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                </div>

                <div className="p-2 space-y-1"> {/* Reduced padding */}
                  <div className="space-y-1">
                    <h3 className="text-md font-semibold leading-tight"> {/* Reduced text size */}
                      {course.name}
                    </h3>

                    <p className="text-xs text-gray-400 font-medium flex items-center gap-2">
                      <svg
                        className="w-3 h-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                      {course.workload}
                    </p>
                  </div>

                  <motion.div
                    initial={false}
                    animate={{ height: "auto" }}
                    className="relative"
                  >
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {expandedDescriptions[index]
                        ? course.description
                        : truncateDescription(course.description, 10)}
                    </p>
                  </motion.div>

                  <div className="flex items-center justify-between pt-1"> {/* Reduced padding */}
                    {course.description.split(" ").length > 10 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleDescription(index)}
                        className="text-blue-400 hover:text-blue-300 text-xs font-medium"
                      >
                        {expandedDescriptions[index] ? "Read Less" : "Read More"}
                      </motion.button>
                    )}

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBookmarkClick(index)}
                        className="p-1 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-all duration-300" // Reduced padding
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            bookmarkedCourses[index]
                              ? "text-purple-500 fill-purple-500"
                              : "text-gray-300"
                          }`}
                        />
                      </motion.button>

                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={course.registrationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 text-xs group" // Reduced padding
                      >
                        Enroll Now
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                      </motion.a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {courses.length > 1 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-2 px-3 py-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/25 text-sm" // Reduced padding and margin
          >
            {showAll ? "Show Less" : "Show More"}
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}