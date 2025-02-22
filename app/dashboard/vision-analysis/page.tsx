"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import {
  Send, ImageIcon, Link, Mic,
  Camera, FileText, Brain, MessageSquare,
  Palette, Search, Brush, PenTool,
  User, Bot, X, Plus, ArrowLeft
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { db, ChatHistory } from "@/lib/indexed-db"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/config/language"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

// 添加星座位置状态
interface StarPosition {
  x: number
  y: number
  vx: number
  vy: number
  angle: number
}

// 添加星座状态
interface StarState {
  isFixed: boolean
  isHovered: boolean
  energy: number
  pulsePhase: number
}

// 更新物理系统参数
const GRAVITY_CONSTANT = 0.0001 // 增大引力常数
const DAMPING = 0.98 // 减小阻尼
const INITIAL_VELOCITY = 2 // 增大初始速度
const DISTURBANCE_FORCE = 0.1 // 随机扰动力大小
const MOUSE_FORCE_RADIUS = 200 // 鼠标力场半径
const MOUSE_FORCE_STRENGTH = 0.5 // 鼠标力场强度
const ATTRACTION_FORCE = 0.02 // 吸引力
const REPULSION_RADIUS = 100 // 排斥半径
const ENERGY_GAIN = 0.05 // 能量增益
const MAX_ENERGY = 1.0 // 最大能量值
const PULSE_SPEED = 0.1 // 脉冲速度

export default function VisionAnalysisPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const t = translations.visionAnalysis[language]
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
  const [promptHint, setPromptHint] = useState("")
  const [showPromptHint, setShowPromptHint] = useState(false)
  const [orbitAngle, setOrbitAngle] = useState(0)
  const [starPositions, setStarPositions] = useState<StarPosition[]>([])
  const [exportLoading, setExportLoading] = useState(false)
  const [starVelocities, setStarVelocities] = useState<Array<{ vx: number, vy: number, ax: number, ay: number }>>([])
  const [starStates, setStarStates] = useState<StarState[]>([])

  // 添加鼠标位置状态
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isMouseDown, setIsMouseDown] = useState(false)

  const functionButtons = [
    {
      icon: <Camera className="w-4 h-4" />,
      label: "图像描述",
      description: "AI 生成详细图片描述",
      color: "text-emerald-400",
      id: "describe-image",
      prompt: "请对图像进行详细描述，包括主要元素、场景、颜色、布局和整体氛围。"
    },
    {
      icon: <FileText className="w-4 h-4" />,
      label: "图像分类",
      description: "智能识别图片类型",
      color: "text-blue-400",
      id: "classify-image",
      prompt: "请仔细观察并分析图像，给出准确的分类和关键特征。"
    },
    {
      icon: <Brain className="w-4 h-4" />,
      label: "视觉推理",
      description: "深度解析图片内容",
      color: "text-purple-400",
      id: "analyze-image",
      prompt: "请根据图中的视觉线索，推理并解释图像中隐含的信息和上下文。"
    },
    {
      icon: <MessageSquare className="w-4 h-4" />,
      label: "视觉问答",
      description: "智能图像问答系统",
      color: "text-pink-400",
      id: "vqa",
      prompt: "请基于图像内容，回答相关问题并提供详细解释。"
    },
    {
      icon: <Palette className="w-4 h-4" />,
      label: "情感分析",
      description: "分析图像情感氛围",
      color: "text-yellow-400",
      id: "emotion",
      prompt: "请分析图像中传达的情感和氛围，包括人物表情、场景氛围和整体感受。"
    },
    {
      icon: <Search className="w-4 h-4" />,
      label: "质量检测",
      description: "产品质量智能检测",
      color: "text-red-400",
      id: "quality",
      prompt: "请检测并标注图像中的产品质量问题，包括瑕疵、损坏或异常现象。"
    },
    {
      icon: <Brush className="w-4 h-4" />,
      label: "商品描述",
      description: "生成专业商品文案",
      color: "text-indigo-400",
      id: "product",
      prompt: "请为图片中的商品生成专业的商品描述，包括特点、材质、设计细节等。"
    },
    {
      icon: <PenTool className="w-4 h-4" />,
      label: "数据标注",
      description: "智能信息标注系统",
      color: "text-green-400",
      id: "annotation",
      prompt: "请以JSON格式标注图像中的关键信息，包括对象类型、位置、属性等。"
    }
  ]

  // 更新星座位置计算
  useEffect(() => {
    const containerWidth = 180 // 容器宽度减去padding
    const containerHeight = 380 // 容器高度减去padding
    const positions = functionButtons.map((_, index) => {
      const row = Math.floor(index / 2) // 每行2个星座
      const col = index % 2
      return {
        x: 10 + col * 80, // 水平间距80px
        y: 10 + row * 80, // 垂直间距80px
        vx: 0,
        vy: 0,
        angle: 0
      }
    })
    setStarPositions(positions)
  }, [])

  // 星座缓慢移动动画
  useEffect(() => {
    const velocities = functionButtons.map(() => ({
      vx: (Math.random() - 0.5) * INITIAL_VELOCITY,
      vy: (Math.random() - 0.5) * INITIAL_VELOCITY,
      ax: 0,
      ay: 0
    }))
    setStarVelocities(velocities)
  }, [])

  // 初始化星座状态
  useEffect(() => {
    const states = functionButtons.map(() => ({
      isFixed: false,
      isHovered: false,
      energy: Math.random(),
      pulsePhase: Math.random() * Math.PI * 2
    }))
    setStarStates(states)
  }, [])

  // 更新星座动画
  useEffect(() => {
    const updateStars = () => {
      setStarStates(prev => prev.map(state => ({
        ...state,
        energy: state.energy + (state.isHovered ? ENERGY_GAIN : -ENERGY_GAIN * 0.5),
        pulsePhase: (state.pulsePhase + PULSE_SPEED) % (Math.PI * 2)
      })))
    }

    const interval = setInterval(updateStars, 50)
    return () => clearInterval(interval)
  }, [])

  // 监听鼠标移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    const handleMouseDown = () => setIsMouseDown(true)
    const handleMouseUp = () => setIsMouseDown(false)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // 增强星座物理系统
  useEffect(() => {
    const moveStars = () => {
      setStarPositions(prev => prev.map((pos, index) => {
        if (starStates[index]?.isFixed) return pos

        // 计算新位置
        let newX = pos.x + pos.vx
        let newY = pos.y + pos.vy

        // 边界检查
        if (newX < 10) {
          newX = 10
          pos.vx *= -0.5 // 碰撞后反弹,减少速度
        }
        if (newX > 140) { // 180 - 40(星座宽度)
          newX = 140
          pos.vx *= -0.5
        }
        if (newY < 10) {
          newY = 10
          pos.vy *= -0.5
        }
        if (newY > 340) { // 380 - 40(星座高度)
          newY = 340
          pos.vy *= -0.5
        }

        // 添加阻尼效果
        pos.vx *= 0.98
        pos.vy *= 0.98

        return {
          ...pos,
          x: newX,
          y: newY
        }
      }))
    }

    const interval = setInterval(moveStars, 16)
    return () => clearInterval(interval)
  }, [starStates, starVelocities])

  // 移除流星效果相关代码
  const handleFunctionClick = (btn: typeof functionButtons[0]) => {
    setSelectedFunction(btn.id)
    setInputText(btn.prompt)
  }

  const handleImageUpload = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: t.toastMessages.fileTooLarge,
        variant: "destructive",
      })
      return
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast({
        title: t.toastMessages.invalidFile,
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
  }, [t.toastMessages])

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

  const handleNewChat = useCallback(() => {
    setMessages([])
    setInputText('')
    setImageUrl('')
    setBase64Image('')
    setSelectedFunction(null)
    setIsFirstMessage(true)
  }, [])

  const handleSendMessage = async () => {
    if (!inputText && !imageUrl) {
      toast({
        title: t.toastMessages.uploadFirst,
        variant: "destructive",
      })
      return
    }
    setIsProcessing(true)
    setIsFirstMessage(false)

    try {
      // 构建用户消息
      const newUserMessage: Message = {
        role: 'user',
        content: []
      }

      // 添加文本内容
      if (inputText) {
        newUserMessage.content.push({
          type: 'text',
          text: inputText
        })
      }

      // 添加图片内容
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

      // 构建API请求
      const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: "glm-4v-flash",
          messages: [...messages, newUserMessage],
          temperature: 0.8,
          top_p: 0.7,
          max_tokens: 1024,
        }),
      })

      if (!response.ok) {
        throw new Error(t.toastMessages.analyzeFailed)
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

      toast({
        title: t.toastMessages.analyzeSuccess,
      })

    } catch (error: any) {
      toast({
        title: t.toastMessages.analyzeFailed,
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

  // 使用 useEffect 创建行星运动动画
  useEffect(() => {
    const animateOrbit = () => {
      setOrbitAngle(prev => (prev + 0.5) % 360)
    }
    const interval = setInterval(animateOrbit, 50)
    return () => clearInterval(interval)
  }, [])

  // 更新导出能为Markdown格式
  const exportChat = async () => {
    setExportLoading(true)
    try {
      const mdContent = messages.map(msg => {
        const role = msg.role === 'assistant' ? '🤖 AI' : '👤 User'
        const content = msg.content.map(c => {
          if (c.type === 'text') return c.text
          if (c.type === 'image_url' && c.image_url?.url) {
            return `![image](${c.image_url.url})`
          }
          return ''
        }).join('\n\n')
        return `### ${role}\n\n${content}\n`
      }).join('\n---\n\n')

      const blob = new Blob([mdContent], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `chat-export-${new Date().toISOString()}.md`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "导出成功",
        description: "对话记录已导出为Markdown格式",
      })
    } catch (error) {
      toast({
        title: "导出失败",
        description: error instanceof Error ? error.message : '未知错误',
        variant: "destructive",
      })
    } finally {
      setExportLoading(false)
    }
  }

  // 更新星座点击处理
  const handleStarClick = (index: number) => {
    setStarStates(prev => prev.map((state, i) => ({
      ...state,
      isFixed: i === index ? !state.isFixed : state.isFixed
    })))
  }

  // 更新星座悬停处理
  const handleStarHover = (index: number, isHovered: boolean) => {
    setStarStates(prev => prev.map((state, i) => ({
      ...state,
      isHovered: i === index ? isHovered : state.isHovered
    })))
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <StarryBackground />

      {/* 中央内容区域 */}
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-full max-w-4xl mx-auto relative">
          {/* 星座系统 */}
          <div className="constellation-container">
            {functionButtons.map((btn, index) => {
              const starStyle = {
                position: 'absolute',
                top: starPositions[index]?.y ?? 0,
                left: starPositions[index]?.x ?? 0,
                '--index': index,
              } as const

              return (
                <motion.button
                  key={btn.id}
                  className={`constellation-star ${selectedFunction === btn.id ? 'active' : ''
                    }`}
                  style={starStyle}
                  onClick={() => handleFunctionClick(btn)}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="star-content">
                    <span className={`star-icon ${btn.color}`}>
                      {btn.icon}
                    </span>
                    <div className="star-info">
                      <span className="star-label">{btn.label}</span>
                      <span className="star-description">{btn.description}</span>
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>

          {/* 星瞳导航栏 */}
          <div className="cosmic-navbar">
            <div className="cosmic-navbar-content">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="cosmic-logo"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="eye-icon">
                    <div className="eye-outer" />
                    <div className="eye-inner" />
                    <div className="eye-beam" />
                    <div className="eye-glow" />
                    <div className="eye-stars" />
                  </div>
                </motion.div>
                <h1 className="text-xl font-medium bg-clip-text text-transparent 
                  bg-gradient-to-r from-purple-400 to-blue-400">
                  {t.title}
                </h1>
              </div>
              <div className="flex items-center space-x-6">
                <motion.button
                  className="cosmic-nav-button"
                  whileHover={{ scale: 1.05 }}
                  onClick={handleNewChat}
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.newChat}</span>
                </motion.button>
                <motion.button
                  className="cosmic-nav-button"
                  whileHover={{ scale: 1.05 }}
                  onClick={exportChat}
                  disabled={exportLoading || messages.length === 0}
                >
                  <FileText className="w-4 h-4" />
                  <span>{exportLoading ? t.exporting : t.exportChat}</span>
                </motion.button>
                <motion.button
                  className="cosmic-nav-button"
                  whileHover={{ scale: 1.05 }}
                  onClick={() => router.push('/dashboard')}
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.back}</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* 提示词流星效果 */}
          <AnimatePresence>
            {showPromptHint && (
              <motion.div
                className="shooting-prompt"
                initial={{ x: "100%", y: "-100%" }}
                animate={{ x: "-100%", y: "100%" }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
              >
                <span className="prompt-text">{promptHint}</span>
                <div className="prompt-trail" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 对话区域 */}
          <div className="flex-1 flex flex-col px-8">
            <ScrollArea className="flex-1">
              <div className="max-w-3xl mx-auto space-y-6 py-4">
                {isFirstMessage && messages.length === 0 && (
                  <motion.div
                    className="welcome-container"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="welcome-star">
                      <Bot className="w-20 h-20 text-purple-400 opacity-80" />
                      <div className="star-glow" />
                    </div>
                    <div className="welcome-text">
                      <h3 className="text-2xl font-medium text-purple-200">
                        {t.welcomeTitle}
                      </h3>
                      <p className="text-sm text-purple-300/80">
                        {t.welcomeSubtitle}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* 消息列表 */}
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className={`flex items-start gap-3 ${message.role === 'assistant' ? 'justify-start' : 'justify-end'
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
            <div className="cosmic-input-container">
              <div className="max-w-3xl mx-auto p-4">
                <div className="relative">
                  <AnimatePresence>
                    {showPromptHint && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="absolute -top-12 left-0 right-0 text-center"
                      >
                        <span className="inline-block px-4 py-2 bg-purple-500/10 backdrop-blur-sm 
                          rounded-full text-sm text-purple-200 border border-purple-500/20">
                          {promptHint}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* 图片预览 */}
                  {imageUrl && (
                    <motion.div
                      className="preview-star"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <img
                        src={imageUrl}
                        alt={t.previewAlt}
                        className="h-full w-auto object-contain rounded-lg"
                      />
                      <motion.button
                        className="cosmic-tool"
                        whileHover={{ scale: 1.2 }}
                        onClick={() => {
                          setImageUrl('')
                          setBase64Image('')
                        }}
                      >
                        <X className="h-4 w-4 text-purple-400" />
                      </motion.button>
                    </motion.div>
                  )}

                  {/* 输入框 */}
                  <div className="cosmic-input">
                    <Textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={t.inputPlaceholder}
                      className="cosmic-textarea"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                    />
                    <div className="cosmic-tools">
                      <motion.button
                        className="cosmic-tool"
                        whileHover={{ scale: 1.2 }}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="w-4 h-4 text-purple-400" />
                      </motion.button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <motion.button
                            className="cosmic-tool"
                            whileHover={{ scale: 1.2 }}
                          >
                            <Link className="w-4 h-4 text-purple-400" />
                          </motion.button>
                        </PopoverTrigger>
                        <PopoverContent className="cosmic-popover">
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm text-gray-200">{t.enterImageUrl}</h4>
                            <Textarea
                              placeholder={t.imageUrlPlaceholder}
                              value={imageUrl}
                              onChange={(e) => {
                                setImageUrl(e.target.value)
                                setBase64Image('')
                              }}
                              className="min-h-[80px] bg-gray-800/50 border-0 text-gray-200 
                                placeholder:text-gray-500 resize-none focus:ring-0"
                            />
                            <div className="flex justify-end">
                              <motion.button
                                className="cosmic-button"
                                whileHover={{ scale: 1.05 }}
                                onClick={() => setShowImageUrlInput(false)}
                              >
                                {t.confirm}
                              </motion.button>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <motion.button
                        className="cosmic-tool"
                        whileHover={{ scale: 1.2 }}
                      >
                        <Mic className="w-4 h-4 text-purple-400" />
                      </motion.button>
                      <motion.button
                        className="cosmic-send"
                        whileHover={{ scale: 1.2 }}
                        onClick={handleSendMessage}
                        disabled={isProcessing || (!imageUrl && !inputText)}
                      >
                        <div className="send-star" />
                        <Send className="w-4 h-4 text-purple-400 transform rotate-45" />
                      </motion.button>
                    </div>
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