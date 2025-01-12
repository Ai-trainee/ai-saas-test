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
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const likesPath = path.join(process.cwd(), 'app/content/likes', `${params.slug}.json`)
        let likes = {
            count: 0,
            users: [] as string[]
        }

        try {
            if (fs.existsSync(likesPath)) {
                const fileContents = fs.readFileSync(likesPath, 'utf8')
                likes = JSON.parse(fileContents)
            }
        } catch (error) {
            console.error('Error reading likes:', error)
        }

        const userId = session.user?.email || session.user?.id
        if (!userId) {
            return NextResponse.json({ error: 'Invalid user' }, { status: 400 })
        }

        const userIndex = likes.users.indexOf(userId)
        if (userIndex === -1) {
            // 用户还没有点赞，添加点赞
            likes.users.push(userId)
            likes.count++
        } else {
            // 用户已经点赞，取消点赞
            likes.users.splice(userIndex, 1)
            likes.count--
        }

        // 确保目录存在
        const likesDir = path.join(process.cwd(), 'app/content/likes')
        if (!fs.existsSync(likesDir)) {
            fs.mkdirSync(likesDir, { recursive: true })
        }

        fs.writeFileSync(likesPath, JSON.stringify(likes, null, 2))

        return NextResponse.json({
            likes: likes.count,
            isLiked: userIndex === -1 // 返回新的点赞状态
        })
    } catch (error) {
        console.error('Error handling like:', error)
        return NextResponse.json(
            { error: 'Failed to handle like' },
            { status: 500 }
        )
    }
}

export async function GET(
    request: Request,
    { params }: { params: { slug: string } }
) {
    try {
        const session = await getServerSession(authOptions)
        const likesPath = path.join(process.cwd(), 'app/content/likes', `${params.slug}.json`)
        let likes = {
            count: 0,
            users: [] as string[]
        }

        if (fs.existsSync(likesPath)) {
            const fileContents = fs.readFileSync(likesPath, 'utf8')
            likes = JSON.parse(fileContents)
        }

        let isLiked = false
        if (session?.user?.email || session?.user?.id) {
            const userId = session.user.email || session.user.id
            isLiked = likes.users.includes(userId)
        }

        return NextResponse.json({
            likes: likes.count,
            isLiked
        })
    } catch (error) {
        console.error('Error reading likes:', error)
        return NextResponse.json(
            { error: 'Failed to fetch likes' },
            { status: 500 }
        )
    }
} 