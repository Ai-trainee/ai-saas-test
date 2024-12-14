"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Upload, Eye, Image as ImageIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"

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
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [inputText, setInputText] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  // 处理发送消息
  async function handleSendMessage() {
    if (!inputText && !imageUrl) return
    setIsProcessing(true)

    const newUserMessage: Message = {
      role: 'user',
      content: []
    }

    // 如果有图片URL，添加到消息中
    if (imageUrl) {
      newUserMessage.content.push({
        type: 'image_url',
        image_url: {
          url: imageUrl
        }
      })
    }

    // 添加文本内容
    if (inputText) {
      newUserMessage.content.push({
        type: 'text',
        text: inputText
      })
    }

    // 更新消息列表
    const updatedMessages = [...messages, newUserMessage]
    setMessages(updatedMessages)

    try {
      const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_GLM_API_KEY}`,
        },
        body: JSON.stringify({
          model: "glm-4v-flash",
          messages: updatedMessages,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      if (data.choices?.[0]?.message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: [{
            type: 'text',
            text: data.choices[0].message.content
          }]
        }
        setMessages(prevMessages => [...prevMessages, assistantMessage])
      }

      toast({
        title: "发送成功",
      })
    } catch (error: any) {
      toast({
        title: "发送失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setInputText('') // 清空输入框
      // 只有在开始新的对话时才清空图片URL
      if (imageUrl && !imageUrl.startsWith('blob:')) {
        setImageUrl('')
      }
    }
  }

  // 清空对话历史
  const handleClearChat = () => {
    setMessages([])
    setInputText('')
    setImageUrl('')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">GLM-4V-Flash 视觉对话</h1>
            <p className="text-muted-foreground">
              支持图片和文字的智能对话助手
            </p>
          </div>
          <Button
            variant="outline"
            onClick={handleClearChat}
          >
            清空对话
          </Button>
        </div>

        <div className="flex gap-8 h-[600px]">
          {/* 左侧图片输入区 */}
          <div className="w-1/3 space-y-4">
            <div className="space-y-2">
              <Label>图片URL</Label>
              <Textarea
                placeholder="请输入图片URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            {imageUrl && (
              <div className="aspect-video relative rounded-lg overflow-hidden border">
                <img
                  src={imageUrl}
                  alt="上传的图片"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* 右侧对话区 */}
          <div className="flex-1 flex flex-col border rounded-lg">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'
                      }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${message.role === 'assistant'
                          ? 'bg-gray-100'
                          : 'bg-blue-500 text-white'
                        }`}
                    >
                      {message.content.map((content, contentIndex) => (
                        <div key={contentIndex} className="space-y-2">
                          {content.type === 'image_url' && (
                            <img
                              src={content.image_url?.url}
                              alt="Uploaded content"
                              className="max-h-[200px] object-cover rounded-lg"
                            />
                          )}
                          {content.type === 'text' && (
                            <p className="text-sm whitespace-pre-wrap">{content.text}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* 输入区域 */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={messages.length > 0 ? "继续对话..." : "输入您的问题，按回车发送..."}
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isProcessing || (!imageUrl && !inputText)}
                  className="px-8"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      发送中...
                    </>
                  ) : (
                    '发送'
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {messages.length > 0
                  ? "您可以继续提问或上传新图片开始新对话"
                  : '提示：可以输入问题或上传图片URL开始对话'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 