import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  // 1. 配置基准路径（改成你的 GitHub 仓库名，这里是 notes）
  base: '/notes/', 
  
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  
  // 2. 配置打包输出目的地
  build: {
    // new URL('../docs', import.meta.url) 表示从当前文件出发，往上跳一级到 notes 根目录，再进入 docs 文件夹
    outDir: fileURLToPath(new URL('../docs', import.meta.url)),
    emptyOutDir: true, // 每次打包时，自动先清空旧的 docs 文件夹防止缓存残留
    chunkSizeWarningLimit: 2000, // KaTeX + markdown-it + highlight.js 合计较大，提高警告阈值
  },
  
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  }
})