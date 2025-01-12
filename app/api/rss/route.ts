import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function generateRSSFeed(posts: any[]) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aitrainee.com'
    const feedUrl = `${baseUrl}/api/rss`
    const now = new Date().toUTCString()

    const rssItems = posts
        .map(post => {
            const postUrl = `${baseUrl}/blog/${post.slug}`
            return `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <link>${postUrl}</link>
          <guid>${postUrl}</guid>
          <description><![CDATA[${post.excerpt}]]></description>
          <pubDate>${new Date(post.date).toUTCString()}</pubDate>
          ${post.author ? `<author>${post.author}</author>` : ''}
          ${post.tags?.map(tag => `<category>${tag}</category>`).join('\n          ') || ''}
        </item>
      `
        })
        .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>AI进修生博客</title>
    <link>${baseUrl}/blog</link>
    <description>探索AI技术前沿，分享实践经验，助力学习成长</description>
    <language>zh-CN</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/logo.png</url>
      <title>AI进修生博客</title>
      <link>${baseUrl}/blog</link>
    </image>
    ${rssItems}
  </channel>
</rss>`
}

export async function GET() {
    try {
        const postsDirectory = path.join(process.cwd(), 'app/content/metadata')
        const fileNames = fs.readdirSync(postsDirectory)

        const posts = fileNames
            .filter(fileName => fileName.endsWith('.json'))
            .map(fileName => {
                const fullPath = path.join(postsDirectory, fileName)
                const fileContents = fs.readFileSync(fullPath, 'utf8')
                const metadata = JSON.parse(fileContents)

                return {
                    slug: fileName.replace(/\.json$/, ''),
                    ...metadata,
                }
            })
            .sort((a, b) => (new Date(b.date)).getTime() - (new Date(a.date)).getTime())

        const rss = generateRSSFeed(posts)

        return new NextResponse(rss, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600, s-maxage=18000',
            },
        })
    } catch (error) {
        console.error('Error generating RSS feed:', error)
        return NextResponse.json(
            { error: 'Failed to generate RSS feed' },
            { status: 500 }
        )
    }
} 