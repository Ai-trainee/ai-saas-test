"use client"

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, User2, Tag, ArrowRight, Search } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Input } from "@/components/ui/input"
import Head from 'next/head'

interface Post {
  slug: string
  title: string
  date: string
  excerpt: string
  author: string
  tags: string[]
  readingTime?: string
  coverImage?: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const headerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8])

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/posts')
        const data = await response.json()
        setPosts(data)
        
        const tags = Array.from(new Set(data.flatMap((post: Post) => post.tags || []))) as string[]
        setAllTags(tags)
      } catch (error) {
        console.error('Error fetching posts:', error)
      }
    }

    fetchPosts()
  }, [])

  const filteredPosts = posts
    .filter(post => !selectedTag || post.tags?.includes(selectedTag))
    .filter(post => 
      searchQuery === "" || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    )

  return (
    <>
      <Head>
        <title>AI进修生博客 - 探索AI技术前沿</title>
        <meta name="description" content="探索AI技术前沿，分享实践经验，助力学习成长。最新的AI技术研究、应用实践和学习资源。" />
        <meta property="og:title" content="AI进修生博客 - 探索AI技术前沿" />
        <meta property="og:description" content="探索AI技术前沿，分享实践经验，助力学习成长。" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "AI进修生博客",
            "description": "探索AI技术前沿，分享实践经验，助力学习成长",
            "url": "https://aitrainee.com/blog",
            "publisher": {
              "@type": "Organization",
              "name": "AI进修生",
              "logo": {
                "@type": "ImageObject",
                "url": "https://aitrainee.com/logo.png"
              }
            }
          })}
        </script>
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-background to-background/50">
        <motion.div 
          ref={headerRef}
          style={{ opacity: headerOpacity }}
          className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b"
        >
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
                  AI进修生博客
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  探索AI技术前沿，分享实践经验，助力学习成长
                </p>
              </motion.div>

              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="搜索文章..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
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
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTag === tag
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="group h-full hover:shadow-lg transition-all duration-300 overflow-hidden bg-gradient-to-br from-card to-card/50 border border-card-border/50">
                      {post.coverImage && (
                        <div className="relative h-48 overflow-hidden">
                          <Image
                            src={post.coverImage}
                            alt={post.title}
                            fill
                            className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
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
                        <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2 flex-wrap">
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
      </div>
    </>
  )
} 