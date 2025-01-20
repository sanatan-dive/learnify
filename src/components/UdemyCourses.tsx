// components/UdemyCourses.tsx
"use client";
import { useState } from "react";

interface UdemyCoursesProps {
  courses: {
    name: string;
    registrationLink: string;
  }[];
}

export default function UdemyCourses({ courses }: UdemyCoursesProps) {
  const [showAll, setShowAll] = useState(false); // State to manage expanded view

  if (!courses || courses.length === 0) {
    return <p className="text-white">No courses available.</p>;
  }

  // Determine the number of courses to display
  const displayedCourses = showAll ? courses : courses.slice(0, 5);

  return (
    <div className="space-y-4">
      {displayedCourses.map((course, index) => (
        <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="text-xl text-white font-semibold">{course.name}</h3>
          <a
            href={course.registrationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            Enroll Now
          </a>
        </div>
      ))}

      {/* Show "Show More" button if there are more than 5 courses */}
      {courses.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showAll ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}