<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import AuthRecoveryLayout from '@/components/auth/recovery/AuthRecoveryLayout.vue'
import { useConfirmEmail } from '@/composables/useConfirmEmail'
import { ROUTE_PATHS } from '@/constants/routes'
import {
  authRouteWithRedirect,
  isOnboardingCheckoutPath,
  readRedirectParam,
} from '@/utils/authRedirect'
import {
  GLOW_BUTTON_PRIMARY_CLASS,
  GLOW_RECOVERY_SUBTITLE_CLASS,
  GLOW_RECOVERY_TITLE_CLASS,
} from '@/constants/designTokens'

const route = useRoute()
const { clearConfirmSession } = useConfirmEmail()

const checkoutRedirect = computed(() => readRedirectParam(route.query.redirect))
const isAssinaturaFlow = computed(() =>
  checkoutRedirect.value ? isOnboardingCheckoutPath(checkoutRedirect.value) : false,
)
const loginLink = computed(() =>
  authRouteWithRedirect(ROUTE_PATHS.LOGIN, checkoutRedirect.value),
)

onMounted(() => {
  clearConfirmSession()
})
</script>

<template>
  <AuthRecoveryLayout :step="1" :show-stepper="false">
    <div class="mb-10 flex flex-col items-center">
      <div class="relative mb-8 flex size-[115px] items-center justify-center">
        <div class="absolute -top-1 left-1/2 h-5 w-[7px] -translate-x-1/2 rounded-full bg-glow-gold" />
        <div
          class="absolute left-2 top-3 size-[19px] -rotate-45 rounded-full bg-glow-gold"
          style="width: 7px; height: 20px; border-radius: 20px"
        />
        <div
          class="absolute right-2 top-3 size-[19px] rotate-45 rounded-full bg-glow-gold"
          style="width: 7px; height: 20px; border-radius: 20px"
        />
        <div
          class="flex size-[71px] items-center justify-center rounded-[20px] border-[0.5px] border-glow-text/40 bg-white"
        >
          <svg class="size-8 text-glow-gold" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>

      <header class="w-full text-center">
        <h1 :class="GLOW_RECOVERY_TITLE_CLASS">E-mail confirmado com sucesso!</h1>
        <p :class="[GLOW_RECOVERY_SUBTITLE_CLASS, 'mt-2']">
          <template v-if="isAssinaturaFlow">
            Sua conta está ativa.<br />
            Faça login para cadastrar seu estabelecimento e concluir a assinatura.
          </template>
          <template v-else>
            Sua conta está ativa.<br />
            Faça login para continuar.
          </template>
        </p>
      </header>
    </div>

    <RouterLink
      :to="loginLink"
      :class="[GLOW_BUTTON_PRIMARY_CLASS, 'font-inter text-base font-medium']"
    >
      {{ isAssinaturaFlow ? 'Entrar e continuar assinatura' : 'Ir para o login' }}
    </RouterLink>
  </AuthRecoveryLayout>
</template>
