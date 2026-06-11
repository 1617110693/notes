<script setup>
import { renderMarkdown } from '@/utils/markdown'
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
})

const html = computed(() => renderMarkdown(props.content))
</script>

<template>
  <div class="markdown-renderer" v-html="html"></div>
</template>

<style scoped>
.markdown-renderer {
  /* Styles are in the global markdown CSS — this is the wrapper */
}
</style>
