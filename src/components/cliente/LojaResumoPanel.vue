<script setup lang="ts">
import { computed } from 'vue'
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Heart,
  MapPin,
} from 'lucide-vue-next'
import AvaliacaoNotaResumo from '@/components/avaliacao/AvaliacaoNotaResumo.vue'
import { CLIENTE_BTN_CTA_CLASS } from '@/constants/designTokens'
import { lojaAgendarUrl } from '@/constants/routes'
import type { EstabelecimentoPublico } from '@/types/estabelecimento.types'
import { formatDistanciaKm, formatEnderecoCard, formatHorarioFigma } from '@/utils/formatters'

const props = defineProps<{
  loja: EstabelecimentoPublico
  tempoMedioMinutos?: number | null
  /** Esconde o CTA do card (ex.: barra fixa no mobile). */
  hideCta?: boolean
}>()

const emit = defineEmits<{
  'toggle-favorito': []
}>()

const favorito = defineModel<boolean>('favorito', { default: false })

const distanciaLabel = computed(() =>
  props.loja.distanciaKm != null ? formatDistanciaKm(props.loja.distanciaKm) : '—',
)

const horarioAberturaLabel = computed(() =>
  props.loja.horarioAbertura ? formatHorarioFigma(props.loja.horarioAbertura) : '—',
)

const horarioFechamentoLabel = computed(() =>
  props.loja.horarioFechamento ? formatHorarioFigma(props.loja.horarioFechamento) : '—',
)

const tempoMedioLabel = computed(() => {
  const n = props.tempoMedioMinutos
  if (n == null || !Number.isFinite(n) || n <= 0) return '—'
  return `${Math.round(n)} min`
})

const enderecoCompleto = computed(() =>
  props.loja.endereco ? formatEnderecoCard(props.loja.endereco) : null,
)

const mapaUrl = computed(() => {
  if (!enderecoCompleto.value) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(enderecoCompleto.value)}`
})

const inicial = computed(() => (props.loja.nome?.charAt(0) || '?').toUpperCase())
</script>

<template>
  <section class="loja-hero-card">
    <div class="loja-hero-card__media">
      <img
        v-if="loja.logo"
        :src="loja.logo"
        :alt="loja.nome"
        class="loja-hero-card__img"
      />
      <span v-else class="loja-hero-card__img-fallback">{{ inicial }}</span>
      <button
        type="button"
        class="loja-hero-card__fav"
        :class="{ 'loja-hero-card__fav--on': favorito }"
        :aria-pressed="favorito"
        :aria-label="favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
        @click="favorito = !favorito; emit('toggle-favorito')"
      >
        <Heart class="size-4" :fill="favorito ? 'currentColor' : 'none'" aria-hidden="true" />
      </button>
      <div v-if="loja.abertoAgora" class="loja-hero-card__badge loja-hero-card__badge--on-media">
        <span class="loja-hero-card__badge-dot" aria-hidden="true" />
        ABERTO AGORA
      </div>
      <div v-else class="loja-hero-card__badge loja-hero-card__badge--closed loja-hero-card__badge--on-media">
        FECHADO AGORA
      </div>
    </div>

    <div class="loja-hero-card__body">
      <div class="loja-hero-card__identity">
        <div class="loja-hero-card__badge-desktop">
          <div v-if="loja.abertoAgora" class="loja-hero-card__badge">
            <span class="loja-hero-card__badge-dot" aria-hidden="true" />
            ABERTO AGORA
          </div>
          <div v-else class="loja-hero-card__badge loja-hero-card__badge--closed">
            FECHADO AGORA
          </div>
        </div>

        <div class="loja-hero-card__title-row">
          <h1 class="loja-hero-card__nome">{{ loja.nome }}</h1>
          <CheckCircle2
            v-if="(loja.notaMedia ?? 0) >= 4.5"
            class="loja-hero-card__verified"
            aria-label="Loja bem avaliada"
          />
        </div>

        <AvaliacaoNotaResumo
          class="loja-hero-card__rating"
          :nota-media="loja.notaMedia ?? 0"
          :total-avaliacoes="loja.totalAvaliacoes ?? 0"
          variant="inline"
        />

        <p v-if="loja.categoria" class="loja-hero-card__categoria">{{ loja.categoria }}</p>
      </div>

      <div class="loja-hero-card__stats">
        <div class="loja-hero-stat">
          <span class="loja-hero-stat__icon"><MapPin class="size-3.5" aria-hidden="true" /></span>
          <div>
            <p class="loja-hero-stat__label">Distância</p>
            <p class="loja-hero-stat__value">{{ distanciaLabel }}</p>
          </div>
        </div>
        <div class="loja-hero-stat">
          <span class="loja-hero-stat__icon"><Clock3 class="size-3.5" aria-hidden="true" /></span>
          <div>
            <p class="loja-hero-stat__label">Abre</p>
            <p class="loja-hero-stat__value">{{ horarioAberturaLabel }}</p>
          </div>
        </div>
        <div class="loja-hero-stat">
          <span class="loja-hero-stat__icon"><Clock3 class="size-3.5" aria-hidden="true" /></span>
          <div>
            <p class="loja-hero-stat__label">Fecha</p>
            <p class="loja-hero-stat__value">{{ horarioFechamentoLabel }}</p>
          </div>
        </div>
        <div class="loja-hero-stat">
          <span class="loja-hero-stat__icon"><CalendarDays class="size-3.5" aria-hidden="true" /></span>
          <div>
            <p class="loja-hero-stat__label">Média</p>
            <p class="loja-hero-stat__value">{{ tempoMedioLabel }}</p>
          </div>
        </div>
      </div>

      <div v-if="enderecoCompleto" class="loja-hero-card__address">
        <div class="loja-hero-card__address-main">
          <MapPin class="size-4 shrink-0 text-glow-gold-cta" aria-hidden="true" />
          <p>{{ enderecoCompleto }}</p>
        </div>
        <a
          v-if="mapaUrl"
          :href="mapaUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="loja-hero-card__map-link"
        >
          Ver no mapa
          <ExternalLink class="size-3.5" aria-hidden="true" />
        </a>
      </div>

      <p v-if="loja.descricao" class="loja-hero-card__desc">{{ loja.descricao }}</p>

      <a
        v-if="!hideCta"
        :href="lojaAgendarUrl(loja.publicGuid)"
        class="loja-hero-card__cta loja-hero-card__cta--desktop"
      >
        <span :class="CLIENTE_BTN_CTA_CLASS">
          <CalendarDays class="size-4" aria-hidden="true" />
          Continuar agendamento
        </span>
      </a>
    </div>
  </section>
</template>
