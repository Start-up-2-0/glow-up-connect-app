<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import OnboardingAssinaturaShell from '@/components/onboarding/OnboardingAssinaturaShell.vue'
import OnboardingInformacoesBasicasStep from '@/components/onboarding/OnboardingInformacoesBasicasStep.vue'
import OnboardingAutonomoDadosStep from '@/components/onboarding/OnboardingAutonomoDadosStep.vue'
import OnboardingAutonomoPerfilStep from '@/components/onboarding/OnboardingAutonomoPerfilStep.vue'
import OnboardingAutonomoRevisaoStep from '@/components/onboarding/OnboardingAutonomoRevisaoStep.vue'
import OnboardingEnderecoStep from '@/components/onboarding/OnboardingEnderecoStep.vue'
import OnboardingConfirmarDadosStep from '@/components/onboarding/OnboardingConfirmarDadosStep.vue'
import OnboardingPagamentoStep from '@/components/onboarding/OnboardingPagamentoStep.vue'
import { useAssinaturaLogadaWizard } from '@/composables/useAssinaturaLogadaWizard'
import { useUserStore } from '@/stores/user.store'
import {
  ASSINATURA_LOGADA_STEP_SUBTITLES,
  ASSINATURA_LOGADA_STEP_SUBTITLES_AUTONOMO,
} from '@/types/assinaturaOnboarding.types'
import { ROUTE_PATHS } from '@/constants/routes'
import type { TipoAssinatura } from '@/types/assinatura.types'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const planoId = computed(() => Number(route.query.planoId))
const tipoAssinatura = computed<TipoAssinatura>(() =>
  route.query.tipoAssinatura === 'ProfissionalAutonomo'
    ? 'ProfissionalAutonomo'
    : 'Estabelecimento',
)

const wizard = useAssinaturaLogadaWizard(planoId.value, tipoAssinatura.value)

const {
  draft,
  step,
  stepperIndex,
  wizardSteps,
  plano,
  promocao,
  usaEstabelecimentoExistente,
  ehAutonomo,
  avatarContaDisponivel,
  telefonePendenteConfirmacao,
  whatsappInstrucoes,
  loading,
  submitting,
  aguardandoPagamento,
  pixQrCode,
  pixCheckoutUrl,
  erro,
  init,
  avancarDeInformacoesBasicas,
  avancarDeDados,
  verificarTelefoneEAvancar,
  avancarDePerfil,
  voltarDePerfil,
  voltarDeEndereco,
  avancarDeEndereco,
  voltarDoConfirmar,
  voltarDeRevisao,
  editarEstabelecimento,
  editarAutonomo,
  avancarParaPagamento,
  avancarDeRevisao,
  voltarParaConfirmar,
  finalizarAssinatura,
} = wizard

const isCheckoutStep = computed(() => step.value === 'assinatura')

const stepSubtitle = computed(() =>
  ehAutonomo.value
    ? ASSINATURA_LOGADA_STEP_SUBTITLES_AUTONOMO[step.value]
    : ASSINATURA_LOGADA_STEP_SUBTITLES[step.value],
)

const usarDadosContaPadrao = computed(() => {
  if (!ehAutonomo.value) return false
  const e = draft.value.estabelecimento
  return Boolean(e.nome.trim() || e.email.trim() || e.telefone.trim())
})

const shellTitle = computed(() => {
  if (isCheckoutStep.value) return ''
  return 'Assinatura'
})

const shellDescription = computed(() =>
  ehAutonomo.value
    ? 'Ative seu plano e complete os dados do perfil profissional.'
    : 'Ative seu plano e complete os dados do estabelecimento.',
)

onMounted(() => {
  void init()
})

function onShellBack() {
  if (isCheckoutStep.value) {
    voltarParaConfirmar()
  }
}

function voltarDeInformacoesBasicas() {
  void router.push(ROUTE_PATHS.ONBOARDING_PLANOS)
}

function voltarDeDados() {
  void router.push(ROUTE_PATHS.ONBOARDING_PLANOS)
}
</script>

<template>
  <OnboardingAssinaturaShell
    variant="dashboard"
    :is-checkout-step="isCheckoutStep"
    :show-stepper="true"
    :stepper-index="stepperIndex"
    :steps="wizardSteps"
    :step-subtitle="isCheckoutStep ? '' : stepSubtitle"
    :modo-autonomo="ehAutonomo"
    :plano-resumo="plano"
    :promocao-resumo="promocao"
    :title="shellTitle"
    :description="shellDescription"
    @back="onShellBack"
  >
    <template v-if="plano">
      <template v-if="ehAutonomo">
        <OnboardingAutonomoDadosStep
          v-if="step === 'dados'"
          :initial="draft.estabelecimento"
          :usar-dados-conta-padrao="usarDadosContaPadrao"
          :telefone-pendente-confirmacao="telefonePendenteConfirmacao"
          :whatsapp-instrucoes="whatsappInstrucoes"
          :whats-app-confirmado="Boolean(userStore.profile?.whatsAppConfirmado)"
          :loading="submitting || loading"
          :error-message="erro"
          @submit="avancarDeDados"
          @back="voltarDeDados"
          @verificar-whats-app="verificarTelefoneEAvancar"
        />

        <OnboardingAutonomoPerfilStep
          v-else-if="step === 'perfil'"
          :initial="draft.estabelecimento"
          :avatar-conta-disponivel="avatarContaDisponivel"
          :avatar-conta-url="userStore.profile?.avatarBase64 ?? null"
          :loading="loading"
          :error-message="erro"
          @submit="avancarDePerfil"
          @back="voltarDePerfil"
        />

        <OnboardingEnderecoStep
          v-else-if="step === 'endereco'"
          :initial="draft.estabelecimento"
          modo-autonomo
          submit-label="Continuar"
          back-label="Voltar"
          :loading="submitting"
          :error-message="erro"
          @submit="avancarDeEndereco"
          @back="voltarDeEndereco"
        />

        <OnboardingAutonomoRevisaoStep
          v-else-if="step === 'revisao'"
          :perfil="draft.estabelecimento"
          :loading="loading"
          :error-message="erro"
          @back="voltarDeRevisao"
          @edit="editarAutonomo"
          @submit="avancarDeRevisao"
        />

        <OnboardingPagamentoStep
          v-else
          variant="dashboard"
          :plano="plano"
          :promocao="promocao"
          :submitting="submitting"
          :aguardando-pagamento="aguardandoPagamento"
          :pix-qr-code="pixQrCode"
          :pix-checkout-url="pixCheckoutUrl"
          :error-message="erro"
          @back="voltarParaConfirmar"
          @submit="finalizarAssinatura"
        />
      </template>

      <template v-else>
        <OnboardingInformacoesBasicasStep
          v-if="step === 'informacoes-basicas'"
          :initial="draft.estabelecimento"
          :loading="loading"
          :error-message="erro"
          @submit="avancarDeInformacoesBasicas"
          @back="voltarDeInformacoesBasicas"
        />

        <OnboardingEnderecoStep
          v-else-if="step === 'endereco'"
          :initial="draft.estabelecimento"
          :loading="submitting"
          :error-message="erro"
          @submit="avancarDeEndereco"
          @back="voltarDeEndereco"
        />

        <OnboardingConfirmarDadosStep
          v-else-if="step === 'confirmar'"
          :plano="plano"
          :promocao="promocao"
          ocultar-resumo-plano
          :estabelecimento="draft.estabelecimento"
          :estabelecimento-existente="usaEstabelecimentoExistente"
          :loading="loading"
          :error-message="erro"
          @back="voltarDoConfirmar"
          @edit="editarEstabelecimento"
          @submit="avancarParaPagamento"
        />

        <OnboardingPagamentoStep
          v-else
          variant="dashboard"
          :plano="plano"
          :promocao="promocao"
          :submitting="submitting"
          :aguardando-pagamento="aguardandoPagamento"
          :pix-qr-code="pixQrCode"
          :pix-checkout-url="pixCheckoutUrl"
          :error-message="erro"
          @back="voltarParaConfirmar"
          @submit="finalizarAssinatura"
        />
      </template>
    </template>
  </OnboardingAssinaturaShell>
</template>
