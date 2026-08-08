<script setup lang="ts">
import BaseButton from '@/components/ui/BaseButton.vue'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import type { LojaSetupStepId } from '@/types/lojaSetup.types'
import type { EstabelecimentoPerfilCompleto } from '@/types/estabelecimento.types'
import { ONBOARDING_CONTRATAR_CARD_CLASS } from '@/constants/designTokens'

defineProps<{
  perfil: EstabelecimentoPerfilCompleto | null
  nomeFallback?: string
  contagens: { equipe: number; servicos: number; horariosAtivos: number }
  skipped: { equipe: boolean; servicos: boolean; horarios: boolean }
  esconderEquipe?: boolean
}>()

const emit = defineEmits<{
  edit: [step: LojaSetupStepId]
  finish: []
}>()
</script>

<template>
  <div class="space-y-4">
    <div :class="ONBOARDING_CONTRATAR_CARD_CLASS">
      <h2 class="font-urbanist text-lg font-semibold text-glow-text">Revisão</h2>
      <p class="mt-1 text-sm text-glow-text-subtle">
        Confira o resumo antes de entrar no painel. Você pode voltar e editar qualquer etapa.
      </p>

      <section class="mt-5 border-t border-glow-border-soft pt-4">
        <div class="flex items-start justify-between gap-3">
          <h3 class="font-urbanist text-sm font-semibold uppercase tracking-wide text-glow-text-soft">
            Loja
          </h3>
          <button
            type="button"
            class="text-sm font-medium text-glow-gold-cta"
            @click="emit('edit', 'loja')"
          >
            Editar
          </button>
        </div>
        <div class="mt-3 flex items-center gap-3">
          <UserAvatar
            :src="perfil?.logo || null"
            :name="perfil?.nome ?? nomeFallback"
            size="sm"
          />
          <div class="min-w-0">
            <p class="truncate font-medium text-glow-text">
              {{ perfil?.nome ?? nomeFallback ?? '—' }}
            </p>
            <p class="text-sm text-glow-text-subtle">
              {{ perfil?.telefone || '—' }} · {{ perfil?.email || '—' }}
            </p>
            <p v-if="perfil?.endereco" class="text-sm text-glow-text-subtle">
              {{ perfil.endereco.logradouro }}, {{ perfil.endereco.numero }}
              — {{ perfil.endereco.bairro }}, {{ perfil.endereco.cidade }}/{{ perfil.endereco.estado }}
            </p>
          </div>
        </div>
      </section>

      <section v-if="!esconderEquipe" class="mt-5 border-t border-glow-border-soft pt-4">
        <div class="flex items-start justify-between gap-3">
          <h3 class="font-urbanist text-sm font-semibold uppercase tracking-wide text-glow-text-soft">
            Equipe
          </h3>
          <button
            type="button"
            class="text-sm font-medium text-glow-gold-cta"
            @click="emit('edit', 'equipe')"
          >
            Editar
          </button>
        </div>
        <p class="mt-2 text-sm text-glow-text">
          <template v-if="skipped.equipe">Etapa pulada — configurar depois.</template>
          <template v-else>
            {{ contagens.equipe }}
            {{ contagens.equipe === 1 ? 'profissional cadastrado' : 'profissionais cadastrados' }}.
          </template>
        </p>
      </section>

      <section class="mt-5 border-t border-glow-border-soft pt-4">
        <div class="flex items-start justify-between gap-3">
          <h3 class="font-urbanist text-sm font-semibold uppercase tracking-wide text-glow-text-soft">
            Serviços
          </h3>
          <button
            type="button"
            class="text-sm font-medium text-glow-gold-cta"
            @click="emit('edit', 'servicos')"
          >
            Editar
          </button>
        </div>
        <p class="mt-2 text-sm text-glow-text">
          <template v-if="skipped.servicos">Etapa pulada — configurar depois.</template>
          <template v-else>
            {{ contagens.servicos }}
            {{ contagens.servicos === 1 ? 'serviço cadastrado' : 'serviços cadastrados' }}.
          </template>
        </p>
      </section>

      <section class="mt-5 border-t border-glow-border-soft pt-4">
        <div class="flex items-start justify-between gap-3">
          <h3 class="font-urbanist text-sm font-semibold uppercase tracking-wide text-glow-text-soft">
            Horários
          </h3>
          <button
            type="button"
            class="text-sm font-medium text-glow-gold-cta"
            @click="emit('edit', 'horarios')"
          >
            Editar
          </button>
        </div>
        <p class="mt-2 text-sm text-glow-text">
          <template v-if="skipped.horarios">Etapa pulada — configurar depois.</template>
          <template v-else>
            {{ contagens.horariosAtivos }}
            {{ contagens.horariosAtivos === 1 ? 'dia ativo' : 'dias ativos' }} de funcionamento.
          </template>
        </p>
      </section>
    </div>

    <div class="flex justify-end">
      <BaseButton variant="primary" @click="emit('finish')">
        Concluir e ir ao dashboard
      </BaseButton>
    </div>
  </div>
</template>
