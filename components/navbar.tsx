"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [scrolled, setScrolled] = React.useState(false)
  const [session, setSession] = React.useState<any>(null)
  const router = useRouter()

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      localStorage.removeItem('supabase.auth.token')
      window.location.href = '/'
    } catch (error: any) {
      toast({
        title: "退出失败",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  return (
    <nav className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      scrolled ? "bg-background/80 backdrop-blur-lg border-b" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">AI进修生</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/tools" className="text-sm font-medium hover:text-primary transition-colors">
              AI工具
            </Link>
            <Link href="/applications" className="text-sm font-medium hover:text-primary transition-colors">
              AI应用
            </Link>
            <Link href="/news" className="text-sm font-medium hover:text-primary transition-colors">
              每日AI资讯
            </Link>
            <Link href="/docs" className="text-sm font-medium hover:text-primary transition-colors">
              文档
            </Link>
            <Link href="/consulting" className="text-sm font-medium hover:text-primary transition-colors">
              AI咨询
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              关于我们
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">切换主题</span>
            </Button>
            {session ? (
              <Button onClick={handleLogout}>
                退出
              </Button>
            ) : (
              <Button asChild>
                <Link href="/login">
                  开始使用 →
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}