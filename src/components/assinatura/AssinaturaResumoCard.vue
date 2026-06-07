<script setup lang="ts">
import BaseCard from '@/components/ui/BaseCard.vue'
import AssinaturaStatusBadge from './AssinaturaStatusBadge.vue'
import { formatDate } from '@/utils/formatters'
import type { Assinatura } from '@/types/assinatura.types'

defineProps<{
  planoNome: string | null
  assinatura: Assinatura | null
}>()
</script>

<template>
  <BaseCard title="Plano atual">
    <div v-if="assinatura" class="space-y-4">
      <div class="flex flex-wrap items-center gap-2">
        <p class="font-urbanist text-lg font-semibold text-glow-text">
          {{ planoNome ?? `Plano #${assinatura.planoId}` }}
        </p>
        <AssinaturaStatusBadge :status="assinatura.status" />
      </div>

      <dl class="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt class="text-glow-text-subtle">Dia de vencimento</dt>
          <dd class="font-medium text-glow-text">Todo dia {{ assinatura.diaVencimento }}</dd>
        </div>
        <div>
          <dt class="text-glow-text-subtle">Próximo vencimento</dt>
          <dd class="font-medium text-glow-text">
            {{ formatDate(assinatura.proximaDataVencimento) }}
          </dd>
        </div>
        <div>
          <dt class="text-glow-text-subtle">Geração da cobrança</dt>
          <dd class="font-medium text-glow-text">
            {{ formatDate(assinatura.proximaDataGeracaoCobranca) }}
          </dd>
        </div>
        <div>
          <dt class="text-glow-text-subtle">Alerta por e-mail</dt>
          <dd class="font-medium text-glow-text">
            {{ formatDate(assinatura.proximaDataAlerta) }}
          </dd>
        </div>
      </dl>
    </div>
    <p v-else class="text-sm text-glow-text-subtle">Nenhuma assinatura ativa.</p>
  </BaseCard>
</template>
