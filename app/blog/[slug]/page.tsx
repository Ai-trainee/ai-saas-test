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
          dangerouslySetInnerHTML={{ __html: post.content }}
          className="mt-8"
        />
      </article>
    </div>
  )
} 