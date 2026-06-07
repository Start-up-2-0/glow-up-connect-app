# Spec — Cobrancas / faturas (frontend)

Listagem de pagamentos internos do ciclo de assinatura.

---

## Endpoint

```http
GET /api/assinaturas/{assinaturaId}/cobrancas
```

**Headers:** `x-glow-token`  
**Auth:** usuario dono do tenant (Owner)

**200:**

```json
{
  "success": true,
  "message": "Cobrancas da assinatura listadas com sucesso.",
  "data": [
    {
      "id": 101,
      "valor": 29.99,
      "status": "Pago",
      "moeda": "BRL",
      "tipoCobranca": "Recorrente",
      "numeroCiclo": 2,
      "dataVencimento": "2026-07-10T00:00:00Z",
      "dataGeracao": "2026-07-08T00:00:00Z",
      "cicloInicio": "2026-06-10T00:00:00Z",
      "cicloFim": "2026-07-09T00:00:00Z",
      "gatewayPaymentId": "mp-123",
      "pagoEm": "2026-07-08T14:30:00Z"
    }
  ]
}
```

---

## Rota

`/configuracoes/assinatura/faturas`

Acesso: modulo `Assinatura` + `assinaturaAtiva`.

---

## Tabela UI

| Coluna | Campo |
|--------|-------|
| Ciclo | `numeroCiclo` |
| Periodo | `cicloInicio` — `cicloFim` |
| Vencimento | `dataVencimento` |
| Valor | `valor` + `moeda` |
| Status | `status` (badge) |
| Pago em | `pagoEm` (se Pago) |

---

## Badges de status

| Status | Cor | Label |
|--------|-----|-------|
| Pendente | amarelo | Aguardando pagamento |
| Pago | verde | Pago |
| Recusado | vermelho | Recusado |
| Cancelado | cinza | Cancelado |
| Atrasado | vermelho | Em atraso |

---

## Empty states

- Sem cobrancas (trial inicial): "Nenhuma fatura gerada ainda. Primeira cobranca em {proximaDataVencimento}."
- Erro 403: usuario sem ownership — nao exibir menu.

---

## Service sugerido

```ts
// assinaturaService.ts
listarCobrancas(assinaturaId: number): Promise<CobrancaAssinatura[]>
```

---

## Criterios de aceite

- [ ] Lista ordenada por `numeroCiclo` desc.
- [ ] Status `Atrasado` com destaque visual.
- [ ] Valores em BRL formatados.
- [ ] Loading e erro tratados.
