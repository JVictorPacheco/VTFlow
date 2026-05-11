# Labels — Tasks

**Design**: `.specs/features/labels/design.md`
**Status**: Done

---

## Execution Plan

### Phase 1 — Backend (Sequencial)
```
T1 → T2
```

### Phase 2 — Frontend (Sequencial, paralelo ao Phase 1)
```
T3 → T4
```

### Phase 3 — Integração
```
(T2 + T4) → T5
```

---

## Task Breakdown

### T1: Adicionar entidade Label + migration

**What**: Criar `Models/Label.cs`, adicionar `DbSet<Label>` ao `AppDbContext` e gerar migration
**Where**:
- `backend/TodoBoard.Api/Models/Label.cs`
- `backend/TodoBoard.Api/Data/AppDbContext.cs`
**Depends on**: Nenhuma
**Requirement**: LBL-01, LBL-03

**Done when**:
- [ ] `Label.cs` criado com `Id`, `Name`, `Color`
- [ ] `DbSet<Label> Labels` adicionado ao `AppDbContext`
- [ ] `dotnet ef migrations add AddLabelEntity` executa sem erros
- [ ] `dotnet ef database update` aplica migration
- [ ] `dotnet build` passa

**Gate**: build
**Commit**: `feat(labels): add Label entity and migration`

---

### T2: Criar LabelsController com CRUD completo

**What**: Controller com `GET /labels`, `POST /labels`, `PUT /labels/{id}`, `DELETE /labels/{id}`
**Where**: `backend/TodoBoard.Api/Controllers/LabelsController.cs`
**Depends on**: T1
**Requirement**: LBL-01, LBL-02, LBL-03, LBL-05, LBL-07

**Done when**:
- [ ] `GET /labels` retorna `200` com lista (ou array vazio)
- [ ] `POST /labels` valida `name` não vazio e `color` no formato `#RRGGBB`, retorna `201` ou `400`/`409`
- [ ] `PUT /labels/{id}` atualiza e retorna `200`, ou `404` se não encontrado
- [ ] `DELETE /labels/{id}` remove e retorna `204`, ou `404` se não encontrado
- [ ] Todos os endpoints protegidos por `[Authorize]`
- [ ] `dotnet build` passa
- [ ] Teste manual: `GET /labels` via curl retorna `[]`

**Gate**: build + smoke manual
**Commit**: `feat(labels): add LabelsController with full CRUD`

---

### T3: Criar LabelService Angular

**What**: Service com `getAll()`, `create()`, `update()`, `delete()` consumindo a API
**Where**: `frontend/src/app/core/services/label.service.ts`
**Depends on**: Nenhuma
**Requirement**: LBL-01, LBL-03, LBL-05, LBL-07

**Done when**:
- [ ] `LabelService` criado com `inject(HttpClient)`
- [ ] `getAll(): Observable<Label[]>` — `GET /labels`
- [ ] `create(name, color): Observable<Label>` — `POST /labels`
- [ ] `update(id, name, color): Observable<Label>` — `PUT /labels/{id}`
- [ ] `delete(id): Observable<void>` — `DELETE /labels/{id}`
- [ ] Interface `Label` definida no mesmo arquivo
- [ ] `ng build` passa

**Gate**: build
**Commit**: `feat(labels): add Angular LabelService`

---

### T4: Criar LabelsComponent com CRUD na UI

**What**: Tela completa de gerenciamento — lista com preview de cor, formulário de criação, edição inline e exclusão
**Where**: `frontend/src/app/features/labels/labels.component.ts`
**Depends on**: T3
**Requirement**: LBL-02, LBL-04, LBL-06, LBL-08

**Done when**:
- [ ] Lista exibe todas as etiquetas com bolinha colorida + nome
- [ ] Estado vazio exibe "Nenhuma etiqueta cadastrada"
- [ ] Formulário de criação com `input[type=text]` para nome e `input[type=color]` para cor
- [ ] Criar nova etiqueta atualiza a lista sem reload
- [ ] Clique em "Editar" exibe campos inline — salvar atualiza a lista
- [ ] Clique em "Excluir" remove da lista imediatamente
- [ ] Erros (409, 404, etc.) exibidos como mensagem inline
- [ ] Estilizado com TailwindCSS — dark/light mode compatível
- [ ] Rota `/labels` adicionada em `app.routes.ts` protegida por `authGuard`
- [ ] `ng build` passa

**Gate**: build + smoke manual
**Commit**: `feat(labels): add LabelsComponent with full CRUD UI`

---

### T5: Smoke test end-to-end de etiquetas

**What**: Validar o fluxo completo via UI com backend rodando
**Depends on**: T2, T4

**Done when**:
- [ ] Acessar `/labels` sem token → redireciona para `/login`
- [ ] Autenticado, acessar `/labels` → lista carrega (vazia inicialmente)
- [ ] Criar etiqueta "Urgente" com cor `#EF4444` → aparece na lista
- [ ] Editar nome para "Urgente!" → atualiza na lista
- [ ] Excluir etiqueta → some da lista
- [ ] Mensagem de estado vazio aparece quando lista está vazia

**Gate**: smoke manual end-to-end
**Commit**: N/A

---

## Parallel Execution Map

```
Phase 1 (Backend — Sequencial):
  T1 → T2

Phase 2 (Frontend — Sequencial, paralelo ao Phase 1):
  T3 → T4

Phase 3 (Integração):
  (T2 + T4) → T5
```

---

## Task Granularity Check

| Task | Escopo | Status |
|---|---|---|
| T1: Label entity + migration | 1 model + 1 DbSet + migration | ✅ Granular |
| T2: LabelsController CRUD | 1 controller com 4 endpoints | ✅ Granular |
| T3: LabelService Angular | 1 service com 4 métodos | ✅ Granular |
| T4: LabelsComponent | 1 componente + template completo | ✅ Granular |
| T5: Smoke test | Validação manual | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (corpo) | Diagrama mostra | Status |
|---|---|---|---|
| T1 | Nenhuma | Início Phase 1 | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | Nenhuma | Início Phase 2 | ✅ |
| T4 | T3 | T3 → T4 | ✅ |
| T5 | T2, T4 | (T2 + T4) → T5 | ✅ |

---

## Requirement Traceability

| Requirement ID | Task | Status |
|---|---|---|
| LBL-01 | T1, T2 | Pending |
| LBL-02 | T2, T4 | Pending |
| LBL-03 | T1, T2, T3 | Pending |
| LBL-04 | T4 | Pending |
| LBL-05 | T2, T3 | Pending |
| LBL-06 | T4 | Pending |
| LBL-07 | T2, T3 | Pending |
| LBL-08 | T4 | Pending |
