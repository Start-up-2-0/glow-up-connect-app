<script setup lang="ts">
import { computed } from 'vue'
import { PASSWORD_RULES } from '@/utils/passwordRules'

const props = defineProps<{
  password: string
}>()

const rules = computed(() =>
  PASSWORD_RULES.map((rule) => ({
    ...rule,
    met: props.password.length > 0 && rule.test(props.password),
  })),
)
</script>

<template>
  <div class="perfil-password-rules">
    <p class="perfil-password-rules__title">Sua senha deve conter:</p>
    <ul class="perfil-password-rules__list">
      <li
        v-for="rule in rules"
        :key="rule.id"
        class="perfil-password-rules__item"
        :class="{ 'perfil-password-rules__item--met': rule.met }"
      >
        <span class="perfil-password-rules__mark" aria-hidden="true">
          {{ rule.met ? '✔' : '○' }}
        </span>
        {{ rule.label.replace(/;$/, '') }}
      </li>
    </ul>
  </div>
</template>
