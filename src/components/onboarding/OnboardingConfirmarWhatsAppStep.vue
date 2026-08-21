<script setup lang="ts">
import { computed } from 'vue'
import { maskEmail } from '@/composables/useConfirmEmail'
import { GLOW_BUTTON_PRIMARY_CLASS } from '@/constants/designTokens'
import type { WhatsAppConfirmacaoInstrucoes } from '@/types/whatsapp.types'

const props = defineProps<{
  email: string
  loading?: boolean
  resending?: boolean
  errorMessage?: string | null
  instrucoes?: WhatsAppConfirmacaoInstrucoes | null
}>()

const emit = defineEmits<{
  verificar: []
  reenviar: []
}>()

const maskedEmail = computed(() => maskEmail(props.email))
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="agendar-section-title">Confirme seu WhatsApp</h1>
      <p class="agendar-section-subtitle mt-2">
        Enviamos um e-mail para
        <span class="font-semibold text-glow-gold">{{ maskedEmail }}</span>
        com o link para confirmar o número. Assim você recebe alertas de agendamento pelo WhatsApp.
      </p>
    </div>

    <div
      class="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3"
    >
      <p class="font-urbanist text-sm font-bold text-glow-text">
        Aguardando confirmação no WhatsApp
      </p>
      <p class="mt-1 font-urbanist text-sm text-glow-text-muted">
        Abra o e-mail ou o WhatsApp, envie a mensagem com o número cadastrado e volte aqui para continuar.
      </p>
    </div>

    <p v-if="errorMessage" class="text-sm text-red-600" role="alert">
      {{ errorMessage }}
    </p>

    <div class="flex flex-wrap gap-2">
      <a
        v-if="instrucoes?.linkWhatsApp"
        :href="instrucoes.linkWhatsApp"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex h-11 items-center rounded-lg bg-glow-gold-cta px-4 font-satoshi text-sm font-bold text-white transition hover:brightness-95"
      >
        Abrir WhatsApp
      </a>
      <a
        v-if="instrucoes?.linkConfirmacao"
        :href="instrucoes.linkConfirmacao"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex h-11 items-center rounded-lg border border-glow-border-soft bg-glow-surface px-4 font-satoshi text-sm font-medium text-glow-text transition hover:bg-glow-hover-surface"
      >
        Abrir link de confirmação
      </a>
    </div>

    <button
      type="button"
      :disabled="loading"
      :class="[GLOW_BUTTON_PRIMARY_CLASS, 'font-inter text-base font-medium']"
      @click="emit('verificar')"
    >
      {{ loading ? 'Verificando…' : 'Já confirmei' }}
    </button>

    <button
      type="button"
      class="text-sm font-medium text-glow-gold hover:underline disabled:opacity-60"
      :disabled="resending || loading"
      @click="emit('reenviar')"
    >
      {{ resending ? 'Reenviando…' : 'Reenviar instruções do WhatsApp' }}
    </button>
  </div>
</template>
