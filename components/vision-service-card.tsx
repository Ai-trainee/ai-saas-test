"use client"

import { motion } from "framer-motion"
import Link from "next/link"

interface VisionServiceCardProps {
  title: string
  description: string
  price: string | null
  limits: string
  icon: React.ReactNode
  route: string
}

export function VisionServiceCard({
  title,
  description,
  price,
  limits,
  icon,
  route,
}: VisionServiceCardProps) {
  return (
    <Link href={route}>
      <motion.div
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
      </motion.div>
    </Link>
  )
} 