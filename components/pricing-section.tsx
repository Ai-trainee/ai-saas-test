"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/config/language"

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

export function PricingSection() {
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly")
  const { language } = useLanguage()
  const t = translations.pricing[language]

  const plans: Plan[] = [
    {
      name: t.plans.amethyst.name,
      icon: "💎",
      description: t.plans.amethyst.description,
      price: {
        monthly: 0,
        yearly: 0
      },
      color: "from-purple-500/20 to-purple-500/10",
      features: t.plans.amethyst.features.map(name => ({ name, included: true }))
    },
    {
      name: t.plans.sapphire.name,
      icon: "🌟",
      description: t.plans.sapphire.description,
      price: {
        monthly: 19.99,
        yearly: 167.88
      },
      color: "from-blue-500/20 to-blue-500/10",
      popular: true,
      features: t.plans.sapphire.features.map((name, index) => ({
        name,
        included: index < 4
      }))
    },
    {
      name: t.plans.jade.name,
      icon: "✨",
      description: t.plans.jade.description,
      price: {
        monthly: 29.99,
        yearly: 251.88
      },
      color: "from-emerald-500/20 to-emerald-500/10",
      features: t.plans.jade.features.map((name, index) => ({
        name,
        included: index < 5
      }))
    },
    {
      name: t.plans.ruby.name,
      icon: "👑",
      description: t.plans.ruby.description,
      price: {
        monthly: 99.99,
        yearly: 839.88
      },
      color: "from-red-500/20 to-red-500/10",
      features: t.plans.ruby.features.map(name => ({ name, included: true }))
    }
  ]

  return (
    <section className="w-full py-24 bg-gradient-to-b from-background to-background/50">
      <div className="container px-4 mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {t.subtitle}
          </p>

          <div className="flex items-center justify-center space-x-4 mb-8">
            <Button
              variant={billingInterval === "monthly" ? "default" : "outline"}
              onClick={() => setBillingInterval("monthly")}
              className="relative"
            >
              {t.monthly}
            </Button>
            <Button
              variant={billingInterval === "yearly" ? "default" : "outline"}
              onClick={() => setBillingInterval("yearly")}
              className="relative"
            >
              {t.yearly}
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {t.savePercent}
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
                  {t.mostPopular}
                </span>
              )}

              <div className="text-2xl mb-4">{plan.icon}</div>
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

              <div className="mb-6">
                <div className="text-3xl font-bold">
                  {plan.price[billingInterval] === 0 ? (
                    t.freeRegister
                  ) : (
                    <>
                      ¥{plan.price[billingInterval].toFixed(2)}
                      <span className="text-sm font-normal text-muted-foreground">
                        /{billingInterval === "monthly" ? t.monthly.toLowerCase() : t.yearly.toLowerCase()}
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
                variant={plan.name === t.plans.amethyst.name ? "outline" : "default"}
              >
                <Link href="/login">
                  {plan.name === t.plans.amethyst.name ? t.freeRegister : t.subscribe}
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          {t.unusedCredits}
        </p>
      </div>
    </section>
  )
}