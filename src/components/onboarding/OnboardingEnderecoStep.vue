<script setup lang="ts">
import { ref } from 'vue'
import OnboardingContratarFormActions from '@/components/onboarding/OnboardingContratarFormActions.vue'
import {
  ONBOARDING_CONTRATAR_CARD_CLASS,
  ONBOARDING_CONTRATAR_FIELD_CLASS,
  ONBOARDING_CONTRATAR_FORM_CLASS,
  ONBOARDING_CONTRATAR_INPUT_CLASS,
  ONBOARDING_CONTRATAR_LABEL_CLASS,
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
      class="checkout-alert-error mb-6 px-4 py-3"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <form :class="ONBOARDING_CONTRATAR_FORM_CLASS" @submit.prevent="handleSubmit">
      <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
        <label for="onb-end-cep" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">CEP</label>
        <input
          id="onb-end-cep"
          v-model="cep"
          type="text"
          required
          placeholder="00000-000"
          :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
        />
      </div>

      <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
        <label for="onb-end-logradouro" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">Logradouro</label>
        <input
          id="onb-end-logradouro"
          v-model="logradouro"
          type="text"
          required
          placeholder="Rua, avenida..."
          :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
        />
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-3.5">
        <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
          <label for="onb-end-numero" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">Número</label>
          <input
            id="onb-end-numero"
            v-model="numero"
            type="text"
            required
            :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
          />
        </div>

        <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
          <label for="onb-end-bairro" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">Bairro</label>
          <input
            id="onb-end-bairro"
            v-model="bairro"
            type="text"
            required
            :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-3.5">
        <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
          <label for="onb-end-cidade" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">Cidade</label>
          <input
            id="onb-end-cidade"
            v-model="cidade"
            type="text"
            required
            :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
          />
        </div>

        <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
          <label for="onb-end-estado" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">Estado</label>
          <input
            id="onb-end-estado"
            v-model="estado"
            type="text"
            maxlength="2"
            required
            placeholder="UF"
            :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
          />
        </div>
      </div>

      <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
        <label for="onb-end-complemento" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">Complemento (opcional)</label>
        <input
          id="onb-end-complemento"
          v-model="complemento"
          type="text"
          :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
        />
      </div>

      <OnboardingContratarFormActions :loading="loading" @back="emit('back')" />
    </form>
  </div>
</template>
