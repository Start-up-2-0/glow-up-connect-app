<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import { useUserStore } from '@/stores/user.store'
import { useFetchOnce } from '@/composables/useFetchOnce'

const userStore = useUserStore()
const { profile, estabelecimentos, estabelecimentosLoading } = storeToRefs(userStore)

const { execute: loadEstabelecimentos, loading } = useFetchOnce('user-estabelecimentos')

onMounted(async () => {
  if (!profile.value) {
    await userStore.fetchMe()
  }
  await loadEstabelecimentos(() => userStore.fetchEstabelecimentos())
})
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
      Olá, {{ profile?.nome ?? 'Usuário' }}!
    </h1>

    <BaseCard title="Perfil">
      <dl class="space-y-3 font-urbanist text-sm">
        <div class="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
          <dt class="shrink-0 font-medium text-glow-text-subtle sm:w-24">E-mail</dt>
          <dd class="break-all text-glow-text">{{ profile?.email ?? '—' }}</dd>
        </div>
        <div class="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
          <dt class="shrink-0 font-medium text-glow-text-subtle sm:w-24">Perfil</dt>
          <dd class="text-glow-text">{{ profile?.role ?? '—' }}</dd>
        </div>
        <div class="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
          <dt class="shrink-0 font-medium text-glow-text-subtle sm:w-24">Status</dt>
          <dd class="text-glow-text">{{ profile?.ativo ? 'Ativo' : 'Inativo' }}</dd>
        </div>
      </dl>
    </BaseCard>

    <BaseCard title="Estabelecimentos">
      <LoadingSpinner v-if="loading || estabelecimentosLoading" />
      <EmptyState
        v-else-if="estabelecimentos.length === 0"
        title="Nenhum estabelecimento"
        description="Quando você tiver acesso a estabelecimentos, eles aparecerão aqui."
      />
      <ul v-else>
        <li v-for="est in estabelecimentos" :key="est.estabelecimentoId">
          <p>{{ est.nome }}</p>
          <p>{{ est.role }} · {{ est.planoNome ?? 'Sem plano' }}</p>
          <span>{{ est.assinaturaAtiva ? 'Ativo' : 'Inativo' }}</span>
        </li>
      </ul>
    </BaseCard>
  </div>
</template>
