<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import AppHeader from '@/components/AppHeader.vue'
import { useNotesStore } from '@/stores/notes'

const store = useNotesStore()

onMounted(() => {
  store.initTheme()
})
</script>

<template>
  <div class="app-shell">
    <AppHeader />
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
    <footer class="app-footer">
      <div class="footer-inner">
        <p>
          Built with Vue &amp; 💙 — <a href="https://github.com/1617110693/notes" target="_blank" rel="noopener">GitHub</a>
        </p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
  transition: background-color 0.3s, color 0.3s;
}

.main-content {
  flex: 1;
  width: 100%;
}

.app-footer {
  margin-top: 3rem;
  border-top: 1px solid var(--color-border);
  padding: 1.5rem 0;
  text-align: center;
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.footer-inner p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.footer-inner a {
  color: var(--color-primary);
  text-decoration: none;
}

.footer-inner a:hover {
  text-decoration: underline;
}

/* Page transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
