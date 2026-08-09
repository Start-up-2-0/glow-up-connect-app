<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from 'vue'
import TelefoneInput from '@/components/ui/TelefoneInput.vue'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import OnboardingContratarFormActions from '@/components/onboarding/OnboardingContratarFormActions.vue'
import {
  ONBOARDING_CONTRATAR_CARD_CLASS,
  ONBOARDING_CONTRATAR_FIELD_CLASS,
  ONBOARDING_CONTRATAR_FORM_CLASS,
  ONBOARDING_CONTRATAR_INPUT_CLASS,
  ONBOARDING_CONTRATAR_LABEL_CLASS,
} from '@/constants/designTokens'
import { readFileAsDataUrl } from '@/utils/avatarFile'
import { telefoneLocalFromApi, telefoneToApi } from '@/utils/formatters'
import type { OnboardingEstabelecimentoDraft } from '@/types/onboardingAssinatura.types'
import type { WhatsAppConfirmacaoInstrucoes } from '@/types/whatsapp.types'

const props = withDefaults(
  defineProps<{
    initial: OnboardingEstabelecimentoDraft
    loading?: boolean
    errorMessage?: string | null
    usarDadosContaPadrao?: boolean
    telefonePendenteConfirmacao?: boolean
    whatsappInstrucoes?: WhatsAppConfirmacaoInstrucoes | null
    whatsAppConfirmado?: boolean
  }>(),
  {
    usarDadosContaPadrao: false,
    telefonePendenteConfirmacao: false,
    whatsappInstrucoes: null,
    whatsAppConfirmado: false,
  },
)

const emit = defineEmits<{
  submit: [dados: OnboardingEstabelecimentoDraft]
  back: []
  verificarWhatsApp: [opts?: { silencioso?: boolean }]
}>()

const dadosConta = {
  nome: props.initial.nome,
  email: props.initial.email,
  telefone: telefoneLocalFromApi(props.initial.telefone),
  logoDataUrl: props.initial.logoDataUrl,
}

const usarDadosCadastrais = ref(props.usarDadosContaPadrao)
const nome = ref(props.initial.nome)
const email = ref(props.initial.email)
const telefone = ref(telefoneLocalFromApi(props.initial.telefone))
const logoDataUrl = ref<string | null>(props.initial.logoDataUrl)
const logoError = ref<string | null>(null)

const statusBanner = computed(() => {
  if (props.telefonePendenteConfirmacao) return 'aguardando' as const
  if (props.whatsAppConfirmado && props.usarDadosContaPadrao) return 'validados' as const
  if (props.usarDadosContaPadrao) return 'encontrados' as const
  return 'padrao' as const
})

let pollTimer: ReturnType<typeof setInterval> | null = null

function stopPoll() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

watch(
  () => props.telefonePendenteConfirmacao,
  (pendente) => {
    stopPoll()
    if (!pendente) return
    pollTimer = setInterval(() => {
      emit('verificarWhatsApp', { silencioso: true })
    }, 4000)
  },
  { immediate: true },
)

watch(
  () => props.whatsAppConfirmado,
  (confirmado) => {
    if (confirmado) stopPoll()
  },
)

onUnmounted(stopPoll)

watch(usarDadosCadastrais, (ligado) => {
  if (ligado) {
    nome.value = dadosConta.nome
    email.value = dadosConta.email
    telefone.value = dadosConta.telefone
    if (dadosConta.logoDataUrl) logoDataUrl.value = dadosConta.logoDataUrl
  } else {
    nome.value = ''
    email.value = ''
    telefone.value = ''
  }
})

async function onAvatarChange(file: File | null) {
  logoError.value = null
  if (!file) {
    logoDataUrl.value = usarDadosCadastrais.value ? dadosConta.logoDataUrl : null
    return
  }
  try {
    logoDataUrl.value = await readFileAsDataUrl(file)
  } catch {
    logoError.value = 'Não foi possível carregar a foto.'
  }
}

function handleSubmit() {
  emit('submit', {
    ...props.initial,
    nome: nome.value.trim(),
    email: email.value.trim(),
    telefone: telefoneToApi(telefone.value),
    logoDataUrl: logoDataUrl.value,
  })
}
</script>

<template>
  <div :class="ONBOARDING_CONTRATAR_CARD_CLASS">
    <div
      class="mb-6 rounded-xl border px-4 py-3"
      :class="{
        'border-glow-gold/40 bg-glow-gold/10': statusBanner === 'encontrados' || statusBanner === 'validados',
        'border-glow-border-soft bg-glow-surface-tint/60': statusBanner === 'padrao',
        'border-amber-400/40 bg-amber-400/10': statusBanner === 'aguardando',
      }"
    >
      <p class="font-urbanist text-sm font-bold text-glow-text">
        <template v-if="statusBanner === 'encontrados'">Encontramos seus dados</template>
        <template v-else-if="statusBanner === 'validados'">Telefone validado</template>
        <template v-else-if="statusBanner === 'aguardando'">Aguardando confirmação no WhatsApp</template>
        <template v-else>Seus dados da conta</template>
      </p>
      <p class="mt-1 font-urbanist text-sm text-glow-text-muted">
        <template v-if="statusBanner === 'aguardando'">
          Envie a mensagem no WhatsApp com o número cadastrado. Depois clique em Continuar.
        </template>
        <template v-else-if="statusBanner === 'validados'">
          Seu número já está confirmado. Revise os dados e siga para o perfil profissional.
        </template>
        <template v-else>
          Revise ou edite as informações da sua conta. Elas serão a base do seu perfil público.
        </template>
      </p>

      <div
        v-if="telefonePendenteConfirmacao && whatsappInstrucoes"
        class="mt-3 flex flex-wrap gap-2"
      >
        <a
          v-if="whatsappInstrucoes.linkWhatsApp"
          :href="whatsappInstrucoes.linkWhatsApp"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex h-9 items-center rounded-lg bg-glow-gold-cta px-3 font-satoshi text-sm font-bold text-white transition hover:brightness-95"
        >
          Abrir WhatsApp
        </a>
        <a
          v-if="whatsappInstrucoes.linkConfirmacao"
          :href="whatsappInstrucoes.linkConfirmacao"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex h-9 items-center rounded-lg border border-glow-border-soft bg-glow-surface px-3 font-satoshi text-sm font-medium text-glow-text transition hover:bg-glow-hover-surface"
        >
          Abrir link de confirmação
        </a>
        <button
          type="button"
          class="inline-flex h-9 items-center rounded-lg border border-glow-border-soft bg-glow-surface px-3 font-satoshi text-sm font-medium text-glow-text transition hover:bg-glow-hover-surface"
          @click="emit('verificarWhatsApp')"
        >
          Já confirmei
        </button>
      </div>
    </div>

    <p
      v-if="errorMessage || logoError"
      class="checkout-alert-error mb-6 px-4 py-3"
      role="alert"
    >
      {{ errorMessage || logoError }}
    </p>

    <form :class="ONBOARDING_CONTRATAR_FORM_CLASS" @submit.prevent="handleSubmit">
      <label
        v-if="usarDadosContaPadrao"
        class="flex cursor-pointer items-start gap-3 font-urbanist text-sm text-glow-text"
      >
        <input
          v-model="usarDadosCadastrais"
          type="checkbox"
          class="mt-0.5 size-4 shrink-0 rounded border-glow-border text-glow-gold focus:ring-glow-gold"
        />
        <span>Usar meus dados cadastrais</span>
      </label>

      <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
        <label for="onb-aut-dados-nome" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">Nome</label>
        <input
          id="onb-aut-dados-nome"
          v-model="nome"
          type="text"
          required
          placeholder="Seu nome completo"
          :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
        />
      </div>

      <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
        <label for="onb-aut-dados-email" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">E-mail</label>
        <input
          id="onb-aut-dados-email"
          v-model="email"
          type="email"
          required
          placeholder="ex: voce@email.com"
          :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
        />
      </div>

      <TelefoneInput
        id="onb-aut-dados-telefone"
        v-model="telefone"
        label="Telefone"
        variant="contratar"
        required
        placeholder="(00) 0 0000-0000"
      />

      <AuthAvatarUpload
        label="Foto da conta (opcional)"
        variant="contratar"
        :preview-url="logoDataUrl"
        @change="onAvatarChange"
        @error="(msg) => (logoError = msg)"
      />

      <OnboardingContratarFormActions
        submit-label="Continuar para Perfil"
        back-label="Voltar aos planos"
        :loading="loading"
        @back="emit('back')"
      />
    </form>
  </div>
</template>
