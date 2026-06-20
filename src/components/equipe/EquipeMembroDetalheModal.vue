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
import { equipeService } from '@/services/equipeService'
import type { EstablishmentUserRole, MembroEquipeItem } from '@/types/negocio/equipe.types'
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
const formError = ref<string | null>(null)

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
  open.value = false
}

watch(
  () => props.membro,
  () => syncForm(),
  { immediate: true },
)

watch(open, (isOpen) => {
  if (isOpen) syncForm()
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
            </div>

            <div class="equipe-modal__footer">
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
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
