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

const categoryInfo = computed(() => {
  const map = {
    'machine-learning': { icon: '🤖', color: 'var(--cat-ml)' },
    python: { icon: '🐍', color: 'var(--cat-python)' },
    mathematics: { icon: '📐', color: 'var(--cat-math)' },
    tools: { icon: '🛠', color: 'var(--cat-tools)' },
  }
  return map[props.note.category] || { icon: '📄', color: 'var(--cat-default)' }
})

const readingTime = computed(() => {
  if (!props.excerpt) return null
  return estimateReadingTime(props.excerpt)
})
</script>

<template>
  <article class="note-card">
    <RouterLink :to="`/notes/${note.slug}`" class="note-card-link">
      <!-- Accent line at top -->
      <div class="card-accent" :style="{ background: categoryInfo.color }"></div>
      <div class="card-body">
        <div class="note-card-header">
          <span class="note-category">
            <span class="cat-dot" :style="{ background: categoryInfo.color }"></span>
            {{ categoryInfo.icon }} {{ note.category }}
          </span>
          <span v-if="readingTime" class="note-reading-time">{{ readingTime }} min</span>
        </div>
        <h3 class="note-title">{{ note.title }}</h3>
        <p class="note-description">{{ note.description }}</p>
        <div class="note-card-footer">
          <span class="note-date">{{ note.date }}</span>
          <span class="note-read-more">Read more →</span>
        </div>
      </div>
    </RouterLink>
  </article>
</template>

<style scoped>
.note-card {
  position: relative;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-card-bg);
  transition: border-color 0.2s, box-shadow 0.25s, transform 0.25s;
  overflow: hidden;
}

.note-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--color-shadow-lg);
  transform: translateY(-3px);
}

.card-accent {
  height: 3px;
  width: 100%;
  transition: height 0.25s;
}

.note-card:hover .card-accent {
  height: 4px;
}

.note-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.card-body {
  padding: 1.2rem 1.3rem 1.3rem;
}

.note-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.65rem;
}

.note-category {
  font-size: 0.78rem;
  color: var(--color-text-secondary);
  text-transform: capitalize;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.cat-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.note-reading-time {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  background: var(--color-surface);
  padding: 0.15rem 0.55rem;
  border-radius: 12px;
  font-weight: 500;
}

.note-title {
  font-size: 1.12rem;
  font-weight: 650;
  color: var(--color-text);
  margin: 0 0 0.55rem;
  line-height: 1.4;
  letter-spacing: -0.01em;
}

.note-description {
  font-size: 0.88rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  margin: 0 0 0.85rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.note-date {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.note-read-more {
  font-size: 0.82rem;
  color: var(--color-primary);
  font-weight: 550;
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity 0.25s, transform 0.25s;
}

.note-card:hover .note-read-more {
  opacity: 1;
  transform: translateX(0);
}
</style>
