<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { horarioService } from '@/services/horarioService'
import type { HorarioFuncionamento, HorarioProfissional } from '@/types/negocio/horario.types'

const DIA_LABELS: Record<string, string> = {
  Domingo: 'Domingo',
  Segunda: 'Segunda-feira',
  Terca: 'Terça-feira',
  Quarta: 'Quarta-feira',
  Quinta: 'Quinta-feira',
  Sexta: 'Sexta-feira',
  Sabado: 'Sábado',
}

function diaLabel(dia: string): string {
  return DIA_LABELS[dia] ?? dia
}

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const aba = ref<'loja' | 'profissional'>('loja')
const horariosLoja = ref<HorarioFuncionamento[]>([])
const horariosProfissionais = ref<HorarioProfissional[]>([])
const loading = ref(false)

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    const [loja, profissionais] = await Promise.all([
      horarioService.listarLoja(estabelecimentoId.value),
      horarioService.listarProfissionais(estabelecimentoId.value),
    ])
    horariosLoja.value = loja
    horariosProfissionais.value = profissionais
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível carregar os horários.'))
  } finally {
    loading.value = false
  }
}

watch(
  ready,
  (isReady) => {
    if (isReady) void load()
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div>
      <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
        Horários
      </h1>
      <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
        Horários de funcionamento da loja e dos profissionais.
      </p>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <div class="flex gap-2 border-b border-glow-border-soft">
      <button
        type="button"
        class="border-b-2 px-4 py-2 font-urbanist text-sm font-medium transition-colors"
        :class="
          aba === 'loja'
            ? 'border-glow-gold text-glow-text'
            : 'border-transparent text-glow-text-subtle hover:text-glow-text'
        "
        @click="aba = 'loja'"
      >
        Loja
      </button>
      <button
        type="button"
        class="border-b-2 px-4 py-2 font-urbanist text-sm font-medium transition-colors"
        :class="
          aba === 'profissional'
            ? 'border-glow-gold text-glow-text'
            : 'border-transparent text-glow-text-subtle hover:text-glow-text'
        "
        @click="aba = 'profissional'"
      >
        Profissional
      </button>
    </div>

    <LoadingSpinner v-if="contextLoading || loading" />

    <template v-else-if="aba === 'loja'">
      <BaseCard v-if="horariosLoja.length === 0">
        <EmptyState
          title="Nenhum horário da loja"
          description="Configure os horários de funcionamento do estabelecimento."
        />
      </BaseCard>
      <div v-else class="space-y-2">
        <div
          v-for="h in horariosLoja"
          :key="h.id"
          class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-glow-border-soft bg-glow-surface px-4 py-3"
        >
          <span class="font-urbanist text-sm font-medium text-glow-text">
            {{ diaLabel(h.diaSemana) }}
          </span>
          <span class="font-urbanist text-sm text-glow-text-subtle">
            {{ h.horaInicio.slice(0, 5) }} – {{ h.horaFim.slice(0, 5) }}
          </span>
          <span
            class="inline-flex rounded-full px-2 py-0.5 font-urbanist text-xs"
            :class="h.ativo ? 'bg-green-100 text-green-800' : 'bg-glow-canvas text-glow-text-subtle'"
          >
            {{ h.ativo ? 'Ativo' : 'Inativo' }}
          </span>
        </div>
      </div>
    </template>

    <template v-else>
      <BaseCard v-if="horariosProfissionais.length === 0">
        <EmptyState
          title="Nenhum horário de profissional"
          description="Os horários dos profissionais aparecerão aqui quando configurados."
        />
      </BaseCard>
      <div v-else class="space-y-2">
        <div
          v-for="h in horariosProfissionais"
          :key="h.id"
          class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-glow-border-soft bg-glow-surface px-4 py-3"
        >
          <span class="font-urbanist text-sm font-medium text-glow-text">
            Profissional #{{ h.profissionalId }} · {{ diaLabel(h.diaSemana) }}
          </span>
          <span class="font-urbanist text-sm text-glow-text-subtle">
            {{ h.horaInicio.slice(0, 5) }} – {{ h.horaFim.slice(0, 5) }}
          </span>
          <span
            class="inline-flex rounded-full px-2 py-0.5 font-urbanist text-xs"
            :class="h.ativo ? 'bg-green-100 text-green-800' : 'bg-glow-canvas text-glow-text-subtle'"
          >
            {{ h.ativo ? 'Ativo' : 'Inativo' }}
          </span>
        </div>
      </div>
    </template>
  </div>
</template>
