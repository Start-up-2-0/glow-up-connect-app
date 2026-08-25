<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import faviconUrl from '@/assets/logo/favicon.webp'

const props = withDefaults(
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

const imagemComErro = ref(false)

const imagemExibida = computed(() =>
  props.imagem && !imagemComErro.value ? props.imagem : faviconUrl,
)

watch(() => props.imagem, () => {
  imagemComErro.value = false
})

function handleImageError() {
  if (imagemExibida.value !== faviconUrl) imagemComErro.value = true
}
</script>

<template>
  <div
    class="servico-imagem"
    :class="`servico-imagem--${size}`"
    aria-hidden="true"
  >
    <img
      :src="imagemExibida"
      :alt="alt"
      class="servico-imagem__img"
      :class="{ 'servico-imagem__img--fallback': !imagem || imagemComErro }"
      @error="handleImageError"
    />
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

.servico-imagem__img--fallback {
  object-fit: contain;
  padding: 18%;
}
</style>
