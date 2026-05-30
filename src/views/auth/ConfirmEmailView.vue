<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import { authService } from '@/services/authService'
import { useApiError } from '@/composables/useApiError'
import { useNotificationsStore } from '@/stores/notifications.store'
import { ROUTE_PATHS } from '@/constants/routes'

const route = useRoute()
const { resolveError, resolveErrorCode } = useApiError()
const notificationsStore = useNotificationsStore()

const codigo = ref('')
const email = ref('')
const loading = ref(false)
const reenviando = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const confirmed = ref(false)

onMounted(async () => {
  if (typeof route.query.email === 'string') {
    email.value = route.query.email
  }
  if (typeof route.query.token === 'string') {
    await confirmarComToken(route.query.token)
  }
})

async function confirmarComToken(token: string) {
  loading.value = true
  errorMessage.value = ''
  try {
    await authService.confirmarEmail({ token })
    confirmed.value = true
    successMessage.value = 'E-mail confirmado com sucesso! Você já pode fazer login.'
    notificationsStore.push('success', successMessage.value)
  } catch (err) {
    errorMessage.value = resolveError(err)
    if (resolveErrorCode(err) === 'CONFIRMACAO_EMAIL_INVALIDA') {
      codigo.value = ''
    }
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true
  try {
    await authService.confirmarEmail({ codigo: codigo.value })
    confirmed.value = true
    successMessage.value = 'E-mail confirmado com sucesso! Você já pode fazer login.'
    notificationsStore.push('success', successMessage.value)
  } catch (err) {
    errorMessage.value = resolveError(err)
    if (resolveErrorCode(err) === 'CONFIRMACAO_EMAIL_INVALIDA') {
      codigo.value = ''
    }
  } finally {
    loading.value = false
  }
}

async function reenviar() {
  if (!email.value) {
    errorMessage.value = 'Informe o e-mail para reenviar a confirmação.'
    return
  }
  reenviando.value = true
  errorMessage.value = ''
  try {
    await authService.reenviarConfirmacao({ email: email.value })
    successMessage.value = 'Se o e-mail existir, enviamos um novo link de confirmação.'
    notificationsStore.push('info', successMessage.value)
  } catch (err) {
    errorMessage.value = resolveError(err)
  } finally {
    reenviando.value = false
  }
}
</script>

<template>
  <div>
    <h2>Confirmar e-mail</h2>
    <p>Digite o código recebido ou use o link enviado por e-mail.</p>

    <BaseAlert v-if="errorMessage" variant="error" dismissible @dismiss="errorMessage = ''">
      {{ errorMessage }}
    </BaseAlert>
    <BaseAlert v-if="successMessage" variant="success">
      {{ successMessage }}
    </BaseAlert>

    <template v-if="!confirmed">
      <form @submit.prevent="handleSubmit">
        <BaseInput v-model="codigo" label="Código de confirmação" placeholder="000000" required />
        <BaseButton type="submit" block :loading="loading">Confirmar</BaseButton>
      </form>

      <div>
        <BaseInput v-model="email" label="E-mail para reenvio" type="email" />
        <BaseButton block :loading="reenviando" @click="reenviar">Reenviar confirmação</BaseButton>
      </div>
    </template>

    <div v-else>
      <RouterLink :to="ROUTE_PATHS.LOGIN">
        <BaseButton block>Ir para login</BaseButton>
      </RouterLink>
    </div>
  </div>
</template>
