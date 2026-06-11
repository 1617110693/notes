<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  headings: {
    type: Array,
    required: true,
  },
})

const activeId = ref('')

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

// Track active heading on scroll
let observer = null

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          activeId.value = entry.target.id
        }
      }
    },
    { rootMargin: '-80px 0px -80% 0px', threshold: 0 },
  )

  for (const h of props.headings) {
    const el = document.getElementById(h.id)
    if (el) observer.observe(el)
  }
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

// Reset active when headings change
watch(
  () => props.headings,
  () => {
    activeId.value = ''
  },
)
</script>

<template>
  <nav v-if="headings.length > 0" class="table-of-contents">
    <h4 class="toc-title">On this page</h4>
    <ul class="toc-list">
      <li
        v-for="h in headings"
        :key="h.id"
        :class="[getHeadingClass(h.level), { active: activeId === h.id }]"
      >
        <a :href="`#${h.id}`" @click.prevent="scrollToHeading(h.id)">
          {{ h.text }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.table-of-contents {
  position: sticky;
  top: 80px;
  padding: 1rem 0;
}

.toc-title {
  font-size: 0.78rem;
  font-weight: 650;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  margin: 0 0 0.75rem;
}

.toc-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border-left: 1px solid var(--color-border);
}

.toc-list li {
  font-size: 0.82rem;
  line-height: 1.5;
}

.toc-list a {
  display: block;
  padding: 0.2rem 0 0.2rem 1rem;
  text-decoration: none;
  color: var(--color-text-secondary);
  border-left: 2px solid transparent;
  margin-left: -1px;
  transition: color 0.15s, border-color 0.15s;
}

.toc-list a:hover {
  color: var(--color-text);
}

.toc-list li.active a {
  color: var(--color-primary);
  border-left-color: var(--color-primary);
  font-weight: 500;
}

.toc-level-2 a {
  padding-left: 1rem;
}

.toc-level-3 a {
  padding-left: 2rem;
}

.toc-level-4 a {
  padding-left: 3rem;
}
</style>
