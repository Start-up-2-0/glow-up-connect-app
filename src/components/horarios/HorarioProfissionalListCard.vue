<script setup lang="ts">
import HorarioStatusBadge from '@/components/horarios/HorarioStatusBadge.vue'
import ServicoIcons from '@/components/servicos/ServicoIcons.vue'

defineProps<{
  diaLabel: string
  horaInicio: string
  horaFim: string
  ativo: boolean
  toggling?: boolean
  readonly?: boolean
}>()

const emit = defineEmits<{
  editar: []
  ativar: []
  desativar: []
}>()
</script>

<template>
  <article class="horario-prof-list-card">
    <div class="horario-prof-list-card__main">
      <div class="horario-prof-list-card__title-row">
        <h3 class="horario-prof-list-card__title">{{ diaLabel }}</h3>
        <HorarioStatusBadge :ativo="ativo" />
      </div>
      <p class="horario-prof-list-card__time">
        <ServicoIcons name="clock" />
        {{ horaInicio }} às {{ horaFim }}
      </p>
    </div>

    <div v-if="!readonly" class="horario-prof-list-card__actions">
      <button
        v-if="ativo"
        type="button"
        class="horarios-btn-outline horarios-btn-outline--sm"
        @click="emit('editar')"
      >
        <ServicoIcons name="edit" />
        Editar
      </button>
      <button
        v-if="ativo"
        type="button"
        class="horarios-btn-outline horarios-btn-outline--sm"
        :disabled="toggling"
        @click="emit('desativar')"
      >
        <ServicoIcons name="desativar" />
        Desativar
      </button>
      <button
        v-else
        type="button"
        class="horarios-btn-ativar horarios-btn-ativar--sm"
        :disabled="toggling"
        @click="emit('ativar')"
      >
        <ServicoIcons name="ativar" />
        Ativar
      </button>
    </div>
  </article>
</template>
