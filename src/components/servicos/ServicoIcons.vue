<script setup lang="ts">
defineProps<{
  name:
    | 'plus'
    | 'edit'
    | 'profissionais'
    | 'desativar'
    | 'ativar'
    | 'clock'
    | 'coin'
    | 'close'
    | 'delete'
    | 'empty'
}>()
</script>

<template>
  <svg
    v-if="name === 'plus'"
    class="size-5"
    viewBox="0 0 20 20"
    fill="none"
    aria-hidden="true"
  >
    <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
  </svg>

  <svg
    v-else-if="name === 'edit'"
    class="size-4"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M11.333 2.00004C11.5081 1.82494 11.716 1.686 11.9452 1.59129C12.1744 1.49659 12.4199 1.44775 12.6677 1.44775C12.9155 1.44775 13.161 1.49659 13.3902 1.59129C13.6194 1.686 13.8273 1.82494 14.0023 2.00004C14.1774 2.17513 14.3164 2.383 14.4111 2.61221C14.5058 2.84142 14.5546 3.0869 14.5546 3.33471C14.5546 3.58252 14.5058 3.828 14.4111 4.05721C14.3164 4.28642 14.1774 4.49429 14.0023 4.66938L5.00233 13.6694L1.33398 14.6667L2.33131 11.0027L11.333 2.00004Z"
      stroke="currentColor"
      stroke-width="1.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else-if="name === 'profissionais'"
    class="size-4"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M8 8C9.65685 8 11 6.65685 11 5C11 3.34315 9.65685 2 8 2C6.34315 2 5 3.34315 5 5C5 6.65685 6.34315 8 8 8Z"
      stroke="currentColor"
      stroke-width="1.2"
    />
    <path
      d="M2 14C2 11.2386 4.23858 9 7 9H9C11.7614 9 14 11.2386 14 14"
      stroke="currentColor"
      stroke-width="1.2"
      stroke-linecap="round"
    />
  </svg>

  <svg
    v-else-if="name === 'desativar'"
    class="size-4"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2" />
    <path d="M4.5 4.5L11.5 11.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
  </svg>

  <svg
    v-else-if="name === 'ativar'"
    class="size-4"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M3 8.5L6.5 12L13 4"
      stroke="currentColor"
      stroke-width="1.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else-if="name === 'clock'"
    class="servico-card__meta-icon"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2" />
    <path d="M8 5V8L10 10" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
  </svg>

  <svg
    v-else-if="name === 'coin'"
    class="servico-card__meta-icon"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.2" />
    <path
      d="M8 5.5C6.61929 5.5 5.5 6.39543 5.5 7.5C5.5 8.60457 6.61929 9.5 8 9.5C9.38071 9.5 10.5 10.3954 10.5 11.5C10.5 12.6046 9.38071 13.5 8 13.5"
      stroke="currentColor"
      stroke-width="1.2"
      stroke-linecap="round"
    />
    <path d="M8 4.5V5.5M8 13.5V14.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
  </svg>

  <svg
    v-else-if="name === 'close'"
    class="size-4"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
  </svg>

  <svg
    v-else-if="name === 'delete'"
    class="size-4"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M2 4H14M5.333 4V2.667A1.333 1.333 0 0 1 6.667 1.333H9.333A1.333 1.333 0 0 1 10.667 2.667V4M12.667 4V13.333A1.333 1.333 0 0 1 11.333 14.667H4.667A1.333 1.333 0 0 1 3.333 13.333V4"
      stroke="currentColor"
      stroke-width="1.2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>

  <svg
    v-else
    class="size-16"
    viewBox="0 0 64 64"
    fill="none"
    aria-hidden="true"
  >
    <rect x="8" y="12" width="48" height="40" rx="6" stroke="currentColor" stroke-width="2" />
    <path d="M20 24H44M20 32H36" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
  </svg>
</template>
