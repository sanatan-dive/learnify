"use client"
import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GiTomato } from "react-icons/gi"
import { IconClock } from "@tabler/icons-react"

interface ToggleSwitchProps {
  onToggle: (timerMode: boolean) => void
}

export default function ToggleSwitch({ onToggle: onToggle }: ToggleSwitchProps) {
  const [isTimer, setIsTimer] = useState(false)

  useEffect(() => {
    if (onToggle) {
      onToggle(isTimer)
    }
  }, [isTimer, onToggle])

  return (
    <div className="z-50">
      <motion.div
        className="flex items-center justify-center w-24 h-12 bg-gray-800 rounded-full shadow-md cursor-pointer"
        onClick={() => setIsTimer(!isTimer)}
        animate={{
          backgroundColor: isTimer ? "#1F2937" : "#4B5563",
        }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="flex items-center justify-center w-10 h-10 rounded-full shadow-sm"
          animate={{
            x: isTimer ? 24 : -24,
            backgroundColor: isTimer ? "#2563EB" : "#DC2626",
          }}
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
        >
          {isTimer ? (
            <IconClock className="w-6 h-6 text-gray-100" />
          ) : (
            <GiTomato className="w-6 h-6 text-gray-100" />
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}
