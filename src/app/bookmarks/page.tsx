"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Bookmark {
  id: string;
  playlist?: { title: string; channel: string; link: string };
  courseraCourse?: { name: string; description: string; registrationLink: string };
  udemyCourse?: { name: string; description: string; registrationLink: string };
  blog?: { title: string; description: string; link: string };
}

interface LinkButtonProps {
  href: string;
  children: React.ReactNode;
}

interface BookmarksProps {
  initialBookmarks?: Bookmark[];
}

function Bookmarks({ initialBookmarks = [] }: BookmarksProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(initialBookmarks);
  const [loading, setLoading] = useState(!initialBookmarks.length);
  const [error, setError] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (initialBookmarks.length) return;
    async function fetchBookmarks() {
      try {
        const response = await axios.get("/api/Features/bookmark");
        setBookmarks(response.data.bookmarks || []);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError("Failed to fetch bookmarks. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchBookmarks();
  }, [initialBookmarks]);

  const playlists = bookmarks.filter((bookmark) => bookmark.playlist);
  const courses = bookmarks.filter((bookmark) => bookmark.courseraCourse || bookmark.udemyCourse);
  const blogs = bookmarks.filter((bookmark) => bookmark.blog);

  const truncateDescription = (description: string, wordLimit: number) => {
    const words = description.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return description;
  };

  const toggleDescription = (id: string) => {
    setExpandedDescriptions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="p-6 overflow-y-auto space-y-8">
        <Skeleton className="h-10 w-48 mb-8" />
        <section className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="relative bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-800/50 rounded-xl max-w-2xl shadow-lg">
                <CardHeader className="pb-3"><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-10 w-32 rounded-lg bg-gradient-to-r from-blue-600/30 to-purple-600/30" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        <section className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="relative bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-800/50 rounded-xl shadow-lg">
                <CardHeader className="pb-3"><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                  <Skeleton className="h-10 w-32 rounded-lg bg-gradient-to-r from-blue-600/30 to-purple-600/30" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        <section className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="relative bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-800/50 rounded-xl shadow-lg">
                <CardHeader className="pb-3"><Skeleton className="h-6 w-3/4" /></CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                  </div>
                  <Skeleton className="h-10 w-32 rounded-lg bg-gradient-to-r from-blue-600/30 to-purple-600/30" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
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

  const LinkButton: React.FC<LinkButtonProps> = ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="relative z-10 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium transition-all duration-300 hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:shadow-blue-500/25 text-sm group mt-2 cursor-pointer"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
      <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
      </svg>
    </a>
  );

  return (
    <div className="p-6 h-screen overflow-y-auto space-y-8">
      <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
        Your Bookmarks
      </h1>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-300">Playlists</h2>
        {playlists.length === 0 ? (
          <p className="text-gray-500">No playlists bookmarked.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((bookmark) => (
              bookmark.playlist && (
                <Card key={bookmark.id} className="relative bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-800/50 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-white">{bookmark.playlist.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-400">{bookmark.playlist.channel}</p>
                    <LinkButton href={bookmark.playlist.link}>Watch Playlist</LinkButton>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        )}
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-300">Courses</h2>
        {courses.length === 0 ? (
          <p className="text-gray-500">No courses bookmarked.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((bookmark) => (
              <Card key={bookmark.id} className="relative bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-800/50 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-white">
                    {bookmark.courseraCourse ? `Coursera: ${bookmark.courseraCourse.name}` : bookmark.udemyCourse ? `Udemy: ${bookmark.udemyCourse.name}` : 'Unknown Course'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">
                      {expandedDescriptions[bookmark.id]
                        ? bookmark.courseraCourse?.description || bookmark.udemyCourse?.description || 'No description'
                        : truncateDescription(bookmark.courseraCourse?.description || bookmark.udemyCourse?.description || 'No description', 15)}
                    </p>
                    {(bookmark.courseraCourse?.description?.split(" ").length > 15 || bookmark.udemyCourse?.description?.split(" ").length > 15) && (
                      <button
                        onClick={() => toggleDescription(bookmark.id)}
                        className="text-blue-400 hover:text-blue-300 text-xs font-medium cursor-pointer"
                      >
                        {expandedDescriptions[bookmark.id] ? "Read Less" : "Read More"}
                      </button>
                    )}
                  </div>
                  <LinkButton href={bookmark.courseraCourse?.registrationLink || bookmark.udemyCourse?.registrationLink || '#'}>Enroll Now</LinkButton>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-300">Blogs</h2>
        {blogs.length === 0 ? (
          <p className="text-gray-500">No blogs bookmarked.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((bookmark) => (
              bookmark.blog && (
                <Card key={bookmark.id} className="relative bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-800/50 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-1">
                    <CardTitle className="text-lg text-white">{bookmark.blog.title || 'Untitled Blog'}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">
                        {expandedDescriptions[bookmark.id]
                          ? bookmark.blog.description || 'No description'
                          : truncateDescription(bookmark.blog.description || 'No description', 15)}
                      </p>
                      {bookmark.blog.description?.split(" ").length > 15 && (
                        <button
                          onClick={() => toggleDescription(bookmark.id)}
                          className="text-blue-400 hover:text-blue-300 text-xs font-medium cursor-pointer"
                        >
                          {expandedDescriptions[bookmark.id] ? "Read Less" : "Read More"}
                        </button>
                      )}
                    </div>
                    <LinkButton href={bookmark.blog.link || '#'}>Read Blog</LinkButton>
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Bookmarks;