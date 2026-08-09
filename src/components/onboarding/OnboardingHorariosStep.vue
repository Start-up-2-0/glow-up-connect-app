<script setup lang="ts">
import { computed } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import HorarioDiaLojaCard from '@/components/horarios/HorarioDiaLojaCard.vue'
import { useHorarios } from '@/composables/useHorarios'
import type { DiaSemanaValue } from '@/constants/diasSemana'
import { ONBOARDING_CONTRATAR_CARD_CLASS } from '@/constants/designTokens'

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
  horariosPorDiaLoja,
  podeGerenciarLoja,
  modoDiaLoja,
  draftDiaLoja,
  setDraftDiaLoja,
  iniciarEdicaoDiaLoja,
  cancelarEdicaoDiaLoja,
  salvarDiaLoja,
  alterarStatusDiaLoja,
} = useHorarios(estabelecimentoIdRef, ready)

function onDraftUpdate(dia: DiaSemanaValue, draft: { horaInicio: string; horaFim: string }) {
  setDraftDiaLoja(dia, draft)
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
          :horario="horariosPorDiaLoja.get(dia.value) ?? null"
          :modo="modoDiaLoja(dia.value)"
          :draft="draftDiaLoja(dia.value)"
          :saving="savingDia === dia.value"
          :exibe-profissionais="false"
          @update:draft="onDraftUpdate(dia.value, $event)"
          @salvar="salvarDiaLoja(dia.value)"
          @ativar="alterarStatusDiaLoja(dia.value, true)"
          @desativar="alterarStatusDiaLoja(dia.value, false)"
          @editar="iniciarEdicaoDiaLoja(dia.value)"
          @cancelar="cancelarEdicaoDiaLoja(dia.value)"
        />
      </div>

      <p v-if="!podeGerenciarLoja && !loading" class="mt-3 text-sm text-glow-text-subtle">
        Sem permissão para editar horários da loja neste contexto.
      </p>
    </div>

    <div class="flex flex-wrap justify-between gap-2">
      <BaseButton variant="ghost" @click="emit('skip')">Configurar depois</BaseButton>
      <BaseButton variant="primary" @click="emit('continue')">{{ continueLabel }}</BaseButton>
    </div>
  </div>
</template>
