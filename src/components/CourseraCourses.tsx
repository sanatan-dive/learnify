// components/CourseraCourses.tsx
"use client";
import Image from "next/image";
import { useState } from "react";
import { Star } from "lucide-react"; // Import star icon

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
  const [showAll, setShowAll] = useState(false); // State to manage expanded view
  const [expandedDescriptions, setExpandedDescriptions] = useState<{
    [key: number]: boolean;
  }>({}); // State to manage expanded descriptions

  if (!courses || courses.length === 0) {
    return <p className="text-white">No courses available.</p>;
  }

  // Determine the number of courses to display
  const displayedCourses = showAll ? courses : courses.slice(0, 2);

  // Function to truncate description to 100 words
  const truncateDescription = (description: string, wordLimit: number) => {
    const words = description.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return description;
  };

  // Function to toggle description expansion
  const toggleDescription = (index: number) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="space-y-3 max-w-xs mx-auto"> {/* Further reduced width */}
      {displayedCourses.map((course, index) => (
        <div
          key={index}
          className="bg-[#0f0f0f] text-white rounded-lg overflow-hidden shadow-lg"
        >
          {/* Thumbnail Section */}
          <div className="relative w-full h-[100px]"> {/* Further reduced height */}
            <Image
              src={course.thumbnail}
              alt={course.name}
              width={600}
              height={200}
              className="w-full h-full object-cover "
            />
          </div>

          {/* Content Section */}
          <div className="p-2 space-y-1"> {/* Further reduced padding and spacing */}
            {/* Course Name */}
            <h3 className="text-sm font-semibold">{course.name}</h3> {/* Further reduced font size */}

            {/* Workload */}
            <p className="text-xs text-gray-400">{course.workload}</p> {/* Adjusted font size */}

            {/* Course Description */}
            <p className="text-xs text-gray-300"> {/* Adjusted font size */}
              {expandedDescriptions[index]
                ? course.description
                : truncateDescription(course.description, 10)}
            </p>

            <div className="flex items-center justify-between">
              {course.description.split(" ").length > 10 && (
                <button
                  onClick={() => toggleDescription(index)}
                  className="text-blue-400 hover:text-blue-300 text-xs" // Adjusted font size
                >
                  {expandedDescriptions[index] ? "Read Less" : "Read More"}
                </button>
              )}

              {/* Enroll Now Button */}
              <a
                href={course.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-2 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors text-xs" // Further reduced padding and font size
              >
                Enroll Now
              </a>
            </div>
          </div>
        </div>
      ))}

      {/* Show "Show More" button if there are more than 3 courses */}
      {courses.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs" // Further reduced padding and font size
        >
          {showAll ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}