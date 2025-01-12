"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Zap, Bot } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/config/language"

export function HeroSection() {
  const { language } = useLanguage()
  const t = translations.hero[language]

  return (
    <section className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-b from-background to-background/50">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

      <div className="container px-4 mx-auto text-center relative z-10">
        <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-sm rounded-full border bg-background/50 backdrop-blur-sm">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          {t.badge}
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          {t.title}
        </h1>

        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          {t.subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Button asChild size="lg" className="text-lg">
            <Link href="/login">
              {t.startLearning}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg">
            <Link href="/blog">
              {t.browseBlog}
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-center gap-8 text-muted-foreground">
          <div className="flex flex-col items-center">
            <Users className="h-6 w-6 mb-2" />
            <div className="text-2xl font-bold">1.2M+</div>
            <div className="text-sm">{t.stats.learners}</div>
          </div>
          <div className="flex flex-col items-center">
            <Zap className="h-6 w-6 mb-2" />
            <div className="text-2xl font-bold">99.9%</div>
            <div className="text-sm">{t.stats.satisfaction}</div>
          </div>
          <div className="flex flex-col items-center">
            <Bot className="h-6 w-6 mb-2" />
            <div className="text-2xl font-bold">12+</div>
            <div className="text-sm">{t.stats.capabilities}</div>
          </div>
        </div>
      </div>
    </section>
  )
}