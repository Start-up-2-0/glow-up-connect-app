<script setup lang="ts">
import { computed, toRef } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import TelefoneInput from '@/components/ui/TelefoneInput.vue'
import AuthPasswordRules from '@/components/auth/recovery/AuthPasswordRules.vue'
import { equipeAdicionarAcao } from '@/constants/equipeAdicionarAcoes'
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
    showCancel?: boolean
  }>(),
  {
    showCancel: true,
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
  copiarLink,
  handleSubmit,
} = useEquipeAdicionarForm({
  modo: toRef(props, 'modo'),
  initialRole: props.initialRole,
  navigateOnVinculo: props.navigateOnVinculo,
  onVinculado: () => emit('vinculado'),
})

const roleOptions = ROLES_CADASTRO_EQUIPE.map((r) => ({
  value: r.value,
  label: r.label,
}))

const roleHint = computed(
  () => ROLES_CADASTRO_EQUIPE.find((r) => r.value === role.value)?.description,
)

const modoHint = computed(() => {
  const acao = equipeAdicionarAcao(props.modo)
  return {
    title: acao.titulo,
    text: acao.instrucao,
  }
})

defineExpose({ resetForm })
</script>

<template>
  <div class="space-y-4">
    <BaseAlert
      v-if="linkConvite && sucessoDetalhe"
      variant="success"
      title="Link pronto!"
    >
      {{ sucessoDetalhe }}
    </BaseAlert>
    <BaseAlert
      v-else-if="sucessoDetalhe && !linkConvite"
      variant="success"
    >
      {{ sucessoDetalhe }}
    </BaseAlert>
    <BaseAlert
      v-else
      variant="info"
      :title="modoHint.title"
    >
      {{ modoHint.text }}
    </BaseAlert>

    <div
      v-if="linkConvite"
      class="form-section space-y-3"
    >
      <p class="font-urbanist text-sm text-glow-text-subtle">
        Copie o link e mande para a pessoa por WhatsApp ou e-mail.
      </p>
      <div
        class="flex flex-col gap-2 rounded-lg border border-glow-border-soft bg-glow-surface p-3 sm:flex-row sm:items-center"
      >
        <p class="min-w-0 flex-1 break-all font-mono text-xs text-glow-text sm:text-sm">
          {{ linkConvite }}
        </p>
        <BaseButton variant="primary" size="sm" class="shrink-0" @click="copiarLink">
          Copiar link
        </BaseButton>
      </div>
      <div v-if="showCancel" class="flex justify-end">
        <BaseButton variant="secondary" size="sm" @click="emit('cancel')">
          Fechar
        </BaseButton>
      </div>
    </div>

    <form
      v-else
      class="space-y-4"
      @submit.prevent="handleSubmit"
    >
      <ContentAlert v-if="formError" variant="error" compact>
        {{ formError }}
      </ContentAlert>

      <section class="form-section">
        <h3 class="form-section__title">Dados da pessoa</h3>
        <div
          class="form-section__grid"
          :class="modo === 'convite' || modo === 'vincular' ? 'form-section__grid--single' : ''"
        >
          <BaseInput
            v-if="modo === 'criar'"
            v-model="nome"
            label="Nome completo"
            required
            placeholder="Maria Silva"
            :error="nomeError"
          />

          <BaseInput
            v-model="email"
            label="E-mail"
            type="email"
            placeholder="usuario@exemplo.com"
            required
            :error="emailError"
            :hint="
              modo === 'vincular' && !emailError
                ? 'O mesmo e-mail que a pessoa usou ao se cadastrar.'
                : undefined
            "
          />

          <TelefoneInput
            v-if="modo === 'criar'"
            v-model="telefone"
            label="Telefone"
            required
            :error="telefoneError"
          />
        </div>
      </section>

      <section v-if="modo === 'criar'" class="form-section">
        <h3 class="form-section__title">Senha de entrada</h3>
        <div class="form-section__grid">
          <BaseInput
            v-model="senha"
            label="Senha inicial"
            type="password"
            required
            autocomplete="new-password"
            :error="senhaError"
          />
          <BaseInput
            v-model="confirmarSenha"
            label="Confirmar senha"
            type="password"
            required
            autocomplete="new-password"
            :error="confirmarSenhaError"
          />
        </div>
        <AuthPasswordRules :password="senha" class="mt-3" />
      </section>

      <section class="form-section">
        <h3 class="form-section__title">O que essa pessoa faz aqui?</h3>
        <div class="form-section__grid form-section__grid--single">
          <BaseSelect
            v-model="role"
            label="Cargo da pessoa"
            :options="roleOptions"
            required
            :hint="roleHint"
          />
        </div>

        <div
          v-if="ehProfissional"
          class="form-section__grid mt-3"
        >
          <BaseInput
            v-model="nomePublico"
            label="Nome público"
            :placeholder="
              modo === 'convite' || modo === 'criar'
                ? 'Opcional — usa o nome no cadastro'
                : 'Como aparecerá para os clientes'
            "
          />
          <label
            class="flex cursor-pointer items-center gap-3 rounded-lg border border-glow-border-soft bg-glow-surface px-3 py-2.5 font-urbanist text-sm text-glow-text transition hover:bg-glow-hover-surface"
          >
            <input
              v-model="podeReceberAgendamento"
              type="checkbox"
              class="size-4 shrink-0 rounded border-glow-border-soft bg-glow-canvas text-glow-gold focus:ring-glow-gold/40"
            />
            Pode receber horários de clientes
          </label>
        </div>
      </section>

      <div
        class="flex flex-col-reverse gap-2 border-t border-glow-border-soft pt-4 sm:flex-row sm:justify-end"
      >
        <BaseButton
          v-if="showCancel"
          type="button"
          variant="secondary"
          class="sm:w-auto"
          @click="emit('cancel')"
        >
          Cancelar
        </BaseButton>
        <BaseButton type="submit" :loading="saving" class="sm:w-auto">
          {{ submitLabel }}
        </BaseButton>
      </div>
    </form>
  </div>
</template>
