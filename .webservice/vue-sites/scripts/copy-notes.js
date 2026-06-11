import { cpSync, mkdirSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')
const notesRoot = join(projectRoot, '..')

// Ensure target directories exist
const contentDir = join(projectRoot, 'src', 'content', 'notes')
const publicFigureDir = join(projectRoot, 'public', 'figure')

if (!existsSync(contentDir)) {
  mkdirSync(contentDir, { recursive: true })
}
if (!existsSync(publicFigureDir)) {
  mkdirSync(publicFigureDir, { recursive: true })
}

// Copy root .md files (exclude readme.md)
const rootFiles = readdirSync(notesRoot).filter(
  f => f.endsWith('.md') && f.toLowerCase() !== 'readme.md'
)
for (const file of rootFiles) {
  cpSync(join(notesRoot, file), join(contentDir, file))
  console.log(`  ✓ ${file}`)
}

// Copy PythonPackages directory
const pkgDir = join(notesRoot, 'PythonPackages')
const pkgTarget = join(contentDir, 'PythonPackages')
if (existsSync(pkgDir)) {
  if (!existsSync(pkgTarget)) {
    mkdirSync(pkgTarget, { recursive: true })
  }
  const pkgFiles = readdirSync(pkgDir).filter(f => f.endsWith('.md'))
  for (const file of pkgFiles) {
    cpSync(join(pkgDir, file), join(pkgTarget, file))
    console.log(`  ✓ PythonPackages/${file}`)
  }
}

// Copy figure directory
const figureDir = join(notesRoot, 'figure')
if (existsSync(figureDir)) {
  const figureFiles = readdirSync(figureDir)
  for (const file of figureFiles) {
    cpSync(join(figureDir, file), join(publicFigureDir, file))
    console.log(`  ✓ figure/${file}`)
  }
}

console.log('Done copying notes and figures.')
