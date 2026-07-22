<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'

defineProps<{
  open: boolean
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div class="absolute inset-0 bg-black/50" @click="emit('cancel')" />
      <div class="relative z-10 w-full max-w-md rounded-lg border border-glow-border-soft bg-glow-surface p-6 shadow-xl">
        <h2 class="mb-2 font-urbanist text-lg font-semibold text-glow-text">
          Cancelar assinatura?
        </h2>
        <p class="mb-6 text-sm text-glow-text-subtle">
          Você continuará com acesso completo ao plano até o fim do período já contratado.
          Após essa data, a assinatura será encerrada automaticamente.
        </p>
        <div class="flex justify-end gap-2">
          <BaseButton variant="ghost" :disabled="loading" @click="emit('cancel')">
            Voltar
          </BaseButton>
          <BaseButton variant="danger" :loading="loading" @click="emit('confirm')">
            Confirmar cancelamento
          </BaseButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>
