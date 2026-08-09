<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import TelefoneInput from '@/components/ui/TelefoneInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import OnboardingContratarFormActions from '@/components/onboarding/OnboardingContratarFormActions.vue'
import { publicoService } from '@/services/publicoService'
import type { EstabelecimentoCategoria } from '@/types/estabelecimento.types'
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

const props = withDefaults(
  defineProps<{
    initial: OnboardingEstabelecimentoDraft
    loading?: boolean
    errorMessage?: string | null
    modoAutonomo?: boolean
    /** Prefill da conta disponível (nome/e-mail/telefone). */
    usarDadosContaPadrao?: boolean
    /** Conta possui avatar para reutilizar como foto profissional. */
    avatarContaDisponivel?: boolean
  }>(),
  {
    modoAutonomo: false,
    usarDadosContaPadrao: false,
    avatarContaDisponivel: false,
  },
)

const emit = defineEmits<{
  submit: [estabelecimento: OnboardingEstabelecimentoDraft]
  back: []
}>()

const dadosConta = {
  nome: props.initial.nome,
  email: props.initial.email,
  telefone: telefoneLocalFromApi(props.initial.telefone),
  logoDataUrl: props.initial.logoDataUrl,
}

const usarDadosCadastrais = ref(props.modoAutonomo && props.usarDadosContaPadrao)
const usarFotoPerfil = ref(
  props.modoAutonomo
    && props.avatarContaDisponivel
    && Boolean(dadosConta.logoDataUrl),
)

const nome = ref(props.initial.nome)
const descricao = ref(props.initial.descricao)
const telefone = ref(telefoneLocalFromApi(props.initial.telefone))
const email = ref(props.initial.email)
const logoDataUrl = ref<string | null>(props.initial.logoDataUrl)
const logoError = ref<string | null>(null)
const fotoAlteradaManual = ref(false)

const categorias = ref<EstabelecimentoCategoria[]>([])
const categoriaId = ref(props.initial.categoriaId ? String(props.initial.categoriaId) : '')
const categoriaError = ref<string | null>(null)

/** Escopo atual: Barbearia e Salão de Beleza. */
const CATEGORIA_IDS_ATIVAS = new Set([1, 2])

const categoriaOptions = computed(() =>
  categorias.value
    .filter((c) => CATEGORIA_IDS_ATIVAS.has(c.id))
    .map((c) => ({ value: String(c.id), label: c.nome })),
)

const mostrarReusoDados = computed(
  () => props.modoAutonomo && props.usarDadosContaPadrao,
)

const mostrarReusoFoto = computed(
  () => props.modoAutonomo && props.avatarContaDisponivel && Boolean(dadosConta.logoDataUrl),
)

onMounted(async () => {
  try {
    categorias.value = await publicoService.listarCategorias()
  } catch {
    categorias.value = []
  }
})

watch(usarDadosCadastrais, (ligado) => {
  if (!props.modoAutonomo) return
  if (ligado) {
    nome.value = dadosConta.nome
    email.value = dadosConta.email
    telefone.value = dadosConta.telefone
  } else {
    nome.value = ''
    email.value = ''
    telefone.value = ''
  }
})

watch(usarFotoPerfil, (ligado) => {
  if (!props.modoAutonomo) return
  logoError.value = null
  if (ligado && dadosConta.logoDataUrl) {
    fotoAlteradaManual.value = false
    logoDataUrl.value = dadosConta.logoDataUrl
  } else if (!ligado && !fotoAlteradaManual.value) {
    logoDataUrl.value = null
  }
})

async function onLogoChange(file: File | null) {
  logoError.value = null
  if (!file) {
    fotoAlteradaManual.value = false
    if (usarFotoPerfil.value && dadosConta.logoDataUrl) {
      logoDataUrl.value = dadosConta.logoDataUrl
    } else {
      logoDataUrl.value = null
    }
    return
  }
  try {
    const url = await readFileAsDataUrl(file)
    fotoAlteradaManual.value = true
    if (usarFotoPerfil.value) {
      usarFotoPerfil.value = false
    }
    logoDataUrl.value = url
  } catch {
    logoError.value = props.modoAutonomo
      ? 'Não foi possível carregar a foto.'
      : 'Não foi possível carregar a logo.'
  }
}

function handleSubmit() {
  categoriaError.value = null
  if (!props.modoAutonomo && !categoriaId.value) {
    categoriaError.value = 'Selecione a categoria do estabelecimento.'
    return
  }

  emit('submit', {
    ...props.initial,
    nome: nome.value,
    descricao: descricao.value,
    telefone: telefoneToApi(telefone.value),
    email: email.value,
    logoDataUrl: logoDataUrl.value,
    categoriaId: props.modoAutonomo
      ? undefined
      : categoriaId.value
        ? Number(categoriaId.value)
        : undefined,
  })
}
</script>

<template>
  <div :class="ONBOARDING_CONTRATAR_CARD_CLASS">
    <p
      v-if="errorMessage || logoError || categoriaError"
      class="checkout-alert-error mb-6 px-4 py-3"
      role="alert"
    >
      {{ errorMessage || logoError || categoriaError }}
    </p>

    <form :class="ONBOARDING_CONTRATAR_FORM_CLASS" @submit.prevent="handleSubmit">
      <div
        v-if="mostrarReusoDados || mostrarReusoFoto"
        class="mb-2 space-y-3 rounded-lg border border-glow-border-soft bg-glow-surface-tint/60 px-4 py-3"
      >
        <p
          v-if="mostrarReusoDados"
          class="font-urbanist text-sm text-glow-text-muted"
        >
          Encontramos seus dados cadastrais. Deseja utilizá-los no seu perfil profissional?
        </p>

        <label
          v-if="mostrarReusoDados"
          class="flex cursor-pointer items-start gap-3 font-urbanist text-sm text-glow-text"
        >
          <input
            v-model="usarDadosCadastrais"
            type="checkbox"
            class="mt-0.5 size-4 shrink-0 rounded border-glow-border text-glow-gold focus:ring-glow-gold"
          />
          <span>Usar meus dados cadastrais</span>
        </label>

        <label
          v-if="mostrarReusoFoto"
          class="flex cursor-pointer items-start gap-3 font-urbanist text-sm text-glow-text"
        >
          <input
            v-model="usarFotoPerfil"
            type="checkbox"
            class="mt-0.5 size-4 shrink-0 rounded border-glow-border text-glow-gold focus:ring-glow-gold"
          />
          <span>Usar minha foto de perfil</span>
        </label>
      </div>

      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
          <label for="onb-info-nome" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">
            {{ modoAutonomo ? 'Nome profissional' : 'Nome do estabelecimento' }}
          </label>
          <input
            id="onb-info-nome"
            v-model="nome"
            type="text"
            required
            :placeholder="
              modoAutonomo
                ? 'Informe seu nome profissional'
                : 'Informe o nome do seu estabelecimento'
            "
            :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
          />
        </div>

        <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
          <label for="onb-info-descricao" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">
            {{ modoAutonomo ? 'Sobre mim (opcional)' : 'Descrição (opcional)' }}
          </label>
          <input
            id="onb-info-descricao"
            v-model="descricao"
            type="text"
            :placeholder="
              modoAutonomo
                ? 'Breve apresentação sobre você'
                : 'Breve apresentação do seu negócio'
            "
            :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
          />
        </div>

        <div v-if="!modoAutonomo" :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
          <label for="onb-info-categoria" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">
            Tipo de categoria
          </label>
          <BaseSelect
            id="onb-info-categoria"
            v-model="categoriaId"
            :options="categoriaOptions"
            placeholder="Selecione: Salão de Beleza ou Barbearia"
            :error="categoriaError ?? undefined"
            required
          />
        </div>

        <AuthAvatarUpload
          :label="modoAutonomo ? 'Foto profissional' : 'Logo do estabelecimento'"
          variant="contratar"
          :preview-url="logoDataUrl"
          :preview-hint="
            modoAutonomo && usarFotoPerfil && !fotoAlteradaManual
              ? 'Usando a foto da sua conta'
              : undefined
          "
          @change="onLogoChange"
          @error="(msg) => (logoError = msg)"
        />

        <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
          <label for="onb-info-email" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">
            {{ modoAutonomo ? 'E-mail' : 'E-mail comercial' }}
          </label>
          <input
            id="onb-info-email"
            v-model="email"
            type="email"
            required
            placeholder="ex: usuario01@gmail.com"
            :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
          />
        </div>

        <TelefoneInput
          id="onb-info-telefone"
          v-model="telefone"
          :label="modoAutonomo ? 'Telefone' : 'Telefone comercial'"
          variant="contratar"
          required
          placeholder="(00) 0 0000-0000"
        />
      </div>

      <OnboardingContratarFormActions submit-label="Continuar" back-label="Voltar" :loading="loading" @back="emit('back')" />
    </form>
  </div>
</template>
