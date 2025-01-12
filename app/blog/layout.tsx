"use client"

import { useTheme } from 'next-themes'
import { useEffect } from 'react'

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { setTheme } = useTheme()

  useEffect(() => {
    setTheme('light')
  }, [setTheme])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <style jsx global>{`
        .blog-content {
          color: #374151;
          font-size: 1.125rem;
          line-height: 1.8;
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
          font-weight: 700;
          letter-spacing: -0.025em;
          margin-top: 2.5em;
          margin-bottom: 1em;
          line-height: 1.2;
        }
        .blog-content h1 { font-size: 2.5em; }
        .blog-content h2 { font-size: 2em; }
        .blog-content h3 { font-size: 1.75em; }
        .blog-content h4 { font-size: 1.5em; }
        .blog-content h5 { font-size: 1.25em; }
        .blog-content h6 { font-size: 1.1em; }
        
        .blog-content p {
          margin: 1.5em 0;
          color: #374151;
          line-height: 1.8;
        }
        .blog-content a {
          color: #2563eb;
          text-decoration: none;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        .blog-content a:hover {
          color: #1d4ed8;
          border-bottom-color: #1d4ed8;
        }
        .blog-content blockquote {
          border-left: 4px solid #2563eb;
          background-color: #f8fafc;
          padding: 1.5rem 2rem;
          margin: 2em 0;
          border-radius: 0.5rem;
          font-style: italic;
          color: #4b5563;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }
        .blog-content code {
          background-color: #f1f5f9;
          color: #2563eb;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.875em;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-weight: 500;
        }
        .blog-content pre {
          background-color: #1e293b;
          color: #e2e8f0;
          padding: 1.5rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 2em 0;
          font-size: 0.875em;
          line-height: 1.7;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .blog-content pre code {
          background-color: transparent;
          color: inherit;
          padding: 0;
          border-radius: 0;
          font-size: inherit;
          font-weight: normal;
        }
        .blog-content img {
          border-radius: 1rem;
          margin: 2.5em auto;
          box-shadow: 0 8px 12px -1px rgba(0, 0, 0, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.06);
          max-width: 100%;
          height: auto;
          display: block;
        }
        .blog-content ul,
        .blog-content ol {
          margin: 1.5em 0;
          padding-left: 1.5em;
          color: #374151;
        }
        .blog-content li {
          margin: 0.75em 0;
          padding-left: 0.5em;
        }
        .blog-content table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 2em 0;
          font-size: 0.875em;
          border-radius: 0.5rem;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .blog-content th,
        .blog-content td {
          border: 1px solid #e5e7eb;
          padding: 1em;
          text-align: left;
          background-color: white;
        }
        .blog-content th {
          background-color: #f8fafc;
          font-weight: 600;
          color: #111827;
          white-space: nowrap;
        }
        .blog-content td {
          color: #374151;
        }
        .blog-content tr:hover td {
          background-color: #f8fafc;
        }
        .blog-card {
          background-color: white;
          border: 1px solid #e5e7eb;
          border-radius: 1rem;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          position: relative;
          isolation: isolate;
        }
        .blog-card::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: -1;
          background: radial-gradient(circle at top right, #f8fafc, transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .blog-card:hover {
          transform: translateY(-4px);
          border-color: #e2e8f0;
          box-shadow: 0 12px 24px -4px rgba(0, 0, 0, 0.08), 0 6px 12px -6px rgba(0, 0, 0, 0.04);
        }
        .blog-card:hover::after {
          opacity: 1;
        }
        .blog-card-title {
          color: #111827;
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
          margin-bottom: 0.75rem;
          transition: color 0.2s ease;
        }
        .blog-card-excerpt {
          color: #6b7280;
          font-size: 0.875rem;
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .blog-card-meta {
          color: #9ca3af;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .blog-tag {
          background-color: #f3f4f6;
          color: #4b5563;
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.2s ease;
          border: 1px solid transparent;
          line-height: 1;
        }
        .blog-tag:hover {
          background-color: #e5e7eb;
          color: #374151;
          border-color: #d1d5db;
        }
        .blog-tag.active {
          background-color: #2563eb;
          color: white;
        }
        .blog-tag.active:hover {
          background-color: #1d4ed8;
          border-color: transparent;
        }
        
        @media (max-width: 768px) {
          .blog-content {
            font-size: 1rem;
          }
          .blog-content h1 { font-size: 2em; }
          .blog-content h2 { font-size: 1.75em; }
          .blog-content h3 { font-size: 1.5em; }
          .blog-content h4 { font-size: 1.25em; }
          .blog-content h5 { font-size: 1.1em; }
          .blog-content h6 { font-size: 1em; }
        }
      `}</style>
      {children}
    </div>
  )
}
