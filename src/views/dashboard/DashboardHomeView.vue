<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import TrialStatusBanner from '@/components/assinatura/TrialStatusBanner.vue'
import { useUserStore } from '@/stores/user.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useAssinaturaStore } from '@/stores/assinatura.store'
import { getUserRoleLabel } from '@/utils/userRoleLabel'
import { labelModulos } from '@/utils/moduloLabels'
import { useFetchOnce } from '@/composables/useFetchOnce'
import { LANDING_PLANOS_URL, ROUTE_PATHS } from '@/constants/routes'

const userStore = useUserStore()
const negocioStore = useNegocioStore()
const assinaturaStore = useAssinaturaStore()
const { profile } = storeToRefs(userStore)
const {
  estabelecimentos,
  estabelecimentoAtivo,
  assinaturaAtiva,
  planoNome,
  modulos,
  loading,
  emTrial,
  diasTrial,
  proximaDataVencimento,
  prioridadeMarketplace,
} = storeToRefs(negocioStore)
const { assinatura } = storeToRefs(assinaturaStore)

const { execute: loadNegocio, loading: negocioLoading } = useFetchOnce('negocio-estabelecimentos')

const modulosAmigaveis = computed(() => labelModulos(modulos.value))

onMounted(async () => {
  if (!profile.value) {
    await userStore.fetchMe()
  }
  await loadNegocio(() => negocioStore.fetchEstabelecimentos())
  const ativo = negocioStore.estabelecimentoAtivo
  if (ativo?.assinaturaId) {
    try {
      await assinaturaStore.fetchAtual(ativo.estabelecimentoId)
    } catch {
      // Banner de trial usa dados do contexto de negócio como fallback.
    }
  }
})
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
      Olá, {{ profile?.nome ?? 'Usuário' }}!
    </h1>

    <TrialStatusBanner
      v-if="
        (assinatura?.emTrial || emTrial) &&
        (assinatura?.proximaDataVencimento || proximaDataVencimento)
      "
      :dias-trial="assinatura?.diasTrial ?? diasTrial ?? 30"
      :proxima-data-vencimento="
        assinatura?.proximaDataVencimento ?? proximaDataVencimento ?? ''
      "
    />

    <BaseCard
      v-if="!assinaturaAtiva && estabelecimentos.length === 0"
      title="Comece agora"
    >
      <p class="mb-4 text-sm text-glow-text-subtle">
        Contrate um plano para liberar agenda, serviços e demais módulos operacionais.
      </p>
      <a :href="LANDING_PLANOS_URL">
        <BaseButton variant="primary">Ver planos</BaseButton>
      </a>
    </BaseCard>

    <BaseCard
      v-else-if="estabelecimentoAtivo && !assinaturaAtiva"
      title="Assinatura pendente"
    >
      <p class="mb-4 text-sm text-glow-text-subtle">
        Conclua o pagamento para liberar os módulos do seu plano.
      </p>
      <RouterLink :to="ROUTE_PATHS.CONFIG_ASSINATURA">
        <BaseButton variant="primary">Gerenciar assinatura</BaseButton>
      </RouterLink>
    </BaseCard>

    <div
      v-if="estabelecimentoAtivo && assinaturaAtiva"
      class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <BaseCard title="Agendamentos hoje">
        <p class="font-satoshi text-2xl font-bold text-glow-text">—</p>
        <p class="mt-1 font-urbanist text-xs text-glow-text-subtle">Em breve</p>
        <RouterLink :to="ROUTE_PATHS.AGENDA" class="mt-3 inline-block">
          <BaseButton variant="secondary" size="sm">Ver agenda</BaseButton>
        </RouterLink>
      </BaseCard>
      <BaseCard title="Receita do mês">
        <p class="font-satoshi text-2xl font-bold text-glow-text">—</p>
        <p class="mt-1 font-urbanist text-xs text-glow-text-subtle">Em breve</p>
      </BaseCard>
      <BaseCard title="Clientes ativos">
        <p class="font-satoshi text-2xl font-bold text-glow-text">—</p>
        <p class="mt-1 font-urbanist text-xs text-glow-text-subtle">Em breve</p>
      </BaseCard>
      <BaseCard title="Serviços ativos">
        <p class="font-satoshi text-2xl font-bold text-glow-text">—</p>
        <p class="mt-1 font-urbanist text-xs text-glow-text-subtle">Em breve</p>
      </BaseCard>
    </div>

    <BaseCard title="Perfil">
      <dl class="space-y-3 font-urbanist text-sm">
        <div class="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
          <dt class="shrink-0 font-medium text-glow-text-subtle sm:w-24">E-mail</dt>
          <dd class="break-all text-glow-text">{{ profile?.email ?? '—' }}</dd>
        </div>
        <div class="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
          <dt class="shrink-0 font-medium text-glow-text-subtle sm:w-24">Perfil</dt>
          <dd class="text-glow-text">{{ getUserRoleLabel(profile?.role) }}</dd>
        </div>
        <div class="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
          <dt class="shrink-0 font-medium text-glow-text-subtle sm:w-24">Status</dt>
          <dd class="text-glow-text">{{ profile?.ativo ? 'Ativo' : 'Inativo' }}</dd>
        </div>
      </dl>
    </BaseCard>

    <BaseCard title="Negócio">
      <LoadingSpinner v-if="loading || negocioLoading" />
      <EmptyState
        v-else-if="estabelecimentos.length === 0"
        title="Nenhum estabelecimento"
        description="Contrate um plano para criar seu primeiro negócio."
      />
      <div v-else-if="estabelecimentoAtivo" class="space-y-3 font-urbanist text-sm">
        <p class="font-medium text-glow-text">{{ estabelecimentoAtivo.nome }}</p>
        <p class="text-glow-text-subtle">
          {{ estabelecimentoAtivo.role }} · {{ planoNome ?? 'Sem plano' }}
        </p>
        <p class="text-glow-text-subtle">
          {{ assinaturaAtiva ? 'Assinatura ativa' : 'Assinatura inativa' }}
        </p>
        <p
          v-if="prioridadeMarketplace"
          class="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
        >
          Destaque no marketplace
        </p>
        <div v-if="modulosAmigaveis.length > 0">
          <p class="mb-2 text-xs font-medium uppercase tracking-wide text-glow-text-subtle">
            Módulos do plano
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="mod in modulosAmigaveis"
              :key="mod"
              class="inline-flex rounded-full bg-glow-canvas px-2.5 py-0.5 text-xs font-medium text-glow-text"
            >
              {{ mod }}
            </span>
          </div>
        </div>
        <p v-else class="text-xs text-glow-text-subtle">Nenhum módulo ativo.</p>
      </div>
    </BaseCard>
  </div>
</template>
