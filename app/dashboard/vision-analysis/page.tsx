"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Upload, Eye, Image as ImageIcon } from "lucide-react"
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

// 预设分析模式
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
  style_analysis: "分析图片的风格特点和艺术元素",
  emotion_analysis: "分析图中人物的表情和情感状态",
  brand_recognition: "识别图中的品牌标识和商标",
  safety_check: "检查图片是否包含不当或危险内容",
  composition_analysis: "分析图片的构图和摄影技巧",
  accessibility_check: "评估图片的可访问性，为视障人士提供描述"
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
  const [streamingResult, setStreamingResult] = useState<string>("")
  const [isStreaming, setIsStreaming] = useState(false)

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

  // 处理流式响应
  async function handleStream(reader: ReadableStreamDefaultReader<Uint8Array>) {
    const decoder = new TextDecoder()
    let accumulatedResult = ""

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6)
            if (jsonStr === '[DONE]') {
              setIsStreaming(false)
              break
            }
            
            try {
              const data = JSON.parse(jsonStr)
              const content = data.choices[0].delta.content || ''
              accumulatedResult += content
              setStreamingResult(accumulatedResult)
            } catch (e) {
              console.error('解析JSON失败:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('处理流失败:', error)
      setIsStreaming(false)
    }
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
    setStreamingResult("")
    setIsStreaming(true)

    try {
      const prompt = selectedTemplate === "visual_qa" ? customPrompt : analysisTemplates[selectedTemplate]
      
      const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GLM_API_KEY}`,
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
          stream: true
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (reader) {
        await handleStream(reader)
      }

      toast({
        title: "分析完成",
      })
    } catch (error: any) {
      toast({
        title: "分析失败",
        description: error.message,
        variant: "destructive",
      })
      setIsStreaming(false)
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
                <SelectItem value="quality_check">质量检查</SelectItem>
                <SelectItem value="scene_analysis">场景分析</SelectItem>
                <SelectItem value="object_count">物体统计</SelectItem>
                <SelectItem value="color_analysis">色彩分析</SelectItem>
                <SelectItem value="text_recognition">文字识别</SelectItem>
                <SelectItem value="style_analysis">风格分析</SelectItem>
                <SelectItem value="emotion_analysis">情感分析</SelectItem>
                <SelectItem value="brand_recognition">品牌识别</SelectItem>
                <SelectItem value="safety_check">安全检查</SelectItem>
                <SelectItem value="composition_analysis">构图分析</SelectItem>
                <SelectItem value="accessibility_check">可访问性检查</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{analysisTemplates[selectedTemplate]}</p>
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
          {(streamingResult || analysisResult) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">分析结果</h2>
                {isStreaming && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </div>
                )}
              </div>
              <div className="rounded-lg border p-4 space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden border">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="分析的图片"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{streamingResult || analysisResult}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 