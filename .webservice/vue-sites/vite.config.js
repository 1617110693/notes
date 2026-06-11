import { fileURLToPath, URL } from 'node:url'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// Read site config for title, base path, and favicon
const __dirname = dirname(fileURLToPath(import.meta.url))
const configPath = join(__dirname, '..', 'config.json')
let siteTitle = '📓 My Notes'
let siteBase = '/notes/'
let faviconHref = './favicon.ico'
let repoUrl = 'https://github.com/1617110693/notes'
try {
  if (existsSync(configPath)) {
    const cfg = JSON.parse(readFileSync(configPath, 'utf-8'))
    if (cfg.site?.title) siteTitle = cfg.site.title
    if (cfg.site?.base) siteBase = cfg.site.base
    if (cfg.site?.favicon) faviconHref = cfg.site.favicon
    if (cfg.site?.repo_url) repoUrl = cfg.site.repo_url
  }
} catch (_) { /* use defaults */ }

// https://vite.dev/config/
export default defineConfig({
  base: siteBase,

  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html
          .replace(/<title>.*<\/title>/, `<title>${siteTitle}</title>`)
          .replace(/<link rel="icon"[^>]*>/, `<link rel="icon" href="${faviconHref.replace(/^\//, './')}">`)
      },
    },
  ],
  
  // 2. 配置打包输出目的地
  build: {
    // new URL('../docs', import.meta.url) 表示从当前文件出发，往上跳一级到 notes 根目录，再进入 docs 文件夹
    outDir: fileURLToPath(new URL('../../docs', import.meta.url)),
    emptyOutDir: true, // 每次打包时，自动先清空旧的 docs 文件夹防止缓存残留
    chunkSizeWarningLimit: 2000, // KaTeX + markdown-it + highlight.js 合计较大，提高警告阈值
  },
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },

  define: {
    __SITE_TITLE__: JSON.stringify(siteTitle),
    __SITE_BASE__: JSON.stringify(siteBase),
    __REPO_URL__: JSON.stringify(repoUrl),
  },
})