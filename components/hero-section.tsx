"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Zap, Bot } from "lucide-react"

export function HeroSection() {
  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-background to-background/50">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container px-4 mx-auto text-center relative z-10"
      >
        <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-sm rounded-full border bg-background/50 backdrop-blur-sm">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          #1 AI学习助手
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          AI进修生是你的学习伙伴
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          使用我们的AI工具 - 文本优化、智能对话、论文助手等，轻松提升学习效率，突破AI检测。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button asChild size="lg" className="text-lg">
            <Link href="/login">
              免费开始使用 →
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="text-lg">
            查看演示
          </Button>
        </div>

        <div className="flex items-center justify-center gap-8 text-muted-foreground">
          <div className="flex flex-col items-center">
            <Users className="h-6 w-6 mb-2" />
            <div className="text-2xl font-bold">120万+</div>
            <div className="text-sm">学生用户</div>
          </div>
          <div className="flex flex-col items-center">
            <Zap className="h-6 w-6 mb-2" />
            <div className="text-2xl font-bold">99.9%</div>
            <div className="text-sm">成功率</div>
          </div>
          <div className="flex flex-col items-center">
            <Bot className="h-6 w-6 mb-2" />
            <div className="text-2xl font-bold">12+</div>
            <div className="text-sm">AI模型</div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}