<script setup>
import { useNotesStore } from '@/stores/notes'
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'
import SearchBar from './SearchBar.vue'

const store = useNotesStore()
const route = useRoute()

const isHome = computed(() => route.name === 'home')
const isNotes = computed(() => route.path.startsWith('/notes'))
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <RouterLink to="/" class="logo" @click="store.setSearchQuery('')">
        <span class="logo-icon">📓</span>
        <span class="logo-text">My Notes</span>
      </RouterLink>

      <nav class="nav-links">
        <RouterLink to="/" :class="{ active: isHome }">Home</RouterLink>
        <RouterLink to="/notes" :class="{ active: isNotes }">Notes</RouterLink>
      </nav>

      <div class="header-actions">
        <SearchBar v-if="!isHome" />
        <button
          class="theme-toggle"
          @click="store.toggleTheme()"
          :aria-label="store.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
          :title="store.theme === 'light' ? '🌙 Dark mode' : '☀️ Light mode'"
        >
          {{ store.theme === 'light' ? '🌙' : '☀️' }}
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-header-bg);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(12px);
  transition: background-color 0.3s, border-color 0.3s;
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  height: 56px;
  gap: 1.5rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--color-text);
  font-weight: 700;
  font-size: 1.15rem;
  flex-shrink: 0;
}

.logo-icon {
  font-size: 1.4rem;
}

.nav-links {
  display: flex;
  gap: 0.25rem;
}

.nav-links a {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s, background-color 0.2s;
}

.nav-links a:hover {
  color: var(--color-text);
  background: var(--color-surface);
}

.nav-links a.active,
.nav-links a.router-link-exact-active {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.theme-toggle {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.35rem 0.5rem;
  cursor: pointer;
  font-size: 1.15rem;
  line-height: 1;
  transition: border-color 0.2s, background-color 0.2s;
  flex-shrink: 0;
}

.theme-toggle:hover {
  background: var(--color-surface);
  border-color: var(--color-text-secondary);
}

@media (max-width: 640px) {
  .header-inner {
    padding: 0 1rem;
    gap: 0.75rem;
  }

  .logo-text {
    display: none;
  }

  .nav-links a {
    padding: 0.35rem 0.5rem;
    font-size: 0.85rem;
  }
}
</style>
