<script setup lang="ts">
import { computed } from 'vue'
import { PASSWORD_RULES } from '@/utils/passwordRules'

const props = defineProps<{
  password: string
}>()

const rules = computed(() =>
  PASSWORD_RULES.map((rule) => ({
    ...rule,
    met: rule.test(props.password),
  })),
)
</script>

<template>
  <div class="password-rules">
    <p class="password-rules__title">Sua senha deve conter:</p>
    <ul class="password-rules__list">
      <li
        v-for="rule in rules"
        :key="rule.id"
        class="password-rules__item"
        :class="{ 'password-rules__item--met': rule.met }"
      >
        {{ rule.label }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.password-rules__title {
  margin-bottom: 4px;
  font-family: Inter, system-ui, sans-serif;
  font-size: 12px;
  font-weight: 700;
  line-height: normal;
  color: rgba(40, 40, 40, 0.4);
}

.password-rules__list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.password-rules__item {
  font-family: Inter, system-ui, sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 15px;
  color: #e4ac04;
  transition: color 0.2s ease;
}

.password-rules__item--met {
  color: rgba(40, 40, 40, 0.4);
}
</style>
