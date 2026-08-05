<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type {
  MetaComissaoDetalhe,
  MetaComissaoStatus,
} from '@/types/negocio/caixa.types'
import { formatCurrency } from '@/utils/formatters'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
  loading?: boolean
  meta: MetaComissaoDetalhe | null
  podeGerenciar?: boolean
}>()

const emit = defineEmits<{
  editar: [meta: MetaComissaoDetalhe]
  cancelar: [meta: MetaComissaoDetalhe]
  reativar: [meta: MetaComissaoDetalhe]
  concluir: [meta: MetaComissaoDetalhe]
}>()

const STATUS_LABEL: Record<MetaComissaoStatus, string> = {
  EmAndamento: 'Em andamento',
  Concluida: 'Concluída',
  Cancelada: 'Cancelada',
}

const STATUS_CLASS: Record<MetaComissaoStatus, string> = {
  EmAndamento: 'bg-glow-gold/15 text-glow-gold',
  Concluida: 'bg-green-100 text-green-800',
  Cancelada: 'bg-glow-canvas text-glow-text-subtle',
}

const realizado = computed(() => {
  const m = props.meta
  if (!m) return 0
  return m.tipoMeta === 'Atendimentos' ? (m.quantidadeRealizada ?? 0) : (m.valorRealizado ?? 0)
})

const restante = computed(() => {
  const m = props.meta
  if (!m) return 0
  const diff = m.valorMeta - realizado.value
  return Math.max(diff, 0)
})

const formatRealizado = computed(() => {
  const m = props.meta
  if (!m) return '0'
  return m.tipoMeta === 'Atendimentos' ? String(realizado.value) : formatCurrency(realizado.value)
})

const formatAlvo = computed(() => {
  const m = props.meta
  if (!m) return '0'
  return m.tipoMeta === 'Atendimentos' ? `${m.valorMeta} atend.` : formatCurrency(m.valorMeta)
})

const formatRestante = computed(() => {
  const m = props.meta
  if (!m) return '0'
  if (m.atingida) return 'Meta atingida'
  return m.tipoMeta === 'Atendimentos' ? `${restante.value} faltam` : formatCurrency(restante.value)
})

const progressoClamped = computed(() =>
  Math.min(props.meta?.percentualProgresso ?? 0, 100),
)

const notif = computed(() =>
  props.meta?.status === 'Concluida' ? (props.meta?.notificacoes ?? null) : null,
)

const AUTOMACAO_ROWS = computed(() => {
  const n = notif.value
  if (!n) return []
  return [
    { label: 'E-mail enviado ao profissional', ok: n.emailProfissionalEnviado },
    { label: 'WhatsApp enviado ao profissional', ok: n.whatsAppProfissionalEnviado },
    { label: 'Loja notificada', ok: n.lojaNotificada },
    { label: 'Log de auditoria registrado', ok: n.logAuditoriaRegistrado },
  ]
})

function formatData(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('pt-BR')
}

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
        v-if="open"
        class="financeiro-modal-overlay"
        role="dialog"
        aria-modal="true"
        @click.self="close"
      >
        <div class="financeiro-modal">
          <div class="financeiro-modal__header">
            <div class="min-w-0">
              <h2 class="financeiro-modal__title">{{ meta?.nomeMeta }}</h2>
              <p class="font-urbanist text-sm text-glow-text-subtle">{{ meta?.nomePublico }}</p>
            </div>
            <span
              v-if="meta"
              class="shrink-0 inline-flex rounded-full px-2.5 py-1 font-urbanist text-xs font-medium"
              :class="STATUS_CLASS[meta.status]"
            >
              {{ STATUS_LABEL[meta.status] }}
            </span>
          </div>

          <div v-if="meta" class="financeiro-modal__body space-y-5">
            <!-- Progresso -->
            <div>
              <div class="mb-1.5 flex items-center justify-between text-sm">
                <span class="font-urbanist font-medium text-glow-text">Progresso</span>
                <span class="font-urbanist text-glow-text-subtle">
                  {{ formatRealizado }} de {{ formatAlvo }}
                </span>
              </div>
              <div class="h-2.5 w-full overflow-hidden rounded-full bg-glow-canvas">
                <div
                  class="h-full rounded-full transition-all duration-300"
                  :class="meta.atingida ? 'bg-green-500' : meta.percentualProgresso >= 80 ? 'bg-yellow-500' : 'bg-glow-gold'"
                  :style="{ width: progressoClamped + '%' }"
                />
              </div>
              <div class="mt-1.5 flex items-center justify-between text-xs text-glow-text-subtle">
                <span>{{ meta.percentualProgresso }}% concluído</span>
                <span>{{ formatRestante }}</span>
              </div>
              <p
                v-if="meta.status === 'EmAndamento' && meta.percentualProgresso >= 100"
                class="mt-2 rounded-lg bg-green-100 px-3 py-2 font-urbanist text-xs font-medium text-green-800"
              >
                ✅ Meta atingida! Clique em "Concluir meta" para disparar as notificações (e-mail, WhatsApp, loja).
              </p>
            </div>

            <!-- Infos da meta -->
            <div class="grid grid-cols-2 gap-3">
              <div class="rounded-xl border border-glow-border-soft bg-glow-surface p-3">
                <p class="font-urbanist text-xs text-glow-text-subtle">Tipo da meta</p>
                <p class="font-urbanist text-sm font-semibold text-glow-text">
                  {{ meta.tipoMeta === 'Atendimentos' ? 'Qtd. atendimentos' : meta.tipoMeta === 'Faturamento' ? 'Valor faturado' : 'Mista' }}
                </p>
              </div>
              <div class="rounded-xl border border-glow-border-soft bg-glow-surface p-3">
                <p class="font-urbanist text-xs text-glow-text-subtle">Comissão ao concluir</p>
                <p class="font-urbanist text-sm font-semibold text-glow-text">{{ meta.percentualComissao }}%</p>
              </div>
              <div class="rounded-xl border border-glow-border-soft bg-glow-surface p-3">
                <p class="font-urbanist text-xs text-glow-text-subtle">Período</p>
                <p class="font-urbanist text-sm font-semibold text-glow-text">
                  {{ formatData(meta.dataInicio) }} → {{ formatData(meta.dataFim) }}
                </p>
              </div>
              <div class="rounded-xl border border-glow-border-soft bg-glow-surface p-3">
                <p class="font-urbanist text-xs text-glow-text-subtle">Criada por</p>
                <p class="font-urbanist text-sm font-semibold text-glow-text">
                  {{ meta.responsavelCriacao }} · {{ formatData(meta.criadoEm) }}
                </p>
              </div>
            </div>

            <!-- Automação de conclusão -->
            <div
              v-if="notif"
              class="rounded-xl border border-green-200 bg-green-50 p-3"
            >
              <h3 class="mb-1 font-urbanist text-sm font-semibold text-green-900">
                Automação de conclusão
              </h3>
              <p class="font-urbanist text-xs text-green-800">
                Meta atingida em {{ formatData(notif.concluidaEm) }}. Notificações enviadas:
              </p>
              <ul class="mt-2 space-y-1.5">
                <li
                  v-for="row in AUTOMACAO_ROWS"
                  :key="row.label"
                  class="flex items-center gap-2 font-urbanist text-sm text-green-900"
                >
                  <span
                    class="flex size-[18px] shrink-0 items-center justify-center rounded-full"
                    :class="row.ok ? 'bg-green-600 text-white' : 'bg-green-100 text-green-400'"
                  >✓</span>
                  {{ row.label }}
                </li>
              </ul>
            </div>

            <!-- Evolução -->
            <div>
              <h3 class="mb-2 font-urbanist text-sm font-semibold text-glow-text">
                Histórico de evolução
              </h3>
              <div v-if="meta.evolucao.length === 0" class="text-sm text-glow-text-subtle">
                Nenhuma evolução registrada ainda.
              </div>
              <ol v-else class="space-y-3">
                <li v-for="e in meta.evolucao" :key="e.id" class="relative flex gap-3 pl-1">
                  <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-glow-gold" aria-hidden="true" />
                  <div class="min-w-0">
                    <p class="font-urbanist text-sm text-glow-text">{{ e.descricao }}</p>
                    <p class="font-urbanist text-xs text-glow-text-subtle">
                      {{ formatData(e.data) }}
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>

          <div class="financeiro-modal__footer">
            <BaseButton variant="secondary" size="sm" :disabled="loading" @click="close">
              Fechar
            </BaseButton>
            <template v-if="podeGerenciar">
              <BaseButton
                v-if="meta && meta.status === 'EmAndamento'"
                size="sm"
                :loading="loading"
                @click="emit('concluir', meta)"
              >
                Concluir meta
              </BaseButton>
              <BaseButton
                v-if="meta && (meta.status === 'EmAndamento' || meta.status === 'Concluida')"
                variant="secondary"
                size="sm"
                :disabled="loading"
                @click="emit('editar', meta)"
              >
                Editar
              </BaseButton>
              <BaseButton
                v-if="meta && meta.status === 'Cancelada'"
                size="sm"
                :loading="loading"
                @click="emit('reativar', meta)"
              >
                Reativar
              </BaseButton>
              <BaseButton
                v-if="meta && meta.status === 'EmAndamento'"
                variant="danger"
                size="sm"
                :loading="loading"
                @click="emit('cancelar', meta)"
              >
                Cancelar meta
              </BaseButton>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
