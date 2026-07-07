<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const open = defineModel<boolean>({ default: false })

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: [payload: { descricao: string; valor: number; vencimento: string; agendamentoId?: number }]
}>()

const descricao = ref('')
const valor = ref('')
const vencimento = ref('')
const agendamentoId = ref('')

watch(open, (isOpen) => {
  if (isOpen) {
    descricao.value = ''
    valor.value = ''
    vencimento.value = ''
    agendamentoId.value = ''
  }
})

function close() {
  open.value = false
}

function handleConfirm() {
  const valorNum = Number(valor.value)
  if (!descricao.value.trim() || !vencimento.value || !Number.isFinite(valorNum) || valorNum <= 0) {
    return
  }

  const agendamentoNum = agendamentoId.value.trim()
    ? Number(agendamentoId.value)
    : undefined

  emit('confirm', {
    descricao: descricao.value.trim(),
    valor: valorNum,
    vencimento: vencimento.value,
    agendamentoId:
      agendamentoNum !== undefined && Number.isFinite(agendamentoNum) ? agendamentoNum : undefined,
  })
}
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
        v-if="open"
        class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4"
        @click.self="close"
      >
        <div
          class="w-full max-w-md rounded-xl border border-glow-border-soft bg-glow-surface p-5 shadow-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="criar-conta-receber-title"
        >
          <h2 id="criar-conta-receber-title" class="font-satoshi text-lg font-bold text-glow-text">
            Nova conta a receber
          </h2>
          <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
            Cadastre um título a receber do estabelecimento.
          </p>

          <label class="mt-4 block font-urbanist text-sm text-glow-text-subtle">
            Descrição
            <input
              v-model="descricao"
              type="text"
              class="mt-1 w-full rounded border border-glow-border-soft bg-glow-canvas px-3 py-2 text-glow-text"
              placeholder="Ex.: Pacote de serviços"
            />
          </label>

          <label class="mt-3 block font-urbanist text-sm text-glow-text-subtle">
            Valor
            <input
              v-model="valor"
              type="number"
              min="0"
              step="0.01"
              class="mt-1 w-full rounded border border-glow-border-soft bg-glow-canvas px-3 py-2 text-glow-text"
              placeholder="0,00"
            />
          </label>

          <label class="mt-3 block font-urbanist text-sm text-glow-text-subtle">
            Vencimento
            <input
              v-model="vencimento"
              type="date"
              class="mt-1 w-full rounded border border-glow-border-soft bg-glow-canvas px-3 py-2 text-glow-text"
            />
          </label>

          <label class="mt-3 block font-urbanist text-sm text-glow-text-subtle">
            Agendamento (opcional)
            <input
              v-model="agendamentoId"
              type="number"
              min="1"
              class="mt-1 w-full rounded border border-glow-border-soft bg-glow-canvas px-3 py-2 text-glow-text"
              placeholder="ID do agendamento"
            />
          </label>

          <div class="mt-5 flex justify-end gap-2">
            <BaseButton variant="secondary" size="sm" :disabled="loading" @click="close">
              Cancelar
            </BaseButton>
            <BaseButton size="sm" :loading="loading" @click="handleConfirm">
              Salvar
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
