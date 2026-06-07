# Spec UI — Modulo Assinatura

## Gate

- `modulos[]` contem `Assinatura`
- `assinaturaAtiva === true`

## Rotas

| Rota | Tela |
|------|------|
| `/configuracoes/assinatura` | Resumo do plano e status |
| `/configuracoes/assinatura/faturas` | Historico de cobrancas |
| `/configuracoes/assinatura/upgrade` | Troca de plano |
| `/onboarding/planos` | Pre-contratacao (sem modulo ainda) |

## APIs

| Acao | Metodo | Rota |
|------|--------|------|
| Iniciar | POST | `/api/assinaturas` |
| Trocar plano | POST | `/api/assinaturas/{id}/trocar-plano` |
| Cancelar | POST | `/api/assinaturas/{id}/cancelar` |
| Cobrancas | GET | `/api/assinaturas/{id}/cobrancas` |
| Contexto | GET | `/api/usuario/me/estabelecimentos` |

Specs: [onboarding-assinatura.md](../onboarding-assinatura.md), [cobrancas-assinatura.md](../cobrancas-assinatura.md).

## Componentes

| Componente | Dados |
|------------|-------|
| `AssinaturaResumoCard` | planoNome, status, diaVencimento, proximas datas |
| `AssinaturaStatusBadge` | Trial / Ativa / Pendente / Cancelada |
| `PlanoUpgradeModal` | lista de planos superiores |
| `CancelarAssinaturaDialog` | confirmacao destructive |

## Estados vazios

| Situacao | UI |
|----------|-----|
| Sem assinatura | Redirect `/onboarding/planos` |
| Pendente pagamento | Card com CTA "Concluir pagamento" |
| Trial | Banner + link para faturas futuras |

## Criterios de aceite

- [ ] Owner ve todas as acoes; Manager pode ser read-only (produto).
- [ ] Cancelar exige confirmacao em duas etapas.
- [ ] Apos troca de plano, refetch estabelecimentos.
