<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import OnboardingAssinaturaShell from '@/components/onboarding/OnboardingAssinaturaShell.vue'
import OnboardingInformacoesBasicasStep from '@/components/onboarding/OnboardingInformacoesBasicasStep.vue'
import OnboardingAutonomoPerfilStep from '@/components/onboarding/OnboardingAutonomoPerfilStep.vue'
import OnboardingAutonomoRevisaoStep from '@/components/onboarding/OnboardingAutonomoRevisaoStep.vue'
import OnboardingEnderecoStep from '@/components/onboarding/OnboardingEnderecoStep.vue'
import OnboardingConfirmarDadosStep from '@/components/onboarding/OnboardingConfirmarDadosStep.vue'
import OnboardingPagamentoStep from '@/components/onboarding/OnboardingPagamentoStep.vue'
import OnboardingServicosStep from '@/components/onboarding/OnboardingServicosStep.vue'
import OnboardingHorariosStep from '@/components/onboarding/OnboardingHorariosStep.vue'
import { useAssinaturaLogadaWizard } from '@/composables/useAssinaturaLogadaWizard'
import { useUserStore } from '@/stores/user.store'
import {
  ASSINATURA_LOGADA_STEP_SUBTITLES,
  ASSINATURA_LOGADA_STEP_SUBTITLES_AUTONOMO,
} from '@/types/assinaturaOnboarding.types'
import { ROUTE_PATHS } from '@/constants/routes'
import type { TipoAssinatura } from '@/types/assinatura.types'

const props = defineProps<{
  planoId: number
  tipoAssinatura: TipoAssinatura
}>()

const router = useRouter()
const userStore = useUserStore()

const wizard = useAssinaturaLogadaWizard(props.planoId, props.tipoAssinatura)

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
  avancarDePerfil,
  verificarTelefoneEAvancar,
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
  avancarDeServicos,
  pularServicos,
  avancarDeHorarios,
  pularHorarios,
} = wizard

const isCheckoutStep = computed(() => step.value === 'assinatura')
const estabelecimentoOpsId = computed(() => draft.value.estabelecimentoId)

const stepSubtitle = computed(() =>
  ehAutonomo.value
    ? ASSINATURA_LOGADA_STEP_SUBTITLES_AUTONOMO[step.value]
    : ASSINATURA_LOGADA_STEP_SUBTITLES[step.value],
)

const usarDadosContaPadrao = computed(() => {
  if (!ehAutonomo.value) return false
  const profile = userStore.profile
  return Boolean(
    profile?.nome?.trim()
    || profile?.email?.trim()
    || profile?.telefone?.trim(),
  )
})

const stepHeading = computed(() => {
  if (isCheckoutStep.value) return ''
  if (ehAutonomo.value) {
    const map: Record<string, string> = {
      perfil: 'Perfil',
      endereco: 'Localização',
      revisao: 'Confirmação',
      servicos: 'Serviços',
      horarios: 'Horários',
    }
    return map[step.value] ?? 'Assinatura'
  }
  const map: Record<string, string> = {
    'informacoes-basicas': 'Dados do estabelecimento',
    endereco: 'Endereço',
    confirmar: 'Confirmação',
  }
  return map[step.value] ?? 'Assinatura'
})

const shellDescription = computed(() => {
  if (isCheckoutStep.value) return ''
  return stepSubtitle.value ?? ''
})

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
    :title="stepHeading"
    :description="shellDescription"
    @back="onShellBack"
  >
    <template v-if="plano">
      <template v-if="ehAutonomo">
        <OnboardingAutonomoPerfilStep
          v-if="step === 'perfil'"
          :initial="draft.estabelecimento"
          :usar-dados-conta-padrao="usarDadosContaPadrao"
          :avatar-conta-disponivel="avatarContaDisponivel"
          :avatar-conta-url="userStore.profile?.avatarBase64 ?? null"
          :telefone-pendente-confirmacao="telefonePendenteConfirmacao"
          :whatsapp-instrucoes="whatsappInstrucoes"
          :whats-app-confirmado="Boolean(userStore.profile?.whatsAppConfirmado)"
          :loading="submitting || loading"
          :error-message="erro"
          @submit="avancarDePerfil"
          @back="voltarDePerfil"
          @verificar-whats-app="verificarTelefoneEAvancar"
        />

        <OnboardingEnderecoStep
          v-else-if="step === 'endereco'"
          :initial="draft.estabelecimento"
          modo-autonomo
          submit-label="Próximo: Revisão"
          back-label="Anterior: Perfil"
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
          v-else-if="step === 'assinatura'"
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

        <OnboardingServicosStep
          v-else-if="step === 'servicos' && estabelecimentoOpsId"
          :estabelecimento-id="estabelecimentoOpsId"
          modo-autonomo
          continue-label="Próximo: Horários"
          @continue="avancarDeServicos"
          @skip="pularServicos"
        />

        <OnboardingHorariosStep
          v-else-if="step === 'horarios' && estabelecimentoOpsId"
          :estabelecimento-id="estabelecimentoOpsId"
          modo-autonomo
          continue-label="Ir ao painel"
          @continue="avancarDeHorarios"
          @skip="pularHorarios"
        />
      </template>

      <template v-else>
        <OnboardingInformacoesBasicasStep
          v-if="step === 'informacoes-basicas'"
          :initial="draft.estabelecimento"
          :loading="submitting || loading"
          :error-message="erro"
          :telefone-pendente-confirmacao="telefonePendenteConfirmacao"
          :whatsapp-instrucoes="whatsappInstrucoes"
          :whats-app-confirmado="Boolean(userStore.profile?.whatsAppConfirmado)"
          @submit="avancarDeInformacoesBasicas"
          @back="voltarDeInformacoesBasicas"
          @verificar-whats-app="verificarTelefoneEAvancar"
        />

        <OnboardingEnderecoStep
          v-else-if="step === 'endereco'"
          :initial="draft.estabelecimento"
          submit-label="Próximo: Confirmação"
          back-label="Anterior: Dados"
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
