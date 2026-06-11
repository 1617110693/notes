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

// Rewrite relative image src to be absolute (prefixed with BASE_URL).
// Without this, `![img](figure/x.png)` on /notes/some-slug resolves to
// /notes/figure/x.png instead of the actual /notes/<base>/figure/x.png.
const defaultImageRender =
  md.renderer.rules.image ||
  function (tokens, idx, options, _env, self) {
    return self.renderToken(tokens, idx, options)
  }

md.renderer.rules.image = function (tokens, idx, options, env, self) {
  const token = tokens[idx]
  const src = token.attrGet('src')
  if (
    src &&
    !src.startsWith('http://') &&
    !src.startsWith('https://') &&
    !src.startsWith('/') &&
    !src.startsWith('data:')
  ) {
    token.attrSet('src', (import.meta.env.BASE_URL || '/') + src)
  }
  return defaultImageRender(tokens, idx, options, env, self)
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
 * Render markdown string to HTML.
 * Also rewrites relative image/asset paths to be BASE_URL–prefixed so they
 * resolve correctly regardless of current page URL depth.
 * @param {string} content Raw markdown content
 * @returns {string} Rendered HTML
 */
export function renderMarkdown(content) {
  const html = md.render(content)

  // Post-process: fix relative paths in <img src> and <a href> that point to
  // local assets (figure/, assets/, etc.) so they work on nested routes like
  // /notes/<slug>.
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  if (!base) return html

  // Match src="..." or href="..." — relative paths only (not http, /, data:, #, mailto:)
  return html.replace(
    /(src|href)="((?!(?:https?:|data:|\/|#|mailto:))[^"]+)"/gi,
    (_, attr, path) => {
      // Strip leading ./ before prefixing
      const clean = path.replace(/^\.\//, '')
      if (clean.startsWith(base + '/')) return `${attr}="${clean}"`
      return `${attr}="${base}/${clean}"`
    },
  )
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
