import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

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

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Error reading posts:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
} 