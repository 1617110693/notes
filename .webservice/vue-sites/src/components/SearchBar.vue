<script setup>
import { useNotesStore } from '@/stores/notes'
import { ref, watch } from 'vue'

const store = useNotesStore()
const localQuery = ref(store.searchQuery)

let timer = null
function debouncedSearch(val) {
  clearTimeout(timer)
  timer = setTimeout(() => {
    store.setSearchQuery(val)
  }, 200)
}

watch(localQuery, (val) => {
  debouncedSearch(val)
})
</script>

<template>
  <div class="search-bar">
    <span class="search-icon">🔍</span>
    <input
      v-model="localQuery"
      type="text"
      placeholder="Search notes..."
      class="search-input"
      aria-label="Search notes"
    />
    <button
      v-if="localQuery"
      class="search-clear"
      @click="localQuery = ''"
      aria-label="Clear search"
    >
      ✕
    </button>
  </div>
</template>

<style scoped>
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.65rem;
  font-size: 0.8rem;
  pointer-events: none;
  opacity: 0.6;
}

.search-input {
  width: 180px;
  padding: 0.4rem 2rem 0.4rem 2rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 0.85rem;
  outline: none;
  transition: width 0.3s, border-color 0.2s, background-color 0.2s;
}

.search-input:focus {
  width: 240px;
  border-color: var(--color-primary);
}

.search-clear {
  position: absolute;
  right: 0.4rem;
  background: none;
  border: none;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0.2rem;
  line-height: 1;
}

.search-clear:hover {
  color: var(--color-text);
}

@media (max-width: 640px) {
  .search-input {
    width: 120px;
  }

  .search-input:focus {
    width: 160px;
  }
}
</style>
