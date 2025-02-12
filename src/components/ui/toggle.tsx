"use client"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GiTomato } from "react-icons/gi"
import { IconClock } from "@tabler/icons-react"

export default function ToggleSwitch({ onToggle }) {
  const [isTimer, setIsTimer] = useState(false)

  // Call the callback whenever isTimer changes
  useEffect(() => {
    if (onToggle) {
      onToggle(isTimer)
    }
  }, [isTimer, onToggle])

  return (
    <div className="z-50">
      <motion.div
        className="flex items-center justify-center w-24 h-12 bg-white rounded-full shadow-md cursor-pointer"
        onClick={() => setIsTimer(!isTimer)}
        animate={{
          backgroundColor: isTimer ? "#E2E8F0" : "#FECACA",
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="flex items-center justify-center w-10 h-10 rounded-full shadow-sm"
          animate={{
            x: isTimer ? 24 : -24,
            backgroundColor: isTimer ? "#3B82F6" : "#EF4444",
          }}
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
        >
          {isTimer ? (
            <IconClock className="w-6 h-6 text-white" />
          ) : (
            <GiTomato className="w-6 h-6 text-white" />
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}