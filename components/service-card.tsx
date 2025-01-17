"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/config/language"

interface ServiceCardProps {
    serviceKey: 'imageGeneration' | 'visionAnalysis' | 'copyCoder'
    icon: React.ReactNode
    href: string
}

export function ServiceCard({ serviceKey, icon, href }: ServiceCardProps) {
    const { language } = useLanguage()
    const t = translations.dashboard[language].services[serviceKey]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="group relative rounded-xl border p-6 space-y-4 hover:border-primary/50 transition-colors"
        >
            <div className="flex items-center justify-between">
                <div className="p-2 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {icon}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {t.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {t.description}
                </p>
            </div>

            <div className="space-y-4">
                {t.price && (
                    <div className="text-sm">
                        <span className="font-medium">{t.price}</span>
                    </div>
                )}
                {t.limits && (
                    <div className="text-xs text-muted-foreground">
                        {t.limits}
                    </div>
                )}
            </div>

            <Button asChild className="w-full">
                <Link href={href}>
                    {language === 'en' ? 'Try Now' : '立即体验'}
                </Link>
            </Button>
        </motion.div>
    )
} 