<script setup lang="ts">
defineProps<{
  progressoPerfil: number
  temAgendamentos: boolean
  loading?: boolean
}>()

defineEmits<{
  completarPerfil: []
  explorar: []
}>()
</script>

<template>
  <section v-if="loading || progressoPerfil < 100 || !temAgendamentos" class="dashboard-cliente-progress">
    <div v-if="loading" class="dashboard-cliente-progress__skeleton">
      <span class="dashboard-skeleton dashboard-skeleton--line" />
      <span class="dashboard-skeleton dashboard-skeleton--bar" />
    </div>

    <template v-else>
      <div v-if="progressoPerfil < 100" class="dashboard-cliente-progress__block">
        <div class="dashboard-cliente-progress__head">
          <p class="dashboard-cliente-progress__label">Perfil {{ progressoPerfil }}%</p>
          <button type="button" class="dashboard-cliente-progress__link" @click="$emit('completarPerfil')">
            Complete seu cadastro
          </button>
        </div>
        <div class="dashboard-cliente-progress__track">
          <span class="dashboard-cliente-progress__bar" :style="{ width: `${progressoPerfil}%` }" />
        </div>
      </div>

      <div v-if="!temAgendamentos" class="dashboard-cliente-progress__block">
        <div class="dashboard-cliente-progress__head">
          <p class="dashboard-cliente-progress__label">Primeiro agendamento</p>
          <button type="button" class="dashboard-cliente-progress__link" @click="$emit('explorar')">
            Agendar agora
          </button>
        </div>
        <div class="dashboard-cliente-progress__track dashboard-cliente-progress__track--dotted">
          <span class="dashboard-cliente-progress__dot" />
        </div>
        <p class="dashboard-cliente-progress__hint">Falta agendar um serviço</p>
      </div>
    </template>
  </section>
</template>
