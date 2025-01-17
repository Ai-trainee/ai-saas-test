"use client"

import { HeroSection } from "@/components/hero-section"
import { ServiceCard } from "@/components/service-card"
import { ImagePlus, Eye, Code } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/config/language"

export default function Home() {
  const { language } = useLanguage()
  const t = translations.dashboard[language]

  return (
    <main>
      <HeroSection />

      <section className="w-full py-24 bg-gradient-to-b from-background to-background/50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
        </div>
      </section>
    </main>
  )
}