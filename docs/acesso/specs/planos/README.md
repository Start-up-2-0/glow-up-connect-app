# Specs de planos — UI

Hierarquia comercial: **Basic ⊂ Plus ⊂ Premium**.

Cada plano adiciona modulos; o frontend usa `modulos[]` da API, nao regras hardcoded.

| Plano | Preco/mes | Persona alvo |
|-------|----------:|--------------|
| [Basic](./basic.md) | R$ 29,99 | Autonomo ou loja solo |
| [Plus](./plus.md) | R$ 99,90 | Equipe pequena + WhatsApp |
| [Premium](./premium.md) | R$ 199,90 | Financeiro completo |

## Comparacao rapida (marketing)

| Recurso | Basic | Plus | Premium |
|---------|:-----:|:----:|:-------:|
| Agenda e servicos | sim | sim | sim |
| E-mail automatico | sim | sim | sim |
| Equipe / convites | — | sim | sim |
| WhatsApp ao cliente | — | sim | sim |
| Caixa | — | — | sim |
| Financeiro / comissoes | — | — | sim |
| Destaque marketplace | — | — | sim |

## Upgrade path no app

```text
Basic  --[CTA Plus]-->  Plus  --[CTA Premium]-->  Premium
```

Modulo bloqueado → modal com plano minimo da [matriz em guardas-frontend.md](../guardas-frontend.md).
