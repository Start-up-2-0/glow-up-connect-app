<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import ContentAlert from '@/components/feedback/ContentAlert.vue'
import EquipeAdicionarModal from '@/components/equipe/EquipeAdicionarModal.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { ROUTE_PATHS } from '@/constants/routes'
import type { ModoCadastro } from '@/composables/useEquipeAdicionarForm'
import type { EstablishmentUserRole } from '@/types/negocio/equipe.types'

const route = useRoute()
const router = useRouter()
const { ready, error: contextError } = useEstabelecimentoView()

const modalAberto = ref(false)
const modalModo = ref<ModoCadastro>('convite')

const initialRole = ref<EstablishmentUserRole | undefined>(
  route.query.role === 'Profissional' ? 'Profissional' : undefined,
)

const acoes: {
  modo: ModoCadastro
  titulo: string
  descricao: string
  badge?: string
}[] = [
  {
    modo: 'convite',
    titulo: 'Enviar convite',
    descricao: 'Gere um link ou vincule na hora se a conta já estiver ativa.',
    badge: 'Recomendado',
  },
  {
    modo: 'vincular',
    titulo: 'Já tem conta',
    descricao: 'Vincule alguém que já se cadastrou e confirmou o e-mail.',
  },
  {
    modo: 'criar',
    titulo: 'Criar manual',
    descricao: 'Defina a senha inicial. Use apenas quando necessário.',
    badge: 'Avançado',
  },
]

function parseModoQuery(): ModoCadastro | null {
  const q = route.query.acao ?? route.query.modo
  if (q === 'convite' || q === 'vincular' || q === 'criar') return q
  return null
}

function abrirModal(modo: ModoCadastro) {
  modalModo.value = modo
  modalAberto.value = true
}

function aoVincular() {
  void router.push(ROUTE_PATHS.CONFIG_EQUIPE)
}

onMounted(() => {
  const modo = parseModoQuery()
  if (modo) {
    abrirModal(modo)
    void router.replace({ path: route.path, query: {} })
  }
})
</script>

<template>
  <div class="page-shell space-y-5">
    <div class="space-y-2">
      <RouterLink
        :to="ROUTE_PATHS.CONFIG_EQUIPE"
        class="inline-flex items-center gap-1.5 font-urbanist text-sm text-glow-text-subtle transition hover:text-glow-text"
      >
        <span aria-hidden="true">←</span>
        Voltar à equipe
      </RouterLink>
      <h1 class="font-satoshi text-2xl font-bold leading-tight text-glow-text lg:text-3xl">
        Adicionar à equipe
      </h1>
      <p class="max-w-2xl font-urbanist text-sm leading-relaxed text-glow-text-subtle">
        Escolha como incluir a pessoa. Cada opção abre um formulário focado só no que é necessário.
      </p>
    </div>

    <ContentAlert v-if="contextError" variant="error" title="Não foi possível continuar" compact>
      {{ contextError }}
    </ContentAlert>

    <div
      v-if="ready"
      class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-5xl"
    >
      <button
        v-for="acao in acoes"
        :key="acao.modo"
        type="button"
        class="equipe-acao-card text-left"
        @click="abrirModal(acao.modo)"
      >
        <div class="flex items-start justify-between gap-2">
          <h2 class="font-urbanist text-base font-semibold text-glow-text">
            {{ acao.titulo }}
          </h2>
          <span
            v-if="acao.badge"
            class="shrink-0 rounded-full bg-glow-gold-soft px-2 py-0.5 font-urbanist text-[10px] font-semibold uppercase tracking-wide text-glow-gold"
          >
            {{ acao.badge }}
          </span>
        </div>
        <p class="mt-2 font-urbanist text-sm leading-relaxed text-glow-text-subtle">
          {{ acao.descricao }}
        </p>
      </button>
    </div>

    <EquipeAdicionarModal
      v-model="modalAberto"
      :modo="modalModo"
      :initial-role="initialRole"
      @vinculado="aoVincular"
    />
  </div>
</template>
