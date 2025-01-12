"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Bot, Languages } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/config/language"

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const [scrolled, setScrolled] = React.useState(false)
  const [session, setSession] = React.useState<any>(null)
  const router = useRouter()
  const t = translations.navbar[language]

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
        title: language === 'en' ? "Logout Failed" : "退出失败",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en')
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
              <span className="font-bold text-xl">{t.brand}</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link href="/tools" className="text-sm font-medium hover:text-primary transition-colors">
              {t.tools}
            </Link>
            <Link href="/applications" className="text-sm font-medium hover:text-primary transition-colors">
              {t.applications}
            </Link>
            <Link href="/blog" className="text-sm font-medium hover:text-primary transition-colors">
              {t.blog}
            </Link>
            <Link href="/news" className="text-sm font-medium hover:text-primary transition-colors">
              {t.news}
            </Link>
            <Link href="/docs" className="text-sm font-medium hover:text-primary transition-colors">
              {t.docs}
            </Link>
            <Link href="/consulting" className="text-sm font-medium hover:text-primary transition-colors">
              {t.consulting}
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              {t.about}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={toggleLanguage}>
              <Languages className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Toggle Language</span>
            </Button>
            <Button variant="outline" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">{t.toggleTheme}</span>
            </Button>
            {session ? (
              <Button onClick={handleLogout}>
                {t.logout}
              </Button>
            ) : (
              <Button asChild>
                <Link href="/login">
                  {t.getStarted}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}