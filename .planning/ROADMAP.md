# Roadmap: Flying Studio Tools

## Overview

Transformar o site institucional atual em um hub interno de ferramentas de IA. A jornada tem duas fases: primeiro limpar o codebase e estabelecer a fundação de auth (sem isso, nada pode ser construída com segurança); depois construir o produto em si — catálogo de ferramentas e o loop completo de interação com agente. Ao final da Phase 2, qualquer membro da equipe abre o browser, loga, escolhe uma ferramenta, interage com o agente e recebe o resultado em tempo real.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (1.1, 1.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation and Migration** - Remover código morto, estabelecer auth e infraestrutura de servidor (completed 2026-03-23)
- [x] **Phase 2: Tool Catalog and Architecture Foundation** - Catálogo de ferramentas em `/tools`, padrão arquitetural de agentes e infraestrutura compartilhada de jobs (completed 2026-03-23)
- [x] **Phase 3: Pesquisador Agent Integration** - Integração completa do Pesquisador: upload PDF → polling → endereço condicional → relatório Markdown (completed 2026-03-23)
- [x] **Phase 4: LUMEN Foundation — Backend + Search + Job Lifecycle** - Backend job_id isolation, registro do agente no catálogo, formulário de busca e ciclo de vida completo do job assíncrono com cancelamento (completed 2026-03-28)
- [x] **Phase 5: LUMEN Search Results** - Visualização de leads isolada por job: lista com score, detalhes em slide-over e export XLSX da pesquisa (completed 2026-03-29)
- [x] **Phase 6: LUMEN Global Leads Database** - Banco global de leads com painel de filtros, paginação server-side e export XLSX com filtros ativos (completed 2026-03-30)
- [x] **Phase 7: LUMEN Search History** - Histórico de pesquisas anteriores com re-abertura dos resultados por job_id (completed 2026-03-30)
- [x] **Phase 8: Area Segmentation** - Home `/tools` reestruturada em cards de área com navegação para páginas por slug (completed 2026-03-31)
- [x] **Phase 9: Auth Infrastructure** - Tabela tool_permissions, contas individuais, middleware de permissão e estado bloqueado no ToolCard (completed 2026-03-31)
- [x] **Phase 10: Admin Panel** - Painel `/admin` com CRUD completo de membros e permissões por ferramenta (completed 2026-04-01)

## Phase Details

### Phase 1: Foundation and Migration
**Goal**: Codebase limpo, login/logout funcionando e todas as rotas de ferramentas protegidas por auth
**Depends on**: Nothing (first phase)
**Requirements**: MIG-01, MIG-02, MIG-03, MIG-04, AUTH-01, AUTH-02, AUTH-03
**Success Criteria** (what must be TRUE):
  1. Usuário acessa `/login`, insere a senha da equipe e é redirecionado para a home
  2. Usuário não autenticado que tenta acessar `/tools/*` é redirecionado para `/login`
  3. Usuário autenticado pode fazer logout e é redirecionado para `/login`
  4. Nenhuma rota de portfolio (cases, flying-news, imagens-3d, etc.) existe mais no site
  5. Header e footer com identidade visual (roxo #7E54FE, tipografia Outfit, dark/light mode) estão presentes e funcionando
**Plans**: 4 plans

Plans:
- [ ] 01-01-PLAN.md — Wave 0: scaffolding de testes para MIG-03, AUTH-01/02/03
- [ ] 01-02-PLAN.md — Limpeza completa: remover rotas, componentes, dependências e simplificar home/sidebar
- [ ] 01-03-PLAN.md — Infraestrutura de auth: supabase-server, middleware, logout action, tool registry
- [ ] 01-04-PLAN.md — Login page com formulário de senha + checkpoint visual

### Phase 2: Tool Catalog and Architecture Foundation
**Goal**: Usuário autenticado acessa `/tools`, vê o catálogo de ferramentas com status visual, e a infraestrutura extensível de agentes está pronta para receber o Pesquisador
**Depends on**: Phase 1
**Requirements**: CAT-01, CAT-02, ARCH-01
**Success Criteria** (what must be TRUE):
  1. Usuário autenticado acessa `/tools` e vê um grid de cards com nome, descrição e status de cada ferramenta
  2. Cards de ferramentas "em breve" têm aparência visual distinta (badge, opacidade reduzida) — não são clicáveis
  3. Adicionar uma nova ferramenta ao catálogo requer apenas criar arquivos em `components/agents/[slug]/` e adicionar uma linha em `config/tools.ts` — sem modificar código existente
  4. Hooks compartilhados (`useJobCreate`, `useJobPolling`) e componentes de UI genéricos (`AgentShell`, `MarkdownOutput`, `JobStatusBadge`) existem e têm testes unitários passando
  5. Tipos de job (`JobStatus`, `JobResult`) estão definidos e tipagem TypeScript compila sem erros
**Plans**: 4 plans

Plans:
- [ ] 02-01-PLAN.md — Wave 0: scaffolding de 7 arquivos de teste stub (ToolCard, ToolsPage, hooks, componentes)
- [ ] 02-02-PLAN.md — Wave 1: tipos de job (src/types/job.ts) + hooks reutilizáveis (useJobCreate, useJobPolling)
- [ ] 02-03-PLAN.md — Wave 2: componentes UI compartilhados (ToolCard, AgentShell, JobStatusBadge, MarkdownOutput)
- [ ] 02-04-PLAN.md — Wave 3: páginas (catálogo + rota dinâmica) + middleware + checkpoint visual

### Phase 3: Pesquisador Agent Integration
**Goal**: Usuário da equipe faz upload de um PDF, acompanha o processamento em tempo real, insere endereço quando solicitado e lê o relatório completo formatado na página
**Depends on**: Phase 2
**Requirements**: PESQ-01, PESQ-02, PESQ-03, PESQ-04, PESQ-05, PESQ-06, PESQ-07
**Success Criteria** (what must be TRUE):
  1. Usuário arrasta um PDF (ou usa botão) para a área de upload e o job é criado na API — validação de tipo e tamanho acontece no cliente antes do upload
  2. Enquanto o pipeline executa (3-10 min), o usuário vê spinner com mensagens de status rotativas e um timer de tempo decorrido — sem barra de progresso falsa com percentual
  3. Quando o backend detecta necessidade de endereço, o formulário de endereço aparece inline substituindo o spinner — o usuário insere e o polling retoma automaticamente após o submit
  4. Ao concluir, o relatório Markdown completo é renderizado na página com formatação (tabelas, negrito, blocos de código com syntax highlighting)
  5. Usuário pode fazer download do relatório como arquivo `.md` e copiar o conteúdo para o clipboard com um clique
  6. Quando o job falha, uma mensagem de erro útil é exibida e o usuário pode tentar novamente com o mesmo PDF ou fazer upload de um novo
**Plans**: 4 plans

Plans:
- [x] 03-01-PLAN.md — Wave 0: configuração ESM (jest.config.ts, next.config.mjs, styleMock) + scaffolding de 7 arquivos de teste
- [x] 03-02-PLAN.md — Wave 1: instalar dependências ESM + upgrade MarkdownOutput para react-markdown + hook useAddressSubmit
- [x] 03-03-PLAN.md — Wave 2: componentes filhos (DropZone, PollingProgress, AddressForm, ReportView) com testes
- [ ] 03-04-PLAN.md — Wave 3: PesquisadorAgent orchestrator + registro em AGENT_COMPONENTS + checkpoint visual

### Phase 4: LUMEN Foundation — Backend + Search + Job Lifecycle
**Goal**: O agente LUMEN aparece no catálogo, o backend suporta isolamento de leads por job_id, e o usuário pode executar uma busca completa — do formulário ao polling ao cancelamento — sem ver resultados ainda
**Depends on**: Phase 3
**Requirements**: BACK-01, BACK-02, BACK-03, LUMEN-01, LUMEN-02, LUMEN-03, LUMEN-04, LUMEN-05
**Success Criteria** (what must be TRUE):
  1. LUMEN aparece no catálogo `/tools` como ferramenta ativa e clicável com ícone próprio
  2. Usuário preenche cidade (obrigatório), seleciona ao menos um dos 5 segmentos e opcionalmente uma query livre — erros de validação aparecem inline ao submeter, não ao digitar
  3. Ao submeter o formulário, um job assíncrono é criado na API e o polling inicia automaticamente; o formulário fica desabilitado enquanto o job está ativo
  4. Enquanto o job executa, o usuário vê contadores ao vivo (encontrados / novos / duplicados) atualizando a cada ciclo de polling e uma barra de progresso determinística baseada em `progress_pct`
  5. Usuário pode cancelar um job em andamento — o polling para, o estado `cancelled` é exibido corretamente e o formulário volta a ficar habilitado
**Plans**: 4 plans

Plans:
- [ ] 04-01-PLAN.md — Wave 0: scaffolding de 3 arquivos de teste stub (LumenSearchForm, LumenJobProgress, LumenAgent)
- [ ] 04-02-PLAN.md — Wave 1: extensão de tipos/hooks/badge + registro LUMEN no catálogo + API proxy + backend handoff doc
- [ ] 04-03-PLAN.md — Wave 2: componentes filhos (LumenSearchForm, LumenJobProgress)
- [ ] 04-04-PLAN.md — Wave 3: LumenAgent orchestrator + checkpoint visual

### Phase 5: LUMEN Search Results
**Goal**: Ao concluir uma busca, o usuário vê exclusivamente os leads daquela pesquisa — nunca de outras buscas — podendo inspecionar detalhes e exportar
**Depends on**: Phase 4
**Requirements**: LUMEN-06, LUMEN-07, LUMEN-08, LUMEN-09
**Success Criteria** (what must be TRUE):
  1. Após job concluído, a lista de leads exibe APENAS os leads do `job_id` atual — leads de buscas anteriores com os mesmos parâmetros não aparecem
  2. Cada lead na lista mostra nome, cidade, segmento, website, telefone, badge de score (0–100 colorido por faixa: vermelho/amarelo/verde) e status do scraping
  3. Usuário clica em um lead e um slide-over abre com contatos Apollo (nome, cargo, email com nível de confiança, LinkedIn, telefone), keywords detectadas no site e composição do score — a lista de fundo permanece visível e acessível
  4. Usuário clica em "Exportar XLSX" e faz download de um arquivo com os leads da pesquisa atual, preservando o `job_id` como filtro da requisição ao backend
**Plans**: 5 plans

Plans:
- [ ] 05-01-PLAN.md — Wave 0: test stubs para SearchLeadsList, LeadScoreBadge, LeadDetailPanel + append stubs ao LumenAgent.test.tsx
- [ ] 05-02-PLAN.md — Wave 1: src/types/lumen.ts (Lead, ApolloContact, ScoreBreakdown, LeadsResponse) + LeadScoreBadge com testes reais
- [ ] 05-03-PLAN.md — Wave 2: SearchLeadsList (fetch + tabela + estados loading/empty/error) com testes reais
- [ ] 05-04-PLAN.md — Wave 3: LeadDetailPanel (slide-over com contacts, keywords, score breakdown) com testes reais
- [ ] 05-05-PLAN.md — Wave 4: LumenAgent completed view rewrite + Export XLSX + wiring + checkpoint visual

### Phase 6: LUMEN Global Leads Database
**Goal**: O usuário pode acessar o banco completo de leads de forma deliberada e independente de qualquer pesquisa em curso, com filtros funcionais, paginação e export
**Depends on**: Phase 5
**Requirements**: LUMEN-10, LUMEN-11, LUMEN-12, LUMEN-13
**Success Criteria** (what must be TRUE):
  1. O banco global é acessível apenas via ação explícita do usuário (aba ou CTA dedicado) — nunca é exibido automaticamente ao concluir uma pesquisa
  2. Usuário aplica filtros de cidade (texto), segmento (select), score mínimo (número) e data de criação a partir de (date input) e a lista atualiza refletindo os filtros; ao trocar qualquer filtro a paginação volta à página 1
  3. A lista exibe até 50 leads por página ordenados por score decrescente, com controles de paginação funcionando via server-side pagination
  4. Usuário exporta os leads do banco global com os filtros ativos aplicados — o arquivo XLSX baixado contém apenas os registros correspondentes aos filtros selecionados
**Plans**: 5 plans

Plans:
- [ ] 06-01-PLAN.md — Wave 1: instalar nuqs + jest ESM config + NuqsAdapter em Providers + 4 stub files + LumenAgent stubs
- [ ] 06-02-PLAN.md — Wave 2: LumenAgent tab switcher ("Busca" / "Banco de Leads") + LUMEN-10 tests
- [ ] 06-03-PLAN.md — Wave 2: GlobalLeadsFilters com nuqs useQueryStates + LUMEN-11 tests (parallel com 06-02)
- [ ] 06-04-PLAN.md — Wave 3: GlobalLeadsTable + GlobalLeadsPagination + LUMEN-12 tests
- [ ] 06-05-PLAN.md — Wave 4: GlobalLeadsView orchestrator + LUMEN-13 export + full suite + checkpoint visual

### Phase 7: LUMEN Search History
**Goal**: O usuário pode consultar todas as pesquisas anteriores e re-abrir os resultados de qualquer busca concluída sem precisar repetir a pesquisa
**Depends on**: Phase 6
**Requirements**: LUMEN-14, LUMEN-15
**Success Criteria** (what must be TRUE):
  1. Usuário vê uma lista cronológica de pesquisas anteriores com cidade, segmentos, status (badge visual), totais (encontrados / novos / duplicados) e data de execução
  2. Usuário clica em uma pesquisa concluída do histórico e vê os leads daquela busca específica carregados diretamente — sem disparar novo polling para jobs já terminados
**Plans**: 2 plans

Plans:
- [ ] 07-01-PLAN.md — Wave 1: SearchHistoryItem types + SearchHistoryList component + full test coverage (LUMEN-14)
- [ ] 07-02-PLAN.md — Wave 2: LumenAgent 3-tab wiring + historicalJobId state path + visual checkpoint (LUMEN-15)

### Phase 8: Area Segmentation
**Goal**: A home `/tools` organiza as ferramentas por área departamental, e cada área tem sua própria página com o catálogo filtrado
**Depends on**: Phase 7
**Requirements**: AREA-01, AREA-02, AREA-03, AREA-04, AREA-05, AREA-06
**Success Criteria** (what must be TRUE):
  1. Usuário autenticado acessa `/tools` e vê 6 cards de área (PRODUÇÃO, RH, ANIMAÇÃO, MARKETING, COMERCIAL, OPERACIONAL) — o grid direto de ferramentas não aparece mais na home
  2. Cada card de área exibe o nome da área e a contagem de ferramentas disponíveis nela
  3. Usuário clica em um card e navega para `/tools/{slug}` (ex: `/tools/comercial`), onde vê as ferramentas daquela área com o mesmo padrão visual de cards atual
  4. Página de área sem ferramentas cadastradas exibe mensagem "Nenhuma ferramenta disponível nesta área ainda" em vez de grid vazio
  5. Uma ferramenta configurada para múltiplas áreas aparece corretamente nas páginas de todas as suas áreas
**Plans**: 3 plans

Plans:
- [ ] 08-01-PLAN.md — Wave 0: Extend tools.ts with AREAS config + area test stubs (AREA-01–AREA-06)
- [ ] 08-02-PLAN.md — Wave 1: AreaCard implementation + /tools home rewrite as area hub (AREA-01–AREA-03)
- [ ] 08-03-PLAN.md — Wave 2: [slug]/page.tsx area dispatch + AreaPageContent + visual checkpoint (AREA-03–AREA-06)

### Phase 9: Auth Infrastructure
**Goal**: Ferramentas restritas exibem estado bloqueado para quem não tem permissão, e contas individuais coexistem com o login compartilhado sem quebrar o acesso existente
**Depends on**: Phase 8
**Requirements**: PERM-01, PERM-02, PERM-03, PERM-04, PERM-05
**Success Criteria** (what must be TRUE):
  1. Ferramenta marcada como restrita exibe estado bloqueado ("Você não tem acesso a esta ferramenta. Contate o administrador.") para usuário sem entrada em `tool_permissions` — não é redirecionamento, é estado visual na própria página da ferramenta
  2. Usuário autenticado via login compartilhado (team@flyingstudio.com.br) continua acessando ferramentas sem restrição normalmente — nenhuma regressão no fluxo existente
  3. Usuário com conta individual (email + senha pessoal, criado via Supabase Auth) consegue fazer login e acessar as ferramentas para as quais tem permissão na tabela `tool_permissions`
  4. Tabela `tool_permissions(user_id, tool_slug)` existe no Supabase e o middleware a consulta antes de renderizar ferramentas restritas
  5. Campo `role` em `app_metadata` do usuário autenticado diferencia `admin` de `member` — acessível via session no frontend
**Plans**: 3 plans

Plans:
- [ ] 09-01-PLAN.md — Wave 1: Nyquist stubs — LockedToolShell stub file + test stubs + LoginPage.test.tsx PERM-02/03 stubs
- [ ] 09-02-PLAN.md — Wave 2: Tool config extension (requiresAuth) + LockedToolShell real implementation + Supabase migration checkpoint
- [ ] 09-03-PLAN.md — Wave 3: page.tsx permission guard + LoginForm individual toggle + visual checkpoint

### Phase 10: Admin Panel
**Goal**: Administrador gerencia membros e seus acessos por ferramenta diretamente em `/admin`, sem precisar tocar no Supabase Dashboard
**Depends on**: Phase 9
**Requirements**: PERM-06, PERM-07, PERM-08, PERM-09, PERM-10
**Success Criteria** (what must be TRUE):
  1. Usuário com `role=admin` acessa `/admin` — usuário com `role=member` que tenta acessar `/admin` é redirecionado pelo middleware sem ver conteúdo da página
  2. Admin vê lista de todos os membros com nome, email, role e ferramentas autorizadas para cada um
  3. Admin cria novo membro preenchendo nome, email, senha temporária, role e ferramentas autorizadas — o usuário é criado via Supabase Admin API e aparece na lista imediatamente
  4. Admin seleciona um membro existente e adiciona ou remove permissões por ferramenta — as mudanças persistem em `tool_permissions` e são refletidas na lista sem reload completo da página
  5. Admin remove ou desativa um membro — o usuário perde acesso ao site imediatamente sem precisar aguardar expiração de sessão
**Plans**: 3 plans

Plans:
- [ ] 10-01-PLAN.md — Wave 0: test stubs — middleware admin guard stubs + 5 component stub files (PERM-06–PERM-10)
- [ ] 10-02-PLAN.md — Wave 1: supabase-admin.ts + middleware /admin guard + admin page server component + MemberList/MemberRow (PERM-06, PERM-07)
- [ ] 10-03-PLAN.md — Wave 2: Server Actions (createMember, updatePermissions, disableMember, deleteMember) + CreateMemberForm + EditPermissionsForm + MemberRow actions + visual checkpoint (PERM-08, PERM-09, PERM-10)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation and Migration | 4/4 | Complete | 2026-03-23 |
| 2. Tool Catalog and Architecture Foundation | 4/4 | Complete | 2026-03-23 |
| 3. Pesquisador Agent Integration | 4/4 | Complete | 2026-03-23 |
| 4. LUMEN Foundation — Backend + Search + Job Lifecycle | 4/4 | Complete    | 2026-03-29 |
| 5. LUMEN Search Results | 5/5 | Complete   | 2026-03-29 |
| 6. LUMEN Global Leads Database | 5/5 | Complete   | 2026-03-30 |
| 7. LUMEN Search History | 2/2 | Complete    | 2026-03-31 |
| 8. Area Segmentation | 3/3 | Complete    | 2026-03-31 |
| 9. Auth Infrastructure | 3/3 | Complete   | 2026-03-31 |
| 10. Admin Panel | 3/3 | Complete   | 2026-04-01 |
