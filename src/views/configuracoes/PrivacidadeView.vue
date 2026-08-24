<script setup lang="ts">
import { ref } from 'vue'
import { Cookie, Download, Mail, ShieldAlert, ExternalLink, CheckCircle2 } from 'lucide-vue-next'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useApiError } from '@/composables/useApiError'
import { useAuth } from '@/composables/useAuth'
import { useConsent } from '@/composables/useConsent'
import { privacidadeService } from '@/services/privacidadeService'
import { legalUrl } from '@/utils/landingUrl'
import GlowGuideLauncher from '@/tutorials/components/GlowGuideLauncher.vue'
import { usePageTutorial } from '@/tutorials/hooks/usePageTutorial'

const { startPageTutorial } = usePageTutorial('preferences')

const notifications = useNotificationsStore()
const negocioStore = useNegocioStore()
const { logout } = useAuth()
const { resolveError } = useApiError()
const {
  hasThirdPartyConsent,
  hasTermsAccepted,
  openPreferences,
  revokeThirdPartyConsent,
} = useConsent()
const exportando = ref(false)
const dialogoExclusaoAberto = ref(false)
const senhaExclusao = ref('')
const exclusaoLoading = ref(false)
const exclusaoErro = ref('')
const comunicacoesAtivas = ref(true)

const isOwner = () => negocioStore.role === 'Owner'

function abrirDialogoExclusao() {
  senhaExclusao.value = ''
  exclusaoErro.value = ''
  dialogoExclusaoAberto.value = true
}

function fecharDialogoExclusao() {
  if (exclusaoLoading.value) return
  dialogoExclusaoAberto.value = false
}

async function exportarDados() {
  exportando.value = true
  try {
    const { data } = await privacidadeService.exportarMeusDados()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'glow-up-connect-meus-dados.json'
    link.click()
    URL.revokeObjectURL(url)
    notifications.push('success', 'Exportação concluída.')
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    exportando.value = false
  }
}

async function confirmarExclusao() {
  exclusaoErro.value = ''
  if (!senhaExclusao.value.trim()) {
    exclusaoErro.value = 'Informe sua senha para confirmar.'
    return
  }

  exclusaoLoading.value = true
  try {
    await privacidadeService.solicitarExclusao(senhaExclusao.value)
    dialogoExclusaoAberto.value = false
    notifications.push(
      'success',
      'Exclusão solicitada. Você tem 30 dias para reativar a conta pelo login.',
    )
    await logout()
  } catch (err) {
    exclusaoErro.value = resolveError(err, 'Não foi possível solicitar a exclusão.')
  } finally {
    exclusaoLoading.value = false
  }
}

async function revogarConsentimento() {
  try {
    await privacidadeService.revogarConsentimento()
    comunicacoesAtivas.value = false
    notifications.push('success', 'Consentimento revogado.')
  } catch (err) {
    notifications.push('error', resolveError(err))
  }
}

function revogarCookiesTerceiros() {
  revokeThirdPartyConsent()
  notifications.push('info', 'Cookies de terceiros desativados. Pagamentos e busca de CEP automática ficam indisponíveis.')
}
</script>

<template>
  <div class="privacy-page" data-tour="preferences-page">
    <header class="privacy-page__header">
      <div class="min-w-0">
        <h1 class="privacy-page__title">Privacidade e preferências</h1>
        <p class="privacy-page__subtitle">
          Controle como seus dados são usados e exerça seus direitos previstos na LGPD.
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-2">
        <GlowGuideLauncher class="max-sm:hidden" @click="startPageTutorial" />
        <GlowGuideLauncher class="sm:hidden" label="Ver tutorial" @click="startPageTutorial" />
      </div>
    </header>

    <div class="privacy-page__grid">
      <BaseCard class="privacy-card" :padding="false">
        <div class="privacy-card__body">
          <span class="privacy-card__icon privacy-card__icon--accent"><Cookie /></span>
          <div class="privacy-card__content">
            <div class="privacy-card__heading">
              <div>
                <h2>Cookies e serviços externos</h2>
                <p>Defina quais integrações podem processar dados durante o uso da plataforma.</p>
              </div>
              <span class="privacy-status" :class="{ 'privacy-status--active': hasThirdPartyConsent }">
                <CheckCircle2 />
                {{ hasThirdPartyConsent ? 'Terceiros autorizados' : 'Somente essenciais' }}
              </span>
            </div>
            <p v-if="hasTermsAccepted" class="privacy-card__note">Termos de uso aceitos no cadastro.</p>
            <div class="privacy-card__actions">
              <BaseButton size="sm" @click="openPreferences">Gerenciar cookies</BaseButton>
              <BaseButton v-if="hasThirdPartyConsent" variant="secondary" size="sm" @click="revogarCookiesTerceiros">
                Revogar terceiros
              </BaseButton>
            </div>
            <div class="privacy-card__links">
              <a :href="legalUrl('termos-de-uso')" target="_blank" rel="noopener">Termos de uso <ExternalLink /></a>
              <a :href="legalUrl('politica-de-cookies')" target="_blank" rel="noopener">Política de cookies <ExternalLink /></a>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard class="privacy-card" :padding="false">
        <div class="privacy-card__body">
          <span class="privacy-card__icon privacy-card__icon--info"><Mail /></span>
          <div class="privacy-card__content">
            <div class="privacy-card__heading">
              <div>
                <h2>Comunicações</h2>
                <p>Controle mensagens promocionais e outras comunicações não essenciais.</p>
              </div>
              <span class="privacy-status" :class="{ 'privacy-status--active': comunicacoesAtivas }">
                {{ comunicacoesAtivas ? 'Ativas' : 'Revogadas' }}
              </span>
            </div>
            <div class="privacy-card__actions">
              <BaseButton variant="secondary" size="sm" :disabled="!comunicacoesAtivas" @click="revogarConsentimento">
                {{ comunicacoesAtivas ? 'Revogar consentimento' : 'Consentimento revogado' }}
              </BaseButton>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard class="privacy-card" :padding="false">
        <div class="privacy-card__body">
          <span class="privacy-card__icon privacy-card__icon--success"><Download /></span>
          <div class="privacy-card__content">
            <div class="privacy-card__heading">
              <div>
                <h2>Seus dados e portabilidade</h2>
                <p>Baixe uma cópia dos dados cadastrais associados à sua conta.</p>
              </div>
              <span class="privacy-status">Arquivo JSON</span>
            </div>
            <p class="privacy-card__note">O arquivo é gerado no momento e baixado diretamente neste dispositivo.</p>
            <div class="privacy-card__actions">
              <BaseButton size="sm" :loading="exportando" @click="exportarDados">
                <Download class="privacy-button-icon" />
                {{ exportando ? 'Preparando arquivo…' : 'Exportar meus dados' }}
              </BaseButton>
            </div>
          </div>
        </div>
      </BaseCard>

      <BaseCard class="privacy-card privacy-card--danger" :padding="false">
        <div class="privacy-card__body">
          <span class="privacy-card__icon privacy-card__icon--danger"><ShieldAlert /></span>
          <div class="privacy-card__content">
            <div class="privacy-card__heading">
              <div>
                <h2>Zona de risco</h2>
                <p>Solicite a exclusão permanente da sua conta e dos dados pessoais vinculados.</p>
              </div>
              <span class="privacy-status privacy-status--danger">Ação irreversível</span>
            </div>
            <p class="privacy-card__note">
              Você terá 30 dias para reativar a conta pelo login. Depois desse prazo, os dados são
              anonimizados, respeitando obrigações legais de retenção.
            </p>
            <div class="privacy-card__actions">
              <BaseButton variant="danger" size="sm" @click="abrirDialogoExclusao">Solicitar exclusão</BaseButton>
            </div>
          </div>
        </div>
      </BaseCard>
    </div>

    <Teleport to="body">
      <div
        v-if="dialogoExclusaoAberto"
        class="fixed inset-0 z-[3000] flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="exclusao-titulo"
      >
        <div class="absolute inset-0 glow-modal-scrim" @click="fecharDialogoExclusao" />
        <div class="relative z-10 w-full max-w-md rounded-lg border border-glow-border-soft bg-glow-surface p-6 shadow-xl">
          <h2 id="exclusao-titulo" class="mb-2 font-urbanist text-lg font-semibold text-glow-text">
            Excluir sua conta?
          </h2>
          <p class="mb-3 text-sm text-glow-text-subtle">
            A exclusão não é imediata. Você terá 30 dias para reativar a conta com e-mail e senha.
          </p>
          <p v-if="isOwner()" class="mb-4 text-sm text-glow-text-subtle">
            Como dono, a loja sai do Explorar, a equipe não consegue operar e a assinatura fica
            suspensa no mesmo prazo. Reativar restaura tudo.
          </p>
          <p v-else class="mb-4 text-sm text-glow-text-subtle">
            Apenas a sua conta pessoal entra no prazo de exclusão. A loja em que você trabalha
            continua ativa.
          </p>
          <BaseInput
            v-model="senhaExclusao"
            type="password"
            label="Confirme com sua senha"
            autocomplete="current-password"
            :error="exclusaoErro"
          />
          <div class="mt-6 flex justify-end gap-2">
            <BaseButton variant="ghost" :disabled="exclusaoLoading" @click="fecharDialogoExclusao">
              Cancelar
            </BaseButton>
            <BaseButton variant="danger" :loading="exclusaoLoading" @click="confirmarExclusao">
              Confirmar exclusão
            </BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.privacy-page { display: flex; flex-direction: column; gap: 24px; padding-bottom: 28px; }
.privacy-page__header { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 12px; border-bottom: 1px solid var(--glow-border-soft); padding-bottom: 20px; }
.privacy-page__title { font-family: Satoshi, sans-serif; font-size: 24px; font-weight: 700; color: var(--glow-text); }
.privacy-page__subtitle { margin-top: 4px; max-width: 680px; font-family: Urbanist, sans-serif; font-size: 14px; color: var(--glow-text-subtle); }
.privacy-page__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.privacy-card { min-width: 0; overflow: hidden; }
.privacy-card--danger { border-color: color-mix(in srgb, var(--glow-error) 34%, var(--glow-border-soft)); background: color-mix(in srgb, var(--glow-error-bg) 35%, var(--glow-bg-elevated)); }
.privacy-card__body { display: flex; align-items: flex-start; gap: 14px; padding: 20px; }
.privacy-card__icon { display: inline-flex; width: 42px; height: 42px; flex: 0 0 auto; align-items: center; justify-content: center; border-radius: 12px; }
.privacy-card__icon svg { width: 20px; height: 20px; }
.privacy-card__icon--accent { background: var(--glow-gold-selected); color: var(--glow-gold-dark); }
.privacy-card__icon--info { background: var(--glow-info-bg); color: var(--glow-info); }
.privacy-card__icon--success { background: var(--glow-success-bg); color: var(--glow-success-dark); }
.privacy-card__icon--danger { background: var(--glow-error-bg); color: var(--glow-error); }
.privacy-card__content { min-width: 0; flex: 1; }
.privacy-card__heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.privacy-card__heading h2 { font-family: Satoshi, sans-serif; font-size: 16px; font-weight: 700; color: var(--glow-text); }
.privacy-card__heading p { margin-top: 4px; font-family: Urbanist, sans-serif; font-size: 13px; line-height: 1.5; color: var(--glow-text-subtle); }
.privacy-status { display: inline-flex; flex: 0 0 auto; align-items: center; gap: 5px; border-radius: 999px; background: var(--glow-neutral-bg); padding: 5px 9px; font-family: Urbanist, sans-serif; font-size: 11px; font-weight: 600; color: var(--glow-text-subtle); }
.privacy-status svg { width: 12px; height: 12px; }
.privacy-status--active { background: var(--glow-success-bg); color: var(--glow-success-dark); }
.privacy-status--danger { background: var(--glow-error-bg); color: var(--glow-error); }
.privacy-card__note { margin-top: 12px; font-family: Urbanist, sans-serif; font-size: 12px; line-height: 1.5; color: var(--glow-text-subtle); }
.privacy-card__actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.privacy-card__links { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--glow-border-soft); }
.privacy-card__links a { display: inline-flex; align-items: center; gap: 4px; font-family: Urbanist, sans-serif; font-size: 12px; font-weight: 600; color: var(--glow-gold-dark); }
.privacy-card__links a:hover { text-decoration: underline; }
.privacy-card__links svg, .privacy-button-icon { width: 14px; height: 14px; margin-right: 6px; }
@media (max-width: 900px) { .privacy-page__grid { grid-template-columns: 1fr; } }
@media (max-width: 639px) {
  .privacy-page { gap: 18px; }
  .privacy-page__header { flex-direction: column; padding-bottom: 18px; }
  .privacy-page__title { font-size: 22px; }
  .privacy-card__body { padding: 16px; }
  .privacy-card__heading { flex-direction: column; gap: 10px; }
  .privacy-status { align-self: flex-start; }
  .privacy-card__actions :deep(button) { width: 100%; }
}
</style>
