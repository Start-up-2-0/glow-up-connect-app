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
import type { HorarioFuncionamento, HorarioProfissional, ProfissionalDiaHorarioConfig, HorarioProfissionalModoConfig } from '@/types/negocio/horario.types'
import type { ProfissionalEquipe } from '@/types/negocio/equipe.types'
import {
  resolverModoHorarioProfissional,
  validarIntervaloHorario,
  horarioDentroDoFuncionamentoLoja,
} from '@/utils/horarioProfissionalHelpers'

export type DiaLojaModo = 'novo' | 'visualizacao' | 'edicao'

export interface DiaLojaDraft {
  horaInicio: string
  horaFim: string
}

export interface ProfissionalHorarioOption {
  profissionalId: number
  nomePublico: string
  avatarUrl?: string | null
}

const HORA_PADRAO_INICIO = '08:00'
const HORA_PADRAO_FIM = '20:00'

function emptyDiaDraft(): DiaLojaDraft {
  return { horaInicio: HORA_PADRAO_INICIO, horaFim: HORA_PADRAO_FIM }
}

export function useHorarios(estabelecimentoId: Ref<number | null>, ready: Ref<boolean>) {
  const { possuiModulo, possuiPermissao, estabelecimentoAtivo } = useNegocioContext()
  const notifications = useNotificationsStore()
  const { resolveError } = useApiError()

  const horariosLoja = ref<HorarioFuncionamento[]>([])
  const horariosProfissionais = ref<HorarioProfissional[]>([])
  const profissionais = ref<ProfissionalEquipe[]>([])
  const profissionaisVitrine = ref<ProfissionalHorarioOption[]>([])
  const loading = ref(false)
  const savingDia = ref<DiaSemanaValue | null>(null)
  const savingDiaProprio = ref<DiaSemanaValue | null>(null)
  const editingDiasLoja = ref<Set<DiaSemanaValue>>(new Set())
  const editingDiasProprio = ref<Set<DiaSemanaValue>>(new Set())
  const draftsLoja = ref<Partial<Record<DiaSemanaValue, DiaLojaDraft>>>({})
  const draftsProprio = ref<Partial<Record<DiaSemanaValue, DiaLojaDraft>>>({})
  const modalProfissionaisAberta = ref(false)
  const modalProfissionaisDia = ref<DiaSemanaValue | null>(null)
  const modalProfissionaisConfigs = ref<ProfissionalDiaHorarioConfig[]>([])
  const modalProfissionaisActionId = ref<number | null>(null)
  const modalProfissionaisErro = ref<string | null>(null)

  const temModuloProfissionais = computed(() => possuiModulo('Profissionais'))
  const usaProfissionaisVitrine = computed(() => !temModuloProfissionais.value)
  const listaProfissionaisHorario = computed<ProfissionalHorarioOption[]>(() =>
    temModuloProfissionais.value
      ? profissionais.value.map((p) => ({
          profissionalId: p.profissionalId,
          nomePublico: p.nomePublico,
          avatarUrl: null,
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

  const podeGerenciarProfissionaisPorDia = computed(
    () =>
      podeGerenciarLoja.value &&
      exibeAbaProfissional.value &&
      listaProfissionaisHorario.value.length > 0,
  )

  const profissionaisVinculadosPorDia = computed(() => {
    const map = new Map<DiaSemanaValue, number>()
    for (const dia of DIAS_SEMANA) {
      map.set(
        dia.value,
        horariosProfissionais.value.filter((h) => h.diaSemana === dia.value && h.ativo).length,
      )
    }
    return map
  })

  const modalProfissionaisDiaLabel = computed(() => {
    if (!modalProfissionaisDia.value) return ''
    return DIAS_SEMANA.find((d) => d.value === modalProfissionaisDia.value)?.label ?? ''
  })

  const modalLojaHorario = computed(() => {
    if (!modalProfissionaisDia.value) return null
    return horariosPorDiaLoja.value.get(modalProfissionaisDia.value) ?? null
  })

  const modalLojaAtiva = computed(() => modalLojaHorario.value?.ativo === true)

  const modalProfissionaisVinculados = computed(() =>
    modalProfissionaisConfigs.value.filter((c) => c.selecionado),
  )

  const modalProfissionaisDisponiveis = computed(() =>
    modalProfissionaisConfigs.value.filter((c) => !c.selecionado),
  )

  const horariosPorDiaLoja = computed(() => {
    const map = new Map<DiaSemanaValue, HorarioFuncionamento>()
    for (const h of horariosLoja.value) {
      map.set(h.diaSemana as DiaSemanaValue, h)
    }
    return map
  })

  const horariosPorDiaProprio = computed(() => {
    const map = new Map<DiaSemanaValue, HorarioProfissional>()
    if (!profissionalProprioId.value) return map
    for (const h of horariosProfissionais.value) {
      if (h.profissionalId === profissionalProprioId.value) {
        map.set(h.diaSemana as DiaSemanaValue, h)
      }
    }
    return map
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

  function modoDiaProprio(dia: DiaSemanaValue): DiaLojaModo {
    if (editingDiasProprio.value.has(dia)) return 'edicao'
    if (horariosPorDiaProprio.value.has(dia)) return 'visualizacao'
    return 'novo'
  }

  function draftDiaProprio(dia: DiaSemanaValue): DiaLojaDraft {
    if (draftsProprio.value[dia]) return draftsProprio.value[dia]!
    const horario = horariosPorDiaProprio.value.get(dia)
    if (horario) {
      return {
        horaInicio: horaParaExibicao(horario.horaInicio),
        horaFim: horaParaExibicao(horario.horaFim),
      }
    }
    const loja = horariosPorDiaLoja.value.get(dia)
    if (loja?.ativo) {
      return {
        horaInicio: horaParaExibicao(loja.horaInicio),
        horaFim: horaParaExibicao(loja.horaFim),
      }
    }
    return emptyDiaDraft()
  }

  function setDraftDiaProprio(dia: DiaSemanaValue, patch: Partial<DiaLojaDraft>) {
    draftsProprio.value = {
      ...draftsProprio.value,
      [dia]: { ...draftDiaProprio(dia), ...patch },
    }
  }

  function iniciarEdicaoDiaProprio(dia: DiaSemanaValue) {
    draftsProprio.value = {
      ...draftsProprio.value,
      [dia]: draftDiaProprio(dia),
    }
    editingDiasProprio.value = new Set([...editingDiasProprio.value, dia])
  }

  function cancelarEdicaoDiaProprio(dia: DiaSemanaValue) {
    const next = new Set(editingDiasProprio.value)
    next.delete(dia)
    editingDiasProprio.value = next
    const { [dia]: _, ...rest } = draftsProprio.value
    draftsProprio.value = rest
  }

  function validarConfigModal(config: ProfissionalDiaHorarioConfig): string | null {
    const loja = modalLojaHorario.value
    const lojaAtiva = loja?.ativo === true

    if (config.modo === 'loja' && !lojaAtiva) {
      return 'Ative o horário da loja neste dia para usar o horário geral.'
    }

    const { horaInicio, horaFim } = resolverHorariosModalConfig(config)
    const intervaloErro = validarIntervaloHorario(horaInicio, horaFim)
    if (intervaloErro) return intervaloErro

    if (lojaAtiva && loja && !horarioDentroDoFuncionamentoLoja(horaInicio, horaFim, loja)) {
      return `O horário deve estar dentro do funcionamento da loja (${horaParaExibicao(loja.horaInicio)}–${horaParaExibicao(loja.horaFim)}).`
    }

    return null
  }

  function resolverHorariosModalConfig(config: ProfissionalDiaHorarioConfig): {
    horaInicio: string
    horaFim: string
  } {
    const loja = modalLojaHorario.value
    if (config.modo === 'loja' && loja?.ativo) {
      return {
        horaInicio: horaParaExibicao(loja.horaInicio),
        horaFim: horaParaExibicao(loja.horaFim),
      }
    }
    return { horaInicio: config.horaInicio, horaFim: config.horaFim }
  }

  function abrirModalProfissionaisDia(dia: DiaSemanaValue) {
    if (!podeGerenciarProfissionaisPorDia.value) return
    modalProfissionaisDia.value = dia
    modalProfissionaisErro.value = null
    const loja = horariosPorDiaLoja.value.get(dia) ?? null
    const lojaAtiva = loja?.ativo === true
    const draft = draftDiaLoja(dia)

    modalProfissionaisConfigs.value = listaProfissionaisHorario.value.map((p) => {
      const existente =
        horariosProfissionais.value.find(
          (h) => h.profissionalId === p.profissionalId && h.diaSemana === dia,
        ) ?? null

      const lojaInicio = lojaAtiva ? horaParaExibicao(loja!.horaInicio) : draft.horaInicio
      const lojaFim = lojaAtiva ? horaParaExibicao(loja!.horaFim) : draft.horaFim

      return {
        profissionalId: p.profissionalId,
        nomePublico: p.nomePublico,
        avatarUrl: p.avatarUrl ?? null,
        selecionado: existente?.ativo ?? false,
        modo: existente
          ? resolverModoHorarioProfissional(existente, lojaAtiva ? loja : null)
          : lojaAtiva
            ? 'loja'
            : 'personalizado',
        horaInicio: existente ? horaParaExibicao(existente.horaInicio) : lojaInicio,
        horaFim: existente ? horaParaExibicao(existente.horaFim) : lojaFim,
        horarioId: existente?.id ?? null,
        dirty: false,
      }
    })

    modalProfissionaisAberta.value = true
  }

  function fecharModalProfissionaisDia() {
    modalProfissionaisAberta.value = false
    modalProfissionaisDia.value = null
    modalProfissionaisConfigs.value = []
    modalProfissionaisErro.value = null
  }

  function updateModalProfissionalConfig(
    profissionalId: number,
    patch: Partial<ProfissionalDiaHorarioConfig>,
  ) {
    modalProfissionaisConfigs.value = modalProfissionaisConfigs.value.map((c) => {
      if (c.profissionalId !== profissionalId) return c
      const dirty = patch.dirty ?? true
      return { ...c, ...patch, dirty }
    })
  }

  function setModalProfissionalModo(profissionalId: number, modo: HorarioProfissionalModoConfig) {
    const loja = modalLojaHorario.value
    const patch: Partial<ProfissionalDiaHorarioConfig> = { modo, dirty: true }
    if (modo === 'loja' && loja?.ativo) {
      patch.horaInicio = horaParaExibicao(loja.horaInicio)
      patch.horaFim = horaParaExibicao(loja.horaFim)
    }
    updateModalProfissionalConfig(profissionalId, patch)
  }

  function updateModalProfissionalHorario(
    profissionalId: number,
    field: 'horaInicio' | 'horaFim',
    value: string,
  ) {
    updateModalProfissionalConfig(profissionalId, { [field]: value, dirty: true })
  }

  async function persistirConfigModal(config: ProfissionalDiaHorarioConfig, vincular: boolean) {
    if (!estabelecimentoId.value || !modalProfissionaisDia.value) return

    const dia = modalProfissionaisDia.value
    const estId = estabelecimentoId.value
    const { horaInicio, horaFim } = resolverHorariosModalConfig(config)
    const payload = {
      diaSemana: dia,
      horaInicio: horaParaApi(horaInicio),
      horaFim: horaParaApi(horaFim),
    }

    if (vincular) {
      if (config.horarioId) {
        const registro = horariosProfissionais.value.find((h) => h.id === config.horarioId)
        const timesChanged =
          !registro ||
          horaParaExibicao(registro.horaInicio) !== horaInicio ||
          horaParaExibicao(registro.horaFim) !== horaFim

        if (timesChanged) {
          const atualizado = await horarioService.atualizarProfissional(
            estId,
            config.horarioId,
            payload,
          )
          horariosProfissionais.value = horariosProfissionais.value.map((h) =>
            h.id === config.horarioId ? atualizado : h,
          )
        }

        const registroAtual = horariosProfissionais.value.find((h) => h.id === config.horarioId)
        if (registroAtual && !registroAtual.ativo) {
          const ativado = await horarioService.alterarStatusProfissional(
            estId,
            config.horarioId,
            true,
          )
          horariosProfissionais.value = horariosProfissionais.value.map((h) =>
            h.id === config.horarioId ? ativado : h,
          )
        }
      } else {
        const criado = await horarioService.criarProfissional(estId, config.profissionalId, payload)
        horariosProfissionais.value = [...horariosProfissionais.value, criado]
      }
    } else if (config.horarioId) {
      const registro = horariosProfissionais.value.find((h) => h.id === config.horarioId)
      if (registro?.ativo) {
        const desativado = await horarioService.alterarStatusProfissional(
          estId,
          config.horarioId,
          false,
        )
        horariosProfissionais.value = horariosProfissionais.value.map((h) =>
          h.id === config.horarioId ? desativado : h,
        )
      }
    }

    sincronizarConfigModalAposPersistencia(config.profissionalId)
  }

  function sincronizarConfigModalAposPersistencia(profissionalId: number) {
    if (!modalProfissionaisDia.value) return
    const dia = modalProfissionaisDia.value
    const loja = horariosPorDiaLoja.value.get(dia) ?? null
    const lojaAtiva = loja?.ativo === true
    const prof = listaProfissionaisHorario.value.find((p) => p.profissionalId === profissionalId)
    if (!prof) return

    const existente =
      horariosProfissionais.value.find(
        (h) => h.profissionalId === profissionalId && h.diaSemana === dia,
      ) ?? null

    updateModalProfissionalConfig(profissionalId, {
      selecionado: existente?.ativo ?? false,
      horarioId: existente?.id ?? null,
      modo: existente
        ? resolverModoHorarioProfissional(existente, lojaAtiva ? loja : null)
        : lojaAtiva
          ? 'loja'
          : 'personalizado',
      horaInicio: existente
        ? horaParaExibicao(existente.horaInicio)
        : lojaAtiva
          ? horaParaExibicao(loja!.horaInicio)
          : draftDiaLoja(dia).horaInicio,
      horaFim: existente
        ? horaParaExibicao(existente.horaFim)
        : lojaAtiva
          ? horaParaExibicao(loja!.horaFim)
          : draftDiaLoja(dia).horaFim,
      dirty: false,
    })
  }

  async function salvarModalProfissional(profissionalId: number) {
    if (!estabelecimentoId.value || !modalProfissionaisDia.value || !podeGerenciarLoja.value) return

    const config = modalProfissionaisConfigs.value.find((c) => c.profissionalId === profissionalId)
    if (!config) return

    const erro = validarConfigModal(config)
    if (erro) {
      modalProfissionaisErro.value = `${config.nomePublico}: ${erro}`
      return
    }

    modalProfissionaisActionId.value = profissionalId
    modalProfissionaisErro.value = null

    try {
      await persistirConfigModal(config, true)
      notifications.push('success', `Horário de ${config.nomePublico} salvo.`)
    } catch (err) {
      modalProfissionaisErro.value = resolveError(err, 'Não foi possível salvar o horário.')
    } finally {
      modalProfissionaisActionId.value = null
    }
  }

  async function vincularModalProfissional(profissionalId: number) {
    if (!estabelecimentoId.value || !modalProfissionaisDia.value || !podeGerenciarLoja.value) return

    const config = modalProfissionaisConfigs.value.find((c) => c.profissionalId === profissionalId)
    if (!config) return

    updateModalProfissionalConfig(profissionalId, { selecionado: true })
    const configAtualizada = modalProfissionaisConfigs.value.find(
      (c) => c.profissionalId === profissionalId,
    )
    if (!configAtualizada) return

    const erro = validarConfigModal(configAtualizada)
    if (erro) {
      updateModalProfissionalConfig(profissionalId, { selecionado: false, dirty: false })
      modalProfissionaisErro.value = `${configAtualizada.nomePublico}: ${erro}`
      return
    }

    modalProfissionaisActionId.value = profissionalId
    modalProfissionaisErro.value = null

    try {
      await persistirConfigModal(configAtualizada, true)
      notifications.push('success', `${configAtualizada.nomePublico} vinculado ao dia.`)
    } catch (err) {
      updateModalProfissionalConfig(profissionalId, { selecionado: false, dirty: false })
      modalProfissionaisErro.value = resolveError(err, 'Não foi possível vincular o profissional.')
    } finally {
      modalProfissionaisActionId.value = null
    }
  }

  async function removerModalProfissional(profissionalId: number) {
    if (!estabelecimentoId.value || !modalProfissionaisDia.value || !podeGerenciarLoja.value) return

    const config = modalProfissionaisConfigs.value.find((c) => c.profissionalId === profissionalId)
    if (!config?.horarioId) return

    modalProfissionaisActionId.value = profissionalId
    modalProfissionaisErro.value = null

    try {
      await persistirConfigModal(config, false)
      notifications.push('success', `${config.nomePublico} removido deste dia.`)
    } catch (err) {
      modalProfissionaisErro.value = resolveError(err, 'Não foi possível remover o profissional.')
    } finally {
      modalProfissionaisActionId.value = null
    }
  }

  async function load() {
    if (!estabelecimentoId.value) return
    loading.value = true
    try {
      const tarefas: Promise<void>[] = []

      if (podeGerenciarLoja.value || apenasHorarioProprio.value) {
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
          .map((p) => ({
            profissionalId: p.profissionalId,
            nomePublico: p.nomePublico,
            avatarUrl: p.logo || null,
          }))
      }

      editingDiasLoja.value = new Set()
      editingDiasProprio.value = new Set()
      draftsLoja.value = {}
      draftsProprio.value = {}
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

  async function salvarDiaProprio(dia: DiaSemanaValue) {
    if (!estabelecimentoId.value || !profissionalProprioId.value || !apenasHorarioProprio.value) {
      return
    }

    const draft = draftDiaProprio(dia)
    const intervaloErro = validarIntervaloHorario(draft.horaInicio, draft.horaFim)
    if (intervaloErro) {
      notifications.push('error', intervaloErro)
      return
    }

    savingDiaProprio.value = dia
    try {
      const payload = {
        diaSemana: dia,
        horaInicio: horaParaApi(draft.horaInicio),
        horaFim: horaParaApi(draft.horaFim),
      }
      const existente = horariosPorDiaProprio.value.get(dia)
      if (existente) {
        const atualizado = await horarioService.atualizarProfissional(
          estabelecimentoId.value,
          existente.id,
          payload,
        )
        horariosProfissionais.value = horariosProfissionais.value.map((h) =>
          h.id === existente.id ? atualizado : h,
        )
        notifications.push('success', 'Horário atualizado.')
      } else {
        const criado = await horarioService.criarProfissional(
          estabelecimentoId.value,
          profissionalProprioId.value,
          payload,
        )
        horariosProfissionais.value = [...horariosProfissionais.value, criado]
        notifications.push('success', 'Horário salvo.')
      }
      cancelarEdicaoDiaProprio(dia)
    } catch (err) {
      notifications.push('error', resolveError(err, 'Não foi possível salvar o horário.'))
    } finally {
      savingDiaProprio.value = null
    }
  }

  async function alterarStatusDiaProprio(dia: DiaSemanaValue, ativo: boolean) {
    if (!estabelecimentoId.value || !profissionalProprioId.value || !apenasHorarioProprio.value) {
      return
    }

    savingDiaProprio.value = dia
    try {
      let horario = horariosPorDiaProprio.value.get(dia)
      if (!horario) {
        const draft = draftDiaProprio(dia)
        horario = await horarioService.criarProfissional(
          estabelecimentoId.value,
          profissionalProprioId.value,
          {
            diaSemana: dia,
            horaInicio: horaParaApi(draft.horaInicio),
            horaFim: horaParaApi(draft.horaFim),
          },
        )
        horariosProfissionais.value = [...horariosProfissionais.value, horario]
      }

      const atualizado = await horarioService.alterarStatusProfissional(
        estabelecimentoId.value,
        horario.id,
        ativo,
      )
      horariosProfissionais.value = horariosProfissionais.value.map((h) =>
        h.id === horario!.id ? atualizado : h,
      )
      notifications.push('success', ativo ? 'Horário ativado.' : 'Horário desativado.')
      cancelarEdicaoDiaProprio(dia)
    } catch (err) {
      notifications.push('error', resolveError(err))
    } finally {
      savingDiaProprio.value = null
    }
  }

  watch(
    ready,
    (isReady) => {
      if (!isReady) return
      void load()
    },
    { immediate: true },
  )

  return {
    DIAS_SEMANA,
    loading,
    savingDia,
    savingDiaProprio,
    horariosLoja,
    horariosProfissionais,
    horariosPorDiaLoja,
    horariosPorDiaProprio,
    listaProfissionaisHorario,
    podeGerenciarLoja,
    podeGerenciarProfissional,
    apenasHorarioProprio,
    exibeAbaProfissional,
    temModuloProfissionais,
    usaProfissionaisVitrine,
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
    modalProfissionaisConfigs,
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
    load,
  }
}
