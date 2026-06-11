<script setup>
import { useNotesStore } from '@/stores/notes'
import { useRoute } from 'vue-router'
import { watch, onMounted } from 'vue'
import NoteCard from '@/components/NoteCard.vue'

const store = useNotesStore()
const route = useRoute()

// Apply category filter from URL query
function applyCategoryFromQuery() {
  const cat = route.query.category
  if (cat && store.categories.find((c) => c.id === cat)) {
    store.setActiveCategory(cat)
  }
}

onMounted(applyCategoryFromQuery)
watch(() => route.query.category, applyCategoryFromQuery)
</script>

<template>
  <div class="notes-view">
    <header class="notes-header">
      <div>
        <h1 class="notes-title">All Notes</h1>
        <p class="notes-subtitle">{{ store.filteredNotes.length }} note{{ store.filteredNotes.length !== 1 ? 's' : '' }} found</p>
      </div>
    </header>

    <!-- Category filter -->
    <div class="category-filters">
      <button
        :class="['filter-chip', { active: store.activeCategory === null }]"
        @click="store.setActiveCategory(null)"
      >
        All
      </button>
      <button
        v-for="cat in store.categories"
        :key="cat.id"
        :class="['filter-chip', { active: store.activeCategory === cat.id }]"
        @click="store.setActiveCategory(cat.id)"
      >
        {{ cat.icon }} {{ cat.name }}
        <span class="filter-count">{{ store.categoryNoteCounts[cat.id] }}</span>
      </button>
    </div>

    <!-- Notes grid -->
    <div v-if="store.filteredNotes.length > 0" class="notes-grid">
      <NoteCard
        v-for="note in store.filteredNotes"
        :key="note.slug"
        :note="note"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <p class="empty-icon">🔍</p>
      <p class="empty-text">No notes found matching your criteria.</p>
      <button class="btn-text" @click="store.setSearchQuery(''); store.setActiveCategory(null);">
        Clear filters
      </button>
    </div>
  </div>
</template>

<style scoped>
.notes-view {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.notes-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.notes-title {
  font-size: 1.8rem;
  font-weight: 750;
  color: var(--color-text);
  margin: 0 0 0.3rem;
  letter-spacing: -0.02em;
}

.notes-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin: 0;
}

/* Category filters */
.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 1.75rem;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: 0.84rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-text);
}

.filter-chip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.filter-count {
  font-size: 0.72rem;
  opacity: 0.7;
}

/* Notes grid */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin: 0 0 0.75rem;
}

.empty-text {
  font-size: 1.05rem;
  margin: 0 0 1rem;
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 550;
  text-decoration: underline;
}

.btn-text:hover {
  opacity: 0.8;
}

@media (max-width: 640px) {
  .notes-grid {
    grid-template-columns: 1fr;
  }

  .notes-header {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
