<script setup lang="ts">
import { formatPrecoFigma } from '@/utils/formatters'

defineProps<{
  nome: string
  duracaoMinutos: number
  precoMinimo: number
  precoMaximo: number
}>()
</script>

<template>
  <div class="cliente-servico-card">
    <div class="cliente-servico-card__icon" aria-hidden="true">
      <svg class="size-6" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 7l3 14h6l3-14M9 7V5a3 3 0 0 1 6 0v2"
          stroke="currentColor"
          stroke-width="1.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path d="M8 11h8M7 15h10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
      </svg>
    </div>
    <div class="cliente-servico-card__content">
      <p class="cliente-servico-card__nome">{{ nome }}</p>
      <p class="cliente-servico-card__duracao">{{ duracaoMinutos }} minutos</p>
    </div>
    <span class="cliente-servico-card__preco">
      {{
        precoMinimo === precoMaximo
          ? formatPrecoFigma(precoMinimo)
          : `${formatPrecoFigma(precoMinimo)} – ${formatPrecoFigma(precoMaximo)}`
      }}
    </span>
  </div>
</template>
