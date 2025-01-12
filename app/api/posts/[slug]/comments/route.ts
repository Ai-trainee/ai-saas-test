import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

export async function POST(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: '请先登录' }, { status: 401 })
        }

        const { content } = await request.json()
        if (!content) {
            return NextResponse.json({ error: '评论内容不能为空' }, { status: 400 })
        }

        const commentsPath = path.join(process.cwd(), 'app/content/comments', `${params.slug}.json`)
        let comments = []

        try {
            if (fs.existsSync(commentsPath)) {
                const fileContents = fs.readFileSync(commentsPath, 'utf8')
                comments = JSON.parse(fileContents)
            }
        } catch (error) {
            console.error('Error reading comments:', error)
        }

        const newComment = {
            id: Date.now().toString(),
            content,
            author: {
                name: session.user.name || '匿名用户',
                image: session.user.image
            },
            createdAt: new Date().toISOString(),
            likes: 0
        }

        comments.push(newComment)

        // 确保目录存在
        const commentsDir = path.join(process.cwd(), 'app/content/comments')
        if (!fs.existsSync(commentsDir)) {
            fs.mkdirSync(commentsDir, { recursive: true })
        }

        fs.writeFileSync(commentsPath, JSON.stringify(comments, null, 2))

        return NextResponse.json(newComment)
    } catch (error) {
        console.error('Error creating comment:', error)
        return NextResponse.json(
            { error: '评论发布失败' },
            { status: 500 }
        )
    }
}

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const { searchParams } = new URL(request.url)
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const skip = (page - 1) * limit

        const commentsPath = path.join(process.cwd(), 'app/content/comments', `${params.slug}.json`)
        let comments = []
        let total = 0

        if (fs.existsSync(commentsPath)) {
            const fileContents = fs.readFileSync(commentsPath, 'utf8')
            comments = JSON.parse(fileContents)
            total = comments.length
            comments = comments.slice(skip, skip + limit)
        }

        return NextResponse.json({
            comments,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error reading comments:', error)
        return NextResponse.json(
            { error: '获取评论失败' },
            { status: 500 }
        )
    }
} 