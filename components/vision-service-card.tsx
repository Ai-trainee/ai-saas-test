"use client"

import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"

interface VisionServiceCardProps {
  title: string
  description: string
  price: string | null
  limits: string
  icon: React.ReactNode
  route: string
}

// SVG 滤镜定义
const SVGFilters = () => (
  <svg className="absolute -z-10" width="0" height="0">
    <defs>
      {/* 增强的发光效果 */}
      <filter id="card-portal-glow">
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

      {/* 增强的噪声效果 */}
      <filter id="card-noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="5" seed="1" />
        <feDisplacementMap in="SourceGraphic" scale="20" />
      </filter>

      {/* 空间扭曲效果 */}
      <filter id="card-distortion">
        <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="3" seed="2" />
        <feDisplacementMap in="SourceGraphic" scale="30" />
        <feGaussianBlur stdDeviation="1" />
      </filter>

      {/* 能量流动渐变 */}
      <linearGradient id="card-portal-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
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
    </defs>
  </svg>
)

// 不规则的裂缝路径
const portalPaths = [
  `M50,20 
   C60,30 80,50 50,80 
   C20,50 40,30 50,20`,
  `M50,25 
   C65,35 75,55 50,75 
   C25,55 35,35 50,25`,
  `M50,30 
   C70,40 70,60 50,70 
   C30,60 30,40 50,30`
]

export function VisionServiceCard({
  title,
  description,
  price,
  limits,
  icon,
  route,
}: VisionServiceCardProps) {
  const [isPortalOpen, setIsPortalOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsPortalOpen(true)
    // 延迟导航以显示动画
    setTimeout(() => {
      router.push(route)
    }, 1500)
  }

  return (
    <>
      <SVGFilters />
      <Link href={route} onClick={handleClick}>
        <motion.div
          ref={cardRef}
          className="relative group perspective-1000"
          style={{
            transformStyle: "preserve-3d"
          }}
          whileHover={{ 
            scale: 1.02,
            rotateX: [-2, 2],
            rotateY: [-2, 2],
          }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="relative flex flex-col p-6 bg-black/30 rounded-lg border border-white/10 shadow-2xl overflow-hidden backdrop-blur-2xl">
            {/* 背景光效 */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
            
            {/* 高光效果 */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"
              style={{
                background: `
                  radial-gradient(
                    circle at 30% 20%,
                    rgba(255,255,255,0.2) 0%,
                    transparent 60%
                  )
                `
              }}
            />
            
            <div className="relative space-y-4">
              {/* 图标和标题 */}
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-md bg-white/10 backdrop-blur-sm">
                  {icon}
                </div>
                <h3 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  {title}
                </h3>
              </div>

              {/* 描述 */}
              <p className="text-sm text-gray-400 leading-relaxed">
                {description}
              </p>

              {/* 价格和限制 */}
              <div className="pt-4 space-y-2 border-t border-white/10">
                {price && (
                  <div className="text-sm font-medium text-blue-400">
                    {price}
                  </div>
                )}
                <div className="text-xs text-gray-500">
                  {limits}
                </div>
              </div>
            </div>

            {/* 交互提示 */}
            <div className="absolute bottom-4 right-4 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              <div className="text-xs text-blue-400 flex items-center space-x-1">
                <span>开始使用</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* 空间撕裂特效 */}
          <AnimatePresence>
            {isPortalOpen && (
              <>
                {/* 能量光圈 */}
                <motion.div
                  className="absolute inset-0 z-50"
                  style={{
                    transformStyle: "preserve-3d",
                    perspective: "1000px"
                  }}
                  initial={{ scale: 0, opacity: 0, rotateX: 0, rotateY: 0, z: -100 }}
                  animate={{ 
                    scale: [1, 2, 4],
                    opacity: [0, 0.8, 0],
                    rotateX: [0, 45, -45],
                    rotateY: [0, -60, 60],
                    z: [-100, 0, 100]
                  }}
                  exit={{ scale: 0, opacity: 0, z: -100 }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                >
                  {portalPaths.map((path, index) => (
                    <motion.div
                      key={index}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        filter: "url(#card-portal-glow)",
                        transform: `translateZ(${index * 10}px)`,
                        transformStyle: "preserve-3d"
                      }}
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1],
                        filter: [
                          "url(#card-portal-glow) brightness(1)",
                          "url(#card-portal-glow) brightness(1.5)",
                          "url(#card-portal-glow) brightness(1)"
                        ]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: index * 0.2
                      }}
                    >
                      <svg
                        className="w-full h-full absolute"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        <path
                          d={path}
                          fill="none"
                          stroke="url(#card-portal-gradient)"
                          strokeWidth="0.8"
                          style={{
                            filter: "url(#card-distortion)"
                          }}
                        />
                      </svg>
                    </motion.div>
                  ))}

                  {/* 粒子效果 */}
                  <motion.div className="absolute inset-0">
                    {Array.from({ length: 15 }).map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full bg-white/50"
                        style={{
                          left: `${50 + (Math.random() - 0.5) * 100}%`,
                          top: `${50 + (Math.random() - 0.5) * 100}%`,
                        }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                          x: [0, (Math.random() - 0.5) * 100],
                          y: [0, (Math.random() - 0.5) * 100],
                          z: [0, Math.random() * 100]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </motion.div>
                </motion.div>

                {/* 空间碎片 */}
                <motion.div
                  className="absolute inset-0 z-40"
                  style={{
                    perspective: "1000px",
                    transformStyle: "preserve-3d"
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 2, 4] }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  {Array.from({ length: 8 }).map((_, index) => (
                    <motion.div
                      key={index}
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(${index * 45}deg, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.2))`,
                        clipPath: `polygon(
                          ${50 + Math.cos(index) * 30}% ${50 + Math.sin(index) * 30}%,
                          ${50 + Math.cos(index + 2) * 40}% ${50 + Math.sin(index + 2) * 40}%,
                          ${50 + Math.cos(index + 4) * 30}% ${50 + Math.sin(index + 4) * 30}%
                        )`,
                        filter: "url(#card-noise) url(#card-distortion)",
                        transform: `
                          rotate3d(
                            ${Math.cos(index)},
                            ${Math.sin(index)},
                            1,
                            ${index * 45}deg
                          ) 
                          translateZ(${index * 10}px)
                        `,
                        transformStyle: "preserve-3d"
                      }}
                      animate={{
                        transform: [
                          `rotate3d(
                            ${Math.cos(index)},
                            ${Math.sin(index)},
                            1,
                            ${index * 45}deg
                          ) translateZ(${index * 10}px)`,
                          `rotate3d(
                            ${Math.cos(index + 2)},
                            ${Math.sin(index + 2)},
                            1,
                            ${index * 45 + 360}deg
                          ) translateZ(${index * 20}px)`,
                          `rotate3d(
                            ${Math.cos(index)},
                            ${Math.sin(index)},
                            1,
                            ${index * 45}deg
                          ) translateZ(${index * 10}px)`
                        ],
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
                  className="absolute inset-0 z-30 bg-gradient-to-r from-purple-900/50 to-blue-900/50"
                  style={{
                    backdropFilter: "blur(24px)",
                    filter: "url(#card-distortion)"
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 0.7, 0.9],
                    scale: [0.8, 1.1, 1]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                />
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </Link>
    </>
  )
} 