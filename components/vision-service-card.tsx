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
    </defs>
  </svg>
)

// 能量边缘路径
const portalPaths = [
  "M0,0 C25,-10 75,-10 100,0 C75,10 25,10 0,0",
  "M0,0 C30,-15 70,-15 100,0 C70,15 30,15 0,0",
  "M0,0 C20,-8 80,-8 100,0 C80,8 20,8 0,0"
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
    }, 1000)
  }

  return (
    <>
      <SVGFilters />
      <Link href={route} onClick={handleClick}>
        <motion.div
          ref={cardRef}
          className="relative group"
          whileHover={{ scale: 1.02 }}
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
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [1, 2, 4, 8],
                    opacity: [0, 0.5, 0.8, 0]
                  }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 1 }}
                >
                  {portalPaths.map((path, index) => (
                    <motion.div
                      key={index}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        filter: "url(#portal-glow)"
                      }}
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.1, 1]
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
                          stroke="url(#portal-gradient)"
                          strokeWidth="0.5"
                          className="text-purple-500"
                        />
                      </svg>
                    </motion.div>
                  ))}
                </motion.div>

                {/* 空间碎片 */}
                <motion.div
                  className="absolute inset-0 z-40"
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 2, 4] }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  {Array.from({ length: 6 }).map((_, index) => (
                    <motion.div
                      key={index}
                      className="absolute inset-0"
                      style={{
                        background: `linear-gradient(${index * 60}deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2))`,
                        clipPath: `polygon(${50 + Math.cos(index) * 30}% ${50 + Math.sin(index) * 30}%, ${50 + Math.cos(index + 2) * 30}% ${50 + Math.sin(index + 2) * 30}%, ${50 + Math.cos(index + 4) * 30}% ${50 + Math.sin(index + 4) * 30}%)`,
                        filter: "url(#noise)"
                      }}
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatType: "reverse",
                        delay: index * 0.1
                      }}
                    />
                  ))}
                </motion.div>

                {/* 深邃空间背景 */}
                <motion.div
                  className="absolute inset-0 z-30 bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0.8] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                />
              </>
            )}
          </AnimatePresence>
        </motion.div>
      </Link>
    </>
  )
} 