<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import CurrencyInput from '@/components/ui/CurrencyInput.vue'
import type { ComissaoProfissional, CriarComissaoPayload } from '@/types/negocio/caixa.types'

const open = defineModel<boolean>({ default: false })

const props = defineProps<{
  loading?: boolean
  profissionais: { id: number; nomePublico: string }[]
  comissao?: ComissaoProfissional | null
}>()

const emit = defineEmits<{ confirm: [payload: CriarComissaoPayload] }>()

const profissionalEstabelecimentoId = ref('')
const tipoComissao = ref('Percentual')
const percentual = ref(10)
const valorFixo = ref(0)
const inicioVigencia = ref('')
const fimVigencia = ref('')

const profissionalOptions = computed(() =>
  props.profissionais.map((p) => ({ value: String(p.id), label: p.nomePublico })),
)

const tipoOptions = [
  { value: 'Percentual', label: 'Percentual (%)' },
  { value: 'ValorFixo', label: 'Valor fixo (R$)' },
  { value: 'Mista', label: 'Mista (% + fixo)' },
]

watch(open, (isOpen) => {
  if (!isOpen) return
  if (props.comissao) {
    profissionalEstabelecimentoId.value = String(props.comissao.profissionalEstabelecimentoId)
    tipoComissao.value = props.comissao.tipoComissao
    percentual.value = props.comissao.percentual ?? 0
    valorFixo.value = props.comissao.valorFixo ?? 0
    inicioVigencia.value = props.comissao.inicioVigencia.slice(0, 10)
    fimVigencia.value = props.comissao.fimVigencia?.slice(0, 10) ?? ''
  } else {
    profissionalEstabelecimentoId.value = ''
    tipoComissao.value = 'Percentual'
    percentual.value = 10
    valorFixo.value = 0
    inicioVigencia.value = new Date().toISOString().slice(0, 10)
    fimVigencia.value = ''
  }
})

function close() {
  open.value = false
}

function handleConfirm() {
  if (!profissionalEstabelecimentoId.value || !inicioVigencia.value) return
  const payload: CriarComissaoPayload = {
    profissionalEstabelecimentoId: Number(profissionalEstabelecimentoId.value),
    tipoComissao: tipoComissao.value,
    inicioVigencia: inicioVigencia.value,
    fimVigencia: fimVigencia.value || null,
  }
  if (tipoComissao.value === 'Percentual' || tipoComissao.value === 'Mista') {
    payload.percentual = percentual.value
  }
  if (tipoComissao.value === 'ValorFixo' || tipoComissao.value === 'Mista') {
    payload.valorFixo = valorFixo.value
  }
  emit('confirm', payload)
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
        class="financeiro-modal-overlay"
        role="dialog"
        aria-modal="true"
        @click.self="close"
      >
        <div class="financeiro-modal">
          <div class="financeiro-modal__header">
            <h2 class="financeiro-modal__title">
              {{ comissao ? 'Editar comissão' : 'Nova comissão' }}
            </h2>
          </div>
          <div class="financeiro-modal__body space-y-4">
            <BaseSelect
              v-model="profissionalEstabelecimentoId"
              label="Profissional"
              :options="profissionalOptions"
              :disabled="!!comissao"
            />
            <BaseSelect v-model="tipoComissao" label="Tipo" :options="tipoOptions" />
            <div v-if="tipoComissao === 'Percentual' || tipoComissao === 'Mista'" class="space-y-1">
              <label class="font-urbanist text-sm font-medium text-glow-text">Percentual (%)</label>
              <input
                v-model.number="percentual"
                type="number"
                min="0"
                max="100"
                step="0.01"
                class="h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm outline-none focus:border-glow-gold focus:ring-1 focus:ring-glow-gold"
              />
            </div>
            <CurrencyInput
              v-if="tipoComissao === 'ValorFixo' || tipoComissao === 'Mista'"
              v-model="valorFixo"
              label="Valor fixo"
            />
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="font-urbanist text-sm font-medium text-glow-text">Início vigência</label>
                <input
                  v-model="inicioVigencia"
                  type="date"
                  class="mt-1 h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm outline-none focus:border-glow-gold focus:ring-1 focus:ring-glow-gold"
                />
              </div>
              <div>
                <label class="font-urbanist text-sm font-medium text-glow-text">Fim (opcional)</label>
                <input
                  v-model="fimVigencia"
                  type="date"
                  class="mt-1 h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm outline-none focus:border-glow-gold focus:ring-1 focus:ring-glow-gold"
                />
              </div>
            </div>
          </div>
          <div class="financeiro-modal__footer">
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
