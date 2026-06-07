<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PlanosOnboardingSection from '@/components/assinatura/PlanosOnboardingSection.vue'
import { assinaturaService } from '@/services/assinaturaService'
import { ROUTE_PATHS } from '@/constants/routes'

const router = useRouter()

onMounted(async () => {
  try {
    const contexto = await assinaturaService.obterContextoOnboarding()
    if (contexto.proximaEtapa === 'GerenciarAssinatura') {
      await router.replace(ROUTE_PATHS.CONFIG_ASSINATURA)
    }
  } catch {
    // Mantém a página de planos se o contexto não puder ser carregado.
  }
})
</script>

<template>
  <div>
    <div class="mb-8 text-center">
      <h1 class="font-satoshi text-2xl font-bold text-glow-text lg:text-3xl">
        Escolha o plano ideal
      </h1>
      <p class="mt-2 text-glow-text-subtle">
        Contrate a plataforma para o seu estabelecimento sem sair da sua conta.
      </p>
    </div>

    <PlanosOnboardingSection modo-logado />
  </div>
</template>
