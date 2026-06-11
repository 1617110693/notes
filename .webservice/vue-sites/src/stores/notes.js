import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import metadata from '@/data/notes-metadata.json'

// Lazy-load note contents — each note is a separate async chunk
const noteContents = import.meta.glob('../content/notes/**/*.md', {
  query: '?raw',
  import: 'default',
})

export const useNotesStore = defineStore('notes', () => {
  // State
  const searchQuery = ref('')
  const activeCategory = ref(null)
  const theme = ref(localStorage.getItem('theme') || 'light')

  // Getters
  const allNotes = computed(() => metadata.notes)
  const categories = computed(() => metadata.categories)

  const filteredNotes = computed(() => {
    let notes = allNotes.value

    if (activeCategory.value) {
      notes = notes.filter((n) => n.category === activeCategory.value)
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      notes = notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.description.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q),
      )
    }

    return notes
  })

  const categoryNoteCounts = computed(() => {
    const counts = {}
    for (const cat of categories.value) {
      counts[cat.id] = allNotes.value.filter((n) => n.category === cat.id).length
    }
    return counts
  })

  // Find a note by slug
  function getNoteBySlug(slug) {
    return allNotes.value.find((n) => n.slug === slug) || null
  }

  // Load note content on demand
  async function loadNoteContent(filename) {
    // Build the exact path
    const key = `../content/notes/${filename}`

    if (noteContents[key]) {
      return await noteContents[key]()
    }

    // Fallback: search for matching key
    for (const [path, loader] of Object.entries(noteContents)) {
      if (path.endsWith(filename) || path.endsWith(filename.replace(/^.*[\\/]/, ''))) {
        return await loader()
      }
    }

    console.warn(`Note content not found: ${filename}`)
    return null
  }

  // Theme toggle
  function toggleTheme() {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', theme.value)
    applyTheme(theme.value)
  }

  function applyTheme(t) {
    document.documentElement.setAttribute('data-theme', t)
  }

  // Initialize theme
  function initTheme() {
    applyTheme(theme.value)
  }

  // Actions
  function setSearchQuery(query) {
    searchQuery.value = query
  }

  function setActiveCategory(category) {
    activeCategory.value = category === activeCategory.value ? null : category
  }

  return {
    // State
    searchQuery,
    activeCategory,
    theme,
    // Getters
    allNotes,
    categories,
    filteredNotes,
    categoryNoteCounts,
    // Actions
    getNoteBySlug,
    loadNoteContent,
    toggleTheme,
    initTheme,
    setSearchQuery,
    setActiveCategory,
  }
})
