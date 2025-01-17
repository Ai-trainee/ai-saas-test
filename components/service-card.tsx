"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/config/language"
import { ArrowRight } from "lucide-react"

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
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="group relative rounded-xl border bg-gradient-to-b from-background to-background/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all"
        >
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <motion.div
                        className="p-3 w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform"
                        whileHover={{ rotate: 5 }}
                    >
                        {icon}
                    </motion.div>
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="hidden group-hover:flex items-center text-sm text-primary"
                    >
                        {language === 'en' ? 'Try Now' : '立即体验'}
                        <ArrowRight className="ml-1 h-4 w-4" />
                    </motion.div>
                </div>

                <div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {t.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {t.description}
                    </p>
                </div>

                <div className="space-y-4 pt-2">
                    {t.price && (
                        <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium bg-primary/10 text-primary px-2 py-1 rounded">
                                {t.price}
                            </div>
                            {t.limits && (
                                <div className="text-xs text-muted-foreground">
                                    {t.limits}
                                </div>
                            )}
                        </div>
                    )}
                    {!t.price && t.limits && (
                        <div className="inline-block text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                            {t.limits}
                        </div>
                    )}
                </div>
            </div>

            <Link href={href} className="absolute inset-0">
                <span className="sr-only">Try {t.title}</span>
            </Link>
        </motion.div>
    )
} 