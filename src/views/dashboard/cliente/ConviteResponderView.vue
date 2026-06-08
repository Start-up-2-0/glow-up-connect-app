<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import { conviteService } from '@/services/conviteService'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { ROUTE_PATHS, conviteResponderPath } from '@/constants/routes'
import { establishmentRoleLabel } from '@/constants/establishmentRoles'
import { authRouteWithRedirect } from '@/utils/authRedirect'
import { isClienteRole } from '@/types/user.types'
import type { ConvitePreview } from '@/types/convite.types'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const token = computed(() => String(route.params.token))
const redirectPath = computed(() => conviteResponderPath(token.value))
const loginLink = computed(() => authRouteWithRedirect(ROUTE_PATHS.LOGIN, redirectPath.value))
const registerLink = computed(() => authRouteWithRedirect(ROUTE_PATHS.REGISTER, redirectPath.value))

const previewLoading = ref(true)
const preview = ref<ConvitePreview | null>(null)
const previewError = ref<string | null>(null)
const actionLoading = ref(false)
const actionError = ref<string | null>(null)
const success = ref<string | null>(null)

const autenticado = computed(() => authStore.isAuthenticated)
const emailLogado = computed(() => userStore.profile?.email?.toLowerCase() ?? '')
const emailConvite = computed(() => preview.value?.email.toLowerCase() ?? '')
const emailConfere = computed(
  () => autenticado.value && emailLogado.value === emailConvite.value,
)
const emailDivergente = computed(
  () => autenticado.value && preview.value && emailLogado.value !== emailConvite.value,
)

const funcaoLabel = computed(() =>
  preview.value ? establishmentRoleLabel(preview.value.roleSugerida) : '',
)

async function carregarPreview() {
  previewLoading.value = true
  previewError.value = null
  try {
    preview.value = await conviteService.obterPreview(token.value)
  } catch (err) {
    previewError.value = resolveError(err, 'Convite não encontrado ou inválido.')
  } finally {
    previewLoading.value = false
  }
}

async function responder(acao: 'aceitar' | 'rejeitar') {
  actionLoading.value = true
  actionError.value = null
  try {
    if (acao === 'aceitar') {
      await conviteService.aceitar(token.value)
      success.value = 'Convite aceito com sucesso!'
      notifications.push('success', 'Convite aceito!')

      await userStore.fetchMe(true)
      if (!isClienteRole(userStore.profile?.role)) {
        const negocioStore = useNegocioStore()
        await negocioStore.fetchEstabelecimentos(true)
        if (preview.value?.estabelecimentoId) {
          negocioStore.selecionarEstabelecimento(preview.value.estabelecimentoId)
        }
      }
    } else {
      await conviteService.rejeitar(token.value)
      success.value = 'Convite rejeitado.'
      notifications.push('info', 'Convite rejeitado.')
    }

    await router.push(ROUTE_PATHS.DASHBOARD)
  } catch (err) {
    actionError.value = resolveError(err, 'Não foi possível responder ao convite.')
  } finally {
    actionLoading.value = false
  }
}

onMounted(async () => {
  await carregarPreview()
  if (authStore.isAuthenticated && !userStore.profile) {
    try {
      await userStore.fetchMe()
    } catch {
      /* preview ainda útil para visitante */
    }
  }
})
</script>

<template>
  <div class="mx-auto max-w-lg space-y-4 py-4">
    <h1 class="font-satoshi text-xl font-bold text-glow-text">Convite para equipe</h1>

    <LoadingSpinner v-if="previewLoading" />
    <BaseAlert v-else-if="previewError" variant="error">{{ previewError }}</BaseAlert>

    <template v-else-if="preview">
      <BaseCard title="Resumo do convite">
        <dl class="space-y-2 font-urbanist text-sm">
          <div class="flex justify-between gap-4">
            <dt class="text-glow-text-subtle">Estabelecimento</dt>
            <dd class="text-right font-medium text-glow-text">{{ preview.nomeEstabelecimento }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-glow-text-subtle">Função</dt>
            <dd class="text-right font-medium text-glow-text">{{ funcaoLabel }}</dd>
          </div>
          <div class="flex justify-between gap-4">
            <dt class="text-glow-text-subtle">E-mail do convite</dt>
            <dd class="text-right font-medium text-glow-text">{{ preview.email }}</dd>
          </div>
        </dl>
      </BaseCard>

      <BaseAlert v-if="success" variant="success">{{ success }}</BaseAlert>
      <BaseAlert v-if="actionError" variant="error">{{ actionError }}</BaseAlert>

      <template v-if="!autenticado">
        <BaseAlert variant="info">
          Para aceitar este convite, entre com a conta
          <strong class="text-glow-text">{{ preview.email }}</strong>
          ou crie uma nova conta com esse e-mail.
        </BaseAlert>
        <div class="flex flex-col gap-3 sm:flex-row">
          <RouterLink :to="registerLink" class="flex-1">
            <BaseButton class="w-full">Criar conta</BaseButton>
          </RouterLink>
          <RouterLink :to="loginLink" class="flex-1">
            <BaseButton class="w-full" variant="secondary">Já tenho conta</BaseButton>
          </RouterLink>
        </div>
      </template>

      <template v-else-if="emailDivergente">
        <BaseAlert variant="error">
          Você está logado como <strong>{{ userStore.profile?.email }}</strong>, mas este convite
          é para <strong>{{ preview.email }}</strong>. Saia e entre com a conta correta.
        </BaseAlert>
        <RouterLink :to="loginLink">
          <BaseButton variant="secondary">Trocar de conta</BaseButton>
        </RouterLink>
      </template>

      <template v-else-if="emailConfere">
        <p class="font-urbanist text-sm text-glow-text-subtle">
          Confirme com a conta <strong class="text-glow-text">{{ userStore.profile?.email }}</strong>.
        </p>
        <BaseCard>
          <LoadingSpinner v-if="actionLoading" />
          <div v-else class="flex flex-col gap-3 sm:flex-row">
            <BaseButton class="flex-1" @click="responder('aceitar')">Aceitar convite</BaseButton>
            <BaseButton class="flex-1" variant="secondary" @click="responder('rejeitar')">
              Rejeitar
            </BaseButton>
          </div>
        </BaseCard>
      </template>
    </template>
  </div>
</template>
