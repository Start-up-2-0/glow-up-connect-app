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
  <div>
    <h1>Olá, {{ profile?.nome ?? 'Usuário' }}!</h1>

    <BaseCard title="Perfil">
      <dl>
        <div>
          <dt>E-mail</dt>
          <dd>{{ profile?.email ?? '—' }}</dd>
        </div>
        <div>
          <dt>Perfil</dt>
          <dd>{{ profile?.role ?? '—' }}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{{ profile?.ativo ? 'Ativo' : 'Inativo' }}</dd>
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
