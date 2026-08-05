# Implementações — Glow Up Connect

Documento consolidado das funcionalidades, refatorações e melhorias realizadas em **glow-up-connect-app** (frontend) e **glow-up-connect-api** (backend).

---

## 1. Modo mockado (frontend — sem depender da API)

Permite rodar o app 100% offline com dados fictícios, para validar/corrigir telas.

- **Ativação**: `npm run dev:mock` → `.env.mock` (`VITE_USE_MOCKS=true`) + script no `package.json`.
- **Infra** em `src/mocks/`: `config.ts` (flag), `response.ts` (helpers `ok`/`okRaw`/`voidOk`), `match.ts` (roteador `method+path` com `:params`), `index.ts` (adapter axios que intercepta e devolve dados fictícios; loga `[mock] SEM HANDLER`).
- **Seeds** em `src/mocks/seed/`: usuário/estabelecimentos, catálogo (serviços, equipe, clientes, horários), financeiro (metas, comissões, movimentos, contas, caixa, dashboard), agenda/avaliações, plataforma (planos, perfil, assinatura, rede, auditoria).
- **Handlers** por domínio em `src/mocks/handlers/` (core, financeiro, catálogo, agenda, público).
- **Integração**: `api.ts` (interceptor define o adapter) e `main.ts` (desativa request-proof no mock).

## 2. Comissões por Metas — refatoração da tela (frontend)

A tela de Metas deixou de ser um mini-dashboard e virou um gerenciador de metas por profissional.

- **Tipos** (`src/types/negocio/caixa.types.ts`): `MetaComissaoProfissional`, `MetaComissaoDetalhe`, `MetaComissaoEvolucaoItem`, `MetaComissaoNotificacoes`, `ComissaoMetasFiltro`.
- **Service** (`caixaService.ts`): `listarMetasComissao`, `obterMetaComissaoDetalhe`, `reativarMeta`, `concluirMeta`.
- **Views/Components**: `MetasView.vue` reescrito (filtro de mês, lista por profissional, status Em andamento/Concluída/Cancelada) + `MetaComissaoDetalheModal.vue` (progresso, restante, comissão, responsável, evolução e automação de conclusão).
- **Automação**: botão "Concluir meta" dispara `POST /financeiro/metas/:id/concluir` e preenche `notificacoes` (e-mail, WhatsApp, loja, log de auditoria) — uma única vez.
- **Mock**: seeds + handlers das rotas novas.

## 3. Sidebar Premium (frontend)

Redesign completo da sidebar para visual SaaS premium.

- **Dependência**: `lucide-vue-next`.
- **Componentes** em `src/components/sidebar/`: `Sidebar`, `SidebarHeader`, `SidebarWorkspace`, `SidebarGroup`, `SidebarItem`, `SidebarSubmenu`, `SidebarFooter`, `SidebarThemeCard`, `SidebarTooltip`, `sidebarIcons.ts`, `useSidebarNav.ts`.
- **Estado** (`app.store`): `openSubmenuKeys` (preserva submenus ao recolher) + persistência de `sidebarCollapsed` em `localStorage`.
- **Integração**: `DashboardLayout.vue` usa a nova `Sidebar` (desktop + drawer mobile).
- Refinamento dos itens (altura 48–56px, ícones em container, hover/ativo com gradiente+glow, badges, submenus com animação).

## 4. Redesign dos Dashboards (frontend)

- **Home do Cliente** (`DashboardClienteView.vue`): hero com saudação + CTA, card de próximo agendamento (ou empty state), stats, progresso de perfil com checklist, ações rápidas, recomendados (carrossel), histórico, favoritos e banner-CTA. Componentes em `src/components/dashboard/cliente/` (`DashboardHero`, `NextAppointmentCard`, `StatsGrid`, `StatCard`, `ProfileCompletion`, `QuickActions`, `RecommendationsCarousel`, `FavoriteProfessionals`, `HistoryTimeline`, `PromotionBanner`, `EmptyState`).
- **Dashboard do Profissional** (`DashboardProfissionalView.vue`): hero de saudação, stats, ações rápidas, card de link e listas de atendimentos/avaliações.
- **Dashboard da Loja** (`DashboardNegocioView.vue`): hero com greeting + eyebrow (plano · role), mantendo KPIs, gráficos, insights, equipe e prévia da agenda.
- **Mock**: status de agendamentos ajustados (Confirmado/Concluído) para os cenários renderizarem.

## 5. Regras de acesso por perfil e plano (frontend mock + backend)

- **Mock** (`src/mocks/seed/usuario.ts`): perfis por e-mail (Dono Premium/Plus/Básico, Administrador, Recepcionista, Profissional, Cliente) com escopo de filiais por plano (Básico/Plus = principal; Premium = todas) e não-dono = própria filial.
- **AuthZ central no mock** (`src/mocks/index.ts`): 403 para `/estabelecimentos/{id}/...` fora do escopo do perfil logado.
- **Backend** (`glow-up-connect-api`): `ListarEstabelecimentosAsync` limita o Dono ao plano (Básico/Plus = matriz; Premium = todas); `GET /assinaturas/atual` guardado com `RequerPermissaoNegocio`. Solução completa compila.

## 6. Loading Global Premium (frontend)

Sistema de loading global e independente (não altera layout/sidebar/páginas).

- **Store** (`src/stores/loading.store.ts`): contador de operações, navegação, `manual`, debounce (evita flash), timeout de segurança, mensagem, progresso e modos (`fullscreen`/`modal`/`inline`).
- **Composable** (`src/composables/useLoading.ts`): `open/close/setMessage/setProgress/start/finish`.
- **Componentes** em `src/components/loading/`: `GlobalLoader`, `LoaderAnimation` (anel em gradiente + logo respirando + partículas), `LoaderOverlay` (backdrop blur translúcido, sem fundo preto).
- **Integração**: `App.vue` monta o loader; `router/index.ts` (`beforeEach`/`afterEach`/`onError`); `api.ts` (interceptors com contagem de concorrência, excluindo `/auth/refresh` e `/security/request-proof`).
- **Acessibilidade**: `role="status"`, `aria-busy` e `prefers-reduced-motion`.

## 7. Categoria de Estabelecimento + Sexo do Usuário + Explorar com filtro

- **Frontend**: tipos (`EstabelecimentoCategoria`, `categoria`/`sexo`), mock (catálogo + campos), onboarding (categoria obrigatória + sexo), register/perfil (sexo), perfil da loja (categoria), **Explorar Lojas** com filtro por categoria + persistência em `localStorage`.
- **Backend** (`glow-up-connect-api`): entidades `CategoriaEstabelecimento` + `Estabelecimento.CategoriaEstabelecimentoId` e enum `Sexo` + `Usuario.Sexo`; migration `AddCategoriaEstabelecimentoESexo` (com seed Barbearia/Salão de Beleza); DTOs/validações/services/response DTOs; repos com `.Include(CategoriaEstabelecimento)`; endpoint `GET /publico/estabelecimentos/categorias` e filtro `categoriaId` no `listarProximos`. *Relatórios/segmentação ficam para o super admin (fora do escopo atual).*

## 8. Refatoração da navegação + Banner Premium (frontend)

- **Dropdown "Minha Conta" eliminado**: itens "Meu perfil" e "Abrir minha loja" movidos para a sidebar (sempre visíveis, respeitando permissões).
- **Sidebar reorganizada** em grupos: **Principal** (Dashboard, Agenda, Clientes, Serviços, Profissionais), **Financeiro** (Visão geral, Comissões, Planos e assinatura, Faturas), **Configurações** (Dados da loja, Equipe, Horários, WhatsApp, Auditoria, Privacidade, Meu perfil).
- **Banner Premium inteligente** (`SidebarPremiumBanner.vue`): usuário free/não-Premium → CTA de upgrade (gradiente + glow); usuário Premium → card de status (plano, status, próxima renovação, "Gerenciar assinatura").
- **Rodapé** simplificado (menu do usuário só com "Sair").
- **Busca da sidebar removida** e **badges config-driven** (campo `badge` em `NavItem`).

---

## Resumo de arquivos (referência)

- **Frontend** (`glow-up-connect-app`): `src/mocks/*`, `src/components/sidebar/*`, `src/components/loading/*`, `src/components/dashboard/*`, `src/views/dashboard/*`, `src/constants/navigation.ts`, `src/stores/{app,loading}.store.ts`, `src/composables/{useLoading,useDashboardNav}.ts`, `src/types/*`, `src/services/*`.
- **Backend** (`glow-up-connect-api`): `src/GLOWAPI.Domain/Entities/{Estabelecimento,Usuario,CategoriaEstabelecimento}.cs`, `src/GLOWAPI.Domain/Enums/Sexo.cs`, `src/GLOWAPI.Infrastructure/Configurations/*`, `src/GLOWAPI.Infrastructure/Migrations/*`, `src/GLOWAPI.Application/DTOs/*`, `src/GLOWAPI.Application/Services/*`, `src/GLOWAPI.Application/Interfaces/*`, `src/GLOWAPI.Infrastructure/Repositories/*`, `src/GLOWAPI.API/Controllers/*`.
