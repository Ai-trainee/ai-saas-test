"use client"

import { motion, useAnimation } from "framer-motion"
import { useEffect } from "react"

export function FloatingBot() {
  const controls = useAnimation()

  useEffect(() => {
    controls.start({
      y: [0, -10, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    })
  }, [controls])

  return (
    <motion.div
      className="fixed bottom-8 right-8 z-50"
      animate={controls}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <div className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-lg p-3 cursor-pointer">
        <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-white" />
        </div>
      </div>
    </motion.div>
  )
}