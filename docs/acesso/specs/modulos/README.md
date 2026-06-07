# Specs de modulos — UI

Cada modulo mapeia para itens de menu, rotas e chamadas API. Enforcement real e na API — o frontend espelha para UX.

## Matriz modulo x menu x plano

| Modulo | Plano min | Menu / area | Rota sugerida | Spec |
|--------|:---------:|-------------|---------------|------|
| Estabelecimento | Ativa | Config > Perfil negocio | `/configuracoes/perfil` | *(base)* |
| Assinatura | Ativa | Config > Assinatura | `/configuracoes/assinatura` | [assinatura.md](./assinatura.md) |
| Agenda | Basic | Agenda | `/agenda` | [agenda.md](./agenda.md) |
| Servicos | Basic | Servicos | `/servicos` | [servicos.md](./servicos.md) |
| HorariosAtendimento | Basic | Config > Horarios | `/configuracoes/horarios` | [horarios-atendimento.md](./horarios-atendimento.md) |
| Notificacoes | Basic | Infra (sem menu) | — | *(interno)* |
| Email | Basic | Infra (sem menu) | — | *(interno)* |
| Profissionais | Plus | Config > Equipe | `/configuracoes/equipe` | [profissionais.md](./profissionais.md) |
| WhatsApp | Plus | Config > WhatsApp | `/configuracoes/whatsapp` | [whatsapp.md](./whatsapp.md) |
| Caixa | Premium | Financeiro > Caixa | `/financeiro/caixa` | [caixa.md](./caixa.md) |
| Financeiro | Premium | Financeiro | `/financeiro` | [financeiro.md](./financeiro.md) |
| ComissaoProfissionais | Premium | Financeiro > Comissoes | `/financeiro/comissoes` | *(ver financeiro)* |

## Modulos internos (sem tela)

### Notificacoes

- Infra de notificacoes in-app (`AppNotifications`).
- Nao exibir gate separado.

### Email

- Confirmacao, lembrete e cancelamento por e-mail ao cliente.
- Indicador em configuracoes de agendamento: "E-mail automatico ativo" quando modulo presente.

### Estabelecimento

- Perfil do negocio, endereco, logo.
- Permissao tipica: `NegocioEditar`.

---

## Permissoes x acoes (resumo)

Alem do modulo, cada acao exige permissao da role no estabelecimento:

| Modulo | Permissoes comuns |
|--------|-------------------|
| Agenda | `AgendaVisualizarGeral`, `AgendaVisualizarPropria`, `AgendaCriar`, `AgendaCancelar` |
| Servicos | `ServicoVisualizar`, `ServicoGerenciar` |
| Horarios | `HorarioVisualizar`, `HorarioGerenciar` |
| Profissionais | `EquipeGerenciar`, `ProfissionalConvidar` |
| Caixa | `CaixaVisualizar` |

Profissional da equipe: agenda propria com `AgendaVisualizarPropria` apenas.

---

## Prefixo API

Rotas de negocio: `/api/estabelecimentos/{estabelecimentoId}/...`

O `estabelecimentoId` vem da `negocio.store`.
