"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const WorldResourceLoader: React.FC = () => {
  const [activePoints, setActivePoints] = useState<number[]>([]);

  // Define some random points on the map (longitude, latitude)
  const points = [
    [-30, 30],
    [10, 50],
    [100, 40],
    [-100, 40],
    [140, -30],
    [50, -10],
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePoints((prev) => {
        const newPoint = Math.floor(Math.random() * points.length);
        return [...prev, newPoint].slice(-3); // Keep only the last 3 active points
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="relative w-80 h-80 md:w-96 md:h-96">
        <svg viewBox="0 0 1000 500" className="w-full h-full">
          {/* Background Map Path */}
          <path
            d="M78,179 L85,179 L85,173 L89,173 L89,179 L97,179 L97,186 L78,186 Z M104,179 L108,179 L108,186 L104,186 Z M115,179 L119,179 L119,186 L115,186 Z M126,179 L130,179 L130,186 L126,186 Z M137,179 L141,179 L141,186 L137,186 Z M148,179 L152,179 L152,186 L148,186 Z M159,179 L163,179 L163,186 L159,186 Z M170,179 L174,179 L174,186 L170,186 Z M181,179 L185,179 L185,186 L181,186 Z M192,179 L196,179 L196,186 L192,186 Z M203,179 L207,179 L207,186 L203,186 Z M214,179 L218,179 L218,186 L214,186 Z M225,179 L229,179 L229,186 L225,186 Z M236,179 L240,179 L240,186 L236,186 Z M247,179 L251,179 L251,186 L247,186 Z M258,179 L262,179 L262,186 L258,186 Z M269,179 L273,179 L273,186 L269,186 Z M280,179 L284,179 L284,186 L280,186 Z M291,179 L295,179 L295,186 L291,186 Z M302,179 L306,179 L306,186 L302,186 Z M313,179 L317,179 L317,186 L313,186 Z M324,179 L328,179 L328,186 L324,186 Z M335,179 L339,179 L339,186 L335,186 Z M346,179 L350,179 L350,186 L346,186 Z M357,179 L361,179 L361,186 L357,186 Z M368,179 L372,179 L372,186 L368,186 Z M379,179 L383,179 L383,186 L379,186 Z M390,179 L394,179 L394,186 L390,186 Z M401,179 L405,179 L405,186 L401,186 Z M412,179 L416,179 L416,186 L412,186 Z M423,179 L427,179 L427,186 L423,186 Z M434,179 L438,179 L438,186 L434,186 Z M445,179 L449,179 L449,186 L445,186 Z M456,179 L460,179 L460,186 L456,186 Z M467,179 L471,179 L471,186 L467,186 Z M478,179 L482,179 L482,186 L478,186 Z M489,179 L493,179 L493,186 L489,186 Z M500,179 L504,179 L504,186 L500,186 Z M511,179 L515,179 L515,186 L511,186 Z M522,179 L526,179 L526,186 L522,186 Z M533,179 L537,179 L537,186 L533,186 Z M544,179 L548,179 L548,186 L544,186 Z M555,179 L559,179 L559,186 L555,186 Z M566,179 L570,179 L570,186 L566,186 Z M577,179 L581,179 L581,186 L577,186 Z M588,179 L592,179 L592,186 L588,186 Z M599,179 L603,179 L603,186 L599,186 Z M610,179 L614,179 L614,186 L610,186 Z M621,179 L625,179 L625,186 L621,186 Z M632,179 L636,179 L636,186 L632,186 Z M643,179 L647,179 L647,186 L643,186 Z M654,179 L658,179 L658,186 L654,186 Z M665,179 L669,179 L669,186 L665,186 Z M676,179 L680,179 L680,186 L676,186 Z M687,179 L691,179 L691,186 L687,186 Z M698,179 L702,179 L702,186 L698,186 Z M709,179 L713,179 L713,186 L709,186 Z M720,179 L724,179 L724,186 L720,186 Z M731,179 L735,179 L735,186 L731,186 Z M742,179 L746,179 L746,186 L742,186 Z M753,179 L757,179 L757,186 L753,186 Z M764,179 L768,179 L768,186 L764,186 Z M775,179 L779,179 L779,186 L775,186 Z M786,179 L790,179 L790,186 L786,186 Z M797,179 L801,179 L801,186 L797,186 Z M808,179 L812,179 L812,186 L808,186 Z M819,179 L823,179 L823,186 L819,186 Z M830,179 L834,179 L834,186 L830,186 Z M841,179 L845,179 L845,186 L841,186 Z M852,179 L856,179 L856,186 L852,186 Z M863,179 L867,179 L867,186 L863,186 Z M874,179 L878,179 L878,186 L874,186 Z M885,179 L889,179 L889,186 L885,186 Z M896,179 L900,179 L900,186 L896,186 Z M907,179 L911,179 L911,186 L907,186 Z M918,179 L922,179 L922,186 L918,186 Z"
            fill="#1E40AF" // Darker blue for dark theme
            className="opacity-20"
          />
          {/* Animated Points */}
          {points.map(([x, y], index) => (
            <motion.circle
              key={index}
              cx={500 + x * 2.5}
              cy={250 - y * 2.5}
              r="5"
              fill="#3B82F6" // Bright blue for points
              initial={{ scale: 0, opacity: 0 }}
              animate={activePoints.includes(index) ? { scale: 1.5, opacity: 1 } : { scale: 0, opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          ))}
        </svg>
      </div>
      {/* Loading Text */}
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-400"></div>
      <motion.div
        className="text-2xl font-bold text-gray-300 mt-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
      >
        Gathering resources all around the world
      </motion.div>
    </div>
  );
};

export default WorldResourceLoader;