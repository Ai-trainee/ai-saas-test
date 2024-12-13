"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Upload, Eye } from "lucide-react"
import { supabase } from "@/lib/supabase"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"

const analysisTemplates = {
  general_description: "对图像进行详细描述，包括主要元素、场景、颜色等。",
  weather_analysis: "根据图中的内容，推测出当天的天气",
  product_title: "给图中的物品生成一个商品标题，用于电商平台",
  visual_qa: "根据图片回答问题：[用户输入问题]",
  quality_check: "识别并描述图中的任何质量问题或异常",
  scene_analysis: "分析图中的场景氛围和环境特点",
  object_count: "统计并列出图中的主要物体数量",
  color_analysis: "分析图片的主要色调和配色方案",
  text_recognition: "识别并提取图片中的文字信息",
  style_analysis: "分析图片的风格特点和艺术元素"
}

export default function VisionAnalysisPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof analysisTemplates>("general_description")
  const [customPrompt, setCustomPrompt] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<string | null>(null)

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

  async function analyzeImage() {
    if (!imageUrl) {
      toast({
        title: "请输入图片URL",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      const prompt = selectedTemplate === "visual_qa" ? customPrompt : analysisTemplates[selectedTemplate]
      
      const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // TODO: 替换为实际的API Key
          Authorization: "Bearer 57d7bd698558bb0cdea9ad30ecff7745.ckOoHXBVmxTjhAWB",
        },
        body: JSON.stringify({
          model: "glm-4v-flash",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: prompt
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageUrl
                  }
                }
              ]
            }
          ],
          stream: false
        }),
      })

      const data = await response.json()
      if (data.error) throw new Error(data.error)

      setAnalysisResult(data.choices[0].message.content)
      toast({
        title: "分析完成",
      })
    } catch (error: any) {
      toast({
        title: "分析失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">GLM-4V-Flash视觉分析</h1>
          <p className="text-muted-foreground">
            强大的视觉分析工具,支持图像描述、场景分析、物体识别等多种功能
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>分析模式</Label>
            <Select value={selectedTemplate} onValueChange={(value: keyof typeof analysisTemplates) => setSelectedTemplate(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general_description">图像描述</SelectItem>
                <SelectItem value="weather_analysis">天气分析</SelectItem>
                <SelectItem value="product_title">商品标题</SelectItem>
                <SelectItem value="visual_qa">视觉问答</SelectItem>
                <SelectItem value="quality_check">质��检查</SelectItem>
                <SelectItem value="scene_analysis">场景分析</SelectItem>
                <SelectItem value="object_count">物体统计</SelectItem>
                <SelectItem value="color_analysis">色彩分析</SelectItem>
                <SelectItem value="text_recognition">文字识别</SelectItem>
                <SelectItem value="style_analysis">风格分析</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedTemplate === "visual_qa" && (
            <div className="space-y-2">
              <Label>您的问题</Label>
              <Textarea
                placeholder="请输入您想问的问题..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>图片URL</Label>
            <Textarea
              placeholder="请输入图片URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <Button
            onClick={analyzeImage}
            disabled={isAnalyzing}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                开始分析
              </>
            )}
          </Button>
        </div>

        <AnimatePresence>
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">分析结果</h2>
              </div>
              <div className="rounded-lg border p-4 space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden border">
                  <img
                    src={imageUrl}
                    alt="分析的图片"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{analysisResult}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 