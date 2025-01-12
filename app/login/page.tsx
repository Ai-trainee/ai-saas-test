"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { Bot } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // 检查登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard")
      }
    })
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              subscription_tier: "free"
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        })

        if (signUpError) throw signUpError

        toast({
          title: "注册成功",
          description: "请查看您的邮箱以验证账号"
        })
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (signInError) throw signInError

        // 检查邮箱是否已验证
        const { data: { user } } = await supabase.auth.getUser()
        if (!user?.email_confirmed_at) {
          toast({
            title: "请先验证邮箱",
            description: "请检查您的邮箱并点击验证链接",
            variant: "destructive"
          })
          return
        }

        window.location.href = '/dashboard'
      }
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/50">
      <div className="w-full max-w-md p-8 space-y-6 bg-card rounded-2xl border shadow-lg">
        <div className="flex flex-col items-center space-y-2">
          <Bot className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-bold">{isSignUp ? "创建账号" : "欢迎回来"}</h1>
          <p className="text-sm text-muted-foreground">
            {isSignUp ? "开始您的AI学习之旅" : "登录以继续您的学习"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "处理中..." : isSignUp ? "注册" : "登录"}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-primary hover:underline"
          >
            {isSignUp ? "已有账号？登录" : "没有账号？注册"}
          </button>
        </div>
      </div>
    </div>
  )
}