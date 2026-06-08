<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import TelefoneInput from '@/components/ui/TelefoneInput.vue'
import AuthPasswordRules from '@/components/auth/recovery/AuthPasswordRules.vue'
import { useEstabelecimentoView } from '@/composables/useEstabelecimentoView'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { equipeService } from '@/services/equipeService'
import { conviteService } from '@/services/conviteService'
import { userService } from '@/services/userService'
import { ROUTE_PATHS } from '@/constants/routes'
import { ROLES_CADASTRO_EQUIPE } from '@/constants/establishmentRoles'
import { getUnmetPasswordRules } from '@/utils/passwordRules'
import type { EstablishmentUserRole } from '@/types/negocio/equipe.types'

type ModoCadastro = 'convite' | 'vincular' | 'criar'

const route = useRoute()
const router = useRouter()
const { estabelecimentoId, ready, error: contextError } = useEstabelecimentoView()
const notifications = useNotificationsStore()
const { resolveError, resolveErrorCode } = useApiError()

function modoInicial(): ModoCadastro {
  const q = route.query.modo
  if (q === 'criar' || q === 'vincular') return q
  return 'convite'
}

const modo = ref<ModoCadastro>(modoInicial())

const nome = ref('')
const email = ref('')
const telefone = ref('')
const senha = ref('')
const confirmarSenha = ref('')
const nomePublico = ref('')
const role = ref<EstablishmentUserRole>(
  route.query.role === 'Profissional' ? 'Profissional' : 'Receptionist',
)
const podeReceberAgendamento = ref(true)
const saving = ref(false)
const sucessoDetalhe = ref<string | null>(null)
const linkConvite = ref<string | null>(null)

const ehProfissional = computed(() => role.value === 'Profissional')
const roleSelecionada = computed(() =>
  ROLES_CADASTRO_EQUIPE.find((r) => r.value === role.value),
)

watch(modo, () => {
  sucessoDetalhe.value = null
  linkConvite.value = null
})

function validarSenha(): string | null {
  const regras = getUnmetPasswordRules(senha.value)
  if (regras.length > 0) {
    return `A senha não atende: ${regras.join(' ')}`
  }
  if (senha.value !== confirmarSenha.value) {
    return 'As senhas não conferem.'
  }
  return null
}

async function copiarLink() {
  if (!linkConvite.value) return
  try {
    await navigator.clipboard.writeText(linkConvite.value)
    notifications.push('success', 'Link copiado!')
  } catch {
    notifications.push('error', 'Não foi possível copiar o link.')
  }
}

async function enviarConvite() {
  if (!estabelecimentoId.value) return

  const emailTrim = email.value.trim().toLowerCase()
  if (!emailTrim) {
    notifications.push('error', 'Informe o e-mail do convidado.')
    return
  }

  saving.value = true
  sucessoDetalhe.value = null
  linkConvite.value = null

  try {
    const resultado = ehProfissional.value
      ? await conviteService.criarConviteProfissional(estabelecimentoId.value, {
          email: emailTrim,
          nomePublico: nomePublico.value.trim() || undefined,
          podeReceberAgendamento: podeReceberAgendamento.value,
        })
      : await conviteService.criarConviteUsuario(estabelecimentoId.value, {
          email: emailTrim,
          role: role.value as 'Admin' | 'Manager' | 'Receptionist',
        })

    if (resultado.tipoResultado === 'Vinculado') {
      notifications.push(
        'success',
        ehProfissional.value
          ? 'Profissional vinculado à equipe.'
          : 'Usuário adicionado à equipe.',
      )
      await router.push(ROUTE_PATHS.CONFIG_EQUIPE)
      return
    }

    linkConvite.value = resultado.linkConvite ?? resultado.convite?.linkConvite ?? null
    sucessoDetalhe.value =
      'A pessoa deve se cadastrar com este e-mail, confirmar o e-mail e abrir o link abaixo para aceitar o convite.'
    notifications.push('success', 'Convite criado com sucesso.')
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível criar o convite.'))
  } finally {
    saving.value = false
  }
}

async function vincularExistente() {
  if (!estabelecimentoId.value) return
  const emailTrim = email.value.trim()
  const telefoneTrim = telefone.value.trim()
  if (!emailTrim && !telefoneTrim) {
    notifications.push('error', 'Informe o e-mail ou o telefone do usuário.')
    return
  }

  saving.value = true
  try {
    if (ehProfissional.value) {
      await equipeService.vincularProfissional(estabelecimentoId.value, {
        email: emailTrim || undefined,
        telefone: telefoneTrim || undefined,
        nomePublico: nomePublico.value.trim() || undefined,
        podeReceberAgendamento: podeReceberAgendamento.value,
      })
      notifications.push('success', 'Profissional vinculado à equipe.')
    } else {
      await equipeService.cadastrarUsuario(estabelecimentoId.value, {
        email: emailTrim || undefined,
        telefone: telefoneTrim || undefined,
        role: role.value,
      })
      notifications.push('success', 'Usuário adicionado à equipe.')
    }
    await router.push(ROUTE_PATHS.CONFIG_EQUIPE)
  } catch (err) {
    notifications.push(
      'error',
      resolveError(
        err,
        'Não encontramos uma conta ativa com esses dados. Use "Enviar convite" se a pessoa ainda não se cadastrou.',
      ),
    )
  } finally {
    saving.value = false
  }
}

async function tentarVincularProfissional(emailTrim: string, telefoneTrim: string): Promise<boolean> {
  if (!estabelecimentoId.value) return false
  try {
    await equipeService.vincularProfissional(estabelecimentoId.value, {
      email: emailTrim || undefined,
      telefone: telefoneTrim || undefined,
      nomePublico: nomePublico.value.trim() || undefined,
      podeReceberAgendamento: podeReceberAgendamento.value,
    })
    return true
  } catch {
    return false
  }
}

async function tentarVincularUsuario(emailTrim: string, telefoneTrim: string): Promise<boolean> {
  if (!estabelecimentoId.value) return false
  try {
    await equipeService.cadastrarUsuario(estabelecimentoId.value, {
      email: emailTrim || undefined,
      telefone: telefoneTrim || undefined,
      role: role.value,
    })
    return true
  } catch {
    return false
  }
}

async function criarNovaConta() {
  if (!estabelecimentoId.value) return

  const emailTrim = email.value.trim().toLowerCase()
  const telefoneTrim = telefone.value.trim()
  const nomeTrim = nome.value.trim()

  if (!nomeTrim || !emailTrim || !telefoneTrim) {
    notifications.push('error', 'Preencha nome, e-mail e telefone.')
    return
  }

  const erroSenha = validarSenha()
  if (erroSenha) {
    notifications.push('error', erroSenha)
    return
  }

  if (ehProfissional.value && !nomePublico.value.trim()) {
    nomePublico.value = nomeTrim
  }

  saving.value = true
  sucessoDetalhe.value = null

  try {
    let contaRecémCriada = false

    try {
      await userService.cadastrar({
        nome: nomeTrim,
        email: emailTrim,
        telefone: telefoneTrim,
        senha: senha.value,
      })
      contaRecémCriada = true
    } catch (err) {
      if (resolveErrorCode(err) !== 'EMAIL_JA_CADASTRADO') {
        throw err
      }
    }

    if (ehProfissional.value) {
      const vinculou = await tentarVincularProfissional(emailTrim, telefoneTrim)
      if (vinculou) {
        notifications.push('success', 'Profissional vinculado à equipe.')
        await router.push(ROUTE_PATHS.CONFIG_EQUIPE)
        return
      }

      const resultado = await conviteService.criarConviteProfissional(estabelecimentoId.value, {
        email: emailTrim,
        telefone: telefoneTrim || undefined,
        nomePublico: nomePublico.value.trim() || nomeTrim,
        podeReceberAgendamento: podeReceberAgendamento.value,
      })

      if (resultado.tipoResultado === 'Vinculado') {
        notifications.push('success', 'Profissional vinculado à equipe.')
        await router.push(ROUTE_PATHS.CONFIG_EQUIPE)
        return
      }

      linkConvite.value = resultado.linkConvite ?? resultado.convite?.linkConvite ?? null
      if (contaRecémCriada) {
        sucessoDetalhe.value =
          'Conta criada e convite gerado. A pessoa deve confirmar o e-mail e aceitar o convite pelo link.'
      } else {
        sucessoDetalhe.value =
          'Convite gerado. Peça para a pessoa confirmar o e-mail e aceitar pelo link.'
      }
      notifications.push('success', 'Convite de profissional criado.')
      return
    }

    const vinculou = await tentarVincularUsuario(emailTrim, telefoneTrim)
    if (vinculou) {
      notifications.push('success', 'Usuário adicionado à equipe.')
      await router.push(ROUTE_PATHS.CONFIG_EQUIPE)
      return
    }

    if (contaRecémCriada) {
      sucessoDetalhe.value =
        'Conta criada com sucesso. A pessoa receberá um e-mail de confirmação. Depois de confirmar, use "Já tem conta" para vincular.'
      notifications.push('success', 'Conta criada. Aguardando confirmação de e-mail.')
      return
    }

    notifications.push(
      'info',
      'O e-mail já existe na plataforma, mas ainda não foi possível vincular. Peça para a pessoa confirmar o e-mail ou use "Já tem conta".',
    )
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível criar a conta.'))
  } finally {
    saving.value = false
  }
}

async function handleSubmit() {
  if (modo.value === 'convite') {
    await enviarConvite()
  } else if (modo.value === 'vincular') {
    await vincularExistente()
  } else {
    await criarNovaConta()
  }
}
</script>

<template>
  <div class="mx-auto max-w-lg space-y-4 lg:space-y-6">
    <div>
      <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
        Adicionar à equipe
      </h1>
      <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
        O fluxo padrão é enviar um <strong class="text-glow-text">convite por link</strong>.
        A pessoa define a própria senha no cadastro.
      </p>
    </div>

    <p v-if="contextError" class="font-urbanist text-sm text-red-600">{{ contextError }}</p>

    <div v-if="ready" class="flex gap-1 rounded-lg border border-glow-border-soft bg-glow-canvas p-1">
      <button
        type="button"
        class="flex-1 rounded-md px-2 py-2 font-urbanist text-xs font-medium transition-colors sm:text-sm"
        :class="
          modo === 'convite'
            ? 'bg-glow-surface text-glow-text shadow-sm'
            : 'text-glow-text-subtle hover:text-glow-text'
        "
        @click="modo = 'convite'"
      >
        Enviar convite
      </button>
      <button
        type="button"
        class="flex-1 rounded-md px-2 py-2 font-urbanist text-xs font-medium transition-colors sm:text-sm"
        :class="
          modo === 'vincular'
            ? 'bg-glow-surface text-glow-text shadow-sm'
            : 'text-glow-text-subtle hover:text-glow-text'
        "
        @click="modo = 'vincular'"
      >
        Já tem conta
      </button>
      <button
        type="button"
        class="flex-1 rounded-md px-2 py-2 font-urbanist text-xs font-medium transition-colors sm:text-sm"
        :class="
          modo === 'criar'
            ? 'bg-glow-surface text-glow-text shadow-sm'
            : 'text-glow-text-subtle hover:text-glow-text'
        "
        @click="modo = 'criar'"
      >
        Criar manual
      </button>
    </div>

    <BaseAlert v-if="modo === 'convite'" variant="info">
      Informe o <strong>e-mail</strong> e a função. Se a pessoa já tem conta ativa e confirmada,
      ela é vinculada na hora. Caso contrário, você recebe um link para copiar e enviar.
    </BaseAlert>

    <BaseAlert v-else-if="modo === 'vincular'" variant="info">
      Use quando a pessoa <strong>já se cadastrou</strong> e confirmou o e-mail na plataforma.
    </BaseAlert>

    <BaseAlert v-else variant="info">
      Opção avançada: você cria a conta com senha inicial. Para o dia a dia, prefira
      <strong>Enviar convite</strong>.
    </BaseAlert>

    <BaseAlert v-if="sucessoDetalhe" variant="success">{{ sucessoDetalhe }}</BaseAlert>

    <BaseCard v-if="linkConvite" title="Link do convite">
      <p class="mb-3 break-all font-urbanist text-sm text-glow-text-subtle">{{ linkConvite }}</p>
      <BaseButton variant="secondary" size="sm" @click="copiarLink">Copiar link</BaseButton>
    </BaseCard>

    <BaseCard v-if="ready && !linkConvite">
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <template v-if="modo === 'criar'">
          <BaseInput v-model="nome" label="Nome completo" required placeholder="Maria Silva" />
        </template>

        <BaseInput
          v-model="email"
          label="E-mail"
          type="email"
          placeholder="usuario@exemplo.com"
          required
          :hint="modo === 'vincular' ? 'Informe e-mail ou telefone (pelo menos um).' : undefined"
        />

        <TelefoneInput
          v-if="modo === 'criar'"
          v-model="telefone"
          label="Telefone"
          required
        />
        <BaseInput
          v-else-if="modo === 'vincular'"
          v-model="telefone"
          label="Telefone"
          type="tel"
          placeholder="(11) 99999-9999"
        />

        <template v-if="modo === 'criar'">
          <BaseInput
            v-model="senha"
            label="Senha inicial"
            type="password"
            required
            autocomplete="new-password"
          />
          <AuthPasswordRules :password="senha" />
          <BaseInput
            v-model="confirmarSenha"
            label="Confirmar senha"
            type="password"
            required
            autocomplete="new-password"
          />
        </template>

        <div>
          <label class="mb-1 block font-urbanist text-sm font-medium text-glow-text">Função</label>
          <select
            v-model="role"
            class="w-full rounded-lg border border-glow-border-soft bg-glow-surface px-3 py-2 font-urbanist text-sm text-glow-text"
            required
          >
            <option v-for="r in ROLES_CADASTRO_EQUIPE" :key="r.value" :value="r.value">
              {{ r.label }}
            </option>
          </select>
          <p v-if="roleSelecionada" class="mt-1 font-urbanist text-xs text-glow-text-subtle">
            {{ roleSelecionada.description }}
          </p>
        </div>

        <template v-if="ehProfissional">
          <BaseInput
            v-model="nomePublico"
            label="Nome público"
            :placeholder="
              modo === 'convite' || modo === 'criar'
                ? 'Opcional — usa o nome no cadastro'
                : 'Como aparecerá para os clientes'
            "
          />
          <label class="flex cursor-pointer items-center gap-3 font-urbanist text-sm text-glow-text">
            <input
              v-model="podeReceberAgendamento"
              type="checkbox"
              class="rounded border-glow-border-soft"
            />
            Pode receber agendamentos
          </label>
        </template>

        <div class="flex flex-wrap gap-3">
          <BaseButton type="submit" :loading="saving">
            {{
              modo === 'convite'
                ? 'Gerar convite'
                : modo === 'criar'
                  ? ehProfissional
                    ? 'Criar conta e convidar'
                    : 'Criar conta'
                  : ehProfissional
                    ? 'Vincular profissional'
                    : 'Vincular usuário'
            }}
          </BaseButton>
          <RouterLink :to="ROUTE_PATHS.CONFIG_EQUIPE">
            <BaseButton variant="secondary">Cancelar</BaseButton>
          </RouterLink>
        </div>
      </form>
    </BaseCard>

    <div v-if="linkConvite" class="flex flex-wrap gap-3">
      <RouterLink :to="ROUTE_PATHS.CONFIG_EQUIPE_CONVITES">
        <BaseButton variant="secondary">Ver convites pendentes</BaseButton>
      </RouterLink>
      <RouterLink :to="ROUTE_PATHS.CONFIG_EQUIPE">
        <BaseButton variant="secondary">Voltar à equipe</BaseButton>
      </RouterLink>
    </div>
  </div>
</template>

