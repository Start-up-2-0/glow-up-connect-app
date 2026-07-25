<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { Meta, MetaProgressoProfissional } from '@/types/negocio/caixa.types'
import { formatCurrency } from '@/utils/formatters'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
  loading?: boolean
  profissional?: MetaProgressoProfissional | null
  meta?: Meta | null
}>()

const emit = defineEmits<{
  edit: []
  cancel: []
  reactivate: []
}>()

const tipoLabel = computed(() => {
  if (!props.profissional) return ''
  const labels: Record<string, string> = {
    Atendimentos: 'Quantidade de atendimentos',
    Faturamento: 'Valor faturado',
    Mista: 'Mista (atendimentos + faturamento)',
  }
  return labels[props.profissional.tipoMeta] ?? props.profissional.tipoMeta
})

const realizadoLabel = computed(() => {
  if (!props.profissional) return ''
  if (props.profissional.tipoMeta === 'Atendimentos') {
    return String(props.profissional.quantidadeRealizada ?? 0)
  }
  return formatCurrency(props.profissional.valorRealizado ?? 0)
})

const alvoLabel = computed(() => {
  if (!props.profissional) return ''
  if (props.profissional.tipoMeta === 'Atendimentos') {
    return String(props.profissional.valorMeta)
  }
  return formatCurrency(props.profissional.valorMeta)
})

const restanteLabel = computed(() => {
  if (!props.profissional) return ''
  if (props.profissional.atingida) return 'Meta concluída! 🎉'
  if (props.profissional.tipoMeta === 'Atendimentos') {
    const resto = Math.max(0, props.profissional.valorMeta - (props.profissional.quantidadeRealizada ?? 0))
    return `${resto} atendimento${resto !== 1 ? 's' : ''}`
  }
  const resto = Math.max(0, props.profissional.valorMeta - (props.profissional.valorRealizado ?? 0))
  return formatCurrency(resto)
})

const percentualLabel = computed(() => {
  if (!props.profissional) return 0
  return props.profissional.percentualProgresso
})

const progressColor = computed(() => {
  const p = percentualLabel.value
  if (p >= 100) return 'bg-green-500'
  if (p >= 80) return 'bg-yellow-500'
  return 'bg-glow-gold'
})

function close() {
  open.value = false
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
        v-if="open && profissional"
        class="financeiro-modal-overlay"
        role="dialog"
        aria-modal="true"
        @click.self="close"
      >
        <div class="financeiro-modal max-w-lg">
          <div class="financeiro-modal__header">
            <h2 class="financeiro-modal__title">{{ profissional.nomePublico }}</h2>
          </div>

          <div class="financeiro-modal__body space-y-5">
            <!-- Meta info -->
            <div class="rounded-xl border border-glow-border-soft bg-glow-canvas p-4">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <p class="font-urbanist text-xs text-glow-text-subtle">Meta</p>
                  <p class="font-urbanist text-base font-semibold text-glow-text">{{ profissional.metaNome }}</p>
                </div>
                <span
                  class="inline-flex shrink-0 rounded-full px-2.5 py-1 font-urbanist text-xs font-medium"
                  :class="profissional.atingida ? 'bg-green-100 text-green-800' : 'bg-glow-canvas text-glow-text-subtle'"
                >
                  {{ profissional.atingida ? '✅ Concluída' : '⏳ Em andamento' }}
                </span>
              </div>
            </div>

            <!-- Tipo -->
            <div class="flex items-center justify-between rounded-xl border border-glow-border-soft bg-glow-canvas p-3">
              <span class="font-urbanist text-sm text-glow-text-subtle">Tipo</span>
              <span class="font-urbanist text-sm font-medium text-glow-text">{{ tipoLabel }}</span>
            </div>

            <!-- Barra de progresso grande -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="font-urbanist text-sm font-medium text-glow-text">Progresso</span>
                <span
                  class="font-satoshi text-lg font-bold"
                  :class="profissional.atingida ? 'text-green-700' : 'text-glow-text'"
                >
                  {{ percentualLabel }}%
                </span>
              </div>
              <div class="h-4 overflow-hidden rounded-full bg-glow-canvas">
                <div
                  class="h-full rounded-full transition-all duration-700"
                  :class="progressColor"
                  :style="{ width: Math.min(percentualLabel, 100) + '%' }"
                />
              </div>
              <div class="flex items-center justify-between text-sm">
                <span class="font-medium text-glow-text">{{ realizadoLabel }}</span>
                <span class="text-glow-text-subtle">de {{ alvoLabel }}</span>
              </div>
            </div>

            <!-- Quanto falta -->
            <div class="flex items-center justify-between rounded-xl border border-glow-border-soft bg-glow-canvas p-3">
              <span class="font-urbanist text-sm text-glow-text-subtle">
                {{ profissional.atingida ? 'Status' : 'Quanto falta' }}
              </span>
              <span
                class="font-urbanist text-sm font-semibold"
                :class="profissional.atingida ? 'text-green-700' : 'text-glow-text'"
              >
                {{ restanteLabel }}
              </span>
            </div>

            <!-- Comissão -->
            <div class="flex items-center justify-between rounded-xl border border-glow-border-soft bg-glow-canvas p-3">
              <span class="font-urbanist text-sm text-glow-text-subtle">Comissão ao concluir</span>
              <span class="font-urbanist text-sm font-semibold text-glow-gold-dark">
                {{ profissional.percentualComissao }}%
              </span>
            </div>

            <!-- Data de criação -->
            <div v-if="meta?.createAd" class="flex items-center justify-between rounded-xl border border-glow-border-soft bg-glow-canvas p-3">
              <span class="font-urbanist text-sm text-glow-text-subtle">Criada em</span>
              <span class="font-urbanist text-sm font-medium text-glow-text">
                {{ new Date(meta.createAd).toLocaleDateString('pt-BR') }}
              </span>
            </div>
          </div>

          <!-- Ações -->
          <div class="financeiro-modal__footer flex gap-2">
            <BaseButton variant="secondary" size="sm" :disabled="loading" @click="close">
              Fechar
            </BaseButton>
            <template v-if="meta?.ativa">
              <BaseButton variant="secondary" size="sm" :disabled="loading" @click="emit('edit')">
                Editar meta
              </BaseButton>
              <BaseButton
                variant="danger"
                size="sm"
                :disabled="loading"
                @click="emit('cancel')"
              >
                Cancelar meta
              </BaseButton>
            </template>
            <BaseButton
              v-else
              size="sm"
              :disabled="loading"
              @click="emit('reactivate')"
            >
              Reativar meta
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
