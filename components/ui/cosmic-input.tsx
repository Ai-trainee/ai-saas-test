"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image, Send, X, Upload, Link } from 'lucide-react'

interface CosmicInputProps {
  onSend: (text: string, image?: string) => void
  placeholder?: string
  presetPrompt?: string
  onClearPrompt?: () => void
}

export function CosmicInput({ 
  onSend, 
  placeholder = "输入你的问题...",
  presetPrompt,
  onClearPrompt
}: CosmicInputProps) {
  const [text, setText] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [isImageHovered, setIsImageHovered] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // 处理文件上传
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB')
      return
    }

    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
      alert('只支持JPG、PNG、GIF格式的图片')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImage(reader.result as string)
      setImageUrl('')
    }
    reader.readAsDataURL(file)
  }

  // 处理URL输入
  const handleUrlSubmit = () => {
    if (!imageUrl) return
    setImage(null)
    setShowUrlInput(false)
  }

  // 处理发送
  const handleSend = () => {
    if (!text.trim() && !image && !imageUrl) return
    onSend(text, image || imageUrl)
    setText('')
    setImage(null)
    setImageUrl('')
    if (presetPrompt && onClearPrompt) {
      onClearPrompt()
    }
  }

  // 自动调整高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [text])

  // 设置预设提示词
  useEffect(() => {
    if (presetPrompt) {
      setText(presetPrompt)
    }
  }, [presetPrompt])

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* 输入框容器 */}
      <div
        className={`
          cosmic-input-container
          ${isFocused ? 'cosmic-input-focused' : ''}
        `}
      >
        {/* URL输入框 */}
        <AnimatePresence>
          {showUrlInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="cosmic-url-input mb-4"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="输入图片URL..."
                  className="cosmic-textarea flex-1"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="cosmic-button"
                  onClick={handleUrlSubmit}
                >
                  确定
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 预览图片 */}
        <AnimatePresence>
          {(image || imageUrl) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="cosmic-preview"
              onMouseEnter={() => setIsImageHovered(true)}
              onMouseLeave={() => setIsImageHovered(false)}
            >
              <img
                src={image || imageUrl}
                alt="Preview"
                className="cosmic-preview-image"
              />
              <AnimatePresence>
                {isImageHovered && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => {
                      setImage(null)
                      setImageUrl('')
                    }}
                    className="cosmic-preview-close"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 输入区域 */}
        <div className="cosmic-input-wrapper">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="cosmic-textarea"
            rows={1}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          
          {/* 工具栏 */}
          <div className="cosmic-tools">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {/* 上传图片按钮 */}
            <motion.button
              className="cosmic-tool"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-5 h-5" />
              <div className="cosmic-tool-glow" />
            </motion.button>

            {/* URL输入按钮 */}
            <motion.button
              className="cosmic-tool"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUrlInput(!showUrlInput)}
            >
              <Link className="w-5 h-5" />
              <div className="cosmic-tool-glow" />
            </motion.button>

            {/* 发送按钮 */}
            <motion.button
              className={`cosmic-send-button ${text || image || imageUrl ? 'active' : ''}`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSend}
              disabled={!text.trim() && !image && !imageUrl}
            >
              <Send className="w-5 h-5" />
              <div className="cosmic-button-glow" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* 装饰性星光效果 */}
      <div className="cosmic-input-decorations">
        <div className="cosmic-star top-0 left-1/4" />
        <div className="cosmic-star top-1/3 right-1/4" />
        <div className="cosmic-star bottom-1/4 left-1/3" />
      </div>
    </div>
  )
} 