<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <div class="agendamento-detail-field">
    <div class="agendamento-detail-field__icon" aria-hidden="true">
      <slot name="icon" />
    </div>
    <div class="min-w-0">
      <p class="agendamento-detail-field__label">{{ label }}</p>
      <p class="agendamento-detail-field__value">
        <slot />
      </p>
    </div>
  </div>
</template>
