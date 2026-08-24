<script setup lang="ts">
import ServicoIcons from '@/components/servicos/ServicoIcons.vue'
import ServicoImagem from '@/components/servicos/ServicoImagem.vue'
import type { Servico } from '@/types/negocio/servico.types'
import { formatCurrency } from '@/utils/formatters'
import { formatDuracaoMinutos } from '@/utils/servicoFormatters'

defineProps<{
  servico: Servico
  preco: number
  duracao: number
  podeGerenciar: boolean
  temModuloProfissionais: boolean
  toggling?: boolean
}>()

const emit = defineEmits<{
  editar: []
  profissionais: []
  toggleStatus: []
}>()
</script>

<template>
  <article
    class="servico-card"
    :class="{
      'servico-card--combo': servico.tipoServico === 'Combo',
      'servico-card--inativo': !servico.ativo,
    }"
  >
    <div class="servico-card__header">
      <ServicoImagem
        :imagem="servico.imagem"
        :alt="servico.nome"
        size="sm"
        class="servico-card__thumb"
      />
      <div class="servico-card__info">
        <h2 class="servico-card__title">{{ servico.nome }}</h2>
        <div class="servico-card__badges">
          <span
            v-if="servico.tipoServico === 'Combo'"
            class="servico-status-badge servico-status-badge--combo"
          >
            Combo
          </span>
          <span
            class="servico-status-badge"
            :class="
              servico.ativo ? 'servico-status-badge--ativo' : 'servico-status-badge--inativo'
            "
          >
            {{ servico.ativo ? 'Ativo' : 'Inativo' }}
          </span>
        </div>
      </div>
    </div>

    <p v-if="servico.descricao" class="servico-card__description">
      {{ servico.descricao }}
    </p>

    <div class="servico-card__meta">
      <span class="servico-card__meta-item">
        <ServicoIcons name="clock" />
        {{ formatDuracaoMinutos(duracao) }}
      </span>
      <span class="servico-card__meta-item servico-card__meta-item--price">
        {{ formatCurrency(preco) }}
      </span>
    </div>

    <div v-if="podeGerenciar" class="servico-card__actions">
      <button
        type="button"
        class="servico-card__action"
        aria-label="Editar serviço"
        @click="emit('editar')"
      >
        <ServicoIcons name="edit" />
        <span>Editar</span>
      </button>
      <button
        v-if="temModuloProfissionais"
        type="button"
        class="servico-card__action"
        aria-label="Gerenciar profissionais do serviço"
        @click="emit('profissionais')"
      >
        <ServicoIcons name="profissionais" />
        <span>Profissionais</span>
      </button>
      <button
        type="button"
        class="servico-card__action"
        :disabled="toggling"
        :aria-label="servico.ativo ? 'Desativar serviço' : 'Ativar serviço'"
        @click="emit('toggleStatus')"
      >
        <ServicoIcons :name="servico.ativo ? 'desativar' : 'ativar'" />
        <span>{{ servico.ativo ? 'Desativar' : 'Ativar' }}</span>
      </button>
    </div>
  </article>
</template>
