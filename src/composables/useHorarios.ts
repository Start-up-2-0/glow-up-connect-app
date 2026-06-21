import { computed, ref, watch, type Ref } from 'vue'
import { horarioService } from '@/services/horarioService'
import { equipeService } from '@/services/equipeService'
import { profissionalVitrineService } from '@/services/profissionalVitrineService'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import {
  DIAS_SEMANA,
  horaParaApi,
  horaParaExibicao,
  type DiaSemanaValue,
} from '@/constants/diasSemana'
import type { HorarioFuncionamento, HorarioProfissional } from '@/types/negocio/horario.types'
import type { ProfissionalEquipe } from '@/types/negocio/equipe.types'

export type HorariosAba = 'loja' | 'profissional'

export type DiaLojaModo = 'novo' | 'visualizacao' | 'edicao'

export interface DiaLojaDraft {
  horaInicio: string
  horaFim: string
}

export interface ProfissionalHorarioOption {
  profissionalId: number
  nomePublico: string
}

const HORA_PADRAO_INICIO = '00:00'
const HORA_PADRAO_FIM = '00:00'

function emptyProfForm() {
  return {
    diaSemana: 'Monday' as DiaSemanaValue,
    horaInicio: '09:00',
    horaFim: '18:00',
  }
}

function emptyDiaDraft(): DiaLojaDraft {
  return { horaInicio: HORA_PADRAO_INICIO, horaFim: HORA_PADRAO_FIM }
}

export function useHorarios(estabelecimentoId: Ref<number | null>, ready: Ref<boolean>) {
  const { possuiModulo, possuiPermissao, estabelecimentoAtivo } = useNegocioContext()
  const notifications = useNotificationsStore()
  const { resolveError } = useApiError()

  const aba = ref<HorariosAba>('loja')
  const horariosLoja = ref<HorarioFuncionamento[]>([])
  const horariosProfissionais = ref<HorarioProfissional[]>([])
  const profissionais = ref<ProfissionalEquipe[]>([])
  const profissionaisVitrine = ref<ProfissionalHorarioOption[]>([])
  const profissionalSelecionadoId = ref<number | null>(null)
  const loading = ref(false)
  const savingDia = ref<DiaSemanaValue | null>(null)
  const togglingId = ref<number | null>(null)
  const editingDiasLoja = ref<Set<DiaSemanaValue>>(new Set())
  const draftsLoja = ref<Partial<Record<DiaSemanaValue, DiaLojaDraft>>>({})
  const savingProfissional = ref(false)
  const editingProfissionalId = ref<number | null>(null)
  const profissionaisFormIds = ref<number[]>([])
  const formProfissional = ref(emptyProfForm())

  const temModuloProfissionais = computed(() => possuiModulo('Profissionais'))
  const usaProfissionaisVitrine = computed(() => !temModuloProfissionais.value)
  const listaProfissionaisHorario = computed<ProfissionalHorarioOption[]>(() =>
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
  const exibeAbaProfissional = computed(
    () =>
      temModuloProfissionais.value ||
      usaProfissionaisVitrine.value ||
      apenasHorarioProprio.value,
  )
  const exibeAbas = computed(() => podeGerenciarLoja.value && exibeAbaProfissional.value)

  const horariosPorDiaLoja = computed(() => {
    const map = new Map<DiaSemanaValue, HorarioFuncionamento>()
    for (const h of horariosLoja.value) {
      map.set(h.diaSemana as DiaSemanaValue, h)
    }
    return map
  })

  const horariosDoProfissional = computed(() => {
    if (!profissionalSelecionadoId.value) return []
    return horariosProfissionais.value.filter(
      (h) => h.profissionalId === profissionalSelecionadoId.value,
    )
  })

  const profissionalSelecionado = computed(() =>
    listaProfissionaisHorario.value.find((p) => p.profissionalId === profissionalSelecionadoId.value),
  )

  const editandoProfissional = computed(() => editingProfissionalId.value !== null)

  const todosProfissionaisSelecionados = computed(() => {
    const lista = listaProfissionaisHorario.value
    if (lista.length === 0) return false
    return lista.every((p) => profissionaisFormIds.value.includes(p.profissionalId))
  })

  function modoDiaLoja(dia: DiaSemanaValue): DiaLojaModo {
    if (editingDiasLoja.value.has(dia)) return 'edicao'
    if (horariosPorDiaLoja.value.has(dia)) return 'visualizacao'
    return 'novo'
  }

  function draftDiaLoja(dia: DiaSemanaValue): DiaLojaDraft {
    if (draftsLoja.value[dia]) return draftsLoja.value[dia]!
    const horario = horariosPorDiaLoja.value.get(dia)
    if (horario) {
      return {
        horaInicio: horaParaExibicao(horario.horaInicio),
        horaFim: horaParaExibicao(horario.horaFim),
      }
    }
    return emptyDiaDraft()
  }

  function setDraftDiaLoja(dia: DiaSemanaValue, patch: Partial<DiaLojaDraft>) {
    draftsLoja.value = {
      ...draftsLoja.value,
      [dia]: { ...draftDiaLoja(dia), ...patch },
    }
  }

  function iniciarEdicaoDiaLoja(dia: DiaSemanaValue) {
    draftsLoja.value = {
      ...draftsLoja.value,
      [dia]: draftDiaLoja(dia),
    }
    editingDiasLoja.value = new Set([...editingDiasLoja.value, dia])
  }

  function cancelarEdicaoDiaLoja(dia: DiaSemanaValue) {
    const next = new Set(editingDiasLoja.value)
    next.delete(dia)
    editingDiasLoja.value = next
    const { [dia]: _, ...rest } = draftsLoja.value
    draftsLoja.value = rest
  }

  function resetFormProfissional() {
    formProfissional.value = emptyProfForm()
    editingProfissionalId.value = null
    if (apenasHorarioProprio.value && profissionalProprioId.value) {
      profissionaisFormIds.value = [profissionalProprioId.value]
    } else {
      profissionaisFormIds.value = []
    }
  }

  function toggleProfissionalForm(id: number) {
    const idx = profissionaisFormIds.value.indexOf(id)
    if (idx >= 0) {
      profissionaisFormIds.value = profissionaisFormIds.value.filter((pid) => pid !== id)
    } else {
      profissionaisFormIds.value = [...profissionaisFormIds.value, id]
    }
  }

  function toggleSelecionarTodosProfissionais() {
    if (todosProfissionaisSelecionados.value) {
      profissionaisFormIds.value = []
      return
    }
    profissionaisFormIds.value = listaProfissionaisHorario.value.map((p) => p.profissionalId)
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

      editingDiasLoja.value = new Set()
      draftsLoja.value = {}
      resetFormProfissional()
    } catch (err) {
      notifications.push('error', resolveError(err, 'Não foi possível carregar os horários.'))
    } finally {
      loading.value = false
    }
  }

  async function salvarDiaLoja(dia: DiaSemanaValue) {
    if (!estabelecimentoId.value || !podeGerenciarLoja.value) return
    const draft = draftDiaLoja(dia)
    savingDia.value = dia
    try {
      const payload = {
        diaSemana: dia,
        horaInicio: horaParaApi(draft.horaInicio),
        horaFim: horaParaApi(draft.horaFim),
      }
      const existente = horariosPorDiaLoja.value.get(dia)
      if (existente) {
        const atualizado = await horarioService.atualizarLoja(
          estabelecimentoId.value,
          existente.id,
          payload,
        )
        horariosLoja.value = horariosLoja.value.map((h) => (h.id === existente.id ? atualizado : h))
        notifications.push('success', 'Horário atualizado.')
      } else {
        const criado = await horarioService.criarLoja(estabelecimentoId.value, payload)
        horariosLoja.value = [...horariosLoja.value, criado]
        notifications.push('success', 'Horário salvo.')
      }
      cancelarEdicaoDiaLoja(dia)
    } catch (err) {
      notifications.push('error', resolveError(err, 'Não foi possível salvar o horário.'))
    } finally {
      savingDia.value = null
    }
  }

  async function alterarStatusDiaLoja(dia: DiaSemanaValue, ativo: boolean) {
    if (!estabelecimentoId.value || !podeGerenciarLoja.value) return
    savingDia.value = dia
    try {
      let horario = horariosPorDiaLoja.value.get(dia)
      if (!horario) {
        const draft = draftDiaLoja(dia)
        horario = await horarioService.criarLoja(estabelecimentoId.value, {
          diaSemana: dia,
          horaInicio: horaParaApi(draft.horaInicio),
          horaFim: horaParaApi(draft.horaFim),
        })
        horariosLoja.value = [...horariosLoja.value, horario]
      }
      const atualizado = await horarioService.alterarStatusLoja(
        estabelecimentoId.value,
        horario.id,
        ativo,
      )
      horariosLoja.value = horariosLoja.value.map((h) => (h.id === horario!.id ? atualizado : h))
      notifications.push('success', ativo ? 'Horário ativado.' : 'Horário desativado.')
      cancelarEdicaoDiaLoja(dia)
    } catch (err) {
      notifications.push('error', resolveError(err))
    } finally {
      savingDia.value = null
    }
  }

  async function salvarProfissional() {
    if (!estabelecimentoId.value || !podeGerenciarProfissional.value) return

    const payload = {
      diaSemana: formProfissional.value.diaSemana,
      horaInicio: horaParaApi(formProfissional.value.horaInicio),
      horaFim: horaParaApi(formProfissional.value.horaFim),
    }

    if (editingProfissionalId.value) {
      savingProfissional.value = true
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
        savingProfissional.value = false
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

    savingProfissional.value = true
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
        resetFormProfissional()
      }

      if (falhas.length > 0) {
        const motivo =
          falhas[0].status === 'rejected'
            ? resolveError(falhas[0].reason, 'Não foi possível salvar para alguns profissionais.')
            : 'Não foi possível salvar para alguns profissionais.'
        notifications.push(criados.length > 0 ? 'warning' : 'error', motivo)
      }
    } catch (err) {
      notifications.push(
        'error',
        resolveError(err, 'Não foi possível salvar o horário do profissional.'),
      )
    } finally {
      savingProfissional.value = false
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
  }

  async function alterarStatusProfissional(h: HorarioProfissional, ativo: boolean) {
    if (!estabelecimentoId.value || !podeGerenciarProfissional.value) return
    togglingId.value = h.id
    try {
      const atualizado = await horarioService.alterarStatusProfissional(
        estabelecimentoId.value,
        h.id,
        ativo,
      )
      horariosProfissionais.value = horariosProfissionais.value.map((item) =>
        item.id === h.id ? atualizado : item,
      )
      notifications.push('success', ativo ? 'Horário ativado.' : 'Horário desativado.')
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

  return {
    DIAS_SEMANA,
    aba,
    loading,
    savingDia,
    savingProfissional,
    togglingId,
    horariosLoja,
    horariosProfissionais,
    horariosDoProfissional,
    horariosPorDiaLoja,
    profissionalSelecionadoId,
    profissionalSelecionado,
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
    temModuloProfissionais,
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
    profissionalMarcadoNoForm,
    load,
  }
}
