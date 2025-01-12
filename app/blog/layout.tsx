"use client"

import { useTheme } from 'next-themes'
import { useEffect } from 'react'

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { setTheme } = useTheme()

  // 强制使用白色主题
  useEffect(() => {
    setTheme('light')
  }, [setTheme])

  return (
    <div className="min-h-screen bg-white">
      <style jsx global>{`
        .blog-content {
          color: #374151;
        }
        .blog-content h1,
        .blog-content h2,
        .blog-content h3,
        .blog-content h4,
        .blog-content h5,
        .blog-content h6 {
          color: #111827;
          font-weight: 600;
          margin-top: 2em;
          margin-bottom: 1em;
          line-height: 1.3;
        }
        .blog-content p {
          color: #374151;
          line-height: 1.8;
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
          background-color: #f8fafc;
          border-left: 4px solid #2563eb;
          color: #4b5563;
          padding: 1.5rem;
          margin: 2em 0;
          border-radius: 0.5rem;
          font-style: italic;
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
          font-size: inherit;
        }
        .blog-content img {
          border-radius: 0.75rem;
          margin: 2em auto;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          max-width: 100%;
          height: auto;
          display: block;
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
        .blog-content td {
          color: #374151;
        }
        .blog-card {
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .blog-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .blog-card-title {
          color: #111827;
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
          margin-bottom: 0.5rem;
        }
        .blog-card-excerpt {
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.6;
        }
        .blog-card-meta {
          color: #9ca3af;
          font-size: 0.75rem;
        }
        .blog-tag {
          background-color: #f3f4f6;
          color: #4b5563;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .blog-tag:hover {
          background-color: #e5e7eb;
        }
      `}</style>
      {children}
    </div>
  )
}
