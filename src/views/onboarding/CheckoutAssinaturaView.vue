<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import DiaVencimentoSelect from '@/components/assinatura/DiaVencimentoSelect.vue'
import MercadoPagoCardForm from '@/components/assinatura/MercadoPagoCardForm.vue'
import PromocaoLancamentoBanner from '@/components/assinatura/PromocaoLancamentoBanner.vue'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import { readFileAsDataUrl } from '@/utils/avatarFile'
import { usePlanosStore } from '@/stores/planos.store'
import { useAssinaturaStore } from '@/stores/assinatura.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useUserStore } from '@/stores/user.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { LANDING_PLANOS_HASH, ROUTE_PATHS } from '@/constants/routes'
import { formatBRL, telefoneToApi } from '@/utils/formatters'
import { USER_ROLE } from '@/types/user.types'
const route = useRoute()
const router = useRouter()
const planosStore = usePlanosStore()
const assinaturaStore = useAssinaturaStore()
const negocioStore = useNegocioStore()
const userStore = useUserStore()
const notifications = useNotificationsStore()
const { resolveError, resolveErrorCode } = useApiError()

const { promocao, loading: planosLoading } = storeToRefs(planosStore)
const { loading: submitting } = storeToRefs(assinaturaStore)

const cardFormRef = ref<InstanceType<typeof MercadoPagoCardForm> | null>(null)
const aguardandoPagamento = ref(false)
const erro = ref<string | null>(null)

const planoId = computed(() => Number(route.query.planoId))
const plano = computed(() => planosStore.getPlanoById(planoId.value))

const diaVencimento = ref<number | null>(null)
const nome = ref('')
const telefone = ref('')
const email = ref('')
const cep = ref('')
const logradouro = ref('')
const numero = ref('')
const bairro = ref('')
const cidade = ref('')
const estado = ref('')
const complemento = ref('')
const logoFile = ref<File | null>(null)

const diasPermitidos = computed(
  () => promocao.value?.diasVencimentoPermitidos ?? [5, 10, 15, 20],
)

const isAutonomo = computed(
  () => userStore.profile?.role === USER_ROLE.PROFISSIONAL_AUTONOMO,
)

onMounted(async () => {
  if (!userStore.profile) {
    await userStore.fetchMe()
  }

  try {
    await planosStore.fetchPlanos()
  } catch (err) {
    erro.value = resolveError(err)
    return
  }

  if (!plano.value) {
    await router.replace({ path: ROUTE_PATHS.HOME, hash: LANDING_PLANOS_HASH })
    return
  }

  diaVencimento.value = diasPermitidos.value[1] ?? 10
  email.value = userStore.profile?.email ?? ''
  nome.value = userStore.profile?.nome ?? ''
})

async function aguardarAtivacao() {
  aguardandoPagamento.value = true
  const maxTentativas = 30
  for (let i = 0; i < maxTentativas; i++) {
    await new Promise((r) => setTimeout(r, 2000))
    await negocioStore.fetchEstabelecimentos(true)
    if (negocioStore.assinaturaAtiva) {
      aguardandoPagamento.value = false
      notifications.push('success', 'Pagamento confirmado! Bem-vindo ao dashboard.')
      await router.push(ROUTE_PATHS.DASHBOARD)
      return
    }
  }
  aguardandoPagamento.value = false
  notifications.push(
    'info',
    'Pagamento em processamento. Atualize a página em alguns instantes.',
  )
}

async function finalizarCheckout() {
  erro.value = null

  if (!plano.value || diaVencimento.value === null) {
    erro.value = 'Selecione o plano e o dia de vencimento.'
    return
  }

  if (!nome.value.trim()) {
    erro.value = 'Informe o nome do negócio.'
    return
  }

  if (!logoFile.value) {
    erro.value = 'Envie a logo do negócio.'
    return
  }

  const logo = await readFileAsDataUrl(logoFile.value)

  const endereco = {
    cep: cep.value,
    logradouro: logradouro.value,
    numero: numero.value,
    bairro: bairro.value,
    cidade: cidade.value,
    estado: estado.value,
    complemento: complemento.value || undefined,
  }

  const pagamento = await cardFormRef.value?.tokenizar()
  if (!pagamento) return

  const payload = isAutonomo.value
    ? {
        planoId: plano.value.id,
        tipoAssinatura: 'ProfissionalAutonomo' as const,
        profissionalAutonomo: {
          nomePublico: nome.value,
          logo,
          telefone: telefoneToApi(telefone.value),
          email: email.value,
          endereco,
        },
        gateway: 'MercadoPago' as const,
        diaVencimento: diaVencimento.value,
        pagamento,
      }
    : {
        planoId: plano.value.id,
        tipoAssinatura: 'Estabelecimento' as const,
        estabelecimento: {
          nome: nome.value,
          logo,
          telefone: telefoneToApi(telefone.value),
          email: email.value,
          endereco,
        },
        gateway: 'MercadoPago' as const,
        diaVencimento: diaVencimento.value,
        pagamento,
      }

  try {
    const result = await assinaturaStore.criarAssinatura(payload)
    assinaturaStore.setAssinatura(result)

    if (result.emTrial) {
      notifications.push('success', `Bem-vindo! Você tem ${result.diasTrial} dias de teste.`)
      await router.push(ROUTE_PATHS.DASHBOARD)
      return
    }

    if (result.status === 'PendentePagamento') {
      if (result.pagamentoInicial?.checkoutUrl) {
        window.location.href = result.pagamentoInicial.checkoutUrl
        return
      }
      await aguardarAtivacao()
      return
    }

    notifications.push('success', 'Assinatura iniciada com sucesso!')
    await router.push(ROUTE_PATHS.DASHBOARD)
  } catch (err) {
    const code = resolveErrorCode(err)
    if (code === 'EMAIL_NAO_CONFIRMADO') {
      erro.value = 'Confirme seu e-mail antes de contratar um plano.'
      return
    }
    erro.value = resolveError(err)
  }
}

function onLogoChange(file: File | null) {
  logoFile.value = file
}

function onLogoError(message: string) {
  erro.value = message
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6 py-6">
    <div>
      <h1 class="font-satoshi text-xl font-bold text-glow-text">Checkout</h1>
      <p v-if="plano" class="mt-1 text-sm text-glow-text-subtle">
        Plano {{ plano.nome }} — {{ formatBRL(plano.preco) }}/mês
      </p>
    </div>

    <PromocaoLancamentoBanner v-if="promocao?.disponivel" :promocao="promocao" />

    <LoadingSpinner v-if="planosLoading" />

    <template v-else-if="plano">
      <BaseCard title="Dados do negócio">
        <div class="space-y-4">
          <BaseInput v-model="nome" :label="isAutonomo ? 'Nome público' : 'Nome'" />
          <AuthAvatarUpload label="Logo" @change="onLogoChange" @error="onLogoError" />
          <BaseInput v-model="telefone" label="Telefone" />
          <BaseInput v-model="email" label="E-mail" type="email" />
          <BaseInput v-model="cep" label="CEP" />
          <BaseInput v-model="logradouro" label="Logradouro" />
          <div class="grid grid-cols-2 gap-4">
            <BaseInput v-model="numero" label="Número" />
            <BaseInput v-model="bairro" label="Bairro" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <BaseInput v-model="cidade" label="Cidade" />
            <BaseInput v-model="estado" label="Estado" maxlength="2" />
          </div>
          <BaseInput v-model="complemento" label="Complemento" hint="Opcional" />
        </div>
      </BaseCard>

      <BaseCard title="Cobrança">
        <DiaVencimentoSelect
          v-model="diaVencimento"
          :dias-permitidos="diasPermitidos"
        />
      </BaseCard>

      <BaseCard title="Cartão de crédito">
        <MercadoPagoCardForm ref="cardFormRef" />
      </BaseCard>

      <p v-if="erro" class="text-sm text-red-600">{{ erro }}</p>

      <BaseButton
        variant="primary"
        block
        :loading="submitting || aguardandoPagamento"
        @click="finalizarCheckout"
      >
        {{ aguardandoPagamento ? 'Processando pagamento...' : 'Contratar plano' }}
      </BaseButton>
    </template>
  </div>
</template>
