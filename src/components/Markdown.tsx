import React from 'react'

interface MarkdownProps {
  content: string
}

export default function Markdown({ content }: MarkdownProps) {
  if (!content) return null

  // Split content by code blocks and text segments to parse correctly
  const sections = content.split(/(```[\s\S]*?```)/g)

  return (
    <div className="space-y-6 text-slate-300">
      {sections.map((section, sectionIdx) => {
        // Handle Code Blocks
        if (section.startsWith('```')) {
          const lines = section.split('\n')
          const header = lines[0].replace('```', '').trim()
          // Extract language name
          const lang = header.split(' ')[0] || ''
          const code = lines.slice(1, -1).join('\n')

          return (
            <div key={sectionIdx} className="my-6 rounded-lg overflow-hidden border border-slate-800 shadow-xl bg-slate-950 font-mono text-xs">
              {lang && (
                <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-900 bg-slate-950 text-[10px] text-slate-500 uppercase tracking-wider font-heading">
                  <span>{lang}</span>
                  <span>raw</span>
                </div>
              )}
              <pre className="overflow-x-auto p-4 leading-relaxed text-slate-300">
                <code>{code}</code>
              </pre>
            </div>
          )
        }

        // Handle Standard Text block
        const paragraphs = section.split('\n\n')
        return paragraphs.map((block, blockIdx) => {
          const trimmed = block.trim()
          if (!trimmed) return null

          const uniqueKey = `sec-${sectionIdx}-blk-${blockIdx}`

          // H1 Headings
          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={uniqueKey} className="font-heading text-2xl font-extrabold text-slate-100 mt-8 mb-4 border-b border-slate-900/60 pb-2">
                {trimmed.replace(/^#\s+/, '')}
              </h1>
            )
          }

          // H2 Headings
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={uniqueKey} className="font-heading text-xl font-bold text-slate-100 mt-8 mb-3">
                {trimmed.replace(/^##\s+/, '')}
              </h2>
            )
          }

          // H3 Headings
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={uniqueKey} className="font-heading text-base font-bold text-slate-200 mt-6 mb-2">
                {trimmed.replace(/^###\s+/, '')}
              </h3>
            )
          }

          // Lists (Unordered)
          if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
            const listItems = trimmed.split('\n')
            return (
              <ul key={uniqueKey} className="list-disc pl-6 space-y-2 text-sm leading-relaxed font-light">
                {listItems.map((item, i) => (
                  <li key={i}>{parseInlineStyles(item.replace(/^[\*\-]\s+/, ''))}</li>
                ))}
              </ul>
            )
          }

          // Lists (Ordered)
          if (trimmed.match(/^\d+\.\s/)) {
            const listItems = trimmed.split('\n')
            return (
              <ol key={uniqueKey} className="list-decimal pl-6 space-y-2 text-sm leading-relaxed font-light">
                {listItems.map((item, i) => (
                  <li key={i}>{parseInlineStyles(item.replace(/^\d+\.\s+/, ''))}</li>
                ))}
              </ol>
            )
          }

          // Paragraphs
          return (
            <p key={uniqueKey} className="text-sm md:text-base text-slate-350 leading-relaxed font-light">
              {parseInlineStyles(trimmed)}
            </p>
          )
        })
      })}
    </div>
  )
}

function parseInlineStyles(text: string): React.ReactNode[] {
  // Regex to split on bold delimiters (**) and inline code delimiters (`)
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-slate-100">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="font-mono text-xs px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-500 font-semibold">
          {part.slice(1, -1)}
        </code>
      )
    }
    return part
  })
}
