<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  Building2,
  CalendarDays,
  CircleCheck,
  Crown,
  ExternalLink,
  Lightbulb,
  MoreVertical,
  Network,
  Plus,
  Settings,
  Store,
  UserRound,
} from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useTrocarEstabelecimento } from '@/composables/useTrocarEstabelecimento'
import { useNegocioStore } from '@/stores/negocio.store'
import { useUserStore } from '@/stores/user.store'
import { assinaturaService } from '@/services/assinaturaService'
import { redeService } from '@/services/redeService'
import { ROUTE_PATHS } from '@/constants/routes'
import { lojaSetupLocation } from '@/utils/lojaSetupNavigation'
import { formatDate } from '@/utils/formatters'
import { getAvatarInitial, normalizeAvatarSrc } from '@/utils/avatarSrc'
import type { AssinaturaOnboardingContexto } from '@/types/assinaturaOnboarding.types'
import type { EstabelecimentoAcesso } from '@/types/user.types'

const router = useRouter()
const {
  assinaturaId,
  estabelecimentoAtivo,
  assinaturaAtiva,
  planoNome,
  proximaDataVencimento,
  ensureContext,
} = useNegocioContext()
const { trocarEstabelecimento } = useTrocarEstabelecimento()
const negocioStore = useNegocioStore()
const userStore = useUserStore()
const { estabelecimentos, estabelecimentoIdSelecionado } = storeToRefs(negocioStore)
const { profile } = storeToRefs(userStore)

const contextoOnboarding = ref<AssinaturaOnboardingContexto | null>(null)
const matrizIds = ref<Set<number>>(new Set())
const loading = ref(true)
const trocandoId = ref<number | null>(null)
const menuAbertoId = ref<number | null>(null)

const lojasOwner = computed(() =>
  estabelecimentos.value.filter((e) => e.role === 'Owner'),
)

const lojasVinculadas = computed(
  () => contextoOnboarding.value?.lojasVinculadas ?? lojasOwner.value.length,
)

const limiteLojas = computed(() => contextoOnboarding.value?.limiteLojas ?? null)

const vagasRestantes = computed(() => {
  if (limiteLojas.value == null) return 0
  return Math.max(0, limiteLojas.value - lojasVinculadas.value)
})

const podeAdicionar = computed(() => Boolean(contextoOnboarding.value?.podeAdicionarLoja))

const limiteAtingido = computed(
  () =>
    limiteLojas.value != null &&
    lojasVinculadas.value >= limiteLojas.value &&
    !podeAdicionar.value,
)

const usoPlanoPct = computed(() => {
  if (limiteLojas.value == null || limiteLojas.value <= 0) return 0
  return Math.min(100, Math.round((lojasVinculadas.value / limiteLojas.value) * 100))
})

const lojaReferencia = computed(() => {
  const matriz = lojasOwner.value.find((loja) => ehMatriz(loja))
  return matriz ?? lojasOwner.value[0] ?? estabelecimentoAtivo.value ?? null
})

const planoExibido = computed(
  () => lojaReferencia.value?.planoNome ?? planoNome.value ?? '—',
)

const assinaturaAtivaResumo = computed(
  () => lojaReferencia.value?.assinaturaAtiva ?? assinaturaAtiva.value,
)

const renovacaoExibida = computed(() => {
  const iso =
    lojaReferencia.value?.proximaDataVencimento ?? proximaDataVencimento.value ?? null
  return iso ? formatDate(iso) : '—'
})

const nomeResponsavel = computed(() => profile.value?.nome?.trim() || null)

function ehMatriz(loja: EstabelecimentoAcesso): boolean {
  if (matrizIds.value.has(loja.estabelecimentoId)) return true
  if (matrizIds.value.size > 0) return false
  return lojasOwner.value[0]?.estabelecimentoId === loja.estabelecimentoId
}

function logoSrc(loja: EstabelecimentoAcesso): string | null {
  return normalizeAvatarSrc(loja.logo || null)
}

function toggleMenu(id: number) {
  menuAbertoId.value = menuAbertoId.value === id ? null : id
}

function fecharMenu() {
  menuAbertoId.value = null
}

async function carregarContexto() {
  loading.value = true
  try {
    if (!userStore.profile) {
      await userStore.fetchMe().catch(() => null)
    }
    contextoOnboarding.value = await assinaturaService.obterContextoOnboarding()
    const premiumId =
      contextoOnboarding.value.assinaturaPremiumId ?? assinaturaId.value ?? null
    if (premiumId) {
      try {
        const resumo = await redeService.obterResumo(premiumId)
        matrizIds.value = new Set(
          resumo.unidades.filter((u) => u.ehMatriz).map((u) => u.estabelecimentoId),
        )
      } catch {
        matrizIds.value = new Set()
      }
    }
  } catch {
    contextoOnboarding.value = null
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await ensureContext()
  if (!estabelecimentoAtivo.value) {
    await router.replace(ROUTE_PATHS.ONBOARDING_CONTRATAR)
    return
  }
  await carregarContexto()
})

async function acessarLoja(id: number) {
  fecharMenu()
  if (id === estabelecimentoIdSelecionado.value) {
    await router.push(ROUTE_PATHS.DASHBOARD)
    return
  }
  trocandoId.value = id
  try {
    await trocarEstabelecimento(id)
    await router.push(ROUTE_PATHS.DASHBOARD)
  } finally {
    trocandoId.value = null
  }
}

async function gerenciarLoja(id: number) {
  fecharMenu()
  if (id !== estabelecimentoIdSelecionado.value) {
    trocandoId.value = id
    try {
      await trocarEstabelecimento(id)
    } finally {
      trocandoId.value = null
    }
  }
  await router.push(ROUTE_PATHS.CONFIG_PERFIL)
}

function irAdicionarLoja() {
  if (!podeAdicionar.value) return
  void router.push(
    lojaSetupLocation({
      mode: 'adicionar-unidade',
      assinaturaId: contextoOnboarding.value?.assinaturaPremiumId ?? assinaturaId.value,
    }),
  )
}
</script>

<template>
  <div class="flex w-full flex-col gap-5 pb-8" @click="fecharMenu">
    <!-- Cabeçalho -->
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div class="min-w-0">
        <h1 class="font-urbanist text-2xl font-bold tracking-tight text-glow-text sm:text-[28px]">
          Minhas Lojas
        </h1>
        <p class="mt-1.5 max-w-xl font-urbanist text-sm leading-relaxed text-glow-text-subtle">
          Visualize e gerencie as lojas vinculadas à sua conta Premium.
        </p>
      </div>
      <RouterLink :to="ROUTE_PATHS.FINANCEIRO_REDE" class="shrink-0">
        <button
          type="button"
          class="inline-flex h-10 items-center justify-center rounded-lg border border-glow-gold-cta/50 bg-glow-bg-elevated px-4 font-urbanist text-sm font-medium text-glow-gold-cta transition hover:bg-glow-gold-selected focus:outline-none focus:ring-2 focus:ring-glow-gold/30"
        >
          <Network :size="16" class="mr-1.5" />
          Painel da rede
        </button>
      </RouterLink>
    </header>

    <!-- Uso do plano -->
    <section
      class="rounded-xl border border-glow-border-soft bg-glow-bg-elevated p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] sm:p-6"
      aria-labelledby="uso-plano-titulo"
    >
      <div v-if="loading" class="text-sm text-glow-text-subtle">
        Carregando limites…
      </div>
      <div
        v-else
        class="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between xl:gap-12"
      >
        <div class="flex min-w-0 items-center gap-4">
          <div
            class="flex size-12 shrink-0 items-center justify-center rounded-full bg-glow-gold-selected text-glow-gold-cta"
            aria-hidden="true"
          >
            <Building2 :size="22" :stroke-width="1.75" />
          </div>
          <div class="min-w-0">
            <p id="uso-plano-titulo" class="font-urbanist text-sm text-glow-text-subtle">
              Uso do plano
            </p>
            <p class="mt-0.5 font-urbanist text-xl font-semibold tracking-tight text-glow-text">
              {{ lojasVinculadas }}
              de
              {{ limiteLojas ?? '—' }}
              lojas utilizadas
            </p>
            <p
              v-if="podeAdicionar && vagasRestantes > 0"
              class="mt-1 text-sm text-glow-text-subtle"
            >
              Você ainda pode adicionar
              {{ vagasRestantes }}
              {{ vagasRestantes === 1 ? 'loja' : 'lojas' }}.
            </p>
            <p
              v-else-if="limiteAtingido"
              class="mt-1 text-sm text-glow-text-subtle"
            >
              Você atingiu o limite de lojas do plano Premium.
            </p>
            <p v-else class="mt-1 text-sm text-glow-text-subtle">
              O plano Premium permite até {{ limiteLojas ?? 5 }} lojas no total.
            </p>
          </div>
        </div>

        <div class="w-full min-w-0 xl:max-w-[28rem]">
          <div class="flex items-center justify-between gap-3">
            <span class="font-urbanist text-sm text-glow-text-subtle">Lojas utilizadas</span>
            <span class="font-urbanist text-sm font-semibold tabular-nums text-glow-text">
              {{ lojasVinculadas }}/{{ limiteLojas ?? '—' }}
            </span>
          </div>
          <div
            class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#EDE9F2]"
            role="progressbar"
            :aria-valuenow="usoPlanoPct"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-label="`Utilização do plano: ${usoPlanoPct}%`"
          >
            <div
              class="h-full rounded-full bg-glow-gold-cta transition-[width] duration-300"
              :style="{ width: `${usoPlanoPct}%` }"
            />
          </div>

          <div
            class="mt-5 grid grid-cols-1 gap-4 border-t border-glow-border-soft pt-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-glow-border-soft sm:border-t-0 sm:pt-0"
          >
            <div class="flex items-start gap-2.5 sm:pr-5">
              <Crown
                :size="15"
                :stroke-width="1.75"
                class="mt-0.5 shrink-0 text-glow-gold-cta"
                aria-hidden="true"
              />
              <div class="min-w-0">
                <p class="font-urbanist text-[11px] leading-tight text-glow-text-subtle">
                  Plano
                </p>
                <p class="mt-0.5 truncate font-urbanist text-sm font-semibold text-glow-text">
                  {{ planoExibido }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-2.5 sm:px-5">
              <CircleCheck
                :size="15"
                :stroke-width="1.75"
                class="mt-0.5 shrink-0 text-glow-gold-cta"
                aria-hidden="true"
              />
              <div class="min-w-0">
                <p class="font-urbanist text-[11px] leading-tight text-glow-text-subtle">
                  Assinatura ativa
                </p>
                <p class="mt-0.5 font-urbanist text-sm font-semibold text-glow-text">
                  {{ assinaturaAtivaResumo ? 'Sim' : 'Não' }}
                </p>
              </div>
            </div>
            <div class="flex items-start gap-2.5 sm:pl-5">
              <CalendarDays
                :size="15"
                :stroke-width="1.75"
                class="mt-0.5 shrink-0 text-glow-gold-cta"
                aria-hidden="true"
              />
              <div class="min-w-0">
                <p class="font-urbanist text-[11px] leading-tight text-glow-text-subtle">
                  Próxima renovação
                </p>
                <p class="mt-0.5 font-urbanist text-sm font-semibold tabular-nums text-glow-text">
                  {{ renovacaoExibida }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Lojas vinculadas -->
    <section class="flex flex-col gap-3" aria-labelledby="lojas-vinculadas-titulo">
      <h2
        id="lojas-vinculadas-titulo"
        class="font-urbanist text-base font-semibold text-glow-text"
      >
        Lojas vinculadas
      </h2>

      <ul v-if="lojasOwner.length > 0" class="flex flex-col gap-3">
        <li
          v-for="loja in lojasOwner"
          :key="loja.estabelecimentoId"
          class="rounded-xl border border-glow-border-soft bg-glow-bg-elevated p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
        >
          <div
            class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6"
          >
            <!-- Identidade -->
            <div class="flex min-w-0 flex-1 items-start gap-3.5 sm:items-center">
              <div
                class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-glow-gold-selected"
                aria-hidden="true"
              >
                <img
                  v-if="logoSrc(loja)"
                  :src="logoSrc(loja)!"
                  alt=""
                  class="size-full object-contain object-center"
                  draggable="false"
                />
                <span
                  v-else
                  class="font-urbanist text-base font-semibold text-glow-gold-cta"
                >
                  {{ getAvatarInitial(loja.nome) }}
                </span>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <h3 class="font-urbanist text-base font-semibold text-glow-text">
                    {{ loja.nome }}
                  </h3>
                  <span
                    v-if="ehMatriz(loja)"
                    class="rounded-md bg-glow-gold-selected px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-glow-gold-cta"
                  >
                    Principal
                  </span>
                  <span
                    v-if="loja.estabelecimentoId === estabelecimentoIdSelecionado"
                    class="rounded-md bg-glow-success-bg px-2 py-0.5 text-[10px] font-semibold text-glow-success-dark"
                  >
                    Atual
                  </span>
                </div>
                <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
                  {{ loja.planoNome ?? 'Plano' }}
                  •
                  {{ loja.assinaturaAtiva ? 'Assinatura ativa' : 'Assinatura inativa' }}
                </p>
                <p
                  v-if="nomeResponsavel"
                  class="mt-1.5 flex items-center gap-1.5 font-urbanist text-sm text-glow-text-subtle"
                >
                  <UserRound
                    :size="14"
                    :stroke-width="1.75"
                    class="shrink-0 opacity-80"
                    aria-hidden="true"
                  />
                  <span>Responsável: {{ nomeResponsavel }}</span>
                </p>
              </div>
            </div>

            <!-- Ações -->
            <div
              class="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:w-auto"
              @click.stop
            >
              <button
                type="button"
                class="inline-flex h-9 w-full items-center justify-center rounded-lg border border-glow-gold-cta/55 bg-transparent px-3.5 font-urbanist text-xs font-medium text-glow-gold-cta transition hover:bg-glow-gold-selected focus:outline-none focus:ring-2 focus:ring-glow-gold/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                :disabled="trocandoId === loja.estabelecimentoId"
                @click="acessarLoja(loja.estabelecimentoId)"
              >
                <ExternalLink :size="14" class="mr-1.5" />
                Acessar
              </button>
              <button
                type="button"
                class="inline-flex h-9 w-full items-center justify-center rounded-lg border border-transparent bg-glow-gold-selected px-3.5 font-urbanist text-xs font-medium text-glow-gold-cta transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-glow-gold/30 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                :disabled="trocandoId === loja.estabelecimentoId"
                @click="gerenciarLoja(loja.estabelecimentoId)"
              >
                <Settings :size="14" class="mr-1.5" />
                Gerenciar
              </button>

              <div class="relative self-end sm:self-auto">
                <button
                  type="button"
                  class="inline-flex size-9 items-center justify-center rounded-lg text-glow-text-subtle transition hover:bg-glow-hover-surface hover:text-glow-text focus:outline-none focus:ring-2 focus:ring-glow-gold/30"
                  :aria-expanded="menuAbertoId === loja.estabelecimentoId"
                  aria-haspopup="menu"
                  :aria-label="`Mais ações de ${loja.nome}`"
                  @click="toggleMenu(loja.estabelecimentoId)"
                >
                  <MoreVertical :size="16" :stroke-width="1.75" />
                </button>
                <div
                  v-if="menuAbertoId === loja.estabelecimentoId"
                  class="absolute right-0 z-20 mt-1 w-44 overflow-hidden rounded-lg border border-glow-border-soft bg-glow-bg-elevated py-1 shadow-glow-md"
                  role="menu"
                >
                  <button
                    type="button"
                    role="menuitem"
                    class="flex w-full items-center px-3 py-2 text-left font-urbanist text-sm text-glow-text transition hover:bg-glow-hover-surface"
                    :disabled="trocandoId === loja.estabelecimentoId"
                    @click="gerenciarLoja(loja.estabelecimentoId)"
                  >
                    Editar dados
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    class="flex w-full items-center px-3 py-2 text-left font-urbanist text-sm text-glow-text transition hover:bg-glow-hover-surface"
                    :disabled="trocandoId === loja.estabelecimentoId"
                    @click="acessarLoja(loja.estabelecimentoId)"
                  >
                    Acessar loja
                  </button>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>

      <div
        v-else
        class="flex items-center gap-2 rounded-xl border border-glow-border-soft bg-glow-bg-elevated px-5 py-8 text-sm text-glow-text-subtle shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      >
        <Store :size="16" />
        Nenhuma loja encontrada.
      </div>

      <!-- Adicionar / limite -->
      <div
        v-if="limiteAtingido"
        class="flex flex-col gap-4 rounded-xl border border-dashed border-glow-border-soft bg-glow-bg-elevated px-5 py-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0">
          <p class="font-urbanist text-sm font-semibold text-glow-text">
            Limite de lojas atingido
          </p>
          <p class="mt-1 text-sm text-glow-text-subtle">
            Seu plano permite até {{ limiteLojas }} lojas.
          </p>
        </div>
        <RouterLink :to="ROUTE_PATHS.CONFIG_ASSINATURA" class="shrink-0">
          <BaseButton variant="secondary" size="sm" class="w-full sm:w-auto">
            Ver opções do plano
          </BaseButton>
        </RouterLink>
      </div>

      <div
        v-else
        class="flex flex-col gap-4 rounded-xl border border-dashed border-glow-gold-cta/50 bg-glow-bg-elevated px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
      >
        <div class="flex min-w-0 items-center gap-3.5">
          <div
            class="flex size-12 shrink-0 items-center justify-center rounded-full bg-glow-gold-selected text-glow-gold-cta"
            aria-hidden="true"
          >
            <Plus :size="22" :stroke-width="1.75" />
          </div>
          <div class="min-w-0">
            <p class="font-urbanist text-sm font-semibold text-glow-text">
              Adicionar nova loja
            </p>
            <p class="mt-1 max-w-xl text-sm leading-relaxed text-glow-text-subtle">
              <template v-if="!podeAdicionar && !loading">
                Não é possível adicionar uma nova loja no momento. Verifique sua assinatura
                Premium.
              </template>
              <template v-else>
                Abra um fluxo guiado para cadastrar a unidade e configurar equipe, serviços e
                horários.
              </template>
            </p>
          </div>
        </div>
        <button
          type="button"
          class="inline-flex h-10 w-full shrink-0 items-center justify-center rounded-lg bg-glow-gold-cta px-4 font-urbanist text-sm font-medium text-white shadow-sm transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-glow-gold/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          :disabled="!podeAdicionar || loading"
          @click="irAdicionarLoja"
        >
          <Plus :size="16" class="mr-1.5" />
          Adicionar nova loja
        </button>
      </div>
    </section>

    <!-- Dica -->
    <aside class="flex items-center gap-3 rounded-xl bg-glow-gold-selected/70 px-5 py-4">
      <div
        class="flex size-9 shrink-0 items-center justify-center rounded-full bg-glow-bg-elevated text-glow-gold-cta shadow-sm"
        aria-hidden="true"
      >
        <Lightbulb :size="16" :stroke-width="1.75" />
      </div>
      <p class="min-w-0 font-urbanist text-sm leading-relaxed text-glow-text-subtle">
        <span class="font-semibold text-glow-text">Dica:</span>
        Gerencie cada loja de forma individual ou visualize o desempenho de todas na visão do
        Painel da rede.
      </p>
    </aside>
  </div>
</template>
