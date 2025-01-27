"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SidebarComponent } from "@/components/SidebarComponent";

function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{
    [key: string]: boolean;
  }>({});

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const response = await axios.get("/api/bookmark");
        // console.log(response.data.bookmarks);
        setBookmarks(response.data.bookmarks);
      } catch (err) {
        setError("Failed to fetch bookmarks. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchBookmarks();
  }, []);

  const playlists = bookmarks.filter((bookmark) => bookmark.playlist);
  const courses = bookmarks.filter(
    (bookmark) => bookmark.courseraCourse || bookmark.udemyCourse
  );
  const blogs = bookmarks.filter((bookmark) => bookmark.blog);

  const truncateDescription = (description: string, wordLimit: number) => {
    const words = description.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return description;
  };

  const toggleDescription = (id: string) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (loading) {
    return (
      <div className="grid gap-4 p-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="m-4" variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const LinkButton = ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative z-10 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 text-sm group mt-2 cursor-pointer"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      <svg
        className="w-4 h-4 transition-transform group-hover:translate-x-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M14 5l7 7m0 0l-7 7m7-7H3"
        />
      </svg>
    </a>
  );

  return (
    <SidebarComponent isLoading={loading}>
      <div className="p-6 overflow-auto space-y-8">
        <h1 className="text-3xl fixed font-bold z-50 mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
          Your Bookmarks
        </h1>

        {/* Playlists Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-300">Playlists</h2>
          {playlists.length === 0 ? (
            <p className="text-gray-500">No playlists bookmarked.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map((bookmark) => (
                <Card
                  key={bookmark.id}
                  className="relative bg-gradient-to-r from-[#1b1b1b] to-[#242424] border border-gray-800/50 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">
                      {bookmark.playlist.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-400">
                      {bookmark.playlist.channel}
                    </p>
                    <LinkButton href={bookmark.playlist.link}>
                      Watch Playlist
                    </LinkButton>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Courses Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-300">Courses</h2>
          {courses.length === 0 ? (
            <p className="text-gray-500">No courses bookmarked.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((bookmark) => (
                <Card
                  key={bookmark.id}
                  className="relative bg-gradient-to-r from-[#1b1b1b] to-[#242424] border border-gray-800/50 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">
                      {bookmark.courseraCourse
                        ? "Coursera: " + bookmark.courseraCourse.name
                        : bookmark.udemyCourse
                        ? "Udemy: " + bookmark.udemyCourse.name
                        : "Unknown Course"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">
                        {expandedDescriptions[bookmark.id]
                          ? bookmark.courseraCourse?.description || bookmark.udemyCourse?.description
                          : truncateDescription(
                              bookmark.courseraCourse?.description || 
                              bookmark.udemyCourse?.description || 
                              "No additional details available.",
                              15
                            )}
                      </p>
                      {(bookmark.courseraCourse?.description?.split(" ").length > 15 ||
                        bookmark.udemyCourse?.description?.split(" ").length > 15) && (
                        <button
                          onClick={() => toggleDescription(bookmark.id)}
                          className="text-blue-400 hover:text-blue-300 text-xs font-medium cursor-pointer"
                        >
                          {expandedDescriptions[bookmark.id]
                            ? "Read Less"
                            : "Read More"}
                        </button>
                      )}
                    </div>
                    <LinkButton
                      href={
                        bookmark.courseraCourse?.registrationLink ||
                        bookmark.udemyCourse?.registrationLink
                      }
                    >
                      Enroll Now
                    </LinkButton>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Blogs Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-gray-300">Blogs</h2>
          {blogs.length === 0 ? (
            <p className="text-gray-500">No blogs bookmarked.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((bookmark) => (
                <Card
                  key={bookmark.id}
                  className="relative bg-gradient-to-r from-[#1b1b1b] to-[#242424] border border-gray-800/50 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">
                      {bookmark.blog.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">
                        {expandedDescriptions[bookmark.id]
                          ? bookmark.blog.description
                          : truncateDescription(bookmark.blog.description, 15)}
                      </p>
                      {bookmark.blog.description.split(" ").length > 15 && (
                        <button
                          onClick={() => toggleDescription(bookmark.id)}
                          className="text-blue-400 hover:text-blue-300 text-xs font-medium cursor-pointer"
                        >
                          {expandedDescriptions[bookmark.id]
                            ? "Read Less"
                            : "Read More"}
                        </button>
                      )}
                    </div>
                    <LinkButton href={bookmark.blog.link}>Read Blog</LinkButton>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </SidebarComponent>
  );
}

export default Bookmarks;