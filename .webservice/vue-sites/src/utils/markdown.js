import MarkdownIt from 'markdown-it'
import texmath from 'markdown-it-texmath'
import katex from 'katex'
import hljs from 'highlight.js'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: false,
  highlight(str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        )
      } catch (_) {
        // fall through
      }
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>'
  },
})

// Enable LaTeX math rendering
md.use(texmath, {
  engine: katex,
  delimiters: ['dollars', 'brackets'],
  katexOptions: {
    throwOnError: false,
    strict: false,
    macros: {},
  },
})

// Custom renderer to add target="_blank" to external links
const defaultLinkRender =
  md.renderer.rules.link_open ||
  function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options)
  }

md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx]
  const href = token.attrGet('href')
  if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
    token.attrSet('target', '_blank')
    token.attrSet('rel', 'noopener noreferrer')
  }
  return defaultLinkRender(tokens, idx, options, env, self)
}

// Add heading anchors
md.renderer.rules.heading_open = function (tokens, idx, options, _env, self) {
  const token = tokens[idx]
  const next = tokens[idx + 1]
  if (next && next.type === 'inline') {
    const id = next.content
      .toLowerCase()
      .replace(/<[^>]*>/g, '')
      .replace(/[^\w一-鿿]+/g, '-')
      .replace(/^-+|-+$/g, '')
    token.attrSet('id', id)
  }
  return self.renderToken(tokens, idx, options)
}

/**
 * Render markdown string to HTML
 * @param {string} content Raw markdown content
 * @returns {string} Rendered HTML
 */
export function renderMarkdown(content) {
  return md.render(content)
}

/**
 * Extract headings from markdown for table of contents
 * @param {string} content Raw markdown content
 * @returns {Array<{level: number, text: string, id: string}>}
 */
export function extractHeadings(content) {
  const headings = []
  // Normalize line endings — split on \n and strip trailing \r (Windows CRLF)
  const lines = content.replace(/\r\n?/g, '\n').split('\n')
  let inCodeBlock = false
  for (const line of lines) {
    // Toggle code block on fenced ``` (but not indented code)
    if (/^```/.test(line)) {
      inCodeBlock = !inCodeBlock
      continue
    }
    // Skip lines inside code blocks
    if (inCodeBlock) continue

    const match = line.match(/^(#{1,4})\s+(.+)$/)
    if (match) {
      const text = match[2].replace(/<[^>]*>/g, '').trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w一-鿿]+/g, '-')
        .replace(/^-+|-+$/g, '')
      headings.push({
        level: match[1].length,
        text,
        id,
      })
    }
  }
  return headings
}

/**
 * Estimate reading time in minutes
 * @param {string} content Raw markdown content
 * @returns {number} Estimated reading time in minutes
 */
/**
 * Render inline LaTeX in heading text for TOC display.
 * Escapes HTML, then converts $...$ and \(...\) to KaTeX HTML.
 * @param {string} text Raw heading text
 * @returns {string} HTML string safe for v-html
 */
export function renderHeadingText(text) {
  if (!text) return ''

  // Escape HTML entities first
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

  // Render $...$ inline LaTeX
  const rendered = escaped
    .replace(/\$([^$]+)\$/g, (_, formula) => {
      try {
        return katex.renderToString(formula, { throwOnError: false, displayMode: false })
      } catch {
        return `<span class="katex-error">${formula}</span>`
      }
    })
    .replace(/\\\((.+?)\\\)/g, (_, formula) => {
      try {
        return katex.renderToString(formula, { throwOnError: false, displayMode: false })
      } catch {
        return `<span class="katex-error">${formula}</span>`
      }
    })

  return rendered
}

export function estimateReadingTime(content) {
  // Count Chinese characters (each ~1 word) and English words
  const chineseChars = (content.match(/[一-鿿]/g) || []).length
  const englishWords = content
    .replace(/[一-鿿]/g, '')
    .split(/\s+/)
    .filter(Boolean).length
  // ~300 Chinese chars/min, ~200 English words/min — use weighted average
  const minutes = Math.ceil(chineseChars / 400 + englishWords / 200)
  return Math.max(1, minutes)
}
