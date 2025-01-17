"use client"

import * as React from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Bot, Languages, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/config/language"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

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

  const tools = [
    { name: t.tools, href: "#tools" },
    { name: translations.dashboard[language].services.imageGeneration.title, href: "/dashboard/image-generation" },
    { name: translations.dashboard[language].services.visionAnalysis.title, href: "/dashboard/vision-analysis" },
    { name: translations.dashboard[language].services.copyCoder.title, href: "/dashboard/copycoder" },
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        scrolled ? "bg-background/80 backdrop-blur-lg border-b" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">{t.brand}</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-3 hover:bg-primary/10 hover:text-primary">
                  {t.tools}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {tools.slice(1).map((tool) => (
                  <DropdownMenuItem key={tool.href} asChild>
                    <Link href={tool.href} className="w-full cursor-pointer">
                      {tool.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/blog" className="h-9 px-3 flex items-center justify-center hover:bg-primary/10 hover:text-primary rounded-md transition-colors">
              {t.news}
            </Link>
            <Link href="/consulting" className="h-9 px-3 flex items-center justify-center hover:bg-primary/10 hover:text-primary rounded-md transition-colors">
              {t.consulting}
            </Link>
            <Link href="/about" className="h-9 px-3 flex items-center justify-center hover:bg-primary/10 hover:text-primary rounded-md transition-colors">
              {t.about}
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleLanguage} className="hover:bg-primary/10 hover:text-primary">
              <Languages className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Toggle Language</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="hover:bg-primary/10 hover:text-primary">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">{t.toggleTheme}</span>
            </Button>
            {session ? (
              <Button variant="default" onClick={handleLogout} size="sm">
                {t.logout}
              </Button>
            ) : (
              <Button variant="default" asChild size="sm">
                <Link href="/login">
                  {t.getStarted}
                </Link>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[200px]">
                {tools.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href}>{item.name}</Link>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuItem asChild>
                  <Link href="/blog">{t.news}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/consulting">{t.consulting}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/about">{t.about}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}