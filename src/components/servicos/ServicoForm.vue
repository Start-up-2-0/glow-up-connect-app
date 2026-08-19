<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CurrencyInput from '@/components/ui/CurrencyInput.vue'
import ServicoIcons from '@/components/servicos/ServicoIcons.vue'
import ServicoImagem from '@/components/servicos/ServicoImagem.vue'
import ServicoProfissionalChip from '@/components/servicos/ServicoProfissionalChip.vue'
import ServicoProfissionalSelectModal from '@/components/servicos/ServicoProfissionalSelectModal.vue'
import AuthAvatarUpload from '@/components/auth/AuthAvatarUpload.vue'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { equipeService } from '@/services/equipeService'
import { servicoService } from '@/services/servicoService'
import type { ProfissionalEquipe } from '@/types/negocio/equipe.types'
import type { Servico, TipoServico } from '@/types/negocio/servico.types'
import { compressAvatarFile } from '@/utils/avatarFile'
import { isValidCurrencyValue } from '@/utils/formatters'

const props = withDefaults(
  defineProps<{
    estabelecimentoId: number
    /** Quando informado, carrega e edita; senão cria. */
    servicoId?: number | null
    /** Exibe seleção de profissionais (default: se módulo Profissionais). */
    showProfissionais?: boolean
    submitLabel?: string
    cancelLabel?: string
    showCancel?: boolean
  }>(),
  {
    servicoId: null,
    showProfissionais: undefined,
    submitLabel: 'Salvar',
    cancelLabel: 'Cancelar',
    showCancel: true,
  },
)

const emit = defineEmits<{
  saved: [servico: Servico]
  cancel: []
}>()

const { possuiModulo } = useNegocioContext()
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const loading = ref(false)
const saving = ref(false)
const notFound = ref(false)
const modalProfissionaisAberto = ref(false)
const equipe = ref<ProfissionalEquipe[]>([])

const form = ref({
  nome: '',
  descricao: '',
  precoBase: 0,
  duracaoMinutos: 30,
  tipoServico: 'Individual' as TipoServico,
})

const imagemPreview = ref<string | null>(null)
const imagemContentType = ref<string | undefined>(undefined)
const imagemAlterada = ref(false)

const profissionaisSelecionados = ref<number[]>([])
const profissionaisIniciais = ref<number[]>([])
const errors = ref<{ nome?: string; precoBase?: string; duracaoMinutos?: string }>({})

const temModuloProfissionais = computed(() =>
  props.showProfissionais === undefined
    ? possuiModulo('Profissionais')
    : props.showProfissionais && possuiModulo('Profissionais'),
)

const isNovo = computed(() => props.servicoId == null)

const tipoOpcoes: Array<{ value: TipoServico; titulo: string; descricao: string }> = [
  {
    value: 'Individual',
    titulo: 'Serviço individual',
    descricao: 'Pode ser selecionado junto com outros serviços no agendamento.',
  },
  {
    value: 'Combo',
    titulo: 'Combo',
    descricao: 'Pacote exclusivo — o cliente não poderá combinar com outros serviços.',
  },
]

const profissionaisDisponiveis = computed(() => equipe.value.filter((p) => p.ativo))

const profissionaisSelecionadosDetalhe = computed(() =>
  profissionaisDisponiveis.value.filter((p) =>
    profissionaisSelecionados.value.includes(p.profissionalId),
  ),
)

function validate(): boolean {
  const next: typeof errors.value = {}
  if (!form.value.nome.trim()) next.nome = 'Nome é obrigatório.'
  if (!isValidCurrencyValue(form.value.precoBase)) next.precoBase = 'Informe um valor válido.'
  const duracao = Number(form.value.duracaoMinutos)
  if (!Number.isFinite(duracao) || duracao < 1) next.duracaoMinutos = 'Duração mínima de 1 minuto.'
  errors.value = next
  return Object.keys(next).length === 0
}

async function loadEquipe() {
  if (!props.estabelecimentoId || !temModuloProfissionais.value) return
  try {
    equipe.value = await equipeService.listarProfissionais(props.estabelecimentoId)
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível carregar a equipe.'))
  }
}

async function loadServico() {
  if (!props.estabelecimentoId || !props.servicoId) return
  loading.value = true
  notFound.value = false
  try {
    const servicos = await servicoService.listar(props.estabelecimentoId)
    const servico = servicos.find((s) => s.id === props.servicoId)
    if (!servico) {
      notFound.value = true
      return
    }
    form.value = {
      nome: servico.nome,
      descricao: servico.descricao ?? '',
      precoBase: servico.precoBase,
      duracaoMinutos: servico.duracaoMinutos,
      tipoServico: servico.tipoServico ?? 'Individual',
    }
    imagemPreview.value = servico.imagem ?? null
    imagemContentType.value = undefined
    imagemAlterada.value = false
    const vinculados = servico.profissionais.filter((p) => p.ativo).map((p) => p.profissionalId)
    profissionaisSelecionados.value = [...vinculados]
    profissionaisIniciais.value = [...vinculados]
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível carregar o serviço.'))
  } finally {
    loading.value = false
  }
}

async function sincronizarProfissionais(estId: number, svcId: number) {
  if (!temModuloProfissionais.value) return
  const atuais = new Set(profissionaisSelecionados.value)
  const iniciais = new Set(profissionaisIniciais.value)
  const payloadBase = {
    preco: form.value.precoBase,
    duracaoMinutos: Number(form.value.duracaoMinutos),
  }
  const paraVincular = [...atuais].filter((id) => !iniciais.has(id))
  const paraDesvincular = [...iniciais].filter((id) => !atuais.has(id))
  await Promise.all([
    ...paraVincular.map((profId) =>
      servicoService.vincularProfissional(estId, svcId, profId, payloadBase),
    ),
    ...paraDesvincular.map((profId) =>
      servicoService.desvincularProfissional(estId, svcId, profId),
    ),
  ])
}

async function handleImagemChange(file: File | null) {
  if (!file) {
    imagemPreview.value = null
    imagemContentType.value = undefined
    imagemAlterada.value = true
    return
  }

  try {
    const compressed = await compressAvatarFile(file)
    imagemPreview.value = compressed.dataUrl
    imagemContentType.value = compressed.contentType
    imagemAlterada.value = true
  } catch (err) {
    notifications.push('error', err instanceof Error ? err.message : 'Imagem inválida.')
  }
}

async function handleSubmit() {
  if (!props.estabelecimentoId || !validate()) return
  saving.value = true
  try {
    const payload = {
      nome: form.value.nome.trim(),
      descricao: form.value.descricao?.trim() || undefined,
      precoBase: form.value.precoBase,
      duracaoMinutos: Number(form.value.duracaoMinutos),
      tipoServico: form.value.tipoServico,
      ...(imagemAlterada.value && imagemPreview.value
        ? { imagem: imagemPreview.value, imagemContentType: imagemContentType.value }
        : {}),
    }

    let salvo: Servico
    if (isNovo.value) {
      salvo = await servicoService.criar(props.estabelecimentoId, payload)
      notifications.push('success', 'Serviço criado.')
    } else {
      salvo = await servicoService.atualizar(props.estabelecimentoId, props.servicoId!, payload)
      notifications.push('success', 'Serviço atualizado.')
    }

    await sincronizarProfissionais(props.estabelecimentoId, salvo.id)
    profissionaisIniciais.value = [...profissionaisSelecionados.value]
    emit('saved', salvo)
  } catch (err) {
    notifications.push('error', resolveError(err, 'Não foi possível salvar o serviço.'))
  } finally {
    saving.value = false
  }
}

function removerProfissional(id: number) {
  profissionaisSelecionados.value = profissionaisSelecionados.value.filter((item) => item !== id)
}

function aplicarProfissionais(ids: number[]) {
  profissionaisSelecionados.value = ids
}

function resetForm() {
  form.value = { nome: '', descricao: '', precoBase: 0, duracaoMinutos: 30, tipoServico: 'Individual' }
  imagemPreview.value = null
  imagemContentType.value = undefined
  imagemAlterada.value = false
  profissionaisSelecionados.value = []
  profissionaisIniciais.value = []
  errors.value = {}
  notFound.value = false
}

watch(
  () => [props.estabelecimentoId, props.servicoId] as const,
  () => {
    if (!props.estabelecimentoId) return
    void loadEquipe()
    if (props.servicoId) void loadServico()
    else resetForm()
  },
  { immediate: true },
)

defineExpose({ resetForm, saving, loading, notFound })
</script>

<template>
  <div>
    <p v-if="notFound" class="font-urbanist text-sm text-glow-text-subtle">
      Serviço não encontrado.
    </p>

    <form
      v-else-if="!loading"
      class="servicos-form-panel"
      @submit.prevent="handleSubmit"
    >
      <div class="servicos-form-panel__fields">
        <div class="servicos-form-field">
          <label class="servicos-form-label" for="servico-nome">Serviço</label>
          <input
            id="servico-nome"
            v-model="form.nome"
            type="text"
            class="servicos-form-input"
            :class="{ 'servicos-form-input--error': !!errors.nome }"
            placeholder="Ex: Corte Buzz Cut com fade"
            required
          />
          <p v-if="errors.nome" class="servicos-form-field__error">{{ errors.nome }}</p>
        </div>

        <div class="servicos-form-panel__row">
          <div class="servicos-form-field servico-form-currency">
            <CurrencyInput
              v-model="form.precoBase"
              label="Preço base"
              required
              :error="errors.precoBase"
            />
          </div>

          <div class="servicos-form-field">
            <label class="servicos-form-label" for="servico-duracao">Duração (em minutos)</label>
            <input
              id="servico-duracao"
              :value="String(form.duracaoMinutos)"
              type="number"
              min="1"
              class="servicos-form-input"
              :class="{ 'servicos-form-input--error': !!errors.duracaoMinutos }"
              placeholder="Ex: 30"
              @input="form.duracaoMinutos = Number(($event.target as HTMLInputElement).value)"
            />
            <p v-if="errors.duracaoMinutos" class="servicos-form-field__error">
              {{ errors.duracaoMinutos }}
            </p>
          </div>
        </div>

        <div class="servicos-form-field">
          <span class="servicos-form-label">Tipo do serviço</span>
          <div class="grid gap-3 sm:grid-cols-2">
            <button
              v-for="opcao in tipoOpcoes"
              :key="opcao.value"
              type="button"
              class="rounded-xl border p-3 text-left transition"
              :class="
                form.tipoServico === opcao.value
                  ? 'border-glow-gold bg-glow-gold/5 ring-2 ring-glow-gold'
                  : 'border-glow-border-soft hover:border-glow-gold/40'
              "
              @click="form.tipoServico = opcao.value"
            >
              <span class="block font-satoshi text-sm font-semibold text-glow-text">{{ opcao.titulo }}</span>
              <span class="mt-1 block font-urbanist text-xs text-glow-text-subtle">{{ opcao.descricao }}</span>
            </button>
          </div>
        </div>

        <div class="servicos-form-field">
          <AuthAvatarUpload
            label="Imagem ilustrativa (opcional)"
            variant="contratar"
            :preview-url="imagemPreview"
            preview-hint="Imagem atual do serviço"
            @change="handleImagemChange"
          />
          <div v-if="imagemPreview" class="mt-3 flex items-center gap-3">
            <ServicoImagem :imagem="imagemPreview" size="lg" />
            <p class="font-urbanist text-xs text-glow-text-subtle">
              Essa imagem aparece na listagem e no agendamento para o cliente.
            </p>
          </div>
        </div>

        <div class="servicos-form-field">
          <label class="servicos-form-label" for="servico-descricao">Descrição (opcional)</label>
          <input
            id="servico-descricao"
            v-model="form.descricao"
            type="text"
            class="servicos-form-input"
            placeholder="Corte de cabelo curto e raspado à máquina"
          />
        </div>

        <div v-if="temModuloProfissionais" class="servicos-form-field">
          <div class="servicos-form-profissionais-header">
            <label class="servicos-form-label">Profissionais</label>
            <button
              type="button"
              class="servicos-btn-outline"
              @click="modalProfissionaisAberto = true"
            >
              <ServicoIcons name="profissionais" />
              Selecionar profissionais
            </button>
          </div>

          <div
            class="servicos-form-profissionais-box"
            :class="{
              'servicos-form-profissionais-box--filled': profissionaisSelecionadosDetalhe.length > 0,
            }"
          >
            <p
              v-if="profissionaisSelecionadosDetalhe.length === 0"
              class="servicos-form-profissionais-placeholder"
            >
              Nenhum profissional selecionado.
            </p>
            <ServicoProfissionalChip
              v-for="prof in profissionaisSelecionadosDetalhe"
              :key="prof.profissionalId"
              :nome="prof.nomePublico"
              removable
              @remove="removerProfissional(prof.profissionalId)"
            />
          </div>
        </div>
      </div>

      <div class="servicos-form-actions">
        <button type="submit" class="servicos-btn-form-primary" :disabled="saving">
          {{ saving ? 'Salvando…' : submitLabel }}
        </button>
        <button
          v-if="showCancel"
          type="button"
          class="servicos-btn-form-secondary"
          :disabled="saving"
          @click="emit('cancel')"
        >
          {{ cancelLabel }}
        </button>
      </div>
    </form>

    <p v-else class="font-urbanist text-sm text-glow-text-subtle">Carregando…</p>

    <ServicoProfissionalSelectModal
      v-if="temModuloProfissionais"
      v-model="modalProfissionaisAberto"
      :profissionais="profissionaisDisponiveis"
      :selected-ids="profissionaisSelecionados"
      @confirm="aplicarProfissionais"
    />
  </div>
</template>
