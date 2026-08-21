<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'

const open = defineModel<boolean>({ default: false })

defineProps<{
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  variant?: 'danger' | 'default'
}>()

const emit = defineEmits<{ confirm: [] }>()

function close() {
  open.value = false
}

function onConfirm() {
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="equipe-modal">
      <div
        v-if="open"
        class="financeiro-modal-overlay"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="'financeiro-confirm-title'"
        @click.self="close"
      >
        <div class="financeiro-modal">
          <div class="financeiro-modal__header">
            <h2 id="financeiro-confirm-title" class="financeiro-modal__title">{{ title }}</h2>
          </div>
          <div class="financeiro-modal__body">
            <p class="font-urbanist text-sm text-glow-text-subtle">{{ message }}</p>
            <slot />
          </div>
          <div class="financeiro-modal__footer">
            <BaseButton variant="secondary" size="sm" :disabled="loading" @click="close">
              {{ cancelLabel ?? 'Cancelar' }}
            </BaseButton>
            <BaseButton
              :variant="variant === 'danger' ? 'danger' : 'primary'"
              size="sm"
              :loading="loading"
              @click="onConfirm"
            >
              {{ confirmLabel ?? 'Confirmar' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
