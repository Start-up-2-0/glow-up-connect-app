<script setup lang="ts">
import EquipeIcons from '@/components/equipe/EquipeIcons.vue'
import { iniciaisNome } from '@/utils/servicoFormatters'

withDefaults(
  defineProps<{
    nome: string
    cargo: string
    email?: string
    telefone?: string
    ativo?: boolean
    interactive?: boolean
  }>(),
  {
    ativo: true,
    interactive: false,
  },
)

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <article
    class="equipe-member-card"
    :class="{
      'equipe-member-card--inactive': !ativo,
      'equipe-member-card--interactive': interactive,
    }"
    :role="interactive ? 'button' : undefined"
    :tabindex="interactive ? 0 : undefined"
    @click="interactive ? emit('click') : undefined"
    @keydown.enter="interactive ? emit('click') : undefined"
    @keydown.space.prevent="interactive ? emit('click') : undefined"
  >
    <span class="equipe-member-card__avatar">{{ iniciaisNome(nome) }}</span>
    <div class="equipe-member-card__body">
      <div class="equipe-member-card__title-row">
        <h2 class="equipe-member-card__name">{{ nome }}</h2>
        <span class="equipe-member-card__role">{{ cargo }}</span>
        <span v-if="!ativo" class="equipe-member-card__inactive-badge">Inativo</span>
      </div>
      <div class="equipe-member-card__meta">
        <p v-if="email" class="equipe-member-card__meta-item">
          <EquipeIcons name="email" />
          {{ email }}
        </p>
        <p v-if="telefone" class="equipe-member-card__meta-item">
          <EquipeIcons name="phone" />
          {{ telefone }}
        </p>
      </div>
    </div>
  </article>
</template>
