<script setup lang="ts">
import { onMounted } from 'vue'
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
import { useFetchOnce } from '@/composables/useFetchOnce'
import { ROUTE_PATHS } from '@/constants/routes'

const userStore = useUserStore()
const negocioStore = useNegocioStore()
const assinaturaStore = useAssinaturaStore()
const { profile } = storeToRefs(userStore)
const { estabelecimentos, estabelecimentoAtivo, assinaturaAtiva, planoNome, loading } =
  storeToRefs(negocioStore)
const { assinatura } = storeToRefs(assinaturaStore)

const { execute: loadNegocio, loading: negocioLoading } = useFetchOnce('negocio-estabelecimentos')

onMounted(async () => {
  if (!profile.value) {
    await userStore.fetchMe()
  }
  await loadNegocio(() => negocioStore.fetchEstabelecimentos())
})
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
      Olá, {{ profile?.nome ?? 'Usuário' }}!
    </h1>

    <TrialStatusBanner
      v-if="assinatura?.emTrial && assinatura.proximaDataVencimento"
      :dias-trial="assinatura.diasTrial"
      :proxima-data-vencimento="assinatura.proximaDataVencimento"
    />

    <BaseCard
      v-if="!assinaturaAtiva && estabelecimentos.length === 0"
      title="Comece agora"
    >
      <p class="mb-4 text-sm text-glow-text-subtle">
        Contrate um plano para liberar agenda, serviços e demais módulos operacionais.
      </p>
      <RouterLink :to="ROUTE_PATHS.ONBOARDING_PLANOS">
        <BaseButton variant="primary">Ver planos</BaseButton>
      </RouterLink>
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
      <div v-else-if="estabelecimentoAtivo" class="space-y-2 font-urbanist text-sm">
        <p class="font-medium text-glow-text">{{ estabelecimentoAtivo.nome }}</p>
        <p class="text-glow-text-subtle">
          {{ estabelecimentoAtivo.role }} · {{ planoNome ?? 'Sem plano' }}
        </p>
        <p class="text-glow-text-subtle">
          {{ assinaturaAtiva ? 'Assinatura ativa' : 'Assinatura inativa' }}
        </p>
        <p class="text-xs text-glow-text-subtle">
          Módulos: {{ estabelecimentoAtivo.modulos.join(', ') || '—' }}
        </p>
      </div>
    </BaseCard>
  </div>
</template>
