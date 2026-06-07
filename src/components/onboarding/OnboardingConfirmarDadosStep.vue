<script setup lang="ts">
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { formatBRL } from '@/utils/formatters'
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
  <div>
    <header class="mb-6">
      <h2 class="font-satoshi text-2xl font-bold text-glow-text">Confirme os dados</h2>
      <p class="mt-1 text-sm text-glow-text-subtle">
        Revise o plano e o estabelecimento antes de concluir a assinatura.
      </p>
    </header>

    <div class="space-y-4">
      <BaseCard title="Plano escolhido">
        <p class="font-satoshi text-lg font-semibold text-glow-text">{{ plano.nome }}</p>
        <p class="text-sm text-glow-text-subtle">{{ plano.descricao }}</p>
        <p class="mt-2 font-satoshi text-xl font-bold text-glow-text">
          {{ formatBRL(plano.preco) }}
          <span class="text-sm font-normal text-glow-text-subtle">/mês</span>
        </p>
      </BaseCard>

      <BaseCard title="Estabelecimento">
        <div class="flex items-start gap-4">
          <img
            v-if="estabelecimento.logoDataUrl"
            :src="estabelecimento.logoDataUrl"
            alt="Logo do estabelecimento"
            class="size-16 rounded-lg border border-glow-border-soft object-cover"
          />
          <div class="min-w-0 flex-1">
            <p class="font-medium text-glow-text">{{ estabelecimento.nome }}</p>
            <p v-if="estabelecimento.descricao" class="mt-1 text-sm text-glow-text-subtle">
              {{ estabelecimento.descricao }}
            </p>
            <p v-if="estabelecimento.telefone" class="mt-2 text-sm text-glow-text-subtle">
              {{ estabelecimento.telefone }}
            </p>
            <p v-if="estabelecimento.email" class="text-sm text-glow-text-subtle">
              {{ estabelecimento.email }}
            </p>
            <p
              v-if="estabelecimento.logradouro && !estabelecimentoExistente"
              class="mt-2 text-sm text-glow-text-subtle"
            >
              {{ estabelecimento.logradouro }}, {{ estabelecimento.numero }} —
              {{ estabelecimento.bairro }}, {{ estabelecimento.cidade }}/{{ estabelecimento.estado }}
            </p>
            <p v-else-if="estabelecimentoExistente" class="mt-2 text-sm text-glow-text-subtle">
              Estabelecimento já cadastrado na sua conta.
            </p>
          </div>
        </div>
      </BaseCard>

      <p v-if="errorMessage" class="text-sm text-red-600" role="alert">{{ errorMessage }}</p>

      <div class="flex flex-col gap-3 sm:flex-row">
        <BaseButton type="button" variant="secondary" class="sm:flex-1" @click="emit('back')">
          Voltar
        </BaseButton>
        <BaseButton
          type="button"
          variant="primary"
          class="sm:flex-1"
          :loading="loading"
          @click="emit('submit')"
        >
          Continuar para pagamento
        </BaseButton>
      </div>
    </div>
  </div>
</template>
