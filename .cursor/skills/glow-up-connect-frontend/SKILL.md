---
name: glow-up-connect-frontend
description: >
  Estrutura e implementa o frontend Vue 3 + TypeScript + Vite do projeto
  glow-up-connect-app (SaaS administrativo). Deve ser usado ao criar o
  scaffold inicial, layouts, rotas, autenticação, stores Pinia, services
  Axios, componentes UI base, guards e padrões Tailwind/Flowbite.
metadata:
  project: glow-up-connect-app
  stack: vue3,typescript,vite,tailwind,flowbite,pinia,axios
---

# Glow Up Connect — Frontend Vue 3

Skill para bootstrap e evolução do frontend administrativo do **glow-up-connect-app**.

## Quando usar

- Criar ou reorganizar a estrutura frontend do zero
- Adicionar layouts (Auth, Dashboard, Public)
- Implementar autenticação, guards e interceptors
- Criar services, stores, composables ou componentes UI base
- Padronizar consumo de API e prevenção de overfetching

## Theming (light + dark)

Todo componente ou view **deve** funcionar nos dois temas. Antes de estilizar, carregar a skill
`glow-up-connect-theming` (`.cursor/skills/glow-up-connect-theming/SKILL.md`).

Resumo: usar tokens `bg-glow-*`, `text-glow-*`, `border-glow-*`; evitar `bg-white`/`text-gray-*` soltos.

## Princípios obrigatórios

1. **Separação de responsabilidades**: Views só orquestram UI; lógica em composables/stores/services.
2. **`<script setup lang="ts">`** em todos os componentes Vue.
3. **TypeScript estrito**: sem `any`; tipos em `src/types/`.
4. **Uma instância Axios** em `services/api.ts`; nunca importar axios direto nas views.
5. **Sem overfetching**: cache em store quando dados são compartilhados; não refetch em todo mount se store já tem dados válidos.
6. **Código enxuto**: componentes pequenos; sem duplicação; sem arquivos placeholder vazios desnecessários.

## Stack e versões (preferência)

| Pacote | Uso |
|--------|-----|
| Vue 3 | Composition API + `<script setup>` |
| TypeScript | strict |
| Vite | build/dev |
| Tailwind CSS 3.x | utilitários + `@tailwindcss/forms` |
| flowbite + flowbite-vue | componentes visuais (preferir wrappers Vue) |
| Vue Router 4 | rotas + meta + guards |
| Pinia | estado global |
| Axios | HTTP |
| ESLint + Prettier | padronização (config mínima na Fase 1) |

## Estrutura de pastas

```
src/
├── assets/
├── components/
│   ├── ui/           # BaseButton, BaseInput, BaseModal...
│   ├── layout/       # Sidebar, Navbar, UserMenu, AppNotifications
│   ├── form/         # formulários compostos
│   └── feedback/     # LoadingSpinner, EmptyState, BaseAlert
├── layouts/
│   ├── AuthLayout.vue
│   ├── DashboardLayout.vue
│   └── PublicLayout.vue
├── views/
│   ├── auth/         # LoginView, RegisterView
│   ├── dashboard/    # HomeView, módulos protegidos
│   └── public/       # Landing, páginas públicas
├── router/
│   ├── index.ts
│   ├── routes/
│   │   ├── public.routes.ts
│   │   ├── auth.routes.ts
│   │   └── dashboard.routes.ts
│   └── guards/
│       └── auth.guard.ts
├── stores/
│   ├── auth.store.ts
│   ├── user.store.ts
│   ├── app.store.ts
│   └── notifications.store.ts
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── userService.ts
│   └── index.ts
├── composables/
│   ├── useAuth.ts
│   ├── useApiError.ts
│   └── useFetchOnce.ts
├── types/
│   ├── auth.types.ts
│   ├── user.types.ts
│   └── api.types.ts
├── utils/
│   ├── storage.ts
│   └── formatters.ts
├── constants/
│   ├── routes.ts
│   └── storageKeys.ts
├── App.vue
├── main.ts
└── env.d.ts
```

Consulte `references/folder-structure.md` para detalhes por pasta.

## Fases de implementação

### Fase 1 — Scaffold essencial (entregar primeiro)

- [ ] `npm create vite@latest` com vue-ts template (ou equivalente)
- [ ] Tailwind + Flowbite configurados em `main.ts` e `tailwind.config`
- [ ] `.env.example` com `VITE_API_BASE_URL`, `VITE_APP_NAME`
- [ ] `services/api.ts` + interceptors
- [ ] `stores/auth.store.ts` + persistência de token
- [ ] Router com guards + 3 layouts
- [ ] Views mínimas: Login, Dashboard Home, Landing pública
- [ ] 3–5 componentes UI base (Button, Input, Alert, LoadingSpinner, Card)

### Fase 2 — Completar base

- [ ] Demais componentes UI da lista
- [ ] stores user, app, notifications
- [ ] composables `useAuth`, `useApiError`, `useFetchOnce`
- [ ] tratamento centralizado de erros e notificações toast

### Fase 3 — Módulos de negócio

- Novo módulo = pasta em `views/dashboard/<modulo>/` + `services/<modulo>Service.ts` + types + rota lazy-loaded
- Não criar módulos fictícios até o usuário definir domínio

## Layouts

### AuthLayout

- Centralizado, sem sidebar, logo + slot para formulário
- Rotas: login, registro, recuperação de senha

### DashboardLayout

- Sidebar colapsável (mobile: drawer)
- Navbar com busca opcional, notificações, menu do usuário
- `<router-view />` na área principal
- Usa `app.store` para sidebar aberta/fechada

### PublicLayout

- Header simples + footer + `<router-view />`

## Rotas e guards

Meta padrão:

```ts
interface RouteMeta {
  layout?: 'auth' | 'dashboard' | 'public'
  requiresAuth?: boolean
  guestOnly?: boolean
  title?: string
}
```

Regras:

- `requiresAuth: true` → redirecionar para `/auth/login?redirect=...` se não autenticado
- `guestOnly: true` (login/registro) → redirecionar para `/dashboard` se autenticado
- Lazy import em todas as views de dashboard

## Autenticação

| Responsabilidade | Onde |
|------------------|------|
| login/logout | `authService` + `auth.store` |
| token | `utils/storage.ts` + constante `STORAGE_KEYS.AUTH_TOKEN` |
| user atual | `user.store` populado após login ou `/auth/me` |
| header Authorization | interceptor request em `api.ts` |
| 401 | interceptor response → logout + redirect login |
| refresh token | só implementar se API expuser endpoint |

**Segurança frontend:**

- Nunca logar token ou senha
- Não persistir dados sensíveis além do necessário
- Sanitizar exibição de erros da API (mensagem amigável, não stack)

## Services

Padrão:

```ts
// services/authService.ts
import api from './api'
import type { LoginPayload, AuthResponse } from '@/types/auth.types'

export const authService = {
  login: (payload: LoginPayload) =>
    api.post<AuthResponse>('/auth/login', payload),
  me: () => api.get<AuthResponse>('/auth/me'),
  logout: () => api.post('/auth/logout'),
}
```

- Export barrel em `services/index.ts`
- Respostas tipadas com `ApiResponse<T>` em `types/api.types.ts`

## Stores Pinia

| Store | Estado | Ações principais |
|-------|--------|------------------|
| auth | token, isAuthenticated | login, logout, hydrateFromStorage |
| user | profile | fetchMe, clear |
| app | sidebarOpen, theme | toggleSidebar |
| notifications | items[], unreadCount | push, markRead, clear |

Getter `isAuthenticated` deriva de token válido + user opcional.

## Prevenção de overfetching

1. **`useFetchOnce` composable**: executa fetch só se store não tiver dados ou `force=true`
2. **Dedupe**: mesma request em flight não dispara segunda chamada
3. **Pinia como cache** de listagens compartilhadas entre views
4. **Lazy routes** para code-splitting
5. Evitar `watch` amplo que refetcha a cada mudança de rota

## Componentes UI base

Todos em `components/ui/` ou `components/feedback/`:

- Props tipadas com `defineProps<T>()`
- Emits tipados com `defineEmits<T>()`
- Variants via props (`variant: 'primary' | 'secondary' | 'danger'`)
- Classes Tailwind; Flowbite onde fizer sentido
- Acessibilidade: labels, `aria-*` em modais e alerts

Lista: BaseButton, BaseInput, BaseSelect, BaseTextarea, BaseModal, BaseCard, BaseTable, BaseBadge, BaseAlert, LoadingSpinner, EmptyState

## Variáveis de ambiente

```
VITE_API_BASE_URL=/api
VITE_APP_NAME=Glow Up Connect
VITE_TOKEN_HEADER=x-glow-token
```

Dev usa proxy Vite (`/api` → `localhost:5127`). Prod usa URL completa.

## O que NÃO fazer

- Chamadas Axios diretas em `.vue`
- Store gigante monolítica
- Rotas sem lazy loading no dashboard
- Duplicar lógica de auth em múltiplos guards
- Criar dezenas de views fake de módulos inexistentes
- Ignorar tratamento de loading/error nas views

## Entregáveis ao concluir Fase 1

1. Árvore de pastas criada
2. Breve README explicando estrutura
3. App executável com `npm run dev`
4. Fluxo login → dashboard (mock ou API real) funcional estruturalmente

## Evolução por novos módulos

Para cada feature (ex.: agendamentos, clientes):

```
views/dashboard/<feature>/
services/<feature>Service.ts
types/<feature>.types.ts
router/routes/dashboard.routes.ts  # + rota lazy
components/ (só se reutilizável)
```

Reutilizar componentes UI base; extrair composable se lógica > ~30 linhas na view.

## Referências bundled

- Detalhes de pastas: `references/folder-structure.md`
- Contrato API mínimo: `references/api-contract.md`
- Snippets de código: `references/code-snippets.md`
- Template de env: `assets/env.example`
