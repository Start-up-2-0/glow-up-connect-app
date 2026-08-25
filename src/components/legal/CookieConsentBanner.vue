<script setup lang="ts">
import { useConsent } from '@/composables/useConsent'
import { legalUrl } from '@/utils/landingUrl'

const { acceptAll, rejectNonEssential, openPreferences } = useConsent()
</script>

<template>
  <div
    class="cookie-consent"
    role="dialog"
    aria-labelledby="cookie-banner-title"
    aria-describedby="cookie-banner-desc"
  >
    <div class="flex flex-col gap-3">
      <div class="min-w-0 flex-1">
        <p id="cookie-banner-title" class="font-satoshi text-sm font-semibold text-glow-text">
          Cookies e serviços de terceiros
        </p>
        <p id="cookie-banner-desc" class="mt-1 text-xs leading-relaxed text-glow-text-subtle sm:text-sm">
          Usamos cookies essenciais para login e preferências. Com sua autorização, parceiros de
          pagamento e endereço também podem processar dados.
          <a :href="legalUrl('politica-de-cookies')" class="font-medium text-glow-gold-dark hover:underline" target="_blank" rel="noopener">
            Saiba mais
          </a>
        </p>
      </div>

      <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <button
          type="button"
          class="rounded-lg border border-glow-border-soft px-3 py-2 text-xs font-medium text-glow-text-subtle hover:bg-glow-canvas sm:text-sm"
          @click="rejectNonEssential"
        >
          Apenas essenciais
        </button>
        <button
          type="button"
          class="rounded-lg border border-glow-border-soft px-3 py-2 text-xs font-medium text-glow-text hover:bg-glow-canvas sm:text-sm"
          @click="openPreferences"
        >
          Personalizar
        </button>
        <button
          type="button"
          class="col-span-2 rounded-lg bg-glow-gold-cta px-3 py-2 text-xs font-semibold text-white hover:brightness-95 sm:col-span-1 sm:text-sm"
          @click="acceptAll"
        >
          Aceitar todos
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cookie-consent {
  position: fixed;
  z-index: 2050;
  right: 16px;
  bottom: max(16px, env(safe-area-inset-bottom));
  left: 16px;
  max-width: 560px;
  border: 1px solid var(--glow-border-soft);
  border-radius: 16px;
  background: color-mix(in srgb, var(--glow-surface) 96%, transparent);
  padding: 16px;
  box-shadow: 0 18px 48px rgba(20, 10, 35, 0.22);
  backdrop-filter: blur(14px);
}
@media (min-width: 640px) {
  .cookie-consent { left: auto; width: min(560px, calc(100vw - 32px)); }
}
</style>
