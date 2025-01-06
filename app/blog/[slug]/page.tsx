"use client"

import { useEffect, useState, useRef } from 'react'
import { notFound } from 'next/navigation'
import { motion, useScroll, useTransform } from 'framer-motion'
import { CalendarDays, User2, Tag, Share2, ArrowLeft, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Head from 'next/head'
import Image from 'next/image'

interface PostContent {
  title: string
  date: string
  content: string
  author: string
  tags: string[]
  readingTime?: string
  coverImage?: string
  excerpt?: string
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<PostContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedPosts, setRelatedPosts] = useState<Array<{ slug: string; title: string; coverImage?: string }>>([])
  const contentRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: contentRef,
    offset: ["start start", "end start"]
  })

  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.1], [1, 0.95])

  const processContent = (content: string) => {
    return content.replace(
      /<img([^>]*)src="([^"]*)"([^>]*)>/g,
      (match, before, src, after) => {
        if (before.includes('video_player_tmpl')) {
          return match;
        }

        const actualSrc = src.includes('data-src') ? src.match(/data-src="([^"]*)"/)?.[1] || src : src;
        
        return `<img${before}src="${actualSrc}"${after} 
          onerror="this.onerror=null; this.style.display='none'; this.insertAdjacentHTML('afterend', '<div class=\\'image-error\\'>图片加载失败</div>')"
          loading="lazy"
          referrerpolicy="no-referrer"
          class="rounded-lg shadow-lg"
        >`;
      }
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || post?.title,
          url: window.location.href,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    }
  }

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.slug}`)
        if (!response.ok) {
          throw new Error('Post not found')
        }
        const data = await response.json()
        setPost(data)

        const relatedResponse = await fetch('/api/posts')
        const allPosts = await relatedResponse.json()
        const related = allPosts
          .filter((p: any) => p.slug !== params.slug)
          .slice(0, 3)
        setRelatedPosts(related)
      } catch (error) {
        console.error('Error fetching post:', error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-100 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 rounded w-1/4"></div>
              <div className="h-64 bg-gray-100 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-100 rounded"></div>
                <div className="h-4 bg-gray-100 rounded"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return notFound()
  }

  return (
    <>
      <Head>
        <title>{post.title} - AI进修生博客</title>
        <meta name="description" content={post.excerpt || post.title} />
        <meta property="og:title" content={`${post.title} - AI进修生博客`} />
        <meta property="og:description" content={post.excerpt || post.title} />
        {post.coverImage && <meta property="og:image" content={post.coverImage} />}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": post.title,
            "datePublished": post.date,
            "author": {
              "@type": "Person",
              "name": post.author || "AI进修生"
            },
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

      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <Link href="/blog" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-8 group">
                <ArrowLeft className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                返回文章列表
              </Link>

              {post.coverImage && (
                <motion.div
                  style={{ opacity, scale }}
                  className="relative h-[40vh] mb-8 rounded-xl overflow-hidden shadow-lg"
                >
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </motion.div>
              )}

              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-gray-500 hover:text-gray-900"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  分享
                </Button>
              </div>

              {post.tags && (
                <div className="flex gap-2 mb-8">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.article
              ref={contentRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="prose prose-lg mx-auto"
            >
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: processContent(post.content)
                }}
                className="mt-8 [&_.image-error]:text-red-500 [&_.image-error]:text-sm [&_.image-error]:mt-2"
              />
            </motion.article>

            {relatedPosts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-16 border-t border-gray-100 pt-16"
              >
                <h2 className="text-2xl font-bold mb-8 text-gray-900">相关文章</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.slug}
                      href={`/blog/${relatedPost.slug}`}
                      className="group"
                    >
                      <div className="relative h-40 mb-4 rounded-lg overflow-hidden shadow-sm">
                        {relatedPost.coverImage ? (
                          <Image
                            src={relatedPost.coverImage}
                            alt={relatedPost.title}
                            fill
                            className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gray-50" />
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .image-error {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.5rem;
          text-align: center;
          padding: 0.5rem;
          background-color: #fee2e2;
          border-radius: 0.375rem;
        }
        img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 20px auto;
          border-radius: 0.5rem;
        }
        .rich_pages {
          max-width: 100% !important;
          height: auto !important;
        }
        .rich_pages img {
          max-width: 100% !important;
          height: auto !important;
        }
        .rich_pages.wxw-img {
          width: auto !important;
          height: auto !important;
          object-fit: contain !important;
        }
        .prose * {
          background-color: transparent !important;
        }
        .prose {
          color: #374151;
        }
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          color: #111827;
          font-weight: 600;
          margin-top: 2em;
          margin-bottom: 1em;
        }
        .prose p, .prose span {
          color: #374151;
          line-height: 1.8;
        }
        .prose a {
          color: #2563eb;
          text-decoration: none;
          border-bottom: 1px solid #2563eb;
        }
        .prose a:hover {
          opacity: 0.8;
        }
        .prose blockquote {
          border-left: 4px solid #2563eb;
          background-color: #f3f4f6;
          padding: 1rem;
          border-radius: 0.5rem;
          color: #4b5563;
          margin: 1.5em 0;
        }
        .prose code {
          background-color: #f3f4f6;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.875em;
          color: #2563eb;
        }
        .prose pre {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5em 0;
        }
        .prose pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
          border-radius: 0;
        }
        .prose ul, .prose ol {
          padding-left: 1.5em;
          margin: 1em 0;
        }
        .prose li {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          color: #374151;
        }
        .prose table {
          width: 100%;
          border-collapse: collapse;
          margin: 2em 0;
        }
        .prose th, .prose td {
          border: 1px solid #e5e7eb;
          padding: 0.75em;
          text-align: left;
        }
        .prose th {
          background-color: #f9fafb;
          font-weight: 600;
          color: #111827;
        }
        .prose td {
          color: #374151;
        }
      `}</style>
    </>
  )
}