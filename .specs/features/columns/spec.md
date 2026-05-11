# Columns — Specification

## Problem Statement

O board precisa de colunas para organizar os cards visualmente. As colunas padrão ("A Fazer", "Em Andamento", "Concluído") devem existir automaticamente ao iniciar o sistema, e o usuário pode criar novas colunas conforme necessário. A ordem das colunas define como aparecem no board.

## Goals

- [ ] Colunas padrão criadas automaticamente via seed na primeira execução
- [ ] Usuário consegue criar, renomear, reordenar e excluir colunas customizadas
- [ ] Colunas exibidas no board respeitando a ordem definida

## Out of Scope

| Feature | Razão |
|---|---|
| Cards dentro das colunas | Milestone 5 |
| Drag-and-drop de colunas | Milestone 6 |
| Cores nas colunas | Fora do v1 |
| Limite de cards por coluna | Fora do v1 |

---

## User Stories

### P1: Seed de colunas padrão ⭐ MVP

**User Story**: Como sistema, quero criar as colunas padrão automaticamente na primeira execução, para que o usuário já tenha um board funcional sem configuração inicial.

**Why P1**: Sem colunas o board está vazio e inutilizável.

**Acceptance Criteria**:

1. WHEN a aplicação sobe pela primeira vez THEN o sistema SHALL criar as colunas "A Fazer" (order=1), "Em Andamento" (order=2) e "Concluído" (order=3)
2. WHEN a aplicação sobe e as colunas já existem THEN o sistema SHALL não duplicá-las
3. WHEN `GET /columns` é chamado após o seed THEN a API SHALL retornar as 3 colunas padrão

**Independent Test**: Limpar banco → subir API → `GET /columns` retorna 3 colunas.

---

### P1: Listar colunas ⭐ MVP

**User Story**: Como usuário, quero ver todas as colunas ordenadas, para que o board seja exibido corretamente.

**Why P1**: Base para renderizar o board.

**Acceptance Criteria**:

1. WHEN `GET /columns` é chamado THEN a API SHALL retornar `200 OK` com array de colunas ordenado por `order`
2. WHEN o frontend carrega o board THEN ele SHALL exibir as colunas na ordem correta

**Independent Test**: `GET /columns` retorna colunas ordenadas por `order`.

---

### P1: Criar coluna ⭐ MVP

**User Story**: Como usuário, quero criar novas colunas além das padrão, para que eu possa adaptar o board às minhas necessidades.

**Why P1**: Requisito explícito do projeto.

**Acceptance Criteria**:

1. WHEN `POST /columns` é chamado com `name` válido THEN a API SHALL criar a coluna com `order` no final da lista e retornar `201`
2. WHEN `POST /columns` é chamado com `name` vazio THEN a API SHALL retornar `400 Bad Request`
3. WHEN `POST /columns` é chamado com `name` duplicado THEN a API SHALL retornar `409 Conflict`

**Independent Test**: Criar coluna via UI → aparece no final da lista de colunas.

---

### P1: Renomear coluna ⭐ MVP

**User Story**: Como usuário, quero renomear qualquer coluna, para que eu possa ajustar os nomes ao meu fluxo de trabalho.

**Why P1**: Flexibilidade básica — inclusive as colunas padrão devem poder ser renomeadas.

**Acceptance Criteria**:

1. WHEN `PUT /columns/{id}` é chamado com `name` válido THEN a API SHALL atualizar e retornar `200`
2. WHEN `PUT /columns/{id}` é chamado com id inexistente THEN a API SHALL retornar `404`
3. WHEN o usuário renomeia e salva THEN o Angular SHALL atualizar o nome sem reload

**Independent Test**: Renomear "A Fazer" para "Todo" via UI → nome atualizado.

---

### P1: Reordenar colunas ⭐ MVP

**User Story**: Como usuário, quero mudar a ordem das colunas, para que eu possa organizar o board como preferir.

**Why P1**: A ordem das colunas é fundamental para a usabilidade do board.

**Acceptance Criteria**:

1. WHEN `PATCH /columns/{id}/order` é chamado com novo valor de `order` THEN a API SHALL reordenar as colunas e retornar `200`
2. WHEN o usuário clica em "mover para esquerda/direita" THEN o Angular SHALL reordenar e atualizar a lista

**Independent Test**: Mover coluna via UI → ordem atualizada visualmente.

---

### P1: Excluir coluna ⭐ MVP

**User Story**: Como usuário, quero excluir colunas que não uso mais.

**Why P1**: Gerenciamento básico.

**Acceptance Criteria**:

1. WHEN `DELETE /columns/{id}` é chamado THEN a API SHALL excluir e retornar `204`
2. WHEN `DELETE /columns/{id}` é chamado com id inexistente THEN a API SHALL retornar `404`
3. WHEN o usuário exclui uma coluna THEN o Angular SHALL removê-la da lista imediatamente

**Independent Test**: Excluir coluna via UI → some da lista.

---

## Edge Cases

- WHEN o nome da coluna tem apenas espaços THEN a API SHALL retornar `400`
- WHEN a lista está vazia (improvável após seed) THEN a UI SHALL exibir mensagem adequada
- WHEN a coluna tem cards (futuramente) THEN a exclusão deverá ser bloqueada — registrado para Milestone 5

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| COL-01 | P1: Seed colunas padrão | Design | Pending |
| COL-02 | P1: Listar — endpoint | Design | Pending |
| COL-03 | P1: Listar — ordem correta | Design | Pending |
| COL-04 | P1: Criar — endpoint | Design | Pending |
| COL-05 | P1: Criar — validações | Design | Pending |
| COL-06 | P1: Renomear — endpoint | Design | Pending |
| COL-07 | P1: Renomear — UI | Design | Pending |
| COL-08 | P1: Reordenar — endpoint | Design | Pending |
| COL-09 | P1: Reordenar — UI (botões esq/dir) | Design | Pending |
| COL-10 | P1: Excluir — endpoint | Design | Pending |
| COL-11 | P1: Excluir — UI | Design | Pending |

---

## Success Criteria

- [ ] Subir a API → `GET /columns` retorna 3 colunas padrão automaticamente
- [ ] CRUD completo de colunas funciona via UI
- [ ] Ordem das colunas é respeitada e pode ser alterada
- [ ] Rotas protegidas por autenticação
