<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import { useNotesStore } from '@/stores/notes'

const store = useNotesStore()
const router = useRouter()

// Reading progress
const progressPct = ref(0)
const showBackToTop = ref(false)

let scrollTimer = null
function onScroll() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  progressPct.value = docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0
  showBackToTop.value = scrollTop > 400
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Scroll-reveal observer
let revealObserver = null
function setupRevealObserver() {
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  )
  // Observe after DOM settles
  setTimeout(() => {
    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el))
  }, 100)
}

onMounted(() => {
  store.initTheme()
  window.addEventListener('scroll', onScroll, { passive: true })
  setupRevealObserver()
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (revealObserver) revealObserver.disconnect()
})

// Re-run reveal observer on route change
router.afterEach(() => {
  setTimeout(setupRevealObserver, 150)
})
</script>

<template>
  <div class="app-shell">
    <!-- Reading progress -->
    <div class="reading-progress" :style="{ width: progressPct + '%' }"></div>

    <AppHeader />
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>

    <!-- Back to top -->
    <button
      class="back-to-top"
      :class="{ visible: showBackToTop }"
      @click="scrollToTop"
      aria-label="Back to top"
      title="Back to top"
    >
      ↑
    </button>

    <footer class="app-footer">
      <div class="footer-inner">
        <div class="footer-divider"></div>
        <p>
          Crafted with care —
          <a href="https://github.com/1617110693/notes" target="_blank" rel="noopener">View on GitHub</a>
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

/* Footer */
.app-footer {
  margin-top: 4rem;
  padding: 2rem 1.5rem;
  text-align: center;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.footer-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.footer-divider {
  width: 40px;
  height: 3px;
  background: var(--color-primary);
  border-radius: 2px;
  margin: 0 auto 1.25rem;
  opacity: 0.5;
}

.footer-inner p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.footer-inner a {
  color: var(--color-primary);
  font-weight: 500;
}

.footer-inner a:hover {
  text-decoration: underline;
}

/* Page transition */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
