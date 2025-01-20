// components/YouTubePlaylist.tsx
"use client";
import Image from "next/image";
import { useState } from "react";
import { Volume2 } from "lucide-react";

interface YouTubePlaylistProps {
  playlists: {
    title: string;
    link: string;
    thumbnail: string;
    channel: string;
  }[];
}

export default function YouTubePlaylist({ playlists }: YouTubePlaylistProps) {
  const [showAll, setShowAll] = useState(false); // State to manage expanded view
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null); // State to track hovered playlist

  if (!playlists || playlists.length === 0) {
    return <p className="text-white">No playlists available.</p>;
  }

  // Determine the number of playlists to display
  const displayedPlaylists = showAll ? playlists : playlists.slice(0, 3);

  return (
    <div className="space-y-4">
      {displayedPlaylists.map((playlist, index) => (
        <div
          key={index}
          className="w-full max-w-[600px] bg-[#0f0f0f] text-white flex flex-col md:flex-row rounded-lg overflow-hidden shadow-lg"
         
        >
          {/* Thumbnail Section */}
          <div className="relative flex-shrink-0 w-full md:w-[250px] lg:w-[300px] " onMouseEnter={() => setHoveredIndex(index)} // Set hovered index
          onMouseLeave={() => setHoveredIndex(null)}  >
            <a
              href={playlist.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Image
                src={playlist.thumbnail}
                alt="Playlist Thumbnail"
                width={400}
                height={250}
                className="w-full h-full object-cover"
              />
              {/* Hover Overlay */}
              {hoveredIndex === index && (
                <div className="absolute inset-0 w-full bg-black/70 flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    Play All
                  </span>
                </div>
              )}
            </a>
            <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/80 px-2 py-1 rounded text-xs">
              <Volume2 className="w-3 h-3" />
              <span>Playlist</span>
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4 space-y-12">
            <div>
              <h2 className="text-lg font-medium">{playlist.title}</h2>
              <p className="text-sm text-gray-400">{playlist.channel}</p>
            </div>
            <a
              href={playlist.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2  bg-gradient-to-r from-red-700 to-pink-700 text-white rounded-lg hover:from-red-700 hover:to-pink-700 transition-colors"
            >
              Watch Playlist
            </a>
          </div>
        </div>
      ))}

      {/* Show "Show More" button if there are more than 5 playlists */}
      {playlists.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 via-pink-700  to-purple-700 hover:from-pink-600 hover:via-purple-700 hover:to-pink-600  text-white rounded-lg transition-colors"
        >
          {showAll ? "Show Less" : "Show More"}
        </button>
      )}
    </div>
  );
}