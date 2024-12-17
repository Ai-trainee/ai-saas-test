"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ImagePlus, Eye, Code2 } from "lucide-react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { supabase } from "@/lib/supabase"
import { VisionServiceCard } from "@/components/vision-service-card"

// 定义切割区域的形状
const sectionShapes = [
  {
    clipPath: "polygon(0 0, 100% 0, 85% 100%, 0 85%)",
    transform: "translateZ(40px) rotateX(-5deg)",
    gradient: "from-blue-500/20 to-purple-500/20"
  },
  {
    clipPath: "polygon(15% 0, 100% 15%, 100% 100%, 0 85%)",
    transform: "translateZ(20px) rotateX(5deg)",
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    clipPath: "polygon(0 15%, 100% 0, 85% 100%, 15% 100%)",
    transform: "translateZ(60px) rotateX(-8deg)",
    gradient: "from-pink-500/20 to-blue-500/20"
  }
]

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    checkAuth()
    
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX - window.innerWidth / 2) / 50
      const y = (e.clientY - window.innerHeight / 2) / 50
      mouseX.set(x)
      mouseY.set(y)
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
      route: "/dashboard/image-generation"
    },
    {
      title: "GLM-4V-Flash视觉分析",
      description: "强大的视觉分析工具,支持图像描述、场景分析、物体识别等多种功能",
      price: null,
      limits: "完全免费使用",
      icon: <Eye className="h-4 w-4" />,
      route: "/dashboard/vision-analysis"
    },
    {
      title: "CopyCoder", 
      description: "上传网站截图,自动生成前端开发提示词,包括组件实现和结构分析",
      price: null,
      limits: "完全免费使用",
      icon: <Code2 className="h-4 w-4" />,
      route: "/dashboard/copycoder"
    }
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-black">
      {/* 背景网格 */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          transform: `translate3d(${mouseX.get()}px, ${mouseY.get()}px, 0)`
        }}
      />

      {/* 装饰线条 */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-pink-500/50 to-transparent" />
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-blue-500/50 to-transparent" />
      </div>

      <div className="container relative mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 relative"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-40 h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            <h1 className="text-6xl font-bold">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                视觉服务
              </span>
            </h1>
            <p className="mt-4 text-xl text-gray-400">
              选择合适的视觉服务,开启您的AI之旅
            </p>
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          </motion.div>

          <div className="relative perspective-2000">
            <motion.div
              className="relative grid grid-cols-1 md:grid-cols-3 gap-8"
              style={{
                transform: `rotateX(${mouseY.get()}deg) rotateY(${mouseX.get()}deg)`,
                transformStyle: 'preserve-3d'
              }}
            >
              {visionServices.map((service, index) => (
                <motion.div
                  key={index}
                  className="relative"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2, duration: 0.8 }}
                  style={{
                    clipPath: sectionShapes[index].clipPath,
                    transform: sectionShapes[index].transform
                  }}
                >
                  {/* 区域背景 */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${sectionShapes[index].gradient}`} />
                  
                  {/* 装饰边框 */}
                  <div className="absolute inset-0">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                    <div className="absolute top-0 right-0 w-0.5 h-full bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                  </div>

                  <div className="relative">
                    <VisionServiceCard {...service} />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}