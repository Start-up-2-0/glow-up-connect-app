<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { horarioService } from '@/services/horarioService'
import { equipeService } from '@/services/equipeService'
import { profissionalVitrineService } from '@/services/profissionalVitrineService'
import {
  DIAS_SEMANA,
  diaSemanaLabel,
  horaParaApi,
  horaParaExibicao,
  type DiaSemanaValue,
} from '@/constants/diasSemana'
import type { HorarioFuncionamento, HorarioProfissional } from '@/types/negocio/horario.types'
import type { ProfissionalEquipe } from '@/types/negocio/equipe.types'

const emptyForm = () => ({
  diaSemana: 'Monday' as DiaSemanaValue,
  horaInicio: '09:00',
  horaFim: '18:00',
})

const { estabelecimentoId, ready, error: contextError, loading: contextLoading } =
  useEstabelecimentoView()
const { possuiModulo, possuiPermissao, estabelecimentoAtivo } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const aba = ref<'loja' | 'profissional'>('loja')
const horariosLoja = ref<HorarioFuncionamento[]>([])
const horariosProfissionais = ref<HorarioProfissional[]>([])
const profissionais = ref<ProfissionalEquipe[]>([])
const profissionaisVitrine = ref<{ profissionalId: number; nomePublico: string }[]>([])
const profissionalSelecionadoId = ref<number | null>(null)
const loading = ref(false)
const showFormLoja = ref(false)
const showFormProfissional = ref(false)
const saving = ref(false)
const togglingId = ref<number | null>(null)
const editingLojaId = ref<number | null>(null)
const editingProfissionalId = ref<number | null>(null)
const profissionaisFormIds = ref<number[]>([])

const formLoja = ref(emptyForm())
const formProfissional = ref(emptyForm())

const temModuloProfissionais = computed(() => possuiModulo('Profissionais'))
const usaProfissionaisVitrine = computed(() => !temModuloProfissionais.value)
const listaProfissionaisHorario = computed(() =>
  temModuloProfissionais.value
    ? profissionais.value.map((p) => ({
        profissionalId: p.profissionalId,
        nomePublico: p.nomePublico,
      }))
    : profissionaisVitrine.value,
)
const podeGerenciarLoja = computed(() => possuiPermissao('HorarioGerenciar'))
const podeGerenciarProfissional = computed(
  () => possuiPermissao('HorarioGerenciar') || possuiPermissao('HorarioGerenciarProprio'),
)
const profissionalProprioId = computed(() => estabelecimentoAtivo.value?.profissionalId ?? null)
const apenasHorarioProprio = computed(
  () => podeGerenciarProfissional.value && !podeGerenciarLoja.value,
)

const horariosDoProfissional = computed(() => {
  if (!profissionalSelecionadoId.value) return []
  return horariosProfissionais.value.filter(
    (h) => h.profissionalId === profissionalSelecionadoId.value,
  )
})

const profissionalSelecionado = computed(() =>
  listaProfissionaisHorario.value.find((p) => p.profissionalId === profissionalSelecionadoId.value),
)

function resetFormLoja() {
  formLoja.value = emptyForm()
  editingLojaId.value = null
  showFormLoja.value = false
}

function resetFormProfissional() {
  formProfissional.value = emptyForm()
  editingProfissionalId.value = null
  profissionaisFormIds.value = []
  showFormProfissional.value = false
}

function abrirFormProfissional() {
  if (showFormProfissional.value) {
    resetFormProfissional()
    return
  }
  editingProfissionalId.value = null
  formProfissional.value = emptyForm()
  if (apenasHorarioProprio.value && profissionalProprioId.value) {
    profissionaisFormIds.value = [profissionalProprioId.value]
  } else if (profissionalSelecionadoId.value) {
    profissionaisFormIds.value = [profissionalSelecionadoId.value]
  } else {
    profissionaisFormIds.value = []
  }
  showFormProfissional.value = true
}

function toggleProfissionalForm(id: number) {
  const idx = profissionaisFormIds.value.indexOf(id)
  if (idx >= 0) {
    profissionaisFormIds.value = profissionaisFormIds.value.filter((pid) => pid !== id)
  } else {
    profissionaisFormIds.value = [...profissionaisFormIds.value, id]
  }
}

function profissionalMarcadoNoForm(id: number): boolean {
  return profissionaisFormIds.value.includes(id)
}

async function load() {
  if (!estabelecimentoId.value) return
  loading.value = true
  try {
    if (apenasHorarioProprio.value) {
      aba.value = 'profissional'
    }

    const tarefas: Promise<void>[] = []

    if (podeGerenciarLoja.value) {
      tarefas.push(
        horarioService.listarLoja(estabelecimentoId.value).then((loja) => {
          horariosLoja.value = loja
        }),
      )
    } else {
      horariosLoja.value = []
    }

    tarefas.push(
      horarioService.listarProfissionais(estabelecimentoId.value).then((horariosProf) => {
        horariosProfissionais.value = horariosProf
      }),
    )

    await Promise.all(tarefas)

    if (apenasHorarioProprio.value && profissionalProprioId.value) {
      profissionalSelecionadoId.value = profissionalProprioId.value
      profissionais.value = [
        {
          id: 0,
          estabelecimentoId: estabelecimentoId.value,
          profissionalId: profissionalProprioId.value,
          usuarioId: 0,
          nomePublico: 'Você',
          email: '',
          telefone: '',
          ativo: true,
          podeReceberAgendamento: true,
        },
      ]
    } else if (temModuloProfissionais.value && possuiPermissao('ProfissionalGerenciar')) {
      profissionais.value = await equipeService.listarProfissionais(estabelecimentoId.value)
    } else if (!temModuloProfissionais.value && possuiPermissao('ProfissionalGerenciar')) {
      const vitrine = await profissionalVitrineService.listar(estabelecimentoId.value)
      profissionaisVitrine.value = vitrine
        .filter((p) => p.ativo)
        .map((p) => ({ profissionalId: p.profissionalId, nomePublico: p.nomePublico }))
    }

    const lista = listaProfissionaisHorario.value
    if (profissionalSelecionadoId.value === null && lista.length > 0) {
      profissionalSelecionadoId.value = lista[0]?.profissionalId ?? null
    }
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível carregar os horários.'))
  } finally {
    loading.value = false
  }
}

async function handleCriarLoja() {
  if (!estabelecimentoId.value || !podeGerenciarLoja.value) return
  saving.value = true
  try {
    const payload = {
      diaSemana: formLoja.value.diaSemana,
      horaInicio: horaParaApi(formLoja.value.horaInicio),
      horaFim: horaParaApi(formLoja.value.horaFim),
    }
    if (editingLojaId.value) {
      const atualizado = await horarioService.atualizarLoja(
        estabelecimentoId.value,
        editingLojaId.value,
        payload,
      )
      horariosLoja.value = horariosLoja.value.map((h) =>
        h.id === editingLojaId.value ? atualizado : h,
      )
      notifications.push('success', 'Horário atualizado.')
    } else {
      const criado = await horarioService.criarLoja(estabelecimentoId.value, payload)
      horariosLoja.value = [...horariosLoja.value, criado]
      notifications.push('success', 'Horário criado.')
    }
    resetFormLoja()
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível salvar o horário da loja.'))
  } finally {
    saving.value = false
  }
}

function iniciarEdicaoLoja(h: HorarioFuncionamento) {
  editingLojaId.value = h.id
  formLoja.value = {
    diaSemana: h.diaSemana as DiaSemanaValue,
    horaInicio: horaParaExibicao(h.horaInicio),
    horaFim: horaParaExibicao(h.horaFim),
  }
  showFormLoja.value = true
}

async function handleToggleLoja(h: HorarioFuncionamento) {
  if (!estabelecimentoId.value || !podeGerenciarLoja.value) return
  togglingId.value = h.id
  try {
    const atualizado = await horarioService.alterarStatusLoja(
      estabelecimentoId.value,
      h.id,
      !h.ativo,
    )
    horariosLoja.value = horariosLoja.value.map((item) => (item.id === h.id ? atualizado : item))
    notifications.push('success', atualizado.ativo ? 'Horário ativado.' : 'Horário desativado.')
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    togglingId.value = null
  }
}

async function handleCriarProfissional() {
  if (!estabelecimentoId.value || !podeGerenciarProfissional.value) return

  const payload = {
    diaSemana: formProfissional.value.diaSemana,
    horaInicio: horaParaApi(formProfissional.value.horaInicio),
    horaFim: horaParaApi(formProfissional.value.horaFim),
  }

  if (editingProfissionalId.value) {
    saving.value = true
    try {
      const atualizado = await horarioService.atualizarProfissional(
        estabelecimentoId.value,
        editingProfissionalId.value,
        payload,
      )
      horariosProfissionais.value = horariosProfissionais.value.map((h) =>
        h.id === editingProfissionalId.value ? atualizado : h,
      )
      notifications.push('success', 'Horário do profissional atualizado.')
      resetFormProfissional()
    } catch (err) {
      notifications.push(
        'error',
        resolveError(err, 'Não foi possível salvar o horário do profissional.'),
      )
    } finally {
      saving.value = false
    }
    return
  }

  const idsAlvo = apenasHorarioProprio.value
    ? profissionalProprioId.value
      ? [profissionalProprioId.value]
      : []
    : profissionaisFormIds.value

  if (idsAlvo.length === 0) {
    notifications.push('warning', 'Selecione ao menos um profissional.')
    return
  }

  saving.value = true
  try {
    const estId = estabelecimentoId.value
    const results = await Promise.allSettled(
      idsAlvo.map((profId) => horarioService.criarProfissional(estId, profId, payload)),
    )
    const criados = results
      .filter((r): r is PromiseFulfilledResult<HorarioProfissional> => r.status === 'fulfilled')
      .map((r) => r.value)
    const falhas = results.filter((r) => r.status === 'rejected')

    if (criados.length > 0) {
      horariosProfissionais.value = [...horariosProfissionais.value, ...criados]
      const msg =
        criados.length === 1
          ? 'Horário do profissional criado.'
          : `Horário criado para ${criados.length} profissionais.`
      notifications.push('success', msg)
      if (!profissionalSelecionadoId.value && criados[0]) {
        profissionalSelecionadoId.value = criados[0].profissionalId
      }
    }

    if (falhas.length > 0) {
      const motivo =
        falhas[0].status === 'rejected'
          ? resolveError(falhas[0].reason, 'Não foi possível salvar para alguns profissionais.')
          : 'Não foi possível salvar para alguns profissionais.'
      notifications.push(criados.length > 0 ? 'warning' : 'error', motivo)
    }

    if (criados.length > 0) {
      resetFormProfissional()
    }
  } catch (err) {
    notifications.push(
      'error',
      resolveError(err, 'Não foi possível salvar o horário do profissional.'),
    )
  } finally {
    saving.value = false
  }
}

function iniciarEdicaoProfissional(h: HorarioProfissional) {
  editingProfissionalId.value = h.id
  profissionaisFormIds.value = [h.profissionalId]
  profissionalSelecionadoId.value = h.profissionalId
  formProfissional.value = {
    diaSemana: h.diaSemana as DiaSemanaValue,
    horaInicio: horaParaExibicao(h.horaInicio),
    horaFim: horaParaExibicao(h.horaFim),
  }
  showFormProfissional.value = true
}

async function handleToggleProfissional(h: HorarioProfissional) {
  if (!estabelecimentoId.value || !podeGerenciarProfissional.value) return
  togglingId.value = h.id
  try {
    const atualizado = await horarioService.alterarStatusProfissional(
      estabelecimentoId.value,
      h.id,
      !h.ativo,
    )
    horariosProfissionais.value = horariosProfissionais.value.map((item) =>
      item.id === h.id ? atualizado : item,
    )
    notifications.push('success', atualizado.ativo ? 'Horário ativado.' : 'Horário desativado.')
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    togglingId.value = null
  }
}

watch(
  ready,
  (isReady) => {
    if (!isReady) return
    if (apenasHorarioProprio.value) {
      aba.value = 'profissional'
    }
    void load()
  },
  { immediate: true },
)
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
          {{ apenasHorarioProprio ? 'Meus horários' : 'Horários' }}
        </h1>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          {{
            apenasHorarioProprio
              ? 'Configure os horários em que você atende nesta loja.'
              : 'Horários de funcionamento da loja e dos profissionais.'
          }}
        </p>
        <p
          v-if="!apenasHorarioProprio && podeGerenciarLoja"
          class="mt-1 font-urbanist text-xs text-glow-text-subtle"
        >
          Horários da loja são independentes; cada profissional pode ter horários iguais ou
          diferentes.
        </p>
      </div>
      <BaseButton
        v-if="aba === 'loja' && podeGerenciarLoja"
        variant="primary"
        size="sm"
        @click="showFormLoja ? resetFormLoja() : (showFormLoja = true)"
      >
        {{ showFormLoja ? 'Cancelar' : 'Adicionar horário' }}
      </BaseButton>
      <BaseButton
        v-else-if="aba === 'profissional' && podeGerenciarProfissional && listaProfissionaisHorario.length > 0"
        variant="primary"
        size="sm"
        @click="abrirFormProfissional"
      >
        {{ showFormProfissional ? 'Cancelar' : 'Adicionar horário' }}
      </BaseButton>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <div v-if="podeGerenciarLoja" class="flex gap-2 border-b border-glow-border-soft">
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
        v-if="temModuloProfissionais || usaProfissionaisVitrine"
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

    <BaseCard v-if="aba === 'loja' && showFormLoja && podeGerenciarLoja" :title="editingLojaId ? 'Editar horário' : 'Novo horário da loja'">
      <form class="space-y-4" @submit.prevent="handleCriarLoja">
        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">
              Dia da semana
            </label>
            <select
              v-model="formLoja.diaSemana"
              class="w-full rounded-lg border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm text-glow-text"
              required
            >
              <option v-for="dia in DIAS_SEMANA" :key="dia.value" :value="dia.value">
                {{ dia.label }}
              </option>
            </select>
          </div>
          <BaseInput v-model="formLoja.horaInicio" label="Início" type="time" required />
          <BaseInput v-model="formLoja.horaFim" label="Fim" type="time" required />
        </div>
        <div class="flex justify-end gap-2">
          <BaseButton type="button" variant="secondary" @click="resetFormLoja">Cancelar</BaseButton>
          <BaseButton type="submit" :loading="saving">Salvar</BaseButton>
        </div>
      </form>
    </BaseCard>

    <BaseCard
      v-if="aba === 'profissional' && showFormProfissional && podeGerenciarProfissional"
      :title="editingProfissionalId ? 'Editar horário' : 'Novo horário do profissional'"
    >
      <form class="space-y-4" @submit.prevent="handleCriarProfissional">
        <div
          v-if="!editingProfissionalId && podeGerenciarLoja && !apenasHorarioProprio"
          class="space-y-2"
        >
          <p class="font-urbanist text-sm font-medium text-glow-text">Profissionais</p>
          <p class="font-urbanist text-xs text-glow-text-subtle">
            Selecione um ou mais profissionais para o mesmo dia e horário.
          </p>
          <div class="flex flex-wrap gap-3">
            <label
              v-for="p in listaProfissionaisHorario"
              :key="p.profissionalId"
              class="flex cursor-pointer items-center gap-2 rounded-lg border border-glow-border-soft px-3 py-2"
            >
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-glow-border-soft text-glow-gold focus:ring-glow-gold"
                :checked="profissionalMarcadoNoForm(p.profissionalId)"
                @change="toggleProfissionalForm(p.profissionalId)"
              />
              <span class="font-urbanist text-sm text-glow-text">{{ p.nomePublico }}</span>
            </label>
          </div>
        </div>
        <div class="grid gap-4 sm:grid-cols-3">
          <div>
            <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">
              Dia da semana
            </label>
            <select
              v-model="formProfissional.diaSemana"
              class="w-full rounded-lg border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm text-glow-text"
              required
            >
              <option v-for="dia in DIAS_SEMANA" :key="dia.value" :value="dia.value">
                {{ dia.label }}
              </option>
            </select>
          </div>
          <BaseInput v-model="formProfissional.horaInicio" label="Início" type="time" required />
          <BaseInput v-model="formProfissional.horaFim" label="Fim" type="time" required />
        </div>
        <div class="flex justify-end gap-2">
          <BaseButton type="button" variant="secondary" @click="resetFormProfissional">
            Cancelar
          </BaseButton>
          <BaseButton type="submit" :loading="saving">Salvar</BaseButton>
        </div>
      </form>
    </BaseCard>

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
            {{ diaSemanaLabel(h.diaSemana) }}
          </span>
          <span class="font-urbanist text-sm text-glow-text-subtle">
            {{ horaParaExibicao(h.horaInicio) }} – {{ horaParaExibicao(h.horaFim) }}
          </span>
          <span
            class="inline-flex rounded-full px-2 py-0.5 font-urbanist text-xs"
            :class="h.ativo ? 'bg-green-100 text-green-800' : 'bg-glow-canvas text-glow-text-subtle'"
          >
            {{ h.ativo ? 'Ativo' : 'Inativo' }}
          </span>
          <div v-if="podeGerenciarLoja" class="flex gap-2">
            <BaseButton variant="secondary" size="sm" @click="iniciarEdicaoLoja(h)">
              Editar
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              :loading="togglingId === h.id"
              @click="handleToggleLoja(h)"
            >
              {{ h.ativo ? 'Desativar' : 'Ativar' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </template>

    <template
      v-else-if="
        aba === 'profissional' &&
        (temModuloProfissionais || usaProfissionaisVitrine || apenasHorarioProprio)
      "
    >
      <div v-if="listaProfissionaisHorario.length > 0 && !apenasHorarioProprio" class="max-w-md">
        <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">
          Profissional
        </label>
        <select
          v-model="profissionalSelecionadoId"
          class="w-full rounded-lg border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm text-glow-text"
        >
          <option
            v-for="p in listaProfissionaisHorario"
            :key="p.profissionalId"
            :value="p.profissionalId"
          >
            {{ p.nomePublico }}
          </option>
        </select>
      </div>

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

      <BaseCard v-else-if="horariosDoProfissional.length === 0">
        <EmptyState
          :title="`Nenhum horário para ${profissionalSelecionado?.nomePublico ?? 'o profissional'}`"
          description="Adicione os horários de atendimento deste profissional."
        />
      </BaseCard>

      <div v-else class="space-y-2">
        <div
          v-for="h in horariosDoProfissional"
          :key="h.id"
          class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-glow-border-soft bg-glow-surface px-4 py-3"
        >
          <span class="font-urbanist text-sm font-medium text-glow-text">
            {{ diaSemanaLabel(h.diaSemana) }}
          </span>
          <span class="font-urbanist text-sm text-glow-text-subtle">
            {{ horaParaExibicao(h.horaInicio) }} – {{ horaParaExibicao(h.horaFim) }}
          </span>
          <span
            class="inline-flex rounded-full px-2 py-0.5 font-urbanist text-xs"
            :class="h.ativo ? 'bg-green-100 text-green-800' : 'bg-glow-canvas text-glow-text-subtle'"
          >
            {{ h.ativo ? 'Ativo' : 'Inativo' }}
          </span>
          <div v-if="podeGerenciarProfissional" class="flex gap-2">
            <BaseButton variant="secondary" size="sm" @click="iniciarEdicaoProfissional(h)">
              Editar
            </BaseButton>
            <BaseButton
              variant="secondary"
              size="sm"
              :loading="togglingId === h.id"
              @click="handleToggleProfissional(h)"
            >
              {{ h.ativo ? 'Desativar' : 'Ativar' }}
            </BaseButton>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
