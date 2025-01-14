"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ImagePlus, Eye, BookOpen, Bot } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/config/language"

export function NavMenu() {
  const pathname = usePathname()
  const router = useRouter()
  const { language } = useLanguage()
  const t = translations.navMenu[language]

  const services = [
    {
      name: t.imageGeneration,
      icon: <ImagePlus className="h-4 w-4" />,
      route: "/dashboard/image-generation",
    },
    {
      name: t.visionAnalysis,
      icon: <Eye className="h-4 w-4" />,
      route: "/dashboard/vision-analysis",
    },
    {
      type: "separator"
    },
    {
      name: t.techBlog,
      icon: <BookOpen className="h-4 w-4" />,
      route: "/blog",
    },
    {
      name: t.learningResources,
      icon: <Bot className="h-4 w-4" />,
      route: "/resources",
    }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">{t.aiResources}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {services.map((service, index) => (
          service.type === "separator" ? (
            <DropdownMenuSeparator key={index} />
          ) : (
            <DropdownMenuItem
              key={service.route}
              className="flex items-center gap-2"
              onClick={() => {
                router.push(service.route)
                router.refresh()
              }}
            >
              {service.icon}
              <span>{service.name}</span>
            </DropdownMenuItem>
          )
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 