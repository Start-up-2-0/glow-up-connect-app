<script setup lang="ts">
import { computed } from 'vue'
import { ChevronRight } from 'lucide-vue-next'
import ServicoImagem from '@/components/servicos/ServicoImagem.vue'
import { formatPrecoFigma } from '@/utils/formatters'

const props = defineProps<{
  nome: string
  duracaoMinutos: number
  precoMinimo: number
  precoMaximo: number
  imagem?: string | null
  tipoServico?: 'Individual' | 'Combo'
  accentIndex?: number
}>()

const precoLabel = computed(() =>
  props.precoMinimo === props.precoMaximo
    ? formatPrecoFigma(props.precoMinimo)
    : `${formatPrecoFigma(props.precoMinimo)} – ${formatPrecoFigma(props.precoMaximo)}`,
)
</script>

<template>
  <div class="loja-servico-card">
    <ServicoImagem :imagem="imagem" :alt="nome" size="sm" class="loja-servico-card__thumb" />
    <div class="loja-servico-card__body">
      <div class="flex flex-wrap items-center gap-2">
        <p class="loja-servico-card__nome">{{ nome }}</p>
        <span
          v-if="tipoServico === 'Combo'"
          class="rounded-full bg-glow-gold/15 px-2 py-0.5 font-urbanist text-[10px] font-semibold uppercase tracking-wide text-glow-gold-dark"
        >
          Combo
        </span>
      </div>
      <p class="loja-servico-card__meta">{{ duracaoMinutos }} minutos</p>
    </div>
    <span class="loja-servico-card__preco">{{ precoLabel }}</span>
    <ChevronRight class="loja-servico-card__chevron" aria-hidden="true" />
  </div>
</template>
