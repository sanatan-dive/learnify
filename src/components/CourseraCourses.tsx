// components/CourseraCourses.tsx
"use client";
import Image from "next/image";
import { useState } from "react";
import { Star } from "lucide-react";

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
    return <p className="text-white">No courses available.</p>;
  }

  const displayedCourses = showAll ? courses : courses.slice(0, 2);

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

  return (
    <div className="space-y-4">
      {displayedCourses.map((course, index) => (
        <div
          key={index}
          className="bg-[#0f0f0f] text-white rounded-lg overflow-hidden shadow-lg"
        >
          <div className="relative w-full h-[150px]">
            <Image
              src={course.thumbnail}
              alt={course.name}
              width={600}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-4 space-y-2">
            <h3 className="text-lg font-semibold">{course.name}</h3>
            <p className="text-sm text-gray-400">{course.workload}</p>

            <p className="text-sm text-gray-300">
              {expandedDescriptions[index]
                ? course.description
                : truncateDescription(course.description, 10)}
            </p>

            <div className="flex items-center justify-between">
              {course.description.split(" ").length > 10 && (
                <button
                  onClick={() => toggleDescription(index)}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  {expandedDescriptions[index] ? "Read Less" : "Read More"}
                </button>
              )}

              <a
                href={course.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-gradient-to-r hover:scale-105 transition-transform  from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-sm"
              >
                Enroll Now
              </a>
            </div>
          </div>
        </div>
      ))}

      {courses.length > 2 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-sm"
        >
          {showAll ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}
