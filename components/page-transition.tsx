"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

// SVG 滤镜定义
const SVGFilters = () => (
  <svg className="absolute -z-10" width="0" height="0">
    <defs>
      <filter id="portal-glow">
        <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
        <feColorMatrix
          values="
            1 0 0 0 0
            0 1 0 0 0.5
            0 0 1 0 1
            0 0 0 15 -7
          "
        />
      </filter>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="3" />
        <feDisplacementMap in="SourceGraphic" scale="10" />
      </filter>
      <linearGradient id="portal-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#8B5CF6" />
        <stop offset="50%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>
  </svg>
)

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [portalPosition, setPortalPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setIsTransitioning(true)
    const timeout = setTimeout(() => {
      setIsTransitioning(false)
    }, 1000)
    return () => clearTimeout(timeout)
  }, [pathname])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPortalPosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <>
      <SVGFilters />
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          className="min-h-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="fixed inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* 能量光圈 */}
            <motion.div
              className="absolute"
              style={{
                left: `${portalPosition.x}%`,
                top: `${portalPosition.y}%`,
                transform: "translate(-50%, -50%)"
              }}
              initial={{ scale: 0 }}
              animate={{ 
                scale: [1, 2, 4, 8],
                rotate: [0, 180, 360]
              }}
              exit={{ scale: 0 }}
              transition={{ duration: 1 }}
            >
              {Array.from({ length: 3 }).map((_, index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0"
                  style={{
                    filter: "url(#portal-glow)",
                    transform: `rotate(${index * 120}deg)`
                  }}
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: index * 0.2
                  }}
                >
                  <svg
                    className="w-40 h-40"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M50,0 C60,20 90,50 50,100 C10,50 40,20 50,0"
                      fill="none"
                      stroke="url(#portal-gradient)"
                      strokeWidth="0.5"
                    />
                  </svg>
                </motion.div>
              ))}
            </motion.div>

            {/* 空间碎片 */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {Array.from({ length: 8 }).map((_, index) => (
                <motion.div
                  key={index}
                  className="absolute"
                  style={{
                    left: `${portalPosition.x}%`,
                    top: `${portalPosition.y}%`,
                    width: "200px",
                    height: "200px",
                    background: `linear-gradient(${index * 45}deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))`,
                    transform: `rotate(${index * 45}deg) translate(-50%, -50%)`,
                    transformOrigin: "0 0",
                    clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                    filter: "url(#noise)"
                  }}
                  animate={{
                    rotate: [index * 45, index * 45 + 360],
                    scale: [1, 2, 1],
                    opacity: [0.2, 0.4, 0.2]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: index * 0.1
                  }}
                />
              ))}
            </motion.div>

            {/* 深邃空间背景 */}
            <motion.div
              className="absolute inset-0 bg-gradient-radial from-purple-900/50 via-blue-900/30 to-transparent backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0.8] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 