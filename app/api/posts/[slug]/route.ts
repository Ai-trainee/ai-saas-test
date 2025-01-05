import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // 读取文章元数据
    const metadataPath = path.join(
      process.cwd(),
      'app/content/metadata',
      `${params.slug}.json`
    )
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'))

    // 读取HTML内容
    const contentPath = path.join(
      process.cwd(),
      'app/content/posts',
      `${params.slug}.html`
    )
    const content = fs.readFileSync(contentPath, 'utf8')

    return NextResponse.json({
      ...metadata,
      content,
    })
  } catch (error) {
    console.error('Error reading post:', error)
    return NextResponse.json(
      { error: 'Post not found' },
      { status: 404 }
    )
  }
} 