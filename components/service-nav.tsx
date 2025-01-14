"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ImagePlus, Eye, ArrowLeft } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/config/language"

export function ServiceNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { language } = useLanguage()
  const t = translations.serviceNav[language]

  const services = [
    {
      name: t.backToServices,
      icon: <ArrowLeft className="h-4 w-4" />,
      route: "/dashboard",
      variant: "ghost" as const
    },
    {
      name: t.imageGeneration,
      icon: <ImagePlus className="h-4 w-4" />,
      route: "/dashboard/image-generation",
      variant: "ghost" as const
    },
    {
      name: t.visionAnalysis,
      icon: <Eye className="h-4 w-4" />,
      route: "/dashboard/vision-analysis",
      variant: "ghost" as const
    }
  ]

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center space-x-4 overflow-x-auto">
          {services.map((service) => (
            <Button
              key={service.route}
              variant={service.variant}
              className={`whitespace-nowrap ${pathname === service.route ? "bg-muted" : ""
                }`}
              onClick={() => {
                router.push(service.route)
                router.refresh()
              }}
            >
              {service.icon}
              <span className="ml-2">{service.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </nav>
  )
} 