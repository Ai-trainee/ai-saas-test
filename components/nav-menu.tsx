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

export function NavMenu() {
  const pathname = usePathname()
  const router = useRouter()

  const services = [
    {
      name: "AI图像生成",
      icon: <ImagePlus className="h-4 w-4" />,
      route: "/dashboard/image-generation",
    },
    {
      name: "GLM-4V-Flash视觉分析",
      icon: <Eye className="h-4 w-4" />,
      route: "/dashboard/vision-analysis",
    },
    {
      type: "separator"
    },
    {
      name: "技术博客",
      icon: <BookOpen className="h-4 w-4" />,
      route: "/blog",
    },
    {
      name: "AI学习资源",
      icon: <Bot className="h-4 w-4" />,
      route: "/resources",
    }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">AI资源</Button>
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