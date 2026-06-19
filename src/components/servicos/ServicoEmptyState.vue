<script setup lang="ts">
import ServicoIcons from '@/components/servicos/ServicoIcons.vue'

defineProps<{
  title: string
  description: string
  showAction?: boolean
  actionLabel?: string
  actionDisabled?: boolean
  actionTitle?: string
}>()

const emit = defineEmits<{ action: [] }>()
</script>

<template>
  <div class="servicos-empty">
    <div class="servicos-empty__content">
      <div class="servicos-empty__icon">
        <ServicoIcons name="empty" />
      </div>
      <div class="servicos-empty__text">
        <h2 class="servicos-empty__title">{{ title }}</h2>
        <p class="servicos-empty__description">{{ description }}</p>
      </div>
    </div>
    <div v-if="showAction" class="servicos-empty__action">
      <button
        type="button"
        class="servicos-btn-primary servicos-btn-primary--lg w-full"
        :disabled="actionDisabled"
        :title="actionTitle"
        @click="emit('action')"
      >
        <ServicoIcons name="plus" />
        {{ actionLabel ?? 'Novo serviço' }}
      </button>
    </div>
  </div>
</template>
