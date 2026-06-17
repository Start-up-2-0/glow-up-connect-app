<script setup lang="ts">
import { RouterLink } from 'vue-router'
import {
  CLIENTE_PAGE_DIVIDER_CLASS,
  CLIENTE_PAGE_SUBTITLE_CLASS,
  CLIENTE_PAGE_TITLE_CLASS,
} from '@/constants/designTokens'

defineProps<{
  title?: string
  subtitle?: string
  backTo?: string
  backLabel?: string
  showDivider?: boolean
}>()
</script>

<template>
  <div class="cliente-page-header-block">
    <header class="cliente-page-header-block__row">
      <RouterLink
        v-if="backTo"
        :to="backTo"
        class="cliente-page-header-block__back"
        :aria-label="backLabel ?? 'Voltar'"
      >
        <svg class="size-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M12 4L6 10L12 16"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </RouterLink>
      <div class="min-w-0">
        <h1 :class="CLIENTE_PAGE_TITLE_CLASS">
          {{ title ?? 'Explorar lojas' }}
        </h1>
        <p v-if="subtitle" :class="[CLIENTE_PAGE_SUBTITLE_CLASS, 'mt-3']">
          {{ subtitle }}
        </p>
      </div>
    </header>
    <div v-if="showDivider !== false" :class="CLIENTE_PAGE_DIVIDER_CLASS" />
  </div>
</template>
