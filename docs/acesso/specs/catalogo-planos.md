# Spec — Catalogo de planos (Essencial + Premium × TipoAssinatura)

## Objetivo

Garantir que o banco contenha **exatamente 2 planos ativos** para contratacao, com modulos/limites/textos resolvidos por `PlanoComercialCatalogo.Obter(plano, tipoAssinatura)`.

## Dimensoes

| Dimensao | Valores |
|----------|---------|
| Plano | Essencial, Premium (mesmos IDs/precos) |
| TipoAssinatura | `Estabelecimento`, `ProfissionalAutonomo` (persistido em `Assinaturas.TipoAssinatura`) |

## Planos canonicos

| Id | Nome | Preco | LimiteEstabelecimentos (loja) | Ativo |
|:--:|------|------:|:-----------------------------:|:-----:|
| 2 | Essencial | 79.90 (loja) / **49.99 (autônomo)** | 1 | true |
| 3 | Premium | 199.90 (loja) / **79.99 (autônomo)** | 5 | true |

## Matriz de modulos (V1)

| Modulo | Autonomo Essencial | Autonomo Premium | Loja Essencial | Loja Premium |
|--------|:------------------:|:----------------:|:--------------:|:------------:|
| Agenda, Servicos, Horarios, Notificacoes, Email | sim | sim | sim | sim |
| Clientes | sim | sim | nao | sim |
| WhatsApp | nao | sim | sim | sim |
| Caixa, Financeiro | nao | sim | nao | sim |
| Profissionais | nao | nao | sim | sim |
| ComissaoProfissionais | nao | nao | nao | sim |
| Prioridade marketplace | nao | sim | nao | sim |

Limites efetivos do autônomo: `LimiteUsuarios = 1`, `LimiteProfissionais = 1`, `LimiteEstabelecimentos = 1`.

Preços do autônomo: Essencial **R$ 49,99** e Premium **R$ 79,99** (`PlanoComercialCatalogo.ResolverPreco`).

## API exposta

```http
GET /api/planos?tipoAssinatura=Estabelecimento|ProfissionalAutonomo
```

Default: `Estabelecimento`. Retorna os mesmos planos com `modulos`/`funcionalidades`/limites tipados.

Contexto `GET /api/usuario/me/estabelecimentos` inclui `tipoAssinatura`.

## Criterios de aceite

- [x] Catálogo tipado loja vs autônomo.
- [x] Autônomo Essencial: clientes sem equipe/WhatsApp.
- [x] Autônomo Premium: WhatsApp + financeiro sem comissão/multi-loja.
- [x] Loja Essencial/Premium: comportamento anterior preservado.
- [x] `TipoAssinatura` persistido e exposto no contexto.
- [x] Onboarding com passo "Como você trabalha?" e nav/upgrade tipados no app.
