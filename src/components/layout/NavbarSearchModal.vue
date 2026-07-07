<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import IconSearch from './icons/IconSearch.vue'

const open = defineModel<boolean>({ default: false })

const props = withDefaults(
  defineProps<{
    placeholder?: string
  }>(),
  { placeholder: 'Pesquisar...' },
)

const query = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const emit = defineEmits<{ search: [query: string] }>()

watch(query, (value) => {
  emit('search', value)
})

watch(open, async (isOpen) => {
  if (!isOpen) {
    query.value = ''
    return
  }
  await nextTick()
  inputRef.value?.focus()
})

function close() {
  open.value = false
}

function onOverlayClick(event: MouseEvent) {
  if (event.target === event.currentTarget) close()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') close()
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:items-center sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-label="Pesquisar"
        @click="onOverlayClick"
        @keydown="onKeydown"
      >
        <Transition
          enter-active-class="transition-all duration-200"
          leave-active-class="transition-all duration-200"
          enter-from-class="opacity-0 -translate-y-2 sm:scale-95"
          leave-to-class="opacity-0 -translate-y-2 sm:scale-95"
        >
          <div
            v-if="open"
            class="w-full max-w-lg overflow-hidden rounded-xl border border-glow-border-soft bg-glow-surface shadow-xl"
            @click.stop
          >
            <div class="flex items-center gap-3 border-b border-glow-border-soft px-4 py-3">
              <IconSearch class="shrink-0 text-glow-text" :size="20" />
              <input
                ref="inputRef"
                v-model="query"
                type="search"
                :placeholder="props.placeholder"
                class="min-w-0 flex-1 border-0 bg-transparent font-urbanist text-sm text-glow-text placeholder:text-glow-placeholder focus:outline-none focus:ring-0"
              />
              <button
                type="button"
                class="shrink-0 rounded px-2 py-1 font-urbanist text-xs font-medium text-glow-text-subtle transition-colors hover:bg-black/[0.03] hover:text-glow-text"
                @click="close"
              >
                Esc
              </button>
            </div>

            <div class="max-h-80 overflow-y-auto px-4 py-4">
              <slot>
                <p class="text-center font-urbanist text-sm text-glow-text-subtle">
                  Digite para buscar nas páginas disponíveis no seu menu.
                </p>
              </slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
