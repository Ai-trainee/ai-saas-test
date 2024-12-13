"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

interface VisionServiceCardProps {
  title: string
  description: string
  price: string | null
  limits: string
  icon: React.ReactNode
  route: string
}

export function VisionServiceCard({
  title,
  description,
  price,
  limits,
  icon,
  route,
}: VisionServiceCardProps) {
  const router = useRouter()

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          {price === null ? (
            <Badge variant="secondary">免费</Badge>
          ) : (
            <Badge variant="default">{price}</Badge>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          <p>使用限制: {limits}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={() => router.push(route)}
        >
          {icon}
          <span className="ml-2">开始使用</span>
        </Button>
      </CardFooter>
    </Card>
  )
} 