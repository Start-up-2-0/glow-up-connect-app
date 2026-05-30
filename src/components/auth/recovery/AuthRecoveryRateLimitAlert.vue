<script setup lang="ts">
defineEmits<{ requestNew: [] }>()
</script>

<template>
  <div class="rate-limit-alert" role="alert">
    <svg class="rate-limit-alert__icon" viewBox="0 0 12 11" fill="none" aria-hidden="true">
      <path
        d="M6 0.5L11.1962 9.5H0.803848L6 0.5Z"
        fill="#CF3F3F"
        stroke="#CF3F3F"
        stroke-linejoin="round"
      />
      <path d="M6 4V6.5" stroke="white" stroke-linecap="round" />
      <circle cx="6" cy="8.25" r="0.5" fill="white" />
    </svg>
    <p class="rate-limit-alert__text">
      Você solicitou o código muitas vezes.
      <button type="button" class="rate-limit-alert__link" @click="$emit('requestNew')">
        Clique aqui
      </button>
      para solicitar novo código
    </p>
  </div>
</template>

<style scoped>
.rate-limit-alert {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 10px;
  border-radius: 4px;
  background-color: rgba(207, 63, 63, 0.1);
  padding: 10px;
}

.rate-limit-alert__icon {
  width: 12px;
  height: 10px;
  flex-shrink: 0;
}

.rate-limit-alert__text {
  margin: 0;
  font-family: Inter, system-ui, sans-serif;
  font-size: 10px;
  font-weight: 400;
  line-height: normal;
  color: #cf3f3f;
}

.rate-limit-alert__link {
  font-family: Inter, system-ui, sans-serif;
  font-size: 10px;
  font-weight: 700;
  color: #cf3f3f;
  text-decoration: underline;
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}
</style>
