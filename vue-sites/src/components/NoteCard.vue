<script setup>
import { computed } from 'vue'
import { estimateReadingTime } from '@/utils/markdown'

const props = defineProps({
  note: {
    type: Object,
    required: true,
  },
  excerpt: {
    type: String,
    default: '',
  },
})

const categoryIcon = computed(() => {
  const icons = {
    'machine-learning': '🤖',
    python: '🐍',
    mathematics: '📐',
    tools: '🛠',
  }
  return icons[props.note.category] || '📄'
})

const readingTime = computed(() => {
  if (!props.excerpt) return null
  return estimateReadingTime(props.excerpt)
})
</script>

<template>
  <article class="note-card">
    <RouterLink :to="`/notes/${note.slug}`" class="note-card-link">
      <div class="note-card-header">
        <span class="note-category">{{ categoryIcon }} {{ note.category }}</span>
        <span v-if="readingTime" class="note-reading-time">{{ readingTime }} min read</span>
      </div>
      <h3 class="note-title">{{ note.title }}</h3>
      <p class="note-description">{{ note.description }}</p>
      <div class="note-card-footer">
        <span class="note-date">{{ note.date }}</span>
        <span class="note-read-more">Read more →</span>
      </div>
    </RouterLink>
  </article>
</template>

<style scoped>
.note-card {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-card-bg);
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
  overflow: hidden;
}

.note-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 20px var(--color-shadow);
  transform: translateY(-2px);
}

.note-card-link {
  display: block;
  padding: 1.25rem;
  text-decoration: none;
  color: inherit;
  height: 100%;
}

.note-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.note-category {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  text-transform: capitalize;
  font-weight: 500;
}

.note-reading-time {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  background: var(--color-surface);
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
}

.note-title {
  font-size: 1.1rem;
  font-weight: 650;
  color: var(--color-text);
  margin: 0 0 0.5rem;
  line-height: 1.4;
}

.note-description {
  font-size: 0.88rem;
  color: var(--color-text-secondary);
  line-height: 1.55;
  margin: 0 0 0.75rem;
}

.note-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.note-date {
  color: var(--color-text-muted);
}

.note-read-more {
  color: var(--color-primary);
  font-weight: 500;
  opacity: 0;
  transform: translateX(-4px);
  transition: opacity 0.2s, transform 0.2s;
}

.note-card:hover .note-read-more {
  opacity: 1;
  transform: translateX(0);
}
</style>
