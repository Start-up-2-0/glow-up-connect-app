<script setup lang="ts">
defineProps<{
  name:
    | 'saldo'
    | 'entrada'
    | 'saida'
    | 'lucro'
    | 'contas'
    | 'comissao'
    | 'grafico'
    | 'export'
    | 'relatorio'
    | 'venda'
    | 'despesa'
}>()
</script>

<template>
  <svg
    class="financeiro-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    aria-hidden="true"
  >
    <template v-if="name === 'saldo'">
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 15h4" />
    </template>
    <template v-else-if="name === 'entrada'">
      <path d="M12 19V5" />
      <path d="M5 12l7-7 7 7" />
    </template>
    <template v-else-if="name === 'saida'">
      <path d="M12 5v14" />
      <path d="M19 12l-7 7-7-7" />
    </template>
    <template v-else-if="name === 'lucro'">
      <path d="M4 18l4-5 4 3 5-7 3 4" />
      <path d="M4 20h16" />
    </template>
    <template v-else-if="name === 'contas'">
      <path d="M7 4h10v16H7z" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </template>
    <template v-else-if="name === 'comissao'">
      <circle cx="9" cy="8" r="3" />
      <circle cx="16" cy="11" r="2.5" />
      <path d="M4 20c0-3 2.5-5 5-5s5 2 5 5" />
    </template>
    <template v-else-if="name === 'grafico'">
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 15l3-4 3 2 4-6" />
    </template>
    <template v-else-if="name === 'export'">
      <path d="M12 3v10" />
      <path d="M8 9l4 4 4-4" />
      <path d="M5 21h14" />
    </template>
    <template v-else-if="name === 'relatorio'">
      <path d="M6 4h9l3 3v13H6z" />
      <path d="M15 4v3h3M9 12h6M9 16h6" />
    </template>
    <template v-else-if="name === 'venda'">
      <path d="M6 6h15l-1.5 9H7.5L6 6z" />
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
    </template>
    <template v-else-if="name === 'despesa'">
      <path d="M12 3v18" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </template>
  </svg>
</template>
