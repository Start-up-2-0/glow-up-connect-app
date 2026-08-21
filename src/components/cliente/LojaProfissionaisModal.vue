<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import { X } from 'lucide-vue-next'
import type { ProfissionalPublico } from '@/types/agendamento.types'
import { lockBodyScroll, unlockBodyScroll } from '@/utils/bodyScrollLock'

const open = defineModel<boolean>({ default: false })

defineProps<{
  profissionais: ProfissionalPublico[]
  lojaNome?: string
}>()

function close() {
  open.value = false
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}

watch(open, (isOpen) => {
  if (typeof document === 'undefined') return
  if (isOpen) {
    document.addEventListener('keydown', onKeydown)
    lockBodyScroll()
  } else {
    document.removeEventListener('keydown', onKeydown)
    unlockBodyScroll()
  }
})

onUnmounted(() => {
  if (open.value) unlockBodyScroll()
  document.removeEventListener('keydown', onKeydown)
})

function iniciais(nome: string) {
  const parts = nome.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
}
</script>

<template>
  <Teleport to="body">
    <Transition name="equipe-modal">
      <div
        v-if="open"
        class="loja-lista-modal-overlay"
        @click.self="close"
      >
      <div
        class="loja-lista-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="loja-profissionais-modal-titulo"
      >
        <header class="loja-lista-modal__header">
          <div>
            <h2 id="loja-profissionais-modal-titulo" class="loja-lista-modal__title">
              Profissionais
            </h2>
            <p v-if="lojaNome" class="loja-lista-modal__subtitle">{{ lojaNome }}</p>
          </div>
          <button type="button" class="loja-lista-modal__close" aria-label="Fechar" @click="close">
            <X class="size-4" aria-hidden="true" />
          </button>
        </header>

        <div class="loja-lista-modal__body">
          <p v-if="profissionais.length === 0" class="loja-lista-modal__empty">
            Nenhum profissional disponível.
          </p>
          <div v-else class="loja-lista-modal__table-wrap">
            <table class="loja-lista-modal__table">
              <thead>
                <tr>
                  <th>Profissional</th>
                  <th class="loja-lista-modal__th-right">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="prof in profissionais" :key="prof.publicGuid">
                  <td>
                    <div class="loja-lista-modal__person">
                      <div class="loja-lista-modal__avatar">
                        <img
                          v-if="prof.foto"
                          :src="prof.foto"
                          :alt="prof.nomePublico"
                          class="size-full object-cover"
                        />
                        <span v-else>{{ iniciais(prof.nomePublico) }}</span>
                      </div>
                      <span class="loja-lista-modal__name">{{ prof.nomePublico }}</span>
                    </div>
                  </td>
                  <td class="loja-lista-modal__td-right">
                    <span class="loja-lista-modal__pill">Disponível</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </Transition>
  </Teleport>
</template>
