<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLogo from '@/components/layout/AppLogo.vue'
import {
  buildLinkConfirmacao,
  buildLinkWhatsApp,
  resolveNumeroPlataforma,
} from '@/utils/whatsappConfirmacao'

const route = useRoute()

const token = computed(() => String(route.params.token ?? '').trim())

const numeroPlataforma = computed(() =>
  resolveNumeroPlataforma(undefined, import.meta.env.VITE_WHATSAPP_NUMBER),
)

const linkConfirmacao = computed(() => buildLinkConfirmacao(token.value))

const linkWhatsApp = computed(() => {
  if (!token.value) return ''
  if (numeroPlataforma.value) {
    return buildLinkWhatsApp(numeroPlataforma.value, token.value)
  }
  return ''
})

const invalido = computed(() => !token.value)

function abrirWhatsApp() {
  if (!linkWhatsApp.value) return
  window.open(linkWhatsApp.value, '_blank', 'noopener,noreferrer')
}

async function copiarLink() {
  if (!linkConfirmacao.value || !navigator.clipboard) return
  await navigator.clipboard.writeText(linkConfirmacao.value)
}
</script>

<template>
  <div class="min-h-screen bg-glow-canvas px-4 py-10">
    <div class="mx-auto w-full max-w-lg">
      <div class="mb-8 flex justify-center">
        <AppLogo />
      </div>

      <section
        class="overflow-hidden rounded-xl border border-glow-border-soft bg-glow-surface p-6 shadow-sm sm:p-8"
      >
        <template v-if="invalido">
          <h1 class="font-satoshi text-xl font-bold text-glow-text">Link inválido</h1>
          <p class="mt-2 font-urbanist text-sm text-glow-text-subtle">
            Este link de confirmação não está completo. Solicite uma nova confirmação pelo app.
          </p>
        </template>

        <template v-else>
          <h1 class="font-satoshi text-xl font-bold text-glow-text">Confirme seu WhatsApp</h1>
          <p class="mt-2 font-urbanist text-sm text-glow-text-subtle">
            Toque no botão abaixo e <strong class="text-glow-text">envie a mensagem</strong> para o
            WhatsApp da Glow usando o número cadastrado no seu perfil.
          </p>

          <div class="mt-6 space-y-3">
            <button
              type="button"
              class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 font-urbanist text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="!linkWhatsApp"
              @click="abrirWhatsApp"
            >
              Confirmar no WhatsApp
            </button>

            <button
              v-if="linkConfirmacao"
              type="button"
              class="inline-flex h-11 w-full items-center justify-center rounded-lg border border-glow-border-soft bg-glow-canvas px-4 font-urbanist text-sm font-medium text-glow-text transition hover:bg-glow-hover-surface"
              @click="copiarLink"
            >
              Copiar link desta página
            </button>
          </div>

          <p class="mt-4 font-urbanist text-xs text-glow-text-subtle">
            Também enviamos este link por WhatsApp e e-mail. A confirmação é automática após o envio
            da mensagem.
          </p>
        </template>
      </section>
    </div>
  </div>
</template>
