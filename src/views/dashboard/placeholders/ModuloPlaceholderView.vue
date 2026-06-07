<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'

const route = useRoute()
const titulo = computed(() => (route.meta.title as string) ?? 'Módulo')
</script>

<template>
  <BaseCard class="text-center">
    <h1 class="mb-2 font-satoshi text-xl font-bold text-glow-text">{{ titulo }}</h1>
    <p class="text-sm text-glow-text-subtle">
      Este módulo será implementado em breve. O acesso já está liberado pelo seu plano.
    </p>
  </BaseCard>
</template>
