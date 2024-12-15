"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { db, ChatHistory } from "@/lib/indexed-db"
import { MessageSquare, Search, Plus, Trash2, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"

interface ChatHistoryProps {
  onSelectChat: (history: ChatHistory) => void
  onNewChat: () => void
  currentChatId?: number
}

export function ChatHistoryList({ onSelectChat, onNewChat, currentChatId }: ChatHistoryProps) {
  const [histories, setHistories] = useState<ChatHistory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadHistories = async (showToast = false) => {
    try {
      console.log('加载历史记录, currentChatId:', currentChatId)
      setIsRefreshing(true)
      const data = await db.getChatHistory()
      console.log('获取到的历史记录:', data)
      setHistories(data)
      
      if (showToast) {
        toast({
          title: "刷新成功",
          description: `已加载 ${data.length} 条对话记录`,
        })
      }
    } catch (error) {
      console.error('加载聊天历史失败:', error)
      toast({
        title: "加载失败",
        description: "无法加载聊天历史记录",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadHistories()
  }, [])

  // 监听 currentChatId 变化
  useEffect(() => {
    console.log('currentChatId 变化:', currentChatId)
    // 无论 currentChatId 是否存在都刷新列表
    const timer = setTimeout(() => {
      loadHistories()
    }, 500) // 缩短延迟时间
    return () => clearTimeout(timer)
  }, [currentChatId])

  // 添加定时刷新
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadHistories()
    }, 3000) // 每3秒刷新一次
    return () => clearInterval(intervalId)
  }, [])

  const handleManualRefresh = () => {
    loadHistories(true)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadHistories()
      return
    }
    console.log('搜索关键词:', searchQuery)
    const results = await db.searchChatHistory(searchQuery)
    console.log('搜索结果:', results)
    setHistories(results)
  }

  const handleDelete = async (id: number) => {
    try {
      console.log('删除对话:', id)
      await db.deleteChatHistory(id)
      await loadHistories()
      
      if (id === currentChatId) {
        onNewChat()
      }
      
      toast({
        title: "删除成功",
        description: "聊天记录已删除",
      })
    } catch (error) {
      console.error('删除失败:', error)
      toast({
        title: "删除失败",
        description: "无法删除聊天记录",
        variant: "destructive",
      })
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="w-80 h-full flex flex-col border-r border-gray-700 bg-gray-900">
      <div className="p-4 border-b border-gray-700">
        <div className="flex gap-2 mb-4">
          <Button
            onClick={onNewChat}
            className="flex-1"
            variant={currentChatId ? "outline" : "default"}
          >
            <Plus className="w-4 h-4 mr-2" />
            新建对话
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="搜索对话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1 bg-gray-800 border-gray-700"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={handleSearch}
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-gray-400">
            加载中...
          </div>
        ) : histories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-400">
            <MessageSquare className="w-8 h-8 mb-2" />
            <p>暂无聊天记录</p>
          </div>
        ) : (
          <div className="p-2 space-y-2">
            {histories.map((history) => (
              <div
                key={history.id}
                className={`
                  group flex items-center justify-between p-3 rounded-lg cursor-pointer
                  hover:bg-gray-800 transition-colors
                  ${currentChatId === history.id ? 'bg-gray-800' : ''}
                `}
                onClick={() => onSelectChat(history)}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm text-gray-200 truncate">
                    {history.title}
                  </h3>
                  <p className="text-xs text-gray-400 truncate">
                    {formatDate(history.timestamp)}
                  </p>
                  {history.lastMessage && (
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {history.lastMessage}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(history.id!)
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
} 