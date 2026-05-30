<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthRecoveryLayout from '@/components/auth/recovery/AuthRecoveryLayout.vue'
import AuthRecoveryBackLink from '@/components/auth/recovery/AuthRecoveryBackLink.vue'
import AuthRecoveryAlert from '@/components/auth/recovery/AuthRecoveryAlert.vue'
import AuthPasswordRules from '@/components/auth/recovery/AuthPasswordRules.vue'
import AuthPasswordToggle from '@/components/auth/AuthPasswordToggle.vue'
import { useForgotPassword } from '@/composables/useForgotPassword'
import { useApiError } from '@/composables/useApiError'
import { ROUTE_PATHS } from '@/constants/routes'
import {
  GLOW_BUTTON_PRIMARY_CLASS,
  GLOW_RECOVERY_INPUT_CLASS,
  GLOW_RECOVERY_LABEL_CLASS,
  GLOW_RECOVERY_SUBTITLE_CLASS,
  GLOW_RECOVERY_TITLE_CLASS,
} from '@/constants/designTokens'

const router = useRouter()
const { getStoredEmail, resetPassword, validatePassword } = useForgotPassword()
const { resolveError } = useApiError()

const senha = ref('')
const confirmarSenha = ref('')
const mostrarSenha = ref(false)
const mostrarConfirmarSenha = ref(false)
const loading = ref(false)
const mismatchError = ref(false)
const errorMessage = ref('')

const canSubmit = computed(
  () => validatePassword(senha.value, confirmarSenha.value).valid,
)

onMounted(() => {
  if (!getStoredEmail()) {
    void router.replace(ROUTE_PATHS.FORGOT_PASSWORD)
  }
})

async function handleSubmit() {
  mismatchError.value = false
  errorMessage.value = ''

  const validation = validatePassword(senha.value, confirmarSenha.value)

  if (validation.mismatch) {
    mismatchError.value = true
  }

  if (!validation.valid) return

  loading.value = true
  try {
    await resetPassword({
      senha: senha.value,
      confirmarSenha: confirmarSenha.value,
    })
    await router.push(ROUTE_PATHS.RESET_PASSWORD_SUCCESS)
  } catch (err) {
    errorMessage.value = resolveError(err, 'Não foi possível redefinir a senha.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthRecoveryLayout :step="3">
    <header class="mb-10 w-full text-center">
      <h1 :class="GLOW_RECOVERY_TITLE_CLASS">Informe uma nova senha</h1>
      <p :class="[GLOW_RECOVERY_SUBTITLE_CLASS, 'mt-2']">
        Sua nova senha deve ser diferente<br />
        da senha anterior
      </p>
    </header>

    <form class="flex w-full flex-col gap-6" @submit.prevent="handleSubmit">
      <div class="relative flex flex-col gap-2">
        <label for="nova-senha" :class="GLOW_RECOVERY_LABEL_CLASS">Senha</label>
        <input
          id="nova-senha"
          v-model="senha"
          :type="mostrarSenha ? 'text' : 'password'"
          autocomplete="new-password"
          required
          placeholder="Informe a sua senha"
          :class="[GLOW_RECOVERY_INPUT_CLASS, 'pr-12']"
        />
        <AuthPasswordToggle :pressed="mostrarSenha" @click="mostrarSenha = !mostrarSenha" />
      </div>

      <div class="relative flex flex-col gap-2">
        <label for="confirmar-nova-senha" :class="GLOW_RECOVERY_LABEL_CLASS">
          Confirmar Senha
        </label>
        <input
          id="confirmar-nova-senha"
          v-model="confirmarSenha"
          :type="mostrarConfirmarSenha ? 'text' : 'password'"
          autocomplete="new-password"
          required
          placeholder="Confirme a sua senha"
          :class="[GLOW_RECOVERY_INPUT_CLASS, 'pr-12']"
        />
        <AuthPasswordToggle
          :pressed="mostrarConfirmarSenha"
          @click="mostrarConfirmarSenha = !mostrarConfirmarSenha"
        />
      </div>

      <AuthRecoveryAlert v-if="mismatchError">
        As senhas não coincidem. Por favor verifique-as novamente.
      </AuthRecoveryAlert>

      <AuthRecoveryAlert v-if="errorMessage">
        {{ errorMessage }}
      </AuthRecoveryAlert>

      <AuthPasswordRules :password="senha" />

      <button
        type="submit"
        :disabled="loading || !canSubmit"
        :class="[GLOW_BUTTON_PRIMARY_CLASS, 'font-inter text-base font-medium']"
      >
        <span
          v-if="loading"
          class="mr-2 inline-block size-5 animate-spin rounded-full border-2 border-white border-t-transparent"
        />
        Redefinir senha
      </button>
    </form>

    <AuthRecoveryBackLink class="mt-6 self-start" />
  </AuthRecoveryLayout>
</template>
