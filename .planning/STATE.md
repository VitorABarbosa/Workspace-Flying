---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: planning
stopped_at: Completed 10-01-PLAN.md — Phase 10 Wave 0 test stubs created
last_updated: "2026-03-31T23:21:22.720Z"
last_activity: 2026-03-30 — v1.3 roadmap created (Phases 8–10 defined, 16 requirements mapped)
progress:
  total_phases: 10
  completed_phases: 9
  total_plans: 37
  completed_plans: 35
  percent: 94
---

---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: planning
stopped_at: Phase 9 UI-SPEC approved
last_updated: "2026-03-31T16:15:13.933Z"
last_activity: 2026-03-30 — v1.3 roadmap created (Phases 8–10 defined, 16 requirements mapped)
progress:
  [█████████░] 94%
  completed_phases: 8
  total_plans: 31
  completed_plans: 31
  percent: 60
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-30)

**Core value:** A equipe da Flying Studio acessa e usa agentes de IA diretamente no browser, sem fricção — abre a ferramenta, interage, recebe resultado.
**Current focus:** Milestone v1.3 — Areas & Auth

## Current Position

Phase: Phase 7 (LUMEN Search History) — not started
Plan: —
Status: Roadmap created, ready to plan Phase 7 then Phases 8–10
Last activity: 2026-03-30 — v1.3 roadmap created (Phases 8–10 defined, 16 requirements mapped)

Progress: [████████████████░░░░░░░░░░░░] 60% (6/10 phases complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 4 (Phase 1)
- Average duration: ~12 min/plan
- Total execution time: ~50 min

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| Phase 01-foundation-and-migration P01-01 | 7 | 2 tasks | 4 files |
| Phase 01-foundation-and-migration P01-02 | 25 | 2 tasks | 11 files |
| Phase 01-foundation-and-migration P01-03 | 3 | 2 tasks | 8 files |
| Phase 01-foundation-and-migration P01-04 | 15 | 1 tasks | 3 files |

**Recent Trend:**
- Last 5 plans: Phase 1 complete (4 plans)
- Trend: Steady

*Updated after each plan completion*
| Phase 03-pesquisador P01 | 2min | 2 tasks | 10 files |
| Phase 02 P01 | 3 | 3 tasks | 7 files |
| Phase 02-tool-catalog-and-architecture-foundation P02 | 3min | 2 tasks | 5 files |
| Phase 02-tool-catalog-and-architecture-foundation P03 | 4min | 2 tasks | 9 files |
| Phase 02-tool-catalog-and-architecture-foundation P04 | 5min | 2 tasks | 7 files |
| Phase 02-tool-catalog-and-architecture-foundation P04 | 70min | 3 tasks | 7 files |
| Phase 03-pesquisador-agent-integration P02 | 2min | 2 tasks | 5 files |
| Phase 03 P04 | 6min | 2 tasks | 4 files |
| Phase 04-lumen-foundation-backend-search-job-lifecycle P01 | 5min | 2 tasks | 3 files |
| Phase 04 P02 | 308 | 2 tasks | 10 files |
| Phase 04-lumen-foundation-backend-search-job-lifecycle P03 | 157 | 2 tasks | 2 files |
| Phase 04 P04 | 2 | 1 tasks | 1 files |
| Phase 05-lumen-search-results P01 | 2 | 2 tasks | 4 files |
| Phase 05-lumen-search-results PP02 | 1 | 2 tasks | 3 files |
| Phase 05-lumen-search-results P03 | 3 | 1 tasks | 2 files |
| Phase 05-lumen-search-results P04 | 8 | 1 tasks | 2 files |
| Phase 05-lumen-search-results P05 | 18 | 1 tasks | 2 files |
| Phase 06-lumen-global-leads-database P01 | 8 | 2 tasks | 9 files |
| Phase 06-lumen-global-leads-database P02 | 4 | 2 tasks | 3 files |
| Phase 06-lumen-global-leads-database PP03 | 4 | 2 tasks | 3 files |
| Phase 06-lumen-global-leads-database P04 | 8 | 2 tasks | 4 files |
| Phase 06-lumen-global-leads-database PP05 | 5min | 3 tasks | 2 files |
| Phase 07-lumen-search-history P01 | 3 | 2 tasks | 3 files |
| Phase 07-lumen-search-history P02 | 10 | 2 tasks | 2 files |
| Phase 08-area-segmentation P01 | 138 | 2 tasks | 6 files |
| Phase 08-area-segmentation P02 | 8 | 2 tasks | 4 files |
| Phase 08-area-segmentation P03 | 2 | 1 tasks | 2 files |
| Phase 09-auth-infrastructure P01 | 2 | 2 tasks | 3 files |
| Phase 09-auth-infrastructure P02 | 8 | 1 tasks | 3 files |
| Phase 09-auth-infrastructure P02 | 8 | 2 tasks | 3 files |
| Phase 09-auth-infrastructure P03 | 60 | 3 tasks | 3 files |
| Phase 10-admin-panel P01 | 5 | 2 tasks | 6 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Supabase Auth (`@supabase/ssr`) para autenticação — já integrado, sem nova dependência
- Middleware Next.js protege tanto `/tools/*` quanto `/api/tools/*` — crítico para segurança
- Config-driven tool registry (`src/config/tools.ts`) — adicionar nova ferramenta = uma linha de config
- [Phase 01-foundation-and-migration]: fs.readFileSync para testar Server Components — evita problemas de contexto SSR no jsdom
- [Phase 01-foundation-and-migration]: it.todo como contrato de testes para módulos inexistentes — evita erros de compilação antes da implementação
- [Phase 01-foundation-and-migration]: Testes de portfolio em subdiretórios deletados junto com os componentes — sem sentido manter testes de código inexistente
- [Phase 01-foundation-and-migration]: Testes de layout atualizados para refletir implementação real (fixed vs sticky, 1 link vs 9, bg-[#0D0D0D] vs bg-brand-dark)
- [Phase 01-foundation-and-migration]: jest.mock() factory inline para next/server evita hoisting issue com const antes de jest.mock
- [Phase 01-foundation-and-migration]: require() síncrono para server actions em testes — import() dinâmico incompatível com jest describe
- [Phase 01-foundation-and-migration]: try/catch em torno de logout() nos testes — redirect() do Next lança NEXT_REDIRECT em contexto de teste
- [Phase 01-foundation-and-migration]: autoFocus testado via document.activeElement em jsdom — React define propriedade DOM, não atributo HTML
- [Phase 01-foundation-and-migration]: signInWithPassword com email fixo oculto (team@flyingstudio.com.br) + router.refresh() obrigatório após login para revalidar cookies
- [v1.1 roadmap]: Pesquisador usa modelo async de batch (upload-then-poll), não streaming — exige arquitetura específica por agente em vez de ToolRunner genérico
- [v1.1 roadmap]: Phase 2 entrega infraestrutura extensível (hooks + tipos + componentes compartilhados) antes da UI do Pesquisador (Phase 3) — separa bugs de UI de bugs de integração
- [v1.1 roadmap]: Upload direto do browser para FastAPI (sem proxy Next.js) — evita limite de 4.5MB do body parser; URL do FastAPI em variável de ambiente validada em startup
- [Phase 02-01]: it.todo() stubs criados antes da implementação conforme padrão Nyquist do projeto
- [Phase 02-01]: Falhas pré-existentes (HeroSubtitleSection, LoginPage) registradas como deferred-items — fora do escopo da Phase 2
- [Phase 02-tool-catalog-and-architecture-foundation]: useJobPolling usa useRef(false) para isTerminal — evita stale closure dentro do callback do setInterval
- [Phase 02-tool-catalog-and-architecture-foundation]: awaiting_input (não awaiting_address) é o estado correto no tipo TypeScript — alinha com backend FastAPI
- [Phase 02-tool-catalog-and-architecture-foundation]: JobStatus.result tipado como unknown na infraestrutura — cada agente faz cast explícito na sua camada
- [Phase 02-tool-catalog-and-architecture-foundation]: icon?: string adicionado à interface Tool como campo opcional — backward-compatible com Phase 1
- [Phase 02-tool-catalog-and-architecture-foundation]: MarkdownOutput é stub Phase 2 com <pre> font-sans — interface estável para Phase 3 substituir por react-markdown
- [Phase 02-tool-catalog-and-architecture-foundation]: AGENT_COMPONENTS map vazio na Phase 2 — pesquisador entra na Phase 3 sem alterar a rota dinâmica
- [Phase 02-tool-catalog-and-architecture-foundation]: Extensao de agente: criar components/agents/[slug]/ + 1 linha tools.ts + 1 linha AGENT_COMPONENTS — padrao extensivel provado na Phase 2
- [Phase 02-tool-catalog-and-architecture-foundation]: Nome de exibição encurtado para 'Pesquisador' (sem 'de Imóveis') por decisão do usuário no checkpoint visual
- [Phase 03-01 Wave 0]: transformIgnorePatterns inclui toda cadeia ESM transitiva de react-markdown (unified, micromark-*, mdast-util-*, etc.)
- [Phase 03-01 Wave 0]: MarkdownOutput.test.tsx substituído integralmente — testes de <pre> incompatíveis com react-markdown; novos stubs testam comportamento react-markdown
- [Phase 03-01 Wave 0]: it.todo() como contrato de teste antes da implementação (Nyquist Rule) — padrão confirmado nas Phases 1, 2 e agora 3
- [Phase 03-02]: rehypeSanitize antes de rehypeHighlight — sanitize primeiro, highlight depois
- [Phase 03-02]: useAddressSubmit segue padrão idêntico ao useJobCreate — mesma estrutura useState + async + try/catch
- [Phase 03-03]: jest.mock MarkdownOutput em ReportView.test.tsx — createJestConfig do Next.js prepende padrões que bloqueiam devlop ESM; mock isola o componente sem tentar transpilar a cadeia inteira
- [Phase 03-03]: Componentes filhos isolados com unit tests antes de serem compostos no PesquisadorAgent (wave 3) — garante correctness individual antes da composição
- [Phase 03]: jest.mocked() com import estático em vez de require() para compatibilidade com @typescript-eslint/no-require-imports
- [Phase 03]: Mock de ReportView em PesquisadorAgent.test.tsx isola cadeia ESM transitiva de react-markdown em testes de composição (padrão análogo ao ReportView mockar MarkdownOutput)
- [v1.2 roadmap]: SearchLeadsList e GlobalLeadsView são componentes separados sem contrato compartilhado — jobId opcional tornaria contaminação cruzada possível e silenciosa
- [v1.2 roadmap]: Backend job_id filter em GET /leads é gate obrigatório antes de Phase 5 — confirmar antes de construir qualquer leads UI
- [v1.2 roadmap]: cancelled deve ser adicionado a TERMINAL_STATES em useJobPolling.ts na Phase 4 — sem isso, jobs cancelados fazem polling indefinidamente
- [v1.2 roadmap]: Sem biblioteca XLSX no frontend — backend serve GET /leads?format=xlsx diretamente
- [v1.2 roadmap]: nuqs para URL-backed filter state no banco global — filtros sobrevivem refresh e navegação de volta
- [v1.2 roadmap]: Segments armazenados como string[] não string — multi-select; string única exigiria split/join em cada render
- [Phase 04-lumen-foundation-backend-search-job-lifecycle]: it.todo() stubs in src/components/agents/lumen/__tests__/ (co-located) not src/__tests__/ — follows VALIDATION.md spec for LUMEN component tests
- [Phase 04-lumen-foundation-backend-search-job-lifecycle]: Wave 0 produces zero failing tests — all stubs are contracts for future waves, not RED/GREEN TDD cycles
- [Phase 04-02]: cancelled added to JobState union and TERMINAL_STATES atomically — prevents silent infinite polling
- [Phase 04-02]: BADGE_CONFIG extended with cancelled entry in same commit as JobState — TypeScript Record<JobState,...> is exhaustiveness gate
- [Phase 04-02]: API proxy at /api/tools/lumen/[...route] — LUMEN uses server-side proxy to avoid CORS issues, unlike Pesquisador which calls backend directly
- [Phase 04-03]: LumenSearchForm uses local state (city, segments, customQuery, errors) — no lifting state up until LumenAgent composes it in Wave 3
- [Phase 04-03]: LumenJobProgress uses internal elapsed timer (useEffect + setInterval) — not driven by parent prop, starts on mount
- [Phase 04-lumen-foundation-backend-search-job-lifecycle]: LumenAgent uses direct fetch with JSON body instead of useJobCreate — LUMEN backend expects application/json not FormData
- [Phase 04-lumen-foundation-backend-search-job-lifecycle]: finalCounts preserved via useEffect on jobStatus — counter values survive view transition to cancelled/completed panels
- [Phase 05-lumen-search-results]: Wave 0 stubs use it.todo() with no imports — component files do not exist yet, avoids compile errors before implementation
- [Phase 05-lumen-search-results]: getScoreConfig threshold function (not Record lookup) for score-based color — mirrors BADGE_CONFIG pattern but comparison-driven
- [Phase 05-lumen-search-results]: lumen.ts has no imports — independent domain types, no coupling to job.ts; ScoreBreakdown index signature enables unknown backend fields
- [Phase 05-03]: fetchKey integer incremented on retry avoids stale closure in useEffect — cleaner than boolean reset flag
- [Phase 05-03]: jobId: string (no ?) enforces LUMEN-06 isolation at TypeScript level — TypeScript prevents accidental undefined leads queries
- [Phase 05-lumen-search-results]: framer-motion mocked via jest.mock factory in LeadDetailPanel tests — AnimatePresence renders children directly, avoids JSDOM animation incompatibility
- [Phase 05-05]: LeadDetailPanel placed outside AnimatePresence to avoid slide-over being unmounted during view transitions
- [Phase 05-05]: mockSearchLeadsList as module-level jest.fn() with get accessor in mock factory — required for per-test mockImplementation to capture callback props with TypeScript
- [Phase 06-lumen-global-leads-database]: NuqsAdapter placed inside ThemeProvider (wrapping its children) — keeps layout.tsx clean, avoids second use-client boundary
- [Phase 06-lumen-global-leads-database]: nuqs added to Jest transformIgnorePatterns allowlist — ESM-only package crashes Jest without this
- [Phase 06-02]: GlobalLeadsView.tsx stub created so Jest module resolution succeeds (jest.mock requires the file to exist)
- [Phase 06-02]: Tab state (activeTab) is independent of AnimatePresence view derivation — switching tabs does not reset jobId/jobStatus/finalCounts
- [Phase 06-lumen-global-leads-database]: jest.config.ts async export post-processes Next.js config to replace all transformIgnorePatterns with unified ESM allowlist — fixes nuqs transform in every jest context
- [Phase 06-04]: GlobalLeadsTable calls useGlobalLeadsFilters internally — no filter props accepted, enforces LUMEN-12 isolation at type boundary
- [Phase 06-04]: min_score param only sent when value > 0 — prevents /api/tools/lumen/leads?min_score=0 noise
- [Phase 06-05]: useGlobalLeadsFilters called inside GlobalLeadsView (not props) for export URL construction — single source of truth
- [Phase 06-05]: module-level mockUseGlobalLeadsFilters = jest.fn() with getter accessor in jest.mock factory — enables per-test mockReturnValueOnce without jest.requireMock
- [v1.3 roadmap]: tool_permissions table lives in Supabase Pesquisador project (aofgtwyszwfbdcauhlwp) temporarily — migration to dedicated frontend project planned for future milestone; migration = env var swap + migrations only (no hardcoded refs)
- [v1.3 roadmap]: Phase 8 (Area Segmentation) is pure frontend — adds `areas: string[]` field to Tool config; no backend work
- [v1.3 roadmap]: Phase 9 (Auth Infrastructure) depends on Phase 8 because `requiresAuth: boolean` field is added to Tool config alongside `areas` — single config extension
- [v1.3 roadmap]: Blocked state UI for restricted tools is an in-page state, not a redirect — preserves context and explains next step ("Contate o administrador")
- [v1.3 roadmap]: Admin panel uses Supabase Admin API (service role key) for user creation — avoids exposing signup endpoint publicly
- [Phase 07-lumen-search-history]: SearchHistoryItem imports JobState from job.ts (Phase 7 intentional coupling — overrides Phase 5 no-import comment)
- [Phase 07-lumen-search-history]: SearchHistoryList uses fetchKey integer increment for retry — same pattern as SearchLeadsList
- [Phase 07-lumen-search-history]: historicalJobId state is separate from live jobId — useJobPolling only receives live jobId, preventing accidental polling of completed historical jobs
- [Phase 07-lumen-search-history]: Historical view renders inside busca tab via ternary (historicalJobId ? historical : live) — avoids a fourth tab, keeps count at 3
- [Phase 07-lumen-search-history]: handleNewSearch clears historicalJobId as first operation — ensures live search flow is clean after exiting historical view
- [Phase 07-lumen-search-history]: historicalJobId state is separate from live jobId — useJobPolling only receives live jobId, preventing accidental polling of completed historical jobs
- [Phase 07-lumen-search-history]: Historical view renders inside busca tab via ternary (historicalJobId ? historical : live) — avoids a fourth tab and keeps count at exactly 3
- [Phase 07-lumen-search-history]: handleNewSearch clears historicalJobId as first operation — ensures live search flow is clean after exiting historical view
- [Phase 08-01]: areas: AreaSlug[] is required (not optional) on Tool interface — enforces area declaration at type level for all current and future tools
- [Phase 08-01]: AreaCard.tsx stub returns null — minimal implementation to unblock jest.mock resolution in Plan 02 tests
- [Phase 08-area-segmentation]: AreaCard 'use client' directive preserved — Link from next/link requires client boundary
- [Phase 08-area-segmentation]: toolCount filters status === 'active' only — coming-soon tools do not count toward available
- [Phase 08-area-segmentation]: No empty-state guard on /tools home — AREAS is a static array always containing 6 entries
- [Phase 08-03]: AreaPageContent inlined in [slug]/page.tsx — 30-line sub-component; separate file adds no value
- [Phase 08-03]: Tool dispatch runs FIRST, area dispatch SECOND — preserves existing pesquisador/lumen routes without regression
- [Phase 09-auth-infrastructure]: LockedToolShell stub returns null — minimal to unblock jest.mock resolution, real UI in Plan 02
- [Phase 09-auth-infrastructure]: [Phase 09-01 Wave 0]: it.todo() stubs committed before implementation (Nyquist Rule) for LockedToolShell (PERM-01) and LoginForm toggle (PERM-02/PERM-03)
- [Phase 09-auth-infrastructure]: [Phase 09-01]: LoginPage.test.tsx extended with append-only describe block — existing AUTH-01 tests untouched
- [Phase 09-auth-infrastructure]: requiresAuth?: boolean added as optional field to Tool interface — undefined/false = no restriction, backward-compatible with all existing tools
- [Phase 09-auth-infrastructure]: LockKeyhole aria-hidden queried via container.querySelector in tests — consistent with existing JobStatusBadge test pattern, safer than document.querySelector
- [Phase 09-auth-infrastructure]: requiresAuth?: boolean added as optional field to Tool interface — undefined/false = no restriction, backward-compatible with all existing tools
- [Phase 09-auth-infrastructure]: Seed row NOT inserted — Admin Panel (Phase 10) manages individual user permissions via Supabase Admin API
- [Phase 09-auth-infrastructure]: getUser() used (not getSession()) in page.tsx — Supabase security requirement: getSession reads cookie without server validation
- [Phase 09-auth-infrastructure]: Permission check placed BEFORE AGENT_COMPONENTS dispatch — requiresAuth guard fires before any component selection (Pitfall 5 avoidance)
- [Phase 09-auth-infrastructure]: loginEmail = showIndividualLogin ? email : TEAM_EMAIL — TEAM_EMAIL preserved, individual path is additive; mode-aware error messages
- [Phase 10-admin-panel]: Wave 0 stubs use it.todo() with no imports of non-existent component files — avoids compile errors before implementation
- [Phase 10-admin-panel]: middleware.test.ts extended append-only — PERM-06 block appended at end of file, existing AUTH-02 describe block untouched

### Phase 4 Prerequisites (confirm before planning)

- Backend: Does `GET /leads` currently support `?job_id=` filter? (BACK-03 — in scope for Phase 4)
- Backend: What is the exact shape of LUMEN job status response — are `progress_pct`, `found`, `new`, `duplicates` top-level fields or embedded in the `progress` JSON string?
- Backend: BACK-01 (add `job_id` column to leads table) and BACK-02 (`check_and_save` writes `job_id`) are Phase 4 backend work items, must be done before Phase 5 leads list can be built

### Pending Todos

- Confirmar com backend: endpoints exatos do FastAPI, formato de resposta por estado (pending/processing/awaiting_address/completed/failed), TTL do estado awaiting_address, limite de tamanho de PDF aceito
- Verificar plano Vercel (Free 10s vs Pro 60s timeout) — impacta se rotas de proxy forem necessárias
- Verificar compatibilidade ESM de react-markdown@10 no next.config.js (possível necessidade de transpilePackages)
- [v1.2] Confirmar com backend LUMEN: shape exato do job status response (campos top-level vs embedded em progress JSON)
- [v1.2] Confirmar antes de Phase 6: mecanismo de export XLSX — direct file response vs pre-signed URL
- [v1.2] Decidir antes de Phase 6: react-day-picker vs native <input type="date"> para filtro created_after
- [v1.3] Confirmar antes de Phase 9: Supabase service role key disponível em env vars do projeto frontend (necessário para Supabase Admin API no painel admin)
- [v1.3] Confirmar antes de Phase 9: RLS policies para tool_permissions — quem pode SELECT (autenticados), INSERT/DELETE (apenas admin via service role)

### Blockers/Concerns

- Interface exata do FastAPI não confirmada — confirmar antes de implementar API routes na Phase 2
- Decisão de arquitetura de upload (direto vs proxy) precisa ser tornada explícita antes da Phase 2

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 260324-ijt | Tela de gerenciamento de relatórios do Pesquisador (lista, delete individual e bulk com limpeza Supabase Storage) | 2026-03-24 | 56d643a | [260324-ijt-quando-acesso-o-pesquisador-no-front-end](.planning/quick/260324-ijt-quando-acesso-o-pesquisador-no-front-end/) |
| 260325-qwr | Botões de download .md e PDF no Pesquisador: links diretos às rotas backend em ReportView e ReportsManager | 2026-03-25 | 9d33d85 | [260325-qwr-adicionar-bot-es-de-download-md-e-pdf-no](.planning/quick/260325-qwr-adicionar-bot-es-de-download-md-e-pdf-no/) |

## Session Continuity

Last activity: 2026-03-31 — Phase 8 Area Segmentation fully complete (08-03 visual checkpoint approved)
Last session: 2026-03-31T23:21:22.717Z
Stopped at: Completed 10-01-PLAN.md — Phase 10 Wave 0 test stubs created
Resume file: None
Next step: `/gsd:plan-phase 9` (Phase 9 — Auth Infrastructure)
