<script setup lang="ts">
import { computed } from 'vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import FieldMessage from '@/components/form/FieldMessage.vue'
import {
  GLOW_INPUT_CLASS,
  GLOW_LABEL_CLASS,
  ONBOARDING_CONTRATAR_FIELD_CLASS,
  ONBOARDING_CONTRATAR_INPUT_CLASS,
  ONBOARDING_CONTRATAR_LABEL_CLASS,
} from '@/constants/designTokens'
import { useCepLookup } from '@/composables/useCepLookup'
import ThirdPartyConsentNotice from '@/components/legal/ThirdPartyConsentNotice.vue'
import type { EnderecoFormFields } from '@/types/endereco.types'
import { normalizeUf } from '@/utils/cep'

const props = withDefaults(
  defineProps<{
    modelValue: EnderecoFormFields
    variant?: 'contratar' | 'auth' | 'dashboard'
    idPrefix?: string
    showComplemento?: boolean
    gridClass?: string
  }>(),
  {
    variant: 'dashboard',
    idPrefix: 'endereco',
    showComplemento: true,
    gridClass: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: EnderecoFormFields]
}>()

const isContratar = computed(() => props.variant === 'contratar')
const isAuth = computed(() => props.variant === 'auth')

const fieldClass = computed(() =>
  isContratar.value || isAuth.value ? ONBOARDING_CONTRATAR_FIELD_CLASS : 'flex flex-col gap-2',
)

const labelClass = computed(() => {
  if (isContratar.value) return ONBOARDING_CONTRATAR_LABEL_CLASS
  if (isAuth.value) return GLOW_LABEL_CLASS
  return 'font-urbanist text-sm font-medium text-glow-text'
})

const inputClass = computed(() => {
  if (isContratar.value) return ONBOARDING_CONTRATAR_INPUT_CLASS
  if (isAuth.value) return GLOW_INPUT_CLASS
  return ''
})

const rootClass = computed(() => {
  if (props.gridClass) return props.gridClass
  if (isAuth.value) return 'contents'
  return 'flex flex-col gap-6'
})

function patchFields(patch: Partial<EnderecoFormFields>) {
  emit('update:modelValue', { ...props.modelValue, ...patch })
}

const { loading: cepLoading, error: cepError, consentBlocked, onCepInput } = useCepLookup(
  () => props.modelValue,
  patchFields,
)

function fieldId(name: string) {
  return `${props.idPrefix}-${name}`
}

function updateField<K extends keyof EnderecoFormFields>(key: K, value: EnderecoFormFields[K]) {
  patchFields({ [key]: value } as Partial<EnderecoFormFields>)
}

function onEstadoInput(event: Event) {
  updateField('estado', normalizeUf((event.target as HTMLInputElement).value))
}
</script>

<template>
  <div :class="rootClass">
    <div :class="[fieldClass, isAuth ? 'sm:col-span-2' : '']">
      <label :for="fieldId('cep')" :class="labelClass">CEP</label>
      <div class="relative">
        <input
          v-if="isContratar || isAuth"
          :id="fieldId('cep')"
          :value="modelValue.cep"
          type="text"
          required
          inputmode="numeric"
          autocomplete="postal-code"
          placeholder="00000-000"
          :class="inputClass"
          @input="onCepInput(($event.target as HTMLInputElement).value)"
        />
        <BaseInput
          v-else
          :id="fieldId('cep')"
          :model-value="modelValue.cep"
          placeholder="00000-000"
          autocomplete="postal-code"
          @update:model-value="onCepInput($event)"
        />
        <span
          v-if="cepLoading"
          class="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-glow-gold border-t-transparent"
          aria-hidden="true"
        />
      </div>
      <FieldMessage v-if="cepError && !consentBlocked" variant="error">{{ cepError }}</FieldMessage>
      <ThirdPartyConsentNotice v-if="consentBlocked" compact class="mt-2" />
    </div>

    <div :class="[fieldClass, isAuth ? 'sm:col-span-2' : '']">
      <label :for="fieldId('logradouro')" :class="labelClass">Logradouro</label>
      <input
        v-if="isContratar || isAuth"
        :id="fieldId('logradouro')"
        :value="modelValue.logradouro"
        type="text"
        required
        placeholder="Rua, avenida..."
        :class="inputClass"
        @input="updateField('logradouro', ($event.target as HTMLInputElement).value)"
      />
      <BaseInput
        v-else
        :id="fieldId('logradouro')"
        :model-value="modelValue.logradouro"
        placeholder="Rua, avenida..."
        @update:model-value="updateField('logradouro', $event)"
      />
    </div>

    <div :class="[isAuth ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-2 sm:col-span-2' : 'grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-3.5']">
      <div :class="fieldClass">
        <label :for="fieldId('numero')" :class="labelClass">Número</label>
        <input
          v-if="isContratar || isAuth"
          :id="fieldId('numero')"
          :value="modelValue.numero"
          type="text"
          required
          :class="inputClass"
          @input="updateField('numero', ($event.target as HTMLInputElement).value)"
        />
        <BaseInput
          v-else
          :id="fieldId('numero')"
          :model-value="modelValue.numero"
          @update:model-value="updateField('numero', $event)"
        />
      </div>

      <div :class="fieldClass">
        <label :for="fieldId('bairro')" :class="labelClass">Bairro</label>
        <input
          v-if="isContratar || isAuth"
          :id="fieldId('bairro')"
          :value="modelValue.bairro"
          type="text"
          required
          :class="inputClass"
          @input="updateField('bairro', ($event.target as HTMLInputElement).value)"
        />
        <BaseInput
          v-else
          :id="fieldId('bairro')"
          :model-value="modelValue.bairro"
          @update:model-value="updateField('bairro', $event)"
        />
      </div>
    </div>

    <div :class="[isAuth ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-2 sm:col-span-2' : 'grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-x-3.5']">
      <div :class="fieldClass">
        <label :for="fieldId('cidade')" :class="labelClass">Cidade</label>
        <input
          v-if="isContratar || isAuth"
          :id="fieldId('cidade')"
          :value="modelValue.cidade"
          type="text"
          required
          :class="inputClass"
          @input="updateField('cidade', ($event.target as HTMLInputElement).value)"
        />
        <BaseInput
          v-else
          :id="fieldId('cidade')"
          :model-value="modelValue.cidade"
          @update:model-value="updateField('cidade', $event)"
        />
      </div>

      <div :class="fieldClass">
        <label :for="fieldId('estado')" :class="labelClass">Estado</label>
        <input
          v-if="isContratar || isAuth"
          :id="fieldId('estado')"
          :value="modelValue.estado"
          type="text"
          maxlength="2"
          required
          placeholder="UF"
          :class="inputClass"
          @input="onEstadoInput"
        />
        <BaseInput
          v-else
          :id="fieldId('estado')"
          :model-value="modelValue.estado"
          placeholder="UF"
          @update:model-value="updateField('estado', normalizeUf($event))"
        />
      </div>
    </div>

    <div v-if="showComplemento" :class="[fieldClass, isAuth ? 'sm:col-span-2' : '']">
      <label :for="fieldId('complemento')" :class="labelClass">
        Complemento
        <span v-if="isContratar || isAuth" class="font-normal text-glow-text-subtle">(opcional)</span>
      </label>
      <input
        v-if="isContratar || isAuth"
        :id="fieldId('complemento')"
        :value="modelValue.complemento"
        type="text"
        :placeholder="isAuth ? 'Opcional' : undefined"
        :class="inputClass"
        @input="updateField('complemento', ($event.target as HTMLInputElement).value)"
      />
      <BaseInput
        v-else
        :id="fieldId('complemento')"
        :model-value="modelValue.complemento"
        placeholder="Opcional"
        @update:model-value="updateField('complemento', $event)"
      />
    </div>
  </div>
</template>
