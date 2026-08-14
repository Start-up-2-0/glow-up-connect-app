# Specs — Modulos e assinatura (frontend)

Especificacoes para implementar no **glow-up-connect-app** o catalogo de planos, onboarding de assinatura, guardas de modulo e menus operacionais.

Fonte de verdade da API: repositorio `glow-up-connect-api` em `docs/acesso/specs/`.

Convencoes HTTP: [../../frontend/convencoes.md](../../frontend/convencoes.md)

---

## Documentos

| Documento | Conteudo |
|-----------|----------|
| [liberacao-modulos.md](./liberacao-modulos.md) | Quando liberar menu, rotas e acoes |
| [guardas-frontend.md](./guardas-frontend.md) | Store, composables, router meta e erros 403 |
| [onboarding-assinatura.md](./onboarding-assinatura.md) | Fluxo completo de contratacao (trial e pago) |
| [payload-assinatura.md](./payload-assinatura.md) | Payload completo POST /api/assinaturas |
| [catalogo-planos.md](./catalogo-planos.md) | `GET /api/planos` — vitrine e comparacao |
| [promocao-lancamento.md](./promocao-lancamento.md) | Trial 14 dias — 100 primeiros |
| [ciclo-cobranca.md](./ciclo-cobranca.md) | Dia de vencimento e datas na assinatura |
| [cobrancas-assinatura.md](./cobrancas-assinatura.md) | Historico de faturas do tenant |

### Planos (UI)

| Plano | Preco | Spec |
|-------|------:|------|
| Basic | R$ 29,99 | [planos/basic.md](./planos/basic.md) |
| Plus | R$ 99,90 | [planos/plus.md](./planos/plus.md) |
| Premium | R$ 199,90 | [planos/premium.md](./planos/premium.md) |

### Modulos (menu e rotas)

| Modulo | Plano minimo | Spec |
|--------|:------------:|------|
| Assinatura | Qualquer ativa/Trial | [modulos/assinatura.md](./modulos/assinatura.md) |
| Agenda | Basic | [modulos/agenda.md](./modulos/agenda.md) |
| Servicos | Basic | [modulos/servicos.md](./modulos/servicos.md) |
| HorariosAtendimento | Basic | [modulos/horarios-atendimento.md](./modulos/horarios-atendimento.md) |
| Profissionais | Plus | [modulos/profissionais.md](./modulos/profissionais.md) |
| WhatsApp | Plus | [modulos/whatsapp.md](./modulos/whatsapp.md) |
| Caixa | Premium | [modulos/caixa.md](./modulos/caixa.md) |
| Financeiro | Premium | [modulos/financeiro.md](./modulos/financeiro.md) |

Modulos sem tela dedicada (Email, Notificacoes, Estabelecimento, ComissaoProfissionais): ver matriz em [modulos/README.md](./modulos/README.md).

---

## Regra resumida

```text
Exibir item de menu / rota operacional =
  usuario autenticado
  AND role global != Cliente
  AND contexto de negocio carregado (GET /api/usuario/me/estabelecimentos)
  AND assinaturaAtiva == true   (Status Ativa ou Trial)
  AND modulo necessario em modulos[]
  AND permissao necessaria em permissoes[]   (quando aplicavel)
```

---

## Estado global sugerido

| Store / composable | Responsabilidade |
|--------------------|------------------|
| `negocio.store` | Estabelecimento selecionado, `modulos[]`, `permissoes[]`, `assinaturaAtiva` |
| `planos.store` | Cache de `GET /api/planos` + `promocaoLancamento` |
| `assinatura.store` | Assinatura corrente, cobrancas, ciclo |
| `useModuloGuard(modulo)` | `canAccess`, `upgradePlanoSugerido` |
| `usePermissaoGuard(permissao)` | Checagem fina por acao |

---

## Rotas sugeridas (novas)

| Tela | Rota | Spec |
|------|------|------|
| Escolher plano | `/onboarding/planos` | [catalogo-planos.md](./catalogo-planos.md) |
| Checkout assinatura | `/onboarding/checkout` | [onboarding-assinatura.md](./onboarding-assinatura.md) |
| Assinatura ativa / gestao | `/configuracoes/assinatura` | [modulos/assinatura.md](./modulos/assinatura.md) |
| Faturas | `/configuracoes/assinatura/faturas` | [cobrancas-assinatura.md](./cobrancas-assinatura.md) |
| Upgrade bloqueado | `/upgrade` (modal ou pagina) | [guardas-frontend.md](./guardas-frontend.md) |

---

## Checklist de entrega

- [ ] `GET /api/planos` na vitrine (sem auth)
- [ ] Onboarding com `diaVencimento` e cartao MP (trial ou pago)
- [ ] Pos-login: `GET /api/usuario/me/estabelecimentos` alimenta sidebar
- [ ] Itens de menu filtrados por `modulos[]`
- [ ] Acoes filtradas por `permissoes[]`
- [ ] Tratar `SUBSCRIPTION_MODULE_BLOCKED` com CTA de upgrade
- [ ] Tela de assinatura com status Trial / Ativa / PendentePagamento
- [ ] Listagem de cobrancas autenticada
