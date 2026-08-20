<script setup lang="ts">
import { CalendarDays } from 'lucide-vue-next'
</script>

<template>
  <section class="horarios-excecoes">
    <div class="horarios-excecoes__empty">
      <div class="horarios-excecoes__icon" aria-hidden="true">
        <CalendarDays class="size-6" />
      </div>
      <h3 class="horarios-excecoes__title">Exceções e feriados</h3>
      <p class="horarios-excecoes__desc">
        Em breve você poderá cadastrar feriados e dias com horário especial — por exemplo,
        fechar no Natal ou atender meio período na véspera de Ano Novo.
      </p>
      <span class="horarios-excecoes__badge">Em breve</span>
    </div>

    <div class="horarios-excecoes__preview" aria-hidden="true">
      <article class="horarios-excecoes__card">
        <div>
          <p class="horarios-excecoes__date">25 Dez 2026</p>
          <p class="horarios-excecoes__name">Natal</p>
        </div>
        <span class="horario-status-badge horario-status-badge--inativo">Fechado</span>
      </article>
      <article class="horarios-excecoes__card">
        <div>
          <p class="horarios-excecoes__date">31 Dez 2026</p>
          <p class="horarios-excecoes__name">Véspera de Ano Novo</p>
        </div>
        <span class="horarios-excecoes__hours">08:00 — 14:00</span>
      </article>
    </div>
  </section>
</template>
