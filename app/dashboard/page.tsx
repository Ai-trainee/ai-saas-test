"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ImagePlus, Eye, Code2 } from "lucide-react"
import { motion } from "framer-motion"
import { useSpring, animated } from "@react-spring/web"
import { supabase } from "@/lib/supabase"
import { VisionServiceCard } from "@/components/vision-service-card"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // 视差效果
  const [{ xy }, set] = useSpring(() => ({ xy: [0, 0] }))
  const trans = (x: number, y: number) => 
    `translate3d(${x / 10}px,${y / 10}px,0)`

  useEffect(() => {
    checkAuth()
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
      set({ xy: [e.clientX - window.innerWidth / 2, e.clientY - window.innerHeight / 2] })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  async function checkAuth() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      setIsAuthenticated(true)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  const visionServices = [
    {
      title: "AI图像生成",
      description: "使用先进的AI模型,将您的创意转化为独特的图像",
      price: "￥0.1/次",
      limits: "每天10次免费生成额度", 
      icon: <ImagePlus className="h-4 w-4" />,
      route: "/dashboard/image-generation",
      offset: { x: -50, y: 20 }
    },
    {
      title: "GLM-4V-Flash视觉分析",
      description: "强大的视觉分析工具,支持图像描述、场景分析、物体识别等多种功能",
      price: null,
      limits: "完全免费使用",
      icon: <Eye className="h-4 w-4" />,
      route: "/dashboard/vision-analysis",
      offset: { x: 0, y: -30 }
    },
    {
      title: "CopyCoder", 
      description: "上传网站截图,自动生成前端开发提示词,包括组件实现和结构分析",
      price: null,
      limits: "完全免费使用",
      icon: <Code2 className="h-4 w-4" />,
      route: "/dashboard/copycoder",
      offset: { x: 50, y: 40 }
    }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-black via-gray-900 to-slate-900">
      {/* 背景动态效果 */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(17,24,39,0.7),rgba(0,0,0,0.9))]" />
        <div className="absolute inset-0" style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59,130,246,0.1) 0%, transparent 70%)`
        }} />
      </div>

      <div className="container relative mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto space-y-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4 text-center"
          >
            <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              视觉服务
            </h1>
            <p className="text-xl text-gray-400">
              选择合适的视觉服务,开启您的AI之旅
            </p>
          </motion.div>

          <div className="relative h-[600px]">
            {visionServices.map((service, index) => (
              <animated.div
                key={index}
                style={{
                  transform: xy.to((x, y) => trans(x * (index + 1) * 0.1, y * (index + 1) * 0.1)),
                  position: 'absolute',
                  left: `calc(50% + ${service.offset.x}px)`,
                  top: `calc(50% + ${service.offset.y}px)`,
                  transform: `translate(-50%, -50%) translateZ(${index * 20}px)`,
                  zIndex: index
                }}
                className="w-full max-w-sm"
              >
                <VisionServiceCard {...service} />
              </animated.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}