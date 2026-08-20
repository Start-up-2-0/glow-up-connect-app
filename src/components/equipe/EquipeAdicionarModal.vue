<script setup lang="ts">
import { ref, watch } from 'vue'
import EquipeAdicionarForm from '@/components/equipe/EquipeAdicionarForm.vue'
import EquipeIcons from '@/components/equipe/EquipeIcons.vue'
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

const copy = () => equipeAdicionarAcao(props.modo)

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
    <Transition name="equipe-modal">
      <div
        v-if="open"
        class="equipe-modal-overlay"
        @click.self="close"
      >
        <Transition
          enter-active-class="equipe-modal-enter-active"
          leave-active-class="equipe-modal-leave-active"
          enter-from-class="equipe-modal-enter-from"
          leave-to-class="equipe-modal-leave-to"
        >
          <div
            v-if="open"
            class="equipe-modal"
            :class="{ 'equipe-modal--tall': modo === 'criar' }"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="`equipe-modal-${modo}`"
          >
            <div class="equipe-modal__header">
              <div class="equipe-modal__header-top">
                <h2 :id="`equipe-modal-${modo}`" class="equipe-modal__title">
                  {{ copy().tituloModal }}
                </h2>
                <button
                  type="button"
                  class="equipe-modal__close-icon"
                  aria-label="Fechar"
                  @click="close"
                >
                  <EquipeIcons name="close" />
                </button>
              </div>
              <p class="equipe-modal__subtitle">{{ copy().descricao }}</p>
            </div>

            <EquipeAdicionarForm
              ref="formRef"
              :modo="modo"
              :initial-role="initialRole"
              :navigate-on-vinculo="false"
              embedded
              @cancel="close"
              @vinculado="handleVinculado"
            />
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
