'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generatePrompt } from './service'
import './styles.css'

// 动画变体配置
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
}

const loadingVariants = {
  initial: { rotate: 0 },
  animate: { 
    rotate: 360,
    transition: {
      duration: 1.5,
      ease: "linear",
      repeat: Infinity
    }
  }
}

export default function CopyCoderPage() {
  const [image, setImage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [dragActive, setDragActive] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

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
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
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

  // 处理复制功能
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
      setError('复制失败,请重试')
    }
  }

  return (
    <motion.div 
      className="copycoder-container mx-auto p-8 min-h-screen flex flex-col items-center justify-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className="w-full max-w-3xl space-y-8"
        variants={containerVariants}
      >
        {/* 标题区域 */}
        <motion.div 
          className="text-center space-y-2"
          variants={itemVariants}
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
            AI 智能分析
          </h1>
          <p className="text-gray-500">
            上传界面截图,快速获取组件实现建议和结构分析
          </p>
        </motion.div>

        {/* 上传区域 */}
        <motion.div 
          className={`copycoder-upload-zone relative border-2 border-dashed rounded-xl p-8 text-center
            ${dragActive ? 'border-purple-500 bg-purple-500/5' : 'border-purple-500/30'}
            ${error ? 'border-red-500/50' : ''}`}
          variants={itemVariants}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <AnimatePresence mode="wait">
            {image ? (
              <motion.div 
                className="relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <img 
                  src={image} 
                  alt="Preview" 
                  className="copycoder-preview max-h-[400px] mx-auto rounded-lg shadow-lg"
                />
                <motion.button
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setImage(null)
                    setResult('')
                    setError('')
                  }}
                >
                  ×
                </motion.button>
              </motion.div>
            ) : (
              <motion.div 
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="copycoder-upload-icon w-20 h-20 mx-auto bg-purple-500/10 rounded-full flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <Upload className="w-10 h-10 text-purple-500/60" />
                </motion.div>
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
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                    className="border-2"
                  >
                    选择文件
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          {error && (
            <motion.p 
              className="mt-2 text-sm text-red-500"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {error}
            </motion.p>
          )}
        </motion.div>

        {/* 操作按钮 */}
        <AnimatePresence>
          {image && (
            <motion.div 
              className="flex gap-4 justify-center"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => handleGeneratePrompt('component')}
                  disabled={loading}
                  className="copycoder-button"
                >
                  生成组件实现提示词
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handleGeneratePrompt('structure')}
                  disabled={loading}
                  className="copycoder-button"
                >
                  生成结构分析提示词
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 结果展示 */}
        <AnimatePresence>
          {result && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="copycoder-result rounded-xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">分析结果</h3>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(result)}
                    className="relative"
                  >
                    {copySuccess ? (
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-green-500"
                      >
                        已复制
                      </motion.span>
                    ) : (
                      '复制'
                    )}
                    {copySuccess && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded"
                      >
                        复制成功!
                      </motion.div>
                    )}
                  </Button>
                </motion.div>
              </div>
              <pre className="whitespace-pre-wrap text-sm">{result}</pre>
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
              className="fixed inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-black/80 p-8 rounded-xl space-y-4"
              >
                <motion.div 
                  className="relative w-16 h-16 mx-auto"
                  variants={loadingVariants}
                  initial="initial"
                  animate="animate"
                >
                  <div className="copycoder-loading absolute inset-0" />
                  <Loader2 className="w-16 h-16 text-purple-500" />
                </motion.div>
                <p className="text-sm text-center text-gray-300">正在分析图片...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
} 