"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { ImageIcon, Loader2 } from "lucide-react"

// 定义API请求队列
let requestQueue: Promise<any>[] = []
const MAX_CONCURRENT_REQUESTS = 2
const MAX_RETRIES = 3
const INITIAL_RETRY_DELAY = 1000

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

const PROMPTS = {
    COMPONENT: "请分析这个网站截图，生成一个详细的开发提示词，包含以下内容：\n1. 技术栈要求（框架、UI库等）\n2. 项目结构规范\n3. 组件架构设计\n4. 状态管理方案\n5. 响应式设计规范",
    STRUCTURE: "请分析这个网站截图，生成一个详细的页面实现提示词，包含以下内容：\n1. 路由结构设计\n2. 每个页面的核心目的\n3. 页面所需的关键组件\n4. 布局系统设计"
}

// API调用工具函数
async function makeApiRequest(message: Message, retryCount = 0): Promise<any> {
    try {
        const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.NEXT_PUBLIC_GLM_API_KEY}`,
            },
            body: JSON.stringify({
                model: "glm-4v-plus",
                messages: [message],
                temperature: 0.8,
                top_p: 0.7,
                max_tokens: 2048,
            }),
        })

        if (response.status === 429) {
            if (retryCount < MAX_RETRIES) {
                const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount)
                await new Promise(resolve => setTimeout(resolve, delay))
                return makeApiRequest(message, retryCount + 1)
            }
            throw new Error("请求过于频繁，请稍后再试")
        }

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`)
        }

        const data = await response.json()
        return data
    } catch (error: any) {
        throw new Error(error.message || "请求失败，请重试")
    }
}

// 队列处理函数
async function processQueue() {
    while (requestQueue.length > 0 && requestQueue.length <= MAX_CONCURRENT_REQUESTS) {
        const request = requestQueue.shift()
        if (request) {
            try {
                await request
            } catch (error) {
                console.error("Queue processing error:", error)
            }
        }
    }
}

export default function PromptGenerationPage() {
    const [imageUrl, setImageUrl] = useState("")
    const [result, setResult] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageUpload = (file: File) => {
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
            setImageUrl(e.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    const generatePrompt = async (type: 'COMPONENT' | 'STRUCTURE') => {
        if (!imageUrl) {
            toast({
                title: "请先上传图片",
                description: "需要上传网站截图才能生成提示词",
                variant: "destructive",
            })
            return
        }

        setIsLoading(true)
        setResult("")

        const message: Message = {
            role: 'user',
            content: [
                {
                    type: 'text',
                    text: PROMPTS[type]
                },
                {
                    type: 'image_url',
                    image_url: {
                        url: imageUrl
                    }
                }
            ]
        }

        const request = makeApiRequest(message)
        requestQueue.push(request)

        try {
            processQueue()
            const data = await request

            if (data.choices?.[0]?.message?.content) {
                setResult(data.choices[0].message.content)
            } else {
                throw new Error("返回数据格式错误")
            }
        } catch (error: any) {
            toast({
                title: "生成失败",
                description: error.message,
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
            requestQueue = requestQueue.filter(r => r !== request)
        }
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* 上传区域 */}
                <div
                    className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {imageUrl ? (
                        <div className="relative">
                            <img
                                src={imageUrl}
                                alt="Preview"
                                className="max-h-[300px] mx-auto object-contain rounded-lg"
                            />
                            <button
                                className="absolute top-2 right-2 p-1 bg-gray-800 rounded-md hover:bg-gray-700"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setImageUrl("")
                                }}
                            >
                                ×
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <ImageIcon className="w-12 h-12 mx-auto text-gray-500" />
                            <div>
                                <p className="text-lg font-medium">点击或拖拽上传网站截图</p>
                                <p className="text-sm text-gray-500">支持 JPG、PNG 格式</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 按钮区域 */}
                <div className="flex flex-col gap-4">
                    <Button
                        className="w-full py-6 text-lg bg-blue-600 hover:bg-blue-700"
                        onClick={() => generatePrompt('COMPONENT')}
                        disabled={isLoading || !imageUrl}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        第一步：生成组件实现要求提示词
                    </Button>
                    <Button
                        className="w-full py-6 text-lg bg-purple-600 hover:bg-purple-700"
                        onClick={() => generatePrompt('STRUCTURE')}
                        disabled={isLoading || !imageUrl}
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                        第二步：生成页面结构分析提示词
                    </Button>
                </div>

                {/* 结果显示区域 */}
                {result && (
                    <div className="bg-gray-800 rounded-lg p-6 whitespace-pre-wrap">
                        {result}
                    </div>
                )}

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
        </div>
    )
} 