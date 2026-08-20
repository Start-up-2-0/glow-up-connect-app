<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { conviteService } from '@/services/conviteService'
import type { ConviteNegocio } from '@/types/convite.types'

const props = defineProps<{
  convite: ConviteNegocio
}>()

const emit = defineEmits<{
  copied: []
}>()

const { estabelecimentoId } = useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const open = defineModel<boolean>({ default: false })
const loading = ref(false)
const linkConvite = ref<string | null>(null)
const error = ref<string | null>(null)

watch(open, (isOpen) => {
  if (!isOpen) {
    linkConvite.value = null
    error.value = null
    loading.value = false
    return
  }

  void carregarLink()
})

async function carregarLink() {
  if (!estabelecimentoId.value) return

  loading.value = true
  error.value = null
  linkConvite.value = null

  try {
    const convite = await conviteService.obterLink(estabelecimentoId.value, props.convite.id)
    linkConvite.value = convite.linkConvite
  } catch (err) {
    error.value = resolveError(err, 'Não foi possível recuperar o link do convite.')
  } finally {
    loading.value = false
  }
}

async function copiarLink() {
  if (!linkConvite.value) return

  try {
    await navigator.clipboard.writeText(linkConvite.value)
    notifications.push('success', 'Link copiado!')
    emit('copied')
  } catch {
    notifications.push('error', 'Não foi possível copiar o link.')
  }
}

function close() {
  open.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="equipe-modal">
      <div v-if="open" class="equipe-modal-overlay" @click.self="close">
        <Transition
          enter-active-class="equipe-modal-enter-active"
          leave-active-class="equipe-modal-leave-active"
          enter-from-class="equipe-modal-enter-from"
          leave-to-class="equipe-modal-leave-to"
        >
          <div
            v-if="open"
            class="equipe-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="equipe-convite-link-title"
          >
            <div class="equipe-modal__header">
              <div class="equipe-modal__header-top">
                <h2 id="equipe-convite-link-title" class="equipe-modal__title">
                  Link do convite
                </h2>
                <button
                  type="button"
                  class="equipe-modal__close-icon"
                  aria-label="Fechar"
                  @click="close"
                >
                  <svg class="size-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                    <path
                      d="M2 2L10 10M10 2L2 10"
                      stroke="currentColor"
                      stroke-width="1.5"
                      stroke-linecap="round"
                    />
                  </svg>
                </button>
              </div>
              <p class="equipe-modal__subtitle">
                Envie este link para a pessoa entrar na equipe. Ele continua válido enquanto o
                convite estiver ativo.
              </p>
            </div>

            <div class="equipe-modal__body">
              <p v-if="loading" class="font-urbanist text-sm text-glow-text-subtle">
                Carregando link…
              </p>

              <p v-else-if="error" class="font-urbanist text-sm text-red-600 dark:text-red-400">
                {{ error }}
              </p>

              <div v-else-if="linkConvite" class="equipe-link-success">
                <div class="equipe-link-success__url-box">
                  <p class="equipe-link-success__url">{{ linkConvite }}</p>
                  <button
                    type="button"
                    class="equipe-modal__confirm equipe-modal__confirm--copy"
                    @click="copiarLink"
                  >
                    Copiar link
                  </button>
                </div>
              </div>
            </div>

            <div class="equipe-modal__footer">
              <button type="button" class="equipe-modal__dismiss" @click="close">
                Fechar
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
