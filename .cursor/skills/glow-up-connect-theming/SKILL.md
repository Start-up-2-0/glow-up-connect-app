---
name: glow-up-connect-theming
description: >-
  Garante que componentes Vue e estilos do glow-up-connect-app funcionem em
  light mode e dark mode. Usar ao criar ou editar componentes, views, layouts,
  CSS/Tailwind, tokens de cor, BaseAlert, formulários e qualquer UI visual.
---

# Glow Up Connect — Theming (Light + Dark)

Todo componente criado ou alterado **deve** funcionar nos dois temas sem regressão visual.

## Sistema de cores do projeto

| Camada | Onde | Uso |
|--------|------|-----|
| CSS variables | `src/assets/main.css` (`:root` + `.dark`) | Fonte de verdade |
| Tailwind | `bg-glow-*`, `text-glow-*`, `border-glow-*` | Preferir sempre |
| Classes utilitárias | `checkout-*` em `main.css` | Tabs, cards de checkout |

`darkMode: 'class'` no Tailwind — a classe `.dark` no `<html>` alterna o tema.

## Regras obrigatórias

### 1. Usar tokens semânticos `glow-*`

```vue
<!-- Correto -->
<div class="bg-glow-surface text-glow-text border-glow-border-soft">

<!-- Errado — quebra em um dos temas -->
<div class="bg-white text-gray-900 border-gray-200">
```

Tokens principais:

- **Fundo página**: `bg-glow-canvas`
- **Cards / painéis**: `bg-glow-surface`
- **Hover em superfície**: `bg-glow-hover-surface`
- **Texto primário**: `text-glow-text`
- **Texto secundário**: `text-glow-text-subtle` ou `text-glow-text-muted`
- **Bordas**: `border-glow-border-soft`
- **CTA / destaque**: `bg-glow-gold`, `text-glow-gold`, `bg-glow-gold-soft`
- **Placeholder**: `placeholder:text-glow-placeholder`

### 2. Estados semânticos (sucesso, erro, aviso, info)

Use pares `light` + `dark:` ou classes já definidas:

```vue
<!-- Padrão do projeto -->
<p class="text-red-600 dark:text-red-400">Erro</p>
<div class="border-red-200 bg-red-50 dark:border-red-800/50 dark:bg-red-950/35 dark:text-red-300">
```

Reutilize `BaseAlert` com variantes — não reinvente cores de feedback.

### 3. Inputs e selects nativos

```vue
class="w-full rounded-lg border border-glow-border-soft bg-glow-surface px-3 py-2
       font-urbanist text-sm text-glow-text
       placeholder:text-glow-placeholder
       focus:border-glow-gold focus:ring-1 focus:ring-glow-gold/40"
```

Checkboxes/radios: `border-glow-border-soft bg-glow-surface text-glow-gold`.

### 4. Componentes base antes de estilos ad hoc

Prioridade ao criar UI:

1. `BaseButton`, `BaseInput`, `BaseCard`, `BaseAlert`
2. `SegmentedControl` (tabs com `checkout-tabs`)
3. Classes `checkout-*` em `main.css`
4. Só então classes Tailwind pontuais

### 5. Proibido sem justificativa

- `bg-white`, `bg-black`, `text-gray-*`, `border-gray-*` isolados
- Cores hex inline (`style="color: #282828"`)
- Imagens/ícones que só contrastam em um tema
- `shadow-*` forte sem testar nos dois modos

### 6. Quando `dark:` é aceitável

Use `dark:` **somente** para:

- Cores de status (vermelho, verde, âmbar, azul) que não têm token `glow-*`
- Opacidades/bordas finas que precisam de ajuste fino
- Overlays e modais com backdrop

Não use `dark:` para substituir `bg-glow-surface` — o token já resolve.

## Checklist antes de entregar componente

```
- [ ] Usa tokens glow-* para fundo, texto e borda
- [ ] Testado mentalmente em light (:root) e dark (.dark)
- [ ] Estados hover/focus/disabled legíveis nos dois temas
- [ ] Alertas/erros com par light + dark:
- [ ] Nenhum bg-white/text-gray hardcoded
- [ ] Reutiliza componentes base quando possível
```

## Padrões de layout

```vue
<!-- Card de formulário -->
<BaseCard>
  <form class="space-y-4">...</form>
</BaseCard>

<!-- Tabs de modo -->
<SegmentedControl v-model="modo" :options="opcoes" />

<!-- Link de voltar -->
<RouterLink class="inline-flex items-center gap-1.5 font-urbanist text-sm text-glow-text-subtle transition hover:text-glow-text">
```

## Alertas, validações e notificações

Escolha o **nível correto** — nunca empilhar toast + alerta inline para o mesmo erro.

| Tipo | Componente | Quando usar |
|------|------------|-------------|
| Toast global | `ToastContainer` (via `notifications.push`) | Ações concluídas, feedback rápido sem campo associado |
| Erro de página | `ContentAlert` | Falha ao carregar lista/dados — **logo abaixo do título ou abas** |
| Erro de formulário | `ContentAlert compact` no topo do `<form>` | Erro de API no submit |
| Erro de campo | `BaseInput` / `TelefoneInput` prop `error` | Validação do campo — mensagem via `FieldMessage` |

Regras:

- Toasts ficam em `.toast-stack` (fixo no topo direito) — **nunca** no fluxo do documento.
- Campos usam `.field-group` (`gap-1`) + `.field-input--error` quando inválidos.
- `ContentAlert` usa `.content-alert` (`mb-4`) para espaçamento previsível.
- Erros de carregamento de view: `loadError` inline, **não** `notifications.push('error')`.
- Validação client-side: prop `error` no campo, não toast.

```vue
<!-- Campo -->
<BaseInput v-model="email" label="E-mail" :error="emailError" />

<!-- Erro de submit no formulário -->
<form class="space-y-4">
  <ContentAlert v-if="formError" variant="error" compact>{{ formError }}</ContentAlert>
  ...
</form>

<!-- Erro ao carregar página -->
<ContentAlert v-if="loadError" variant="error" title="Erro ao carregar dados" compact>
  {{ loadError }}
</ContentAlert>
```

## Referência rápida de variáveis

| Token CSS | Light | Dark |
|-----------|-------|------|
| `--glow-canvas` | `#e5e5e5` | `#161616` |
| `--glow-surface` | `#f3f3f3` | `#242424` |
| `--glow-text` | `#282828` | `#f3f3f3` |
| `--glow-border-soft` | rgba escuro 25% | rgba claro 15% |

Arquivo completo: `src/assets/main.css`.

## Layout do dashboard (scroll único)

- Shell: `.dashboard-shell` com `h-dvh overflow-hidden`
- Coluna de conteúdo e `<main class="dashboard-main">` precisam de `min-h-0`
- **Somente** `.dashboard-main` usa `overflow-y-auto` — nunca o `body` junto
- Sidebar: `nav` com `flex-1 min-h-0 overflow-y-auto` (scroll isolado do menu)
- Páginas: `.page-shell--form` (`max-w-4xl`) ou `.page-shell` (largura total)

```vue
<!-- DashboardLayout já aplica dashboard-main__inner -->
<div class="page-shell--form space-y-6">...</div>
```

## Integração com outras skills

Ao criar views ou componentes UI, carregar também `glow-up-connect-frontend` para estrutura de pastas e convenções Vue 3.
