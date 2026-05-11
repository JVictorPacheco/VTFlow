# Columns — Tasks

**Design**: `.specs/features/columns/design.md`
**Status**: Done

---

## Execution Plan

### Phase 1 — Backend (Sequencial)
```
T1 → T2 → T3
```

### Phase 2 — Frontend (Sequencial, paralelo ao Phase 1)
```
T4 → T5
```

### Phase 3 — Integração
```
(T3 + T5) → T6
```

---

## Task Breakdown

### T1: Adicionar entidade Column + migration

**What**: Criar `Models/Column.cs`, adicionar `DbSet<Column>` ao `AppDbContext` e gerar migration
**Where**:
- `backend/TodoBoard.Api/Models/Column.cs`
- `backend/TodoBoard.Api/Data/AppDbContext.cs`
**Depends on**: Nenhuma
**Requirement**: COL-01, COL-02

**Done when**:
- [ ] `Column.cs` criado com `Id`, `Name`, `Order`
- [ ] `DbSet<Column> Columns` adicionado ao `AppDbContext`
- [ ] `dotnet ef migrations add AddColumnEntity` executa sem erros
- [ ] `dotnet ef database update` aplica migration
- [ ] `dotnet build` passa

**Gate**: build
**Commit**: `feat(columns): add Column entity and migration`

---

### T2: Criar ColumnSeeder com colunas padrão

**What**: Criar `ColumnSeeder` que insere "A Fazer", "Em Andamento", "Concluído" se não existirem, chamado no `Program.cs`
**Where**:
- `backend/TodoBoard.Api/Data/ColumnSeeder.cs`
- `backend/TodoBoard.Api/Program.cs`
**Depends on**: T1
**Requirement**: COL-01

**Done when**:
- [ ] `ColumnSeeder.SeedAsync(db)` cria as 3 colunas padrão com `Order` 1, 2, 3 se `db.Columns` estiver vazio
- [ ] Chamado em `Program.cs` após `app.Build()` e antes de `app.Run()`
- [ ] `dotnet run` → `GET /columns` retorna as 3 colunas
- [ ] Rodar `dotnet run` uma segunda vez → não duplica as colunas
- [ ] `dotnet build` passa

**Gate**: build + smoke manual
**Commit**: `feat(columns): add ColumnSeeder with default columns`

---

### T3: Criar ColumnsController com CRUD + reordenação

**What**: Controller com GET, POST, PUT, PATCH /order, DELETE
**Where**: `backend/TodoBoard.Api/Controllers/ColumnsController.cs`
**Depends on**: T2
**Requirement**: COL-02, COL-03, COL-04, COL-05, COL-06, COL-08, COL-10

**Done when**:
- [ ] `GET /columns` retorna lista ordenada por `Order`
- [ ] `POST /columns` valida name, calcula `order = max + 1`, retorna `201`
- [ ] `PUT /columns/{id}` renomeia, retorna `200` ou `404`
- [ ] `PATCH /columns/{id}/order` faz swap com a coluna na posição alvo, retorna `200`
- [ ] `DELETE /columns/{id}` remove e retorna `204` ou `404`
- [ ] Todos com `[Authorize]`
- [ ] `dotnet build` passa

**Gate**: build + smoke manual
**Commit**: `feat(columns): add ColumnsController with CRUD and reorder`

---

### T4: Criar ColumnService Angular

**What**: Service com `getAll()`, `create()`, `rename()`, `reorder()`, `delete()`
**Where**: `frontend/src/app/core/services/column.service.ts`
**Depends on**: Nenhuma
**Requirement**: COL-02, COL-04, COL-06, COL-08, COL-10

**Done when**:
- [ ] Interface `Column` definida com `id`, `name`, `order`
- [ ] `getAll(): Observable<Column[]>`
- [ ] `create(name): Observable<Column>`
- [ ] `rename(id, name): Observable<Column>`
- [ ] `reorder(id, order): Observable<void>`
- [ ] `delete(id): Observable<void>`
- [ ] `ng build` passa

**Gate**: build
**Commit**: `feat(columns): add Angular ColumnService`

---

### T5: Criar ColumnsManagerComponent

**What**: Tela de gerenciamento — lista ordenada, criar, renomear inline, botões ←→ para reordenar, excluir
**Where**: `frontend/src/app/features/columns/columns-manager.component.ts`
**Depends on**: T4
**Requirement**: COL-03, COL-05, COL-07, COL-09, COL-11

**Done when**:
- [ ] Lista exibe colunas ordenadas por `order` com o número da posição
- [ ] Formulário de criação com campo nome
- [ ] Renomeação inline (clique em "Renomear" → campo editável → salvar)
- [ ] Botões ← e → para mover coluna para esquerda/direita (desabilitados nas extremidades)
- [ ] Botão "Excluir" remove a coluna
- [ ] Mensagens de erro inline
- [ ] Estilizado com TailwindCSS — dark/light mode
- [ ] Rota `/columns` adicionada em `app.routes.ts` protegida por `authGuard`
- [ ] `ng build` passa

**Gate**: build + smoke manual
**Commit**: `feat(columns): add ColumnsManagerComponent`

---

### T6: Smoke test end-to-end de colunas

**What**: Validar fluxo completo via UI com backend rodando
**Depends on**: T3, T5

**Done when**:
- [ ] Subir API → `GET /columns` retorna 3 colunas padrão
- [ ] Acessar `/columns` na UI → 3 colunas listadas em ordem
- [ ] Criar coluna "Revisão" → aparece no final
- [ ] Renomear "Revisão" para "Em Revisão" → atualiza na lista
- [ ] Mover "Em Revisão" para a esquerda → ordem atualizada
- [ ] Excluir "Em Revisão" → some da lista

**Gate**: smoke manual end-to-end
**Commit**: N/A

---

## Parallel Execution Map

```
Phase 1 (Backend — Sequencial):
  T1 → T2 → T3

Phase 2 (Frontend — Sequencial, paralelo ao Phase 1):
  T4 → T5

Phase 3 (Integração):
  (T3 + T5) → T6
```

---

## Task Granularity Check

| Task | Escopo | Status |
|---|---|---|
| T1: Column entity + migration | 1 model + 1 DbSet + migration | ✅ Granular |
| T2: ColumnSeeder | 1 seeder + 1 chamada no Program.cs | ✅ Granular |
| T3: ColumnsController | 1 controller com 5 endpoints | ✅ Granular |
| T4: ColumnService | 1 service com 5 métodos | ✅ Granular |
| T5: ColumnsManagerComponent | 1 componente + template completo | ✅ Granular |
| T6: Smoke test | Validação manual | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (corpo) | Diagrama mostra | Status |
|---|---|---|---|
| T1 | Nenhuma | Início Phase 1 | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T2 | T2 → T3 | ✅ |
| T4 | Nenhuma | Início Phase 2 | ✅ |
| T5 | T4 | T4 → T5 | ✅ |
| T6 | T3, T5 | (T3 + T5) → T6 | ✅ |

---

## Requirement Traceability

| Requirement ID | Task | Status |
|---|---|---|
| COL-01 | T1, T2 | Pending |
| COL-02 | T1, T3, T4 | Pending |
| COL-03 | T3, T5 | Pending |
| COL-04 | T3, T4 | Pending |
| COL-05 | T3, T5 | Pending |
| COL-06 | T3, T4 | Pending |
| COL-07 | T5 | Pending |
| COL-08 | T3, T4 | Pending |
| COL-09 | T5 | Pending |
| COL-10 | T3, T4 | Pending |
| COL-11 | T5 | Pending |
