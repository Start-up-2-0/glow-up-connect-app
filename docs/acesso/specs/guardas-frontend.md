# Spec — Guardas de modulo e permissao (frontend)

## Objetivo

Padronizar como o Vue Router, sidebar e botoes respeitam `modulos[]` e `permissoes[]` do contexto de negocio.

---

## Dados de entrada

`GET /api/usuario/me/estabelecimentos` (auth obrigatoria):

```json
[
  {
    "estabelecimentoId": 12,
    "publicGuid": "a1b2c3d4-...",
    "nome": "Studio Glow",
    "logo": "",
    "role": "Owner",
    "possuiVinculoProfissional": false,
    "permissoes": ["AgendaVisualizarGeral", "ServicoGerenciar", "NegocioEditar"],
    "assinaturaAtiva": true,
    "assinaturaId": 5,
    "planoId": 1,
    "planoNome": "Basic",
    "modulos": ["Estabelecimento", "Assinatura", "Agenda", "Servicos", "HorariosAtendimento", "Notificacoes", "Email"]
  }
]
```

---

## Composable `useNegocioContext`

Responsabilidades:

- Carregar lista no login / troca de usuario.
- Persistir `estabelecimentoId` selecionado (localStorage).
- Expor getters: `modulos`, `permissoes`, `assinaturaAtiva`, `planoNome`, `role`.

```ts
function possuiModulo(modulo: string): boolean
function possuiPermissao(permissao: string): boolean
function podeAcessar(modulo: string, permissao?: string): boolean
```

---

## Router meta sugerida

```ts
meta: {
  requiresAuth: true,
  businessOnly: true,
  requerModulo: 'Agenda',           // opcional
  requerPermissao: 'AgendaCriar',  // opcional
}
```

Guard `negocio.guard.ts`:

1. Se `!assinaturaAtiva` → redirect `/onboarding/planos` ou paywall.
2. Se `requerModulo` ausente em `modulos[]` → redirect `/upgrade?modulo=Agenda`.
3. Se `requerPermissao` ausente → redirect `/dashboard` + toast.

---

## Sidebar (`navigation.ts`)

Hoje `businessNavItems` e estatico. Evolucao:

| Item atual | Modulo exigido | Permissao tipica |
|------------|----------------|------------------|
| Dashboard | — | — |
| Clientes | — | *(futuro)* |
| Estabelecimentos | Estabelecimento | NegocioEditar |
| Agenda | Agenda | AgendaVisualizarGeral ou AgendaVisualizarPropria |
| Financeiro | Caixa ou Financeiro | CaixaVisualizar |
| Config > Equipe | Profissionais | EquipeGerenciar |
| Config > Assinatura | Assinatura | — |

Funcao `filterNavItems(navItems, context)` retorna apenas itens permitidos.

---

## Componente `ModuloGate`

Wrapper para esconder blocos de UI:

```vue
<ModuloGate modulo="WhatsApp" upgrade-plano="Plus">
  <WhatsAppSettings />
</ModuloGate>
```

Comportamento:

- Com modulo: renderiza slot.
- Sem modulo: slot `fallback` ou card de upgrade padrao.

---

## Interceptor HTTP

Ao receber 403 com `code: SUBSCRIPTION_MODULE_BLOCKED`:

- Nao fazer logout.
- Opcional: abrir modal de upgrade com plano sugerido.
- Registrar evento analytics `module_blocked`.

---

## Matriz upgrade sugerido

| Modulo bloqueado | Plano minimo | Mensagem |
|------------------|--------------|----------|
| Profissionais | Plus | "Convide sua equipe com o plano Plus" |
| WhatsApp | Plus | "Alertas automaticos no WhatsApp" |
| Caixa | Premium | "Controle de caixa no Premium" |
| Financeiro | Premium | "Fluxo financeiro no Premium" |
| ComissaoProfissionais | Premium | "Comissoes automaticas no Premium" |

---

## Criterios de aceite

- [ ] Troca de estabelecimento na navbar recarrega menu.
- [ ] Profissional com `AgendaVisualizarPropria` ve agenda mas nao equipe.
- [ ] Rota direta `/financeiro` no Basic redireciona para upgrade.
- [ ] Erro 403 de modulo nao dispara refresh de token.
