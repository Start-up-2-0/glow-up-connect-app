<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Network, Plus, Store } from 'lucide-vue-next'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import UserAvatar from '@/components/layout/UserAvatar.vue'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useTrocarEstabelecimento } from '@/composables/useTrocarEstabelecimento'
import { useNegocioStore } from '@/stores/negocio.store'
import { assinaturaService } from '@/services/assinaturaService'
import { redeService } from '@/services/redeService'
import { ROUTE_PATHS } from '@/constants/routes'
import { lojaSetupLocation } from '@/utils/lojaSetupNavigation'
import type { AssinaturaOnboardingContexto } from '@/types/assinaturaOnboarding.types'
import type { EstabelecimentoAcesso } from '@/types/user.types'

const router = useRouter()
const { assinaturaId, estabelecimentoAtivo, ensureContext } = useNegocioContext()
const { trocarEstabelecimento } = useTrocarEstabelecimento()
const negocioStore = useNegocioStore()
const { estabelecimentos, estabelecimentoIdSelecionado } = storeToRefs(negocioStore)

const contextoOnboarding = ref<AssinaturaOnboardingContexto | null>(null)
const matrizIds = ref<Set<number>>(new Set())
const loading = ref(true)
const trocandoId = ref<number | null>(null)

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

function ehMatriz(loja: EstabelecimentoAcesso): boolean {
  if (matrizIds.value.has(loja.estabelecimentoId)) return true
  if (matrizIds.value.size > 0) return false
  return lojasOwner.value[0]?.estabelecimentoId === loja.estabelecimentoId
}

async function carregarContexto() {
  loading.value = true
  try {
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
  <div class="flex w-full flex-col gap-5 pb-8">
    <header class="flex flex-wrap items-start justify-between gap-4">
      <div class="min-w-0">
        <h1 class="font-urbanist text-2xl font-bold tracking-tight text-glow-text sm:text-[28px]">
          Minhas Lojas
        </h1>
        <p class="mt-1.5 max-w-xl font-urbanist text-sm leading-relaxed text-glow-text-subtle">
          Visualize e gerencie as lojas vinculadas à sua conta Premium.
        </p>
      </div>
      <RouterLink :to="ROUTE_PATHS.FINANCEIRO_REDE">
        <BaseButton variant="secondary">
          <Network :size="16" class="mr-1.5" />
          Painel da rede
        </BaseButton>
      </RouterLink>
    </header>

    <BaseCard title="Uso do plano">
      <p v-if="loading" class="text-sm text-glow-text-subtle">Carregando limites…</p>
      <template v-else>
        <p class="font-urbanist text-lg font-semibold text-glow-text">
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
          Você atingiu o limite de lojas do plano Premium. Em breve será possível expandir
          mediante contratação de add-on.
        </p>
        <p v-else class="mt-1 text-sm text-glow-text-subtle">
          O plano Premium permite até {{ limiteLojas ?? 5 }} lojas no total (1 principal +
          unidades adicionais).
        </p>
      </template>
    </BaseCard>

    <BaseCard title="Lojas vinculadas">
      <ul v-if="lojasOwner.length > 0" class="flex flex-col gap-2">
        <li
          v-for="loja in lojasOwner"
          :key="loja.estabelecimentoId"
          class="flex flex-wrap items-center gap-3 rounded-lg border border-glow-border-soft bg-glow-canvas px-3 py-3"
        >
          <UserAvatar
            :src="loja.logo || null"
            :name="loja.nome"
            size="sm"
            aria-hidden="true"
          />
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="truncate font-urbanist text-sm font-semibold text-glow-text">
                {{ loja.nome }}
              </span>
              <span
                v-if="ehMatriz(loja)"
                class="rounded-md bg-glow-gold-cta/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-glow-gold-cta"
              >
                Principal
              </span>
              <span
                v-if="loja.estabelecimentoId === estabelecimentoIdSelecionado"
                class="rounded-md bg-glow-success/15 px-2 py-0.5 text-[11px] font-medium text-glow-success"
              >
                Atual
              </span>
            </div>
            <p class="mt-0.5 text-xs text-glow-text-subtle">
              {{ loja.planoNome ?? 'Plano' }}
              ·
              {{ loja.assinaturaAtiva ? 'Assinatura ativa' : 'Assinatura inativa' }}
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <BaseButton
              variant="secondary"
              size="sm"
              :disabled="trocandoId === loja.estabelecimentoId"
              @click="acessarLoja(loja.estabelecimentoId)"
            >
              Acessar
            </BaseButton>
            <BaseButton
              variant="ghost"
              size="sm"
              :disabled="trocandoId === loja.estabelecimentoId"
              @click="gerenciarLoja(loja.estabelecimentoId)"
            >
              Gerenciar
            </BaseButton>
          </div>
        </li>
      </ul>
      <p
        v-else
        class="flex items-center gap-2 text-sm text-glow-text-subtle"
      >
        <Store :size="16" />
        Nenhuma loja encontrada.
      </p>
    </BaseCard>

    <BaseCard title="Adicionar loja">
      <BaseButton
        variant="primary"
        :disabled="!podeAdicionar || loading"
        @click="irAdicionarLoja"
      >
        <Plus :size="16" class="mr-1.5" />
        Adicionar nova loja
      </BaseButton>
      <p
        v-if="limiteAtingido"
        class="mt-3 text-sm text-glow-text-subtle"
      >
        Limite do plano atingido ({{ lojasVinculadas }} de {{ limiteLojas }}). A ação de
        adicionar está desabilitada.
      </p>
      <p
        v-else-if="!podeAdicionar && !loading"
        class="mt-3 text-sm text-glow-text-subtle"
      >
        Não é possível adicionar uma nova loja no momento. Verifique sua assinatura Premium.
      </p>
      <p
        v-else
        class="mt-3 text-sm text-glow-text-subtle"
      >
        Abre um fluxo guiado para cadastrar a unidade e configurar equipe, serviços e horários.
      </p>
    </BaseCard>
  </div>
</template>
