"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type PlanFeature = {
  name: string
  included: boolean
  tooltip?: string
}

type Plan = {
  name: string
  icon: string
  description: string
  price: {
    monthly: number
    yearly: number
  }
  features: PlanFeature[]
  color: string
  popular?: boolean
}

const plans: Plan[] = [
  {
    name: "紫水晶",
    icon: "💎",
    description: "无需信用卡",
    price: {
      monthly: 0,
      yearly: 0
    },
    color: "from-purple-500/20 to-purple-500/10",
    features: [
      { name: "所有基础工具", included: true },
      { name: "仅支持中文", included: true },
      { name: "每次请求250字", included: true },
      { name: "无AI分析报告", included: false },
      { name: "无高级算法", included: false },
      { name: "无API访问", included: false }
    ]
  },
  {
    name: "蓝宝石",
    icon: "🌟",
    description: "最受欢迎",
    price: {
      monthly: 19.99,
      yearly: 167.88
    },
    color: "from-blue-500/20 to-blue-500/10",
    popular: true,
    features: [
      { name: "所有工具和模型", included: true },
      { name: "支持所有语言", included: true },
      { name: "每次请求750字", included: true },
      { name: "1份AI分析报告", included: true },
      { name: "无高级算法", included: false },
      { name: "无API访问", included: false }
    ]
  },
  {
    name: "翡翠",
    icon: "✨",
    description: "专业选择",
    price: {
      monthly: 29.99,
      yearly: 251.88
    },
    color: "from-emerald-500/20 to-emerald-500/10",
    features: [
      { name: "所有工具和模型", included: true },
      { name: "支持所有语言", included: true },
      { name: "每次请求1000字", included: true },
      { name: "3份AI分析报告", included: true },
      { name: "高级算法支持", included: true },
      { name: "无API访问", included: false }
    ]
  },
  {
    name: "红宝石",
    icon: "👑",
    description: "企业定制",
    price: {
      monthly: 99.99,
      yearly: 839.88
    },
    color: "from-red-500/20 to-red-500/10",
    features: [
      { name: "所有功能", included: true },
      { name: "支持所有语言", included: true },
      { name: "无限制字数", included: true },
      { name: "无限AI分析报告", included: true },
      { name: "高级算法支持", included: true },
      { name: "API访问", included: true }
    ]
  }
]

export function PricingSection() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly")

  return (
    <section className="w-full py-24 bg-gradient-to-b from-background to-background/50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">灵活的定价方案</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            选择适合您需求和预算的方案，让AI进修生助力您的学习之旅。
          </p>

          <div className="flex items-center justify-center space-x-4 mb-8">
            <Button
              variant={billingInterval === "monthly" ? "default" : "outline"}
              onClick={() => setBillingInterval("monthly")}
              className="relative"
            >
              月付
            </Button>
            <Button
              variant={billingInterval === "yearly" ? "default" : "outline"}
              onClick={() => setBillingInterval("yearly")}
              className="relative"
            >
              年付
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                省30%
              </span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={cn(
                "relative rounded-2xl border bg-gradient-to-b p-8",
                plan.color
              )}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-sm px-3 py-1 rounded-full">
                  最受欢迎
                </span>
              )}

              <div className="text-2xl mb-4">{plan.icon}</div>
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

              <div className="mb-6">
                <div className="text-3xl font-bold">
                  {plan.price[billingInterval] === 0 ? (
                    "免费"
                  ) : (
                    <>
                      ¥{plan.price[billingInterval].toFixed(2)}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{billingInterval === "monthly" ? "月" : "年"}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-primary mr-2 flex-shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground mr-2 flex-shrink-0" />
                    )}
                    <span className={cn(
                      "text-sm",
                      !feature.included && "text-muted-foreground"
                    )}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className="w-full"
                variant={plan.name === "紫水晶" ? "outline" : "default"}
              >
                <Link href="/login">
                  {plan.name === "紫水晶" ? "免费注册" : "立即订阅"}
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          未使用的额度可以结转到下一个计费周期
        </p>
      </div>
    </section>
  )
}