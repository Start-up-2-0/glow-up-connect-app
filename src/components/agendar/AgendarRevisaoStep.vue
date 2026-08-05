<script setup lang="ts">
import UserAvatar from '@/components/layout/UserAvatar.vue'
import type { ServicoPublico } from '@/types/agendamento.types'
import {
  AGENDAR_BTN_CONTINUE_CLASS,
  AGENDAR_PRICE_PILL_CLASS,
  GLOW_INPUT_CLASS,
  GLOW_LABEL_CLASS,
} from '@/constants/designTokens'
import { formatPrecoRange, formatTelefone } from '@/utils/formatters'

defineProps<{
  showCliente: boolean
  clienteNome: string
  clienteEmail: string
  clienteTelefone: string
  profissionalNome: string
  profissionalFoto?: string | null
  estabelecimentoNome: string
  servicos: ServicoPublico[]
  dataLabel: string
  horarioLabel: string
  duracaoTotal: number
  valorTotalLabel: string
  showRegisterPassword: boolean
  submitting: boolean
}>()

const cadastroSenha = defineModel<string>('cadastroSenha', { default: '' })
const observacao = defineModel<string>('observacao', { default: '' })

const emit = defineEmits<{
  confirm: []
}>()
</script>

<template>
  <div class="agendar-review-step">
    <section v-if="showCliente" class="agendar-review-card">
      <h2 class="agendar-review-card__title">Cliente</h2>
      <div class="agendar-review-fields-grid">
        <div class="agendar-review-field">
          <p class="agendar-review-field__label">Nome</p>
          <p class="agendar-review-field__value">{{ clienteNome }}</p>
        </div>
        <div class="agendar-review-field">
          <p class="agendar-review-field__label">E-mail</p>
          <p class="agendar-review-field__value break-all">{{ clienteEmail }}</p>
        </div>
        <div class="agendar-review-field">
          <p class="agendar-review-field__label">Telefone</p>
          <p class="agendar-review-field__value">{{ formatTelefone(clienteTelefone) }}</p>
        </div>
      </div>
    </section>

    <section class="agendar-review-card">
      <h2 class="agendar-review-card__title">Profissional</h2>
      <div class="agendar-review-profissional-body">
        <UserAvatar :src="profissionalFoto" :name="profissionalNome" size="md" class="!size-12" />
        <div class="min-w-0">
          <p class="font-urbanist text-base font-semibold text-glow-text">{{ profissionalNome }}</p>
          <p
            v-if="estabelecimentoNome"
            class="mt-1 font-urbanist text-sm text-glow-text-subtle"
          >
            {{ estabelecimentoNome }}
          </p>
        </div>
      </div>
    </section>

    <section class="agendar-review-card">
      <h2 class="agendar-review-card__title">Serviços</h2>
      <ul class="agendar-review-service-list">
        <li
          v-for="servico in servicos"
          :key="servico.id"
          class="agendar-review-service-item"
        >
          <div class="min-w-0">
            <p class="font-urbanist text-sm text-glow-text">{{ servico.nome }}</p>
            <p class="mt-1 font-urbanist text-xs text-glow-text-subtle">
              {{ servico.duracaoMinutosEstimada }} minutos
            </p>
          </div>
          <span :class="AGENDAR_PRICE_PILL_CLASS">
            {{ formatPrecoRange(servico.precoMinimo, servico.precoMaximo) }}
          </span>
        </li>
      </ul>
    </section>

    <section class="agendar-review-card">
      <h2 class="agendar-review-card__title">Data e Horário</h2>
      <div class="agendar-review-fields-grid--2">
        <div class="agendar-review-field">
          <p class="agendar-review-field__label">Data</p>
          <p class="agendar-review-field__value">{{ dataLabel }}</p>
        </div>
        <div class="agendar-review-field">
          <p class="agendar-review-field__label">Horário</p>
          <p class="agendar-review-field__value">{{ horarioLabel }}</p>
        </div>
      </div>
    </section>

    <section class="agendar-review-card">
      <div class="agendar-review-fields-grid--2">
        <div class="agendar-review-field">
          <p class="agendar-review-card__title !mb-1">Tempo Total</p>
          <p class="agendar-review-field__value !mt-0">{{ duracaoTotal }} minutos</p>
        </div>
        <div class="agendar-review-field">
          <p class="agendar-review-card__title !mb-1">Valor Total</p>
          <p class="agendar-review-summary-value !mt-0">{{ valorTotalLabel }}</p>
        </div>
      </div>
    </section>

    <section v-if="showRegisterPassword" class="agendar-review-card space-y-4">
      <p class="font-urbanist text-sm text-glow-text-subtle">
        Defina uma senha para criar sua conta e vincular este agendamento.
      </p>
      <div>
        <label :class="GLOW_LABEL_CLASS" for="agendar-senha">Senha</label>
        <input
          id="agendar-senha"
          v-model="cadastroSenha"
          type="password"
          autocomplete="new-password"
          :class="[GLOW_INPUT_CLASS, 'mt-2']"
        />
      </div>
    </section>

    <section class="agendar-review-card">
      <label :class="GLOW_LABEL_CLASS" for="agendar-obs">Observação (opcional)</label>
      <textarea
        id="agendar-obs"
        v-model="observacao"
        rows="2"
        class="agendar-review-textarea"
      />
    </section>

    <button
      type="button"
      :class="AGENDAR_BTN_CONTINUE_CLASS"
      :disabled="submitting"
      @click="emit('confirm')"
    >
      {{ submitting ? 'Confirmando…' : 'Confirmar Agendamento' }}
    </button>
  </div>
</template>
