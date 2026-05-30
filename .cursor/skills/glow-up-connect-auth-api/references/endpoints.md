# Endpoints — Auth & Cadastro (GLOWAPI)

Base URL: `{BASE_URL}` (ex.: `http://localhost:5127` local).

Todas as requisições com body: `Content-Type: application/json`.

---

## Cadastro

### `POST /api/usuario`

Cria conta de **cliente** (`role: Cliente`). Não envie `role` no body.

**Auth:** não  
**Response:** `201 Created` — **body direto, sem envelope**

#### Request

| Campo | Tipo | Obrigatório | Regras |
|-------|------|-------------|--------|
| `nome` | string | Sim | 3–150 caracteres |
| `email` | string | Sim | E-mail válido |
| `telefone` | string | Sim | Até 20 caracteres |
| `senha` | string | Sim | 6–100 chars; maiúscula, minúscula, número e caractere especial |
| `avatarBase64` | string | Não | Data URI ou base64 puro |
| `avatarContentType` | string | Não | Obrigatório se `avatarBase64` for base64 puro (ex.: `image/png`) |

Avatar: max 5 MB decodificado; tipos `image/jpeg`, `image/png`, `image/webp`.

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "11999999999",
  "senha": "Senha123!"
}
```

#### Response (201)

```json
{
  "id": 42,
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "11999999999",
  "ativo": false,
  "avatarBase64": null,
  "mensagem": "Cadastro realizado. Confirme seu e-mail (link ou codigo) para ativar a conta."
}
```

#### Frontend após 201

1. Redirecionar para tela de confirmação de e-mail
2. Exibir `mensagem` retornada
3. Oferecer reenvio de confirmação
4. Tratar `409 EMAIL_JA_CADASTRADO`

---

## Confirmar e-mail

Obrigatório antes do primeiro login. E-mail contém **link** e **código de 6 dígitos**.

Link: `{Auth:FrontendBaseUrl}/confirmar-email?token=<token-opaco>`  
Validade padrão: **24 horas**.

### `POST /api/auth/confirmar-email`

**Auth:** não  
**Response:** `200` com envelope

Informe **exatamente um** dos campos:

```json
{ "codigo": "482913" }
```

ou

```json
{ "token": "token-opaco-do-query-string" }
```

#### Response (200)

```json
{
  "success": true,
  "message": "E-mail confirmado com sucesso. Voce ja pode fazer login."
}
```

### `POST /api/auth/reenviar-confirmacao`

Sempre retorna sucesso genérico (não revela se o e-mail existe).

```json
{ "email": "maria@email.com" }
```

```json
{
  "success": true,
  "message": "Se o e-mail estiver cadastrado e pendente de confirmacao, enviaremos um novo link e codigo."
}
```

---

## Login

### `POST /api/auth/login`

**Auth:** não  
**Response:** `200` com envelope

#### Request

```json
{
  "email": "maria@email.com",
  "senha": "Senha123!"
}
```

#### Response (200)

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJ1aWQi...",
    "refreshToken": "opaque-refresh-token",
    "expiresAt": "2026-05-30T15:30:00Z",
    "refreshExpiresAt": "2026-06-06T15:15:00Z",
    "usuario": {
      "id": 42,
      "nome": "Maria Silva",
      "email": "maria@email.com",
      "role": 1,
      "avatarBase64": null
    }
  }
}
```

#### Frontend após login

1. Persistir `token`, `refreshToken`, `expiresAt`, `refreshExpiresAt`
2. Enviar `x-glow-token: data.token` em rotas autenticadas
3. Renovar com `POST /api/auth/refresh` antes de expirar
4. Em `401 TOKEN_EXPIRED`, tentar refresh; se falhar, logout + redirect login

---

## Esqueci a senha (501 — não implementado)

> Endpoints existem mas retornam **501 Not Implemented**. Não integrar em produção até o backend liberar.

### `POST /api/auth/forgot-password` (previsto)

```json
{ "email": "maria@email.com" }
```

Resposta esperada (200) — mensagem genérica:

```json
{
  "success": true,
  "message": "Se o e-mail estiver cadastrado, enviaremos instrucoes para redefinir a senha."
}
```

E-mail conterá link:

```text
{Auth:FrontendBaseUrl}/resetar-senha?token=<token-opaco>
```

Validade prevista: **30 minutos**.

### `POST /api/auth/reset-password` (previsto)

Tela `/resetar-senha` lê `token` da query string.

```json
{
  "token": "token-opaco-da-url",
  "senha": "NovaSenha123!",
  "confirmarSenha": "NovaSenha123!"
}
```

Resposta esperada (200):

```json
{
  "success": true,
  "message": "Senha redefinida com sucesso. Voce ja pode fazer login."
}
```

Resposta atual (501):

```json
{
  "success": false,
  "message": "Recuperação de senha ainda não implementada.",
  "code": "NOT_IMPLEMENTED"
}
```

---

## Rotas auxiliares de sessão

| Método | Rota | Header | Body |
|--------|------|--------|------|
| POST | `/api/auth/refresh` | — | `{ "refreshToken": "..." }` |
| POST | `/api/auth/logout` | `x-glow-token` | — |
| GET | `/api/usuario/me` | `x-glow-token` | — |

### Refresh (200)

```json
{
  "success": true,
  "message": "Token renovado com sucesso",
  "data": {
    "token": "novo-access-token",
    "refreshToken": "novo-refresh-token",
    "expiresAt": "...",
    "refreshExpiresAt": "..."
  }
}
```

O refresh **rotaciona** ambos os tokens.

### GET `/api/usuario/me` (200)

DTO direto, sem envelope:

```json
{
  "id": 1,
  "nome": "Maria Silva",
  "email": "user@email.com",
  "telefone": "11999999999",
  "role": 1,
  "ativo": true,
  "avatarBase64": null,
  "createdAt": "...",
  "updatedAt": null
}
```

---

## Rotas frontend vs links da API

| Origem API | Rota sugerida API | Rota atual no app |
|------------|-------------------|-------------------|
| Link confirmação | `/confirmar-email?token=...` | `/auth/confirmar-email` |
| Link reset senha | `/resetar-senha?token=...` | `/auth/redefinir-senha` |
| Esqueci senha (UI) | — | `/auth/esqueci-senha` |

Ao integrar reset por link, ler `token` da query string e enviar em `POST /api/auth/reset-password`.

---

## Dev — obter código de confirmação sem e-mail

Com API e worker de mensageria rodando:

```sql
SELECT "Conteudo", "Status", "CriadoEm"
FROM "MensagensNotificacao"
WHERE "Canal" = 'Email'
  AND "Destinatario" = 'maria@email.com'
ORDER BY "CriadoEm" DESC
LIMIT 1;
```

No campo `Conteudo`, procurar `Ou digite o codigo no app: XXXXXX` ou `token=` no link.
