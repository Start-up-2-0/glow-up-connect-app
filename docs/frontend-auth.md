# Autenticacao e cadastro — guia para o frontend

Documentacao de integracao dos fluxos de **cadastro**, **login** e **recuperacao de senha** na GLOWAPI.

**Swagger (dev/staging):** `{BASE_URL}/swagger`  
**Health check:** `GET {BASE_URL}/health`

Substitua `{BASE_URL}` pela URL da API (ex.: `http://localhost:5127` local, URL do Railway em staging/producao).

Documentacao complementar (testes manuais, SQL de dev): [cadastro-usuario.md](./cadastro-usuario.md).

---

## Resumo rapido

| Fluxo | Metodo | Rota | Auth | Status |
|-------|--------|------|------|--------|
| Cadastro | POST | `/api/usuario` | Nao | Implementado |
| Confirmar e-mail | POST | `/api/auth/confirmar-email` | Nao | Implementado |
| Reenviar confirmacao | POST | `/api/auth/reenviar-confirmacao` | Nao | Implementado |
| Login | POST | `/api/auth/login` | Nao | Implementado |
| Esqueci a senha | POST | `/api/auth/forgot-password` | Nao | **501 — nao implementado** |
| Redefinir senha | POST | `/api/auth/reset-password` | Nao | **501 — nao implementado** |

---

## Convencoes da API

### Content-Type

Todas as requisicoes com body devem usar:

```http
Content-Type: application/json
```

### Nomes de propriedades

O JSON aceita **camelCase** (`nome`, `refreshToken`) — a API deserializa com `PropertyNameCaseInsensitive`.

### Autenticacao (rotas protegidas)

A API **nao usa JWT Bearer**. O token emitido no login vai no header:

```http
x-glow-token: <token>
```

Nome configuravel em `Auth:TokenHeaderName` (padrao: `x-glow-token`).

### Formatos de resposta

Existem **dois formatos** — o frontend precisa tratar ambos:

**1. Cadastro (`POST /api/usuario`) — body direto, sem envelope**

```json
{
  "id": 1,
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "11999999999",
  "ativo": false,
  "avatarBase64": null,
  "mensagem": "Cadastro realizado. Confirme seu e-mail (link ou codigo) para ativar a conta."
}
```

**2. Login e demais rotas de auth — envelope padrao**

Sucesso:

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": { }
}
```

Erro de negocio/autenticacao:

```json
{
  "success": false,
  "message": "Email ou senha inválidos",
  "code": "INVALID_CREDENTIALS"
}
```

**3. Validacao de modelo (400) — cadastro com campos invalidos**

Resposta padrao ASP.NET (`ValidationProblemDetails`), com `errors` por campo:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Senha": ["Senha deve conter: letra maiuscula, minuscula, numero e caractere especial"]
  }
}
```

---

## Fluxo completo (cadastro → login)

```mermaid
sequenceDiagram
    participant F as Frontend
    participant API as GLOWAPI

    F->>API: POST /api/usuario
    API-->>F: 201 (ativo: false)
    Note over F: Tela de confirmacao de e-mail

    alt Link do e-mail
        F->>API: POST /api/auth/confirmar-email { token }
    else Codigo de 6 digitos
        F->>API: POST /api/auth/confirmar-email { codigo }
    end
    API-->>F: 200 success

    F->>API: POST /api/auth/login
    API-->>F: 200 data.token + data.refreshToken
    Note over F: Salvar tokens; enviar x-glow-token nas rotas privadas
```

### Rotas de tela sugeridas no frontend

| Tela | Rota sugerida | Origem do parametro |
|------|---------------|---------------------|
| Confirmar e-mail | `/confirmar-email?token=...` | Link no e-mail (`Auth:FrontendBaseUrl`) |
| Redefinir senha *(futuro)* | `/resetar-senha?token=...` | Link no e-mail de recuperacao |

---

## 1. Cadastrar usuario

Cria conta de **cliente** (`role: Cliente`). Nao envie `role` no body.

### `POST /api/usuario`

**Resposta:** `201 Created`

### Request body

| Campo | Tipo | Obrigatorio | Regras |
|-------|------|-------------|--------|
| `nome` | string | Sim | 3–150 caracteres |
| `email` | string | Sim | E-mail valido |
| `telefone` | string | Sim | Ate 20 caracteres |
| `senha` | string | Sim | 6–100 chars; maiuscula, minuscula, numero e caractere especial |
| `avatarBase64` | string | Nao | Data URI ou base64 puro |
| `avatarContentType` | string | Nao | Obrigatorio se `avatarBase64` for base64 puro (ex.: `image/png`) |

**Regras de avatar:** max 5 MB decodificado; tipos `image/jpeg`, `image/png`, `image/webp`.

### Exemplo request

```json
{
  "nome": "Maria Silva",
  "email": "maria@email.com",
  "telefone": "11999999999",
  "senha": "Senha123!"
}
```

### Exemplo response (201)

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

### Comportamento esperado no frontend

1. Apos `201`, redirecionar para tela de confirmacao de e-mail (nao tentar login ainda).
2. Exibir a `mensagem` retornada ou texto equivalente.
3. Oferecer reenvio de confirmacao (secao 2).
4. Tratar `409 EMAIL_JA_CADASTRADO` — sugerir login ou recuperacao de senha.

### Erros relevantes

| HTTP | `code` | Acao sugerida no UI |
|------|--------|---------------------|
| 409 | `EMAIL_JA_CADASTRADO` | "Este e-mail ja esta cadastrado" + link para login |
| 400 | `AVATAR_INVALIDO` | Mensagem sobre formato/tamanho do avatar |
| 400 | — (validation) | Exibir erros por campo em `errors` |

---

## 2. Confirmar e-mail (pos-cadastro)

Obrigatorio antes do primeiro login. O e-mail contem **link** e **codigo de 6 digitos**.

Link gerado pela API:

```text
{Auth:FrontendBaseUrl}/confirmar-email?token=<token-opaco>
```

Validade padrao: **24 horas** (`Auth:ConfirmacaoEmailHoras`).

### `POST /api/auth/confirmar-email`

Informe **exatamente um** dos campos:

```json
{ "codigo": "482913" }
```

ou

```json
{ "token": "token-opaco-do-query-string" }
```

### Response (200)

```json
{
  "success": true,
  "message": "E-mail confirmado com sucesso. Voce ja pode fazer login."
}
```

### `POST /api/auth/reenviar-confirmacao`

Sempre retorna sucesso generico (nao revela se o e-mail existe):

```json
{ "email": "maria@email.com" }
```

```json
{
  "success": true,
  "message": "Se o e-mail estiver cadastrado e pendente de confirmacao, enviaremos um novo link e codigo."
}
```

### Erros

| HTTP | `code` | Quando |
|------|--------|--------|
| 400 | `CONFIRMACAO_EMAIL_INVALIDA` | Token/codigo invalido, expirado, ou enviou ambos/nenhum |

---

## 3. Login

### `POST /api/auth/login`

### Request body

| Campo | Tipo | Obrigatorio |
|-------|------|-------------|
| `email` | string | Sim |
| `senha` | string | Sim |

```json
{
  "email": "maria@email.com",
  "senha": "Senha123!"
}
```

### Response (200)

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

### Valores de `usuario.role`

| Valor | Significado |
|-------|-------------|
| `1` | Cliente |
| `2` | DonoEstabelecimento |
| `3` | ProfissionalAutonomo |
| `4` | ProfissionalEstabelecimento |
| `5` | Admin |

Cadastro publico sempre retorna `role: 1` apos login.

### Duracao dos tokens (padrao)

| Token | Config | Padrao |
|-------|--------|--------|
| Access (`data.token`) | `Auth:SessionMinutes` | 15 min |
| Refresh (`data.refreshToken`) | `Auth:RefreshTokenDays` | 7 dias |

### O que fazer no frontend apos login

1. Persistir `token`, `refreshToken`, `expiresAt` e `refreshExpiresAt` (ex.: localStorage ou cookie httpOnly via BFF).
2. Enviar `x-glow-token: data.token` em todas as chamadas autenticadas.
3. Renovar antes de expirar com `POST /api/auth/refresh` (secao 5).
4. Em `401 TOKEN_EXPIRED`, tentar refresh; se falhar, redirecionar para login.

### Erros

| HTTP | `code` | Mensagem API | Acao no UI |
|------|--------|--------------|------------|
| 401 | `INVALID_CREDENTIALS` | Email ou senha inválidos | Erro generico no formulario |
| 403 | `EMAIL_NAO_CONFIRMADO` | Confirme seu e-mail antes de entrar. | Redirecionar para confirmacao |
| 403 | `USER_BLOCKED` | Conta bloqueada apos varias tentativas... | Informar bloqueio (~15 min) |
| 403 | `USER_INACTIVE` | Usuario inativo. | Conta desativada — suporte |

**Bloqueio por tentativas:** apos **5** senhas erradas (`Auth:MaxLoginAttempts`), conta bloqueada por **15 minutos** (`Auth:LockoutMinutes`).

---

## 4. Esqueci a senha

> **Status atual:** endpoints existem mas retornam **501 Not Implemented**.  
> Nao integrar em producao ate o backend liberar a feature.

### Estado atual da API

```http
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

Resposta atual (501):

```json
{
  "success": false,
  "message": "Recuperação de senha ainda não implementada.",
  "code": "NOT_IMPLEMENTED"
}
```

### Contrato previsto (para preparar telas)

Baseado no design interno da API (`docs/mensageria.md`). **Sujeito a alteracao** quando implementado.

#### Passo 1 — Solicitar e-mail

`POST /api/auth/forgot-password`

```json
{ "email": "maria@email.com" }
```

Resposta esperada (200) — mensagem generica, sem revelar se o e-mail existe:

```json
{
  "success": true,
  "message": "Se o e-mail estiver cadastrado, enviaremos instrucoes para redefinir a senha."
}
```

E-mail contera link:

```text
{Auth:FrontendBaseUrl}/resetar-senha?token=<token-opaco>
```

Validade prevista: **30 minutos**.

#### Passo 2 — Redefinir senha

Tela `/resetar-senha` le `token` da query string e envia:

`POST /api/auth/reset-password`

```json
{
  "token": "token-opaco-da-url",
  "senha": "NovaSenha123!",
  "confirmarSenha": "NovaSenha123!"
}
```

Regras de `senha`: mesmas do cadastro (complexidade minima).

Resposta esperada (200):

```json
{
  "success": true,
  "message": "Senha redefinida com sucesso. Voce ja pode fazer login."
}
```

#### Erros previstos

| HTTP | `code` | Quando |
|------|--------|--------|
| 400 | `RESET_SENHA_INVALIDO` | Token expirado ou invalido |
| 400 | — (validation) | Senhas nao conferem ou regra de complexidade |

#### Preparacao recomendada no frontend (agora)

1. Tela **Esqueci minha senha** com campo `email` — pode exibir aviso de "em breve" ou desabilitar submit.
2. Tela **Redefinir senha** em `/resetar-senha?token=...` com campos `senha` e `confirmarSenha`.
3. Tratar `501 NOT_IMPLEMENTED` graciosamente ate o backend entregar a feature.

---

## 5. Rotas auxiliares de sessao

| Metodo | Rota | Header | Body |
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

O refresh **rotaciona** ambos os tokens — substituir os valores armazenados a cada renovacao.

---

## Tipos TypeScript (referencia)

```typescript
// --- Cadastro ---
export interface CadastrarUsuarioRequest {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  avatarBase64?: string;
  avatarContentType?: string;
}

export interface CadastrarUsuarioResponse {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
  avatarBase64: string | null;
  mensagem: string;
}

// --- Login ---
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  success: true;
  message: string;
  data: {
    token: string;
    refreshToken: string;
    expiresAt: string;
    refreshExpiresAt: string;
    usuario: {
      id: number;
      nome: string;
      email: string;
      role: 1 | 2 | 3 | 4 | 5;
      avatarBase64: string | null;
    };
  };
}

// --- Erro padrao ---
export interface ApiErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: unknown;
}

// --- Confirmacao ---
export interface ConfirmarEmailRequest {
  token?: string;
  codigo?: string;
}

// --- Recuperacao (futuro) ---
export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  senha: string;
  confirmarSenha: string;
}
```

---

## Exemplo de cliente (fetch)

```typescript
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5127";

async function cadastrarUsuario(body: CadastrarUsuarioRequest): Promise<CadastrarUsuarioResponse> {
  const res = await fetch(`${BASE_URL}/api/usuario`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json();
    throw err; // tratar code ou errors
  }

  return res.json();
}

async function login(body: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  if (!res.ok) throw data as ApiErrorResponse;
  return data as LoginResponse;
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-glow-token": token,
  };
}

async function obterPerfil(token: string) {
  const res = await fetch(`${BASE_URL}/api/usuario/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
```

---

## Checklist de integracao

- [ ] Tela de cadastro → `POST /api/usuario` → redirecionar para confirmacao
- [ ] Tela confirmacao (codigo 6 digitos e/ou rota `/confirmar-email?token=`)
- [ ] Reenviar confirmacao → `POST /api/auth/reenviar-confirmacao`
- [ ] Tela login → `POST /api/auth/login` → persistir tokens
- [ ] Interceptor HTTP com header `x-glow-token`
- [ ] Refresh automatico com `POST /api/auth/refresh`
- [ ] Tratar `EMAIL_NAO_CONFIRMADO`, `USER_BLOCKED`, `INVALID_CREDENTIALS`
- [ ] Telas de esqueci/redefinir senha preparadas (aguardar backend sair do 501)

---

## Referencias no codigo

| Artefato | Caminho |
|----------|---------|
| Cadastro | `src/GLOWAPI.API/Controllers/UsuarioController.cs` |
| Auth | `src/GLOWAPI.API/Controllers/AuthController.cs` |
| DTO cadastro | `src/GLOWAPI.Application/DTOs/Usuario/CadastrarClienteDto.cs` |
| DTO login | `src/GLOWAPI.Application/DTOs/Auth/LoginRequestDto.cs` |
| Testes integracao | `tests/GLOWAPI.Tests/Integration/AuthControllerTests.cs` |
