<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import HorarioDiaLojaCard from '@/components/horarios/HorarioDiaLojaCard.vue'
import { useHorarios } from '@/composables/useHorarios'
import type { DiaSemanaValue } from '@/constants/diasSemana'
import { ONBOARDING_CONTRATAR_CARD_CLASS } from '@/constants/designTokens'
import type { HorarioFuncionamento } from '@/types/negocio/horario.types'

const props = withDefaults(
  defineProps<{
    estabelecimentoId: number
    modoAutonomo?: boolean
    continueLabel?: string
  }>(),
  { modoAutonomo: false, continueLabel: 'Continuar' },
)

const emit = defineEmits<{
  continue: []
  skip: []
}>()

const estabelecimentoIdRef = computed(() => props.estabelecimentoId as number | null)
const ready = computed(() => props.estabelecimentoId > 0)

const {
  DIAS_SEMANA,
  loading,
  savingDia,
  savingDiaProprio,
  horariosPorDiaLoja,
  horariosPorDiaProprio,
  podeGerenciarLoja,
  modoDiaLoja,
  draftDiaLoja,
  setDraftDiaLoja,
  iniciarEdicaoDiaLoja,
  cancelarEdicaoDiaLoja,
  salvarDiaLoja,
  alterarStatusDiaLoja,
  modoDiaProprio,
  draftDiaProprio,
  setDraftDiaProprio,
  iniciarEdicaoDiaProprio,
  cancelarEdicaoDiaProprio,
  salvarDiaProprio,
  alterarStatusDiaProprio,
  profissionalProprioId,
} = useHorarios(estabelecimentoIdRef, ready)

const usaAtendimentoAutonomo = computed(
  () => props.modoAutonomo && profissionalProprioId.value != null,
)

function onDraftUpdate(dia: DiaSemanaValue, draft: { horaInicio: string; horaFim: string }) {
  if (usaAtendimentoAutonomo.value) {
    setDraftDiaProprio(dia, draft)
    return
  }
  setDraftDiaLoja(dia, draft)
}

function horarioAutonomoComoLoja(dia: DiaSemanaValue): HorarioFuncionamento | null {
  const horario = horariosPorDiaProprio.value.get(dia)
  if (!horario) return null
  return {
    id: horario.id,
    estabelecimentoId: props.estabelecimentoId,
    diaSemana: horario.diaSemana,
    horaInicio: horario.horaInicio,
    horaFim: horario.horaFim,
    ativo: horario.ativo,
  }
}
</script>

<template>
  <div class="space-y-4">
    <div :class="ONBOARDING_CONTRATAR_CARD_CLASS">
      <h2 class="font-urbanist text-lg font-semibold text-glow-text">
        {{ modoAutonomo ? 'Horários de atendimento' : 'Horários de funcionamento' }}
      </h2>
      <p class="mt-1 mb-4 text-sm text-glow-text-subtle">
        {{
          modoAutonomo
            ? 'Defina os dias e horários em que você atende. Você pode ajustar depois.'
            : 'Configure os dias e horários em que a loja atende. Você pode ajustar depois.'
        }}
      </p>

      <p v-if="loading" class="text-sm text-glow-text-subtle">Carregando horários…</p>

      <div v-else class="grid gap-3 sm:grid-cols-2">
        <HorarioDiaLojaCard
          v-for="dia in DIAS_SEMANA"
          :key="dia.value"
          :dia="dia.value"
          :label="dia.label"
          :horario="usaAtendimentoAutonomo ? horarioAutonomoComoLoja(dia.value) : (horariosPorDiaLoja.get(dia.value) ?? null)"
          :modo="usaAtendimentoAutonomo ? modoDiaProprio(dia.value) : modoDiaLoja(dia.value)"
          :draft="usaAtendimentoAutonomo ? draftDiaProprio(dia.value) : draftDiaLoja(dia.value)"
          :saving="usaAtendimentoAutonomo ? savingDiaProprio === dia.value : savingDia === dia.value"
          :exibe-profissionais="false"
          @update:draft="onDraftUpdate(dia.value, $event)"
          @salvar="
            usaAtendimentoAutonomo
              ? ($event ? salvarDiaProprio(dia.value) : alterarStatusDiaProprio(dia.value, false))
              : salvarDiaLoja(dia.value, { ativo: $event })
          "
          @editar="usaAtendimentoAutonomo ? iniciarEdicaoDiaProprio(dia.value) : iniciarEdicaoDiaLoja(dia.value)"
          @cancelar="usaAtendimentoAutonomo ? cancelarEdicaoDiaProprio(dia.value) : cancelarEdicaoDiaLoja(dia.value)"
        />
      </div>

      <p
        v-if="!usaAtendimentoAutonomo && !podeGerenciarLoja && !loading"
        class="mt-3 text-sm text-glow-text-subtle"
      >
        Sem permissão para editar horários da loja neste contexto.
      </p>
    </div>

    <div class="flex flex-wrap justify-end gap-2">
      <BaseButton variant="primary" @click="emit('continue')">{{ continueLabel }}</BaseButton>
    </div>
  </div>
</template>

