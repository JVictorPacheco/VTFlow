# Cards — Specification

## Problem Statement

Cards são a unidade central do board. Cada card representa uma tarefa com título, descrição, prazo opcional, prioridade, status e etiquetas. Os cards são organizados dentro de colunas e o usuário precisa de um CRUD completo para gerenciá-los.

## Goals

- [ ] Usuário consegue criar, visualizar, editar e excluir cards
- [ ] Cada card pertence a uma coluna e pode ter múltiplas etiquetas
- [ ] Cards exibem prazo, prioridade e etiquetas visualmente no board

## Out of Scope

| Feature | Razão |
|---|---|
| Drag-and-drop entre colunas | Milestone 6 |
| Subtarefas | Fora do v1 |
| Comentários | Fora do v1 |
| Anexos/arquivos | Fora do v1 |
| Histórico de alterações | Fora do v1 |

---

## User Stories

### P1: Criar card ⭐ MVP

**User Story**: Como usuário, quero criar um card em uma coluna com título, descrição, prazo, prioridade e etiquetas, para que eu possa registrar e organizar minhas tarefas.

**Why P1**: Funcionalidade central do projeto.

**Acceptance Criteria**:

1. WHEN `POST /cards` é chamado com dados válidos THEN a API SHALL criar o card e retornar `201` com o objeto criado
2. WHEN `POST /cards` é chamado sem título THEN a API SHALL retornar `400 Bad Request`
3. WHEN `POST /cards` é chamado com `columnId` inexistente THEN a API SHALL retornar `404 Not Found`
4. WHEN etiquetas são associadas THEN a API SHALL criar os vínculos `CardLabel`
5. WHEN o usuário preenche o formulário e submete THEN o Angular SHALL adicionar o card na coluna correta

**Independent Test**: Criar card via UI → aparece na coluna correspondente com título e etiquetas.

---

### P1: Listar cards por coluna ⭐ MVP

**User Story**: Como usuário, quero ver os cards de cada coluna no board, organizados por ordem de criação.

**Why P1**: Sem listagem o board está vazio.

**Acceptance Criteria**:

1. WHEN `GET /cards?columnId={id}` é chamado THEN a API SHALL retornar cards da coluna ordenados por `createdAt`
2. WHEN `GET /cards` é chamado sem filtro THEN a API SHALL retornar todos os cards
3. WHEN o board carrega THEN o Angular SHALL exibir os cards em cada coluna com etiquetas, prioridade e prazo

**Independent Test**: `GET /cards?columnId=1` retorna apenas os cards da coluna 1.

---

### P1: Editar card ⭐ MVP

**User Story**: Como usuário, quero editar todos os campos de um card existente, incluindo mover para outra coluna e alterar etiquetas.

**Why P1**: Sem edição o card fica imutável após criação.

**Acceptance Criteria**:

1. WHEN `PUT /cards/{id}` é chamado com dados válidos THEN a API SHALL atualizar o card e retornar `200`
2. WHEN `PUT /cards/{id}` é chamado com `columnId` diferente THEN o card SHALL ser movido para a nova coluna
3. WHEN etiquetas são alteradas THEN a API SHALL sincronizar os vínculos `CardLabel`
4. WHEN o usuário edita e salva THEN o Angular SHALL atualizar o card sem reload

**Independent Test**: Editar título e mover para outra coluna → card aparece na nova coluna com título atualizado.

---

### P1: Excluir card ⭐ MVP

**User Story**: Como usuário, quero excluir cards que não são mais relevantes.

**Why P1**: Gerenciamento básico.

**Acceptance Criteria**:

1. WHEN `DELETE /cards/{id}` é chamado THEN a API SHALL excluir o card e seus vínculos de etiquetas e retornar `204`
2. WHEN `DELETE /cards/{id}` é chamado com id inexistente THEN a API SHALL retornar `404`
3. WHEN o usuário exclui um card THEN o Angular SHALL removê-lo da coluna imediatamente

**Independent Test**: Excluir card → some da coluna no board.

---

### P1: Mover card entre colunas ⭐ MVP

**User Story**: Como usuário, quero mover um card de uma coluna para outra através da edição ou de um menu rápido.

**Why P1**: Mover cards entre colunas é o fluxo central de um board Kanban.

**Acceptance Criteria**:

1. WHEN `PATCH /cards/{id}/column` é chamado com `columnId` válido THEN a API SHALL mover o card e retornar `200`
2. WHEN o usuário seleciona "Mover para..." no card THEN o Angular SHALL atualizar o card na coluna correta sem reload

**Independent Test**: Mover card via menu rápido → card aparece na nova coluna instantaneamente.

---

## Campos do Card

| Campo | Tipo | Obrigatório | Valores |
|---|---|---|---|
| `title` | string | Sim | Texto livre |
| `description` | string | Não | Texto livre |
| `dueDate` | date | Não | Data opcional |
| `priority` | enum | Sim | `Low`, `Medium`, `High` |
| `columnId` | int | Sim | ID de coluna existente |
| `labelIds` | int[] | Não | IDs de etiquetas existentes |

---

## Edge Cases

- WHEN o título tem apenas espaços THEN a API SHALL retornar `400`
- WHEN `labelIds` contém IDs inexistentes THEN a API SHALL ignorar os IDs inválidos (não falhar)
- WHEN uma coluna é excluída com cards THEN a exclusão SHALL ser bloqueada (validação no `ColumnsController`)

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| CRD-01 | P1: Criar — endpoint | Design | Pending |
| CRD-02 | P1: Criar — validações | Design | Pending |
| CRD-03 | P1: Criar — vínculo CardLabel | Design | Pending |
| CRD-04 | P1: Listar — endpoint com filtro | Design | Pending |
| CRD-05 | P1: Listar — UI no board | Design | Pending |
| CRD-06 | P1: Editar — endpoint | Design | Pending |
| CRD-07 | P1: Editar — sync etiquetas | Design | Pending |
| CRD-08 | P1: Editar — UI | Design | Pending |
| CRD-09 | P1: Excluir — endpoint | Design | Pending |
| CRD-10 | P1: Excluir — UI | Design | Pending |
| CRD-11 | P1: Mover — endpoint PATCH | Design | Pending |
| CRD-12 | P1: Mover — UI menu rápido | Design | Pending |

---

## Success Criteria

- [ ] CRUD completo de cards funciona via UI
- [ ] Cards exibem título, prioridade, prazo e etiquetas coloridas
- [ ] Cards podem ser movidos entre colunas
- [ ] Exclusão de coluna com cards é bloqueada
