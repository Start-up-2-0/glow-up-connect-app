<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import LandingCtaButton from '@/components/landing/LandingCtaButton.vue'
import { ROUTE_PATHS } from '@/constants/routes'
import LandingPlanoLimites from '@/components/landing/LandingPlanoLimites.vue'
import { formatBRL } from '@/utils/formatters'
import { getPlanoFeatures } from '@/utils/planoDisplay'
import type { Plano } from '@/types/plano.types'

const props = defineProps<{
  open: boolean
  plano: Plano | null
  popular?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

const features = computed(() => (props.plano ? getPlanoFeatures(props.plano) : []))

const checkoutLink = computed(() =>
  props.plano
    ? {
        path: ROUTE_PATHS.ONBOARDING_ASSINATURA,
        query: { planoId: String(props.plano.id) },
      }
    : undefined,
)

const accentText = computed(() => (props.popular ? 'text-glow-purple' : 'text-glow-gold'))
const accentSoft = computed(() => (props.popular ? 'text-glow-purple-soft' : 'text-[#282828]'))

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    emit('close')
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeydown)
      return
    }

    document.body.style.overflow = ''
    window.removeEventListener('keydown', handleKeydown)
  },
  { immediate: true },
)

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open && plano"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`plano-detalhes-${plano.id}`"
      >
        <div class="absolute inset-0 bg-[#282828]/60 backdrop-blur-[2px]" @click="emit('close')" />

        <div
          class="relative z-10 flex max-h-[min(90vh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-[20px] border border-[#282828]/20 bg-[#f3f3f3] shadow-2xl"
        >
          <div class="border-b border-[#282828]/10 px-6 py-5 sm:px-8">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p
                  v-if="popular"
                  class="mb-2 flex items-center gap-2 font-montserrat text-xs font-medium text-glow-purple"
                >
                  <svg class="size-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2l2.9 6.9H22l-5.5 4.5 2.1 6.6L12 16.9 5.4 20l2.1-6.6L2 8.9h7.1L12 2z" />
                  </svg>
                  POPULAR
                </p>
                <h2
                  :id="`plano-detalhes-${plano.id}`"
                  class="font-montserrat text-2xl font-semibold leading-tight"
                  :class="accentText"
                >
                  {{ plano.nome }}
                </h2>
                <p class="mt-2 font-poppins text-sm font-light leading-snug" :class="accentSoft">
                  {{ plano.descricao }}
                </p>
              </div>
              <button
                type="button"
                class="shrink-0 rounded-lg p-2 text-[#282828]/60 transition hover:bg-[#282828]/5 hover:text-[#282828]"
                aria-label="Fechar"
                @click="emit('close')"
              >
                <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
                </svg>
              </button>
            </div>

            <p class="mt-4">
              <span class="font-montserrat text-2xl font-black" :class="accentText">
                {{ formatBRL(plano.preco) }}
              </span>
              <span class="ml-1 font-montserrat text-xs font-bold" :class="accentText">/mês</span>
            </p>
          </div>

          <div class="flex-1 overflow-y-auto px-6 py-5 sm:px-8">
            <LandingPlanoLimites class="mb-6" :plano="plano" :popular="popular" variant="modal" />

            <h3 class="mb-3 font-montserrat text-sm font-semibold text-[#282828]">
              Benefícios incluídos
            </h3>
            <ul class="space-y-1">
              <li
                v-for="feature in features"
                :key="feature"
                class="flex items-start gap-2.5 py-1.5"
              >
                <svg
                  class="mt-0.5 size-5 shrink-0"
                  :class="accentText"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
                </svg>
                <span class="font-poppins text-sm font-light leading-snug text-[#282828]">
                  {{ feature }}
                </span>
              </li>
            </ul>
          </div>

          <div class="border-t border-[#282828]/10 px-6 py-5 sm:px-8">
            <LandingCtaButton
              v-if="checkoutLink"
              class="w-full justify-center"
              :to="checkoutLink"
              label="Assinar agora"
              :variant="popular ? 'purple' : 'outline'"
              @click="emit('close')"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
