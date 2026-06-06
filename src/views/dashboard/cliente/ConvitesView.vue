<script setup lang="ts">
import BaseCard from '@/components/ui/BaseCard.vue'
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div>
      <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
        Convites
      </h1>
      <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
        Convites para equipes chegam por e-mail com um link exclusivo.
      </p>
    </div>

    <BaseCard title="Como funciona">
      <ol class="list-decimal space-y-2 pl-5 font-urbanist text-sm text-glow-text-subtle">
        <li>Um estabelecimento envia convite para o seu e-mail cadastrado.</li>
        <li>Abra o link no e-mail (formato <code class="text-glow-text">/convites/...</code>).</li>
        <li>Faça login se necessário e aceite ou rejeite o convite.</li>
        <li>Ao aceitar, você pode passar a ter acesso operacional ao negócio.</li>
      </ol>
      <p class="mt-4 font-urbanist text-sm text-glow-text-subtle">
        Não há listagem de convites pendentes no app — use sempre o link recebido por e-mail.
      </p>
    </BaseCard>
  </div>
</template>
