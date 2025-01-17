"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Zap, Bot } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/config/language"
import { motion } from "framer-motion"

export function HeroSection() {
  const { language } = useLanguage()
  const t = translations.hero[language]

  const stats = [
    { icon: <Users className="h-5 w-5" />, value: "1.2M+", label: t.stats.learners },
    { icon: <Zap className="h-5 w-5" />, value: "99.9%", label: t.stats.satisfaction },
    { icon: <Bot className="h-5 w-5" />, value: "12+", label: t.stats.capabilities }
  ]

  return (
    <section className="relative pt-20 pb-12 overflow-hidden bg-white dark:bg-black text-black dark:text-white">
      <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-[size:50px_50px]" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white to-white dark:from-black/50 dark:via-black dark:to-black" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />

      <div className="container px-4 mx-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-sm rounded-full border border-white/10 bg-white/5 dark:bg-black/50 backdrop-blur-sm"
            >
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {t.badge}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              {t.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg opacity-80 max-w-2xl mx-auto mb-8"
            >
              {t.subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            >
              <Button asChild size="lg" className="min-w-[200px] bg-primary hover:bg-primary/90">
                <Link href="#tools">
                  {t.startLearning}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-w-[200px] border-white/10 hover:bg-white/5">
                <Link href="/blog">
                  {t.browseBlog}
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-8 max-w-3xl mx-auto"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex flex-col items-center p-4 rounded-lg border border-white/10 bg-white/5 dark:bg-black/50 backdrop-blur-sm"
                >
                  <div className="p-2 rounded-full bg-primary/10 text-primary mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold">
                    {stat.value}
                  </div>
                  <div className="text-sm opacity-80">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}