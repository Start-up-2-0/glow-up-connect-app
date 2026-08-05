<script setup lang="ts">
import { ArrowRight, Sparkles } from 'lucide-vue-next'

const emit = defineEmits<{ explorar: [] }>()
</script>

<template>
  <section class="promo-banner">
    <div class="relative z-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <span class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white">
          <Sparkles :size="20" :stroke-width="1.75" />
        </span>
        <div>
          <p class="font-urbanist text-[16px] font-bold text-white">Seu próximo visual começa aqui</p>
          <p class="font-urbanist text-[13px] text-white/80">Explore salões e barbearias perto de você e agende em poucos toques.</p>
        </div>
      </div>
      <button type="button" class="promo-banner__cta" @click="emit('explorar')">
        Explorar lojas
        <ArrowRight :size="16" :stroke-width="2" />
      </button>
    </div>
  </section>
</template>

<style scoped>
.promo-banner {
  position: relative;
  overflow: hidden;
  padding: 20px 24px;
  border-radius: 22px;
  background: linear-gradient(120deg, #755e8a 0%, #522e5f 45%, #2c154b 100%);
  box-shadow: 0 14px 34px -18px rgba(44, 21, 75, 0.5);
}
.promo-banner::after {
  content: '';
  position: absolute;
  right: -60px;
  top: -70px;
  width: 220px;
  height: 220px;
  border-radius: 9999px;
  background: radial-gradient(circle, #cfb0da 0%, transparent 70%);
  opacity: 0.25;
  filter: blur(18px);
  pointer-events: none;
}
.promo-banner__cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  padding: 11px 16px;
  border-radius: 13px;
  background: #ffffff;
  color: #2c154b;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-weight: 600;
  font-size: 14px;
  box-shadow: 0 10px 24px -10px rgba(0, 0, 0, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.promo-banner__cta:hover {
  transform: translateY(-2px);
}
.promo-banner__cta:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.5);
  outline-offset: 2px;
}
</style>