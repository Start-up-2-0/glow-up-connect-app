<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  agendamentoId: number
  profissionalNome: string
  servicosLabel: string
  dataLabel: string
  horarioLabel: string
}>()
</script>

<template>
  <div class="agendar-success">
    <div class="agendar-success__icon" aria-hidden="true">
      <div class="agendar-success__icon-outer">
        <div class="agendar-success__icon-inner">
          <svg class="agendar-success__check" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>

    <h1 class="agendar-success__title">{{ title }}</h1>
    <p class="agendar-success__subtitle">{{ subtitle }}</p>

    <div class="agendar-success__card">
      <div class="agendar-success__card-header">
        <span class="agendar-success__label">Número do Agendamento</span>
        <span class="agendar-success__value font-semibold">#{{ agendamentoId }}</span>
      </div>

      <hr class="agendar-success__card-divider" />

      <dl class="agendar-success__details">
        <div class="agendar-success__row">
          <dt class="agendar-success__label">Profissional</dt>
          <dd class="agendar-success__value">{{ profissionalNome }}</dd>
        </div>
        <div class="agendar-success__row">
          <dt class="agendar-success__label">Serviço</dt>
          <dd class="agendar-success__value">{{ servicosLabel }}</dd>
        </div>
        <div class="agendar-success__row">
          <dt class="agendar-success__label">Data</dt>
          <dd class="agendar-success__value">{{ dataLabel }}</dd>
        </div>
        <div class="agendar-success__row">
          <dt class="agendar-success__label">Horário</dt>
          <dd class="agendar-success__value">{{ horarioLabel }}</dd>
        </div>
      </dl>
    </div>

    <div class="agendar-success__actions">
      <slot />
    </div>
  </div>
</template>
