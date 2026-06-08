<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ROUTE_PATHS } from '@/constants/routes'
import { useNegocioStore } from '@/stores/negocio.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'

const route = useRoute()
const router = useRouter()
const negocioStore = useNegocioStore()
const notifications = useNotificationsStore()

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

async function tentarAtivar() {
  tentativas.value += 1
  await negocioStore.fetchEstabelecimentos(true)
  if (negocioStore.assinaturaAtiva) {
    aguardando.value = false
    notifications.push('success', 'Assinatura ativa! Bem-vindo ao Glow Up Connect.')
    await router.replace(ROUTE_PATHS.DASHBOARD)
  }
}

onMounted(async () => {
  if (variante.value === 'falha') {
    aguardando.value = false
    return
  }

  await tentarAtivar()
  if (!negocioStore.assinaturaAtiva) {
    const interval = window.setInterval(async () => {
      if (tentativas.value >= maxTentativas || negocioStore.assinaturaAtiva) {
        window.clearInterval(interval)
        aguardando.value = false
        return
      }
      await tentarAtivar()
    }, 2000)
  }
})
</script>

<template>
  <div class="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-6 px-4 text-center">
    <LoadingSpinner v-if="aguardando && variante !== 'falha'" />
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
