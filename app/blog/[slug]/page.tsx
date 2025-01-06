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
      <div className="blog-container">
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded w-3/4"></div>
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/4"></div>
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded"></div>
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-2/3"></div>
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

      <div className="blog-container">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-12"
            >
              <Link href="/blog" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-12 group">
                <ArrowLeft className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                返回文章列表
              </Link>

              {post.coverImage && (
                <motion.div
                  style={{ opacity, scale }}
                  className="relative h-[50vh] mb-12 rounded-2xl overflow-hidden shadow-xl"
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

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 tracking-tight leading-tight">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-8">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {post.date}
                </div>
                <div className="flex items-center gap-2">
                  <User2 className="h-4 w-4" />
                  {post.author || 'AI进修生'}
                </div>
                {post.readingTime && (
                  <div className="flex items-center gap-2">
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
                <div className="flex gap-2 mb-12">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="blog-tag"
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
              className="blog-content prose prose-lg max-w-none"
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
                className="mt-24 border-t border-gray-100 pt-16"
              >
                <h2 className="text-3xl font-bold mb-12 text-gray-900">相关文章</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost) => (
                    <Link
                      key={relatedPost.slug}
                      href={`/blog/${relatedPost.slug}`}
                      className="group"
                    >
                      <article className="blog-card h-full flex flex-col">
                        <div className="relative h-40 overflow-hidden rounded-t-lg">
                          {relatedPost.coverImage ? (
                            <Image
                              src={relatedPost.coverImage}
                              alt={relatedPost.title}
                              fill
                              className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gray-50" />
                          )}
                        </div>
                        <div className="flex-1 p-6">
                          <h3 className="blog-card-title group-hover:text-blue-600 transition-colors duration-200">
                            {relatedPost.title}
                          </h3>
                        </div>
                      </article>
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
          padding: 0.75rem;
          background-color: #fee2e2;
          border-radius: 0.5rem;
        }
        .blog-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #374151;
        }
        .blog-content > * + * {
          margin-top: 1.5em;
        }
        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4,
        .blog-content h5,
        .blog-content h6 {
          color: #111827;
          font-weight: 600;
          line-height: 1.3;
          margin-top: 2em;
          margin-bottom: 1em;
        }
        .blog-content h1 {
          font-size: 2.25em;
        }
        .blog-content h2 {
          font-size: 1.875em;
        }
        .blog-content h3 {
          font-size: 1.5em;
        }
        .blog-content p {
          margin: 1.5em 0;
        }
        .blog-content a {
          color: #2563eb;
          text-decoration: none;
          border-bottom: 1px solid #2563eb;
          transition: all 0.2s ease;
        }
        .blog-content a:hover {
          color: #1d4ed8;
          border-bottom-color: #1d4ed8;
        }
        .blog-content blockquote {
          border-left: 4px solid #2563eb;
          background-color: #f8fafc;
          padding: 1.5rem;
          margin: 2em 0;
          border-radius: 0.5rem;
          font-style: italic;
          color: #4b5563;
        }
        .blog-content code {
          background-color: #f1f5f9;
          color: #2563eb;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
        .blog-content pre {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 1.5rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 2em 0;
          font-size: 0.875em;
          line-height: 1.7;
        }
        .blog-content pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
          border-radius: 0;
        }
        .blog-content img {
          border-radius: 0.75rem;
          margin: 2em auto;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          max-width: 100%;
          height: auto;
          display: block;
        }
        .blog-content ul,
        .blog-content ol {
          margin: 1.5em 0;
          padding-left: 1.5em;
        }
        .blog-content li {
          margin: 0.5em 0;
        }
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 2em 0;
          font-size: 0.875em;
        }
        .blog-content th,
        .blog-content td {
          border: 1px solid #e5e7eb;
          padding: 0.75em 1em;
          text-align: left;
        }
        .blog-content th {
          background-color: #f8fafc;
          font-weight: 600;
          color: #111827;
        }
      `}</style>
    </>
  )
}