<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import EquipeIcons from '@/components/equipe/EquipeIcons.vue'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import {
  ROLES_EDITAVEIS_EQUIPE,
  establishmentRoleLabel,
} from '@/constants/establishmentRoles'
import {
  EQUIPE_REMOVER_AGENDAMENTOS_DESCRICAO,
  EQUIPE_REMOVER_AGENDAMENTOS_TITULO,
  EQUIPE_REMOVER_ATUALIZAR_LISTA,
  EQUIPE_REMOVER_CANCELAR_APENAS,
  EQUIPE_REMOVER_CANCELAR_E_REMOVER,
  EQUIPE_REMOVER_DESCRICAO,
  EQUIPE_REMOVER_IMPACTOS,
  EQUIPE_REMOVER_MOTIVO_LABEL,
  EQUIPE_REMOVER_MOTIVO_PLACEHOLDER,
  EQUIPE_REMOVER_TITULO,
} from '@/constants/equipeRemoverMembro'
import { agendaDetalhePath } from '@/constants/routes'
import { equipeService } from '@/services/equipeService'
import type { AgendamentoFuturoEquipe, EstablishmentUserRole, MembroEquipeItem } from '@/types/negocio/equipe.types'
import { formatDateTime } from '@/utils/formatters'
import { iniciaisNome } from '@/utils/servicoFormatters'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
  membro: MembroEquipeItem | null
  estabelecimentoId: number | null
  podeGerenciarEquipe: boolean
  podeGerenciarProfissional: boolean
  usuarioAtualId: number | null
}>()

const emit = defineEmits<{
  atualizado: []
}>()

const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const role = ref<EstablishmentUserRole>('Receptionist')
const ativo = ref(true)
const podeReceberAgendamento = ref(true)
const saving = ref(false)
const removendo = ref(false)
const cancelandoAgendamentos = ref(false)
const carregandoAgendamentos = ref(false)
const confirmarRemocaoAberto = ref(false)
const formError = ref<string | null>(null)
const agendamentosFuturos = ref<AgendamentoFuturoEquipe[]>([])
const motivoCancelamento = ref('')

const ehUsuario = computed(() => props.membro?.tipo === 'usuario')
const ehProfissional = computed(() => props.membro?.tipo === 'profissional')
const ehDono = computed(() => props.membro?.role === 'Owner')
const ehProprioUsuario = computed(
  () =>
    props.membro != null &&
    props.usuarioAtualId != null &&
    props.membro.usuarioId === props.usuarioAtualId,
)

const podeEditar = computed(() => {
  if (!props.membro) return false
  if (ehUsuario.value) return props.podeGerenciarEquipe
  return props.podeGerenciarProfissional
})

const podeEditarRole = computed(
  () => podeEditar.value && ehUsuario.value && !ehDono.value && !ehProprioUsuario.value,
)

const podeEditarStatus = computed(
  () => podeEditar.value && !ehProprioUsuario.value,
)

const podeRemover = computed(() => {
  if (!props.membro || ehProprioUsuario.value || ehDono.value) return false
  const temUsuario = props.membro.tipo === 'usuario' && props.podeGerenciarEquipe
  const temProfissional =
    props.membro.profissionalId != null && props.podeGerenciarProfissional
  return temUsuario || temProfissional
})

const desvincularUsuario = computed(
  () => props.membro?.tipo === 'usuario' && props.podeGerenciarEquipe,
)

const desvincularProfissional = computed(
  () => props.membro?.profissionalId != null && props.podeGerenciarProfissional,
)

const temAgendamentosFuturos = computed(() => agendamentosFuturos.value.length > 0)

const motivoCancelamentoValido = computed(
  () => motivoCancelamento.value.trim().length >= 3,
)

const roleHint = computed(
  () => ROLES_EDITAVEIS_EQUIPE.find((r) => r.value === role.value)?.description,
)

const statusLabel = computed(() => (ativo.value ? 'Ativo' : 'Inativo'))

const dirty = computed(() => {
  if (!props.membro) return false
  if (ehUsuario.value) {
    const roleMudou =
      props.membro.role !== 'Profissional' && role.value !== props.membro.role
    return roleMudou || ativo.value !== props.membro.ativo
  }
  return (
    ativo.value !== props.membro.ativo ||
    podeReceberAgendamento.value !== (props.membro.podeReceberAgendamento ?? true)
  )
})

function syncForm() {
  const m = props.membro
  if (!m) return
  role.value =
    m.role === 'Profissional' ? 'Profissional' : (m.role as EstablishmentUserRole)
  ativo.value = m.ativo
  podeReceberAgendamento.value = m.podeReceberAgendamento ?? true
  formError.value = null
}

function close() {
  confirmarRemocaoAberto.value = false
  agendamentosFuturos.value = []
  motivoCancelamento.value = ''
  open.value = false
}

async function carregarAgendamentosFuturos() {
  if (!props.estabelecimentoId || props.membro?.profissionalId == null || !desvincularProfissional.value) {
    agendamentosFuturos.value = []
    return
  }

  carregandoAgendamentos.value = true
  formError.value = null

  try {
    agendamentosFuturos.value = await equipeService.listarAgendamentosFuturosProfissional(
      props.estabelecimentoId,
      props.membro.profissionalId,
    )
  } catch (err) {
    formError.value = resolveError(err, 'Não foi possível carregar os agendamentos futuros.')
    agendamentosFuturos.value = []
  } finally {
    carregandoAgendamentos.value = false
  }
}

async function abrirConfirmacaoRemocao() {
  confirmarRemocaoAberto.value = true
  formError.value = null
  motivoCancelamento.value = ''
  await carregarAgendamentosFuturos()
}

function cancelarConfirmacaoRemocao() {
  confirmarRemocaoAberto.value = false
  agendamentosFuturos.value = []
  motivoCancelamento.value = ''
}

async function atualizarListaAgendamentos() {
  await carregarAgendamentosFuturos()
}

async function cancelarAgendamentosEmLote() {
  if (
    !props.membro?.profissionalId ||
    !props.estabelecimentoId ||
    !motivoCancelamentoValido.value
  ) {
    formError.value = 'Informe o motivo do cancelamento (mínimo 3 caracteres).'
    return
  }

  cancelandoAgendamentos.value = true
  formError.value = null

  try {
    const resultado = await equipeService.cancelarAgendamentosFuturosProfissional(
      props.estabelecimentoId,
      props.membro.profissionalId,
      { motivo: motivoCancelamento.value.trim() },
    )

    notifications.push(
      'success',
      resultado.quantidadeCancelada > 0
        ? `${resultado.quantidadeCancelada} agendamento(s) cancelado(s).`
        : 'Nenhum agendamento futuro pendente.',
    )
    await carregarAgendamentosFuturos()
  } catch (err) {
    formError.value = resolveError(err, 'Não foi possível cancelar os agendamentos.')
  } finally {
    cancelandoAgendamentos.value = false
  }
}

async function removerDaEquipe() {
  if (!props.membro || !props.estabelecimentoId || !podeRemover.value) return

  if (temAgendamentosFuturos.value && desvincularProfissional.value && !motivoCancelamentoValido.value) {
    formError.value = 'Informe o motivo do cancelamento para remover com agendamentos futuros.'
    return
  }

  removendo.value = true
  formError.value = null

  try {
    await equipeService.desvincularMembro(props.estabelecimentoId, {
      usuarioId: props.membro.usuarioId,
      profissionalId: props.membro.profissionalId,
      desvincularUsuario: desvincularUsuario.value,
      desvincularProfissional: desvincularProfissional.value,
      cancelarAgendamentosFuturos:
        temAgendamentosFuturos.value && desvincularProfissional.value,
      motivoCancelamento: motivoCancelamento.value.trim() || undefined,
    })

    notifications.push('success', 'Membro removido da equipe.')
    emit('atualizado')
    close()
  } catch (err) {
    formError.value = resolveError(err, 'Não foi possível remover o membro da equipe.')
    if (desvincularProfissional.value) {
      await carregarAgendamentosFuturos()
    }
  } finally {
    removendo.value = false
  }
}

watch(
  () => props.membro,
  () => syncForm(),
  { immediate: true },
)

watch(open, (isOpen) => {
  if (isOpen) syncForm()
  else {
    confirmarRemocaoAberto.value = false
    agendamentosFuturos.value = []
    motivoCancelamento.value = ''
  }
})

async function salvar() {
  if (!props.membro || !props.estabelecimentoId || !dirty.value) return

  saving.value = true
  formError.value = null

  try {
    if (ehUsuario.value) {
      const promises: Promise<unknown>[] = []
      if (
        podeEditarRole.value &&
        props.membro.role !== 'Profissional' &&
        role.value !== props.membro.role
      ) {
        promises.push(
          equipeService.atualizarRoleUsuario(props.estabelecimentoId, props.membro.usuarioId, {
            role: role.value,
          }),
        )
      }
      if (podeEditarStatus.value && ativo.value !== props.membro.ativo) {
        promises.push(
          equipeService.atualizarStatusUsuario(props.estabelecimentoId, props.membro.usuarioId, {
            ativo: ativo.value,
          }),
        )
      }
      await Promise.all(promises)
    } else if (ehProfissional.value && props.membro.profissionalId != null) {
      await equipeService.atualizarStatusProfissional(
        props.estabelecimentoId,
        props.membro.profissionalId,
        {
          ativo: ativo.value,
          podeReceberAgendamento: podeReceberAgendamento.value,
        },
      )
    }

    notifications.push('success', 'Membro atualizado.')
    emit('atualizado')
    close()
  } catch (err) {
    formError.value = resolveError(err, 'Não foi possível salvar as alterações.')
  } finally {
    saving.value = false
  }
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
      <div v-if="open && membro" class="equipe-modal-overlay" @click.self="close">
        <Transition
          enter-active-class="equipe-modal-enter-active"
          leave-active-class="equipe-modal-leave-active"
          enter-from-class="equipe-modal-enter-from"
          leave-to-class="equipe-modal-leave-to"
        >
          <div
            v-if="open && membro"
            class="equipe-modal equipe-modal--detalhe"
            role="dialog"
            aria-modal="true"
            aria-labelledby="equipe-membro-detalhe-titulo"
          >
            <div class="equipe-modal__header">
              <div class="equipe-modal__header-top">
                <h2 id="equipe-membro-detalhe-titulo" class="equipe-modal__title">
                  Detalhes do membro
                </h2>
                <button
                  type="button"
                  class="equipe-modal__close-icon"
                  aria-label="Fechar"
                  @click="close"
                >
                  <EquipeIcons name="close" />
                </button>
              </div>
              <p class="equipe-modal__subtitle">
                Visualize e gerencie cargo, status e permissões na equipe.
              </p>
            </div>

            <div class="equipe-modal__body equipe-membro-detalhe">
              <div class="equipe-membro-detalhe__profile">
                <span class="equipe-member-card__avatar">{{ iniciaisNome(membro.nome) }}</span>
                <div class="min-w-0">
                  <p class="equipe-membro-detalhe__nome">{{ membro.nome }}</p>
                  <div class="equipe-membro-detalhe__badges">
                    <span class="equipe-member-card__role">{{ membro.cargo }}</span>
                    <span
                      v-if="!membro.ativo"
                      class="equipe-membro-detalhe__status-badge equipe-membro-detalhe__status-badge--inactive"
                    >
                      Inativo
                    </span>
                  </div>
                </div>
              </div>

              <dl class="equipe-membro-detalhe__meta">
                <div v-if="membro.email">
                  <dt>E-mail</dt>
                  <dd>{{ membro.email }}</dd>
                </div>
                <div v-if="membro.telefone">
                  <dt>Telefone</dt>
                  <dd>{{ membro.telefone }}</dd>
                </div>
              </dl>

              <ContentAlert v-if="formError" variant="error" compact>
                {{ formError }}
              </ContentAlert>

              <ContentAlert
                v-if="ehProprioUsuario"
                variant="info"
                compact
                title="Sua conta"
              >
                Você não pode alterar o próprio status ou cargo por aqui.
              </ContentAlert>

              <ContentAlert
                v-else-if="ehDono"
                variant="info"
                compact
                title="Dono do negócio"
              >
                O cargo de Dono não pode ser alterado. Para inativar, transfira a titularidade antes.
              </ContentAlert>

              <div v-if="podeEditar" class="equipe-membro-detalhe__form space-y-5">
                <div v-if="ehUsuario && podeEditarRole" class="equipe-form-field">
                  <label class="equipe-form-label" for="equipe-detalhe-role">Cargo do usuário</label>
                  <select
                    id="equipe-detalhe-role"
                    v-model="role"
                    class="equipe-form-select"
                    :disabled="saving"
                  >
                    <option
                      v-for="opcao in ROLES_EDITAVEIS_EQUIPE"
                      :key="opcao.value"
                      :value="opcao.value"
                    >
                      {{ opcao.label }}
                    </option>
                  </select>
                  <p v-if="roleHint" class="equipe-form-field__hint">{{ roleHint }}</p>
                </div>

                <div v-else-if="ehUsuario" class="equipe-form-field">
                  <span class="equipe-form-label">Cargo do usuário</span>
                  <p class="equipe-membro-detalhe__readonly">
                    {{ establishmentRoleLabel(membro.role) }}
                  </p>
                </div>

                <div v-if="podeEditarStatus" class="equipe-form-field">
                  <label class="equipe-form-label" for="equipe-detalhe-ativo">Status na equipe</label>
                  <select
                    id="equipe-detalhe-ativo"
                    v-model="ativo"
                    class="equipe-form-select"
                    :disabled="saving"
                  >
                    <option :value="true">Ativo</option>
                    <option :value="false">Inativo</option>
                  </select>
                  <p class="equipe-form-field__hint">
                    Membros inativos não acessam o negócio.
                  </p>
                </div>

                <div v-else class="equipe-form-field">
                  <span class="equipe-form-label">Status na equipe</span>
                  <p class="equipe-membro-detalhe__readonly">{{ statusLabel }}</p>
                </div>

                <div
                  v-if="ehProfissional && podeEditarStatus"
                  class="equipe-form-field"
                >
                  <label class="flex cursor-pointer items-center gap-3">
                    <input
                      v-model="podeReceberAgendamento"
                      type="checkbox"
                      class="size-4 rounded border-glow-border-soft text-glow-gold-cta focus:ring-glow-gold"
                      :disabled="saving || !ativo"
                    />
                    <span class="font-urbanist text-sm text-glow-text">
                      Pode receber agendamentos
                    </span>
                  </label>
                  <p class="equipe-form-field__hint">
                    Desative para impedir novos agendamentos com este profissional.
                  </p>
                </div>
              </div>

              <div v-if="podeRemover && !confirmarRemocaoAberto" class="equipe-membro-detalhe__danger">
                <p class="equipe-membro-detalhe__danger-title">{{ EQUIPE_REMOVER_TITULO }}</p>
                <p class="equipe-membro-detalhe__danger-text">{{ EQUIPE_REMOVER_DESCRICAO }}</p>
                <button
                  type="button"
                  class="equipe-btn-danger"
                  :disabled="saving || removendo"
                  @click="abrirConfirmacaoRemocao"
                >
                  Remover da equipe
                </button>
              </div>

              <div v-if="confirmarRemocaoAberto" class="equipe-remover-confirm">
                <p class="equipe-remover-confirm__title">
                  Remover {{ membro.nome }} da equipe?
                </p>
                <ul class="equipe-remover-confirm__list">
                  <li v-for="(impacto, index) in EQUIPE_REMOVER_IMPACTOS" :key="index">
                    {{ impacto }}
                  </li>
                </ul>

                <div v-if="carregandoAgendamentos" class="equipe-remover-confirm__loading">
                  Verificando agendamentos futuros…
                </div>

                <div
                  v-else-if="temAgendamentosFuturos"
                  class="equipe-remover-agendamentos"
                >
                  <p class="equipe-remover-agendamentos__title">
                    {{ EQUIPE_REMOVER_AGENDAMENTOS_TITULO }}
                  </p>
                  <p class="equipe-remover-agendamentos__text">
                    {{ EQUIPE_REMOVER_AGENDAMENTOS_DESCRICAO }}
                  </p>

                  <ul class="equipe-remover-agendamentos__list">
                    <li
                      v-for="agendamento in agendamentosFuturos"
                      :key="agendamento.agendamentoItemId"
                      class="equipe-remover-agendamentos__item"
                    >
                      <div class="equipe-remover-agendamentos__item-main">
                        <span class="equipe-remover-agendamentos__cliente">
                          {{ agendamento.clienteNome }}
                        </span>
                        <span class="equipe-remover-agendamentos__servico">
                          {{ agendamento.servicoNome }}
                        </span>
                        <span class="equipe-remover-agendamentos__horario">
                          {{ formatDateTime(agendamento.inicio) }}
                        </span>
                      </div>
                      <RouterLink
                        :to="agendaDetalhePath(agendamento.agendamentoId)"
                        class="equipe-remover-agendamentos__link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Reagendar
                      </RouterLink>
                    </li>
                  </ul>

                  <div class="equipe-form-field">
                    <label class="equipe-form-label" for="equipe-remover-motivo">
                      {{ EQUIPE_REMOVER_MOTIVO_LABEL }}
                    </label>
                    <textarea
                      id="equipe-remover-motivo"
                      v-model="motivoCancelamento"
                      class="equipe-form-textarea"
                      rows="2"
                      :placeholder="EQUIPE_REMOVER_MOTIVO_PLACEHOLDER"
                      :disabled="removendo || cancelandoAgendamentos"
                    />
                  </div>

                  <div class="equipe-remover-agendamentos__actions">
                    <button
                      type="button"
                      class="equipe-modal__dismiss"
                      :disabled="removendo || cancelandoAgendamentos"
                      @click="atualizarListaAgendamentos"
                    >
                      {{ EQUIPE_REMOVER_ATUALIZAR_LISTA }}
                    </button>
                    <button
                      type="button"
                      class="equipe-btn-danger equipe-btn-danger--outline"
                      :disabled="removendo || cancelandoAgendamentos || !motivoCancelamentoValido"
                      @click="cancelarAgendamentosEmLote"
                    >
                      {{
                        cancelandoAgendamentos
                          ? 'Cancelando…'
                          : EQUIPE_REMOVER_CANCELAR_APENAS
                      }}
                    </button>
                  </div>
                </div>

                <div class="equipe-remover-confirm__actions">
                  <button
                    type="button"
                    class="equipe-modal__dismiss"
                    :disabled="removendo || cancelandoAgendamentos"
                    @click="cancelarConfirmacaoRemocao"
                  >
                    Cancelar
                  </button>
                  <button
                    v-if="!temAgendamentosFuturos || !desvincularProfissional"
                    type="button"
                    class="equipe-btn-danger"
                    :disabled="removendo || cancelandoAgendamentos || carregandoAgendamentos"
                    @click="removerDaEquipe"
                  >
                    {{ removendo ? 'Removendo…' : 'Confirmar remoção' }}
                  </button>
                  <button
                    v-else
                    type="button"
                    class="equipe-btn-danger"
                    :disabled="
                      removendo ||
                      cancelandoAgendamentos ||
                      carregandoAgendamentos ||
                      !motivoCancelamentoValido
                    "
                    @click="removerDaEquipe"
                  >
                    {{
                      removendo ? 'Removendo…' : EQUIPE_REMOVER_CANCELAR_E_REMOVER
                    }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="!confirmarRemocaoAberto" class="equipe-modal__footer">
              <button
                type="button"
                class="equipe-modal__dismiss"
                :disabled="saving"
                @click="close"
              >
                {{ podeEditar && dirty ? 'Cancelar' : 'Fechar' }}
              </button>
              <button
                v-if="podeEditar"
                type="button"
                class="equipe-modal__confirm"
                :disabled="saving || !dirty"
                @click="salvar"
              >
                {{ saving ? 'Salvando…' : 'Salvar alterações' }}
              </button>
            </div>

            <div v-else class="equipe-modal__footer">
              <button
                type="button"
                class="equipe-modal__dismiss w-full max-w-none"
                :disabled="removendo || cancelandoAgendamentos"
                @click="cancelarConfirmacaoRemocao"
              >
                Voltar
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
