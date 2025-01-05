"use client"

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { CalendarDays, User2, Tag, Share2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface PostContent {
  title: string
  date: string
  content: string
  author: string
  tags: string[]
  readingTime?: string
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<PostContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedPosts, setRelatedPosts] = useState<Array<{ slug: string; title: string }>>([])

  // 处理HTML内容，优化图片显示
  const processContent = (content: string) => {
    // 替换图片标签，添加样式和错误处理
    return content.replace(
      /<img([^>]*)src="([^"]*)"([^>]*)>/g,
      (match, before, src, after) => {
        // 处理视频预览图
        if (before.includes('video_player_tmpl')) {
          return match;
        }

        // 处理data-src属性
        const actualSrc = src.includes('data-src') ? src.match(/data-src="([^"]*)"/)?.[1] || src : src;
        
        return `<img${before}src="${actualSrc}"${after} 
          onerror="this.onerror=null; this.style.display='none'; this.insertAdjacentHTML('afterend', '<div class=\\'image-error\\'>图片加载失败</div>')"
          loading="lazy"
          referrerpolicy="no-referrer"
          style="max-width: 100%; height: auto; display: block; margin: 20px auto;"
        >`;
      }
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.title,
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

        // 获取相关文章
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
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
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
    <div className="container mx-auto px-4 py-24">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link href="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回文章列表
          </Link>

          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
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
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto"
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
                  className="px-2 py-1 bg-muted rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </motion.div>

        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-lg dark:prose-invert mx-auto"
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
            className="mt-16"
          >
            <h2 className="text-2xl font-bold mb-4">相关文章</h2>
            <div className="grid gap-4">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.slug}
                  href={`/blog/${relatedPost.slug}`}
                  className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  {relatedPost.title}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
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
        }
        .rich_pages {
          max-width: 100% !important;
          height: auto !important;
        }
        .rich_pages img {
          max-width: 100% !important;
          height: auto !important;
        }
        /* 修复微信图片样式 */
        .rich_pages.wxw-img {
          width: auto !important;
          height: auto !important;
          object-fit: contain !important;
        }
        /* 移除默认白色背景 */
        .prose * {
          background-color: transparent !important;
        }
        /* 保持文本可读性 */
        .prose {
          color: inherit;
        }
        /* 继承主题颜色 */
        .prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
          color: inherit;
        }
        .prose p, .prose span {
          color: inherit;
        }
      `}</style>
    </div>
  )
}