"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Upload, Trash2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { db, ChatHistory } from "@/lib/indexed-db"
import { ChatHistoryList } from "./chat-history"

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
  const [imageUrl, setImageUrl] = useState("")
  const [inputText, setInputText] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [currentChatId, setCurrentChatId] = useState<number>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [base64Image, setBase64Image] = useState<string>("")

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const saveChatHistory = async () => {
    if (messages.length === 0) return

    const lastMessage = messages[messages.length - 1]
    const history: ChatHistory = {
      id: currentChatId,
      timestamp: Date.now(),
      title: messages[0].content.find(c => c.type === 'text')?.text || '新对话',
      messages,
      imageUrl: base64Image || imageUrl,
      lastMessage: lastMessage.content.find(c => c.type === 'text')?.text
    }

    try {
      if (currentChatId) {
        await db.updateChatHistory(history)
      } else {
        const id = await db.saveChatHistory(history)
        setCurrentChatId(id)
      }
    } catch (error) {
      console.error('保存聊天记录失败:', error)
    }
  }

  const handleSelectChat = async (history: ChatHistory) => {
    setCurrentChatId(history.id)
    setMessages(history.messages)
    setImageUrl(history.imageUrl || '')
    setBase64Image(history.imageUrl || '')
  }

  const handleNewChat = () => {
    setCurrentChatId(undefined)
    setMessages([])
    setInputText('')
    setImageUrl('')
    setBase64Image('')
  }

  async function handleSendMessage() {
    if (!inputText && !imageUrl) return
    setIsProcessing(true)
    console.log('开始发送消息:', { inputText, imageUrl, currentChatId, messagesCount: messages.length })

    const newUserMessage: Message = {
      role: 'user',
      content: []
    }

    // 只在第一条消息时添加图片
    const currentImageUrl = base64Image || imageUrl
    if (currentImageUrl && messages.length === 0) {
      console.log('添加图片到第一条消息:', currentImageUrl.substring(0, 100) + '...')
      newUserMessage.content.push({
        type: 'image_url',
        image_url: {
          url: currentImageUrl
        }
      })
    }

    if (inputText) {
      newUserMessage.content.push({
        type: 'text',
        text: inputText
      })
    }

    // 先更新用户消息
    const updatedMessages = [...messages, newUserMessage]
    setMessages(updatedMessages)

    try {
      // 构建发送给API的消息列表
      const apiMessages = messages.length === 0 
        ? [newUserMessage]
        : [messages[0], ...messages.slice(1).map(msg => ({
            role: msg.role,
            content: msg.content.filter(c => c.type === 'text')
          })), newUserMessage]

      console.log('API消息列表:', apiMessages)

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
      console.log('API响应:', data)

      if (data.choices?.[0]?.message) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: [{
            type: 'text',
            text: data.choices[0].message.content
          }]
        }
        
        // 立即更新消息列表，包含助手的回复
        const newMessages = [...updatedMessages, assistantMessage]
        setMessages(newMessages)
        
        // 构建历史记录对象
        const history: ChatHistory = {
          id: currentChatId,
          timestamp: Date.now(),
          title: newMessages[0].content.find(c => c.type === 'text')?.text || 
                 (currentImageUrl ? '图片对话' : '新对话'),
          messages: newMessages,
          imageUrl: currentImageUrl,
          lastMessage: assistantMessage.content[0].text
        }

        try {
          if (currentChatId) {
            console.log('更新现有对话:', currentChatId)
            await db.updateChatHistory(history)
          } else {
            console.log('创建新对话')
            const id = await db.saveChatHistory(history)
            console.log('新对话ID:', id)
            setCurrentChatId(id)
          }
          
          toast({
            title: "对话已保存",
            description: currentChatId ? "已更新对话记录" : "已创建新对话",
          })
        } catch (error) {
          console.error('保存聊天记录失败:', error)
          toast({
            title: "保存失败",
            description: "无法保存聊天记录，请检查控制台获取详细错误信息",
            variant: "destructive",
          })
        }
      }
    } catch (error: any) {
      console.error('发送消息失败:', error)
      toast({
        title: "发送失败",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setInputText('')
    }
  }

  // 添加调试用的 useEffect
  useEffect(() => {
    console.log('消息列表更新:', { 
      messageCount: messages.length,
      currentChatId,
      hasImage: !!imageUrl
    })
  }, [messages, currentChatId, imageUrl])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex h-[calc(100vh-8rem)]">
        <ChatHistoryList
          onSelectChat={handleSelectChat}
          onNewChat={handleNewChat}
          currentChatId={currentChatId}
        />
        
        <div className="flex-1 ml-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">GLM-4V-Flash 视觉对话</h1>
              <p className="text-gray-400">
                支持图片和文字的智能对话助手
              </p>
            </div>
          </div>

          <div className="flex gap-8 h-[calc(100vh-16rem)]">
            {/* 左侧图片输入区 */}
            <div className="w-1/3 space-y-4">
              <div 
                className={`
                  relative h-[200px] border-2 border-dashed rounded-lg 
                  transition-colors duration-200 ease-in-out
                  ${isDragging ? 'border-primary bg-primary/5' : 'border-gray-600'}
                  ${imageUrl ? 'bg-gray-800' : 'bg-gray-900'}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
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
                
                {imageUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={imageUrl}
                      alt="上传的图片"
                      className="w-full h-full object-contain"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageUrl('')
                        setBase64Image('')
                      }}
                    >
                      删除
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-8 h-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-400">
                      点击或拖拽上传图片
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      支持 JPG、PNG 格式，最大 5MB
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">图片URL</Label>
                <Textarea
                  placeholder="或者直接粘贴图片URL..."
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value)
                    setBase64Image('')
                  }}
                  className="min-h-[100px] bg-gray-800 border-gray-700 text-gray-200 placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* 右侧对话区 */}
            <div className="flex-1 flex flex-col border border-gray-700 rounded-lg bg-gray-900">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {messages.map((message, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex ${
                          message.role === 'assistant' ? 'justify-start' : 'justify-end'
                        }`}
                      >
                        <div
                          className={`
                            max-w-[80%] rounded-lg p-4 shadow-md
                            ${message.role === 'assistant' 
                              ? 'bg-gray-800 text-gray-200' 
                              : 'bg-primary text-white'
                            }
                          `}
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
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                  {content.text}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* 输入区域 */}
              <div className="p-4 border-t border-gray-700 bg-gray-800">
                <div className="flex gap-2">
                  <Textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={
                      messages.length > 0 
                        ? "继续对话..." 
                        : "输入您的问题，按回车发送，或者先上传图片再提问..."
                    }
                    className="flex-1 min-h-[80px] bg-gray-900 border-gray-700 text-gray-200 placeholder:text-gray-500"
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
                    className="px-8 h-auto bg-primary hover:bg-primary/90"
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
                <p className="mt-2 text-xs text-gray-400">
                  {messages.length > 0
                    ? "您可以继续提问或上传新图片开始新对话"
                    : '提示：可以输入问题或上传图片开始对话，支持图片分析、物体识别等功能'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 