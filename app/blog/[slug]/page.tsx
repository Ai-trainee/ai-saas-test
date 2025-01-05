"use client"

import { useEffect, useState } from 'react'
import { notFound } from 'next/navigation'

interface PostContent {
  title: string
  date: string
  content: string
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<PostContent | null>(null)
  const [loading, setLoading] = useState(true)

  // 处理HTML内容，优化图片显示
  const processContent = (content: string) => {
    // 替换图片标签，添加样式和错误处理
    return content.replace(
      /<img([^>]*)src="([^"]*)"([^>]*)>/g,
      (match, before, src, after) => {
        // 处理视频预览图
        if (before.includes('video_player_tmpl')) {
          return match; // 保持视频预览图不变
        }

        // 处理data-src属性
        const actualSrc = src.includes('data-src') ? src.match(/data-src="([^"]*)"/)?.[1] || src : src;
        
        // 为图片添加加载失败处理和样式
        return `<img${before}src="${actualSrc}"${after} 
          onerror="this.onerror=null; this.style.display='none'; this.insertAdjacentHTML('afterend', '<div class=\\'image-error\\'>图片加载失败</div>')"
          loading="lazy"
          referrerpolicy="no-referrer"
          style="max-width: 100%; height: auto; display: block; margin: 20px auto;"
        >`;
      }
    );
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.slug}`)
        if (!response.ok) {
          throw new Error('Post not found')
        }
        const data = await response.json()
        setPost(data)
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
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/4 mb-8"></div>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded"></div>
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
      <article className="prose prose-lg dark:prose-invert mx-auto">
        <h1>{post.title}</h1>
        <p className="text-muted-foreground">{post.date}</p>
        <div 
          dangerouslySetInnerHTML={{ 
            __html: processContent(post.content)
          }}
          className="mt-8 [&_.image-error]:text-red-500 [&_.image-error]:text-sm [&_.image-error]:mt-2"
        />
      </article>

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