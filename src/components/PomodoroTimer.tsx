"use client"

import { useState, useEffect } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function PomodoroTimer() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(45 * 60);
  const [focusDuration, setFocusDuration] = useState(45);
  const [breakDuration, setBreakDuration] = useState(5);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, time]);

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleStart = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(focusDuration * 60);
  };

  const focusOptions = [15, 25, 45, 50, 60, 90];
  const breakOptions = [5, 10, 15, 20, 30];

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center pt-12 px-4 text-white font-['Inter']"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-lg">
        <motion.h1 
          className="text-4xl font-bold text-white text-center font-['Poppins']"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          Pomodoro Timer
        </motion.h1>

        <motion.div 
          className="bg-[#1e293b] backdrop-blur-md rounded-lg p-8 shadow-md border border-gray-700 mt-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl text-center mb-6 text-gray-300 font-['Poppins']">Focus Time</h2>

          <motion.div 
            className="text-7xl font-bold text-center mb-8 font-['JetBrains Mono']"
            key={time} 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {formatTime(time)}
          </motion.div>

          <div className="flex justify-center gap-4 mb-8">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button
                onClick={handleStart}
                className="relative bg-slate-500 border-black border-t-[2px] border-l-[2px] border-b-[6px] border-r-[6px] 
                         text-white px-8 py-2 hover:bg-teal-600 active:translate-y-[2px] active:translate-x-[2px] 
                         transition-all before:absolute before:top-[4px] before:left-[0px] 
                         before:right-[-4px] before:bottom-[-6px] 
                         before:bg-black before:-z-10 before:rounded-md"
              >
                {isRunning ? "Pause" : "Start"}
              </Button>
            </motion.button>

            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Button 
                onClick={handleReset} 
                variant="outline" 
                className="relative bg-gray-200 border-black text-black border-t-[2px] border-l-[2px] border-b-[6px] border-r-[6px] 
                         px-8 py-2 hover:text-white hover:bg-gray-800 active:translate-y-[2px] active:translate-x-[2px] 
                         transition-all before:absolute before:top-[4px] before:left-[0px] 
                         before:right-[-4px] before:bottom-[-6px] 
                         before:bg-black before:-z-10 before:rounded-md"
              >
                Reset
              </Button>
            </motion.button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Focus Duration (minutes)</label>
              <Select
                value={focusDuration.toString()}
                onValueChange={(value) => {
                  setFocusDuration(Number(value));
                  if (!isRunning) {
                    setTime(Number(value) * 60);
                  }
                }}
              >
                <SelectTrigger className="w-full bg-gray-800 text-white border border-gray-600">
                  <SelectValue placeholder="Select focus duration" />
                </SelectTrigger>
                <SelectContent>
                  {focusOptions.map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Break Duration (minutes)</label>
              <Select
                value={breakDuration.toString()}
                onValueChange={(value) => setBreakDuration(Number(value))}
              >
                <SelectTrigger className="w-full bg-gray-800 text-white border border-gray-600">
                  <SelectValue placeholder="Select break duration" />
                </SelectTrigger>
                <SelectContent>
                  {breakOptions.map((value) => (
                    <SelectItem key={value} value={value.toString()}>
                      {value} minutes
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}