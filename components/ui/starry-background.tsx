"use client"

import { useEffect, useRef } from 'react'

export function StarryBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number | null = null
    let stars: Star[] = []

    class Star {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      fadeSpeed: number

      constructor(width: number, height: number) {
        this.x = Math.random() * width
        this.y = Math.random() * height
        this.size = Math.random() * 2
        this.speedX = (Math.random() - 0.5) * 0.1
        this.speedY = (Math.random() - 0.5) * 0.1
        this.opacity = Math.random()
        this.fadeSpeed = Math.random() * 0.02
      }

      update(width: number, height: number) {
        this.x += this.speedX
        this.y += this.speedY
        this.opacity += this.fadeSpeed

        if (this.opacity > 1 || this.opacity < 0) {
          this.fadeSpeed = -this.fadeSpeed
        }

        if (this.x < 0) this.x = width
        if (this.x > width) this.x = 0
        if (this.y < 0) this.y = height
        if (this.y > height) this.y = 0
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`
        ctx.fill()
      }
    }

    const initStars = () => {
      stars = Array.from({ length: 100 }, () => new Star(canvas.width, canvas.height))
    }

    const animate = () => {
      if (!ctx || !canvas) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(star => {
        star.update(canvas.width, canvas.height)
        star.draw(ctx)
      })
      animationFrameId = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars()
    }

    handleResize()
    initStars()
    animate()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 bg-black"
    />
  )
} 