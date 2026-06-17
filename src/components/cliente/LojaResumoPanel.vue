<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { CLIENTE_BTN_CTA_CLASS } from '@/constants/designTokens'
import { lojaAgendarPath } from '@/constants/routes'
import type { EstabelecimentoPublico } from '@/types/estabelecimento.types'
import { formatDistanciaKm, formatEnderecoCard, formatHorarioFigma } from '@/utils/formatters'

defineProps<{
  loja: EstabelecimentoPublico
}>()
</script>

<template>
  <section class="cliente-loja-panel">
    <div class="cliente-loja-panel__top">
      <div v-if="loja.abertoAgora" class="cliente-loja-badge">
        <span class="cliente-loja-badge__dot" aria-hidden="true" />
        ABERTO AGORA
      </div>
      <div v-else aria-hidden="true" />

      <div v-if="loja.notaMedia != null" class="cliente-loja-rating">
        <div class="cliente-loja-rating__score">
          <svg class="size-4 shrink-0 text-glow-gold-cta" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M8 1.5l1.76 3.57 3.94.57-2.85 2.78.67 3.92L8 10.67l-3.52 1.85.67-3.92-2.85-2.78 3.94-.57L8 1.5Z"
              fill="currentColor"
            />
          </svg>
          <span>{{ loja.notaMedia.toFixed(1) }}</span>
        </div>
        <p v-if="loja.totalAvaliacoes != null" class="cliente-loja-rating__count">
          {{ loja.totalAvaliacoes }} avaliações
        </p>
      </div>
    </div>

    <h2 class="cliente-loja-panel__nome">{{ loja.nome }}</h2>

    <div class="cliente-loja-stats-row">
      <div v-if="loja.distanciaKm != null" class="cliente-loja-stat-box">
        <div class="cliente-loja-stat-box__icon-wrap">
          <svg class="size-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7Z"
              stroke="currentColor"
              stroke-width="1.2"
            />
            <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="1.2" />
          </svg>
        </div>
        <div>
          <p class="cliente-loja-stat-box__label">Distância</p>
          <p class="cliente-loja-stat-box__value">{{ formatDistanciaKm(loja.distanciaKm) }}</p>
        </div>
      </div>

      <div
        v-if="loja.horarioAbertura || loja.horarioFechamento"
        class="cliente-loja-stat-box cliente-loja-stat-box--horarios"
      >
        <div class="cliente-loja-stat-box__icon-wrap">
          <svg class="size-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="1.2" />
            <path d="M12 7v5l3 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </div>
        <div class="cliente-loja-stat-box__horarios-grid">
          <div v-if="loja.horarioAbertura">
            <p class="cliente-loja-stat-box__label">Abre às</p>
            <p class="cliente-loja-stat-box__value">{{ formatHorarioFigma(loja.horarioAbertura) }}</p>
          </div>
          <div v-if="loja.horarioFechamento">
            <p class="cliente-loja-stat-box__label">Fecha às</p>
            <p class="cliente-loja-stat-box__value">{{ formatHorarioFigma(loja.horarioFechamento) }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loja.endereco" class="cliente-loja-address-bar">
      <svg class="size-[22px] shrink-0 text-glow-text" viewBox="0 0 22 22" fill="none" aria-hidden="true">
        <path
          d="M3 9.5C3 5.91 5.91 3 9.5 3S16 5.91 16 9.5c0 4.75-6.5 10.5-6.5 10.5S3 14.25 3 9.5Z"
          stroke="currentColor"
          stroke-width="1.2"
        />
        <circle cx="9.5" cy="9.5" r="2" stroke="currentColor" stroke-width="1.2" />
      </svg>
      <p class="cliente-loja-address-bar__text">
        {{ formatEnderecoCard(loja.endereco) }}
      </p>
    </div>

    <RouterLink :to="lojaAgendarPath(loja.publicGuid)" class="block">
      <span :class="CLIENTE_BTN_CTA_CLASS">
        Continuar agendamento
        <svg class="size-4 rotate-[138deg]" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
    </RouterLink>
  </section>
</template>
