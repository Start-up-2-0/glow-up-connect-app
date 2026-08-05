<script setup lang="ts">
import { Compass, Sparkles } from 'lucide-vue-next'

defineProps<{
  titulo: string
  subtitulo: string
  loading?: boolean
}>()

const emit = defineEmits<{ explorar: [] }>()
</script>

<template>
  <section class="cliente-hero">
    <!-- Decorativo (aria-hidden) -->
    <div class="cliente-hero__decor" aria-hidden="true">
      <span class="cliente-hero__blob cliente-hero__blob--one" />
      <span class="cliente-hero__blob cliente-hero__blob--two" />
      <span class="cliente-hero__glass" />
      <Sparkles class="cliente-hero__spark" :size="22" :stroke-width="1.5" />
    </div>

    <div class="relative z-10 max-w-[560px]">
      <div v-if="loading" class="cliente-hero__skeleton" />
      <template v-else>
        <p class="font-urbanist text-sm font-semibold uppercase tracking-[0.14em] text-white/80">
          ✦ Sua jornada de beleza
        </p>
        <h1 class="mt-2 font-urbanist text-3xl font-bold leading-tight text-white sm:text-[34px]">
          {{ titulo }}
        </h1>
        <p class="mt-2 font-urbanist text-[15px] leading-relaxed text-white/80">{{ subtitulo }}</p>
      </template>
    </div>

    <button
      v-if="!loading"
      type="button"
      class="cliente-hero__cta"
      @click="emit('explorar')"
    >
      <Compass :size="18" :stroke-width="2" />
      Explorar profissionais
    </button>
  </section>
</template>

<style scoped>
.cliente-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  overflow: hidden;
  padding: 28px 28px;
  border-radius: 24px;
  background: linear-gradient(120deg, #2c154b 0%, #522e5f 52%, #755e8a 100%);
  box-shadow: 0 16px 40px -20px rgba(44, 21, 75, 0.55);
}
.cliente-hero__decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.cliente-hero__blob {
  position: absolute;
  border-radius: 9999px;
  filter: blur(30px);
  opacity: 0.5;
}
.cliente-hero__blob--one {
  width: 200px;
  height: 200px;
  right: -30px;
  top: -60px;
  background: radial-gradient(circle at 30% 30%, #cfb0da, transparent 70%);
  animation: float-a 8s ease-in-out infinite;
}
.cliente-hero__blob--two {
  width: 150px;
  height: 150px;
  right: 120px;
  bottom: -70px;
  background: radial-gradient(circle at 60% 40%, #5b7fd4, transparent 70%);
  opacity: 0.35;
  animation: float-b 10s ease-in-out infinite;
}
.cliente-hero__glass {
  position: absolute;
  right: 40px;
  top: 24px;
  width: 96px;
  height: 96px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(4px);
  transform: rotate(12deg);
}
.cliente-hero__spark {
  position: absolute;
  right: 66px;
  top: 56px;
  color: rgba(255, 255, 255, 0.6);
  animation: spark-pulse 3s ease-in-out infinite;
}
.cliente-hero__cta {
  position: relative;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  padding: 12px 18px;
  border-radius: 14px;
  background: #ffffff;
  color: #2c154b;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 12px 28px -12px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.cliente-hero__cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 32px -12px rgba(0, 0, 0, 0.45);
}
.cliente-hero__cta:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.6);
  outline-offset: 2px;
}
.cliente-hero__skeleton {
  height: 90px;
  border-radius: 14px;
  background: linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.22), rgba(255,255,255,0.12));
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes float-a {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(12px, 14px);
  }
}
@keyframes float-b {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-16px, -10px);
  }
}
@keyframes spark-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: scale(0.9);
  }
  50% {
    opacity: 0.9;
    transform: scale(1.1);
  }
}
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
@media (max-width: 640px) {
  .cliente-hero {
    flex-direction: column;
    align-items: flex-start;
  }
  .cliente-hero__glass,
  .cliente-hero__spark {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .cliente-hero__blob,
  .cliente-hero__spark {
    animation: none;
  }
}
</style>