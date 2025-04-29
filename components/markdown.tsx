"use client"

import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

interface MarkdownProps {
  content: string
  className?: string
}

export function Markdown({ content, className }: MarkdownProps) {
  return (
    <ReactMarkdown
      className={cn("prose prose-invert max-w-none", className)}
      components={{
        h1: ({ node, ...props }) => (
          <h1
            className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600"
            {...props}
          />
        ),
        h2: ({ node, ...props }) => <h2 className="text-2xl md:text-3xl font-bold mt-8 mb-4 text-primary" {...props} />,
        p: ({ node, ...props }) => <p className="mb-4 text-white/90 leading-relaxed" {...props} />,
        a: ({ node, ...props }) => (
          <a className="text-primary hover:text-primary/80 underline transition-colors" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
