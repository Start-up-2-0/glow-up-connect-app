<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import EquipeIcons from '@/components/equipe/EquipeIcons.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { ROLES_CADASTRO_EQUIPE } from '@/constants/establishmentRoles'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { conviteService } from '@/services/conviteService'
import type { EstablishmentUserRole } from '@/types/negocio/equipe.types'
import type { UnidadeDuracaoConvite } from '@/types/convite.types'

const open = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  criado: []
}>()

const { estabelecimentoId } = useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const role = ref<EstablishmentUserRole>('Receptionist')
const limiteUsuarios = ref('1')
const duracaoValor = ref(1)
const duracaoUnidade = ref<UnidadeDuracaoConvite>('Dias')
const usarPadraoDuracao = ref(true)
const saving = ref(false)
const formError = ref<string | null>(null)
const linkGerado = ref<string | null>(null)
const copiado = ref(false)

const roleOptions = ROLES_CADASTRO_EQUIPE.map((r) => ({
  value: r.value,
  label: r.label,
}))

const limiteOptions = [
  { value: '1', label: '1 usuário' },
  { value: '2', label: '2 usuários' },
  { value: '5', label: '5 usuários' },
  { value: '10', label: '10 usuários' },
]

const unidadeOptions = [
  { value: 'Minutos', label: 'Minutos' },
  { value: 'Horas', label: 'Horas' },
  { value: 'Dias', label: 'Dias' },
]

const roleDescricao = computed(
  () => ROLES_CADASTRO_EQUIPE.find((r) => r.value === role.value)?.description ?? '',
)

function resetForm() {
  role.value = 'Receptionist'
  limiteUsuarios.value = '1'
  duracaoValor.value = 1
  duracaoUnidade.value = 'Dias'
  usarPadraoDuracao.value = true
  saving.value = false
  formError.value = null
  linkGerado.value = null
  copiado.value = false
}

function close() {
  open.value = false
}

async function copiarLink() {
  if (!linkGerado.value) return
  try {
    await navigator.clipboard.writeText(linkGerado.value)
    copiado.value = true
    notifications.push('success', 'Link copiado.')
  } catch {
    notifications.push('error', 'Não foi possível copiar o link.')
  }
}

async function submit() {
  if (!estabelecimentoId.value) return
  saving.value = true
  formError.value = null
  try {
    const criado = await conviteService.criarLink(estabelecimentoId.value, {
      role: role.value,
      limiteUsuarios: Number(limiteUsuarios.value),
      duracaoValor: usarPadraoDuracao.value ? null : duracaoValor.value,
      duracaoUnidade: usarPadraoDuracao.value ? null : duracaoUnidade.value,
      podeReceberAgendamento: role.value === 'Profissional',
    })
    linkGerado.value = criado.linkConvite
    notifications.push('success', 'Link de convite criado.')
    emit('criado')
  } catch (err) {
    formError.value = resolveError(err, 'Não foi possível criar o link.')
  } finally {
    saving.value = false
  }
}

watch(open, (isOpen) => {
  if (!isOpen) resetForm()
})

defineExpose({ resetForm })
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="equipe-modal-overlay" @click.self="close">
        <div class="equipe-modal" role="dialog" aria-modal="true" aria-labelledby="equipe-criar-link-title">
          <div class="equipe-modal__header">
            <div class="equipe-modal__header-top">
              <h2 id="equipe-criar-link-title" class="equipe-modal__title">
                Gerar link de convite
              </h2>
              <button type="button" class="equipe-modal__close-icon" aria-label="Fechar" @click="close">
                <EquipeIcons name="close" />
              </button>
            </div>
            <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
              Defina a função, o limite de pessoas e a validade. Compartilhe o link gerado.
            </p>
          </div>

          <div class="equipe-modal__body space-y-4">
            <template v-if="!linkGerado">
              <BaseSelect
                v-model="role"
                label="Função na loja"
                :options="roleOptions"
              />
              <p class="font-urbanist text-xs text-glow-text-subtle">{{ roleDescricao }}</p>

              <BaseSelect
                v-model="limiteUsuarios"
                label="Quantidade máxima de usuários"
                :options="limiteOptions"
              />

              <label class="flex items-center gap-2 font-urbanist text-sm text-glow-text">
                <input v-model="usarPadraoDuracao" type="checkbox" class="rounded border-glow-border" />
                Usar validade padrão (1 dia)
              </label>

              <div v-if="!usarPadraoDuracao" class="grid grid-cols-2 gap-3">
                <div>
                  <label class="mb-1 block font-urbanist text-sm text-glow-text">Duração</label>
                  <input
                    v-model.number="duracaoValor"
                    type="number"
                    min="1"
                    class="w-full rounded-xl border border-glow-border bg-glow-surface px-3 py-2 font-urbanist text-sm"
                  />
                </div>
                <BaseSelect
                  v-model="duracaoUnidade"
                  label="Unidade"
                  :options="unidadeOptions"
                />
              </div>

              <p v-if="formError" class="font-urbanist text-sm text-red-600">{{ formError }}</p>

              <div class="flex justify-end gap-2 pt-2">
                <BaseButton variant="secondary" type="button" @click="close">Cancelar</BaseButton>
                <BaseButton type="button" :loading="saving" @click="submit">
                  Gerar link
                </BaseButton>
              </div>
            </template>

            <template v-else>
              <p class="font-urbanist text-sm text-glow-text">
                Link pronto para compartilhar. Ele abre na página pública do Glow Up Connect.
              </p>
              <div class="rounded-xl border border-glow-border bg-glow-bg-subtle p-3">
                <p class="break-all font-mono text-xs text-glow-text">{{ linkGerado }}</p>
              </div>
              <div class="flex flex-wrap justify-end gap-2 pt-2">
                <BaseButton variant="secondary" type="button" @click="copiarLink">
                  {{ copiado ? 'Copiado' : 'Copiar link' }}
                </BaseButton>
                <BaseButton type="button" @click="close">Concluir</BaseButton>
              </div>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
