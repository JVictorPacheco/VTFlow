---
tags:
  - arquitetura
  - decisões
  - adr
created: 2026-08-11
---

# Architecture Decision Records

Registro das decisões arquiteturais do VTFlow, com contexto, alternativas consideradas e justificativa.

---

## ADR-001: Vertical Slice Architecture no Backend

**Status**: Aceito

**Contexto**: O backend original usava o padrão MVC tradicional com Controllers, Models, Services e Data em pastas separadas por camada técnica. Para adicionar uma feature simples era necessário tocar em 3-4 pastas diferentes.

**Alternativas consideradas**:
| Opção | Prós | Contras |
|---|---|---|
| Manter MVC atual | Zero retrabalho | Não escala, lógica nos controllers |
| Clean Architecture | Máxima testabilidade | Overhead de abstração, 4+ camadas |
| Vertical Slice | Coesão por feature, baixo acoplamento | Cross-feature references via namespace |

**Decisão**: Vertical Slice Architecture com Minimal APIs.

**Justificativa**:
- Projeto tem 1-2 devs — Clean Architecture seria overengineering
- Cada endpoint é um arquivo autocontido (DTO + handler + validação)
- Navegação trivial: `Features/Boards/CreateBoard.cs` = endpoint de criar board
- Minimal APIs eliminam atributos `[ApiController]`, `[Route]`, `[HttpPost]`
- Frontend não percebeu a mudança (mesmas rotas, mesmos JSONs)

**Consequências**:
- 29 arquivos de endpoint (antes eram 8 controllers)
- Entidades movidas para dentro da feature que as usa
- `Shared/` para DbContext, enums e helpers transversais

---

## ADR-002: Minimal APIs em vez de Controllers

**Status**: Aceito

**Contexto**: Com a migração para Vertical Slice, cada operação precisava de um endpoint independente. Controllers tradicionais forçam agrupar múltiplos verbos HTTP na mesma classe.

**Alternativas consideradas**:
| Opção | Prós | Contras |
|---|---|---|
| Controllers tradicionais | Familiaridade | Arquivos grandes, múltiplas responsabilidades |
| FastEndpoints (lib) | Convenções, validação | Dependência externa |
| Minimal APIs nativas | Zero dependências, C# puro | Menos tooling que Controllers |

**Decisão**: Minimal APIs nativas do ASP.NET Core 9.

**Justificativa**:
- Cada arquivo tem ~30 linhas (handler + DTOs)
- `MapPost()`, `MapGet()`, `MapPut()`, `MapPatch()`, `MapDelete()` explícitos
- `.RequireAuthorization()` / `.AllowAnonymous()` inline
- Sem dependência extra de libs como FastEndpoints

---

## ADR-003: Angular Signals em vez de RxJS State Management

**Status**: Aceito

**Contexto**: O frontend precisava de reatividade para o Kanban board (arrastar cards, filtrar, abrir modais).

**Alternativas consideradas**:
| Opção | Prós | Contras |
|---|---|---|
| NgRx Store | State global, DevTools | Boilerplate pesado, curva de aprendizado |
| NGXS | Mais simples que NgRx | Menos adoção |
| Services + BehaviorSubject | Familiar | Propenso a memory leaks |
| Angular Signals | Nativo, zero boilerplate | Novo (Angular 16+) |

**Decisão**: Angular Signals (`signal()`, `computed()`, `effect()`).

**Justificativa**:
- Nativo do Angular (sem libs extras)
- Sintaxe limpa: `this.cards.set(data)` em vez de `this.cards$.next(data)`
- `computed()` substitui pipes RxJS complexos
- `effect()` para side effects (tema dark/light, localStorage)
- BoardStore (`shared/store/board.store.ts`) usa Signals como state container leve

---

## ADR-004: BoardStore (Signal Store) em vez de State Management Library

**Status**: Aceito

**Contexto**: `BoardComponent` e `CardDetailComponent` precisavam compartilhar estado (cards, columns, labels) sem refetch desnecessário.

**Alternativas consideradas**:
| Opção | Prós | Contras |
|---|---|---|
| Sem store (refetch sempre) | Simples | Chamadas HTTP redundantes |
| NgRx SignalStore | Oficial, bem documentado | Lib extra, mais boilerplate |
| Service custom com Signals | Zero dependências, simples | Sem DevTools |

**Decisão**: Service custom com Signals (`BoardStore`).

**Justificativa**:
- Projeto pequeno — um store resolve 80% dos casos
- `load()` só bate na API uma vez, depois cacheia em memória
- Se crescer, migrar pra NgRx SignalStore é trivial (mesma API de Signals)
- Estado é local ao board — ao trocar de board, `invalidate()` recarrega

---

## ADR-005: CDK Drag & Drop em vez de HTML5 Drag API

**Status**: Aceito

**Contexto**: O Kanban original usava HTML5 Drag and Drop API nativa (`draggable="true"`, `dragstart`, `dragover`, `drop`).

**Alternativas consideradas**:
| Opção | Prós | Contras |
|---|---|---|
| Manter HTML5 nativo | Zero dependências | Sem suporte a touch, código manual complexo |
| ngx-dnd | Popular | Mantenedor inativo |
| @angular/cdk/drag-drop | Oficial Angular, touch, animações | Adiciona ~170 kB ao bundle |

**Decisão**: `@angular/cdk/drag-drop`.

**Justificativa**:
- Oficial do time Angular (não vai ser abandonado)
- Suporte nativo a touch (mobile/tablet)
- Animação de placeholder automática (sem código manual)
- Reduziu `board.component.ts` em ~90 linhas
- Bundle do board-component caiu de 129 kB para 105 kB

---

## ADR-006: SQLite em vez de PostgreSQL/SQL Server

**Status**: Aceito para MVP. Planejado migrar (ver [[Roadmap]] M4.1).

**Contexto**: O projeto está em estágio MVP. SQLite é um banco embarcado sem necessidade de servidor.

**Decisão**: SQLite para desenvolvimento. Migrar para PostgreSQL antes de produção.

**Justificativa**:
- Zero configuração (arquivo `VTFlow.db`)
- Perfeito para desenvolvimento local e testes
- EF Core abstrai a diferença — migration de provider é trivial

---

## ADR-007: GitFlow como Estratégia de Branches

**Status**: Aceito

**Contexto**: Precisávamos de um fluxo de branches previsível para features, releases e hotfixes.

**Alternativas consideradas**:
| Opção | Prós | Contras |
|---|---|---|
| GitHub Flow | Simples (main + feature branches) | Sem branch de develop |
| Trunk-based | Commits frequentes na main | Precisa de feature flags |
| GitFlow | Estrutura clara, releases isoladas | Overhead de branches |

**Decisão**: GitFlow.

**Justificativa**:
- Separação clara: `main` (produção), `develop` (integração), `feature/*`, `release/*`, `hotfix/*`
- Releases são testadas em isolation antes do merge
- Conventional Commits para histórico legível

---

## ADR-008: Spec Driven Development

**Status**: Aceito

**Contexto**: O projeto `.gitignore` já reservava `.specs/` como "Docs de planejamento". Precisávamos formalizar isso.

**Decisão**: Escrever specs antes do código, usando template padronizado.

**Justificativa**:
- Specs guiam implementação (contrato do que deve ser feito)
- Separadas da documentação (specs = pré-código, docs = pós-código)
- `.specs/` é gitignored (docs de planejamento, não artefatos versionados)
- Template em `docs/Spec Template.md`

---

## ADR-009: JWT + BCrypt em vez de Identity Framework

**Status**: Aceito

**Contexto**: Precisávamos de autenticação simples (registro + login) sem complexidade desnecessária.

**Decisão**: JWT manual com BCrypt.

**Justificativa**:
- ASP.NET Core Identity é pesado para um MVP (tabelas, roles, claims extras)
- JWT manual com `AuthService` tem ~80 linhas
- BCrypt é padrão da indústria para hash de senhas
- Sem refresh token por enquanto (token expira em 8h)

---

## ADR-010: Tailwind CSS em vez de Angular Material

**Status**: Aceito

**Contexto**: O frontend precisava de um sistema de design rápido, responsivo, com dark mode.

**Decisão**: Tailwind CSS utilitário.

**Justificativa**:
- Zero componentes opinativos — controle total do HTML
- Dark mode via classe `dark` — trivial
- Responsivo com breakpoints utilitários (`sm:`, `lg:`)
- Sem CSS customizado (apenas `@tailwind` directives em `styles.css`)
