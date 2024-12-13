"use client"

import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ImagePlus, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
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
    }
  ]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost">AI工具</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {services.map((service) => (
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
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 