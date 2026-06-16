<script setup lang="ts">
import { ref } from 'vue'
import OnboardingContratarFormActions from '@/components/onboarding/OnboardingContratarFormActions.vue'
import {
  GLOW_INPUT_CLASS,
  GLOW_LABEL_CLASS,
  ONBOARDING_CONTRATAR_CARD_CLASS,
  ONBOARDING_CONTRATAR_FORM_CLASS,
} from '@/constants/designTokens'
import type { OnboardingEstabelecimentoDraft } from '@/types/onboardingAssinatura.types'

const props = defineProps<{
  initial: OnboardingEstabelecimentoDraft
  loading?: boolean
  errorMessage?: string | null
}>()

const emit = defineEmits<{
  submit: [estabelecimento: OnboardingEstabelecimentoDraft]
  back: []
}>()

const cep = ref(props.initial.cep)
const logradouro = ref(props.initial.logradouro)
const numero = ref(props.initial.numero)
const bairro = ref(props.initial.bairro)
const cidade = ref(props.initial.cidade)
const estado = ref(props.initial.estado)
const complemento = ref(props.initial.complemento)

function handleSubmit() {
  emit('submit', {
    ...props.initial,
    cep: cep.value,
    logradouro: logradouro.value,
    numero: numero.value,
    bairro: bairro.value,
    cidade: cidade.value,
    estado: estado.value,
    complemento: complemento.value,
  })
}
</script>

<template>
  <div :class="ONBOARDING_CONTRATAR_CARD_CLASS">
    <p
      v-if="errorMessage"
      class="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <form :class="ONBOARDING_CONTRATAR_FORM_CLASS" @submit.prevent="handleSubmit">
      <div class="flex flex-col gap-2">
        <label for="onb-end-cep" :class="GLOW_LABEL_CLASS">CEP</label>
        <input
          id="onb-end-cep"
          v-model="cep"
          type="text"
          required
          placeholder="00000-000"
          :class="GLOW_INPUT_CLASS"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="onb-end-logradouro" :class="GLOW_LABEL_CLASS">Logradouro</label>
        <input
          id="onb-end-logradouro"
          v-model="logradouro"
          type="text"
          required
          placeholder="Rua, avenida..."
          :class="GLOW_INPUT_CLASS"
        />
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-4">
        <div class="flex flex-col gap-2">
          <label for="onb-end-numero" :class="GLOW_LABEL_CLASS">Número</label>
          <input
            id="onb-end-numero"
            v-model="numero"
            type="text"
            required
            :class="GLOW_INPUT_CLASS"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="onb-end-bairro" :class="GLOW_LABEL_CLASS">Bairro</label>
          <input
            id="onb-end-bairro"
            v-model="bairro"
            type="text"
            required
            :class="GLOW_INPUT_CLASS"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-4">
        <div class="flex flex-col gap-2">
          <label for="onb-end-cidade" :class="GLOW_LABEL_CLASS">Cidade</label>
          <input
            id="onb-end-cidade"
            v-model="cidade"
            type="text"
            required
            :class="GLOW_INPUT_CLASS"
          />
        </div>

        <div class="flex flex-col gap-2">
          <label for="onb-end-estado" :class="GLOW_LABEL_CLASS">Estado</label>
          <input
            id="onb-end-estado"
            v-model="estado"
            type="text"
            maxlength="2"
            required
            placeholder="UF"
            :class="GLOW_INPUT_CLASS"
          />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <label for="onb-end-complemento" :class="GLOW_LABEL_CLASS">Complemento (opcional)</label>
        <input
          id="onb-end-complemento"
          v-model="complemento"
          type="text"
          :class="GLOW_INPUT_CLASS"
        />
      </div>

      <OnboardingContratarFormActions
        :loading="loading"
        @submit="handleSubmit"
        @back="emit('back')"
      />
    </form>
  </div>
</template>
