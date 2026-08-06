<script setup lang="ts">
import { computed } from 'vue'
import type { ProfissionalPublico } from '@/types/agendamento.types'

const props = defineProps<{
  profissionais: ProfissionalPublico[]
}>()

const lista = computed(() => props.profissionais.slice(0, 8))

function iniciais(nome: string) {
  const parts = nome.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase()
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase()
}
</script>

<template>
  <section v-if="lista.length > 0" class="loja-profissionais-card">
    <header class="loja-profissionais-card__head">
      <h2 class="loja-profissionais-card__title">Profissionais</h2>
      <span class="loja-profissionais-card__count">{{ profissionais.length }}</span>
    </header>

    <ul class="loja-profissionais-card__list">
      <li v-for="prof in lista" :key="prof.publicGuid" class="loja-profissionais-card__item">
        <div class="loja-profissionais-card__avatar">
          <img
            v-if="prof.foto"
            :src="prof.foto"
            :alt="prof.nomePublico"
            class="size-full object-cover"
          />
          <span v-else>{{ iniciais(prof.nomePublico) }}</span>
        </div>
        <p class="loja-profissionais-card__nome">{{ prof.nomePublico }}</p>
      </li>
    </ul>
  </section>
</template>
