"use client"

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 设置canvas尺寸
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 星星类
    class Star {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      brightness: number
      maxBrightness: number
      twinkleSpeed: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 2
        this.speedX = (Math.random() - 0.5) * 0.1
        this.speedY = (Math.random() - 0.5) * 0.1
        this.brightness = 0
        this.maxBrightness = 0.5 + Math.random() * 0.5
        this.twinkleSpeed = 0.01 + Math.random() * 0.02
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        // 边界检查
        if (this.x < 0) this.x = canvas.width
        if (this.x > canvas.width) this.x = 0
        if (this.y < 0) this.y = canvas.height
        if (this.y > canvas.height) this.y = 0

        // 闪烁效果
        this.brightness += this.twinkleSpeed
        if (this.brightness > this.maxBrightness || this.brightness < 0) {
          this.twinkleSpeed = -this.twinkleSpeed
        }
      }

      draw() {
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size
        )
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.brightness})`)
        gradient.addColorStop(1, 'transparent')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // 创建星星
    const stars = Array.from({ length: 200 }, () => new Star())

    // 创建星座
    const constellations = Array.from({ length: 3 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 100 + Math.random() * 100,
      opacity: 0.1 + Math.random() * 0.1
    }))

    // 动画循环
    let animationFrameId: number
    const animate = () => {
      ctx.fillStyle = 'rgba(24, 24, 28, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制星座
      constellations.forEach(constellation => {
        const gradient = ctx.createRadialGradient(
          constellation.x, constellation.y, 0,
          constellation.x, constellation.y, constellation.size
        )
        gradient.addColorStop(0, `rgba(147, 51, 234, ${constellation.opacity})`)
        gradient.addColorStop(1, 'transparent')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(constellation.x, constellation.y, constellation.size, 0, Math.PI * 2)
        ctx.fill()
      })

      // 更新和绘制星星
      stars.forEach(star => {
        star.update()
        star.draw()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #0f0f17, #1a1a24)' }}
      />
      {/* 流星 */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          className="shooting-star"
          initial={{ x: '100%', y: '-100%' }}
          animate={{ x: '-100%', y: '100%' }}
          transition={{
            duration: 2,
            delay: i * 3,
            repeat: Infinity,
            repeatDelay: 7
          }}
          style={{
            top: `${Math.random() * 50}%`,
            left: `${Math.random() * 50}%`,
          }}
        />
      ))}
    </>
  )
} 