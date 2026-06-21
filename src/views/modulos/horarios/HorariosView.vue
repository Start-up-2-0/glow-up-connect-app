<script setup lang="ts">
import { computed } from 'vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import HorarioDiaLojaCard from '@/components/horarios/HorarioDiaLojaCard.vue'
import HorarioDiaProfissionaisModal from '@/components/horarios/HorarioDiaProfissionaisModal.vue'
import HorariosPageHeader from '@/components/horarios/HorariosPageHeader.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useHorarios } from '@/composables/useHorarios'
import type { HorarioFuncionamento } from '@/types/negocio/horario.types'
import type { DiaSemanaValue } from '@/constants/diasSemana'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()

const {
  DIAS_SEMANA,
  loading,
  savingDia,
  savingDiaProprio,
  horariosPorDiaLoja,
  horariosPorDiaProprio,
  podeGerenciarLoja,
  apenasHorarioProprio,
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
  modalProfissionaisAberta,
  modalProfissionaisDiaLabel,
  modalLojaHorario,
  modalLojaAtiva,
  modalProfissionaisVinculados,
  modalProfissionaisDisponiveis,
  modalProfissionaisActionId,
  modalProfissionaisErro,
  podeGerenciarProfissionaisPorDia,
  profissionaisVinculadosPorDia,
  abrirModalProfissionaisDia,
  fecharModalProfissionaisDia,
  setModalProfissionalModo,
  updateModalProfissionalHorario,
  salvarModalProfissional,
  vincularModalProfissional,
  removerModalProfissional,
} = useHorarios(estabelecimentoId, ready)

const pageTitle = computed(() =>
  apenasHorarioProprio.value ? 'Meus horários' : 'Horários de atendimento',
)

const pageSubtitle = computed(() => {
  if (apenasHorarioProprio.value) {
    return 'Configure os dias e horários em que você atende nesta loja.'
  }
  return 'Configure os horários da loja e vincule profissionais diretamente em cada dia.'
})

function onDraftUpdate(dia: DiaSemanaValue, draft: { horaInicio: string; horaFim: string }) {
  setDraftDiaLoja(dia, draft)
}

function onDraftProprioUpdate(dia: DiaSemanaValue, draft: { horaInicio: string; horaFim: string }) {
  setDraftDiaProprio(dia, draft)
}

function horarioProprioComoLoja(dia: DiaSemanaValue): HorarioFuncionamento | null {
  const horario = horariosPorDiaProprio.value.get(dia)
  if (!horario) return null
  return {
    id: horario.id,
    estabelecimentoId: estabelecimentoId.value ?? 0,
    diaSemana: horario.diaSemana,
    horaInicio: horario.horaInicio,
    horaFim: horario.horaFim,
    ativo: horario.ativo,
  }
}
</script>

<template>
  <div class="horarios-page">
    <HorariosPageHeader :title="pageTitle" :subtitle="pageSubtitle" />

    <p v-if="contextError" class="horarios-page__error">{{ contextError }}</p>

    <LoadingSpinner v-if="contextLoading || loading" />

    <template v-else>
      <section v-if="podeGerenciarLoja" class="horarios-loja">
        <h2 class="horarios-section-title">Horários da loja</h2>
        <div class="horarios-loja-grid">
          <HorarioDiaLojaCard
            v-for="dia in DIAS_SEMANA"
            :key="dia.value"
            :dia="dia.value"
            :label="dia.label"
            :horario="horariosPorDiaLoja.get(dia.value) ?? null"
            :modo="modoDiaLoja(dia.value)"
            :draft="draftDiaLoja(dia.value)"
            :saving="savingDia === dia.value"
            :exibe-profissionais="podeGerenciarProfissionaisPorDia"
            :profissionais-vinculados="profissionaisVinculadosPorDia.get(dia.value) ?? 0"
            @update:draft="onDraftUpdate(dia.value, $event)"
            @salvar="salvarDiaLoja(dia.value)"
            @ativar="alterarStatusDiaLoja(dia.value, true)"
            @desativar="alterarStatusDiaLoja(dia.value, false)"
            @editar="iniciarEdicaoDiaLoja(dia.value)"
            @cancelar="cancelarEdicaoDiaLoja(dia.value)"
            @profissionais="abrirModalProfissionaisDia(dia.value)"
          />
        </div>

        <HorarioDiaProfissionaisModal
          v-model="modalProfissionaisAberta"
          :dia-label="modalProfissionaisDiaLabel"
          :loja-horario="modalLojaHorario"
          :loja-ativa="modalLojaAtiva"
          :vinculados="modalProfissionaisVinculados"
          :disponiveis="modalProfissionaisDisponiveis"
          :action-id="modalProfissionaisActionId"
          :erro="modalProfissionaisErro"
          @fechar="fecharModalProfissionaisDia"
          @update-modo="setModalProfissionalModo"
          @update-horario="updateModalProfissionalHorario"
          @salvar="salvarModalProfissional"
          @vincular="vincularModalProfissional"
          @remover="removerModalProfissional"
        />
      </section>

      <section v-else-if="apenasHorarioProprio" class="horarios-loja">
        <h2 class="horarios-section-title">Meus dias de atendimento</h2>
        <div class="horarios-loja-grid">
          <HorarioDiaLojaCard
            v-for="dia in DIAS_SEMANA"
            :key="dia.value"
            :dia="dia.value"
            :label="dia.label"
            :horario="horarioProprioComoLoja(dia.value)"
            :modo="modoDiaProprio(dia.value)"
            :draft="draftDiaProprio(dia.value)"
            :saving="savingDiaProprio === dia.value"
            @update:draft="onDraftProprioUpdate(dia.value, $event)"
            @salvar="salvarDiaProprio(dia.value)"
            @ativar="alterarStatusDiaProprio(dia.value, true)"
            @desativar="alterarStatusDiaProprio(dia.value, false)"
            @editar="iniciarEdicaoDiaProprio(dia.value)"
            @cancelar="cancelarEdicaoDiaProprio(dia.value)"
          />
        </div>
      </section>
    </template>
  </div>
</template>
