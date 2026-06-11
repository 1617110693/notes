<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNotesStore } from '@/stores/notes'
import { extractHeadings, estimateReadingTime } from '@/utils/markdown'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import TableOfContents from '@/components/TableOfContents.vue'

const route = useRoute()
const router = useRouter()
const store = useNotesStore()

const slug = computed(() => route.params.slug)
const note = computed(() => store.getNoteBySlug(slug.value))
const content = ref('')
const loading = ref(true)
const error = ref(null)

const headings = computed(() => {
  if (!content.value) return []
  return extractHeadings(content.value)
})

const readingTime = computed(() => {
  if (!content.value) return 0
  return estimateReadingTime(content.value)
})

const categoryIcon = computed(() => {
  if (!note.value) return ''
  const icons = {
    'machine-learning': '🤖',
    python: '🐍',
    mathematics: '📐',
    tools: '🛠',
  }
  return icons[note.value.category] || '📄'
})

const tocCollapsed = ref(false)

function toggleToc() {
  tocCollapsed.value = !tocCollapsed.value
}

const prevNote = computed(() => {
  if (!note.value) return null
  const idx = store.allNotes.findIndex((n) => n.slug === slug.value)
  return idx > 0 ? store.allNotes[idx - 1] : null
})

const nextNote = computed(() => {
  if (!note.value) return null
  const idx = store.allNotes.findIndex((n) => n.slug === slug.value)
  return idx < store.allNotes.length - 1 ? store.allNotes[idx + 1] : null
})

async function loadContent() {
  if (!note.value) {
    error.value = 'Note not found'
    loading.value = false
    return
  }

  loading.value = true
  error.value = null

  try {
    const raw = await store.loadNoteContent(note.value.filename)
    if (raw) {
      content.value = raw
    } else {
      error.value = 'Failed to load note content'
    }
  } catch (e) {
    console.error('Error loading note:', e)
    error.value = 'Error loading note content'
  } finally {
    loading.value = false
    window.scrollTo({ top: 0 })
  }
}

onMounted(loadContent)
watch(slug, loadContent)
</script>

<template>
  <div class="note-detail-view">
    <!-- Error state -->
    <div v-if="error && !loading" class="error-state">
      <div class="error-icon">⚠️</div>
      <h2>{{ error }}</h2>
      <RouterLink to="/notes" class="btn-back">← Back to notes</RouterLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">
      <div class="loading-dots">
        <span></span><span></span><span></span>
      </div>
      <p>Loading note...</p>
    </div>

    <!-- Content -->
    <template v-if="note && !loading && !error">
      <article class="note-article">
        <!-- Header — full-width background -->
        <header class="article-header">
          <div class="article-header-inner">
            <RouterLink to="/notes" class="back-link">
              <span class="back-arrow">←</span> Back to notes
            </RouterLink>
            <div class="article-meta">
              <span class="article-category">
                <span class="cat-badge">
                  {{ categoryIcon }} {{ note.category }}
                </span>
              </span>
              <span class="meta-sep">·</span>
              <span class="article-date">{{ note.date }}</span>
              <span class="meta-sep">·</span>
              <span class="article-reading-time">{{ readingTime }} min read</span>
            </div>
            <h1 class="article-title">{{ note.title }}</h1>
            <p v-if="note.description" class="article-description">{{ note.description }}</p>
          </div>
        </header>

        <!-- Body with TOC -->
        <div class="article-body-wrapper" :class="{ 'toc-collapsed': tocCollapsed }">
          <div class="article-content">
            <MarkdownRenderer :content="content" :key="slug" />
          </div>
          <aside v-if="headings.length > 0" class="article-sidebar" :class="{ collapsed: tocCollapsed }">
            <TableOfContents
              :headings="headings"
              :collapsed="tocCollapsed"
              @toggle="toggleToc"
            />
          </aside>
          <!-- Floating expand button when TOC is collapsed -->
          <button
            v-if="tocCollapsed && headings.length > 0"
            class="toc-expand-float"
            @click="toggleToc"
            title="Show table of contents"
            aria-label="Show table of contents"
          >
            ☰
          </button>
        </div>
      </article>

      <!-- Prev/Next navigation — full-width band -->
      <nav class="article-nav-section">
        <div class="article-nav-inner">
          <RouterLink
            v-if="prevNote"
            :to="`/notes/${prevNote.slug}`"
            class="nav-card prev"
          >
            <span class="nav-direction">← Previous</span>
            <span class="nav-title">{{ prevNote.title }}</span>
          </RouterLink>
          <div v-if="!prevNote" class="nav-card prev placeholder"></div>
          <RouterLink
            v-if="nextNote"
            :to="`/notes/${nextNote.slug}`"
            class="nav-card next"
          >
            <span class="nav-direction">Next →</span>
            <span class="nav-title">{{ nextNote.title }}</span>
          </RouterLink>
          <div v-if="!nextNote" class="nav-card next placeholder"></div>
        </div>
      </nav>
    </template>
  </div>
</template>

<style scoped>
.note-detail-view {
  /* No max-width — sections control their own width */
}

/* Loading dots animation */
.loading-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--color-text-muted);
}

.loading-dots {
  display: flex;
  gap: 6px;
  justify-content: center;
  margin-bottom: 1rem;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: dotBounce 1.2s ease-in-out infinite;
}

.loading-dots span:nth-child(1) { animation-delay: 0s; }
.loading-dots span:nth-child(2) { animation-delay: 0.15s; }
.loading-dots span:nth-child(3) { animation-delay: 0.3s; }

@keyframes dotBounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

/* Error */
.error-state {
  text-align: center;
  padding: 4rem 1rem;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 0.75rem;
}

.error-state h2 {
  color: var(--color-text);
  margin: 0 0 1.5rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.5rem;
  background: var(--color-primary);
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background 0.2s;
}

.btn-back:hover {
  background: var(--color-primary-hover);
}

/* Article header */
.article-header {
  padding: 2.5rem 1.5rem;
  margin-bottom: 2.5rem;
  background: linear-gradient(180deg, var(--color-primary-bg) 0%, var(--color-bg) 100%);
  border-bottom: 1px solid var(--color-border);
}

.article-header-inner {
  max-width: 1100px;
  margin: 0 auto;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 500;
  transition: color 0.15s;
}

.back-link:hover {
  color: var(--color-primary);
}

.back-arrow {
  transition: transform 0.15s;
}

.back-link:hover .back-arrow {
  transform: translateX(-3px);
}

.article-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
}

.cat-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.7rem;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border-radius: 20px;
  font-weight: 550;
  font-size: 0.82rem;
}

.meta-sep {
  color: var(--color-border);
}

.article-date {
  color: var(--color-text-muted);
}

.article-reading-time {
  color: var(--color-text-muted);
}

.article-title {
  font-size: 2.4rem;
  font-weight: 750;
  color: var(--color-text);
  margin: 0 0 0.75rem;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.article-description {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.65;
}

/* Article body */
.article-body-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 2.5rem;
  align-items: start;
  position: relative;
}

.article-body-wrapper.toc-collapsed {
  grid-template-columns: 1fr;
}

.article-content {
  min-width: 0;
}

.article-sidebar {
  position: sticky;
  top: 78px;
  align-self: start;
  max-height: calc(100vh - 78px - 1.5rem);
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
  transition: opacity 0.2s, transform 0.2s;
}

.article-sidebar.collapsed {
  display: none;
}

/* Floating expand button when TOC collapsed */
.toc-expand-float {
  position: fixed;
  right: 1.5rem;
  bottom: 6rem;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-card-bg);
  color: var(--color-text-secondary);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--color-shadow-md);
  z-index: 50;
  transition: background 0.2s, color 0.2s, transform 0.15s, box-shadow 0.2s;
}

.toc-expand-float:hover {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
  box-shadow: var(--color-shadow-lg);
  transform: scale(1.08);
}

/* Prev/Next navigation — full-width band */
.article-nav-section {
  margin-top: 3rem;
  padding: 2rem 1.5rem;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.article-nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.nav-card {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  text-decoration: none;
  background: var(--color-card-bg);
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
}

.nav-card.placeholder {
  background: transparent;
  border-style: dashed;
  opacity: 0.4;
}

.nav-card:hover:not(.placeholder) {
  border-color: var(--color-primary);
  box-shadow: var(--color-shadow-md);
  transform: translateY(-1px);
}

.nav-card.next {
  text-align: right;
  align-items: flex-end;
}

.nav-direction {
  font-size: 0.78rem;
  color: var(--color-text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.nav-title {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.4;
}

@media (max-width: 768px) {
  .article-body-wrapper {
    grid-template-columns: 1fr;
  }

  .article-sidebar {
    display: none;
  }

  .article-title {
    font-size: 1.7rem;
  }

  .article-header {
    padding: 2rem 1rem;
  }

  .article-nav-inner {
    grid-template-columns: 1fr;
  }

  .nav-card.next {
    text-align: left;
    align-items: flex-start;
  }

  .article-nav-section {
    padding: 1.5rem 1rem;
  }
}
</style>
