import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/navbar'
import { Toaster } from '@/components/ui/toaster'
import { FloatingBot } from '@/components/floating-bot'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI进修生 - 你的学习伙伴',
  description: '使用AI工具提升你的学习效率',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          {children}
          <FloatingBot />
          <Toaster />
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