"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

// SVG 滤镜定义
const SVGFilters = () => (
  <svg className="absolute -z-10" width="0" height="0">
    <defs>
      <filter id="portal-glow">
        <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
        <feColorMatrix
          values="
            1 0 0 0 0.5
            0 1 0 0 0.2
            0 0 1 0 1
            0 0 0 20 -10
          "
        />
        <feComposite operator="in" in2="SourceGraphic"/>
        <feBlend in2="SourceGraphic" mode="screen"/>
      </filter>
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="5" seed="1" />
        <feDisplacementMap in="SourceGraphic" scale="20" />
      </filter>
      <filter id="distortion">
        <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="3" seed="2" />
        <feDisplacementMap in="SourceGraphic" scale="30" />
        <feGaussianBlur stdDeviation="1" />
      </filter>
      <linearGradient id="portal-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#9333EA">
          <animate
            attributeName="offset"
            values="0;0.5;0"
            dur="3s"
            repeatCount="indefinite"
          />
        </stop>
        <stop offset="50%" stopColor="#3B82F6">
          <animate
            attributeName="offset"
            values="0.5;1;0.5"
            dur="3s"
            repeatCount="indefinite"
          />
        </stop>
        <stop offset="100%" stopColor="#9333EA">
          <animate
            attributeName="offset"
            values="1;1.5;1"
            dur="3s"
            repeatCount="indefinite"
          />
        </stop>
      </linearGradient>
      <radialGradient id="particle-gradient">
        <stop offset="0%" stopColor="white" />
        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
      </radialGradient>
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
            className="fixed inset-0 z-50 pointer-events-none perspective-1000"
            style={{
              perspective: "1000px",
              transformStyle: "preserve-3d"
            }}
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
                transform: "translate(-50%, -50%)",
                transformStyle: "preserve-3d"
              }}
              initial={{ scale: 0, rotateX: 0, rotateY: 0, z: -1000 }}
              animate={{ 
                scale: [1, 2, 4],
                rotateX: [0, 45, -45],
                rotateY: [0, -60, 60],
                z: [-1000, 0, 500]
              }}
              exit={{ scale: 0, z: -1000 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            >
              {/* 空间裂缝 - 使用不规则的SVG路径 */}
              {Array.from({ length: 5 }).map((_, index) => (
                <motion.div
                  key={index}
                  className="absolute inset-0"
                  style={{
                    filter: "url(#portal-glow)",
                    transform: `rotate(${index * 72}deg) translateZ(${index * 20}px)`,
                    transformStyle: "preserve-3d"
                  }}
                  animate={{
                    rotate: [index * 72, index * 72 + 360],
                    scale: [1, 1.2, 1],
                    filter: [
                      "url(#portal-glow) brightness(1)",
                      "url(#portal-glow) brightness(1.5)",
                      "url(#portal-glow) brightness(1)"
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: index * 0.2
                  }}
                >
                  <svg
                    className="w-60 h-60"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d={`M50,${20 + index * 5} 
                         C${60 + index * 2},${30 + index * 2} 
                          ${80 - index * 3},${50 + index * 3} 
                          50,${80 - index * 2} 
                         C${20 + index * 3},${50 - index * 2} 
                          ${40 - index * 2},${30 - index * 3} 
                          50,${20 + index * 5}`}
                      fill="none"
                      stroke="url(#portal-gradient)"
                      strokeWidth="0.8"
                      style={{
                        filter: "url(#distortion)"
                      }}
                    />
                  </svg>
                </motion.div>
              ))}

              {/* 粒子效果 */}
              <motion.div className="absolute inset-0">
                {Array.from({ length: 20 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-white/50"
                    style={{
                      left: `${50 + (Math.random() - 0.5) * 100}%`,
                      top: `${50 + (Math.random() - 0.5) * 100}%`,
                      background: "url(#particle-gradient)"
                    }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: [0, (Math.random() - 0.5) * 200],
                      y: [0, (Math.random() - 0.5) * 200],
                      z: [0, Math.random() * 300]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>

            {/* 空间碎片 - 增加3D效果 */}
            <motion.div
              className="absolute inset-0"
              style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {Array.from({ length: 12 }).map((_, index) => (
                <motion.div
                  key={index}
                  className="absolute"
                  style={{
                    left: `${portalPosition.x}%`,
                    top: `${portalPosition.y}%`,
                    width: "300px",
                    height: "300px",
                    background: `linear-gradient(${index * 30}deg, 
                      rgba(147, 51, 234, 0.3), 
                      rgba(59, 130, 246, 0.3))`,
                    transform: `
                      rotate3d(
                        ${Math.cos(index)},
                        ${Math.sin(index)},
                        1,
                        ${index * 30}deg
                      ) 
                      translate3d(-50%, -50%, ${index * 20}px)
                    `,
                    transformStyle: "preserve-3d",
                    clipPath: `polygon(
                      ${50 + Math.cos(index) * 30}% ${50 + Math.sin(index) * 30}%,
                      ${50 + Math.cos(index + 2) * 40}% ${50 + Math.sin(index + 2) * 40}%,
                      ${50 + Math.cos(index + 4) * 30}% ${50 + Math.sin(index + 4) * 30}%
                    )`,
                    filter: "url(#noise) url(#distortion)"
                  }}
                  animate={{
                    transform: [
                      `rotate3d(
                        ${Math.cos(index)},
                        ${Math.sin(index)},
                        1,
                        ${index * 30}deg
                      ) translate3d(-50%, -50%, ${index * 20}px)`,
                      `rotate3d(
                        ${Math.cos(index + 2)},
                        ${Math.sin(index + 2)},
                        1,
                        ${index * 30 + 360}deg
                      ) translate3d(-50%, -50%, ${index * 40}px)`,
                      `rotate3d(
                        ${Math.cos(index)},
                        ${Math.sin(index)},
                        1,
                        ${index * 30}deg
                      ) translate3d(-50%, -50%, ${index * 20}px)`
                    ],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: index * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>

            {/* 深邃空间背景 - 添加扭曲效果 */}
            <motion.div
              className="absolute inset-0 bg-gradient-radial from-purple-900/50 via-blue-900/30 to-transparent"
              style={{
                backdropFilter: "blur(24px)",
                filter: "url(#distortion)"
              }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.7, 0.9],
                scale: [0.8, 1.1, 1]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
} 