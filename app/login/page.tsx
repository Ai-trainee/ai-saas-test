"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-md space-y-6 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">登录</h1>
          <p className="text-gray-500">
            登录后即可参与评论和互动
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => signIn("github", { callbackUrl: "/" })}
        >
          <Github className="mr-2 h-4 w-4" />
          使用 GitHub 登录
        </Button>
      </div>
    </div>
  )
}