<script setup lang="ts">
defineProps<{
  titulo: string
  subtitulo: string
  chip?: string | null
  loading?: boolean
}>()
</script>

<template>
  <header class="cliente-dash-header">
    <div v-if="loading" class="space-y-2">
      <span class="cliente-dash-header__skel h-7 w-56" />
      <span class="cliente-dash-header__skel h-4 w-80 max-w-full" />
    </div>
    <template v-else>
      <div class="flex flex-wrap items-center gap-2.5">
        <h1 class="font-urbanist text-2xl font-bold tracking-tight text-glow-text sm:text-[28px]">
          {{ titulo }}
        </h1>
        <span
          v-if="chip"
          class="inline-flex items-center rounded-full bg-glow-gold-selected px-2.5 py-0.5 font-urbanist text-[11px] font-semibold text-glow-gold-cta"
        >
          {{ chip }}
        </span>
      </div>
      <p class="mt-1.5 max-w-2xl font-urbanist text-sm leading-relaxed text-glow-text-subtle">
        {{ subtitulo }}
      </p>
    </template>
  </header>
</template>

<style scoped>
.cliente-dash-header__skel {
  display: block;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    color-mix(in srgb, var(--glow-text) 6%, transparent),
    color-mix(in srgb, var(--glow-text) 12%, transparent),
    color-mix(in srgb, var(--glow-text) 6%, transparent)
  );
  background-size: 200% 100%;
  animation: skel 1.4s ease-in-out infinite;
}
@keyframes skel {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
