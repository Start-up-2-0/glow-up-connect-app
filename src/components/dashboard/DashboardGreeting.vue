<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'

defineProps<{
  title: string
  subtitle?: string
  eyebrow?: string
  loading?: boolean
}>()
</script>

<template>
  <section class="biz-hero">
    <div class="relative z-10 min-w-0">
      <p v-if="eyebrow && !loading" class="font-urbanist text-[12px] font-semibold uppercase tracking-[0.14em] text-glow-gold-cta">
        {{ eyebrow }}
      </p>
      <h1 v-if="loading" class="biz-hero__skeleton" />
      <h1 v-else class="mt-1 font-urbanist text-3xl font-bold leading-tight text-glow-text sm:text-[34px]">
        {{ title }}
      </h1>
      <p v-if="subtitle && !loading" class="mt-2 max-w-[560px] font-urbanist text-[15px] leading-relaxed text-glow-text-subtle">
        {{ subtitle }}
      </p>
    </div>

    <div class="biz-hero__decor" aria-hidden="true">
      <span class="biz-hero__blob" />
      <Sparkles class="biz-hero__spark" :size="20" :stroke-width="1.5" />
    </div>

    <div v-if="$slots.actions" class="relative z-10 flex flex-wrap items-center gap-2.5">
      <slot name="actions" />
    </div>
  </section>
</template>

<style scoped>
.biz-hero {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  overflow: hidden;
  padding: 26px 28px;
  border-radius: 22px;
  border: 1px solid var(--glow-border-soft);
  background: linear-gradient(120deg, #f6f2fb 0%, #efebf7 55%, #e7e1f2 100%);
  box-shadow: 0 12px 34px -22px rgba(82, 46, 95, 0.4);
}
.biz-hero__decor {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.biz-hero__blob {
  position: absolute;
  right: -40px;
  top: -70px;
  width: 220px;
  height: 220px;
  border-radius: 9999px;
  background: radial-gradient(circle at 30% 30%, var(--glow-gold-selected, #efe9f8), transparent 70%);
  filter: blur(16px);
  opacity: 0.8;
}
.biz-hero__spark {
  position: absolute;
  right: 48px;
  top: 24px;
  color: var(--glow-gold-cta);
  opacity: 0.5;
  animation: spark-pulse 3s ease-in-out infinite;
}
.biz-hero__skeleton {
  width: 50%;
  height: 34px;
  border-radius: 8px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--glow-text) 6%, transparent), color-mix(in srgb, var(--glow-text) 14%, transparent), color-mix(in srgb, var(--glow-text) 6%, transparent));
  background-size: 200% 100%;
  animation: shimmer 1.4s ease-in-out infinite;
}
@keyframes spark-pulse {
  0%, 100% {
    opacity: 0.25;
    transform: scale(0.9);
  }
  50% {
    opacity: 0.8;
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
@media (max-width: 700px) {
  .biz-hero {
    flex-direction: column;
    align-items: flex-start;
  }
  .biz-hero__spark {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .biz-hero__spark {
    animation: none;
  }
}
</style>