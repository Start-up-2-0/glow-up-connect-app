---
name: glow-up-connect-dashboard-theming
description: >-
  Garante que layouts, views e componentes do dashboard (área logada) funcionem
  em light mode e dark mode. Usar ao criar ou editar DashboardLayout, views em
  src/views/, componentes de onboarding logado, wizards, formulários no painel,
  tokens ONBOARDING_CONTRATAR_*, classes onboarding-contratar-* ou quando o
  usuário reportar tema escuro quebrado no dashboard.
---

# Glow Up Connect — Dashboard Theming (Light + Dark)

**Regra do projeto:** todo layout dentro do dashboard (`DashboardLayout`) deve funcionar nos dois temas — tema original (light) e dark — sem regressão visual.

Carregar também `glow-up-connect-theming` para tokens globais e checklist geral.

## Problema conhecido (não repetir)

A tela **Contratar Plano** (`/onboarding/contratar`) foi implementada com cores fixas do Figma (`bg-[#e5e5e5]`, `bg-white`, `bg-[#f3f3f3]`). Com dark mode ativo, os textos (`text-glow-text`) mudavam para claro, mas fundos permaneciam brancos — labels ficavam invisíveis.

**Causa:** tokens e classes com hex/`bg-white` em fluxo **logado**, que deve seguir o tema global.

## O que segue o tema vs. o que é fixo light

| Área | Segue dark mode? | Padrão |
|------|------------------|--------|
| Dashboard (`DashboardLayout`, sidebar, `dashboard-main`) | Sim | `bg-glow-canvas`, `bg-glow-surface` |
| Views em `src/views/` dentro do dashboard | Sim | tokens `glow-*` |
| Onboarding logado (`variant !== 'public'`) | Sim | `ONBOARDING_CONTRATAR_*` com tokens semânticos |
| Auth (`/login`, `/cadastro`, recuperação) | Não | `.auth-light-shell` — Figma fixo light |
| Agendamento público (`/agendar/*`) | Não | `.agendar-publico-shell` — Figma fixo light |
| Onboarding público (`/onboarding/assinatura`) | Não | layout público com shell light |

## Tokens corretos para dashboard

```ts
// designTokens.ts — dashboard / Contratar Plano
ONBOARDING_CONTRATAR_PAGE_CLASS   → bg-glow-canvas
ONBOARDING_CONTRATAR_CARD_CLASS   → bg-glow-hover-surface border-glow-border-soft
ONBOARDING_CONTRATAR_INPUT_CLASS  → bg-glow-hover-surface text-glow-text placeholder:text-glow-placeholder
ONBOARDING_CONTRATAR_BTN_SECONDARY → bg-glow-surface (não bg-[#f3f3f3])
```

```css
/* main.css — classes onboarding-contratar-* */
.onboarding-contratar-checkout-shell → bg-glow-hover-surface
.onboarding-contratar-plan-card      → bg-glow-surface-tint
.onboarding-contratar-vencimento-btn → bg-glow-surface
```

## Proibido no dashboard (sem `.auth-light-shell` ou shell público)

- `bg-white`, `bg-black`, `bg-[#e5e5e5]`, `bg-[#f3f3f3]`, `bg-zinc-*`
- `text-zinc-*`, `text-gray-*` para texto principal
- `rgba(40,40,40,0.04)` fixo — usar `bg-glow-surface-tint`
- Copiar tokens de auth (`GLOW_INPUT_CLASS`, `GLOW_LOGIN_PAGE_CLASS`) em views logadas

## Checklist ao criar/editar tela no dashboard

```
- [ ] Fundo da página: bg-glow-canvas (não hex do Figma)
- [ ] Cards/painéis: bg-glow-hover-surface ou bg-glow-surface
- [ ] Texto: text-glow-text / text-glow-text-subtle / text-glow-text-muted
- [ ] Bordas: border-glow-border-soft
- [ ] Inputs: bg-glow-hover-surface + placeholder:text-glow-placeholder
- [ ] Botão secundário: bg-glow-surface, não cinza fixo
- [ ] CTA dourado (#e6ad01): aceitável — cor de marca, texto branco
- [ ] Testar mentalmente com .dark no <html>
- [ ] Não usar auth-light-shell nesta view
```

## Figma → código no dashboard

O Figma do Contratar Plano usa fundo `#e5e5e5` e cards brancos no **tema light**. No código:

| Figma (light) | Token Tailwind | Dark automático |
|---------------|----------------|-----------------|
| `#e5e5e5` fundo | `bg-glow-canvas` | `#161616` |
| `#ffffff` card | `bg-glow-hover-surface` | `#2e2e2e` |
| `#f3f3f3` botão voltar | `bg-glow-surface` | `#242424` |
| `#282828` texto | `text-glow-text` | `#f3f3f3` |

Não copiar hex do Figma direto em views do dashboard.

## Arquivos frequentes

- `src/constants/designTokens.ts` — `ONBOARDING_CONTRATAR_*`
- `src/assets/main.css` — `.onboarding-contratar-*`, `.dashboard-main`, `.panel-shell`
- `src/components/onboarding/OnboardingAssinaturaShell.vue` — shell logado
- `src/layouts/DashboardLayout.vue` — wrapper do dashboard

## Fluxo de correção

1. Buscar `bg-white`, `bg-[#`, `text-zinc`, `rgba(40,40,40` em `src/views/` e componentes usados só no dashboard
2. Substituir por tokens `glow-*` conforme tabela acima
3. Mover estilos repetidos para `main.css` com `@apply` semântico
4. Rodar `npm run build`
5. Verificar Contratar Plano e outras views afetadas nos dois temas
