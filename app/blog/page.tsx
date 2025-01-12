"use client"

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, User2, Tag, ArrowRight, Search, Clock } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { Input } from "@/components/ui/input"
import Head from 'next/head'
import { useLanguage } from "@/contexts/language-context"
import { translations } from "@/config/language"

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
  const { language } = useLanguage()
  const t = translations.blog[language]

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
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
        <meta property="og:title" content={t.meta.title} />
        <meta property="og:description" content={t.meta.description} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": t.title,
            "description": t.meta.schemaDescription,
            "url": "https://aitrainee.com/blog",
            "publisher": {
              "@type": "Organization",
              "name": t.author,
              "logo": {
                "@type": "ImageObject",
                "url": "https://aitrainee.com/logo.png"
              }
            }
          })}
        </script>
      </Head>

      <div className="blog-container">
        <motion.div
          ref={headerRef}
          style={{ opacity: headerOpacity }}
          className="sticky top-0 z-10 bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm"
        >
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
              >
                <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 tracking-tight">
                  {t.title}
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  {t.subtitle}
                </p>
              </motion.div>

              <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder={t.search}
                    className="pl-10 bg-white border-gray-200 focus:border-gray-400 focus:ring-gray-400 text-gray-900 placeholder-gray-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-wrap gap-2 justify-center md:justify-end">
                  <button
                    onClick={() => setSelectedTag(null)}
                    className={`blog-tag ${!selectedTag ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}`}
                  >
                    {t.tags.all}
                  </button>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedTag(tag)}
                      className={`blog-tag ${selectedTag === tag ? 'bg-gray-900 text-white hover:bg-gray-800' : ''}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
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
                            {post.author || t.author}
                          </div>
                          {post.readingTime && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {post.readingTime} {t.readingTime}
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
          </div>
        </div>
      </div>
    </>
  )
} 