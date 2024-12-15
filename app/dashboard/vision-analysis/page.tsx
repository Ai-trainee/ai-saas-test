"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import {
  Loader2, Image as ImageIcon, Link, Mic, Send,
  Camera, FileText, Brain, MessageSquare,
  Palette, Search, Brush, PenTool, Upload,
  Plus, X, User, Bot, ArrowLeft, Home
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { db, ChatHistory } from "@/lib/indexed-db"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useRouter } from "next/navigation"
import "./styles.css"
import { StarryBackground } from "@/components/ui/starry-background"

interface Message {
  role: 'user' | 'assistant'
  content: Array<{
    type: 'text' | 'image_url'
    text?: string
    image_url?: {
      url: string
    }
  }>
}

export default function VisionAnalysisPage() {
  const router = useRouter()
  const [imageUrl, setImageUrl] = useState("")
  const [inputText, setInputText] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showImageUrlInput, setShowImageUrlInput] = useState(false)
  const [selectedFunction, setSelectedFunction] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [base64Image, setBase64Image] = useState<string>("")
  const [isFirstMessage, setIsFirstMessage] = useState(true)

  const functionButtons = [
    {
      icon: <Camera className="w-4 h-4" />,
      label: "创建图片",
      description: "AI 生成高质量图片",
      color: "text-emerald-400",
      id: "create-image",
      prompt: "请为我创建一张图片，要求："
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: "总结文本",
      description: "智能提取文本要点",
      color: "text-blue-400",
      id: "summarize",
      prompt: "请帮我总结以下内容的要点："
    },
    {
      icon: <Brain className="w-4 h-4" />,
      label: "图像分析",
      description: "深度解析图片内容",
      color: "text-purple-400",
      id: "analyze-image",
      prompt: "请分析这张图片中的内容和细节："
    },
    {
      icon: <MessageSquare className="w-4 h-4" />,
      label: "教育学习",
      description: "知识点讲解与答疑",
      color: "text-pink-400",
      id: "education",
      prompt: "请解释这个知识点："
    },
    {
      icon: <Palette className="w-4 h-4" />,
      label: "美容建议",
      description: "个性化护肤方案",
      color: "text-yellow-400",
      id: "beauty",
      prompt: "请根据图片分析皮肤状况并给出护理建议："
    },
    {
      icon: <Search className="w-4 h-4" />,
      label: "质量检测",
      description: "产品质量问题检查",
      color: "text-red-400",
      id: "quality",
      prompt: "请检测图片中产品的质量问题："
    },
    {
      icon: <Brush className="w-4 h-4" />,
      label: "商品描述",
      description: "生成营销文案",
      color: "text-indigo-400",
      id: "product",
      prompt: "请为这个商品生成一个吸引人的描述："
    },
    {
      icon: <PenTool className="w-4 h-4" />,
      label: "数据标注",
      description: "智能识别关键信息",
      color: "text-green-400",
      id: "annotation",
      prompt: "请标注图片中的关键信息："
    }
  ]

  const handleImageUpload = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "图片过大",
        description: "请上传5MB以内的图片",
        variant: "destructive",
      })
      return
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast({
        title: "格式不支持",
        description: "仅支持JPG、PNG格式图片",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const base64 = e.target?.result as string
      setBase64Image(base64)
      setImageUrl(base64)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageUpload(file)
    }
  }, [handleImageUpload])

  const handleFunctionClick = (btn: typeof functionButtons[0]) => {
    setSelectedFunction(btn.id)
    setInputText(btn.prompt)
  }

  const handleNewChat = useCallback(() => {
    setMessages([])
    setInputText('')
    setImageUrl('')
    setBase64Image('')
    setSelectedFunction(null)
    setIsFirstMessage(true)
  }, [])

  const handleSendMessage = async () => {
    if (!inputText && !imageUrl) return
    setIsProcessing(true)
    setIsFirstMessage(false)

    try {
      // 构建用户消息
      const newUserMessage: Message = {
        role: 'user',
        content: []
      }

      // 如果有文本,添加文本内容
      if (inputText) {
        newUserMessage.content.push({
          type: 'text',
          text: inputText
        })
      }

      // 如果有图片,添加图片
      if (imageUrl) {
        newUserMessage.content.push({
          type: 'image_url',
          image_url: {
            url: imageUrl
          }
        })
      }

      // 更新消息列表
      setMessages(prev => [...prev, newUserMessage])

      // 构建API请求消息
      const apiMessages = messages.length === 0
        ? [newUserMessage]
        : [...messages, newUserMessage]

      // 发送API请求
      const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: "glm-4v-flash",
          messages: apiMessages,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // 处理API响应
      if (data.choices?.[0]?.message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: [{
            type: 'text',
            text: data.choices[0].message.content
          }]
        }
        setMessages(prev => [...prev, assistantMessage])
      }

      // 保存聊天历史
      const history: ChatHistory = {
        timestamp: Date.now(),
        title: inputText || '新对话',
        messages: [...messages, newUserMessage],
        imageUrl: imageUrl,
        lastMessage: inputText
      }
      await db.saveChatHistory(history)

    } catch (error: any) {
      toast({
        title: "发送失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setInputText('')
      setImageUrl('')
      setBase64Image('')
      setSelectedFunction(null)
    }
  }

  // 添加自动滚动效果
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <StarryBackground />

      {/* 返回按钮 */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-gray-200 backdrop-blur-md bg-black/20"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回仪表盘
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-gray-200 backdrop-blur-md bg-black/20"
          onClick={() => router.push('/')}
        >
          <Home className="w-4 h-4 mr-1" />
          返回主页
        </Button>
      </div>

      {/* 主要内容区域 */}
      <div className="flex h-screen pt-16">
        {/* 功能选择区 */}
        <div className="relative w-[320px] border-r border-gray-800/50">
          <div className="h-full overflow-y-auto px-4 py-6 space-y-4">
            {functionButtons.map((btn, index) => (
              <motion.button
                key={btn.id}
                className={`function-card w-full text-left p-4 rounded-xl ${
                  selectedFunction === btn.id ? 'active' : ''
                }`}
                onClick={() => handleFunctionClick(btn)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start gap-4">
                  <div className="icon-container p-3 rounded-lg bg-gray-800/50">
                    <span className={selectedFunction === btn.id ? 'text-purple-400' : btn.color}>
                      {btn.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-200">{btn.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{btn.description}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* 对话区域 */}
        <div className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 px-4">
            <div className="max-w-3xl mx-auto space-y-6 py-4">
              {isFirstMessage && messages.length === 0 && (
                <motion.div 
                  className="welcome-container flex flex-col items-center justify-center py-20 space-y-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="relative">
                    <Bot className="w-20 h-20 text-purple-400 opacity-80" />
                    <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                  </div>
                  <div className="text-center space-y-2 backdrop-blur-sm bg-black/20 p-6 rounded-2xl">
                    <h3 className="text-2xl font-medium text-gray-200">
                      欢迎使用 AI 视觉助手
                    </h3>
                    <p className="text-sm text-gray-400 max-w-md">
                      从左侧选择一个功能开始对话，或者直接输入您的问题。支持文字输入和图片上传。
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8 w-full max-w-lg">
                    {functionButtons.slice(0, 4).map((btn) => (
                      <motion.button
                        key={btn.id}
                        className="function-card flex items-center gap-3 p-4 rounded-xl"
                        onClick={() => handleFunctionClick(btn)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className={`${btn.color} p-2 rounded-lg bg-gray-800/50`}>
                          {btn.icon}
                        </span>
                        <span className="text-sm text-gray-200">{btn.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
              
              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-start gap-3 ${
                      message.role === 'assistant' ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-purple-500/20">
                          <Bot className="w-4 h-4 text-purple-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={`
                        chat-message max-w-[80%] rounded-xl p-4
                        ${message.role === 'assistant'
                          ? 'bg-gray-800/40'
                          : 'bg-purple-500/20'
                        }
                      `}
                    >
                      {message.content.map((content, contentIndex) => (
                        <div key={contentIndex} className="space-y-2">
                          {content.type === 'image_url' && (
                            <img
                              src={content.image_url?.url}
                              alt="Uploaded content"
                              className="max-h-[200px] w-auto object-contain rounded-lg"
                            />
                          )}
                          {content.type === 'text' && (
                            <p className="text-sm leading-relaxed text-gray-200">
                              {content.text}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-purple-500/20">
                          <User className="w-4 h-4 text-purple-400" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* 输入区域 */}
          <div className="border-t border-gray-800/50 backdrop-blur-xl">
            <div className="max-w-3xl mx-auto p-4">
              <div className="relative">
                {/* 图片预览 */}
                {imageUrl && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute -top-20 left-0 right-0 h-16 function-card rounded-xl p-2 flex items-center gap-2"
                  >
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="h-full w-auto object-contain rounded-lg"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-700/50"
                      onClick={() => {
                        setImageUrl('')
                        setBase64Image('')
                      }}
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </Button>
                  </motion.div>
                )}

                {/* 输入框 */}
                <div
                  className={`
                    input-container relative rounded-xl
                    ${isDragging ? 'ring-2 ring-purple-500' : ''}
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={selectedFunction 
                      ? functionButtons.find(b => b.id === selectedFunction)?.prompt
                      : "输入问题，或者拖拽图片到这里..."
                    }
                    className="pr-24 min-h-[56px] max-h-32 bg-transparent border-0 
                      text-gray-200 placeholder:text-gray-500 resize-none
                      focus:ring-0"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-gray-700/50"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="h-4 w-4 text-gray-400" />
                    </Button>
                    <Popover open={showImageUrlInput} onOpenChange={setShowImageUrlInput}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-gray-700/50"
                        >
                          <Link className="h-4 w-4 text-gray-400" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4 function-card border-none">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm text-gray-200">输入图片URL</h4>
                          <Textarea
                            placeholder="https://example.com/image.jpg"
                            value={imageUrl}
                            onChange={(e) => {
                              setImageUrl(e.target.value)
                              setBase64Image('')
                            }}
                            className="min-h-[80px] bg-gray-800/50 border-0 text-gray-200 
                              placeholder:text-gray-500 resize-none focus:ring-0"
                          />
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setShowImageUrlInput(false)}
                              className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400"
                            >
                              确定
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-gray-700/50"
                    >
                      <Mic className="h-4 w-4 text-gray-400" />
                    </Button>
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleSendMessage}
                        disabled={isProcessing || (!imageUrl && !inputText)}
                        className="h-8 w-8 bg-transparent hover:bg-transparent p-0"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg opacity-20" />
                        <Send className="h-4 w-4 text-purple-400 transform rotate-45" />
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImageUpload(file)
        }}
      />
    </div>
  )
} 