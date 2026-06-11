<script setup>
import { useNotesStore } from '@/stores/notes'
import NoteCard from '@/components/NoteCard.vue'

const store = useNotesStore()
</script>

<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">📓 My Notes</h1>
        <p class="hero-subtitle">
          A personal knowledge base covering machine learning, Python, mathematics, and developer
          tooling. Built with Obsidian and written in Markdown.
        </p>
        <div class="hero-actions">
          <RouterLink to="/notes" class="btn-primary">Browse all notes</RouterLink>
          <a
            href="https://github.com/1617110693/notes"
            target="_blank"
            rel="noopener"
            class="btn-secondary"
          >
            View on GitHub
          </a>
        </div>
      </div>
    </section>

    <!-- Categories -->
    <section class="categories-section">
      <h2 class="section-title">Categories</h2>
      <div class="categories-grid">
        <RouterLink
          v-for="cat in store.categories"
          :key="cat.id"
          :to="`/notes?category=${cat.id}`"
          class="category-card"
        >
          <span class="category-icon">{{ cat.icon }}</span>
          <div class="category-info">
            <span class="category-name">{{ cat.name }}</span>
            <span class="category-count">{{ store.categoryNoteCounts[cat.id] || 0 }} notes</span>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- Featured Notes -->
    <section class="featured-section">
      <h2 class="section-title">Featured Notes</h2>
      <div class="notes-grid">
        <NoteCard
          v-for="note in store.allNotes.slice(0, 6)"
          :key="note.slug"
          :note="note"
        />
      </div>
      <div v-if="store.allNotes.length > 6" class="view-all">
        <RouterLink to="/notes" class="btn-text">View all {{ store.allNotes.length }} notes →</RouterLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Hero */
.hero {
  padding: 3rem 0 2.5rem;
  text-align: center;
}

.hero-content {
  max-width: 640px;
  margin: 0 auto;
}

.hero-title {
  font-size: 2.4rem;
  font-weight: 750;
  color: var(--color-text);
  margin: 0 0 1rem;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: var(--color-text-secondary);
  line-height: 1.65;
  margin: 0 0 1.75rem;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
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
  transition: background-color 0.2s, transform 0.15s;
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.4rem;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  text-decoration: none;
  font-weight: 550;
  font-size: 0.95rem;
  transition: background-color 0.2s, border-color 0.2s;
}

.btn-secondary:hover {
  background: var(--color-border);
}

/* Sections */
.section-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 1rem;
}

.categories-section {
  padding: 1rem 0 2rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 0.75rem;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.15rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  background: var(--color-card-bg);
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
}

.category-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 12px var(--color-shadow);
  transform: translateY(-1px);
}

.category-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.category-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.category-name {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-text);
}

.category-count {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

/* Featured notes grid */
.featured-section {
  padding: 1rem 0 2.5rem;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.view-all {
  margin-top: 1.5rem;
  text-align: center;
}

.btn-text {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 550;
  font-size: 0.95rem;
  transition: opacity 0.2s;
}

.btn-text:hover {
  opacity: 0.8;
}

@media (max-width: 640px) {
  .hero {
    padding: 2rem 0 1.5rem;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }

  .categories-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
