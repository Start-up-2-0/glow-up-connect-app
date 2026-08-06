<script setup lang="ts">
import { watch } from 'vue'
import { X } from 'lucide-vue-next'
import type { ServicoPublico } from '@/types/agendamento.types'
import { formatPrecoFigma } from '@/utils/formatters'

const open = defineModel<boolean>({ default: false })

defineProps<{
  servicos: ServicoPublico[]
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
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  }
})

function precoLabel(servico: ServicoPublico) {
  if (servico.precoMinimo === servico.precoMaximo) {
    return formatPrecoFigma(servico.precoMinimo)
  }
  return `${formatPrecoFigma(servico.precoMinimo)} – ${formatPrecoFigma(servico.precoMaximo)}`
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="loja-lista-modal-overlay"
      @click.self="close"
    >
      <div
        class="loja-lista-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="loja-servicos-modal-titulo"
      >
        <header class="loja-lista-modal__header">
          <div>
            <h2 id="loja-servicos-modal-titulo" class="loja-lista-modal__title">
              Serviços disponíveis
            </h2>
            <p v-if="lojaNome" class="loja-lista-modal__subtitle">{{ lojaNome }}</p>
          </div>
          <button type="button" class="loja-lista-modal__close" aria-label="Fechar" @click="close">
            <X class="size-4" aria-hidden="true" />
          </button>
        </header>

        <div class="loja-lista-modal__body">
          <p v-if="servicos.length === 0" class="loja-lista-modal__empty">
            Nenhum serviço disponível no momento.
          </p>
          <div v-else class="loja-lista-modal__table-wrap">
            <table class="loja-lista-modal__table">
              <thead>
                <tr>
                  <th>Serviço</th>
                  <th>Duração</th>
                  <th class="loja-lista-modal__th-right">Preço</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="servico in servicos" :key="servico.id">
                  <td>
                    <span class="loja-lista-modal__name">{{ servico.nome }}</span>
                    <p v-if="servico.descricao" class="loja-lista-modal__hint">
                      {{ servico.descricao }}
                    </p>
                  </td>
                  <td>{{ servico.duracaoMinutosEstimada }} min</td>
                  <td class="loja-lista-modal__td-right loja-lista-modal__price">
                    {{ precoLabel(servico) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
