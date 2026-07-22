<script setup lang="ts">
defineProps<{
  visible: boolean
  loading?: boolean
}>()

defineEmits<{
  cancel: []
  save: []
}>()
</script>

<template>
  <Transition name="perfil-save-bar">
    <div v-if="visible" class="perfil-save-bar" role="region" aria-label="Alterações pendentes">
      <p class="perfil-save-bar__text">Existem alterações não salvas.</p>
      <div class="perfil-save-bar__actions">
        <button type="button" class="perfil-save-bar__cancel" @click="$emit('cancel')">
          Cancelar
        </button>
        <button
          type="button"
          class="perfil-save-bar__save"
          :disabled="loading"
          @click="$emit('save')"
        >
          {{ loading ? 'Salvando...' : 'Salvar alterações' }}
        </button>
      </div>
    </div>
  </Transition>
</template>
