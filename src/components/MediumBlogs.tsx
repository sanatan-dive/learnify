"use client";
import { useState } from "react";

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

  if (!blogs || blogs.length === 0) {
    return <p className="text-white">No blogs available.</p>;
  }

  const displayedBlogs = showAll ? blogs : blogs.slice(0, 5);

  const toggleDescription = (index: number) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="space-y-6">
      {displayedBlogs.map((blog, index) => {
        const isDescriptionExpanded = expandedDescriptions[index];
        const description = blog.description || "";
        const shouldTruncate = description.length > 100;

        return (
          <div
            key={index}
            className="bg-[#0f0f0f] p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <h3 className="text-xl text-white font-bold mb-2">{blog.title}</h3>

            <p className="text-sm text-gray-300 mb-4">
              By {blog.author || "Unknown Author"}
            </p>

            <p className="text-sm text-gray-400 mb-4">
              {shouldTruncate && !isDescriptionExpanded
                ? `${description.slice(0, 100)}...`
                : description}
              {shouldTruncate && (
                <button
                  onClick={() => toggleDescription(index)}
                  className="text-blue-400 hover:text-blue-300 ml-1 text-sm focus:outline-none"
                >
                  {isDescriptionExpanded ? "Read Less" : "Read More"}
                </button>
              )}
            </p>

            <a
              href={blog.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-2 bg-gradient-to-r hover:scale-105 transition-transform  from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm font-medium"
            >
              Read Blog
            </a>
          </div>
        );
      })}

      {blogs.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-sm font-medium w-full sm:w-auto text-center"
        >
          {showAll ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}