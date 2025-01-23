"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";
import Image from "next/image";
import { useTheme } from "next-themes";
import React from "react";

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number };
    end: { lat: number; lng: number };
  }>;
  lineColor?: string;
}

export function WorldMap({ dots = [], lineColor = "#0ea5e9" }: MapProps) {
  const { theme } = useTheme();

  // Create the map
  const map = new DottedMap({ height: 100, grid: "diagonal" });

  // Generate the SVG map
  const svgMap = map.getSVG({
    radius: 0.22,
    color: theme === "dark" ? "#FFFFFF40" : "#00000040", // Adjust dot color based on theme
    shape: "circle",
    backgroundColor: theme === "dark" ? "black" : "white", // Adjust background color based on theme
  });

  // Project latitude and longitude to SVG coordinates
  const projectPoint = (lat: number, lng: number) => {
    const x = (lng + 180) * (800 / 360);
    const y = (90 - lat) * (400 / 180);
    return { x, y };
  };

  // Create a curved path between two points
  const createCurvedPath = (
    start: { x: number; y: number },
    end: { x: number; y: number }
  ) => {
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 50;
    return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
  };

  return (
    <div className="w-full aspect-[2/1] dark:bg-black bg-white rounded-lg relative">
      {/* Render the SVG map as an image */}
      <Image
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
        className="h-full w-full [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
        alt="World Map"
        height="495"
        width="1056"
        draggable={false}
      />

      {/* Overlay SVG for lines and dots */}
      <svg
        viewBox="0 0 800 400"
        className="w-full h-full absolute inset-0 pointer-events-none select-none"
      >
        {/* Render curved paths between dots */}
        {dots.map((dot, i) => {
          const startPoint = projectPoint(dot.start.lat, dot.start.lng);
          const endPoint = projectPoint(dot.end.lat, dot.end.lng);
          return (
            <motion.path
              key={`path-${i}`}
              d={createCurvedPath(startPoint, endPoint)}
              fill="none"
              stroke={lineColor}
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 * i, ease: "easeOut" }}
            />
          );
        })}

        {/* Render dots */}
        {dots.map((dot, i) => (
          <React.Fragment key={`dots-${i}`}>
            {/* Start dot */}
            <circle
              cx={projectPoint(dot.start.lat, dot.start.lng).x}
              cy={projectPoint(dot.start.lat, dot.start.lng).y}
              r="2"
              fill={lineColor}
            />
            {/* End dot */}
            <circle
              cx={projectPoint(dot.end.lat, dot.end.lng).x}
              cy={projectPoint(dot.end.lat, dot.end.lng).y}
              r="2"
              fill={lineColor}
            />
          </React.Fragment>
        ))}
      </svg>
    </div>
  );
}