import { NextResponse } from 'next/server'
import QRCode from 'qrcode'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const url = searchParams.get('url')

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 })
        }

        const qrCode = await QRCode.toDataURL(url, {
            width: 400,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        })

        return NextResponse.json({ qrCode })
    } catch (error) {
        console.error('Error generating QR code:', error)
        return NextResponse.json(
            { error: 'Failed to generate QR code' },
            { status: 500 }
        )
    }
} 