"use client"

import { StarryBackground } from './starry-background'
import './styles.css'

export default function ExamplePage() {
  return (
    <div className="relative min-h-screen bg-[#0f0f17] text-white overflow-hidden">
      {/* 星空背景 */}
      <StarryBackground />
      
      {/* 示例内容 */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* 标题 */}
          <h1 className="cosmic-text-gradient text-4xl font-bold">
            星空特效演示
          </h1>
          
          {/* 卡片示例 */}
          <div className="cosmic-border cosmic-blur p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              玻璃态卡片
            </h2>
            <p className="text-gray-300">
              这是一个带有星空主题的玻璃态卡片示例。
            </p>
          </div>
          
          {/* 动画元素示例 */}
          <div className="flex gap-4">
            <div className="cosmic-portal animate-float" />
            <div className="cosmic-portal animate-pulse-slow" />
            <div className="cosmic-portal animate-glow" />
          </div>
          
          {/* 渐变文本示例 */}
          <div className="space-y-4">
            <p className="cosmic-text-gradient text-lg">
              这是一段带有渐变效果的文本。
            </p>
            <p className="text-gray-300">
              普通文本内容。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 