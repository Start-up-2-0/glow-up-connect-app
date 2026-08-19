<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import OnboardingAssinaturaShell from '@/components/onboarding/OnboardingAssinaturaShell.vue'
import OnboardingInformacoesBasicasStep from '@/components/onboarding/OnboardingInformacoesBasicasStep.vue'
import OnboardingEnderecoStep from '@/components/onboarding/OnboardingEnderecoStep.vue'
import OnboardingEquipeStep from '@/components/onboarding/OnboardingEquipeStep.vue'
import OnboardingServicosStep from '@/components/onboarding/OnboardingServicosStep.vue'
import OnboardingHorariosStep from '@/components/onboarding/OnboardingHorariosStep.vue'
import OnboardingRevisaoStep from '@/components/onboarding/OnboardingRevisaoStep.vue'
import { useLojaSetupWizard } from '@/composables/useLojaSetupWizard'
import { ROUTE_PATHS } from '@/constants/routes'
import type { LojaSetupStepId } from '@/types/lojaSetup.types'

const router = useRouter()
const wizard = useLojaSetupWizard()

const {
  mode,
  draft,
  estabelecimentoDraft,
  perfil,
  loading,
  submitting,
  erro,
  contagens,
  visibleSteps,
  step,
  lojaSubstep,
  stepperIndex,
  stepSubtitle,
  skippedIds,
  pageTitle,
  pageDescription,
  ehProfissionalAutonomo,
  init,
  avancarDeInformacoesBasicas,
  voltarDeEndereco,
  criarUnidade,
  skipStep,
  goNextFromOps,
  goToStep,
  refreshContagens,
  loadPerfil,
  concluir,
} = wizard

const estabelecimentoId = computed(() => draft.value.estabelecimentoId)

onMounted(() => {
  void init()
})

function onShellBack() {
  if (step.value === 'loja' && lojaSubstep.value === 'endereco') {
    voltarDeEndereco()
    return
  }
  if (mode.value === 'adicionar-unidade' && step.value === 'loja') {
    void router.push(ROUTE_PATHS.MINHAS_LOJAS)
    return
  }
  void router.push(ROUTE_PATHS.DASHBOARD)
}

async function onEditFromRevisao(target: LojaSetupStepId) {
  if (target === 'loja' && mode.value === 'adicionar-unidade' && estabelecimentoId.value) {
    // Loja já criada: editar perfil no dashboard
    void router.push(ROUTE_PATHS.CONFIG_PERFIL)
    return
  }
  goToStep(target)
}

async function onContinueOps(from: LojaSetupStepId) {
  if (estabelecimentoId.value) {
    await refreshContagens(estabelecimentoId.value)
    await loadPerfil(estabelecimentoId.value)
  }
  await goNextFromOps(from)
}
</script>

<template>
  <OnboardingAssinaturaShell
    variant="contratar"
    :title="pageTitle"
    :description="pageDescription"
    :show-stepper="true"
    :stepper-index="stepperIndex"
    :steps="visibleSteps"
    :skipped-ids="skippedIds"
    :step-subtitle="stepSubtitle"
    :modo-autonomo="ehProfissionalAutonomo"
    @back="onShellBack"
  >
    <p v-if="loading" class="text-center text-sm text-glow-text-subtle">Carregando…</p>

    <template v-else>
      <!-- Step Loja (apenas adicionar-unidade) -->
      <template v-if="step === 'loja' && mode === 'adicionar-unidade'">
        <OnboardingInformacoesBasicasStep
          v-if="lojaSubstep === 'informacoes-basicas'"
          :initial="estabelecimentoDraft"
          :loading="submitting"
          :error-message="erro"
          @submit="avancarDeInformacoesBasicas"
          @back="onShellBack"
        />
        <OnboardingEnderecoStep
          v-else
          :initial="estabelecimentoDraft"
          :loading="submitting"
          :error-message="erro"
          @submit="criarUnidade"
          @back="voltarDeEndereco"
        />
      </template>

      <OnboardingEquipeStep
        v-else-if="step === 'equipe' && estabelecimentoId"
        :estabelecimento-id="estabelecimentoId"
        @continue="onContinueOps('equipe')"
        @skip="skipStep('equipe')"
      />

      <OnboardingServicosStep
        v-else-if="step === 'servicos' && estabelecimentoId"
        :estabelecimento-id="estabelecimentoId"
        :modo-autonomo="ehProfissionalAutonomo"
        @continue="onContinueOps('servicos')"
        @skip="skipStep('servicos')"
      />

      <OnboardingHorariosStep
        v-else-if="step === 'horarios' && estabelecimentoId"
        :estabelecimento-id="estabelecimentoId"
        :modo-autonomo="ehProfissionalAutonomo"
        @continue="onContinueOps('horarios')"
        @skip="skipStep('horarios')"
      />

      <OnboardingRevisaoStep
        v-else-if="step === 'revisao'"
        :perfil="perfil"
        :nome-fallback="estabelecimentoDraft.nome || undefined"
        :contagens="contagens"
        :skipped="draft.skipped"
        :esconder-equipe="ehProfissionalAutonomo"
        @edit="onEditFromRevisao"
        @finish="concluir"
      />

      <p v-if="erro && step === 'revisao'" class="text-center text-sm text-red-600 dark:text-red-400">
        {{ erro }}
      </p>

      <p
        v-else
        class="text-center text-sm text-glow-text-subtle"
      >
        Não foi possível carregar esta etapa.
        <button
          type="button"
          class="ml-1 font-medium text-glow-gold-cta"
          @click="router.push(ROUTE_PATHS.DASHBOARD)"
        >
          Ir ao dashboard
        </button>
      </p>
    </template>
  </OnboardingAssinaturaShell>
</template>
