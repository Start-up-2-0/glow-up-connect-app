<script setup lang="ts">
import { ref, watch } from 'vue'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import OnboardingContratarFormActions from '@/components/onboarding/OnboardingContratarFormActions.vue'
import {
  ONBOARDING_CONTRATAR_FIELD_CLASS,
  ONBOARDING_CONTRATAR_FORM_CLASS,
  ONBOARDING_CONTRATAR_INPUT_CLASS,
  ONBOARDING_CONTRATAR_LABEL_CLASS,
} from '@/constants/designTokens'
import { readFileAsDataUrl } from '@/utils/avatarFile'
import type { OnboardingEstabelecimentoDraft } from '@/types/onboardingAssinatura.types'

const props = withDefaults(
  defineProps<{
    initial: OnboardingEstabelecimentoDraft
    loading?: boolean
    errorMessage?: string | null
    avatarContaDisponivel?: boolean
    avatarContaUrl?: string | null
  }>(),
  {
    avatarContaDisponivel: false,
    avatarContaUrl: null,
  },
)

const emit = defineEmits<{
  submit: [perfil: OnboardingEstabelecimentoDraft]
  back: []
}>()

const nome = ref(props.initial.nome)
const descricao = ref(props.initial.descricao)
const logoDataUrl = ref<string | null>(props.initial.logoDataUrl)
const logoError = ref<string | null>(null)
const fotoAlteradaManual = ref(false)

const usarFotoPerfil = ref(
  props.avatarContaDisponivel
    && Boolean(props.avatarContaUrl)
    && props.initial.logoDataUrl === props.avatarContaUrl,
)

watch(usarFotoPerfil, (ligado) => {
  logoError.value = null
  if (ligado && props.avatarContaUrl) {
    fotoAlteradaManual.value = false
    logoDataUrl.value = props.avatarContaUrl
  } else if (!ligado && !fotoAlteradaManual.value) {
    logoDataUrl.value = null
  }
})

async function onLogoChange(file: File | null) {
  logoError.value = null
  if (!file) {
    fotoAlteradaManual.value = false
    if (usarFotoPerfil.value && props.avatarContaUrl) {
      logoDataUrl.value = props.avatarContaUrl
    } else {
      logoDataUrl.value = null
    }
    return
  }
  try {
    const url = await readFileAsDataUrl(file)
    fotoAlteradaManual.value = true
    if (usarFotoPerfil.value) usarFotoPerfil.value = false
    logoDataUrl.value = url
  } catch {
    logoError.value = 'Não foi possível carregar a foto.'
  }
}

function handleSubmit() {
  emit('submit', {
    ...props.initial,
    nome: nome.value.trim(),
    descricao: descricao.value,
    logoDataUrl: logoDataUrl.value,
  })
}
</script>

<template>
  <div class="space-y-6">
    <p
      v-if="errorMessage || logoError"
      class="checkout-alert-error px-4 py-3"
      role="alert"
    >
      {{ errorMessage || logoError }}
    </p>

    <form :class="ONBOARDING_CONTRATAR_FORM_CLASS" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
          <label for="onb-aut-perfil-nome" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">
            Nome profissional
          </label>
          <input
            id="onb-aut-perfil-nome"
            v-model="nome"
            type="text"
            required
            placeholder="Como você quer aparecer para os clientes"
            :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
          />
        </div>

        <div class="space-y-3">
          <label
            v-if="avatarContaDisponivel && avatarContaUrl"
            class="flex cursor-pointer items-start gap-3 font-urbanist text-sm text-glow-text"
          >
            <input
              v-model="usarFotoPerfil"
              type="checkbox"
              class="mt-0.5 size-4 shrink-0 rounded border-glow-border text-glow-gold focus:ring-glow-gold"
            />
            <span>Usar minha foto de perfil</span>
          </label>

          <AuthAvatarUpload
            label="Foto profissional"
            variant="contratar"
            :preview-url="logoDataUrl"
            :preview-hint="
              usarFotoPerfil && !fotoAlteradaManual ? 'Usando a foto da sua conta' : undefined
            "
            @change="onLogoChange"
            @error="(msg) => (logoError = msg)"
          />
        </div>

        <div :class="[ONBOARDING_CONTRATAR_FIELD_CLASS, 'sm:col-span-2']">
          <label for="onb-aut-perfil-bio" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">
            Sobre mim (opcional)
          </label>
          <textarea
            id="onb-aut-perfil-bio"
            v-model="descricao"
            rows="3"
            placeholder="Breve apresentação sobre você e seu trabalho"
            :class="[ONBOARDING_CONTRATAR_INPUT_CLASS, 'h-auto min-h-[96px] py-3']"
          />
        </div>
      </div>

      <OnboardingContratarFormActions
        submit-label="Próximo: Localização"
        back-label="Anterior: Dados"
        :loading="loading"
        @back="emit('back')"
      />
    </form>
  </div>
</template>
