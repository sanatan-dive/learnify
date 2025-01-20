// components/YouTubePlaylist.tsx
"use client";
import { useState } from "react";

interface YouTubePlaylistProps {
  playlists: {
    title: string;
    link: string;
  }[];
}

export default function YouTubePlaylist({ playlists }: YouTubePlaylistProps) {
  const [showAll, setShowAll] = useState(false); // State to manage expanded view

  if (!playlists || playlists.length === 0) {
    return <p className="text-white">No playlists available.</p>;
  }

  // Determine the number of playlists to display
  const displayedPlaylists = showAll ? playlists : playlists.slice(0, 5);

  return (
    <div className="space-y-4">
      {displayedPlaylists.map((playlist, index) => (
        <div key={index} className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="text-xl text-white font-semibold">{playlist.title}</h3>
          <a
            href={playlist.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            Watch Playlist
          </a>
        </div>
      ))}

      {/* Show "Show More" button if there are more than 5 playlists */}
      {playlists.length > 5 && (
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