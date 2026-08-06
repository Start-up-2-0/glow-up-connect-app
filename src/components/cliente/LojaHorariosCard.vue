<script setup lang="ts">
import { computed, ref } from 'vue'
import { ChevronDown, Clock3 } from 'lucide-vue-next'
import { formatHorarioFigma } from '@/utils/formatters'

const props = defineProps<{
  abertoAgora?: boolean
  horarioAbertura?: string | null
  horarioFechamento?: string | null
}>()

const expandido = ref(false)

const dias = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
] as const

const hojeIndex = computed(() => {
  const js = new Date().getDay()
  return js === 0 ? 6 : js - 1
})

const faixaHoje = computed(() => {
  if (!props.horarioAbertura || !props.horarioFechamento) return null
  return `${formatHorarioFigma(props.horarioAbertura)} – ${formatHorarioFigma(props.horarioFechamento)}`
})

const linhas = computed(() =>
  dias.map((dia, index) => {
    const isToday = index === hojeIndex.value
    if (index === 6) {
      return {
        dia,
        isToday,
        texto: isToday && faixaHoje.value ? faixaHoje.value : 'Fechado',
        fechado: !(isToday && faixaHoje.value),
      }
    }
    if (index === 5) {
      return {
        dia,
        isToday,
        texto: faixaHoje.value ?? 'Consulte',
        fechado: !faixaHoje.value,
      }
    }
    return {
      dia,
      isToday,
      texto: faixaHoje.value ?? '—',
      fechado: !faixaHoje.value,
    }
  }),
)
</script>

<template>
  <section class="loja-horarios-card">
    <header class="loja-horarios-card__head">
      <div class="loja-horarios-card__title-wrap">
        <Clock3 class="size-4 text-glow-gold-cta" aria-hidden="true" />
        <h2 class="loja-horarios-card__title">Horários</h2>
      </div>
      <span
        class="loja-horarios-card__status"
        :class="abertoAgora ? 'loja-horarios-card__status--open' : 'loja-horarios-card__status--closed'"
      >
        {{ abertoAgora ? 'Aberto' : 'Fechado' }}
      </span>
    </header>

    <p v-if="faixaHoje" class="loja-horarios-card__hoje">
      Hoje · <strong>{{ faixaHoje }}</strong>
    </p>
    <p v-else class="loja-horarios-card__hoje loja-horarios-card__hoje--muted">
      Horário de hoje indisponível
    </p>

    <button
      type="button"
      class="loja-horarios-card__toggle"
      :aria-expanded="expandido"
      @click="expandido = !expandido"
    >
      {{ expandido ? 'Ocultar semana' : 'Ver semana completa' }}
      <ChevronDown
        class="size-4 transition-transform"
        :class="{ 'rotate-180': expandido }"
        aria-hidden="true"
      />
    </button>

    <ul
      class="loja-horarios-card__list"
      :class="{ 'loja-horarios-card__list--open': expandido }"
    >
      <li
        v-for="linha in linhas"
        :key="linha.dia"
        class="loja-horarios-card__row"
        :class="{ 'loja-horarios-card__row--today': linha.isToday }"
      >
        <span>{{ linha.dia }}</span>
        <span :class="{ 'text-glow-text-subtle': linha.fechado }">{{ linha.texto }}</span>
      </li>
    </ul>
  </section>
</template>
