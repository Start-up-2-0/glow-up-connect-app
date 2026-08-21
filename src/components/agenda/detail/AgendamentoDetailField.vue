<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    inline?: boolean
  }>(),
  {
    inline: false,
  },
)
</script>

<template>
  <div class="agendamento-detail-field" :class="{ 'agendamento-detail-field--inline': inline }">
    <div class="agendamento-detail-field__icon" aria-hidden="true">
      <slot name="icon" />
    </div>
    <div class="agendamento-detail-field__content">
      <p class="agendamento-detail-field__label">{{ label }}</p>
      <div class="agendamento-detail-field__value">
        <slot />
      </div>
    </div>
  </div>
</template>
