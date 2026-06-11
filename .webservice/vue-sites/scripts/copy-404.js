import { cpSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const docsDir = join(__dirname, '..', '..', '..', 'docs')
const indexPath = join(docsDir, 'index.html')
const notFoundPath = join(docsDir, '404.html')

if (existsSync(indexPath)) {
  cpSync(indexPath, notFoundPath)
  console.log('✓ Created 404.html for GitHub Pages SPA support')
} else {
  console.warn('⚠ index.html not found in docs/ — did you run build first?')
}
