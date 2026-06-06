<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/ui/BaseCard.vue'
import { ROUTE_PATHS } from '@/constants/routes'
import { useUserStore } from '@/stores/user.store'

const userStore = useUserStore()
const { profile } = storeToRefs(userStore)

const quickLinks = [
  {
    title: 'Explorar lojas',
    description: 'Descubra estabelecimentos perto de você e agende serviços.',
    to: ROUTE_PATHS.EXPLORAR,
  },
  {
    title: 'Meus agendamentos',
    description: 'Acompanhe, cancele ou remarque seus horários.',
    to: ROUTE_PATHS.MEUS_AGENDAMENTOS,
  },
  {
    title: 'Meu perfil',
    description: 'Atualize seus dados e configure alertas no WhatsApp.',
    to: ROUTE_PATHS.PERFIL,
  },
]

onMounted(async () => {
  if (!profile.value) {
    await userStore.fetchMe()
  }
})
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div>
      <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
        Olá, {{ profile?.nome ?? 'Cliente' }}!
      </h1>
      <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
        Agende serviços, acompanhe seus horários e gerencie seu perfil.
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <RouterLink
        v-for="link in quickLinks"
        :key="link.to"
        :to="link.to"
        class="group block rounded-lg border border-glow-border-soft bg-glow-surface p-4 transition-colors hover:border-glow-gold-dark hover:bg-glow-hover-surface"
      >
        <h2 class="font-urbanist text-base font-semibold text-glow-text group-hover:text-glow-text-hover">
          {{ link.title }}
        </h2>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          {{ link.description }}
        </p>
      </RouterLink>
    </div>

    <BaseCard title="Resumo da conta">
      <dl class="space-y-3 font-urbanist text-sm">
        <div class="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
          <dt class="shrink-0 font-medium text-glow-text-subtle sm:w-28">E-mail</dt>
          <dd class="break-all text-glow-text">{{ profile?.email ?? '—' }}</dd>
        </div>
        <div class="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
          <dt class="shrink-0 font-medium text-glow-text-subtle sm:w-28">Telefone</dt>
          <dd class="text-glow-text">{{ profile?.telefone ?? 'Não informado' }}</dd>
        </div>
        <div class="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
          <dt class="shrink-0 font-medium text-glow-text-subtle sm:w-28">Status</dt>
          <dd class="text-glow-text">{{ profile?.ativo ? 'Ativo' : 'Inativo' }}</dd>
        </div>
      </dl>
    </BaseCard>
  </div>
</template>
