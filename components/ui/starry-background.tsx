"use client"

import { useEffect, useRef, useMemo } from 'react'
import { motion, useAnimation } from 'framer-motion'

interface StarParticle {
  x: number
  y: number
  z: number
  size: number
  color: string
  speed: number
  brightness: number
  maxBrightness: number
  twinkleSpeed: number
}

interface NebulaCloud {
  x: number
  y: number
  size: number
  color: string
  angle: number
  speed: number
  opacity: number
}

export function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const controls = useAnimation()
  
  // 使用 useMemo 优化粒子创建
  const createStarParticle = (width: number, height: number): StarParticle => ({
    z: Math.random() * 2000,
    size: Math.random() * 2 + 0.5,
    speed: Math.random() * 0.2 + 0.1,
    brightness: Math.random() * 0.5,
    maxBrightness: 0.5 + Math.random() * 0.5,
    twinkleSpeed: 0.01 + Math.random() * 0.02,
    color: `hsl(${Math.random() * 60 + 220}, ${80 + Math.random() * 20}%, ${70 + Math.random() * 30}%)`,
    x: Math.random() * width,
    y: Math.random() * height
  })

  const createNebulaCloud = (width: number, height: number): NebulaCloud => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: 150 + Math.random() * 300,
    color: `hsl(${Math.random() * 60 + 220}, 70%, ${20 + Math.random() * 20}%)`,
    angle: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.0005 + 0.0002,
    opacity: 0.1 + Math.random() * 0.2
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    // 优化: 使用 ResizeObserver 监听尺寸变化
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        canvas.width = width * window.devicePixelRatio
        canvas.height = height * window.devicePixelRatio
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      }
    })

    resizeObserver.observe(canvas)

    // 初始化粒子
    const stars = Array.from({ length: 1500 }, () => 
      createStarParticle(canvas.width, canvas.height)
    )
    
    const nebulas = Array.from({ length: 3 }, () => 
      createNebulaCloud(canvas.width, canvas.height)
    )

    // 优化: 使用 requestAnimationFrame 的时间戳计算增量时间
    let lastTime = 0
    const animate = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000
      lastTime = currentTime

      // 创建深邃的太空背景
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#0a0a12')
      gradient.addColorStop(0.5, '#141429')
      gradient.addColorStop(1, '#1a1a24')
      
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制星云
      nebulas.forEach(nebula => {
        nebula.angle += nebula.speed * deltaTime * 60
        
        const gradient = ctx.createRadialGradient(
          nebula.x, nebula.y, 0,
          nebula.x, nebula.y, nebula.size
        )
        
        gradient.addColorStop(0, nebula.color.replace(')', `, ${nebula.opacity})`))
        gradient.addColorStop(0.5, nebula.color.replace(')', `, ${nebula.opacity * 0.5})`))
        gradient.addColorStop(1, 'transparent')

        ctx.save()
        ctx.translate(nebula.x, nebula.y)
        ctx.rotate(nebula.angle)
        ctx.translate(-nebula.x, -nebula.y)
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.ellipse(
          nebula.x, nebula.y,
          nebula.size, nebula.size * 0.6,
          nebula.angle, 0, Math.PI * 2
        )
        ctx.fill()
        
        ctx.restore()
      })

      // 绘制星星
      stars.forEach(star => {
        // 更新星星位置
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const angle = Math.atan2(star.y - centerY, star.x - centerX)
        const distance = Math.sqrt(
          Math.pow(star.x - centerX, 2) + 
          Math.pow(star.y - centerY, 2)
        )
        
        star.x = centerX + Math.cos(angle + star.speed * deltaTime) * distance
        star.y = centerY + Math.sin(angle + star.speed * deltaTime) * distance
        
        // 更新闪烁效果
        star.brightness += star.twinkleSpeed * deltaTime * 60
        if (star.brightness > star.maxBrightness || star.brightness < 0) {
          star.twinkleSpeed = -star.twinkleSpeed
        }

        // 更新z轴位置
        star.z -= star.speed * deltaTime * 60
        if (star.z < 0) star.z = 2000

        // 绘制星星
        const scale = (2000 - star.z) / 2000
        const x = (star.x - centerX) * scale + centerX
        const y = (star.y - centerY) * scale + centerY
        const size = star.size * scale

        const gradient = ctx.createRadialGradient(
          x, y, 0,
          x, y, size * 2
        )
        
        gradient.addColorStop(0, star.color.replace(')', `, ${star.brightness})`))
        gradient.addColorStop(0.4, star.color.replace(')', `, ${star.brightness * 0.3})`))
        gradient.addColorStop(1, 'transparent')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, size * 2, 0, Math.PI * 2)
        ctx.fill()
      })

      // 添加整体辉光效果
      ctx.fillStyle = 'rgba(147, 51, 234, 0.05)'
      ctx.filter = 'blur(80px)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.filter = 'none'

      requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)

    // 清理函数
    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // 流星动画
  const meteorVariants = {
    initial: { x: '120%', y: '-120%', opacity: 0 },
    animate: { x: '-120%', y: '120%', opacity: [0, 1, 1, 0] },
  }

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{
          width: '100vw',
          height: '100vh',
          background: 'linear-gradient(to bottom, #0a0a12, #1a1a24)'
        }}
      />
      
      {/* 流星 */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="shooting-star"
          variants={meteorVariants}
          initial="initial"
          animate="animate"
          transition={{
            duration: 2.5,
            delay: i * 3,
            repeat: Infinity,
            repeatDelay: 15,
            ease: "linear"
          }}
          style={{
            position: 'fixed',
            top: `${Math.random() * 50}%`,
            left: `${Math.random() * 70}%`,
            width: `${100 + Math.random() * 50}px`,
            height: '2px',
            background: 'linear-gradient(90deg, rgba(255,255,255,0.8), rgba(147,51,234,0.4), transparent)',
            filter: 'blur(1px)',
            transform: 'rotate(45deg)',
            borderRadius: '100px',
            zIndex: 0,
          }}
        />
      ))}
    </>
  )
} 