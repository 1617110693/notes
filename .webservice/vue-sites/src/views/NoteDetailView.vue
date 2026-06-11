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

// Find prev/next notes for navigation
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
  }
}

onMounted(loadContent)
watch(slug, loadContent)
</script>

<template>
  <div class="note-detail-view">
    <!-- Error state -->
    <div v-if="error && !loading" class="error-state">
      <p class="error-icon">⚠️</p>
      <h2>{{ error }}</h2>
      <RouterLink to="/notes" class="btn-primary">← Back to notes</RouterLink>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <p class="loading-spinner">⏳</p>
      <p>Loading note...</p>
    </div>

    <!-- Note content -->
    <template v-if="note && !loading && !error">
      <article class="note-article">
        <!-- Article header -->
        <header class="article-header">
          <RouterLink to="/notes" class="back-link">← Back to notes</RouterLink>
          <div class="article-meta">
            <span class="article-category">{{ categoryIcon }} {{ note.category }}</span>
            <span class="article-date">{{ note.date }}</span>
            <span class="article-reading-time">{{ readingTime }} min read</span>
          </div>
          <h1 class="article-title">{{ note.title }}</h1>
          <p class="article-description">{{ note.description }}</p>
        </header>

        <!-- Article body with TOC sidebar -->
        <div class="article-body-wrapper">
          <div class="article-content">
            <MarkdownRenderer :content="content" :key="slug" />
          </div>
          <aside class="article-sidebar">
            <TableOfContents :headings="headings" />
          </aside>
        </div>
      </article>

      <!-- Prev/Next navigation -->
      <nav class="article-nav">
        <RouterLink
          v-if="prevNote"
          :to="`/notes/${prevNote.slug}`"
          class="article-nav-link prev"
        >
          <span class="nav-label">← Previous</span>
          <span class="nav-title">{{ prevNote.title }}</span>
        </RouterLink>
        <div v-else></div>
        <RouterLink
          v-if="nextNote"
          :to="`/notes/${nextNote.slug}`"
          class="article-nav-link next"
        >
          <span class="nav-label">Next →</span>
          <span class="nav-title">{{ nextNote.title }}</span>
        </RouterLink>
        <div v-else></div>
      </nav>
    </template>
  </div>
</template>

<style scoped>
.note-detail-view {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

/* Error & loading */
.error-state,
.loading-state {
  text-align: center;
  padding: 3rem 1rem;
}

.error-icon {
  font-size: 3rem;
  margin: 0 0 0.75rem;
}

.error-state h2 {
  color: var(--color-text);
  margin: 0 0 1.5rem;
}

.loading-spinner {
  font-size: 2rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Article header */
.article-header {
  margin-bottom: 2rem;
}

.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  color: var(--color-primary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.article-category {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.article-date {
  color: var(--color-text-muted);
}

.article-reading-time {
  color: var(--color-text-muted);
  background: var(--color-surface);
  padding: 0.1rem 0.5rem;
  border-radius: 10px;
}

.article-title {
  font-size: 2rem;
  font-weight: 750;
  color: var(--color-text);
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.article-description {
  font-size: 1.05rem;
  color: var(--color-text-secondary);
  margin: 0;
  line-height: 1.6;
}

/* Article body with sidebar */
.article-body-wrapper {
  display: grid;
  grid-template-columns: 1fr 200px;
  gap: 2rem;
  align-items: start;
}

.article-content {
  min-width: 0;
}

.article-sidebar {
  position: sticky;
  top: 72px;
  align-self: start;
}

/* Prev/Next navigation */
.article-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.article-nav-link {
  display: block;
  padding: 0.85rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-decoration: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.article-nav-link:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px var(--color-shadow);
}

.article-nav-link.next {
  text-align: right;
}

.nav-label {
  display: block;
  font-size: 0.8rem;
  color: var(--color-text-muted);
  margin-bottom: 0.25rem;
}

.nav-title {
  font-size: 0.9rem;
  font-weight: 550;
  color: var(--color-text);
  line-height: 1.4;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.4rem;
  background: var(--color-primary);
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .article-body-wrapper {
    grid-template-columns: 1fr;
  }

  .article-sidebar {
    display: none;
  }

  .article-title {
    font-size: 1.5rem;
  }

  .article-nav {
    grid-template-columns: 1fr;
  }

  .article-nav-link.next {
    text-align: left;
  }
}
</style>
