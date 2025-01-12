import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email')

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            )
        }

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

        const index = subscribers.indexOf(email)
        if (index === -1) {
            return NextResponse.json(
                { error: 'Email not found in subscribers list' },
                { status: 404 }
            )
        }

        subscribers.splice(index, 1)
        fs.writeFileSync(subscribersPath, JSON.stringify(subscribers, null, 2))

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error handling unsubscribe:', error)
        return NextResponse.json(
            { error: 'Failed to process unsubscribe request' },
            { status: 500 }
        )
    }
} 