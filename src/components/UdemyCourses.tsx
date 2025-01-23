"use client";

import Image from "next/image";
import { useState } from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

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

  const renderRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="w-4 h-4 text-yellow-400 fill-yellow-400"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half-star" className="relative w-4 h-4">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <div
            className="absolute inset-0 w-1/2 h-full bg-gray-900"
            style={{ clipPath: "inset(0 0)" }}
          ></div>
        </div>
      );
    }

    const remainingStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 1; i <= remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-400" />
      );
    }

    return stars;
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
      className="bg-gradient-to-b from-[#1b1b1b] to-[#242424] p-6 rounded-2xl shadow-2xl border border-gray-800/50 backdrop-blur-xl flex flex-col gap-8"
    >
      <motion.h3 className="text-xl text-center font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
        Udemy Courses
      </motion.h3>

      {/* Scrollable Container */}
      <div
        className="overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800/50"
        style={{
          scrollbarWidth: "thin", // For Firefox
        }}
      >
        <div className="space-y-6">
          {displayedCourses.map((course, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-r from-[#1b1b1b] to-[#242424] text-white rounded-xl overflow-hidden shadow-2xl border border-gray-700/30 hover:border-gray-600/50 transition-all duration-300"
            >
              <div className="relative w-full h-[150px] group overflow-hidden">
                <Image
                  src={course.thumbnail}
                  alt={course.name}
                  width={600}
                  height={150}
                  className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
              </div>

              <div className="p-4 space-y-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold leading-tight">
                    {course.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium">
                    {course.workload}
                  </p>

                  <div className="flex items-center gap-1.5">
                    {renderRatingStars(course.rating)}
                    <span className="text-xs text-gray-400 ml-1">
                      ({course.rating})
                    </span>
                  </div>
                </div>

                <motion.p
                  initial={false}
                  animate={{ height: "auto" }}
                  className="text-xs text-gray-300 leading-relaxed"
                >
                  {expandedDescriptions[index]
                    ? course.description
                    : truncateDescription(course.description, 10)}
                </motion.p>

                <div className="flex items-center justify-between pt-2">
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

                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href={course.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 text-xs"
                  >
                    Enroll Now
                  </motion.a>
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
          className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 hover:shadow-lg hover:shadow-purple-500/25 text-sm"
        >
          {showAll ? "Show Less" : "Show More"}
        </motion.button>
      )}
    </motion.div>
  );
}