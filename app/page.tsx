"use client"

import { HeroSection } from "@/components/hero-section"
import { ServiceCard } from "@/components/service-card"
import { ImagePlus, Eye, Code } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/config/language"
import { motion } from "framer-motion"

export default function Home() {
  const { language } = useLanguage()
  const t = translations.dashboard[language]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  return (
    <main className="relative bg-background">
      <HeroSection />

      <section id="tools" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-background" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />
        <div className="absolute inset-0 backdrop-blur-3xl" />

        <motion.div
          className="container px-4 mx-auto relative z-10"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                {t.title}
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t.subtitle}
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            <ServiceCard
              serviceKey="imageGeneration"
              icon={<ImagePlus className="h-6 w-6" />}
              href="/dashboard/image-generation"
            />
            <ServiceCard
              serviceKey="visionAnalysis"
              icon={<Eye className="h-6 w-6" />}
              href="/dashboard/vision-analysis"
            />
            <ServiceCard
              serviceKey="copyCoder"
              icon={<Code className="h-6 w-6" />}
              href="/dashboard/copycoder"
            />
          </div>
        </motion.div>
      </section>
    </main>
  )
}