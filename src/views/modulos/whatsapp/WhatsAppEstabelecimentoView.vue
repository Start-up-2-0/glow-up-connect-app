<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { whatsappEstabelecimentoService } from '@/services/whatsappEstabelecimentoService'

const CARD_CLASS =
  'overflow-hidden rounded-xl border border-glow-border-soft bg-glow-surface shadow-sm'
const CARD_HEADER_CLASS = 'border-b border-glow-border-soft px-5 py-3.5'
const CARD_BODY_CLASS = 'p-5'

const { estabelecimentoAtivo, estabelecimentoId, ready, error: contextError, loading } =
  useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const solicitando = ref(false)
const confirmando = ref(false)
const optIn = ref(true)
const codigo = ref('')
const confirmado = ref(false)

async function handleSolicitar() {
  if (!estabelecimentoId.value) return
  solicitando.value = true
  try {
    await whatsappEstabelecimentoService.solicitarConfirmacao(estabelecimentoId.value)
    notifications.push('success', 'Instruções de confirmação enviadas por e-mail.')
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    solicitando.value = false
  }
}

async function handleConfirmar() {
  if (!estabelecimentoId.value || !codigo.value.trim()) return
  confirmando.value = true
  try {
    await whatsappEstabelecimentoService.confirmar(estabelecimentoId.value, codigo.value.trim())
    confirmado.value = true
    notifications.push('success', 'WhatsApp confirmado.')
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    confirmando.value = false
  }
}

async function handleOptInChange(event: Event) {
  if (!estabelecimentoId.value) return
  const target = event.target as HTMLInputElement
  try {
    await whatsappEstabelecimentoService.atualizarOptIn(estabelecimentoId.value, target.checked)
    optIn.value = target.checked
    notifications.push('success', 'Preferência de alertas atualizada.')
  } catch (err) {
    notifications.push('error', resolveError(err))
    target.checked = !target.checked
  }
}
</script>

<template>
  <div class="w-full space-y-5 lg:space-y-6">
    <header>
      <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
        WhatsApp do estabelecimento
      </h1>
      <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
        Configure alertas de agendamento via WhatsApp para {{ estabelecimentoAtivo?.nome ?? 'sua loja' }}.
      </p>
    </header>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>
    <LoadingSpinner v-if="loading && !ready" class="mx-auto py-12" />

    <section v-else-if="ready" :class="CARD_CLASS">
      <div :class="CARD_HEADER_CLASS">
        <div class="flex items-start gap-3">
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
            aria-hidden="true"
          >
            <svg class="size-5" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
              />
            </svg>
          </div>
          <div class="min-w-0">
            <h3 class="font-urbanist text-base font-semibold text-glow-text">WhatsApp</h3>
            <p class="mt-0.5 font-urbanist text-sm text-glow-text-subtle">
              Confirme o número e habilite alertas de agendamento.
            </p>
          </div>
        </div>
      </div>

      <div :class="CARD_BODY_CLASS" class="space-y-4">
        <div class="rounded-lg border border-glow-border-soft bg-glow-canvas px-4 py-3">
          <span
            class="inline-flex rounded-full px-2.5 py-0.5 font-urbanist text-xs font-medium"
            :class="
              confirmado
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'
            "
          >
            {{ confirmado ? 'Confirmado' : 'Aguardando confirmação' }}
          </span>
        </div>

        <template v-if="!confirmado">
          <p class="font-urbanist text-sm text-glow-text-subtle">
            Solicite a confirmação por e-mail ou informe o código recebido.
          </p>
          <BaseButton variant="secondary" :loading="solicitando" @click="handleSolicitar">
            Enviar confirmação por e-mail
          </BaseButton>
          <form class="flex flex-wrap items-end gap-3" @submit.prevent="handleConfirmar">
            <BaseInput v-model="codigo" label="Código de confirmação" class="min-w-[12rem] flex-1" />
            <BaseButton type="submit" :loading="confirmando">Confirmar</BaseButton>
          </form>
        </template>

        <template v-else>
          <label
            class="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-glow-border-soft bg-glow-canvas px-4 py-3"
          >
            <div class="min-w-0">
              <p class="font-urbanist text-sm font-medium text-glow-text">Alertas</p>
              <p class="mt-0.5 font-urbanist text-xs text-glow-text-subtle">
                Lembretes e atualizações de agendamento
              </p>
            </div>
            <div class="relative inline-flex shrink-0 cursor-pointer items-center">
              <input
                type="checkbox"
                class="peer sr-only"
                :checked="optIn"
                @change="handleOptInChange"
              />
              <div
                class="peer h-6 w-11 rounded-full bg-glow-border-soft after:absolute after:start-[2px] after:top-[2px] after:size-5 after:rounded-full after:border after:border-glow-border-soft after:bg-white after:transition-all after:content-[''] peer-checked:bg-green-500 peer-checked:after:translate-x-full peer-checked:after:border-white"
              />
            </div>
          </label>
        </template>
      </div>
    </section>
  </div>
</template>
