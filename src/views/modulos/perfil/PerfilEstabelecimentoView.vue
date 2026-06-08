<script setup lang="ts">
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { labelModulos } from '@/utils/moduloLabels'

const { estabelecimentoAtivo, ready, error: contextError, loading } = useEstabelecimentoView()
const { planoNome, assinaturaAtiva, role } = useNegocioContext()
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div>
      <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
        Perfil do estabelecimento
      </h1>
      <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
        Informações do negócio selecionado.
      </p>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>
    <LoadingSpinner v-if="loading && !ready" />

    <BaseCard v-else-if="estabelecimentoAtivo" title="Dados do negócio">
      <div class="flex gap-4">
        <div
          v-if="estabelecimentoAtivo.logo"
          class="size-16 shrink-0 overflow-hidden rounded-lg bg-glow-canvas"
        >
          <img
            :src="estabelecimentoAtivo.logo"
            :alt="estabelecimentoAtivo.nome"
            class="size-full object-cover"
          />
        </div>
        <dl class="space-y-3 font-urbanist text-sm">
          <div>
            <dt class="font-medium text-glow-text-subtle">Nome</dt>
            <dd class="text-glow-text">{{ estabelecimentoAtivo.nome }}</dd>
          </div>
          <div>
            <dt class="font-medium text-glow-text-subtle">Seu papel</dt>
            <dd class="text-glow-text">{{ role ?? estabelecimentoAtivo.role }}</dd>
          </div>
          <div>
            <dt class="font-medium text-glow-text-subtle">Plano</dt>
            <dd class="text-glow-text">{{ planoNome ?? '—' }}</dd>
          </div>
          <div>
            <dt class="font-medium text-glow-text-subtle">Assinatura</dt>
            <dd class="text-glow-text">{{ assinaturaAtiva ? 'Ativa' : 'Inativa' }}</dd>
          </div>
          <div>
            <dt class="font-medium text-glow-text-subtle">Módulos</dt>
            <dd class="text-glow-text">
              {{ labelModulos(estabelecimentoAtivo.modulos).join(', ') || '—' }}
            </dd>
          </div>
        </dl>
      </div>
    </BaseCard>
  </div>
</template>
