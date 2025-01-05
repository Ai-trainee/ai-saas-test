import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/navbar'
import { Toaster } from '@/components/ui/toaster'
import { FloatingBot } from '@/components/floating-bot'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI进修生 - 你的AI学习与成长伙伴',
  description: '专业的AI学习平台，提供AI工具、技术博客、学习资源和咨询服务。我们致力于帮助用户掌握AI技术，提升学习效率，实现个人成长。',
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