<script setup lang="ts">
import { watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useLoadingStore } from '@/stores/loading.store'
import LoaderAnimation from './LoaderAnimation.vue'
import LoaderOverlay from './LoaderOverlay.vue'

const store = useLoadingStore()
const { visible, message, progress, mode } = storeToRefs(store)

// Acessibilidade: marca a página como ocupada enquanto o loading está visível.
watch(visible, (value) => {
  document.body.setAttribute('aria-busy', String(value))
})
</script>

<template>
  <Teleport to="body">
    <!-- Modo inline: barra fina no topo (não bloqueia) -->
    <Transition name="loader-topbar">
      <div
        v-if="mode === 'inline' && visible"
        class="loader-topbar"
        role="status"
        aria-live="polite"
      >
        <span
          class="loader-topbar__fill"
          :style="progress !== null ? { width: `${Math.min(progress, 100)}%` } : undefined"
        />
      </div>
    </Transition>

    <!-- Fullscreen / modal: overlay translúcido -->
    <Transition name="loader-overlay" appear>
      <LoaderOverlay v-if="mode !== 'inline' && visible">
        <LoaderAnimation />
        <div class="loader-text" role="status" aria-live="polite">
          <p class="loader-text__message">{{ message }}</p>
          <div v-if="progress !== null" class="loader-progress">
            <div
              class="loader-progress__bar"
              :style="{ width: `${Math.min(progress, 100)}%` }"
            />
          </div>
          <div v-else class="loader-indeterminate"><span /></div>
        </div>
      </LoaderOverlay>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ---- Overlay (entrada/saída) ---- */
.loader-overlay-enter-active {
  transition:
    opacity 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.28s ease;
}
.loader-overlay-enter-from {
  opacity: 0;
  filter: blur(6px);
  transform: scale(0.985);
}
.loader-overlay-leave-active {
  transition:
    opacity 0.24s ease,
    filter 0.24s ease,
    transform 0.24s ease;
}
.loader-overlay-leave-to {
  opacity: 0;
  filter: blur(3px);
  transform: scale(0.99);
}

/* ---- Topbar inline ---- */
.loader-topbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 998;
  height: 3px;
  overflow: hidden;
  background: transparent;
}
.loader-topbar__fill {
  display: block;
  height: 100%;
  width: 0;
  background: linear-gradient(90deg, var(--glow-gold) 0%, var(--glow-gold-cta) 55%, var(--glow-gold-dark) 100%);
  transition: width 0.32s cubic-bezier(0.22, 1, 0.36, 1);
}
.loader-topbar-enter-active,
.loader-topbar-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.loader-topbar-enter-from,
.loader-topbar-leave-to {
  opacity: 0;
}

/* ---- Texto e progresso ---- */
.loader-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.loader-text__message {
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.01em;
  color: var(--glow-text-subtle);
}

.loader-progress {
  width: 180px;
  height: 4px;
  border-radius: 9999px;
  overflow: hidden;
  background: color-mix(in srgb, var(--glow-text-subtle) 16%, transparent);
}
.loader-progress__bar {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, var(--glow-gold), var(--glow-gold-cta));
  transition: width 0.2s ease;
}

.loader-indeterminate {
  position: relative;
  width: 180px;
  height: 4px;
  border-radius: 9999px;
  overflow: hidden;
  background: color-mix(in srgb, var(--glow-text-subtle) 16%, transparent);
}
.loader-indeterminate > span {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 40%;
  border-radius: 9999px;
  background: linear-gradient(90deg, transparent, var(--glow-gold-cta), transparent);
  animation: loader-slide 1.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  will-change: transform;
}
@keyframes loader-slide {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(320%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .loader-indeterminate > span {
    animation: none;
  }
  .loader-overlay-enter-active,
  .loader-overlay-leave-active,
  .loader-topbar-enter-active,
  .loader-topbar-leave-active {
    transition: none;
  }
}
</style>