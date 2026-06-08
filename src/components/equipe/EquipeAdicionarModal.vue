<script setup lang="ts">
import { ref, watch } from 'vue'
import EquipeAdicionarForm from '@/components/equipe/EquipeAdicionarForm.vue'
import { equipeAdicionarAcao } from '@/constants/equipeAdicionarAcoes'
import type { ModoCadastro } from '@/composables/useEquipeAdicionarForm'
import type { EstablishmentUserRole } from '@/types/negocio/equipe.types'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
  modo: ModoCadastro
  initialRole?: EstablishmentUserRole
}>()

const emit = defineEmits<{
  vinculado: []
}>()

const formRef = ref<InstanceType<typeof EquipeAdicionarForm> | null>(null)

function close() {
  open.value = false
}

function handleVinculado() {
  emit('vinculado')
  close()
}

watch(open, (isOpen) => {
  if (!isOpen) {
    formRef.value?.resetForm()
  }
})
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
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
        @click.self="close"
      >
        <div
          class="max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-xl border border-glow-border-soft bg-glow-surface p-5 shadow-xl"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="`equipe-modal-${modo}`"
        >
          <div class="mb-4 space-y-1">
            <h2
              :id="`equipe-modal-${modo}`"
              class="font-satoshi text-lg font-bold text-glow-text"
            >
              {{ equipeAdicionarAcao(modo).tituloModal }}
            </h2>
            <p class="font-urbanist text-sm leading-relaxed text-glow-text-subtle">
              {{ equipeAdicionarAcao(modo).descricao }}
            </p>
          </div>
          <EquipeAdicionarForm
            ref="formRef"
            :modo="modo"
            :initial-role="initialRole"
            :navigate-on-vinculo="false"
            @cancel="close"
            @vinculado="handleVinculado"
          />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
