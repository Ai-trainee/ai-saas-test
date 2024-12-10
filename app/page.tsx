import { HeroSection } from "@/components/hero-section"
import { PricingSection } from "@/components/pricing-section"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <HeroSection />
      <PricingSection />
    </main>
  )
}