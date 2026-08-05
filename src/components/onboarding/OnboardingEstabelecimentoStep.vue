<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import TelefoneInput from '@/components/ui/TelefoneInput.vue'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import EnderecoForm from '@/components/form/EnderecoForm.vue'
import { publicoService } from '@/services/publicoService'
import type { EstabelecimentoCategoria } from '@/types/estabelecimento.types'
import OnboardingContratarFormActions from '@/components/onboarding/OnboardingContratarFormActions.vue'
import {
  AGENDAR_BTN_CONTINUE_CLASS,
  GLOW_AUTH_FORM_GRID_CLASS,
  GLOW_INPUT_CLASS,
  GLOW_LABEL_CLASS,
  ONBOARDING_CONTRATAR_CARD_CLASS,
  ONBOARDING_CONTRATAR_FIELD_CLASS,
  ONBOARDING_CONTRATAR_FORM_CLASS,
  ONBOARDING_CONTRATAR_INPUT_CLASS,
  ONBOARDING_CONTRATAR_LABEL_CLASS,
} from '@/constants/designTokens'
import type { OnboardingUiVariant } from '@/constants/onboardingWizardSteps'
import { readFileAsDataUrl } from '@/utils/avatarFile'
import { validateEnderecoForSubmit } from '@/utils/enderecoPayload'
import { telefoneLocalFromApi, telefoneToApi } from '@/utils/formatters'
import type { EnderecoFormFields } from '@/types/endereco.types'
import type { OnboardingEstabelecimentoDraft } from '@/types/onboardingAssinatura.types'

const props = withDefaults(
  defineProps<{
    initial: OnboardingEstabelecimentoDraft
    loading?: boolean
    errorMessage?: string | null
    variant?: OnboardingUiVariant
    embedded?: boolean
    submitLabel?: string
    backLabel?: string
    showBack?: boolean
  }>(),
  {
    variant: 'public',
    embedded: false,
    submitLabel: 'Continuar para assinatura',
    backLabel: 'Voltar',
    showBack: false,
  },
)

const emit = defineEmits<{
  submit: [estabelecimento: OnboardingEstabelecimentoDraft]
  back: []
}>()

const isPublic = computed(() => props.variant === 'public')
const isContratar = computed(() => props.variant === 'contratar')
const fieldIdPrefix = computed(() => {
  if (isPublic.value) return 'onb-est'
  if (isContratar.value) return 'onb-est-contratar'
  return 'onb-est-dash'
})

const nome = ref(props.initial.nome)
const descricao = ref(props.initial.descricao)
const telefone = ref(telefoneLocalFromApi(props.initial.telefone))
const email = ref(props.initial.email)
const cep = ref(props.initial.cep)
const logradouro = ref(props.initial.logradouro)
const numero = ref(props.initial.numero)
const bairro = ref(props.initial.bairro)
const cidade = ref(props.initial.cidade)
const estado = ref(props.initial.estado)
const complemento = ref(props.initial.complemento)

const endereco = computed<EnderecoFormFields>({
  get: () => ({
    cep: cep.value,
    logradouro: logradouro.value,
    numero: numero.value,
    bairro: bairro.value,
    cidade: cidade.value,
    estado: estado.value,
    complemento: complemento.value,
  }),
  set: (value) => {
    cep.value = value.cep
    logradouro.value = value.logradouro
    numero.value = value.numero
    bairro.value = value.bairro
    cidade.value = value.cidade
    estado.value = value.estado
    complemento.value = value.complemento
  },
})

const logoDataUrl = ref<string | null>(props.initial.logoDataUrl)
const logoError = ref<string | null>(null)
const enderecoError = ref<string | null>(null)

const categorias = ref<EstabelecimentoCategoria[]>([])
const categoriaId = ref<string>(props.initial.categoriaId ? String(props.initial.categoriaId) : '')
const categoriaError = ref<string | null>(null)

const categoriaOptions = computed(() =>
  categorias.value.map((c) => ({ value: String(c.id), label: c.nome })),
)

onMounted(async () => {
  try {
    categorias.value = await publicoService.listarCategorias()
  } catch {
    categorias.value = []
  }
})

const shellClass = computed(() => {
  if (isContratar.value && !props.embedded) return ONBOARDING_CONTRATAR_CARD_CLASS
  return isPublic.value ? 'space-y-6' : ''
})

const alertMessage = computed(() => props.errorMessage || logoError.value || enderecoError.value || categoriaError.value)

async function onLogoChange(file: File | null) {
  logoError.value = null
  if (!file) {
    logoDataUrl.value = null
    return
  }
  try {
    logoDataUrl.value = await readFileAsDataUrl(file)
  } catch {
    logoError.value = 'Não foi possível carregar a logo.'
  }
}

function handleSubmit() {
  enderecoError.value = null
  categoriaError.value = null

  if (isContratar.value) {
    const validationError = validateEnderecoForSubmit(endereco.value)
    if (validationError) {
      enderecoError.value = validationError
      return
    }
  }

  // Categoria do estabelecimento é obrigatória.
  if (!categoriaId.value) {
    categoriaError.value = 'Selecione a categoria do estabelecimento.'
    return
  }

  emit('submit', {
    nome: nome.value,
    descricao: descricao.value,
    telefone: telefoneToApi(telefone.value),
    email: email.value,
    cep: cep.value,
    logradouro: logradouro.value,
    numero: numero.value,
    bairro: bairro.value,
    cidade: cidade.value,
    estado: estado.value,
    complemento: complemento.value,
    logoDataUrl: logoDataUrl.value,
    categoriaId: Number(categoriaId.value),
  })
}
</script>

<template>
  <div :class="shellClass">
    <header v-if="!isContratar" :class="isPublic ? '' : 'mb-6'">
      <h1 :class="isPublic ? 'agendar-section-title' : 'font-satoshi text-2xl font-bold text-glow-text'">
        Cadastre seu estabelecimento
      </h1>
      <p
        :class="
          isPublic
            ? 'agendar-section-subtitle mt-2'
            : 'mt-1 text-sm text-glow-text-subtle'
        "
      >
        Informe os dados do negócio que será vinculado à assinatura.
      </p>
    </header>

    <header v-else class="mb-6">
      <h1
        class="font-satoshi font-bold text-glow-text"
        :class="embedded ? 'text-xl' : 'text-2xl'"
      >
        Cadastre seu estabelecimento
      </h1>
      <p class="mt-2 font-satoshi text-base text-glow-text-subtle">
        Informe os dados do negócio que será vinculado à assinatura.
      </p>
    </header>

    <p
      v-if="alertMessage"
      :class="isContratar ? 'checkout-alert-error mb-6 px-4 py-3' : 'rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800/50 dark:bg-red-950/30 dark:text-red-300'"
      role="alert"
    >
      {{ alertMessage }}
    </p>

    <form
      :class="isContratar ? ONBOARDING_CONTRATAR_FORM_CLASS : 'flex w-full flex-col gap-6'"
      @submit.prevent="handleSubmit"
    >
      <template v-if="isContratar">
        <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
          <label :for="`${fieldIdPrefix}-nome`" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">
            Nome do estabelecimento
          </label>
          <input
            :id="`${fieldIdPrefix}-nome`"
            v-model="nome"
            type="text"
            required
            placeholder="Informe o nome do seu estabelecimento"
            :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
          />
        </div>

        <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
          <label :for="`${fieldIdPrefix}-descricao`" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">
            Descrição (opcional)
          </label>
          <input
            :id="`${fieldIdPrefix}-descricao`"
            v-model="descricao"
            type="text"
            placeholder="Breve apresentação do seu negócio"
            :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
          />
        </div>

        <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
          <label :for="`${fieldIdPrefix}-categoria`" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">
            Categoria do estabelecimento
          </label>
          <BaseSelect
            :id="`${fieldIdPrefix}-categoria`"
            v-model="categoriaId"
            :options="categoriaOptions"
            placeholder="Selecione a categoria"
            :error="categoriaError ?? undefined"
            required
          />
        </div>

        <AuthAvatarUpload
          label="Logo do estabelecimento"
          variant="contratar"
          @change="onLogoChange"
          @error="(msg) => (logoError = msg)"
        />

        <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
          <label :for="`${fieldIdPrefix}-email`" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">
            E-mail comercial
          </label>
          <input
            :id="`${fieldIdPrefix}-email`"
            v-model="email"
            type="email"
            required
            placeholder="ex: usuario01@gmail.com"
            :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
          />
        </div>

        <TelefoneInput
          :id="`${fieldIdPrefix}-telefone`"
          v-model="telefone"
          label="Telefone comercial"
          variant="contratar"
          required
          placeholder="(00) 0 0000-0000"
        />

        <EnderecoForm
          v-model="endereco"
          variant="contratar"
          :id-prefix="`${fieldIdPrefix}-end`"
        />

        <OnboardingContratarFormActions
          :loading="loading"
          :submit-label="submitLabel"
          :back-label="backLabel"
          :show-back="showBack"
          @back="emit('back')"
        />
      </template>

      <template v-else>
        <div :class="GLOW_AUTH_FORM_GRID_CLASS">
          <div class="flex flex-col gap-2 sm:col-span-2">
            <label :for="`${fieldIdPrefix}-nome`" :class="GLOW_LABEL_CLASS">Nome do estabelecimento</label>
            <input
              :id="`${fieldIdPrefix}-nome`"
              v-model="nome"
              type="text"
              required
              placeholder="Nome do seu negócio"
              :class="GLOW_INPUT_CLASS"
            />
          </div>

          <div class="flex flex-col gap-2 sm:col-span-2">
            <label :for="`${fieldIdPrefix}-descricao`" :class="GLOW_LABEL_CLASS">Descrição</label>
            <input
              :id="`${fieldIdPrefix}-descricao`"
              v-model="descricao"
              type="text"
              placeholder="Opcional — breve apresentação do negócio"
              :class="GLOW_INPUT_CLASS"
            />
          </div>

          <div class="flex flex-col gap-2 sm:col-span-2">
            <label :for="`${fieldIdPrefix}-categoria`" :class="GLOW_LABEL_CLASS">Categoria do estabelecimento</label>
            <BaseSelect
              :id="`${fieldIdPrefix}-categoria`"
              v-model="categoriaId"
              :options="categoriaOptions"
              placeholder="Selecione a categoria"
              :error="categoriaError ?? undefined"
              required
            />
          </div>

          <div class="sm:col-span-2">
            <AuthAvatarUpload label="Logo" @change="onLogoChange" @error="(msg) => (logoError = msg)" />
          </div>

          <TelefoneInput
            :id="`${fieldIdPrefix}-telefone`"
            v-model="telefone"
            label="Telefone comercial"
            variant="auth"
            required
            placeholder="(00) 0 0000-0000"
          />

          <div class="flex flex-col gap-2">
            <label :for="`${fieldIdPrefix}-email`" :class="GLOW_LABEL_CLASS">E-mail comercial</label>
            <input
              :id="`${fieldIdPrefix}-email`"
              v-model="email"
              type="email"
              required
              placeholder="contato@seunegocio.com"
              :class="GLOW_INPUT_CLASS"
            />
          </div>

          <EnderecoForm
            v-model="endereco"
            :variant="isPublic ? 'auth' : 'dashboard'"
            :id-prefix="`${fieldIdPrefix}-end`"
            grid-class="contents"
          />
        </div>

        <button
          v-if="isPublic"
          type="submit"
          :disabled="loading"
          :class="AGENDAR_BTN_CONTINUE_CLASS"
        >
          <span
            v-if="loading"
            class="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-glow-text border-t-transparent"
          />
          {{ submitLabel }}
        </button>

        <BaseButton v-else type="submit" variant="primary" block :loading="loading">
          {{ submitLabel }}
        </BaseButton>
      </template>
    </form>
  </div>
</template>
