<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Lightbulb, Settings2 } from 'lucide-vue-next'
import HorarioDiaLojaCard from '@/components/horarios/HorarioDiaLojaCard.vue'
import HorarioDiaProfissionaisModal from '@/components/horarios/HorarioDiaProfissionaisModal.vue'
import HorariosMassaModal from '@/components/horarios/HorariosMassaModal.vue'
import HorariosPageHeader from '@/components/horarios/HorariosPageHeader.vue'
import GlowGuideLauncher from '@/tutorials/components/GlowGuideLauncher.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useHorarios, type HorarioMassaPayload } from '@/composables/useHorarios'
import { useGlowGuide } from '@/tutorials/hooks/useGlowGuide'
import { useNegocioStore } from '@/stores/negocio.store'
import type { HorarioFuncionamento } from '@/types/negocio/horario.types'
import type { DiaSemanaValue } from '@/constants/diasSemana'

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { ehProfissionalAutonomo } = storeToRefs(useNegocioStore())
const { start: startTutorial, maybeShowSuggestion } = useGlowGuide()

const {
  DIAS_SEMANA,
  loading,
  savingDia,
  savingDiaProprio,
  savingMassa,
  horariosPorDiaLoja,
  horariosPorDiaProprio,
  podeGerenciarLoja,
  usaHorarioAtendimentoProprio,
  apenasHorarioProprio,
  modoDiaLoja,
  draftDiaLoja,
  setDraftDiaLoja,
  iniciarEdicaoDiaLoja,
  cancelarEdicaoDiaLoja,
  salvarDiaLoja,
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
  profissionaisListaPorDia,
  listaProfissionaisHorario,
  abrirModalProfissionaisDia,
  fecharModalProfissionaisDia,
  setModalProfissionalModo,
  updateModalProfissionalHorario,
  salvarModalProfissional,
  vincularModalProfissional,
  removerModalProfissional,
  aplicarHorariosEmMassa,
} = useHorarios(estabelecimentoId, ready)

const massaAberta = ref(false)

const pageTitle = computed(() =>
  apenasHorarioProprio.value ? 'Meus horários' : 'Horários de atendimento',
)

const pageSubtitle = computed(() => {
  if (apenasHorarioProprio.value) {
    return 'Configure os dias e horários em que você atende nesta loja.'
  }
  if (ehProfissionalAutonomo.value) {
    return 'Configure os dias e horários em que você atende.'
  }
  return 'Configure os horários da loja e vincule profissionais diretamente em cada dia.'
})

const mostraMassa = computed(
  () => podeGerenciarLoja.value && !usaHorarioAtendimentoProprio.value,
)

const isLoading = computed(() => contextLoading.value || loading.value)

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

async function onSalvarDiaLoja(dia: DiaSemanaValue, ativo: boolean) {
  await salvarDiaLoja(dia, { ativo })
}

async function onSalvarDiaProprio(dia: DiaSemanaValue, ativo: boolean) {
  if (!ativo) {
    await alterarStatusDiaProprio(dia, false)
    return
  }
  await salvarDiaProprio(dia)
  const horario = horariosPorDiaProprio.value.get(dia)
  if (horario && !horario.ativo) {
    await alterarStatusDiaProprio(dia, true)
  }
}

async function onAplicarMassa(payload: HorarioMassaPayload) {
  const ok = await aplicarHorariosEmMassa(payload)
  if (ok) massaAberta.value = false
}

function onStartTutorial() {
  void startTutorial('business-hours')
}

onMounted(() => {
  maybeShowSuggestion('business-hours')
})
</script>

<template>
  <div class="horarios-page">
    <HorariosPageHeader :title="pageTitle" :subtitle="pageSubtitle">
      <template #actions>
        <GlowGuideLauncher class="max-sm:hidden" @click="onStartTutorial" />
        <GlowGuideLauncher class="sm:hidden" compact @click="onStartTutorial" />
        <button
          v-if="mostraMassa"
          type="button"
          class="horarios-massa-btn"
          @click="massaAberta = true"
        >
          <Settings2 class="size-4" aria-hidden="true" />
          <span class="max-sm:hidden">Configurar em massa</span>
          <span class="sm:hidden">Massa</span>
        </button>
      </template>
    </HorariosPageHeader>

    <p v-if="contextError" class="horarios-page__error">{{ contextError }}</p>

    <div v-if="isLoading" class="horarios-loja" aria-busy="true" aria-label="Carregando">
      <div class="horarios-loja-grid">
        <div v-for="n in 7" :key="n" class="horario-dia-card horario-dia-card--skeleton">
          <div class="flex justify-between gap-2">
            <div class="horarios-skeleton h-4 w-24" />
            <div class="horarios-skeleton h-4 w-12 rounded-full" />
          </div>
          <div class="mt-4 grid grid-cols-2 gap-3">
            <div class="horarios-skeleton h-10" />
            <div class="horarios-skeleton h-10" />
          </div>
          <div class="horarios-skeleton mt-4 h-9 w-full" />
        </div>
      </div>
    </div>

    <template v-else>
      <section v-if="usaHorarioAtendimentoProprio" class="horarios-loja">
        <div class="horarios-loja-grid max-md:hidden" data-tour="horarios-week">
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
            @salvar="onSalvarDiaProprio(dia.value, $event)"
            @editar="iniciarEdicaoDiaProprio(dia.value)"
            @cancelar="cancelarEdicaoDiaProprio(dia.value)"
          />
        </div>
        <div class="horarios-loja-list md:hidden" data-tour="horarios-week">
          <HorarioDiaLojaCard
            v-for="dia in DIAS_SEMANA"
            :key="`m-${dia.value}`"
            compact-mobile
            :dia="dia.value"
            :label="dia.label"
            :horario="horarioProprioComoLoja(dia.value)"
            :modo="modoDiaProprio(dia.value)"
            :draft="draftDiaProprio(dia.value)"
            :saving="savingDiaProprio === dia.value"
            @update:draft="onDraftProprioUpdate(dia.value, $event)"
            @salvar="onSalvarDiaProprio(dia.value, $event)"
            @editar="iniciarEdicaoDiaProprio(dia.value)"
            @cancelar="cancelarEdicaoDiaProprio(dia.value)"
          />
        </div>
      </section>

      <template v-else-if="podeGerenciarLoja">
        <section class="horarios-loja">
          <div class="horarios-loja-grid max-md:hidden" data-tour="horarios-week">
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
              :profissionais="profissionaisListaPorDia.get(dia.value) ?? []"
              @update:draft="onDraftUpdate(dia.value, $event)"
              @salvar="onSalvarDiaLoja(dia.value, $event)"
              @editar="iniciarEdicaoDiaLoja(dia.value)"
              @cancelar="cancelarEdicaoDiaLoja(dia.value)"
              @profissionais="abrirModalProfissionaisDia(dia.value)"
            />
          </div>

          <div class="horarios-loja-list md:hidden" data-tour="horarios-week">
            <HorarioDiaLojaCard
              v-for="dia in DIAS_SEMANA"
              :key="`m-${dia.value}`"
              compact-mobile
              :dia="dia.value"
              :label="dia.label"
              :horario="horariosPorDiaLoja.get(dia.value) ?? null"
              :modo="modoDiaLoja(dia.value)"
              :draft="draftDiaLoja(dia.value)"
              :saving="savingDia === dia.value"
              :exibe-profissionais="podeGerenciarProfissionaisPorDia"
              :profissionais="profissionaisListaPorDia.get(dia.value) ?? []"
              @update:draft="onDraftUpdate(dia.value, $event)"
              @salvar="onSalvarDiaLoja(dia.value, $event)"
              @editar="iniciarEdicaoDiaLoja(dia.value)"
              @cancelar="cancelarEdicaoDiaLoja(dia.value)"
              @profissionais="abrirModalProfissionaisDia(dia.value)"
            />
          </div>

          <aside class="horarios-dica">
            <div class="horarios-dica__icon" aria-hidden="true">
              <Lightbulb class="size-4" />
            </div>
            <p class="horarios-dica__text">
              <span class="font-semibold text-glow-text">Dica:</span>
              Ative a configuração em massa para aplicar o mesmo horário em vários dias de uma
              vez.
            </p>
            <button type="button" class="horarios-dica__action" @click="massaAberta = true">
              Saber mais
            </button>
          </aside>
        </section>

        <HorarioDiaProfissionaisModal
          v-if="podeGerenciarProfissionaisPorDia"
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

        <HorariosMassaModal
          v-model="massaAberta"
          :saving="savingMassa"
          :pode-profissionais="podeGerenciarProfissionaisPorDia"
          :profissionais="listaProfissionaisHorario"
          @aplicar="onAplicarMassa"
        />
      </template>
    </template>
  </div>
</template>
