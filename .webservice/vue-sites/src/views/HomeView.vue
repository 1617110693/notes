<script setup>
import { computed } from 'vue'
import { useNotesStore } from '@/stores/notes'
import NoteCard from '@/components/NoteCard.vue'

const store = useNotesStore()

const siteTitle = __SITE_TITLE__
const siteDescription = __SITE_DESCRIPTION__
const githubUrl = __REPO_URL__

const featuredNotes = computed(() => store.allNotes.slice(0, 6))
</script>

<template>
  <div class="home-view">
    <!-- Hero — full-width background band -->
    <section class="hero">
      <div class="hero-bg-decor">
        <div class="decor-circle c1"></div>
        <div class="decor-circle c2"></div>
        <div class="decor-circle c3"></div>
      </div>
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-line">{{ siteTitle }}</span>
        </h1>
        <p class="hero-subtitle">
          {{ siteDescription }}
        </p>
        <div class="hero-actions">
          <RouterLink to="/notes" class="btn-primary">
            <span>Browse Notes</span>
            <span class="btn-arrow">→</span>
          </RouterLink>
          <a
            :href="githubUrl"
            target="_blank"
            rel="noopener"
            class="btn-secondary"
          >
            <span>View on GitHub</span>
            <span class="btn-arrow">↗</span>
          </a>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-value">{{ store.allNotes.length }}</span>
            <span class="stat-label">Notes</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <span class="stat-value">{{ store.categories.length }}</span>
            <span class="stat-label">Categories</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Categories — full-width surface band -->
    <section class="categories-section reveal">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Browse by Topic</h2>
          <RouterLink to="/notes" class="section-link">View all →</RouterLink>
        </div>
        <div class="categories-grid">
          <RouterLink
            v-for="cat in store.categories"
            :key="cat.id"
            :to="`/notes?category=${cat.id}`"
            class="category-card"
          >
            <div class="category-icon-wrap">
              <span class="category-icon">{{ cat.icon }}</span>
            </div>
            <div class="category-info">
              <span class="category-name">{{ cat.name }}</span>
              <span class="category-count">{{ store.categoryNoteCounts[cat.id] || 0 }} notes</span>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Featured -->
    <section class="featured-section reveal">
      <div class="section-container">
        <div class="section-header">
          <h2 class="section-title">Featured Notes</h2>
          <RouterLink v-if="store.allNotes.length > 6" to="/notes" class="section-link">
            All {{ store.allNotes.length }} notes →
          </RouterLink>
        </div>
        <div class="notes-grid">
          <NoteCard
            v-for="note in featuredNotes"
            :key="note.slug"
            :note="note"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  /* No max-width — each section controls its own width */
}

.section-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* ── Hero ───────────────────────────────────────── */

.hero {
  position: relative;
  padding: 8rem 1.5rem 4.5rem;
  text-align: center;
  overflow: hidden;
  background: linear-gradient(180deg, var(--color-primary-bg) 0%, var(--color-bg) 100%);
}

.hero-bg-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.decor-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.07;
  background: var(--color-primary);
}

.decor-circle.c1 {
  width: 320px;
  height: 320px;
  top: -60px;
  right: -80px;
  animation: float 8s ease-in-out infinite;
}

.decor-circle.c2 {
  width: 200px;
  height: 200px;
  bottom: 20px;
  left: -50px;
  animation: float 6s ease-in-out 2s infinite;
  background: #a78bfa;
}

.decor-circle.c3 {
  width: 140px;
  height: 140px;
  top: 60px;
  left: 50%;
  animation: float 10s ease-in-out 1s infinite;
  background: #f472b6;
  opacity: 0.05;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 640px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 750;
  color: var(--color-text);
  margin: 0 0 1.25rem;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.title-line {
  display: block;
  background: linear-gradient(135deg, var(--color-text) 0%, var(--color-text-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.12rem;
  color: var(--color-text-secondary);
  line-height: 1.7;
  margin: 0 0 2rem;
}

/* Hero actions */
.hero-actions {
  display: flex;
  gap: 0.85rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.6rem;
  background: var(--color-primary);
  color: #fff;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background-color 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
}

.btn-arrow {
  transition: transform 0.2s;
}

.btn-primary:hover .btn-arrow {
  transform: translateX(3px);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.7rem 1.6rem;
  background: var(--color-card-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  text-decoration: none;
  font-weight: 550;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
}

.btn-secondary:hover {
  border-color: var(--color-text-muted);
  box-shadow: var(--color-shadow);
  transform: translateY(-1px);
}

.btn-secondary:hover .btn-arrow {
  transform: translate(2px, -2px);
}

/* Hero stats */
.hero-stats {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 750;
  color: var(--color-primary);
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--color-text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: var(--color-border);
}

/* ── Sections ──────────────────────────────────── */

.section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 1.25rem;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.015em;
}

.section-link {
  font-size: 0.88rem;
  color: var(--color-primary);
  font-weight: 500;
  text-decoration: none;
}

.section-link:hover {
  text-decoration: underline;
}

.categories-section {
  padding: 2.5rem 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.85rem;
}

.category-card {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1.1rem 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  text-decoration: none;
  color: inherit;
  background: var(--color-card-bg);
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
  box-shadow: var(--color-shadow-sm);
}

.category-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--color-shadow-md);
  transform: translateY(-2px);
}

.category-icon-wrap {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--color-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.3rem;
  transition: background 0.2s;
}

.category-card:hover .category-icon-wrap {
  background: var(--color-primary-soft);
}

.category-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
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

/* ── Featured ──────────────────────────────────── */

.featured-section {
  padding: 2.5rem 0 3rem;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.1rem;
}

/* ── Responsive ────────────────────────────────── */

@media (max-width: 768px) {
  .hero {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 2rem 1.25rem 5rem;
  }

  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-actions .btn-primary,
  .hero-actions .btn-secondary {
    justify-content: center;
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }

  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.65rem;
  }

  .categories-section {
    padding: 2rem 0;
  }

  .featured-section {
    padding: 2rem 0 2rem;
  }
}

@media (max-width: 480px) {
  .hero {
    padding: 1.5rem 1rem 3.5rem;
  }

  .hero-title {
    font-size: 1.8rem;
  }

  .hero-stats {
    gap: 0.85rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
    gap: 0.6rem;
  }

  .category-card {
    padding: 1rem 1.1rem;
    gap: 0.75rem;
  }

  .category-icon-wrap {
    width: 40px;
    height: 40px;
    font-size: 1.2rem;
  }

  .category-name {
    font-size: 0.88rem;
  }

  .section-container {
    padding: 0 1rem;
  }

  .section-title {
    font-size: 1.2rem;
  }
}
</style>
