<script setup lang="ts">
import { computed, toRef } from 'vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import TelefoneInput from '@/components/ui/TelefoneInput.vue'
import AuthPasswordRules from '@/components/auth/recovery/AuthPasswordRules.vue'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import { ROLES_CADASTRO_EQUIPE } from '@/constants/establishmentRoles'
import {
  useEquipeAdicionarForm,
  type ModoCadastro,
} from '@/composables/useEquipeAdicionarForm'
import type { EstablishmentUserRole } from '@/types/negocio/equipe.types'

const props = withDefaults(
  defineProps<{
    modo: ModoCadastro
    initialRole?: EstablishmentUserRole
    navigateOnVinculo?: boolean
    embedded?: boolean
  }>(),
  {
    navigateOnVinculo: false,
    embedded: false,
  },
)

const emit = defineEmits<{
  cancel: []
  vinculado: []
}>()

const {
  nome,
  email,
  telefone,
  senha,
  confirmarSenha,
  nomePublico,
  role,
  podeReceberAgendamento,
  fotoPreview,
  fotoError,
  saving,
  sucessoDetalhe,
  linkConvite,
  formError,
  emailError,
  nomeError,
  telefoneError,
  senhaError,
  confirmarSenhaError,
  ehProfissional,
  submitLabel,
  resetForm,
  onFotoChange,
  onFotoError,
  limparFoto,
  copiarLink,
  handleSubmit,
} = useEquipeAdicionarForm({
  modo: toRef(props, 'modo'),
  initialRole: props.initialRole,
  navigateOnVinculo: props.navigateOnVinculo,
  onVinculado: () => emit('vinculado'),
})

const roleHint = computed(
  () => ROLES_CADASTRO_EQUIPE.find((r) => r.value === role.value)?.description,
)

defineExpose({ resetForm })
</script>

<template>
  <div :class="embedded ? 'flex min-h-0 flex-1 flex-col' : 'space-y-4'">
    <div v-if="linkConvite" class="equipe-modal__body">
      <div class="equipe-link-success">
        <p class="equipe-link-success__title">Link pronto!</p>
        <p class="equipe-link-success__text">
          Envie o link abaixo para o usuário para que ele possa aceitar. Lembre-se de abrir o link
          em outra aba do navegador.
        </p>
        <p class="equipe-link-success__text">
          Também é possível que o usuário aceite o convite pelo e-mail; o destino é o mesmo.
        </p>
        <div class="equipe-link-success__url-box">
          <p class="equipe-link-success__url">{{ linkConvite }}</p>
          <button type="button" class="equipe-modal__confirm equipe-modal__confirm--copy" @click="copiarLink">
            Copiar link
          </button>
        </div>
        <p v-if="sucessoDetalhe" class="equipe-form-field__hint">{{ sucessoDetalhe }}</p>
      </div>
    </div>

    <form
      v-else
      :class="embedded ? 'flex min-h-0 flex-1 flex-col' : ''"
      @submit.prevent="handleSubmit"
    >
      <div :class="embedded ? 'equipe-modal__body space-y-6' : 'space-y-6'">
        <ContentAlert v-if="formError" variant="error" compact>
          {{ formError }}
        </ContentAlert>

        <template v-if="modo === 'convite'">
          <div class="equipe-form-field">
            <label class="equipe-form-label" for="equipe-convite-email">E-mail</label>
            <input
              id="equipe-convite-email"
              v-model="email"
              type="email"
              class="equipe-form-input"
              :class="{ 'border-red-500': !!emailError }"
              placeholder="Ex: usuário@exemplo.com"
              required
            />
            <p v-if="emailError" class="equipe-form-field__error">{{ emailError }}</p>
          </div>

          <div class="equipe-form-field">
            <label class="equipe-form-label" for="equipe-convite-role">Cargo do usuário</label>
            <select
              id="equipe-convite-role"
              v-model="role"
              class="equipe-form-select"
              required
            >
              <option v-for="opt in ROLES_CADASTRO_EQUIPE" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
            <p v-if="roleHint" class="equipe-form-field__hint">{{ roleHint }}</p>
          </div>

          <template v-if="ehProfissional">
            <div class="equipe-form-field">
              <label class="equipe-form-label" for="equipe-convite-nome-publico">Nome público</label>
              <input
                id="equipe-convite-nome-publico"
                v-model="nomePublico"
                type="text"
                class="equipe-form-input"
                placeholder="Como aparecerá para os clientes"
              />
            </div>
            <label class="flex cursor-pointer items-center gap-3 font-urbanist text-sm text-glow-text">
              <input
                v-model="podeReceberAgendamento"
                type="checkbox"
                class="size-3.5 rounded border border-glow-border-soft text-glow-gold focus:ring-glow-gold"
              />
              Pode receber horários de clientes
            </label>
          </template>
        </template>

        <template v-else>
          <div class="space-y-4">
            <p class="equipe-form-section-title">Dados</p>
            <div class="equipe-form-panel__row">
              <div class="equipe-form-field">
                <label class="equipe-form-label" for="equipe-criar-nome">Nome completo</label>
                <input
                  id="equipe-criar-nome"
                  v-model="nome"
                  type="text"
                  class="equipe-form-input"
                  :class="{ 'border-red-500': !!nomeError }"
                  placeholder="Ex: Maria Silva"
                  required
                />
                <p v-if="nomeError" class="equipe-form-field__error">{{ nomeError }}</p>
              </div>
              <div class="equipe-form-field">
                <label class="equipe-form-label" for="equipe-criar-email">E-mail</label>
                <input
                  id="equipe-criar-email"
                  v-model="email"
                  type="email"
                  class="equipe-form-input"
                  :class="{ 'border-red-500': !!emailError }"
                  placeholder="Ex: usuário@exemplo.com"
                  required
                />
                <p v-if="emailError" class="equipe-form-field__error">{{ emailError }}</p>
              </div>
            </div>
            <div class="equipe-form-field w-full sm:max-w-[calc(50%-0.5rem)]">
              <TelefoneInput
                v-model="telefone"
                label="Telefone"
                required
                :error="telefoneError"
              />
            </div>
          </div>

          <div class="space-y-4 border-t border-glow-border-soft pt-6">
            <p class="equipe-form-section-title">Senha de entrada</p>
            <div class="equipe-form-panel__row">
              <div class="equipe-form-field">
                <label class="equipe-form-label" for="equipe-criar-senha">Senha</label>
                <input
                  id="equipe-criar-senha"
                  v-model="senha"
                  type="password"
                  class="equipe-form-input"
                  :class="{ 'border-red-500': !!senhaError }"
                  autocomplete="new-password"
                  required
                />
                <p v-if="senhaError" class="equipe-form-field__error">{{ senhaError }}</p>
              </div>
              <div class="equipe-form-field">
                <label class="equipe-form-label" for="equipe-criar-confirmar">Confirmar senha</label>
                <input
                  id="equipe-criar-confirmar"
                  v-model="confirmarSenha"
                  type="password"
                  class="equipe-form-input"
                  :class="{ 'border-red-500': !!confirmarSenhaError }"
                  autocomplete="new-password"
                  required
                />
                <p v-if="confirmarSenhaError" class="equipe-form-field__error">
                  {{ confirmarSenhaError }}
                </p>
              </div>
            </div>
            <AuthPasswordRules :password="senha" />
          </div>

          <div class="space-y-4 border-t border-glow-border-soft pt-6">
            <div class="equipe-form-field">
              <label class="equipe-form-label" for="equipe-criar-role">Cargo do usuário</label>
              <select id="equipe-criar-role" v-model="role" class="equipe-form-select" required>
                <option v-for="opt in ROLES_CADASTRO_EQUIPE" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
              <p v-if="roleHint" class="equipe-form-field__hint">{{ roleHint }}</p>
            </div>

            <template v-if="ehProfissional">
              <div class="equipe-form-field">
                <label class="equipe-form-label" for="equipe-criar-nome-publico">Nome público</label>
                <input
                  id="equipe-criar-nome-publico"
                  v-model="nomePublico"
                  type="text"
                  class="equipe-form-input"
                  placeholder="Como aparecerá para os clientes"
                />
              </div>

              <div class="equipe-form-field space-y-3">
                <AuthAvatarUpload
                  label="Foto do profissional"
                  @change="onFotoChange"
                  @error="onFotoError"
                />
                <p class="equipe-form-field__hint">
                  Imagem de apresentação aos clientes. Independente do avatar da conta de acesso.
                  Opcional — sem foto, usamos um avatar padrão.
                </p>
                <div v-if="fotoPreview" class="flex items-center gap-3">
                  <UserAvatar :src="fotoPreview" :name="nomePublico || nome" size="lg" />
                  <button
                    type="button"
                    class="font-urbanist text-xs font-semibold text-glow-text-subtle hover:text-glow-text"
                    @click="limparFoto"
                  >
                    Remover foto
                  </button>
                </div>
                <p v-if="fotoError" class="equipe-form-field__error">{{ fotoError }}</p>
              </div>

              <label class="flex cursor-pointer items-center gap-3 font-urbanist text-sm text-glow-text">
                <input
                  v-model="podeReceberAgendamento"
                  type="checkbox"
                  class="size-3.5 rounded border border-glow-border-soft text-glow-gold focus:ring-glow-gold"
                />
                Pode receber horários de clientes
              </label>
            </template>
          </div>
        </template>
      </div>

      <div v-if="embedded" class="equipe-modal__footer">
        <button type="button" class="equipe-modal__dismiss" @click="emit('cancel')">
          Cancelar
        </button>
        <button type="submit" class="equipe-modal__confirm" :disabled="saving">
          {{ saving ? 'Salvando…' : submitLabel }}
        </button>
      </div>

      <div v-else class="equipe-form-actions-inline border-t border-glow-border-soft pt-4">
        <button type="button" class="equipe-modal__dismiss" @click="emit('cancel')">
          Cancelar
        </button>
        <button type="submit" class="equipe-modal__confirm" :disabled="saving">
          {{ saving ? 'Salvando…' : submitLabel }}
        </button>
      </div>
    </form>

    <div v-if="linkConvite && embedded" class="equipe-modal__footer">
      <button type="button" class="equipe-modal__dismiss w-full max-w-none" @click="emit('cancel')">
        Fechar
      </button>
    </div>
  </div>
</template>
