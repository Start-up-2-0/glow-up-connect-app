<script setup lang="ts">
import {
  ONBOARDING_CONTRATAR_BTN_PRIMARY_CLASS,
  ONBOARDING_CONTRATAR_BTN_SECONDARY_CLASS,
  ONBOARDING_CONTRATAR_CARD_CLASS,
} from '@/constants/designTokens'
import { formatEnderecoOnboarding, telefoneLocalFromApi } from '@/utils/formatters'
import type { OnboardingEstabelecimentoDraft } from '@/types/onboardingAssinatura.types'

defineProps<{
  perfil: OnboardingEstabelecimentoDraft
  loading?: boolean
  errorMessage?: string | null
}>()

const emit = defineEmits<{
  back: []
  submit: []
  edit: [destino: 'dados' | 'perfil' | 'endereco']
}>()
</script>

<template>
  <div class="space-y-6">
    <p
      v-if="errorMessage"
      class="checkout-alert-error px-4 py-3"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <article :class="ONBOARDING_CONTRATAR_CARD_CLASS">
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="font-urbanist text-sm font-bold text-glow-text">Prévia do perfil</p>
          <p class="mt-1 font-urbanist text-sm text-glow-text-muted">
            Assim os clientes verão você na plataforma.
          </p>
        </div>
        <button
          type="button"
          class="font-satoshi text-sm font-medium text-glow-gold-cta transition hover:brightness-95"
          @click="emit('edit', 'perfil')"
        >
          Editar perfil
        </button>
      </div>

      <div class="mt-6 flex gap-4">
        <div
          v-if="perfil.logoDataUrl"
          class="size-16 shrink-0 overflow-hidden rounded-full sm:size-[72px]"
        >
          <img
            :src="perfil.logoDataUrl"
            alt="Foto profissional"
            class="size-full object-cover"
          />
        </div>
        <div
          v-else
          class="flex size-16 shrink-0 items-center justify-center rounded-full bg-glow-canvas font-urbanist text-xl font-bold text-glow-text-muted sm:size-[72px]"
          aria-hidden="true"
        >
          {{ perfil.nome.charAt(0) }}
        </div>

        <div class="min-w-0 flex-1">
          <p class="font-satoshi text-xl font-bold text-glow-text">{{ perfil.nome }}</p>
          <p
            v-if="perfil.descricao"
            class="mt-1 font-urbanist text-sm text-glow-text-muted"
          >
            {{ perfil.descricao }}
          </p>
        </div>
      </div>

      <ul class="mt-6 space-y-3 border-t border-glow-border-soft pt-5">
        <li class="flex items-start justify-between gap-3">
          <div>
            <p class="font-urbanist text-xs font-bold uppercase tracking-wide text-glow-text-subtle">
              Contato
            </p>
            <p class="mt-1 font-urbanist text-sm text-glow-text">
              {{ telefoneLocalFromApi(perfil.telefone) }}
            </p>
            <p class="font-urbanist text-sm text-glow-text-muted">{{ perfil.email }}</p>
          </div>
          <button
            type="button"
            class="shrink-0 font-satoshi text-sm font-medium text-glow-gold-cta"
            @click="emit('edit', 'dados')"
          >
            Editar
          </button>
        </li>
        <li class="flex items-start justify-between gap-3">
          <div>
            <p class="font-urbanist text-xs font-bold uppercase tracking-wide text-glow-text-subtle">
              Localização
            </p>
            <p class="mt-1 font-urbanist text-sm text-glow-text">
              {{ formatEnderecoOnboarding(perfil) }}
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 font-satoshi text-sm font-medium text-glow-gold-cta"
            @click="emit('edit', 'endereco')"
          >
            Editar
          </button>
        </li>
      </ul>
    </article>

    <div
      class="flex flex-col-reverse gap-3 border-t border-glow-border-soft pt-6 sm:flex-row sm:items-center sm:justify-between"
    >
      <button
        type="button"
        :class="[ONBOARDING_CONTRATAR_BTN_SECONDARY_CLASS, 'sm:w-auto sm:min-w-[160px]']"
        @click="emit('back')"
      >
        Anterior: Localização
      </button>
      <button
        type="button"
        :disabled="loading"
        :class="[ONBOARDING_CONTRATAR_BTN_PRIMARY_CLASS, 'sm:w-auto sm:min-w-[200px]']"
        @click="emit('submit')"
      >
        Próximo: Pagamento
      </button>
    </div>
  </div>
</template>
