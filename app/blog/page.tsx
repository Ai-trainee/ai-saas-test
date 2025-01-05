"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, User2, Tag, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  author: string
  tags: string[]
  readingTime?: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts')
        const data = await response.json()
        setPosts(data)
        
        // 收集所有标签
        const tags = Array.from(new Set(data.flatMap((post: Post) => post.tags || [])))
        setAllTags(tags)
      } catch (error) {
        console.error('Error fetching posts:', error)
      }
    }

    fetchPosts()
  }, [])

  const filteredPosts = selectedTag
    ? posts.filter(post => post.tags?.includes(selectedTag))
    : posts

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-4">AI进修生博客</h1>
          <p className="text-xl text-muted-foreground mb-8">
            探索AI技术前沿，分享实践经验，助力学习成长
          </p>
        </motion.div>

        {/* 标签过滤器 */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-sm ${
              !selectedTag
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80'
            }`}
          >
            全部
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-sm ${
                selectedTag === tag
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted hover:bg-muted/80'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <motion.div
              key={post.slug}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Link href={`/blog/${post.slug}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        {post.date}
                      </div>
                      <div className="flex items-center gap-1">
                        <User2 className="h-4 w-4" />
                        {post.author || 'AI进修生'}
                      </div>
                      {post.readingTime && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-4 w-4" />
                          {post.readingTime}
                        </div>
                      )}
                    </div>
                    <CardTitle className="group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {post.tags?.map(tag => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-muted rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <ArrowRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 