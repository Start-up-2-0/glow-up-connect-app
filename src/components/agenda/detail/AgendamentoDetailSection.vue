<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>

<template>
  <section>
    <h2 class="agendamento-detail-section-title">{{ title }}</h2>
    <div class="agendamento-detail-panel">
      <div class="agendamento-detail-panel__body">
        <slot />
      </div>
    </div>
  </section>
</template>
