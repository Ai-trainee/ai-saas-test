"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, ImagePlus, Eye, Code } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { VisionServiceCard } from "@/components/vision-service-card"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
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
      title: "开发提示词生成",
      description: "基于网站截图智能生成开发提示词,包含项目框架规范和页面功能布局要求",
      price: null,
      limits: "完全免费使用",
      icon: <Code className="h-4 w-4" />,
      route: "/dashboard/prompt-generation"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">视觉服务</h1>
          <p className="text-muted-foreground">
            选择合适的视觉服务,开启您的AI之旅
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visionServices.map((service, index) => (
            <VisionServiceCard
              key={index}
              {...service}
            />
          ))}
        </div>
      </div>
    </div>
  )
}