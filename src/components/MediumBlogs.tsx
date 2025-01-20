// components/MediumBlogs.tsx
"use client";
import { useState } from "react";

interface MediumBlogsProps {
  blogs: {
    title: string;
    link: string;
  }[];
}

export default function MediumBlogs({ blogs }: MediumBlogsProps) {
  const [showAll, setShowAll] = useState(false); // State to manage expanded view

  if (!blogs || blogs.length === 0) {
    return <p className="text-white">No blogs available.</p>;
  }

  // Determine the number of blogs to display
  const displayedBlogs = showAll ? blogs : blogs.slice(0, 5);

  return (
    <div className="space-y-4">
      {displayedBlogs.map((blog, index) => (
        <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="text-xl text-white font-semibold">{blog.title}</h3>
          <a
            href={blog.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            Read Blog
          </a>
        </div>
      ))}

      {/* Show "Show More" button if there are more than 5 blogs */}
      {blogs.length > 5 && (
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