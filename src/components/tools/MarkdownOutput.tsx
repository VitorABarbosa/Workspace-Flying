'use client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize from 'rehype-sanitize'
import 'highlight.js/styles/github-dark-dimmed.css'
import { cn } from '@/lib/cn'

interface MarkdownOutputProps {
  content: string
  className?: string
}

export function MarkdownOutput({ content, className }: MarkdownOutputProps) {
  return (
    <div
      className={cn(
        'whitespace-pre-wrap font-sans text-base leading-relaxed',
        'text-[#1A1A2E] dark:text-white',
        'bg-[#F1F1F1] dark:bg-[#1A1A1A]',
        'rounded-xl p-6 overflow-auto',
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize, rehypeHighlight]}
        components={{
          table: ({ children }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 border border-gray-200 dark:border-gray-700 font-bold text-left">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border border-gray-200 dark:border-gray-700">{children}</td>
          ),
          h2: ({ children }) => (
            <h2 className="text-[22px] font-bold leading-tight mt-6 mb-2 text-[#1A1A2E] dark:text-white">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold leading-relaxed mt-4 mb-1 text-[#1A1A2E] dark:text-white">
              {children}
            </h3>
          ),
          code: ({ className: codeClassName, children, ...props }) => {
            const isInline = !codeClassName
            return isInline ? (
              <code
                className="text-sm font-mono bg-[#F1F1F1] dark:bg-[#1A1A1A] rounded px-1"
                {...props}
              >
                {children}
              </code>
            ) : (
              <code className={codeClassName} {...props}>
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
