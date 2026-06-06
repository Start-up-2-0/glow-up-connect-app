<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import { conviteService } from '@/services/conviteService'
import { useUserStore } from '@/stores/user.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { ROUTE_PATHS } from '@/constants/routes'
import { normalizeUserRole, USER_ROLE } from '@/types/user.types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const token = computed(() => String(route.params.token))
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

async function responder(acao: 'aceitar' | 'rejeitar') {
  loading.value = true
  error.value = null
  try {
    const roleAntes = userStore.profile?.role
    if (acao === 'aceitar') {
      await conviteService.aceitar(token.value)
      success.value = 'Convite aceito com sucesso!'
      notifications.push('success', 'Convite aceito!')
    } else {
      await conviteService.rejeitar(token.value)
      success.value = 'Convite rejeitado.'
      notifications.push('info', 'Convite rejeitado.')
    }

    await userStore.fetchMe(true)
    const roleDepois = normalizeUserRole(userStore.profile?.role ?? USER_ROLE.CLIENTE)

    if (acao === 'aceitar' && roleAntes !== roleDepois) {
      await router.push(ROUTE_PATHS.DASHBOARD)
    } else {
      await router.push(ROUTE_PATHS.CONVITES)
    }
  } catch (err) {
    error.value = resolveError(err, 'Não foi possível responder ao convite.')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg space-y-4 py-4">
    <h1 class="font-satoshi text-xl font-bold text-glow-text">Convite para equipe</h1>
    <p class="font-urbanist text-sm text-glow-text-subtle">
      Você recebeu um convite para participar de um estabelecimento. Confirme com a conta
      <strong class="text-glow-text">{{ userStore.profile?.email }}</strong>.
    </p>

    <BaseAlert v-if="error" variant="error">{{ error }}</BaseAlert>
    <BaseAlert v-if="success" variant="success">{{ success }}</BaseAlert>

    <BaseCard>
      <LoadingSpinner v-if="loading" />
      <div v-else class="flex flex-col gap-3 sm:flex-row">
        <BaseButton class="flex-1" @click="responder('aceitar')">Aceitar convite</BaseButton>
        <BaseButton class="flex-1" variant="secondary" @click="responder('rejeitar')">
          Rejeitar
        </BaseButton>
      </div>
    </BaseCard>
  </div>
</template>
