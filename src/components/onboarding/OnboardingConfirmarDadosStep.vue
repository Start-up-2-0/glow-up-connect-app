<script setup lang="ts">
import {
  ONBOARDING_CONTRATAR_BTN_PRIMARY_CLASS,
  ONBOARDING_CONTRATAR_BTN_SECONDARY_CLASS,
  ONBOARDING_CONTRATAR_CARD_CLASS,
} from '@/constants/designTokens'
import { formatBRL, telefoneLocalFromApi } from '@/utils/formatters'
import type { Plano } from '@/types/plano.types'
import type { OnboardingEstabelecimentoDraft } from '@/types/onboardingAssinatura.types'

defineProps<{
  plano: Plano
  estabelecimento: OnboardingEstabelecimentoDraft
  estabelecimentoExistente?: boolean
  loading?: boolean
  errorMessage?: string | null
}>()

const emit = defineEmits<{
  back: []
  submit: []
  edit: []
}>()

function formatEndereco(est: OnboardingEstabelecimentoDraft): string {
  const partes = [
    est.logradouro,
    est.numero ? `${est.numero}` : '',
    est.bairro ? `- ${est.bairro}` : '',
    est.cidade && est.estado ? `, ${est.cidade}/${est.estado}` : est.cidade || est.estado,
  ].filter(Boolean)
  return partes.join(' ').replace(/\s+/g, ' ').trim()
}
</script>

<template>
  <div class="mx-auto w-full max-w-[718px] space-y-4">
    <article :class="ONBOARDING_CONTRATAR_CARD_CLASS">
      <p class="font-urbanist text-sm font-bold text-glow-text">Plano escolhido</p>
      <p class="mt-2 font-urbanist text-base font-black text-[#e3ac09]">{{ plano.nome }}</p>
      <p class="mt-2 font-urbanist text-sm text-glow-text/40">{{ plano.descricao }}</p>
      <p class="mt-3 font-urbanist text-base font-black text-glow-text">
        {{ formatBRL(plano.preco) }}
        <span class="text-sm font-normal text-glow-text/40">/mês</span>
      </p>
    </article>

    <article :class="[ONBOARDING_CONTRATAR_CARD_CLASS, 'relative']">
      <div class="flex items-start justify-between gap-3">
        <p class="font-urbanist text-sm font-bold text-glow-text">Estabelecimento</p>
        <button
          v-if="!estabelecimentoExistente"
          type="button"
          class="flex size-[30px] shrink-0 items-center justify-center rounded border-[0.5px] border-glow-text/25 bg-glow-text/[0.04] text-glow-text/70 transition hover:bg-glow-hover-surface hover:text-glow-text"
          aria-label="Editar estabelecimento"
          @click="emit('edit')"
        >
          <svg class="size-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path
              d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm-1 14H5V7h14v11zM8 9h8v2H8V9zm0 4h5v2H8v-2z"
            />
          </svg>
        </button>
      </div>

      <div class="mt-4 flex gap-4">
        <div
          v-if="estabelecimento.logoDataUrl"
          class="size-14 shrink-0 overflow-hidden rounded"
        >
          <img
            :src="estabelecimento.logoDataUrl"
            alt="Logo do estabelecimento"
            class="size-full object-cover"
          />
        </div>
        <div
          v-else
          class="flex size-14 shrink-0 items-center justify-center rounded bg-glow-canvas font-urbanist text-xl font-bold text-glow-text/40"
          aria-hidden="true"
        >
          {{ estabelecimento.nome.charAt(0) }}
        </div>

        <div class="min-w-0 flex-1">
          <p class="font-urbanist text-base font-bold text-glow-text">{{ estabelecimento.nome }}</p>
          <p
            v-if="estabelecimento.descricao"
            class="mt-1 font-urbanist text-sm text-glow-text/40"
          >
            {{ estabelecimento.descricao }}
          </p>
          <p v-else-if="estabelecimentoExistente" class="mt-1 font-urbanist text-sm text-glow-text/40">
            Estabelecimento já cadastrado na sua conta.
          </p>

          <ul v-if="!estabelecimentoExistente" class="mt-3 space-y-2">
            <li
              v-if="estabelecimento.telefone"
              class="flex items-center gap-2.5 font-urbanist text-sm text-glow-text/80"
            >
              <svg class="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
              </svg>
              {{ telefoneLocalFromApi(estabelecimento.telefone) }}
            </li>
            <li
              v-if="estabelecimento.email"
              class="flex items-center gap-2.5 font-urbanist text-sm text-glow-text/80"
            >
              <svg class="size-3 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              {{ estabelecimento.email }}
            </li>
            <li
              v-if="estabelecimento.logradouro"
              class="flex items-center gap-2.5 font-urbanist text-sm text-glow-text/80"
            >
              <svg class="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {{ formatEndereco(estabelecimento) }}
            </li>
          </ul>
        </div>
      </div>
    </article>

    <p v-if="errorMessage" class="text-sm text-red-600" role="alert">{{ errorMessage }}</p>

    <div class="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        :disabled="loading"
        :class="ONBOARDING_CONTRATAR_BTN_PRIMARY_CLASS"
        @click="emit('submit')"
      >
        <span
          v-if="loading"
          class="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent"
          aria-hidden="true"
        />
        Continuar para o pagamento
      </button>
      <button
        type="button"
        :class="ONBOARDING_CONTRATAR_BTN_SECONDARY_CLASS"
        @click="emit('back')"
      >
        Voltar
      </button>
    </div>
  </div>
</template>
