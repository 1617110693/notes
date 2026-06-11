<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useNotesStore } from '@/stores/notes'
import { useRoute } from 'vue-router'
import NoteCard from '@/components/NoteCard.vue'

const store = useNotesStore()
const route = useRoute()
const viewMode = ref('grid') // 'grid' | 'list' | 'table'
const sortBy = ref('date')  // 'date' | 'title'

// Sort the filtered notes
const sortedNotes = computed(() => {
  const notes = [...store.filteredNotes]
  if (sortBy.value === 'title') {
    return notes.sort((a, b) => a.title.localeCompare(b.title))
  }
  // Default: by date descending
  return notes.sort((a, b) => (b.date || '').localeCompare(a.date || ''))
})

// Apply category filter from URL
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
    <!-- Header — full-width band -->
    <header class="notes-header">
      <div class="notes-header-inner">
        <div>
          <h1 class="notes-title">All Notes</h1>
          <p class="notes-subtitle">
            {{ store.filteredNotes.length }} note{{ store.filteredNotes.length !== 1 ? 's' : '' }}
            <template v-if="store.activeCategory"> in {{ store.categories.find(c => c.id === store.activeCategory)?.name }}</template>
          </p>
        </div>
        <div class="notes-controls">
          <!-- View toggle -->
          <div class="view-toggle">
            <button
              :class="{ active: viewMode === 'grid' }"
              @click="viewMode = 'grid'"
              title="Grid view"
              aria-label="Grid view"
            >▦</button>
            <button
              :class="{ active: viewMode === 'list' }"
              @click="viewMode = 'list'"
              title="List view"
              aria-label="List view"
            >☰</button>
            <button
              :class="{ active: viewMode === 'table' }"
              @click="viewMode = 'table'"
              title="Compact table view"
              aria-label="Compact table view"
            >☷</button>
          </div>
          <!-- Sort -->
          <select class="sort-select" v-model="sortBy" aria-label="Sort notes">
            <option value="date">By Date</option>
            <option value="title">By Title</option>
          </select>
        </div>
      </div>
    </header>

    <!-- Content area -->
    <div class="notes-content">
      <!-- Category filters -->
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
          <span class="chip-icon">{{ cat.icon }}</span>
          {{ cat.name }}
          <span class="filter-count">{{ store.categoryNoteCounts[cat.id] }}</span>
        </button>
      </div>

      <!-- Grid view -->
      <div v-if="viewMode === 'grid' && sortedNotes.length > 0" class="notes-grid">
        <NoteCard
          v-for="note in sortedNotes"
          :key="note.slug"
          :note="note"
        />
      </div>

      <!-- List view -->
      <div v-if="viewMode === 'list' && sortedNotes.length > 0" class="notes-list">
        <RouterLink
          v-for="note in sortedNotes"
          :key="note.slug"
          :to="`/notes/${note.slug}`"
          class="list-item"
        >
          <span class="list-icon">{{ store.categories.find(c => c.id === note.category)?.icon || '📄' }}</span>
          <div class="list-body">
            <span class="list-title">{{ note.title }}</span>
            <span class="list-desc">{{ note.description }}</span>
          </div>
          <span class="list-meta">
            <span class="list-date">{{ note.date }}</span>
            <span class="list-cat">{{ note.category }}</span>
          </span>
        </RouterLink>
      </div>

      <!-- Compact table view -->
      <div v-if="viewMode === 'table' && sortedNotes.length > 0" class="notes-table-wrap">
        <table class="notes-table">
          <thead>
            <tr>
              <th class="col-icon"></th>
              <th class="col-title">Title</th>
              <th class="col-cat">Category</th>
              <th class="col-date">Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="note in sortedNotes"
              :key="note.slug"
              class="table-row"
              @click="$router.push(`/notes/${note.slug}`)"
            >
              <td class="col-icon">
                <span class="table-icon">{{ store.categories.find(c => c.id === note.category)?.icon || '📄' }}</span>
              </td>
              <td class="col-title">
                <span class="table-title">{{ note.title }}</span>
                <span class="table-desc">{{ note.description }}</span>
              </td>
              <td class="col-cat">
                <span class="table-cat-badge">{{ note.category }}</span>
              </td>
              <td class="col-date">{{ note.date }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty -->
      <div v-if="sortedNotes.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No notes found</h3>
        <p>Try adjusting your search or filter criteria.</p>
        <button class="btn-clear" @click="store.setSearchQuery(''); store.setActiveCategory(null)">
          Clear filters
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notes-view {
  /* No max-width — sections control their own width */
}

/* Header — full-width band */
.notes-header {
  padding: 2.5rem 1.5rem;
  background: linear-gradient(180deg, var(--color-primary-bg) 0%, var(--color-bg) 100%);
  border-bottom: 1px solid var(--color-border);
}

.notes-header-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

/* Content area */
.notes-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 2rem;
}

.notes-title {
  font-size: 2rem;
  font-weight: 750;
  color: var(--color-text);
  margin: 0 0 0.3rem;
  letter-spacing: -0.025em;
}

.notes-subtitle {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin: 0;
}

.notes-controls {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}

/* View toggle */
.view-toggle {
  display: flex;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.view-toggle button {
  padding: 0.4rem 0.65rem;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  transition: background 0.15s, color 0.15s;
}

.view-toggle button.active {
  background: var(--color-primary);
  color: #fff;
}

.view-toggle button:not(.active):hover {
  background: var(--color-surface);
  color: var(--color-text);
}

.sort-select {
  padding: 0.4rem 0.65rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-card-bg);
  color: var(--color-text-secondary);
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  outline: none;
}

.sort-select:focus {
  border-color: var(--color-primary);
}

/* Category filters */
.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 2rem;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.95rem;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  background: var(--color-card-bg);
  color: var(--color-text-secondary);
  font-size: 0.84rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.filter-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-text);
  box-shadow: var(--color-shadow-sm);
}

.filter-chip.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}

.chip-icon {
  font-size: 0.9rem;
}

.filter-count {
  font-size: 0.7rem;
  opacity: 0.7;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.05rem 0.4rem;
  border-radius: 10px;
}

.filter-chip:not(.active) .filter-count {
  background: var(--color-surface);
}

/* Grid */
.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.1rem;
}

/* List */
.notes-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  text-decoration: none;
  color: inherit;
  background: var(--color-card-bg);
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
}

.list-item:hover {
  border-color: var(--color-primary);
  box-shadow: var(--color-shadow);
  transform: translateX(3px);
}

.list-icon {
  font-size: 1.4rem;
  flex-shrink: 0;
  width: 40px;
  text-align: center;
}

.list-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.list-title {
  font-weight: 650;
  color: var(--color-text);
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-desc {
  font-size: 0.82rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.list-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
  flex-shrink: 0;
}

.list-date {
  font-size: 0.78rem;
  color: var(--color-text-muted);
}

.list-cat {
  font-size: 0.7rem;
  color: var(--color-primary);
  font-weight: 500;
  background: var(--color-primary-bg);
  padding: 0.1rem 0.5rem;
  border-radius: 8px;
}

/* ── Compact Table View ──────────────────────────── */

.notes-table-wrap {
  border: 1px solid var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.notes-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.notes-table thead {
  background: var(--color-surface);
}

.notes-table th {
  padding: 0.7rem 1rem;
  text-align: left;
  font-weight: 650;
  color: var(--color-text-muted);
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--color-border);
}

.notes-table th.col-icon {
  width: 48px;
  text-align: center;
}

.notes-table th.col-cat {
  width: 140px;
}

.notes-table th.col-date {
  width: 110px;
}

.table-row {
  cursor: pointer;
  transition: background 0.12s;
  border-bottom: 1px solid var(--color-border-light);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row:hover {
  background: var(--color-primary-bg);
}

.table-row td {
  padding: 0.6rem 1rem;
  vertical-align: middle;
}

.col-icon {
  text-align: center;
}

.table-icon {
  font-size: 1.1rem;
}

.col-title {
  min-width: 0;
}

.table-title {
  display: block;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 480px;
  line-height: 1.4;
}

.table-desc {
  display: block;
  font-size: 0.78rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 480px;
  margin-top: 0.1rem;
}

.table-cat-badge {
  display: inline-block;
  padding: 0.15rem 0.6rem;
  background: var(--color-primary-bg);
  color: var(--color-primary);
  border-radius: 12px;
  font-size: 0.76rem;
  font-weight: 550;
}

.col-date {
  color: var(--color-text-muted);
  font-size: 0.82rem;
  white-space: nowrap;
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 4rem 1rem;
}

.empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.2rem;
  font-weight: 650;
  color: var(--color-text);
  margin: 0 0 0.5rem;
}

.empty-state p {
  font-size: 0.95rem;
  color: var(--color-text-muted);
  margin: 0 0 1.25rem;
}

.btn-clear {
  background: var(--color-primary);
  color: #fff;
  border: none;
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 550;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s, transform 0.15s;
}

.btn-clear:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
}

@media (max-width: 640px) {
  .notes-header-inner {
    flex-direction: column;
    gap: 0.75rem;
  }

  .notes-title {
    font-size: 1.5rem;
  }

  .notes-grid {
    grid-template-columns: 1fr;
  }

  .list-meta {
    display: none;
  }

  .notes-content {
    padding: 1rem 1rem 1.5rem;
  }

  .notes-header {
    padding: 2rem 1rem;
  }

  /* Table responsive */
  .notes-table th.col-cat,
  .notes-table td.col-cat {
    display: none;
  }

  .table-desc {
    max-width: 260px;
  }

  .table-title {
    max-width: 260px;
  }
}
</style>
