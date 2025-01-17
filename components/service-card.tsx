"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
    const router = useRouter()
    const t = translations.dashboard[language].services[serviceKey]

    const handleClick = () => {
        router.push(href)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="group relative rounded-xl border border-white/10 bg-white/5 dark:bg-black/50 backdrop-blur-sm hover:border-primary/20 hover:bg-primary/[0.02] hover:shadow-lg hover:shadow-primary/5 transition-all text-black dark:text-white cursor-pointer"
            onClick={handleClick}
        >
            <div className="relative p-6 space-y-4">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/5 dark:to-black/50 rounded-xl" />
                <div className="relative z-10">
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
                        <p className="text-sm opacity-80">
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
                                    <div className="text-xs opacity-80">
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
            </div>
        </motion.div>
    )
} 