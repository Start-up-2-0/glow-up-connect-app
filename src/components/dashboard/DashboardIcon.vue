<script setup lang="ts">
defineProps<{
  name:
    | 'calendar'
    | 'money'
    | 'users'
    | 'star'
    | 'store'
    | 'user'
    | 'chart'
    | 'clock'
    | 'scissors'
    | 'heart'
    | 'arrow-right'
}>()
</script>

<template>
  <svg
    class="dashboard-icon"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    aria-hidden="true"
  >
    <template v-if="name === 'calendar'">
      <rect x="3" y="4" width="18" height="17" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </template>
    <template v-else-if="name === 'money'">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </template>
    <template v-else-if="name === 'users'">
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.5 2.5-5.5 6-5.5s6 2 6 5.5" />
      <path d="M16 8.5a2.5 2.5 0 0 1 0 5M21 20c0-2.5-1.5-4-4.5-4.5" />
    </template>
    <template v-else-if="name === 'star'">
      <path d="M12 3.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 16.8l-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z" />
    </template>
    <template v-else-if="name === 'store'">
      <path d="M4 10h16l-1.5-5H5.5L4 10z" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 14h4" />
    </template>
    <template v-else-if="name === 'user'">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-4 3-6 7-6s7 2 7 6" />
    </template>
    <template v-else-if="name === 'chart'">
      <path d="M4 19V5M4 19h16" />
      <path d="M8 15l3-4 3 2 5-7" />
    </template>
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </template>
    <template v-else-if="name === 'scissors'">
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="7" cy="17" r="2.5" />
      <path d="M9 8.5l8 3M9 15.5l8-3" />
    </template>
    <template v-else-if="name === 'heart'">
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z" />
    </template>
    <template v-else-if="name === 'arrow-right'">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </template>
  </svg>
</template>
