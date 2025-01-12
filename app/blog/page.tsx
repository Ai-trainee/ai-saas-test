"use client"

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { CalendarDays, User2, ArrowRight, Search, Clock, Rss, Filter } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Input } from "@/components/ui/input"
import Head from 'next/head'
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

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
  const [isLoading, setIsLoading] = useState(true)
  const headerRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95])
  const headerBlur = useTransform(scrollY, [0, 100], [0, 8])

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
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const filteredPosts = posts
    .filter(post => !selectedTag || post.tags?.includes(selectedTag))
    .filter(post =>
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )

  const handleSubscribe = async () => {
    // TODO: Implement RSS feed subscription
    window.open('/api/rss', '_blank')
  }

  return (
    <>
      <Head>
        <title>AI进修生博客 - 探索AI技术前沿</title>
        <meta name="description" content="探索AI技术前沿，分享实践经验，助力学习成长。最新的AI技术研究、应用实践和学习资源。" />
        <meta name="keywords" content="AI, 人工智能, 机器学习, 深度学习, 技术博客, 编程教程" />
        <meta property="og:title" content="AI进修生博客 - 探索AI技术前沿" />
        <meta property="og:description" content="探索AI技术前沿，分享实践经验，助力学习成长。" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://aitrainee.com/blog" />
        <meta property="og:image" content="https://aitrainee.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AI进修生博客 - 探索AI技术前沿" />
        <meta name="twitter:description" content="探索AI技术前沿，分享实践经验，助力学习成长。" />
        <meta name="twitter:image" content="https://aitrainee.com/twitter-card.png" />
        <link rel="alternate" type="application/rss+xml" title="AI进修生博客" href="/api/rss" />
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
            },
            "blogPost": posts.map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt,
              "datePublished": post.date,
              "author": {
                "@type": "Person",
                "name": post.author || "AI进修生"
              },
              "url": `https://aitrainee.com/blog/${post.slug}`
            }))
          })}
        </script>
      </Head>

      <div className="blog-container">
        <motion.div
          ref={headerRef}
          style={{
            opacity: headerOpacity,
            backdropFilter: `blur(${headerBlur}px)`
          }}
          className="sticky top-0 z-10 bg-white/50"
        >
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
                  AI进修生博客
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  探索AI技术前沿，分享实践经验，助力学习成长
                </p>
              </motion.div>

              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="搜索文章、标签..."
                    className="pl-10 bg-white/80 border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-gray-900 placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-400"
                    onClick={handleSubscribe}
                  >
                    <Rss className="h-4 w-4 mr-2" />
                    订阅更新
                  </Button>
                  <div className="relative group">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-600 hover:text-gray-900 border-gray-200 hover:border-gray-400"
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      标签筛选
                    </Button>
                    <div className="absolute top-full right-0 mt-2 p-4 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px] z-20">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedTag(null)}
                          className={`blog-tag ${!selectedTag ? 'active' : ''}`}
                        >
                          全部
                        </button>
                        {allTags.map(tag => (
                          <button
                            key={tag}
                            onClick={() => setSelectedTag(tag)}
                            className={`blog-tag ${selectedTag === tag ? 'active' : ''}`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="blog-card">
                    <Skeleton className="h-48 rounded-t-lg" />
                    <div className="p-6">
                      <Skeleton className="h-4 w-3/4 mb-4" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-4 w-full mb-4" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link href={`/blog/${post.slug}`} className="block h-full">
                      <article className="blog-card group h-full flex flex-col">
                        {post.coverImage && (
                          <div className="relative h-48 overflow-hidden">
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="flex-1 p-6">
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
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
                                <Clock className="h-4 w-4" />
                                {post.readingTime}
                              </div>
                            )}
                          </div>
                          <h2 className="blog-card-title group-hover:text-blue-600 transition-colors duration-200">
                            {post.title}
                          </h2>
                          <p className="blog-card-excerpt mb-6">
                            {post.excerpt}
                          </p>
                          <div className="mt-auto flex items-center justify-between">
                            <div className="flex gap-2 flex-wrap">
                              {post.tags?.map(tag => (
                                <span
                                  key={tag}
                                  className="blog-tag"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                            <ArrowRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all duration-200" />
                          </div>
                        </div>
                      </article>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl text-gray-600 mb-4">没有找到相关文章</h3>
                <p className="text-gray-500">
                  尝试使用其他关键词搜索，或者
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedTag(null)
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                  >
                    查看所有文章
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 