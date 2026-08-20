<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const open = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  confirm: [motivo: string]
}>()

const motivo = ref('')
const loading = ref(false)

function close() {
  open.value = false
  motivo.value = ''
}

async function handleConfirm() {
  if (!motivo.value.trim()) return
  loading.value = true
  try {
    emit('confirm', motivo.value.trim())
    close()
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-md"
        @click.self="close"
      >
        <div
          class="w-full max-w-md rounded-xl border border-glow-border-soft bg-glow-surface p-5 shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancelar-title"
        >
          <h2 id="cancelar-title" class="font-satoshi text-lg font-bold text-glow-text">
            Cancelar agendamento
          </h2>
          <p class="mt-2 font-urbanist text-sm text-glow-text-subtle">
            Informe o motivo do cancelamento.
          </p>
          <textarea
            v-model="motivo"
            rows="3"
            class="mt-4 w-full rounded border border-glow-border-soft bg-glow-canvas px-3 py-2 font-urbanist text-sm"
            placeholder="Motivo"
          />
          <div class="mt-4 flex justify-end gap-2">
            <BaseButton variant="secondary" @click="close">Voltar</BaseButton>
            <BaseButton
              variant="danger"
              :disabled="!motivo.trim()"
              :loading="loading"
              @click="handleConfirm"
            >
              Confirmar cancelamento
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
