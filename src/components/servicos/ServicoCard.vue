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
  <article class="servico-card">
    <ServicoImagem :imagem="servico.imagem" :alt="servico.nome" size="lg" class="servico-card__thumb" />
    <div class="servico-card__body">
      <div class="servico-card__info">
        <div class="servico-card__title-row">
          <h2 class="servico-card__title">{{ servico.nome }}</h2>
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
        <p v-if="servico.descricao" class="servico-card__description">
          {{ servico.descricao }}
        </p>
        <div class="servico-card__meta">
          <span class="servico-card__meta-item">
            <ServicoIcons name="clock" />
            {{ formatDuracaoMinutos(duracao) }}
          </span>
          <span class="servico-card__meta-item servico-card__meta-item--price">
            <ServicoIcons name="coin" />
            {{ formatCurrency(preco) }}
          </span>
        </div>
      </div>

      <div v-if="podeGerenciar" class="servico-card__actions">
        <button type="button" class="servicos-btn-outline" @click="emit('editar')">
          <ServicoIcons name="edit" />
          Editar
        </button>
        <button
          v-if="temModuloProfissionais"
          type="button"
          class="servicos-btn-outline"
          @click="emit('profissionais')"
        >
          <ServicoIcons name="profissionais" />
          Profissionais
        </button>
        <button
          type="button"
          class="servicos-btn-outline"
          :disabled="toggling"
          @click="emit('toggleStatus')"
        >
          <ServicoIcons :name="servico.ativo ? 'desativar' : 'ativar'" />
          {{ servico.ativo ? 'Desativar' : 'Ativar' }}
        </button>
      </div>
    </div>
  </article>
</template>
