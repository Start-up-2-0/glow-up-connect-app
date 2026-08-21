<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const open = defineModel<boolean>({ default: false })

defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  confirm: [linhas: { data: string; descricao: string; valor: number }[]]
}>()

const csvText = ref('')
const parseError = ref('')

function close() {
  open.value = false
  csvText.value = ''
  parseError.value = ''
}

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length === 0) return []

  const result: { data: string; descricao: string; valor: number }[] = []
  const startIdx = lines[0].toLowerCase().includes('data') ? 1 : 0

  for (let i = startIdx; i < lines.length; i++) {
    const parts = lines[i].split(/[;,]/).map((p) => p.trim().replace(/^"|"$/g, ''))
    if (parts.length < 3) continue
    const valor = Number(parts[2].replace(/\./g, '').replace(',', '.'))
    if (!parts[0] || !Number.isFinite(valor)) continue
    result.push({ data: parts[0], descricao: parts[1], valor })
  }
  return result
}

function handleConfirm() {
  parseError.value = ''
  const linhas = parseCsv(csvText.value)
  if (linhas.length === 0) {
    parseError.value = 'Nenhuma linha válida. Use: data;descrição;valor'
    return
  }
  emit('confirm', linhas)
}

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    csvText.value = String(reader.result ?? '')
  }
  reader.readAsText(file)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="equipe-modal">
      <div v-if="open" class="financeiro-modal-overlay" role="dialog" aria-modal="true" @click.self="close">
        <div class="financeiro-modal">
          <div class="financeiro-modal__header">
            <h2 class="financeiro-modal__title">Importar extrato</h2>
            <p class="font-urbanist text-sm text-glow-text-subtle">
              Cole o CSV ou selecione um arquivo (data;descrição;valor).
            </p>
          </div>
          <div class="financeiro-modal__body space-y-4">
            <input type="file" accept=".csv,text/csv" class="text-sm" @change="onFileChange" />
            <textarea
              v-model="csvText"
              rows="8"
              class="w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3 py-2 font-mono text-xs outline-none focus:border-glow-gold focus:ring-1 focus:ring-glow-gold"
              placeholder="2026-06-01;PIX recebido;150,00"
            />
            <p v-if="parseError" class="text-sm text-red-600">{{ parseError }}</p>
          </div>
          <div class="financeiro-modal__footer">
            <BaseButton variant="secondary" size="sm" :disabled="loading" @click="close">Cancelar</BaseButton>
            <BaseButton size="sm" :loading="loading" @click="handleConfirm">Importar</BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
