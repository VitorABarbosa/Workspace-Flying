# Requirements: Flying Studio Tools

**Defined:** 2026-03-22
**Core Value:** A equipe da Flying Studio acessa e usa agentes de IA diretamente no browser, sem fricção.

## v1.0 Requirements (Complete)

### Migration

- [x] **MIG-01**: Remover rotas de portfolio do App Router (cases, flying-news, imagens-3d, videos-3d, aplicativos, tour-virtual-360, dna-flying-studio, junte-se-a-nos, orcamento)
- [x] **MIG-02**: Remover dependências Three.js, @react-three/fiber e @react-three/drei do projeto
- [x] **MIG-03**: Remover seções institucionais da home (hero slider de portfolio, parceiros, depoimentos, DsBrave, etc.)
- [x] **MIG-04**: Preservar header e footer com identidade visual atual (cores, tipografia Outfit, dark/light mode)

### Authentication

- [x] **AUTH-01**: Usuário pode fazer login com senha compartilhada da equipe
- [x] **AUTH-02**: Usuário não autenticado é redirecionado para /login ao tentar acessar /tools/*
- [x] **AUTH-03**: Usuário autenticado pode fazer logout

## v1.1 Requirements — Pesquisador (Complete)

### Catalog

- [x] **CAT-01**: Usuário vê grid de cards com nome, descrição e status de cada ferramenta disponível em `/tools`
- [x] **CAT-02**: Cards indicam status da ferramenta (ativo / em breve) visualmente

### Pesquisador Agent

- [x] **PESQ-01**: Usuário faz upload de um PDF (drag-and-drop ou botão) para iniciar análise do empreendimento
- [x] **PESQ-02**: Frontend exibe progresso em tempo real via polling enquanto o pipeline executa (estados pending/processing visíveis com mensagens de estágio)
- [x] **PESQ-03**: Frontend detecta estado `awaiting_address` e exibe formulário inline para o usuário inserir o endereço do empreendimento
- [x] **PESQ-04**: Após inserir endereço, pipeline retoma e frontend volta ao polling de status
- [x] **PESQ-05**: Quando concluído, usuário visualiza o relatório completo em Markdown formatado na página (tabelas, negrito, blocos de código estilizados)
- [x] **PESQ-06**: Usuário pode fazer download do relatório em formato Markdown
- [x] **PESQ-07**: Quando o job falha, erros são exibidos de forma útil com opção de tentar novamente

### Architecture

- [x] **ARCH-01**: Padrão arquitetural extensível definido — adicionar novo agente = criar arquivos em `components/agents/[slug]/` + uma linha em `config/tools.ts`, sem modificar código existente

## v1.2 Requirements — LUMEN

### Backend (LUMEN API — mudanças necessárias para isolamento por busca)

- [ ] **BACK-01**: Coluna `job_id` adicionada à tabela `leads` no Supabase (UUID nullable, FK para `search_history.id`)
- [ ] **BACK-02**: `check_and_save` salva `job_id` no registro do lead ao inserir novo lead no banco
- [ ] **BACK-03**: `GET /leads` aceita query param `?job_id=` para retornar apenas leads de uma busca específica

### Integração no Catálogo

- [ ] **LUMEN-01**: Ferramenta LUMEN aparece no catálogo `/tools` com card ativo e ícone apropriado

### Busca

- [x] **LUMEN-02**: Usuário preenche formulário de busca: cidade (campo de texto, obrigatório), segmentos (multi-select dos 5 tipos: Construtoras, Incorporadoras, Imobiliárias, Loteadoras, Administradoras de Condomínio, mínimo 1) e query personalizada (texto opcional)
- [x] **LUMEN-03**: Ao submeter o formulário, job assíncrono é criado na API e polling de status inicia automaticamente
- [x] **LUMEN-04**: Enquanto o job executa, usuário vê contadores ao vivo (encontrados / novos / duplicados) e barra de progresso determinística baseada em `progress_pct`
- [x] **LUMEN-05**: Usuário pode cancelar job em andamento — estado `cancelled` é tratado corretamente sem polling infinito

### Resultados da Pesquisa (isolados por job)

- [ ] **LUMEN-06**: Ao concluir, usuário vê APENAS os leads encontrados na sua pesquisa (filtrado por `job_id`) — nunca misturado com leads de outras buscas
- [ ] **LUMEN-07**: Lista de leads exibe nome, cidade, segmento, website, telefone, badge de score (0–100, colorido por faixa) e status do scraping
- [ ] **LUMEN-08**: Usuário clica em lead e vê painel de detalhes (slide-over): contatos Apollo (nome, cargo, email com nível de confiança, LinkedIn, telefone), keywords detectadas no site e composição do score
- [ ] **LUMEN-09**: Usuário pode exportar os leads da pesquisa atual como XLSX

### Banco Global de Leads

- [ ] **LUMEN-10**: Existe seção separada e explícita "Banco de Leads" — acesso manual pelo usuário, nunca exibida automaticamente após uma pesquisa
- [ ] **LUMEN-11**: Banco global tem painel de filtros: cidade (texto), segmento (select), score mínimo (número) e data de criação a partir de (date picker)
- [ ] **LUMEN-12**: Lista paginada com paginação server-side (50 leads por página), ordenada por score decrescente
- [ ] **LUMEN-13**: Usuário pode exportar leads do banco global com os filtros ativos como XLSX

### Histórico de Pesquisas

- [ ] **LUMEN-14**: Usuário vê histórico de pesquisas anteriores com cidade, segmentos, status, totais (encontrados / novos / duplicados) e data
- [ ] **LUMEN-15**: Usuário clica em pesquisa do histórico e acessa os leads daquela busca específica

## v2 Requirements

### Tool Interaction (generic agents)

- **TOOL-01**: Página de ferramenta exibe campo de input (texto/formulário) e botão enviar
- **TOOL-02**: Output da ferramenta é exibido com streaming em tempo real (texto aparece gradualmente)
- **TOOL-03**: Output renderiza Markdown formatado (listas, negrito, bloco de código, etc.)
- **TOOL-04**: Usuário pode copiar o output completo com botão copy-to-clipboard

### UX (generic agents)

- **UX-01**: Loading state visível enquanto o agente processa a requisição
- **UX-02**: Estado de erro com mensagem útil exibido quando o agente falha
- **UX-03**: Atalho Ctrl+Enter envia o input para o agente
- **UX-04**: Usuário pode limpar/resetar o output atual para nova interação

### Discovery

- **DISC-01**: Categorias/tags por ferramenta para agrupar por tipo
- **DISC-02**: Campo de busca/filtro para encontrar ferramenta por nome

### History

- **HIST-01**: Histórico de outputs por ferramenta
- **HIST-02**: Usuário pode salvar/favoritar outputs específicos

### Administration

- **ADMIN-01**: Dashboard de uso com número de interações por ferramenta
- **ADMIN-02**: Rate limiting por sessão para controlar custos de API

### LUMEN Enhancements

- **LUMEN-V2-01**: "Repetir esta busca" — prefill do formulário a partir de item do histórico
- **LUMEN-V2-02**: Filtros rápidos client-side nos resultados da pesquisa (quando resultado > 30 leads)
- **LUMEN-V2-03**: Tooltip de breakdown do score — explicar composição de cada ponto

## Out of Scope

| Feature | Reason |
|---------|--------|
| Contas individuais por usuário | Senha compartilhada é suficiente para uso interno da equipe |
| Tool builder (criar ferramentas via UI) | Alta complexidade, equipe técnica adiciona tools via código |
| Acesso público / plano freemium | Hub interno apenas |
| App mobile | Web-first, mobile é v3+ |
| Multi-tenancy / múltiplas organizações | Flying Studio apenas |
| Autenticação OAuth (Google, GitHub) | Senha compartilhada cobre o caso de uso |
| Upload direto via Next.js proxy | FastAPI recebe PDF direto do browser — sem proxy para evitar timeout |
| CRM sync (HubSpot, Pipedrive) | Fora do escopo v1.2 — exportar XLSX é suficiente |
| Geração de XLSX no cliente (SheetJS) | Backend serve o arquivo diretamente via GET /leads?format=xlsx |
| Página full-screen de detalhe do lead | Slide-over preserva contexto da lista |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MIG-01 | Phase 1 | Complete |
| MIG-02 | Phase 1 | Complete |
| MIG-03 | Phase 1 | Complete |
| MIG-04 | Phase 1 | Complete |
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| CAT-01 | Phase 2 | Complete |
| CAT-02 | Phase 2 | Complete |
| ARCH-01 | Phase 2 | Complete |
| PESQ-01 | Phase 3 | Complete |
| PESQ-02 | Phase 3 | Complete |
| PESQ-03 | Phase 3 | Complete |
| PESQ-04 | Phase 3 | Complete |
| PESQ-05 | Phase 3 | Complete |
| PESQ-06 | Phase 3 | Complete |
| PESQ-07 | Phase 3 | Complete |
| BACK-01 | Phase 4 | Pending |
| BACK-02 | Phase 4 | Pending |
| BACK-03 | Phase 4 | Pending |
| LUMEN-01 | Phase 4 | Pending |
| LUMEN-02 | Phase 4 | Complete |
| LUMEN-03 | Phase 4 | Complete |
| LUMEN-04 | Phase 4 | Complete |
| LUMEN-05 | Phase 4 | Complete |
| LUMEN-06 | Phase 5 | Pending |
| LUMEN-07 | Phase 5 | Pending |
| LUMEN-08 | Phase 5 | Pending |
| LUMEN-09 | Phase 5 | Pending |
| LUMEN-10 | Phase 6 | Pending |
| LUMEN-11 | Phase 6 | Pending |
| LUMEN-12 | Phase 6 | Pending |
| LUMEN-13 | Phase 6 | Pending |
| LUMEN-14 | Phase 7 | Pending |
| LUMEN-15 | Phase 7 | Pending |

**Coverage:**
- v1.0 requirements: 7 total — Complete ✓
- v1.1 requirements: 10 total — Complete ✓
- v1.2 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-22*
*Last updated: 2026-03-28 — v1.2 milestone defined (LUMEN agent — busca de leads + backend job_id isolation)*
