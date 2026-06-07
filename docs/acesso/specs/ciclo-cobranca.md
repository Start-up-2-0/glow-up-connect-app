# Spec — Ciclo de cobranca (frontend)

Como exibir dia de vencimento, proximas datas e alertas de fatura na area de assinatura.

---

## Escolha no onboarding

Campo `diaVencimento` em `POST /api/assinaturas` — valores permitidos: **5, 10, 15 ou 20**.

UI: select ou radio group alimentado por `promocaoLancamento.diasVencimentoPermitidos`.

---

## Campos na assinatura (`AssinaturaResponseDto`)

| Campo | Significado | Exibicao sugerida |
|-------|-------------|-------------------|
| `diaVencimento` | Dia fixo do mes | "Vencimento todo dia {n}" |
| `proximaDataVencimento` | Proxima cobranca | Data formatada pt-BR |
| `proximaDataGeracaoCobranca` | Geracao D-2 | Tooltip tecnico / secao avancada |
| `proximaDataAlerta` | Alerta e-mail D-3 | "Voce sera avisado em {data}" |
| `emTrial` | Em periodo de teste | Banner trial |
| `diasTrial` | Duracao da promocao | Copy vitrine |

---

## Tela `/configuracoes/assinatura`

Secoes:

1. **Plano atual** — `planoNome`, preco (via planos store ou endpoint futuro).
2. **Status** — badge Trial / Ativa / PendentePagamento / Cancelada.
3. **Ciclo** — dia de vencimento + proxima data.
4. **Acoes** — upgrade, cancelar, ver faturas.

---

## Alertas proativos (opcional v2)

Se `hoje >= proximaDataAlerta` e cobranca proxima:

- Notificacao in-app: "Sua fatura vence em 3 dias".
- Nao duplicar e-mail ja enviado pela API.

---

## Trial → primeira cobranca

Durante trial:

- Mostrar `proximaDataVencimento` como **primeira cobranca apos o teste**.
- Deixar claro que modulos ja estao liberados.

---

## Criterios de aceite

- [ ] Dia de vencimento visivel apos onboarding.
- [ ] Datas em timezone local do usuario (UTC da API → `Intl.DateTimeFormat`).
- [ ] Trial mostra primeira cobranca futura, nao "vencido".
