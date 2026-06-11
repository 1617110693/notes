<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="not-found-view">
    <p class="nf-icon">🔮</p>
    <h1>404</h1>
    <p>The page you're looking for doesn't exist.</p>
    <RouterLink to="/" class="btn-primary">← Go home</RouterLink>
  </div>
</template>

<style scoped>
.not-found-view {
  text-align: center;
  padding: 4rem 1.5rem;
  max-width: 500px;
  margin: 0 auto;
}

.nf-icon {
  font-size: 4rem;
  margin: 0 0 1rem;
}

.not-found-view h1 {
  font-size: 3rem;
  font-weight: 750;
  color: var(--color-text);
  margin: 0 0 0.5rem;
}

.not-found-view p {
  color: var(--color-text-secondary);
  font-size: 1.05rem;
  margin: 0 0 1.5rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  padding: 0.6rem 1.4rem;
  background: var(--color-primary);
  color: #fff;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
}
</style>
