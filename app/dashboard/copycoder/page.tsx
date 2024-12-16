'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generatePrompt } from './service'
import './styles.css'

export default function CopyCoderPage() {
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState<string>('')

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImage(reader.result as string)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  // 处理拖拽上传
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setImage(reader.result as string)
      setError('')
    }
    reader.readAsDataURL(file)
  }

  // 生成提示词
  const handleGeneratePrompt = async (type: 'component' | 'structure') => {
    if (!image) return
    
    setLoading(true)
    setError('')
    try {
      const prompt = await generatePrompt(image, type)
      setResult(prompt)
    } catch (error) {
      setError('生成提示词失败,请重试')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 min-h-screen">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* 上传区域 */}
        <div 
          className={`upload-zone border-2 border-dashed border-purple-500/30 rounded-lg p-8 text-center
            ${error ? 'border-red-500/50' : ''}`}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {image ? (
            <div className="relative">
              <img 
                src={image} 
                alt="Preview" 
                className="max-h-[400px] mx-auto rounded-lg"
              />
              <button
                onClick={() => {
                  setImage(null)
                  setResult('')
                  setError('')
                }}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70"
              >
                ×
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="upload-icon w-16 h-16 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-purple-500/60" />
              </div>
              <div>
                <p className="text-lg font-medium">拖拽上传网站截图</p>
                <p className="text-sm text-gray-400">或点击选择文件</p>
              </div>
              <input
                type="file"
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
                id="image-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                选择文件
              </Button>
            </div>
          )}
          {error && (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* 操作按钮 */}
        {image && (
          <div className="flex gap-4 justify-center">
            <Button
              variant="default"
              size="lg"
              onClick={() => handleGeneratePrompt('component')}
              disabled={loading}
              className="prompt-button"
            >
              生成组件实现提示词
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleGeneratePrompt('structure')}
              disabled={loading}
              className="prompt-button"
            >
              生成结构分析提示词
            </Button>
          </div>
        )}

        {/* 结果展示 */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="result-container bg-purple-500/10 rounded-lg p-6"
            >
              <pre className="whitespace-pre-wrap">{result}</pre>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 加载状态 */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm"
            >
              <div className="bg-black/80 p-8 rounded-lg">
                <div className="loading-spinner w-8 h-8 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <p className="mt-4 text-sm text-center">正在生成提示词...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 