# Boards — Tasks

**Design**: `.specs/features/boards/design.md`
**Status**: Pending

---

## Execution Plan

### Phase 1 — Backend (Sequencial)
```
T1 → T2 → T3 → T4
```

### Phase 2 — Frontend (Paralelo ao Phase 1)
```
T5 ──────────────────── T6
T7 ──── T8
T7 ──── T9
(T6 + T8 + T9) ──── T10
```

### Phase 3 — Integração
```
(T4 + T10) → T11
```

---

## Task Breakdown

---

### T1: Criar entidade Board + adicionar BoardId à Column

**What**: Criar `Models/Board.cs`, adicionar `BoardId` à entidade `Column`, registrar `DbSet<Board>` no `AppDbContext` e configurar relacionamento com cascade delete
**Where**:
- `backend/TodoBoard.Api/Models/Board.cs` (novo)
- `backend/TodoBoard.Api/Models/Column.cs` (atualizar)
- `backend/TodoBoard.Api/Data/AppDbContext.cs` (atualizar)
**Depends on**: Nenhuma
**Requirement**: BRD-01, BRD-15

**Done when**:
- [ ] `Board.cs` criado com `Id`, `Name`, `Description?`, `CreatedAt`, `ICollection<Column> Columns`
- [ ] `Column.cs` atualizado com `BoardId` (int) e `Board Board` (navigation property)
- [ ] `AppDbContext` com `DbSet<Board> Boards`
- [ ] Relacionamento configurado com `OnDelete(DeleteBehavior.Cascade)` (Board → Column)
- [ ] `dotnet build` passa

**Gate**: build
**Commit**: `feat(boards): add Board entity, BoardId to Column, configure cascade`

---

### T2: Migration AddBoardEntity com compatibilidade de dados

**What**: Gerar e aplicar migration que cria a tabela `Boards`, insere um board padrão "Meu Board" e atribui todas as colunas existentes a ele — sem perder dados
**Where**:
- `backend/TodoBoard.Api/Migrations/` (migration gerada pelo EF)
- Editar o arquivo `.cs` da migration para inserir `Sql()` de dados
**Depends on**: T1
**Requirement**: BRD-15

**Done when**:
- [ ] `dotnet ef migrations add AddBoardEntity` gera a migration sem erros
- [ ] Migration editada para incluir:
  - `Sql("INSERT INTO Boards (Name, Description, CreatedAt) VALUES ('Meu Board', NULL, datetime('now'))")`
  - `Sql("UPDATE Columns SET BoardId = (SELECT Id FROM Boards LIMIT 1)")`
- [ ] `dotnet ef database update` aplica sem erros
- [ ] `SELECT * FROM Columns` no banco mostra todas as colunas com `BoardId` preenchido
- [ ] `dotnet build` passa

**Gate**: build + verificação manual no banco
**Commit**: `feat(boards): add migration with default board and data migration`

---

### T3: Atualizar ColumnsController + remover ColumnSeeder

**What**: Adicionar `boardId` obrigatório ao `GET /columns` e `POST /columns`, ajustar validação de nome duplicado para ser por board, remover `ColumnSeeder` do `Program.cs` e deletar o arquivo
**Where**:
- `backend/TodoBoard.Api/Controllers/ColumnsController.cs`
- `backend/TodoBoard.Api/Program.cs`
- `backend/TodoBoard.Api/Data/ColumnSeeder.cs` (deletar)
**Depends on**: T2
**Requirement**: BRD-16, BRD-03

**Done when**:
- [ ] `GET /columns?boardId={id}` filtra colunas pelo board e retorna ordenado por `Order`
- [ ] `GET /columns` sem `boardId` retorna `400 Bad Request`
- [ ] `ColumnRequest` atualizado para `record ColumnRequest(string Name, int BoardId)`
- [ ] `POST /columns` usa `request.BoardId` ao criar a coluna
- [ ] Validação de nome duplicado: `AnyAsync(c => c.Name == name && c.BoardId == boardId)`
- [ ] Chamada ao `ColumnSeeder.SeedAsync(db)` removida do `Program.cs`
- [ ] Arquivo `ColumnSeeder.cs` deletado
- [ ] `dotnet build` passa
- [ ] `GET /columns?boardId=1` retorna as colunas do board 1

**Gate**: build + smoke manual
**Commit**: `feat(boards): update ColumnsController with boardId, remove ColumnSeeder`

---

### T4: Criar BoardsController com CRUD completo

**What**: Controller com `GET /boards`, `GET /boards/{id}`, `POST /boards` (+ seed das 3 colunas padrão), `PUT /boards/{id}`, `DELETE /boards/{id}`
**Where**: `backend/TodoBoard.Api/Controllers/BoardsController.cs` (novo)
**Depends on**: T3
**Requirement**: BRD-01, BRD-02, BRD-03, BRD-04, BRD-05, BRD-06, BRD-07, BRD-08, BRD-10, BRD-12

**Done when**:
- [ ] `GET /boards` retorna lista de boards ordenada por `CreatedAt` decrescente, retorna `200`
- [ ] `GET /boards/{id}` retorna board ou `404`
- [ ] `POST /boards` valida `name`, retorna `409` se duplicado, cria board + 3 colunas padrão ("A Fazer" order=1, "Em Andamento" order=2, "Concluído" order=3) e retorna `201`
- [ ] `PUT /boards/{id}` atualiza `name` e `description`, retorna `200` ou `404`
- [ ] `DELETE /boards/{id}` exclui board (cascade remove colunas e cards via EF), retorna `204` ou `404`
- [ ] Todos com `[Authorize]`
- [ ] DTO `BoardResponse(int Id, string Name, string? Description, DateTime CreatedAt)` usado em todas as respostas
- [ ] `dotnet build` passa
- [ ] `POST /boards` → board criado com 3 colunas verificáveis via `GET /columns?boardId={id}`

**Gate**: build + smoke manual
**Commit**: `feat(boards): add BoardsController with CRUD and default columns seed`

---

### T5: Criar BoardService Angular

**What**: Service com `getAll()`, `getById()`, `create()`, `update()`, `delete()`
**Where**: `frontend/src/app/core/services/board.service.ts` (novo)
**Depends on**: Nenhuma
**Requirement**: BRD-05, BRD-08, BRD-01, BRD-10, BRD-12

**Done when**:
- [ ] Interface `Board` definida e exportada: `{ id, name, description?, createdAt }`
- [ ] Interface `BoardRequest` definida: `{ name, description? }`
- [ ] `getAll(): Observable<Board[]>`
- [ ] `getById(id: number): Observable<Board>`
- [ ] `create(data: BoardRequest): Observable<Board>`
- [ ] `update(id: number, data: BoardRequest): Observable<Board>`
- [ ] `delete(id: number): Observable<void>`
- [ ] `ng build` passa

**Gate**: build
**Commit**: `feat(boards): add Angular BoardService`

---

### T6: Criar BoardListComponent

**What**: Tela inicial pós-login — grid de boards com ações de criar, renomear e excluir; estado vazio tratado
**Where**: `frontend/src/app/features/boards/board-list.component.ts` (novo)
**Depends on**: T5
**Requirement**: BRD-06, BRD-07, BRD-11, BRD-13, BRD-14

**Done when**:
- [ ] Carrega lista de boards no `ngOnInit` via `BoardService.getAll()`
- [ ] Exibe cards de board: nome, descrição (se houver), data de criação
- [ ] Clicar em "Abrir" navega para `/boards/{id}`
- [ ] Botão "Novo Board" exibe formulário inline com campos `name` (required) e `description` (opcional)
- [ ] Submit do formulário chama `BoardService.create()` e adiciona o board à lista sem reload
- [ ] Botão "Renomear" abre campo de edição inline; salvar chama `BoardService.update()`
- [ ] Botão "Excluir" exibe modal de confirmação customizado (padrão já existente no projeto)
- [ ] Confirmação de exclusão chama `BoardService.delete()` e remove da lista
- [ ] Estado vazio: mensagem "Nenhum board criado ainda" com botão "Criar meu primeiro board"
- [ ] Estilizado com TailwindCSS — dark/light mode
- [ ] `ng build` passa

**Gate**: build + smoke manual
**Commit**: `feat(boards): add BoardListComponent`

---

### T7: Atualizar ColumnService para receber boardId

**What**: Alterar assinatura de `getAll()` para `getAll(boardId: number)` e `create()` para `create(name: string, boardId: number)`
**Where**: `frontend/src/app/core/services/column.service.ts`
**Depends on**: Nenhuma
**Requirement**: BRD-16

**Done when**:
- [ ] `getAll(boardId: number): Observable<Column[]>` — passa `?boardId=` na query string
- [ ] `create(name: string, boardId: number): Observable<Column>` — inclui `boardId` no body
- [ ] Interface `Column` mantida sem mudança
- [ ] `ng build` passa (pode gerar erros de compilação nos componentes que chamam `getAll()` — serão corrigidos nas tasks seguintes)

**Gate**: build
**Commit**: `feat(boards): update ColumnService to accept boardId`

---

### T8: Atualizar BoardComponent para receber boardId via rota

**What**: Substituir carregamento global de colunas pelo carregamento filtrado pelo `boardId` lido da rota `/boards/:id`
**Where**: `frontend/src/app/features/board/board.component.ts`
**Depends on**: T7
**Requirement**: BRD-09

**Done when**:
- [ ] `boardId` lido via `ActivatedRoute`: `+this.route.snapshot.paramMap.get('id')!`
- [ ] `ColumnService.getAll(this.boardId)` chamado no `ngOnInit`
- [ ] `ColumnService.create(name, this.boardId)` usado ao criar nova coluna (se aplicável no BoardComponent)
- [ ] Link "Gerenciar colunas" no header atualizado para `/columns?boardId={this.boardId}`
- [ ] Link "← Voltar" atualizado para `/boards`
- [ ] `ng build` passa

**Gate**: build
**Commit**: `feat(boards): update BoardComponent to load columns by boardId from route`

---

### T9: Atualizar ColumnsManagerComponent para receber boardId via query param

**What**: Ler `boardId` do query param da rota, passar para `ColumnService.getAll()` e `create()`
**Where**: `frontend/src/app/features/columns/columns-manager.component.ts`
**Depends on**: T7
**Requirement**: BRD-16

**Done when**:
- [ ] `boardId` lido via `ActivatedRoute`: `+this.route.snapshot.queryParamMap.get('boardId')!`
- [ ] `ColumnService.getAll(this.boardId)` chamado no `ngOnInit`
- [ ] `ColumnService.create(name, this.boardId)` usado ao criar coluna
- [ ] Botão "← Voltar" leva para `/boards/{boardId}`
- [ ] `ng build` passa

**Gate**: build
**Commit**: `feat(boards): update ColumnsManagerComponent to use boardId from query param`

---

### T10: Atualizar rotas e redirect do AuthService

**What**: Reconfigurar `app.routes.ts` com novas rotas de boards e atualizar o redirect pós-login do `AuthService`
**Where**:
- `frontend/src/app/app.routes.ts`
- `frontend/src/app/core/services/auth.service.ts`
**Depends on**: T6, T8, T9
**Requirement**: BRD-06, BRD-09

**Done when**:
- [ ] Rota `''` redireciona para `'boards'`
- [ ] Rota `'boards'` → `BoardListComponent` protegida por `authGuard`
- [ ] Rota `'boards/:id'` → `BoardComponent` protegida por `authGuard`
- [ ] Rota `'board'` removida
- [ ] Rota `'**'` redireciona para `'boards'`
- [ ] `AuthService.login()` navega para `'/boards'` após sucesso (em vez de `'/board'`)
- [ ] `ng build` passa

**Gate**: build
**Commit**: `feat(boards): update routes and auth redirect to boards list`

---

### T11: Smoke test end-to-end de boards

**What**: Validar o fluxo completo via UI com backend rodando
**Depends on**: T4, T10

**Done when**:
- [ ] Login → redireciona para `/boards` com a lista de boards
- [ ] Board padrão "Meu Board" aparece na lista (dados migrados)
- [ ] Abrir "Meu Board" → `/boards/1` com as colunas existentes carregadas corretamente
- [ ] Criar novo board "Pessoal" com descrição → aparece na lista → abrir → 3 colunas padrão geradas
- [ ] Criar card no board "Pessoal" → aparece na coluna correta
- [ ] Voltar para lista de boards → boards isolados (cards do "Pessoal" não aparecem no "Meu Board")
- [ ] Renomear board "Pessoal" para "Projetos" → nome atualizado na lista
- [ ] Excluir "Projetos" → confirmação → some da lista
- [ ] Gerenciar colunas do board → `/columns?boardId=1` → colunas do board carregadas
- [ ] Criar coluna no board → aparece apenas naquele board
- [ ] `ng build` passa

**Gate**: smoke manual end-to-end
**Commit**: N/A

---

## Parallel Execution Map

```
Phase 1 (Backend — Sequencial):
  T1 → T2 → T3 → T4

Phase 2 (Frontend — Paralelo ao Phase 1):
  T5 ──────────────── T6
  T7 ──── T8
  T7 ──── T9
  (T6 + T8 + T9) ──── T10

Phase 3 (Integração):
  (T4 + T10) → T11
```

> T5 e T7 são independentes entre si — podem rodar em paralelo.
> T8 e T9 dependem apenas de T7 — podem rodar em paralelo entre si após T7.
> T6 depende de T5. T10 só inicia após T6, T8 e T9 concluídos.

---

## Task Granularity Check

| Task | Escopo | Status |
|---|---|---|
| T1: Board entity + BoardId em Column | 2 models + AppDbContext | ✅ Granular |
| T2: Migration com dados | 1 migration editada com SQL | ✅ Granular |
| T3: ColumnsController + remover Seeder | 1 controller atualizado + 1 arquivo deletado | ✅ Granular |
| T4: BoardsController | 1 controller com 5 endpoints | ✅ Granular |
| T5: BoardService | 1 service com 5 métodos + interfaces | ✅ Granular |
| T6: BoardListComponent | 1 componente completo | ✅ Granular |
| T7: ColumnService atualizado | 2 assinaturas alteradas | ✅ Granular |
| T8: BoardComponent atualizado | leitura de route param + ajuste de calls | ✅ Granular |
| T9: ColumnsManagerComponent atualizado | leitura de query param + ajuste de calls | ✅ Granular |
| T10: Rotas + AuthService redirect | 2 arquivos pontuais | ✅ Granular |
| T11: Smoke test e2e | Validação manual | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (corpo) | Diagrama mostra | Status |
|---|---|---|---|
| T1 | Nenhuma | Início Phase 1 | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T2 | T2 → T3 | ✅ |
| T4 | T3 | T3 → T4 | ✅ |
| T5 | Nenhuma | Início Phase 2 | ✅ |
| T6 | T5 | T5 → T6 | ✅ |
| T7 | Nenhuma | Início Phase 2 (paralelo) | ✅ |
| T8 | T7 | T7 → T8 | ✅ |
| T9 | T7 | T7 → T9 | ✅ |
| T10 | T6, T8, T9 | (T6 + T8 + T9) → T10 | ✅ |
| T11 | T4, T10 | (T4 + T10) → T11 | ✅ |

---

## Requirement Traceability

| Requirement ID | Task | Status |
|---|---|---|
| BRD-01 | T4, T5 | Pending |
| BRD-02 | T4 | Pending |
| BRD-03 | T3, T4 | Pending |
| BRD-04 | T6 | Pending |
| BRD-05 | T4, T5 | Pending |
| BRD-06 | T6, T10 | Pending |
| BRD-07 | T6 | Pending |
| BRD-08 | T4, T5 | Pending |
| BRD-09 | T8, T10 | Pending |
| BRD-10 | T4, T5 | Pending |
| BRD-11 | T6 | Pending |
| BRD-12 | T4, T5 | Pending |
| BRD-13 | T6 | Pending |
| BRD-14 | T6 | Pending |
| BRD-15 | T1, T2 | Pending |
| BRD-16 | T3, T7, T9 | Pending |
