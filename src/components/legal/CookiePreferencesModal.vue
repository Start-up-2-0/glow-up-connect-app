<script setup lang="ts">
import { ref, watch } from 'vue'
import { useConsent } from '@/composables/useConsent'
import { THIRD_PARTY_PROVIDERS } from '@/constants/consent'
import { legalUrl } from '@/utils/landingUrl'

const {
  preferencesModalOpen,
  savePreferences,
  closePreferences,
  acceptAll,
} = useConsent()

const thirdParty = ref(false)
const analytics = ref(false)

watch(preferencesModalOpen, (open) => {
  if (!open) return
  thirdParty.value = false
  analytics.value = false
})

function onSave() {
  savePreferences(thirdParty.value, analytics.value)
}

function onAcceptAll() {
  acceptAll()
  closePreferences()
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="preferencesModalOpen"
      class="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-labelledby="cookie-prefs-title"
      @click.self="closePreferences"
    >
      <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-glow-surface p-6 shadow-xl">
        <h2 id="cookie-prefs-title" class="font-urbanist text-xl font-semibold text-glow-text">
          Preferências de cookies
        </h2>
        <p class="mt-2 text-sm text-glow-text-subtle">
          Escolha quais categorias autorizar. Serviços essenciais são necessários para o
          funcionamento da plataforma.
        </p>

        <div class="mt-6 space-y-4">
          <div class="rounded-lg border border-glow-border-soft p-4">
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="font-medium text-glow-text">Essenciais</p>
                <p class="mt-1 text-sm text-glow-text-subtle">
                  Autenticação, sessão, tema e segurança. Sempre ativos.
                </p>
              </div>
              <span class="text-xs font-medium uppercase text-glow-text-subtle">Obrigatório</span>
            </div>
          </div>

          <div class="rounded-lg border border-glow-border-soft p-4">
            <label class="flex cursor-pointer items-start justify-between gap-3">
              <div>
                <p class="font-medium text-glow-text">Serviços de terceiros</p>
                <p class="mt-1 text-sm text-glow-text-subtle">
                  Permite enviar dados a parceiros para pagamento e consulta de CEP.
                </p>
                <ul class="mt-2 space-y-1 text-xs text-glow-text-subtle">
                  <li v-for="provider in THIRD_PARTY_PROVIDERS" :key="provider.id">
                    <strong>{{ provider.name }}:</strong> {{ provider.purpose }}
                  </li>
                </ul>
              </div>
              <input
                v-model="thirdParty"
                type="checkbox"
                class="mt-1 h-4 w-4 rounded border-glow-border-soft text-glow-gold focus:ring-glow-gold"
              />
            </label>
          </div>

          <div class="rounded-lg border border-glow-border-soft p-4 opacity-60">
            <label class="flex cursor-not-allowed items-start justify-between gap-3">
              <div>
                <p class="font-medium text-glow-text">Análise e métricas</p>
                <p class="mt-1 text-sm text-glow-text-subtle">
                  Não utilizamos ferramentas de analytics de terceiros no momento.
                </p>
              </div>
              <input
                v-model="analytics"
                type="checkbox"
                disabled
                class="mt-1 h-4 w-4 rounded border-glow-border-soft"
              />
            </label>
          </div>
        </div>

        <p class="mt-4 text-xs text-glow-text-subtle">
          Consulte a
          <a :href="legalUrl('politica-de-cookies')" class="text-glow-gold-dark hover:underline" target="_blank" rel="noopener">
            política de cookies
          </a>
          e os
          <a :href="legalUrl('termos-de-uso')" class="text-glow-gold-dark hover:underline" target="_blank" rel="noopener">
            termos de uso
          </a>.
        </p>

        <div class="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            class="rounded-lg border border-glow-border-soft px-4 py-2 text-sm text-glow-text-subtle hover:bg-glow-canvas"
            @click="closePreferences"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="rounded-lg border border-glow-border-soft px-4 py-2 text-sm font-medium text-glow-text hover:bg-glow-canvas"
            @click="onSave"
          >
            Salvar preferências
          </button>
          <button
            type="button"
            class="rounded-lg bg-glow-gold px-4 py-2 text-sm font-medium text-white hover:brightness-95"
            @click="onAcceptAll"
          >
            Aceitar todos
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
