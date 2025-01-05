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
          专业的AI学习平台
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          AI进修生是你的AI学习与成长伙伴
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          探索AI技术前沿，获取实用工具与专业知识。从技术博客到AI工具，从学习资源到专业咨询，助你在AI时代脱颖而出。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button asChild size="lg" className="text-lg">
            <Link href="/login">
              立即开始学习 →
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg">
            <Link href="/blog">
              浏览技术博客
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-8 text-muted-foreground">
          <div className="flex flex-col items-center">
            <Users className="h-6 w-6 mb-2" />
            <div className="text-2xl font-bold">120万+</div>
            <div className="text-sm">学习者</div>
          </div>
          <div className="flex flex-col items-center">
            <Zap className="h-6 w-6 mb-2" />
            <div className="text-2xl font-bold">99.9%</div>
            <div className="text-sm">学习满意度</div>
          </div>
          <div className="flex flex-col items-center">
            <Bot className="h-6 w-6 mb-2" />
            <div className="text-2xl font-bold">12+</div>
            <div className="text-sm">AI能力</div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}