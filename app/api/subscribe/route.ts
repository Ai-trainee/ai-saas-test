import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

        // 验证邮箱格式
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        // 保存订阅者邮箱
        const subscribersPath = path.join(process.cwd(), 'app/content/subscribers.json')
        let subscribers: string[] = []

        try {
            if (fs.existsSync(subscribersPath)) {
                const fileContents = fs.readFileSync(subscribersPath, 'utf8')
                subscribers = JSON.parse(fileContents)
            }
        } catch (error) {
            console.error('Error reading subscribers:', error)
        }

        // 检查是否已订阅
        if (subscribers.includes(email)) {
            return NextResponse.json(
                { error: 'Email already subscribed' },
                { status: 400 }
            )
        }

        subscribers.push(email)

        // 确保目录存在
        const contentDir = path.join(process.cwd(), 'app/content')
        if (!fs.existsSync(contentDir)) {
            fs.mkdirSync(contentDir, { recursive: true })
        }

        fs.writeFileSync(subscribersPath, JSON.stringify(subscribers, null, 2))

        // 发送欢迎邮件
        await resend.emails.send({
            from: 'AI进修生 <newsletter@aitrainee.com>',
            to: email,
            subject: '感谢订阅 AI进修生博客',
            html: `
        <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #111827; font-size: 24px; margin-bottom: 20px;">感谢订阅 AI进修生博客！</h1>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
            您已成功订阅 AI进修生博客的更新通知。我们会在发布新文章时第一时间通知您。
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
            您可以随时访问我们的博客：<a href="https://aitrainee.com/blog" style="color: #2563eb; text-decoration: none;">https://aitrainee.com/blog</a>
          </p>
          
          <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              如果您想取消订阅，请点击 <a href="https://aitrainee.com/unsubscribe?email=${encodeURIComponent(email)}" style="color: #2563eb; text-decoration: none;">这里</a>
            </p>
          </div>
        </div>
      `,
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error handling subscription:', error)
        return NextResponse.json(
            { error: 'Failed to process subscription' },
            { status: 500 }
        )
    }
} 