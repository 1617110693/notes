<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotesStore } from '@/stores/notes'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import SearchBar from './SearchBar.vue'

const store = useNotesStore()
const route = useRoute()
const router = useRouter()

const siteTitle = __SITE_TITLE__

const isHome = computed(() => route.name === 'home')
const isNotes = computed(() => route.path.startsWith('/notes'))
const mobileMenuOpen = ref(false)
const notesDropdownOpen = ref(false)
const dropdownRef = ref(null)

// Notes grouped by category for the dropdown
const notesByCategory = computed(() => {
  const map = {}
  for (const note of store.allNotes) {
    const catId = note.category
    if (!map[catId]) {
      const cat = store.categories.find(c => c.id === catId)
      map[catId] = { name: cat?.name || catId, icon: cat?.icon || '📄', notes: [] }
    }
    map[catId].notes.push(note)
  }
  return map
})

function toggleNotesDropdown() {
  notesDropdownOpen.value = !notesDropdownOpen.value
}

function navigateToNote(slug) {
  notesDropdownOpen.value = false
  router.push(`/notes/${slug}`)
}

function closeMenu() {
  mobileMenuOpen.value = false
}

// Close dropdown on outside click
function onDocClick(e) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target)) {
    notesDropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocClick))
onUnmounted(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- Logo -->
      <RouterLink to="/" class="logo" @click="store.setSearchQuery(''); closeMenu()">
        <span class="logo-icon">📓</span>
        <span class="logo-text">{{ siteTitle }}</span>
      </RouterLink>

      <!-- Desktop nav -->
      <nav class="nav-links">
        <RouterLink to="/" :class="{ active: isHome }" @click="closeMenu">Home</RouterLink>
        <div class="nav-dropdown-wrap" ref="dropdownRef">
          <button
            class="nav-dropdown-btn"
            :class="{ active: isNotes, open: notesDropdownOpen }"
            @click.stop="toggleNotesDropdown"
          >
            Notes
            <span class="dropdown-arrow" :class="{ rotated: notesDropdownOpen }">▾</span>
          </button>
          <Transition name="dropdown-fade">
            <div v-if="notesDropdownOpen" class="notes-dropdown" @click.stop>
              <div
                v-for="(group, catId) in notesByCategory"
                :key="catId"
                class="dropdown-group"
              >
                <span class="dropdown-group-label">
                  <span class="dropdown-cat-icon">{{ group.icon }}</span>
                  {{ group.name }}
                  <span class="dropdown-cat-count">{{ group.notes.length }}</span>
                </span>
                <button
                  v-for="note in group.notes"
                  :key="note.slug"
                  class="dropdown-note-item"
                  :class="{ current: route.params.slug === note.slug }"
                  @click="navigateToNote(note.slug)"
                >
                  <span class="dropdown-note-title">{{ note.title }}</span>
                  <span class="dropdown-note-date">{{ note.date }}</span>
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </nav>

      <!-- Actions -->
      <div class="header-actions">
        <SearchBar v-if="!isHome" />
        <button
          class="theme-toggle"
          @click="store.toggleTheme()"
          :aria-label="store.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'"
          :title="store.theme === 'light' ? 'Dark mode' : 'Light mode'"
        >
          {{ store.theme === 'light' ? '🌙' : '☀️' }}
        </button>
        <!-- Hamburger -->
        <button
          class="hamburger"
          :class="{ open: mobileMenuOpen }"
          @click="mobileMenuOpen = !mobileMenuOpen"
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide-down">
      <nav v-if="mobileMenuOpen" class="mobile-nav" @click="closeMenu">
        <RouterLink to="/" :class="{ active: isHome }">🏠 Home</RouterLink>
        <RouterLink to="/notes" :class="{ active: isNotes }">📝 Notes</RouterLink>

        <!-- Mobile notes directory -->
        <div class="mobile-notes-dir">
          <div
            v-for="(group, catId) in notesByCategory"
            :key="catId"
            class="mobile-dir-group"
          >
            <span class="mobile-dir-label">
              {{ group.icon }} {{ group.name }}
            </span>
            <RouterLink
              v-for="note in group.notes"
              :key="note.slug"
              :to="`/notes/${note.slug}`"
              class="mobile-dir-item"
            >
              {{ note.title }}
            </RouterLink>
          </div>
        </div>

        <div class="mobile-search">
          <SearchBar />
        </div>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--color-header-bg);
  border-bottom: 1px solid var(--color-border);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  transition: background-color 0.3s, border-color 0.3s;
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  height: 58px;
  gap: 2rem;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  text-decoration: none;
  color: var(--color-text);
  font-weight: 700;
  font-size: 1.1rem;
  flex-shrink: 0;
  letter-spacing: -0.01em;
}

.logo-icon {
  font-size: 1.35rem;
  transition: transform 0.2s;
}

.logo:hover .logo-icon {
  transform: scale(1.1);
}

/* Desktop nav */
.nav-links {
  display: flex;
  gap: 0.25rem;
}

.nav-links a {
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
  transition: color 0.15s, background-color 0.15s;
}

.nav-links a:hover {
  color: var(--color-text);
  background: var(--color-surface);
}

.nav-links a.active,
.nav-links a.router-link-exact-active {
  color: var(--color-primary);
  background: var(--color-primary-bg);
  font-weight: 600;
}

/* ── Notes Dropdown ────────────────────────────── */

.nav-dropdown-wrap {
  position: relative;
}

.nav-dropdown-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.4;
  font-family: inherit;
  cursor: pointer;
  transition: color 0.15s, background-color 0.15s;
}

.nav-dropdown-btn:hover {
  color: var(--color-text);
  background: var(--color-surface);
}

.nav-dropdown-btn.active,
.nav-dropdown-btn.open {
  color: var(--color-primary);
  background: var(--color-primary-bg);
  font-weight: 600;
}

.dropdown-arrow {
  font-size: 0.65rem;
  transition: transform 0.2s;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

/* Dropdown panel */
.notes-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 380px;
  max-height: 420px;
  overflow-y: auto;
  background: var(--color-card-bg);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: var(--color-shadow-lg);
  padding: 0.6rem;
  z-index: 300;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
}

.dropdown-group {
  margin-bottom: 0.35rem;
}

.dropdown-group:last-child {
  margin-bottom: 0;
}

.dropdown-group-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.65rem 0.3rem;
  font-size: 0.72rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  border-bottom: 1px solid var(--color-border-light);
  margin-bottom: 0.15rem;
}

.dropdown-cat-icon {
  font-size: 0.85rem;
}

.dropdown-cat-count {
  margin-left: auto;
  opacity: 0.6;
  font-weight: 500;
}

.dropdown-note-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.45rem 0.65rem;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text);
  font-size: 0.84rem;
  font-family: inherit;
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
}

.dropdown-note-item:hover {
  background: var(--color-surface);
}

.dropdown-note-item.current {
  background: var(--color-primary-bg);
  color: var(--color-primary);
  font-weight: 550;
}

.dropdown-note-title {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-note-date {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  flex-shrink: 0;
  margin-left: 0.75rem;
}

.dropdown-note-item.current .dropdown-note-date {
  color: var(--color-primary);
  opacity: 0.7;
}

/* Dropdown transition */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Actions */
.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.theme-toggle {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 0.4rem 0.55rem;
  cursor: pointer;
  font-size: 1.1rem;
  line-height: 1;
  transition: border-color 0.15s, background-color 0.15s, transform 0.15s;
  flex-shrink: 0;
}

.theme-toggle:hover {
  background: var(--color-surface);
  border-color: var(--color-text-muted);
  transform: scale(1.05);
}

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 0.45rem 0.5rem;
  cursor: pointer;
  width: 38px;
  height: 38px;
}

.hamburger span {
  display: block;
  width: 18px;
  height: 2px;
  background: var(--color-text);
  border-radius: 2px;
  transition: transform 0.25s, opacity 0.2s;
}

.hamburger.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.hamburger.open span:nth-child(2) {
  opacity: 0;
}

.hamburger.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Mobile nav */
.mobile-nav {
  display: none;
  flex-direction: column;
  padding: 0.75rem 1.5rem 1.25rem;
  gap: 0.35rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
}

.mobile-nav a {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
}

.mobile-nav a:hover,
.mobile-nav a.active {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

.mobile-search {
  margin-top: 0.5rem;
}

/* Mobile notes directory */
.mobile-notes-dir {
  margin-top: 0.5rem;
  border-top: 1px solid var(--color-border);
  padding-top: 0.5rem;
  max-height: 280px;
  overflow-y: auto;
}

.mobile-dir-group {
  margin-bottom: 0.5rem;
}

.mobile-dir-label {
  display: block;
  padding: 0.35rem 0.85rem;
  font-size: 0.7rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.mobile-dir-item {
  display: block;
  padding: 0.4rem 0.85rem 0.4rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  color: var(--color-text-secondary);
  font-size: 0.84rem;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mobile-dir-item:hover {
  color: var(--color-primary);
  background: var(--color-primary-bg);
}

/* Transition */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.25s ease;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Responsive */
@media (max-width: 768px) {
  .header-inner {
    gap: 1rem;
    padding: 0 1rem;
  }

  .nav-links {
    display: none;
  }

  .hamburger {
    display: flex;
  }

  .mobile-nav {
    display: flex;
  }

  .notes-dropdown {
    width: calc(100vw - 2rem);
    left: -120px;
    max-height: 340px;
  }
}

@media (max-width: 480px) {
  .logo-text {
    display: none;
  }

  .logo-icon {
    font-size: 1.5rem;
  }
}
</style>
