<script setup lang="ts">
import { useConsent } from '@/composables/useConsent'
import { legalUrl } from '@/utils/landingUrl'

const { acceptAll, rejectNonEssential, openPreferences } = useConsent()
</script>

<template>
  <div
    class="fixed inset-x-0 bottom-0 z-50 border-t border-glow-border-soft bg-glow-surface p-4 shadow-lg sm:p-5"
    role="dialog"
    aria-labelledby="cookie-banner-title"
    aria-describedby="cookie-banner-desc"
  >
    <div class="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="min-w-0 flex-1">
        <p id="cookie-banner-title" class="font-satoshi text-sm font-semibold text-glow-text">
          Cookies e serviços de terceiros
        </p>
        <p id="cookie-banner-desc" class="mt-1 text-sm text-glow-text-subtle">
          Usamos cookies essenciais para login e preferências. Com sua autorização, também
          compartilhamos dados com parceiros como Mercado Pago e APIs de CEP para pagamentos e
          cadastro de endereço.
          <a :href="legalUrl('politica-de-cookies')" class="font-medium text-glow-gold-dark hover:underline" target="_blank" rel="noopener">
            Saiba mais
          </a>
        </p>
      </div>

      <div class="flex flex-wrap gap-2 lg:shrink-0">
        <button
          type="button"
          class="rounded-lg border border-glow-border-soft px-4 py-2 text-sm font-medium text-glow-text-subtle hover:bg-glow-canvas"
          @click="rejectNonEssential"
        >
          Apenas essenciais
        </button>
        <button
          type="button"
          class="rounded-lg border border-glow-border-soft px-4 py-2 text-sm font-medium text-glow-text hover:bg-glow-canvas"
          @click="openPreferences"
        >
          Personalizar
        </button>
        <button
          type="button"
          class="rounded-lg bg-glow-gold px-4 py-2 text-sm font-medium text-white hover:brightness-95"
          @click="acceptAll"
        >
          Aceitar todos
        </button>
      </div>
    </div>
  </div>
</template>
