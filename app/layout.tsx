import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { LanguageProvider } from '@/contexts/language-context'
import { Navbar } from '@/components/navbar'
import { Toaster } from '@/components/ui/toaster'
import { FloatingBot } from '@/components/floating-bot'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Trainee - Your Partner in AI Learning and Growth',
  description: 'Professional AI learning platform providing AI tools, tech blogs, learning resources and consulting services. We are dedicated to helping users master AI technology, improve learning efficiency, and achieve personal growth.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <Navbar />
            {children}
            <FloatingBot />
            <Toaster />
          </LanguageProvider>
          <div style={{ display: 'none' }}>
            {/* Google tag (gtag.js) */}
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-FH7M101Q01"></script>
            <script dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-FH7M101Q01');
              `
            }} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}