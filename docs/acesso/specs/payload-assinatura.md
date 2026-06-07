# Payload completo — POST /api/assinaturas

Referencia canonica dos bodies para onboarding de assinatura.

**Endpoint:** `POST /api/assinaturas`  
**Headers:** `Content-Type: application/json`, `x-glow-token: <token>`

Convencoes: [../../frontend/convencoes.md](../../frontend/convencoes.md)  
Endereco: [../../frontend/endereco-assinante.md](../../frontend/endereco-assinante.md)

---

## Estrutura raiz (todos os cenarios)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|:-----------:|-----------|
| `planoId` | number | sim | Id do plano (`GET /api/planos`) |
| `tipoAssinatura` | string | sim | `"Estabelecimento"` ou `"ProfissionalAutonomo"` |
| `estabelecimentoId` | number | condicional | Quando o negocio **ja existe** (dono) |
| `estabelecimento` | object | condicional | Quando o negocio e **novo** (dono) |
| `profissionalAutonomoId` | number | condicional | Quando o perfil autonomo **ja existe** |
| `profissionalAutonomo` | object | condicional | Quando o autonomo e **novo** |
| `gateway` | string | nao | Padrao `"MercadoPago"` |
| `diaVencimento` | number | sim | `5`, `10`, `15` ou `20` |
| `pagamento` | object | sim* | Token do cartao Mercado Pago |

\* Obrigatorio no fluxo atual com MP Preapproval / cobranca transparente.

**Regra de exclusao:** use `estabelecimento` **ou** `estabelecimentoId` — nao ambos. Idem `profissionalAutonomo` / `profissionalAutonomoId`.

---

## Objeto `estabelecimento` (negocio novo)

| Campo | Tipo | Obrigatorio | Limite |
|-------|------|:-----------:|--------|
| `nome` | string | sim | 150 caracteres |
| `descricao` | string | nao | 500 caracteres (pode ser `""`) |
| `logo` | string | sim | **Base64** — ver secao Logo abaixo |
| `telefone` | string | sim | 20 caracteres |
| `email` | string | sim | 255 caracteres |
| `endereco` | object | sim | Ver tabela Endereco |

### Objeto `endereco`

| Campo | Tipo | Obrigatorio | Regra |
|-------|------|:-----------:|-------|
| `cep` | string | sim | 8 digitos (`01310100` ou `01310-100`) |
| `logradouro` | string | sim | max 200 |
| `numero` | string | sim | max 20 |
| `bairro` | string | sim | max 100 |
| `cidade` | string | sim | max 100 |
| `estado` | string | sim | UF 2 letras (`SP`) |
| `complemento` | string | nao | max 100 |

**Nao enviar** `latitude`, `longitude` — a API geocodifica automaticamente apos salvar.

---

## Objeto `profissionalAutonomo` (autonomo novo)

| Campo | Tipo | Obrigatorio | Limite |
|-------|------|:-----------:|--------|
| `nomePublico` | string | sim | nome exibido ao cliente |
| `biografia` | string | nao | texto curto (pode ser `""`) |
| `logo` | string | sim | **Base64** — mesmas regras do estabelecimento |
| `telefone` | string | sim | 20 caracteres |
| `email` | string | sim | 255 caracteres |
| `endereco` | object | sim | Igual `estabelecimento.endereco` |

---

## Objeto `pagamento` (Mercado Pago transparente)

| Campo | Tipo | Obrigatorio | Descricao |
|-------|------|:-----------:|-----------|
| `paymentMethodId` | string | sim | Ex.: `"visa"`, `"master"` |
| `token` | string | sim | Token do cartao gerado pelo SDK MP |
| `issuerId` | string | nao | Emissor do cartao |
| `installments` | number | nao | Parcelas (assinatura: `1`) |
| `identificationType` | string | nao | Ex.: `"CPF"` |
| `identificationNumber` | string | nao | CPF do titular |

---

## Logo em base64 (igual avatar)

O campo **`logo`** segue o **mesmo padrao** do avatar de usuario (`avatarBase64` no cadastro):

| Regra | Valor |
|-------|-------|
| Formatos | JPEG, PNG, WebP |
| Tamanho maximo | 5 MB (arquivo antes de encode) |
| Formato preferido | Data URI: `data:image/png;base64,...` |
| Utilitarios frontend | `readFileAsDataUrl`, `validateAvatarFile` em `src/utils/avatarFile.ts` |

### Fluxo no checkout

```typescript
import { readFileAsDataUrl, validateAvatarFile } from '@/utils/avatarFile'

async function logoFromFile(file: File): Promise<string> {
  const erro = validateAvatarFile(file)
  if (erro) throw new Error(erro)
  return readFileAsDataUrl(file) // retorna data:image/...;base64,...
}
```

### Exemplo de valor `logo`

```json
"logo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
```

A API valida e persiste `logo` com as **mesmas regras do avatar** (`IAvatarBase64Decoder`): tipos JPEG/PNG/WebP, max 5 MB, data URI normalizado no banco (coluna `text`).

---

## Payload 1 — Estabelecimento novo (completo)

```json
{
  "planoId": 1,
  "tipoAssinatura": "Estabelecimento",
  "gateway": "MercadoPago",
  "diaVencimento": 10,
  "estabelecimento": {
    "nome": "Studio Glow",
    "descricao": "Salao de beleza e estetica",
    "logo": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "telefone": "11999999999",
    "email": "contato@studioglow.com",
    "endereco": {
      "cep": "01310100",
      "logradouro": "Av Paulista",
      "numero": "1000",
      "bairro": "Bela Vista",
      "cidade": "Sao Paulo",
      "estado": "SP",
      "complemento": "Sala 12"
    }
  },
  "pagamento": {
    "paymentMethodId": "visa",
    "token": "CARD_TOKEN_GERADO_PELO_SDK_MP",
    "issuerId": "24",
    "installments": 1,
    "identificationType": "CPF",
    "identificationNumber": "12345678909"
  }
}
```

---

## Payload 2 — Estabelecimento ja existente

```json
{
  "planoId": 2,
  "tipoAssinatura": "Estabelecimento",
  "estabelecimentoId": 12,
  "gateway": "MercadoPago",
  "diaVencimento": 15,
  "pagamento": {
    "paymentMethodId": "master",
    "token": "CARD_TOKEN_GERADO_PELO_SDK_MP",
    "installments": 1,
    "identificationType": "CPF",
    "identificationNumber": "98765432100"
  }
}
```

---

## Payload 3 — Profissional autonomo novo (completo)

```json
{
  "planoId": 1,
  "tipoAssinatura": "ProfissionalAutonomo",
  "gateway": "MercadoPago",
  "diaVencimento": 5,
  "profissionalAutonomo": {
    "nomePublico": "Maria Silva",
    "biografia": "Cabeleireira e colorista autonoma",
    "logo": "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=",
    "telefone": "11988887777",
    "email": "maria@email.com",
    "endereco": {
      "cep": "13010000",
      "logradouro": "Rua Barao de Jaguara",
      "numero": "100",
      "bairro": "Centro",
      "cidade": "Campinas",
      "estado": "SP",
      "complemento": ""
    }
  },
  "pagamento": {
    "paymentMethodId": "visa",
    "token": "CARD_TOKEN_GERADO_PELO_SDK_MP",
    "installments": 1,
    "identificationType": "CPF",
    "identificationNumber": "12345678909"
  }
}
```

---

## Payload 4 — Profissional autonomo ja existente

```json
{
  "planoId": 1,
  "tipoAssinatura": "ProfissionalAutonomo",
  "profissionalAutonomoId": 8,
  "gateway": "MercadoPago",
  "diaVencimento": 20,
  "pagamento": {
    "paymentMethodId": "visa",
    "token": "CARD_TOKEN_GERADO_PELO_SDK_MP",
    "installments": 1
  }
}
```

---

## Resposta 201 (trial)

```json
{
  "success": true,
  "message": "Assinatura iniciada com sucesso.",
  "data": {
    "id": 42,
    "planoId": 1,
    "planoAlteracaoPendenteId": null,
    "estabelecimentoId": 12,
    "profissionalAutonomoId": null,
    "status": "Trial",
    "gateway": "MercadoPago",
    "inicio": "2026-06-07T12:00:00Z",
    "fim": null,
    "pagamentoInicial": null,
    "diaVencimento": 10,
    "proximaDataVencimento": "2026-07-10T00:00:00Z",
    "proximaDataGeracaoCobranca": "2026-07-08T00:00:00Z",
    "proximaDataAlerta": "2026-07-07T00:00:00Z",
    "emTrial": true,
    "diasTrial": 30
  }
}
```

## Resposta 201 (pago imediato — fallback)

```json
{
  "success": true,
  "message": "Assinatura iniciada com sucesso.",
  "data": {
    "id": 43,
    "planoId": 1,
    "estabelecimentoId": 13,
    "status": "PendentePagamento",
    "gateway": "MercadoPago",
    "inicio": "2026-06-07T12:00:00Z",
    "fim": null,
    "emTrial": false,
    "diasTrial": null,
    "diaVencimento": 10,
    "pagamentoInicial": {
      "id": 101,
      "status": "Pendente",
      "gateway": "MercadoPago",
      "gatewayPaymentId": "mp-pay-123",
      "valor": 29.99,
      "moeda": "BRL",
      "checkoutUrl": "",
      "qrCode": "",
      "expiraEm": "2026-06-08T12:00:00Z"
    }
  }
}
```

---

## Erros de validacao comuns (400)

| Mensagem | Campo |
|----------|-------|
| `Nome do estabelecimento e obrigatorio.` | `estabelecimento.nome` |
| `Logo do estabelecimento e obrigatorio.` | `estabelecimento.logo` |
| `CEP deve conter 8 digitos.` | `endereco.cep` |
| `Estado deve ser a UF com 2 caracteres.` | `endereco.estado` |
