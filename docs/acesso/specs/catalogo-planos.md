# Spec — Catalogo de planos (frontend)

## Endpoint

```http
GET /api/planos
```

**Auth:** nao  
**Envelope:** `{ success, message, data }`

---

## Resposta

```json
{
  "success": true,
  "message": "Planos disponiveis para contratacao.",
  "data": {
    "planos": [
      {
        "id": 1,
        "nome": "Basic",
        "descricao": "Plano de entrada para operacao solo com agenda, servicos e e-mail",
        "preco": 29.99,
        "periodo": "Mensal",
        "limiteProfissionais": 1,
        "limiteServicos": 10,
        "limiteAgendamentos": null,
        "limiteUsuarios": 1,
        "limiteAgendamentosPorDia": null,
        "prioridadeListagemPublica": false,
        "modulos": ["Agenda", "Servicos", "HorariosAtendimento", "Notificacoes", "Email"],
        "funcionalidades": ["Cadastro de servicos", "Agenda simples", "..."]
      }
    ],
    "promocaoLancamento": {
      "disponivel": true,
      "vagasRestantes": 87,
      "diasTrial": 30,
      "diasVencimentoPermitidos": [5, 10, 15, 20],
      "diasAntecedenciaAlertaFatura": 3,
      "diasAntecedenciaGeracaoCobranca": 2
    }
  }
}
```

---

## UI — Vitrine (`/onboarding/planos`)

### Layout sugerido

- 3 colunas (desktop) / carrossel (mobile).
- Plano **Plus** com destaque visual "Mais popular" (opcional produto).
- Tabela comparativa expansivel com `funcionalidades`.

### Exibicao de limites

| Campo API | Label UI | Tratamento `null` |
|-----------|----------|-------------------|
| `limiteUsuarios` | Usuarios no negocio | "Ilimitado" |
| `limiteProfissionais` | Profissionais | "Ilimitado" |
| `limiteServicos` | Servicos | "Ilimitado" |
| `limiteAgendamentos` | Agendamentos | "Ilimitado" |
| `prioridadeListagemPublica` | Destaque no marketplace | badge Premium |

### Modulos na comparacao

Usar `modulos[]` para checklist visual (icone check / lock):

- Basic: 5 modulos operacionais.
- Plus: Basic + Profissionais + WhatsApp.
- Premium: Plus + Caixa + Financeiro + ComissaoProfissionais.

Specs por plano: [planos/README.md](./planos/README.md).

---

## Store `planos.store`

```ts
interface PlanosState {
  planos: Plano[]
  promocao: PromocaoLancamento | null
  carregadoEm: number | null
}
```

- Cache em memoria (TTL 5 min).
- Invalidar ao concluir onboarding (precos podem mudar).

---

## Tipos TypeScript sugeridos

```ts
export interface Plano {
  id: number
  nome: string
  descricao: string
  preco: number
  periodo: string
  limiteProfissionais: number | null
  limiteServicos: number | null
  limiteAgendamentos: number | null
  limiteUsuarios: number | null
  limiteAgendamentosPorDia: number | null
  prioridadeListagemPublica: boolean
  modulos: string[]
  funcionalidades: string[]
}

export interface PromocaoLancamento {
  disponivel: boolean
  vagasRestantes: number
  diasTrial: number
  diasVencimentoPermitidos: number[]
  diasAntecedenciaAlertaFatura: number
  diasAntecedenciaGeracaoCobranca: number
}
```

---

## Criterios de aceite

- [ ] Pagina carrega sem token.
- [ ] Precos formatados em BRL (`R$ 29,99`).
- [ ] `null` em limites renderiza "Ilimitado".
- [ ] CTA desabilitado se lista vazia.
- [ ] Promocao exibida apenas quando `disponivel`.
