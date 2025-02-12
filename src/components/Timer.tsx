"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, Play, Pause, RotateCcw, Flag, BookOpen, History } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function StudyTimer() {
  const [targetTime, setTargetTime] = useState(60 * 60)
  const [activity, setActivity] = useState("")
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [laps, setLaps] = useState([])
  const [completedSessions, setCompletedSessions] = useState([])

  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setTimeElapsed((prev) => {
        if (prev + 1 >= targetTime) {
          setIsRunning(false)
          // Add completed session when timer finishes
          if (activity) {
            setCompletedSessions(prevSessions => [...prevSessions, {
              activity,
              duration: targetTime,
              completedAt: new Date().toLocaleString(),
              laps: [...laps]
            }])
          }
          return targetTime
        }
        return prev + 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, targetTime, activity, laps])

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const progress = (timeElapsed / targetTime) * 100

  const handleReset = () => {
    setIsRunning(false)
    setTimeElapsed(0)
    setLaps([])
  }

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center pt-12 px-4 text-white font-['Inter']"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <div className="w-full max-w-lg">
        <motion.h1 
          className="text-4xl font-bold text-white text-center font-['Poppins'] flex items-center justify-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <BookOpen className="mr-2" />
          Study Timer
        </motion.h1>

        <motion.div 
          className="bg-[#1e293b] backdrop-blur-md rounded-lg p-8 shadow-md border border-gray-700 mt-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Study Duration (minutes)</label>
            <input
              type="number"
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white border border-gray-600"
              placeholder="Enter study time"
              onChange={(e) => setTargetTime(Math.max(1, Number.parseInt(e.target.value || "1")) * 60)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Study Activity</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white border border-gray-600"
              placeholder="What will you study?"
              onChange={(e) => setActivity(e.target.value)}
            />
          </div>

          <div className="text-center mb-8">
            <p className="text-xl text-gray-300 mb-4">{activity ? `Studying: ${activity}` : "Set an activity"}</p>
            <motion.div 
              className="text-7xl font-bold text-center mb-8 font-['JetBrains Mono']"
              key={timeElapsed} 
              initial={{ scale: 0.99 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              {formatTime(timeElapsed)}
            </motion.div>
          </div>

          <div className="flex justify-center gap-4 mb-8">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                onClick={() => setIsRunning(!isRunning)}
                className="relative bg-teal-500 border-black border-t-[2px] border-l-[2px] border-b-[6px] border-r-[6px] 
                         text-white px-8 py-2 hover:bg-teal-600 active:translate-y-[2px] active:translate-x-[2px] 
                         transition-all before:absolute before:top-[4px] before:left-[0px] 
                         before:right-[-4px] before:bottom-[-6px] 
                         before:bg-black before:-z-10 before:rounded-md"
              >
                {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                {isRunning ? "Pause" : "Start"}
              </Button>
            </motion.button>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button 
                onClick={handleReset}
                variant="outline" 
                className="relative bg-gray-200 border-black text-black border-t-[2px] border-l-[2px] border-b-[6px] border-r-[6px] 
                         px-8 py-2 hover:text-white hover:bg-gray-800 active:translate-y-[2px] active:translate-x-[2px] 
                         transition-all before:absolute before:top-[4px] before:left-[0px] 
                         before:right-[-4px] before:bottom-[-6px] 
                         before:bg-black before:-z-10 before:rounded-md"
              >
                <RotateCcw className="mr-2" />
                Reset
              </Button>
            </motion.button>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                onClick={() => setLaps([...laps, timeElapsed])}
                className="relative bg-teal-500 border-black border-t-[2px] border-l-[2px] border-b-[6px] border-r-[6px] 
                         text-white px-8 py-2 hover:bg-teal-600 active:translate-y-[2px] active:translate-x-[2px] 
                         transition-all before:absolute before:top-[4px] before:left-[0px] 
                         before:right-[-4px] before:bottom-[-6px] 
                         before:bg-black before:-z-10 before:rounded-md"
              >
                <Flag className="mr-2" />
                Lap
              </Button>
            </motion.button>
          </div>

          {laps.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl text-gray-300 mb-4">Laps:</h3>
              <div className="max-h-40 overflow-y-auto">
                <ul className="space-y-2">
                  {laps.map((lap, index) => (
                    <li key={index} className="bg-gray-800 rounded-lg px-4 py-2 border border-gray-700">
                      Lap {index + 1}: {formatTime(lap)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {completedSessions.length > 0 && (
            <motion.div 
              className="mt-8 border-t border-gray-700 pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-xl text-gray-300 mb-4 flex items-center">
                <History className="mr-2" />
                Completed Sessions
              </h3>
              <div className="max-h-60 overflow-y-auto">
                <ul className="space-y-4">
                  {completedSessions.map((session, index) => (
                    <li key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-teal-400">{session.activity}</span>
                        <span className="text-sm text-gray-400">{session.completedAt}</span>
                      </div>
                      <div className="text-gray-300">Duration: {formatTime(session.duration)}</div>
                      {session.laps.length > 0 && (
                        <div className="mt-2 text-sm text-gray-400">
                          <div>Laps: {session.laps.length}</div>
                          <div className="text-xs">Last lap: {formatTime(session.laps[session.laps.length - 1])}</div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}