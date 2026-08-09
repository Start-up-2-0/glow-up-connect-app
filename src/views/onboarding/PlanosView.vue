<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PlanosOnboardingSection from '@/components/assinatura/PlanosOnboardingSection.vue'
import { assinaturaService } from '@/services/assinaturaService'
import { useNegocioStore } from '@/stores/negocio.store'
import { ROUTE_PATHS } from '@/constants/routes'
import { MOCK_MODE } from '@/mocks/config'

const router = useRouter()
const negocioStore = useNegocioStore()

onMounted(async () => {
  await negocioStore.ensureContext()

  // Em mock, mantém a página de planos para testar o wizard de assinatura.
  if (MOCK_MODE) return

  const possuiAssinaturaAtivaComoDono = negocioStore.estabelecimentos.some(
    (e) => e.role === 'Owner' && e.assinaturaAtiva,
  )

  if (possuiAssinaturaAtivaComoDono) {
    await router.replace(ROUTE_PATHS.CONFIG_ASSINATURA)
    return
  }

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
  <div class="mx-auto w-full max-w-6xl space-y-8 pb-4">
    <header class="mx-auto max-w-2xl text-center">
      <h1 class="font-satoshi text-3xl font-bold tracking-tight text-glow-text sm:text-4xl">
        Escolha como você trabalha e o plano ideal
      </h1>
      <p class="mt-3 font-urbanist text-sm leading-relaxed text-glow-text-subtle sm:text-base">
        Do profissional autônomo ao estabelecimento com equipe — a plataforma se adapta ao seu
        modelo. Comece grátis e evolua quando precisar.
      </p>
    </header>

    <PlanosOnboardingSection modo-logado />
  </div>
</template>
