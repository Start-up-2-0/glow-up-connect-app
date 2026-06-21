<script setup lang="ts">
import { computed } from 'vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import HorarioDiaLojaCard from '@/components/horarios/HorarioDiaLojaCard.vue'
import HorariosPageHeader from '@/components/horarios/HorariosPageHeader.vue'
import HorariosProfissionaisPanel from '@/components/horarios/HorariosProfissionaisPanel.vue'
import HorariosTabs from '@/components/horarios/HorariosTabs.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useHorarios } from '@/composables/useHorarios'
import type { DiaSemanaValue } from '@/constants/diasSemana'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()

const {
  DIAS_SEMANA,
  aba,
  loading,
  savingDia,
  savingProfissional,
  togglingId,
  horariosPorDiaLoja,
  horariosDoProfissional,
  profissionalSelecionadoId,
  listaProfissionaisHorario,
  profissionaisFormIds,
  formProfissional,
  editandoProfissional,
  todosProfissionaisSelecionados,
  podeGerenciarLoja,
  podeGerenciarProfissional,
  apenasHorarioProprio,
  exibeAbaProfissional,
  exibeAbas,
  usaProfissionaisVitrine,
  modoDiaLoja,
  draftDiaLoja,
  setDraftDiaLoja,
  iniciarEdicaoDiaLoja,
  cancelarEdicaoDiaLoja,
  salvarDiaLoja,
  alterarStatusDiaLoja,
  salvarProfissional,
  resetFormProfissional,
  iniciarEdicaoProfissional,
  alterarStatusProfissional,
  toggleProfissionalForm,
  toggleSelecionarTodosProfissionais,
} = useHorarios(estabelecimentoId, ready)

const pageTitle = computed(() =>
  apenasHorarioProprio.value ? 'Meus horários' : 'Horários de atendimento',
)

const pageSubtitle = computed(() => {
  if (apenasHorarioProprio.value) {
    return 'Configure os horários em que você atende nesta loja.'
  }
  return 'Os horários da loja são independentes; cada profissional pode ter horários iguais ou diferentes.'
})

const mostrarSelecaoProfissionais = computed(
  () => podeGerenciarLoja.value && !apenasHorarioProprio.value,
)

function onDraftUpdate(dia: DiaSemanaValue, draft: { horaInicio: string; horaFim: string }) {
  setDraftDiaLoja(dia, draft)
}
</script>

<template>
  <div class="horarios-page">
    <HorariosPageHeader :title="pageTitle" :subtitle="pageSubtitle" />

    <p v-if="contextError" class="horarios-page__error">{{ contextError }}</p>

    <HorariosTabs
      v-if="exibeAbas"
      v-model="aba"
      :show-profissionais="exibeAbaProfissional"
    />

    <LoadingSpinner v-if="contextLoading || loading" />

    <template v-else>
      <section v-if="aba === 'loja' && podeGerenciarLoja" class="horarios-loja">
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
            @update:draft="onDraftUpdate(dia.value, $event)"
            @salvar="salvarDiaLoja(dia.value)"
            @ativar="alterarStatusDiaLoja(dia.value, true)"
            @desativar="alterarStatusDiaLoja(dia.value, false)"
            @editar="iniciarEdicaoDiaLoja(dia.value)"
            @cancelar="cancelarEdicaoDiaLoja(dia.value)"
          />
        </div>
      </section>

      <section
        v-else-if="aba === 'profissional' && exibeAbaProfissional"
        class="horarios-profissionais-wrap"
      >
        <BaseCard v-if="listaProfissionaisHorario.length === 0">
          <EmptyState
            :title="usaProfissionaisVitrine ? 'Nenhum profissional na vitrine' : 'Nenhum profissional na equipe'"
            :description="
              usaProfissionaisVitrine
                ? 'Cadastre profissionais em Profissionais antes de definir horários.'
                : 'Convide profissionais em Equipe antes de definir horários.'
            "
          />
        </BaseCard>

        <HorariosProfissionaisPanel
          v-else
          :lista-profissionais="listaProfissionaisHorario"
          :horarios="horariosDoProfissional"
          :profissional-selecionado-id="profissionalSelecionadoId"
          :profissionais-form-ids="profissionaisFormIds"
          :form-dia-semana="formProfissional.diaSemana"
          :form-hora-inicio="formProfissional.horaInicio"
          :form-hora-fim="formProfissional.horaFim"
          :editando="editandoProfissional"
          :todos-selecionados="todosProfissionaisSelecionados"
          :saving="savingProfissional"
          :toggling-id="togglingId"
          :pode-gerenciar="podeGerenciarProfissional"
          :mostrar-selecao-profissionais="mostrarSelecaoProfissionais"
          @update:profissional-selecionado-id="profissionalSelecionadoId = $event"
          @update:form-dia-semana="formProfissional.diaSemana = $event"
          @update:form-hora-inicio="formProfissional.horaInicio = $event"
          @update:form-hora-fim="formProfissional.horaFim = $event"
          @toggle-profissional="toggleProfissionalForm"
          @toggle-selecionar-todos="toggleSelecionarTodosProfissionais"
          @salvar="salvarProfissional"
          @cancelar="resetFormProfissional"
          @editar="iniciarEdicaoProfissional"
          @ativar="alterarStatusProfissional($event, true)"
          @desativar="alterarStatusProfissional($event, false)"
        />
      </section>
    </template>
  </div>
</template>
