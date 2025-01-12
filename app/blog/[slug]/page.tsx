"use client"

import { useEffect, useState, useRef } from 'react'
import { notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import { CalendarDays, User2, Share2, ArrowLeft, Clock, Copy, Check, List, X } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Head from 'next/head'
import Image from 'next/image'
import { Skeleton } from "@/components/ui/skeleton"
import { Toaster, toast } from 'react-hot-toast'

interface PostContent {
  title: string
  date: string
  content: string
  author: string
  tags: string[]
  readingTime?: string
  coverImage?: string
  excerpt?: string
  likes?: number
  comments?: Comment[]
}

interface Comment {
  id: string
  content: string
  author: {
    name: string
    image?: string
  }
  createdAt: string
  likes: number
}

interface TableOfContents {
  id: string
  text: string
  level: number
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState<PostContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedPosts, setRelatedPosts] = useState<Array<{ slug: string; title: string; coverImage?: string }>>([])
  const [toc, setToc] = useState<TableOfContents[]>([])
  const [readingProgress, setReadingProgress] = useState(0)
  const [showToc, setShowToc] = useState(false)
  const articleRef = useRef<HTMLDivElement>(null)
  const [showQRCode, setShowQRCode] = useState(false)
  const [qrCodeData, setQRCodeData] = useState<string | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [likes, setLikes] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [commentContent, setCommentContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoadingComments, setIsLoadingComments] = useState(false)

  const processContent = (content: string) => {
    // 处理图片
    content = content.replace(
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

    // 处理代码块
    content = content.replace(
      /<pre([^>]*)><code([^>]*)>([\s\S]*?)<\/code><\/pre>/g,
      (match, preAttrs, codeAttrs, code) => {
        const id = Math.random().toString(36).substring(7);
        return `
          <div class="relative group">
            <pre${preAttrs}><code${codeAttrs}>${code}</code></pre>
            <button
              class="absolute top-2 right-2 p-2 rounded-lg bg-gray-800 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
              onclick="copyCode('${id}')"
              id="copy-button-${id}"
            >
              <span class="copy-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </span>
              <span class="check-icon hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </span>
            </button>
            <div class="hidden">${code}</div>
          </div>
        `;
      }
    );

    return content;
  };

  const extractTableOfContents = (content: string) => {
    const div = document.createElement('div');
    div.innerHTML = content;

    const headings = Array.from(div.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    return headings.map(heading => {
      const id = heading.textContent?.toLowerCase().replace(/\s+/g, '-') || '';
      heading.id = id;
      return {
        id,
        text: heading.textContent || '',
        level: parseInt(heading.tagName[1])
      };
    });
  };

  const handleScroll = () => {
    if (articleRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const articleTop = articleRef.current.offsetTop;
      const articleHeight = articleRef.current.offsetHeight;

      const progress = Math.max(0, Math.min(100,
        ((scrollTop - articleTop) / (articleHeight - clientHeight)) * 100
      ));

      setReadingProgress(progress);
    }
  };

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
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
  };

  const generateQRCode = async () => {
    try {
      const response = await fetch(`/api/qrcode?url=${encodeURIComponent(window.location.href)}`)
      const data = await response.json()
      if (data.qrCode) {
        setQRCodeData(data.qrCode)
        setShowQRCode(true)
      }
    } catch (error) {
      console.error('Error generating QR code:', error)
      toast.error('生成二维码失败，请稍后重试')
    }
  }

  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.href)
    const title = encodeURIComponent(post?.title || '')
    let shareUrl = ''

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${title}&url=${url}`
        break
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        break
      case 'wechat':
        generateQRCode()
        return
    }

    window.open(shareUrl, '_blank')
  }

  const handleSubscribe = async (email: string) => {
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()
      if (response.ok) {
        toast.success('订阅成功！感谢您的关注')
      } else {
        toast.error(data.error || '订阅失败，请稍后重试')
      }
    } catch (error) {
      toast.error('订阅失败，请稍后重试')
    }
  }

  const handleLike = async () => {
    try {
      const response = await fetch(`/api/posts/${params.slug}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (response.ok) {
        setLikes(data.likes)
        setIsLiked(data.isLiked)
      } else {
        toast.error(data.error || '操作失败，请稍后重试')
      }
    } catch (error) {
      toast.error('操作失败，请稍后重试')
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentContent.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/posts/${params.slug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: commentContent })
      })

      const data = await response.json()
      if (response.ok) {
        setComments(prev => [...prev, data])
        setCommentContent('')
        toast.success('评论发布成功')
      } else {
        toast.error(data.error || '评论发布失败，请稍后重试')
      }
    } catch (error) {
      toast.error('评论发布失败，请稍后重试')
    } finally {
      setIsSubmitting(false)
    }
  }

  const fetchComments = async (page: number = 1) => {
    setIsLoadingComments(true)
    try {
      const response = await fetch(`/api/posts/${params.slug}/comments?page=${page}&limit=10`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
        setTotalPages(data.pagination.totalPages)
        setCurrentPage(data.pagination.page)
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoadingComments(false)
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    fetchComments(page)
  }

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // 添加代码复制功能
    const script = document.createElement('script');
    script.innerHTML = `
      function copyCode(id) {
        const codeBlock = document.querySelector(\`[id="copy-button-\${id}"\`).nextElementSibling;
        const code = codeBlock.textContent;
        navigator.clipboard.writeText(code).then(() => {
          const button = document.querySelector(\`[id="copy-button-\${id}"\`);
          button.querySelector('.copy-icon').classList.add('hidden');
          button.querySelector('.check-icon').classList.remove('hidden');
          setTimeout(() => {
            button.querySelector('.copy-icon').classList.remove('hidden');
            button.querySelector('.check-icon').classList.add('hidden');
          }, 2000);
        });
      }
    `;
    document.body.appendChild(script);
    return () => script.remove();
  }, []);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${params.slug}`)
        if (!response.ok) {
          throw new Error('Post not found')
        }
        const data = await response.json()
        setPost(data)
        setToc(extractTableOfContents(data.content))

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

  useEffect(() => {
    const fetchCommentsAndLikes = async () => {
      try {
        // 获取评论
        await fetchComments()

        // 获取点赞状态
        const likesResponse = await fetch(`/api/posts/${params.slug}/like`)
        if (likesResponse.ok) {
          const likesData = await likesResponse.json()
          setLikes(likesData.likes)
          setIsLiked(likesData.isLiked)
        }
      } catch (error) {
        console.error('Error fetching comments and likes:', error)
      }
    }

    fetchCommentsAndLikes()
  }, [params.slug])

  if (loading) {
    return (
      <div className="blog-container">
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
        <meta name="keywords" content={post.tags?.join(', ')} />
        <meta name="author" content={post.author || 'AI进修生'} />
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="referrer" content="no-referrer-when-downgrade" />
        <meta name="revisit-after" content="7 days" />
        <meta name="language" content="zh-CN" />

        {/* Open Graph */}
        <meta property="og:title" content={`${post.title} - AI进修生博客`} />
        <meta property="og:description" content={post.excerpt || post.title} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://aitrainee.com/blog/${params.slug}`} />
        {post.coverImage && <meta property="og:image" content={post.coverImage} />}
        <meta property="og:site_name" content="AI进修生" />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author || 'AI进修生'} />
        {post.tags?.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@aitrainee" />
        <meta name="twitter:creator" content="@aitrainee" />
        <meta name="twitter:title" content={`${post.title} - AI进修生博客`} />
        <meta name="twitter:description" content={post.excerpt || post.title} />
        {post.coverImage && <meta name="twitter:image" content={post.coverImage} />}

        {/* 结构化数据 */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://aitrainee.com/blog/${params.slug}`
            },
            "headline": post.title,
            "description": post.excerpt || post.title,
            "image": post.coverImage,
            "datePublished": post.date,
            "dateModified": post.date,
            "author": {
              "@type": "Person",
              "name": post.author || "AI进修生",
              "url": "https://aitrainee.com/about"
            },
            "publisher": {
              "@type": "Organization",
              "name": "AI进修生",
              "logo": {
                "@type": "ImageObject",
                "url": "https://aitrainee.com/logo.png"
              }
            },
            "keywords": post.tags?.join(', '),
            "articleSection": post.tags?.[0],
            "wordCount": post.content.split(/\s+/).length,
            "timeRequired": post.readingTime,
            "comment": {
              "@type": "Comment",
              "count": post.comments?.length || 0
            },
            "interactionStatistic": {
              "@type": "InteractionCounter",
              "interactionType": "https://schema.org/LikeAction",
              "userInteractionCount": post.likes || 0
            }
          })}
        </script>

        {/* 替代链接 */}
        <link rel="canonical" href={`https://aitrainee.com/blog/${params.slug}`} />
        <link rel="alternate" type="application/rss+xml" title="AI进修生博客" href="/api/rss" />
      </Head>

      <Toaster position="top-center" />

      {/* 阅读进度条 */}
      <div
        className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-50"
        style={{ transform: `translateX(${readingProgress - 100}%)` }}
      >
        <div className="h-full bg-blue-600 transition-transform duration-150" style={{ width: '100%' }} />
      </div>

      <div className="blog-container">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <Link href="/blog" className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-12 group">
                <ArrowLeft className="h-4 w-4 mr-2 transform group-hover:-translate-x-1 transition-transform" />
                返回文章列表
              </Link>

              {/* 文章目录按钮 */}
              <Button
                variant="outline"
                size="sm"
                className="fixed top-24 right-4 z-40 md:hidden"
                onClick={() => setShowToc(!showToc)}
              >
                <List className="h-4 w-4" />
              </Button>

              {/* 文章目录 */}
              <div className={`
                fixed top-32 right-4 w-64 bg-white p-4 rounded-lg shadow-lg border border-gray-100
                transition-transform duration-200 z-30
                md:block md:sticky md:top-32 md:right-auto md:transform-none
                ${showToc ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
              `}>
                <h4 className="text-lg font-semibold mb-4">目录</h4>
                <nav className="space-y-2">
                  {toc.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToHeading(item.id)}
                      className={`
                        block text-left w-full px-2 py-1 text-sm rounded hover:bg-gray-50
                        ${item.level === 1 ? 'font-semibold' : ''}
                        ${item.level === 2 ? 'pl-4' : ''}
                        ${item.level === 3 ? 'pl-6' : ''}
                        ${item.level === 4 ? 'pl-8' : ''}
                        ${item.level === 5 ? 'pl-10' : ''}
                        ${item.level === 6 ? 'pl-12' : ''}
                      `}
                    >
                      {item.text}
                    </button>
                  ))}
                </nav>
              </div>

              {post.coverImage && (
                <div className="relative h-[50vh] mb-12 rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
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
                    onClick={() => shareToSocial('wechat')}
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
            </div>

            <motion.div
              ref={articleRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="blog-content prose prose-lg max-w-none">
                <div
                  dangerouslySetInnerHTML={{
                    __html: processContent(post.content)
                  }}
                  className="mt-8 [&_.image-error]:text-red-500 [&_.image-error]:text-sm [&_.image-error]:mt-2"
                />

                {/* 订阅区域 */}
                <div className="my-16 p-8 bg-gray-50 rounded-2xl">
                  <div className="text-center max-w-2xl mx-auto">
                    <h3 className="text-2xl font-bold mb-4">订阅 AI进修生博客</h3>
                    <p className="text-gray-600 mb-8">
                      订阅我们的博客，第一时间获取最新的AI技术文章和教程。
                    </p>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        const form = e.target as HTMLFormElement
                        const email = (form.elements.namedItem('email') as HTMLInputElement).value
                        handleSubscribe(email)
                        form.reset()
                      }}
                      className="flex gap-4 max-w-md mx-auto"
                    >
                      <input
                        type="email"
                        name="email"
                        placeholder="输入您的邮箱地址"
                        required
                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <Button type="submit">
                        订阅
                      </Button>
                    </form>
                    <p className="text-sm text-gray-500 mt-4">
                      我们尊重您的隐私，您可以随时取消订阅。
                    </p>
                  </div>
                </div>

                {/* 文章互动区 */}
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-bold">文章互动</h3>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLike}
                        className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}
                      >
                        {isLiked ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                          </svg>
                        )}
                        {likes} 赞
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareToSocial('wechat')}
                        className="text-gray-500"
                      >
                        <Share2 className="h-5 w-5 mr-2" />
                        分享
                      </Button>
                    </div>
                  </div>

                  {/* 评论列表 */}
                  <div className="space-y-8">
                    <form onSubmit={handleComment} className="mb-8">
                      <div className="mb-4">
                        <textarea
                          value={commentContent}
                          onChange={(e) => setCommentContent(e.target.value)}
                          placeholder="写下你的评论..."
                          className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? '发布中...' : '发布评论'}
                        </Button>
                      </div>
                    </form>

                    {isLoadingComments ? (
                      <div className="space-y-6">
                        {[...Array(3)].map((_, index) => (
                          <div key={index} className="flex gap-4">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-32" />
                              </div>
                              <Skeleton className="h-4 w-full" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : comments.length > 0 ? (
                      <>
                        <div className="space-y-6">
                          {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-4">
                              {comment.author.image ? (
                                <Image
                                  src={comment.author.image}
                                  alt={comment.author.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  <User2 className="w-5 h-5 text-gray-500" />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium">{comment.author.name}</span>
                                  <span className="text-sm text-gray-500">
                                    {new Date(comment.createdAt).toLocaleDateString('zh-CN', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <p className="text-gray-700">{comment.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 分页 */}
                        {totalPages > 1 && (
                          <div className="flex justify-center gap-2 mt-8">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              上一页
                            </Button>
                            {[...Array(totalPages)].map((_, index) => (
                              <Button
                                key={index + 1}
                                variant={currentPage === index + 1 ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(index + 1)}
                              >
                                {index + 1}
                              </Button>
                            ))}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              下一页
                            </Button>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">暂无评论，来说两句吧~</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {relatedPosts.length > 0 && (
              <div className="mt-24 border-t border-gray-100 pt-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
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
              </div>
            )}

            {/* 微信分享二维码 */}
            {showQRCode && qrCodeData && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowQRCode(false)}>
                <div className="bg-white p-8 rounded-lg" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold">微信扫码分享</h4>
                    <button
                      onClick={() => setShowQRCode(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="w-64 h-64 bg-white rounded-lg overflow-hidden">
                    <img src={qrCodeData} alt="QR Code" className="w-full h-full" />
                  </div>
                  <p className="mt-4 text-sm text-gray-500 text-center">
                    打开微信扫一扫，分享到朋友圈
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}