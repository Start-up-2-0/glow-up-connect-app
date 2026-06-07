# Spec — Promocao de lancamento (frontend)

Campanha **100 primeiros tenants** com **30 dias gratis** (status `Trial`), cartao tokenizado no onboarding.

Dados vem de `GET /api/planos` → `data.promocaoLancamento`.

---

## Objeto `promocaoLancamento`

| Campo | Uso no UI |
|-------|-----------|
| `disponivel` | Exibir banner e copy de trial |
| `vagasRestantes` | Urgencia: "Restam X vagas" |
| `diasTrial` | "30 dias gratis" |
| `diasVencimentoPermitidos` | Options do select de vencimento |
| `diasAntecedenciaAlertaFatura` | Tooltip "Aviso 3 dias antes" |
| `diasAntecedenciaGeracaoCobranca` | Tooltip ciclo de cobranca |

---

## Copy sugerida

**Banner vitrine (disponivel):**

> Lancamento Glow Up Connect — **30 dias gratis** para os 100 primeiros negocios. Restam **{vagasRestantes}** vagas.

**Checkout:**

> Seu cartao sera cadastrado hoje, mas a **primeira cobranca** so apos o periodo de teste. Cancele quando quiser.

**Dashboard (Trial):**

> Periodo de teste — {diasRestantes} dias restantes. Primeira cobranca em {proximaDataVencimento}.

---

## Fluxo UX

```text
disponivel == true
  -> Checkout envia cartao (obrigatorio)
  -> POST /api/assinaturas
  -> Resposta emTrial == true, status Trial
  -> Dashboard liberado imediatamente

disponivel == false OU reserva falhou (fallback API)
  -> Fluxo pago classico (PendentePagamento + pagamentoInicial)
```

O frontend **nao** decide trial — apenas reage ao `emTrial` / `status` da resposta.

---

## Componentes

| Componente | Onde |
|------------|------|
| `PromocaoLancamentoBanner` | Vitrine, landing, checkout |
| `TrialStatusBanner` | Dashboard (persistente ate fim do trial) |
| `DiaVencimentoSelect` | Options de `diasVencimentoPermitidos` |

---

## Calculo `diasRestantes` (cliente)

Usar `proximaDataVencimento` da assinatura (pos-trial) ou `fim` quando API expor:

```ts
// Fallback: diasTrial - dias desde inicio
```

Preferir campos da API quando disponiveis em `AssinaturaResponseDto`.

---

## Criterios de aceite

- [ ] Banner oculto quando `disponivel === false`.
- [ ] Select de vencimento so mostra dias permitidos.
- [ ] Trial nao exibe tela "pagamento pendente".
- [ ] Apos trial, banner muda para "Assinatura ativa" sem relogin.
