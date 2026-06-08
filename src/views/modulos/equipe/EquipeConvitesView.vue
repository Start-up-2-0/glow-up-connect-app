<script setup lang="ts">
import { RouterLink } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { ROUTE_PATHS } from '@/constants/routes'
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
          Convites da equipe
        </h1>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          Profissionais recebem convites por e-mail com link exclusivo para aceitar.
        </p>
      </div>
      <RouterLink :to="ROUTE_PATHS.CONFIG_EQUIPE">
        <BaseButton variant="secondary" size="sm">Voltar à equipe</BaseButton>
      </RouterLink>
    </div>

    <BaseCard title="Como funciona">
      <ol class="list-decimal space-y-2 pl-5 font-urbanist text-sm text-glow-text-subtle">
        <li>Convide um profissional informando o e-mail dele.</li>
        <li>O convidado recebe um e-mail com link no formato <code class="text-glow-text">/convites/...</code>.</li>
        <li>Ao aceitar, o profissional passa a integrar a equipe do estabelecimento.</li>
      </ol>
      <p class="mt-3 font-urbanist text-sm text-glow-text-subtle">
        Se o profissional já possui conta na plataforma, ele também pode ser vinculado diretamente
        pela equipe após aceitar o convite.
      </p>
      <div class="mt-4 flex flex-wrap gap-3">
        <RouterLink :to="ROUTE_PATHS.CONFIG_EQUIPE_NOVO">
          <BaseButton variant="primary">Convidar profissional</BaseButton>
        </RouterLink>
        <RouterLink :to="ROUTE_PATHS.CONVITES">
          <BaseButton variant="secondary">Página de resposta ao convite</BaseButton>
        </RouterLink>
      </div>
    </BaseCard>
  </div>
</template>
