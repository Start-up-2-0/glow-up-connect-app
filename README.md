# glow-up-connect-app

Frontend Vue 3 do **Glow Up Connect** — plataforma SaaS administrativa integrada à API [`glow-up-connect-api`](https://github.com).

## Stack

- Vue 3 + TypeScript + Vite
- Tailwind CSS + Flowbite
- Vue Router + Pinia
- Axios

## Pré-requisitos

- Node.js 20+
- API rodando em `http://localhost:5127` ([glow-up-connect-api](../glow-up-connect-api))

## Instalação

```bash
npm install
cp .env.example .env.local   # ou copie manualmente
npm run dev
```

App disponível em `http://localhost:5173`.

## Variáveis de ambiente

| Variável | Descrição | Dev |
|----------|-----------|-----|
| `VITE_API_BASE_URL` | Base URL do Axios | `/api` (proxy Vite) |
| `VITE_APP_NAME` | Nome exibido na UI | `Glow Up Connect` |
| `VITE_TOKEN_HEADER` | Header de auth | `x-glow-token` |

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run dev:mock` | Dev com **dados mockados** (offline, sem API) |
| `npm run build` | Build de produção |
| `npm run preview` | Preview do build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Modo mockado (sem depender da API)

Para **acessar, validar e corrigir telas** sem subir o servidor da API, use:

```bash
npm run dev:mock
```

- Ativo por `VITE_USE_MOCKS=true` (ver `.env.mock`).
- Todas as chamadas HTTP do Axios são interceptadas por um adapter mock em [`src/mocks/`](src/mocks/) → devolve dados fictícios realistas.
- Para logar, use **qualquer e-mail/senha** (válidos) na tela de login. O mock obedece ao guard e, conforme o e-mail, simula uma **role** diferente (para validar as telas de cada perfil):

| Visão | E-mail no login | O que vê |
|-------|-----------------|----------|
| **Dono · Premium** | `gustavo@glowup.com.br` | Todas as filiais; menu completo (gestão, financeiro, config) |
| **Dono · Plus** | `plus@teste.com` | Só loja principal; menu completo |
| **Dono · Básico** | `basico@teste.com` | Só loja principal; menu completo |
| **Administrador** | `admin@teste.com` | Só Studio Glow Up; mesmas permissões do Dono na loja (agenda, clientes, serviços, financeiro, equipe, horários, config da loja). **Sem** multi-filial / gerenciar assinatura de outras lojas |
| **Recepcionista** | `recepcionista@teste.com` | Só Studio Glow Up; **Dashboard**, **Agenda**, **Clientes**, **Serviços** (visualizar), atendimento (iniciar/finalizar/remarcar/cancelar). **Sem** Financeiro, Equipe, Horários (editar), Minha loja, Assinatura, WhatsApp |
| **Profissional** | `profissional@teste.com` | Só a própria agenda/horários |
| **Cliente** | `cliente@teste.com` | Explorar, agendamentos, perfil |

  E-mails não listados caem na visão de **cliente**. Qualquer senha funciona no mock. Faça logout para trocar de perfil. O cadastro (`/usuario`) também cria conta de cliente no mock.

  **Regra de acesso (filiais):** o **Dono/Assinante** acessa todas as filiais conforme o plano (Básico/Plus = só a principal; Premium = todas). **Não-dono** (Admin/Recepcionista/Profissional) acessa somente a filial onde foi cadastrado — o mock retorna **403** para qualquer rota `/estabelecimentos/{id}/...` fora do escopo do perfil logado.

  Permissões de Admin/Recepcionista seguem a matriz da API (`MatrizPermissaoNegocioService`) em `src/mocks/seed/usuario.ts` (`PERMS_ADMIN` / `PERMS_RECEPCIONISTA`).
- Os dados vivem em `src/mocks/seed/` e as rotas em `src/mocks/handlers/`. Se faltar um endpoint, o console avisa `[mock] SEM HANDLER: METHOD /path` (resposta 501) para você adicionar o handler.
- Remova a flag (uso de `npm run dev` normal) para voltar a usar a API real; o mock não toca o fluxo normal.

## Estrutura

```
src/
├── components/     # UI reutilizável (ui/, layout/, feedback/)
├── layouts/        # AuthLayout, DashboardLayout, PublicLayout
├── views/          # Páginas roteadas (auth/, dashboard/, public/)
├── router/         # Rotas e guards
├── stores/         # Pinia (auth, user, app, notifications)
├── services/       # Camada HTTP (Axios)
├── composables/    # Lógica reutilizável
├── types/          # TypeScript
├── constants/      # Rotas, erros, storage keys
└── utils/          # Helpers puros
```

## Autenticação

- Login via `POST /api/auth/login` com `{ email, senha }`
- Token enviado no header `x-glow-token`
- Refresh automático via `POST /api/auth/refresh`
- Logout via `POST /api/auth/logout`

## Proxy de desenvolvimento

O Vite encaminha `/api` e `/health` para `http://localhost:5127`, evitando CORS em dev. A API também possui CORS configurado para `localhost:5173` (preview/prod).

## Skill do Cursor

Instruções detalhadas em `.cursor/skills/glow-up-connect-frontend/SKILL.md`.
