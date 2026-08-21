<script setup lang="ts">
defineProps<{
  titulo?: string
  subtitulo?: string
}>()
</script>

<template>
  <header class="flex flex-wrap items-start justify-between gap-4">
    <div class="min-w-0">
      <h1 class="font-urbanist text-2xl font-bold tracking-tight text-glow-text sm:text-[28px]">
        {{ titulo ?? 'Comissões' }}
      </h1>
      <p class="mt-1.5 max-w-2xl font-urbanist text-sm leading-relaxed text-glow-text-subtle">
        {{
          subtitulo ??
          'Acompanhe o desempenho dos profissionais, gerencie metas e regras de comissão.'
        }}
      </p>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
