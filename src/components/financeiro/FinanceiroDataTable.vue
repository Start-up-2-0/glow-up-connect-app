<script setup lang="ts">
defineProps<{
  columns: { key: string; label: string; align?: 'left' | 'right' }[]
  emptyTitle?: string
  emptyDescription?: string
}>()
</script>

<template>
  <div>
    <div v-if="$slots.actions" class="financeiro-no-print mb-3 flex justify-end">
      <slot name="actions" />
    </div>

    <slot name="empty">
      <div v-if="!$slots.default" class="financeiro-empty">
        <p class="financeiro-empty__title">{{ emptyTitle ?? 'Nenhum registro' }}</p>
        <p v-if="emptyDescription" class="financeiro-empty__desc">{{ emptyDescription }}</p>
      </div>
    </slot>

    <div v-if="$slots.default" class="financeiro-table-wrap hidden md:block">
      <table class="financeiro-table">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="col.align === 'right' ? 'text-right' : 'text-left'"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <slot />
        </tbody>
      </table>
    </div>

    <div v-if="$slots.mobile" class="space-y-3 p-3 md:hidden">
      <slot name="mobile" />
    </div>
  </div>
</template>
