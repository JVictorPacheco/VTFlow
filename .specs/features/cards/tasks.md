# Cards — Tasks

**Design**: `.specs/features/cards/design.md`
**Status**: Done

---

## Execution Plan

### Phase 1 — Backend (Sequencial)
```
T1 → T2 → T3
```

### Phase 2 — Frontend (Sequencial, paralelo ao Phase 1)
```
T4 → T5 → T6
```

### Phase 3 — Integração
```
(T3 + T6) → T7
```

---

## Task Breakdown

### T1: Adicionar entidades Card, CardLabel, Priority + migration

**What**: Criar entidades `Card`, `CardLabel`, enum `Priority`, adicionar ao `AppDbContext` e gerar migration
**Where**:
- `backend/TodoBoard.Api/Models/Priority.cs`
- `backend/TodoBoard.Api/Models/Card.cs`
- `backend/TodoBoard.Api/Models/CardLabel.cs`
- `backend/TodoBoard.Api/Data/AppDbContext.cs`
**Depends on**: Nenhuma
**Requirement**: CRD-01, CRD-03

**Done when**:
- [ ] `Priority.cs` enum criado com `Low=0, Medium=1, High=2`
- [ ] `Card.cs` criado com todos os campos e relacionamentos
- [ ] `CardLabel.cs` criado com chave composta `CardId+LabelId`
- [ ] `AppDbContext` com `DbSet<Card>` e `DbSet<CardLabel>` e configuração de chave composta
- [ ] `dotnet ef migrations add AddCardEntities` executa sem erros
- [ ] `dotnet ef database update` aplica migration
- [ ] `dotnet build` passa

**Gate**: build
**Commit**: `feat(cards): add Card, CardLabel, Priority entities and migration`

---

### T2: Bloquear exclusão de coluna com cards no ColumnsController

**What**: Adicionar validação no `DELETE /columns/{id}` que retorna `409` se a coluna tem cards
**Where**: `backend/TodoBoard.Api/Controllers/ColumnsController.cs`
**Depends on**: T1
**Requirement**: CRD-09 (proteção de integridade)

**Done when**:
- [ ] `DELETE /columns/{id}` verifica `db.Cards.Any(c => c.ColumnId == id)` antes de excluir
- [ ] Se houver cards, retorna `409 Conflict` com mensagem "Remove os cards antes de excluir a coluna"
- [ ] `dotnet build` passa

**Gate**: build
**Commit**: `feat(columns): block deletion of columns with cards`

---

### T3: Criar CardsController com CRUD completo

**What**: Controller com GET, POST, PUT, PATCH /column, DELETE
**Where**: `backend/TodoBoard.Api/Controllers/CardsController.cs`
**Depends on**: T2
**Requirement**: CRD-01, CRD-02, CRD-03, CRD-04, CRD-06, CRD-07, CRD-09, CRD-11

**Done when**:
- [ ] `GET /cards?columnId=` retorna cards com labels expandidas, ordenados por `createdAt`
- [ ] `POST /cards` valida title e columnId, cria card + vínculos CardLabel, retorna `201`
- [ ] `PUT /cards/{id}` atualiza todos os campos + sincroniza vínculos CardLabel
- [ ] `PATCH /cards/{id}/column` move card para nova coluna
- [ ] `DELETE /cards/{id}` remove card e vínculos CardLabel
- [ ] Todos com `[Authorize]`
- [ ] `dotnet build` passa

**Gate**: build + smoke manual
**Commit**: `feat(cards): add CardsController with full CRUD`

---

### T4: Criar CardService Angular

**What**: Service com `getAll()`, `getByColumn()`, `create()`, `update()`, `move()`, `delete()`
**Where**: `frontend/src/app/core/services/card.service.ts`
**Depends on**: Nenhuma
**Requirement**: CRD-01, CRD-04, CRD-06, CRD-09, CRD-11

**Done when**:
- [ ] Interfaces `Card`, `CardLabel`, `CardRequest`, `Priority` definidas e exportadas
- [ ] `getAll(): Observable<Card[]>`
- [ ] `getByColumn(columnId): Observable<Card[]>`
- [ ] `create(data: CardRequest): Observable<Card>`
- [ ] `update(id, data: CardRequest): Observable<Card>`
- [ ] `move(id, columnId): Observable<void>`
- [ ] `delete(id): Observable<void>`
- [ ] `ng build` passa

**Gate**: build
**Commit**: `feat(cards): add Angular CardService`

---

### T5: Criar CardFormComponent (modal de criação/edição)

**What**: Componente de formulário para criar e editar cards — título, descrição, prazo, prioridade, coluna, etiquetas
**Where**: `frontend/src/app/features/board/card-form.component.ts`
**Depends on**: T4
**Requirement**: CRD-01, CRD-02, CRD-06, CRD-07, CRD-08, CRD-12

**Done when**:
- [ ] Inputs: `@Input() card?` (modo edição), `@Input() columns`, `@Input() labels`, `@Input() defaultColumnId`
- [ ] Outputs: `@Output() saved = new EventEmitter<Card>()`, `@Output() cancelled = new EventEmitter()`
- [ ] Formulário reativo com: título (required), descrição (opcional), prazo (date, opcional), prioridade (select: Low/Medium/High), coluna (select), etiquetas (checkboxes múltiplos)
- [ ] Ao submeter no modo criação: chama `CardService.create()`
- [ ] Ao submeter no modo edição: chama `CardService.update()`
- [ ] Exibido como overlay/modal (posição fixa, fundo escurecido)
- [ ] Estilizado com TailwindCSS dark/light
- [ ] `ng build` passa

**Gate**: build
**Commit**: `feat(cards): add CardFormComponent`

---

### T6: Implementar BoardComponent completo

**What**: Substituir o placeholder do BoardComponent pela implementação completa — colunas com cards, botões de ação por card, botão de criar card por coluna
**Where**: `frontend/src/app/features/board/board.component.ts`
**Depends on**: T5
**Requirement**: CRD-05, CRD-08, CRD-10, CRD-12

**Done when**:
- [ ] Carrega colunas (via `ColumnService`) e todos os cards (via `CardService`) no `ngOnInit`
- [ ] Exibe colunas lado a lado com scroll horizontal
- [ ] Cada coluna exibe: nome, lista de cards, botão "+ Adicionar card"
- [ ] Cada card exibe: título, badge de prioridade colorido, prazo (se houver), etiquetas coloridas
- [ ] Botão "+ Adicionar card" abre `CardFormComponent` com coluna pré-selecionada
- [ ] Card tem botão "Editar" que abre `CardFormComponent` em modo edição
- [ ] Card tem menu "Mover para..." com opções de colunas
- [ ] Card tem botão "Excluir"
- [ ] Após salvar/excluir, lista atualiza sem reload
- [ ] Estilizado com TailwindCSS dark/light
- [ ] `ng build` passa

**Gate**: build + smoke manual
**Commit**: `feat(board): implement BoardComponent with cards`

---

### T7: Smoke test end-to-end de cards

**What**: Validar fluxo completo via UI com backend rodando
**Depends on**: T3, T6

**Done when**:
- [ ] Acessar `/board` → 3 colunas carregadas com cards vazios
- [ ] Criar card "Implementar login" na coluna "A Fazer" com prioridade High e etiqueta → aparece no board
- [ ] Editar título e prazo → atualiza no card
- [ ] Mover card para "Em Andamento" → aparece na nova coluna
- [ ] Excluir card → some da coluna
- [ ] Tentar excluir coluna com cards → mensagem de bloqueio

**Gate**: smoke manual end-to-end
**Commit**: N/A

---

## Parallel Execution Map

```
Phase 1 (Backend — Sequencial):
  T1 → T2 → T3

Phase 2 (Frontend — Sequencial, paralelo ao Phase 1):
  T4 → T5 → T6

Phase 3 (Integração):
  (T3 + T6) → T7
```

---

## Task Granularity Check

| Task | Escopo | Status |
|---|---|---|
| T1: Card + CardLabel + Priority entities | 3 models + AppDbContext + migration | ✅ Granular |
| T2: Bloquear exclusão coluna com cards | 1 modificação pontual no ColumnsController | ✅ Granular |
| T3: CardsController CRUD | 1 controller com 5 endpoints | ✅ Granular |
| T4: CardService Angular | 1 service com 6 métodos + interfaces | ✅ Granular |
| T5: CardFormComponent | 1 componente modal com formulário | ✅ Granular |
| T6: BoardComponent completo | 1 componente principal do app | ✅ Granular |
| T7: Smoke test | Validação manual | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (corpo) | Diagrama mostra | Status |
|---|---|---|---|
| T1 | Nenhuma | Início Phase 1 | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T2 | T2 → T3 | ✅ |
| T4 | Nenhuma | Início Phase 2 | ✅ |
| T5 | T4 | T4 → T5 | ✅ |
| T6 | T5 | T5 → T6 | ✅ |
| T7 | T3, T6 | (T3 + T6) → T7 | ✅ |

---

## Requirement Traceability

| Requirement ID | Task | Status |
|---|---|---|
| CRD-01 | T1, T3, T4 | Pending |
| CRD-02 | T3, T5 | Pending |
| CRD-03 | T1, T3 | Pending |
| CRD-04 | T3, T4 | Pending |
| CRD-05 | T6 | Pending |
| CRD-06 | T3, T4 | Pending |
| CRD-07 | T3 | Pending |
| CRD-08 | T5, T6 | Pending |
| CRD-09 | T2, T3 | Pending |
| CRD-10 | T6 | Pending |
| CRD-11 | T3, T4 | Pending |
| CRD-12 | T5, T6 | Pending |
