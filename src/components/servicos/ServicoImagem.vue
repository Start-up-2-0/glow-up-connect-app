<script setup lang="ts">
import ServicoIcons from '@/components/servicos/ServicoIcons.vue'

withDefaults(
  defineProps<{
    imagem?: string | null
    alt?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  {
    imagem: null,
    alt: 'Imagem do serviço',
    size: 'md',
  },
)
</script>

<template>
  <div
    class="servico-imagem"
    :class="`servico-imagem--${size}`"
    aria-hidden="true"
  >
    <img
      v-if="imagem"
      :src="imagem"
      :alt="alt"
      class="servico-imagem__img"
    />
    <ServicoIcons v-else name="empty" class="servico-imagem__fallback" />
  </div>
</template>

<style scoped>
.servico-imagem {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 0.75rem;
  background: var(--glow-hover-surface, rgba(0, 0, 0, 0.04));
  flex-shrink: 0;
}

.servico-imagem--sm {
  width: 2.75rem;
  height: 2.75rem;
}

.servico-imagem--md {
  width: 3.5rem;
  height: 3.5rem;
}

.servico-imagem--lg {
  width: 4.5rem;
  height: 4.5rem;
}

.servico-imagem__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.servico-imagem__fallback {
  width: 60%;
  height: 60%;
  color: var(--glow-text-subtle, #888);
}
</style>
