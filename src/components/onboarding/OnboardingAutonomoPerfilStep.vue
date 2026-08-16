<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import TelefoneInput from '@/components/ui/TelefoneInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import OnboardingContratarFormActions from '@/components/onboarding/OnboardingContratarFormActions.vue'
import { publicoService } from '@/services/publicoService'
import { useUserStore } from '@/stores/user.store'
import type { EstabelecimentoCategoria } from '@/types/estabelecimento.types'
import {
  ONBOARDING_CONTRATAR_FIELD_CLASS,
  ONBOARDING_CONTRATAR_FORM_CLASS,
  ONBOARDING_CONTRATAR_INPUT_CLASS,
  ONBOARDING_CONTRATAR_LABEL_CLASS,
} from '@/constants/designTokens'
import { readFileAsDataUrl } from '@/utils/avatarFile'
import { telefoneLocalFromApi, telefoneToApi } from '@/utils/formatters'
import {
  opcoesCategoriaDoTipo,
  placeholderCategoria,
  sugerirCategoriaId,
} from '@/utils/categoriasEstabelecimento'
import type { OnboardingEstabelecimentoDraft } from '@/types/onboardingAssinatura.types'
import type { WhatsAppConfirmacaoInstrucoes } from '@/types/whatsapp.types'

const props = withDefaults(
  defineProps<{
    initial: OnboardingEstabelecimentoDraft
    loading?: boolean
    errorMessage?: string | null
    usarDadosContaPadrao?: boolean
    avatarContaDisponivel?: boolean
    avatarContaUrl?: string | null
    telefonePendenteConfirmacao?: boolean
    whatsappInstrucoes?: WhatsAppConfirmacaoInstrucoes | null
    whatsAppConfirmado?: boolean
  }>(),
  {
    usarDadosContaPadrao: false,
    avatarContaDisponivel: false,
    avatarContaUrl: null,
    telefonePendenteConfirmacao: false,
    whatsappInstrucoes: null,
    whatsAppConfirmado: false,
  },
)

const emit = defineEmits<{
  submit: [perfil: OnboardingEstabelecimentoDraft]
  back: []
  verificarWhatsApp: [opts?: { silencioso?: boolean }]
}>()

const userStore = useUserStore()

/** Fonte reativa da conta — não depende do draft (que pode estar vazio no mount). */
const dadosConta = computed(() => {
  const profile = userStore.profile
  return {
    nome: (profile?.nome ?? props.initial.nome ?? '').trim(),
    email: (profile?.email ?? props.initial.email ?? '').trim(),
    telefone: telefoneLocalFromApi(profile?.telefone ?? props.initial.telefone),
    logoDataUrl: props.avatarContaUrl ?? props.initial.logoDataUrl ?? null,
  }
})

const usarDadosCadastrais = ref(props.usarDadosContaPadrao)
const nome = ref(props.initial.nome)
const email = ref(props.initial.email)
const telefone = ref(telefoneLocalFromApi(props.initial.telefone))
const descricao = ref(props.initial.descricao)
const logoDataUrl = ref<string | null>(props.initial.logoDataUrl)
const logoError = ref<string | null>(null)
const fotoAlteradaManual = ref(false)
const categorias = ref<EstabelecimentoCategoria[]>([])
const categoriaId = ref(props.initial.categoriaId ? String(props.initial.categoriaId) : '')
const categoriaError = ref<string | null>(null)

const categoriaOptions = computed(() =>
  opcoesCategoriaDoTipo(categorias.value, 'ProfissionalAutonomo'),
)

const categoriaPlaceholder = computed(() => placeholderCategoria('ProfissionalAutonomo'))

const usarFotoPerfil = ref(
  props.avatarContaDisponivel
    && Boolean(props.avatarContaUrl)
    && (props.initial.logoDataUrl === props.avatarContaUrl || !props.initial.logoDataUrl),
)

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

function aplicarDadosConta() {
  const conta = dadosConta.value
  nome.value = conta.nome
  email.value = conta.email
  telefone.value = conta.telefone
  if (!logoDataUrl.value && conta.logoDataUrl) {
    logoDataUrl.value = conta.logoDataUrl
  }
}

function limparDadosConta() {
  nome.value = ''
  email.value = ''
  telefone.value = ''
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

watch(
  () => props.usarDadosContaPadrao,
  (disponivel) => {
    if (disponivel && !usarDadosCadastrais.value) {
      usarDadosCadastrais.value = true
    }
  },
)

watch(
  usarDadosCadastrais,
  (ligado, estavaLigado) => {
    if (ligado) {
      aplicarDadosConta()
      return
    }
    // Só limpa ao desmarcar — não no mount com checkbox off (preserva draft).
    if (estavaLigado === true) limparDadosConta()
  },
  { immediate: true },
)

// Se o perfil carregar depois do mount com o checkbox já ligado, reaplica.
watch(
  dadosConta,
  () => {
    if (usarDadosCadastrais.value) aplicarDadosConta()
  },
  { deep: true },
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

onMounted(async () => {
  if (usarDadosCadastrais.value) aplicarDadosConta()
  if (usarFotoPerfil.value && props.avatarContaUrl) {
    logoDataUrl.value = props.avatarContaUrl
  }
  try {
    categorias.value = await publicoService.listarCategorias('ProfissionalAutonomo')
    categoriaId.value = sugerirCategoriaId(
      categorias.value,
      'ProfissionalAutonomo',
      categoriaId.value,
    )
  } catch {
    categorias.value = []
  }
})

async function onAvatarChange(file: File | null) {
  logoError.value = null
  if (!file) {
    fotoAlteradaManual.value = false
    if (usarFotoPerfil.value && props.avatarContaUrl) {
      logoDataUrl.value = props.avatarContaUrl
    } else {
      logoDataUrl.value = usarDadosCadastrais.value ? dadosConta.value.logoDataUrl : null
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
  categoriaError.value = null
  const catId = categoriaId.value ? Number(categoriaId.value) : undefined
  if (!catId || !categoriaOptions.value.some((opt) => opt.value === String(catId))) {
    categoriaError.value = 'Selecione a área em que você atua.'
    return
  }

  emit('submit', {
    ...props.initial,
    nome: nome.value.trim(),
    email: email.value.trim(),
    telefone: telefoneToApi(telefone.value),
    descricao: descricao.value,
    logoDataUrl: logoDataUrl.value,
    categoriaId: catId,
  })
}
</script>

<template>
  <div class="space-y-6">
    <div
      class="rounded-xl border px-4 py-3"
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
        <template v-else>Seu perfil profissional</template>
      </p>
      <p class="mt-1 font-urbanist text-sm text-glow-text-muted">
        <template v-if="statusBanner === 'aguardando'">
          Envie a mensagem no WhatsApp com o número cadastrado. Depois clique em Continuar.
        </template>
        <template v-else-if="statusBanner === 'validados'">
          Seu número já está confirmado. Revise o perfil e siga para a localização.
        </template>
        <template v-else>
          Como você aparece para os clientes. Revise ou edite as informações.
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
      class="checkout-alert-error px-4 py-3"
      role="alert"
    >
      {{ errorMessage || logoError }}
    </p>

    <form :class="ONBOARDING_CONTRATAR_FORM_CLASS" @submit.prevent="handleSubmit">
      <div class="flex flex-wrap gap-4">
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
      </div>

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

        <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
          <label for="onb-aut-perfil-email" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">E-mail</label>
          <input
            id="onb-aut-perfil-email"
            v-model="email"
            type="email"
            required
            placeholder="ex: voce@email.com"
            :class="ONBOARDING_CONTRATAR_INPUT_CLASS"
          />
        </div>

        <TelefoneInput
          id="onb-aut-perfil-telefone"
          v-model="telefone"
          label="Telefone"
          variant="contratar"
          required
          placeholder="(00) 0 0000-0000"
        />

        <div :class="ONBOARDING_CONTRATAR_FIELD_CLASS">
          <label for="onb-aut-perfil-area" :class="ONBOARDING_CONTRATAR_LABEL_CLASS">
            Em que área você atua?
          </label>
          <BaseSelect
            id="onb-aut-perfil-area"
            v-model="categoriaId"
            :options="categoriaOptions"
            :placeholder="categoriaPlaceholder"
            :error="categoriaError ?? undefined"
            required
          />
        </div>

        <AuthAvatarUpload
          label="Foto profissional"
          variant="contratar"
          :preview-url="logoDataUrl"
          :preview-hint="
            usarFotoPerfil && !fotoAlteradaManual ? 'Usando a foto da sua conta' : undefined
          "
          @change="onAvatarChange"
          @error="(msg) => (logoError = msg)"
        />

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
        back-label="Anterior: Planos"
        :loading="loading"
        @back="emit('back')"
      />
    </form>
  </div>
</template>
