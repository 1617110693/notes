<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { renderHeadingText } from '@/utils/markdown.js'

const props = defineProps({
  headings: {
    type: Array,
    required: true,
  },
  collapsed: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggle'])

const activeId = ref('')
const tocNav = ref(null)

function getHeadingClass(level) {
  return `toc-level-${level}`
}

function scrollToHeading(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeId.value = id
  }
}

// Sync TOC scroll position with the active heading
async function syncTocScroll() {
  await nextTick()
  const nav = tocNav.value
  if (!nav) return
  const activeLink = nav.querySelector('li.active a')
  if (activeLink) {
    const navRect = nav.getBoundingClientRect()
    const linkRect = activeLink.getBoundingClientRect()
    // Only scroll if active link is outside the visible area
    if (linkRect.top < navRect.top || linkRect.bottom > navRect.bottom) {
      activeLink.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }
}

let observer = null

function isTocVisible() {
  // Never create IntersectionObserver on mobile — sidebar is display:none,
  // and observing 100+ headings on mobile Safari can break position:sticky
  if (window.innerWidth < 768) return false
  return tocNav.value && tocNav.value.offsetParent !== null
}

function startObserving() {
  if (observer) return
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (activeId.value !== entry.target.id) {
            activeId.value = entry.target.id
            syncTocScroll()
          }
        }
      }
    },
    { rootMargin: '-80px 0px -80% 0px', threshold: 0 },
  )

  for (const h of props.headings) {
    const el = document.getElementById(h.id)
    if (el) observer.observe(el)
  }
}

function stopObserving() {
  if (observer) {
    observer.disconnect()
    observer = null
  }
}

onMounted(() => {
  // Only observe when TOC is actually visible (not mobile, not collapsed)
  if (isTocVisible() && !props.collapsed) {
    startObserving()
  }
})

onUnmounted(() => {
  stopObserving()
})

// Watch collapsed state to connect/disconnect observer
watch(
  () => props.collapsed,
  (collapsed) => {
    if (collapsed) {
      stopObserving()
    } else if (isTocVisible()) {
      startObserving()
    }
  },
)

watch(
  () => props.headings,
  () => {
    activeId.value = ''
  },
)
</script>

<template>
  <nav ref="tocNav" v-if="headings.length > 0" class="table-of-contents">
    <div class="toc-header">
      <h4 class="toc-title">On this page</h4>
      <button
        class="toc-toggle"
        @click="emit('toggle')"
        :title="props.collapsed ? 'Expand' : 'Collapse'"
        :aria-label="props.collapsed ? 'Expand table of contents' : 'Collapse table of contents'"
      >
        <span v-if="props.collapsed">+</span>
        <span v-else>×</span>
      </button>
    </div>
    <ul v-show="!props.collapsed" class="toc-list">
      <li
        v-for="h in headings"
        :key="h.id"
        :class="[getHeadingClass(h.level), { active: activeId === h.id }]"
      >
        <a :href="`#${h.id}`" @click.prevent="scrollToHeading(h.id)" v-html="renderHeadingText(h.text)"></a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.table-of-contents {
  padding: 0.5rem 0;
}

.toc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.85rem;
  gap: 0.5rem;
}

.toc-title {
  font-size: 0.72rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-muted);
  margin: 0;
}

.toc-toggle {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 5px;
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.8rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}

.toc-toggle:hover {
  color: var(--color-text);
  border-color: var(--color-text-muted);
  background: var(--color-surface);
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.toc-list li {
  font-size: 0.82rem;
  line-height: 1.5;
}

.toc-list a {
  display: block;
  padding: 0.25rem 0 0.25rem 0.85rem;
  text-decoration: none;
  color: var(--color-text-secondary);
  border-left: 2px solid transparent;
  transition: color 0.15s, border-color 0.15s;
}

.toc-list a:hover {
  color: var(--color-text);
}

.toc-list li.active a {
  color: var(--color-primary);
  border-left-color: var(--color-primary);
  font-weight: 550;
}

.toc-level-2 a {
  padding-left: 0.85rem;
}

.toc-level-3 a {
  padding-left: 1.65rem;
}

.toc-level-4 a {
  padding-left: 2.45rem;
}
</style>
