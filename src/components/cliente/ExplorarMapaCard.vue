<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { X } from 'lucide-vue-next'
import AvaliacaoNotaResumo from '@/components/avaliacao/AvaliacaoNotaResumo.vue'
import type { EstabelecimentoProximo } from '@/types/estabelecimento.types'
import { lojaAgendarUrl, lojaDetalhePath } from '@/constants/routes'
import { formatDistanciaKm } from '@/utils/formatters'
import { formatEnderecoMapa } from '@/utils/explorarMapa'

defineProps<{
  item: EstabelecimentoProximo
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <article class="explorar-mapa-card" role="dialog" :aria-label="item.nome">
    <button
      type="button"
      class="explorar-mapa-card__close"
      aria-label="Fechar"
      @click="emit('close')"
    >
      <X class="size-4" aria-hidden="true" />
    </button>

    <div class="explorar-mapa-card__media">
      <img
        v-if="item.logo"
        :src="item.logo"
        :alt="item.nome"
        class="size-full object-cover"
      />
      <span v-else class="explorar-mapa-card__media-fallback">
        {{ item.nome.charAt(0) }}
      </span>
      <span
        v-if="item.destaqueMarketplace"
        class="explorar-mapa-card__badge"
      >
        Destaque
      </span>
    </div>

    <div class="explorar-mapa-card__body">
      <h2 class="explorar-mapa-card__title">{{ item.nome }}</h2>

      <span v-if="item.categoria" class="explorar-mapa-card__categoria">
        {{ item.categoria }}
      </span>

      <div class="explorar-mapa-card__meta">
        <AvaliacaoNotaResumo
          :nota-media="item.notaMedia ?? 0"
          :total-avaliacoes="item.totalAvaliacoes ?? 0"
          variant="inline"
        />
        <span class="explorar-mapa-card__distancia">
          {{ formatDistanciaKm(item.distanciaKm) }}
        </span>
      </div>

      <p class="explorar-mapa-card__endereco">{{ formatEnderecoMapa(item) }}</p>

      <div class="explorar-mapa-card__actions">
        <RouterLink
          :to="lojaDetalhePath(item.publicGuid)"
          class="explorar-mapa-card__btn explorar-mapa-card__btn--ghost"
        >
          Ver detalhes
        </RouterLink>
        <a
          :href="lojaAgendarUrl(item.publicGuid)"
          class="explorar-mapa-card__btn explorar-mapa-card__btn--primary"
        >
          Agendar
        </a>
      </div>
    </div>
  </article>
</template>

<style scoped>
.explorar-mapa-card {
  display: grid;
  grid-template-columns: 5.5rem 1fr;
  gap: 0.75rem;
  border-radius: 1rem;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  box-shadow: 0 16px 40px -20px rgb(30 18 40 / 0.45);
  padding: 0.65rem;
  position: relative;
}

.explorar-mapa-card__close {
  position: absolute;
  top: 0.4rem;
  right: 0.4rem;
  z-index: 2;
  display: inline-flex;
  width: 1.75rem;
  height: 1.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  border: none;
  background: color-mix(in srgb, var(--glow-surface) 80%, transparent);
  color: var(--glow-text-subtle);
  cursor: pointer;
}

.explorar-mapa-card__media {
  position: relative;
  width: 5.5rem;
  height: 5.5rem;
  overflow: hidden;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--glow-gold-cta) 14%, transparent);
}

.explorar-mapa-card__media-fallback {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  font-family: 'Satoshi', ui-sans-serif, system-ui, sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--glow-gold-cta);
}

.explorar-mapa-card__badge {
  position: absolute;
  left: 0.35rem;
  bottom: 0.35rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--glow-gold-cta) 92%, #1a1020);
  color: #fff;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 0.15rem 0.4rem;
}

.explorar-mapa-card__body {
  min-width: 0;
  padding-right: 1.25rem;
}

.explorar-mapa-card__title {
  font-family: 'Satoshi', ui-sans-serif, system-ui, sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--glow-text);
  line-height: 1.25;
}

.explorar-mapa-card__categoria {
  margin-top: 0.25rem;
  display: inline-flex;
  border-radius: 9999px;
  padding: 0.15rem 0.5rem;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--glow-gold-cta);
  background: color-mix(in srgb, var(--glow-gold-cta) 12%, transparent);
}

.explorar-mapa-card__meta {
  margin-top: 0.4rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.explorar-mapa-card__distancia {
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--glow-text-subtle);
}

.explorar-mapa-card__endereco {
  margin-top: 0.25rem;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 0.7rem;
  color: var(--glow-text-subtle);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.explorar-mapa-card__actions {
  margin-top: 0.65rem;
  display: flex;
  gap: 0.4rem;
}

.explorar-mapa-card__btn {
  display: inline-flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  height: 2rem;
  border-radius: 0.65rem;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  text-decoration: none;
}

.explorar-mapa-card__btn--ghost {
  border: 1px solid var(--glow-border-soft);
  color: var(--glow-text);
  background: var(--glow-hover-surface);
}

.explorar-mapa-card__btn--primary {
  background: var(--glow-gold-cta);
  color: #fff;
}
</style>
