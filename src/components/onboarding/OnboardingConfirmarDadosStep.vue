<script setup lang="ts">
import { formatBRL } from '@/utils/formatters'
import {
  GLOW_BUTTON_PRIMARY_CLASS,
  GLOW_RECOVERY_BTN_SECONDARY_CLASS,
} from '@/constants/designTokens'
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
}>()
</script>

<template>
  <div class="w-full">
    <header class="mb-10 w-full text-center">
      <h1 class="font-satoshi text-[32px] font-bold leading-normal text-glow-text">
        Confirme os dados
      </h1>
      <p class="mt-[5px] font-satoshi text-xl font-normal leading-normal text-glow-text-muted">
        Revise o plano e o estabelecimento antes de concluir a assinatura.
      </p>
    </header>

    <div class="flex w-full flex-col gap-6">
      <section class="rounded-lg border border-glow-text/25 bg-white p-5">
        <h2 class="font-satoshi text-sm font-normal text-zinc-800">Plano escolhido</h2>
        <p class="mt-2 font-satoshi text-lg font-semibold text-glow-text">{{ plano.nome }}</p>
        <p class="text-sm text-glow-text-muted">{{ plano.descricao }}</p>
        <p class="mt-2 font-satoshi text-xl font-bold text-glow-text">
          {{ formatBRL(plano.preco) }}
          <span class="text-sm font-normal text-glow-text-muted">/mês</span>
        </p>
      </section>

      <section class="rounded-lg border border-glow-text/25 bg-white p-5">
        <h2 class="font-satoshi text-sm font-normal text-zinc-800">Estabelecimento</h2>
        <div class="mt-3 flex items-start gap-4">
          <img
            v-if="estabelecimento.logoDataUrl"
            :src="estabelecimento.logoDataUrl"
            alt="Logo do estabelecimento"
            class="size-16 rounded-lg border border-glow-text/25 object-cover"
          />
          <div class="min-w-0 flex-1">
            <p class="font-satoshi font-medium text-glow-text">{{ estabelecimento.nome }}</p>
            <p v-if="estabelecimento.descricao" class="mt-1 text-sm text-glow-text-muted">
              {{ estabelecimento.descricao }}
            </p>
            <p v-if="estabelecimento.telefone" class="mt-2 text-sm text-glow-text-muted">
              {{ estabelecimento.telefone }}
            </p>
            <p v-if="estabelecimento.email" class="text-sm text-glow-text-muted">
              {{ estabelecimento.email }}
            </p>
            <p
              v-if="estabelecimento.logradouro && !estabelecimentoExistente"
              class="mt-2 text-sm text-glow-text-muted"
            >
              {{ estabelecimento.logradouro }}, {{ estabelecimento.numero }} —
              {{ estabelecimento.bairro }}, {{ estabelecimento.cidade }}/{{ estabelecimento.estado }}
            </p>
            <p v-else-if="estabelecimentoExistente" class="mt-2 text-sm text-glow-text-muted">
              Estabelecimento já cadastrado na sua conta.
            </p>
          </div>
        </div>
      </section>

      <p
        v-if="errorMessage"
        class="w-full rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        role="alert"
      >
        {{ errorMessage }}
      </p>

      <div class="flex flex-col gap-3">
        <button
          type="button"
          :class="GLOW_RECOVERY_BTN_SECONDARY_CLASS"
          @click="emit('back')"
        >
          Voltar
        </button>
        <button
          type="button"
          :disabled="loading"
          :class="[GLOW_BUTTON_PRIMARY_CLASS, 'font-satoshi text-xl font-medium text-white']"
          @click="emit('submit')"
        >
          <span
            v-if="loading"
            class="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"
          />
          Continuar para pagamento
        </button>
      </div>
    </div>
  </div>
</template>
