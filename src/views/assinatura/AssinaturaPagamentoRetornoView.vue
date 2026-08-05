<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTE_PATHS } from '@/constants/routes'
import { useNegocioStore } from '@/stores/negocio.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useLoading } from '@/composables/useLoading'

const route = useRoute()
const router = useRouter()
const negocioStore = useNegocioStore()
const notifications = useNotificationsStore()
const globalLoading = useLoading()

const aguardando = ref(true)
const tentativas = ref(0)
const maxTentativas = 45

const variante = computed<'sucesso' | 'pendente' | 'falha'>(() => {
  if (route.path.includes('/pendente')) return 'pendente'
  if (route.path.includes('/falha')) return 'falha'
  return 'sucesso'
})

const titulo = computed(() => {
  if (variante.value === 'pendente') return 'Pagamento em análise'
  if (variante.value === 'falha') return 'Pagamento não concluído'
  return 'Pagamento recebido'
})

const descricao = computed(() => {
  if (variante.value === 'pendente') {
    return 'Seu pagamento pode levar alguns minutos ou dias (ex.: boleto). Assim que o Mercado Pago confirmar, seu estabelecimento será criado automaticamente.'
  }
  if (variante.value === 'falha') {
    return 'O pagamento não foi aprovado. Você pode tentar novamente com outro meio de pagamento.'
  }
  return 'Estamos confirmando seu pagamento e preparando o acesso ao painel.'
})

function finishWaiting() {
  aguardando.value = false
  globalLoading.close()
}

async function tentarAtivar(): Promise<boolean> {
  tentativas.value += 1
  await negocioStore.fetchEstabelecimentos(true)
  if (negocioStore.assinaturaAtiva) {
    finishWaiting()
    notifications.push('success', 'Assinatura ativa! Bem-vindo ao Glow Up Connect.')
    await router.replace(ROUTE_PATHS.DASHBOARD)
    return true
  }
  return false
}

onMounted(async () => {
  if (variante.value === 'falha') {
    aguardando.value = false
    return
  }

  globalLoading.open({ message: 'Confirmando pagamento...' })
  try {
    const ativado = await tentarAtivar()
    if (ativado) return

    const interval = window.setInterval(async () => {
      if (tentativas.value >= maxTentativas) {
        window.clearInterval(interval)
        finishWaiting()
        return
      }
      const ok = await tentarAtivar()
      if (ok) window.clearInterval(interval)
    }, 2000)
  } catch {
    finishWaiting()
  }
})
</script>

<template>
  <div class="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-6 px-4 text-center">
    <h1 class="text-2xl font-semibold text-gray-900 dark:text-white">{{ titulo }}</h1>
    <p class="text-sm text-gray-600 dark:text-gray-300">{{ descricao }}</p>
    <div v-if="!aguardando && variante !== 'sucesso'" class="flex flex-col gap-3">
      <BaseButton v-if="variante === 'falha'" @click="router.push(ROUTE_PATHS.ONBOARDING_PLANOS)">
        Tentar novamente
      </BaseButton>
      <BaseButton v-else variant="secondary" @click="router.push(ROUTE_PATHS.DASHBOARD)">
        Ir para o painel
      </BaseButton>
    </div>
  </div>
</template>
