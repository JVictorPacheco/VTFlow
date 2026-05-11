# Labels — Specification

## Problem Statement

O usuário precisa de uma forma de categorizar visualmente as tarefas. Etiquetas com nome e cor permitem identificar o tipo de cada card de relance, e por serem globais podem ser reutilizadas em múltiplos cards.

## Goals

- [ ] Usuário consegue criar, editar e excluir etiquetas com nome e cor
- [ ] Etiquetas são globais e reutilizáveis entre cards (associação feita nas próximas milestones)
- [ ] Tela de gerenciamento de etiquetas acessível e funcional

## Out of Scope

| Feature | Razão |
|---|---|
| Associação de etiqueta a card | Milestone 5 (Cards) |
| Etiquetas por usuário (multi-tenant) | App de uso pessoal, único usuário |
| Ícones ou imagens nas etiquetas | Complexidade desnecessária no v1 |
| Ordenação/agrupamento de etiquetas | Fora do v1 |

---

## User Stories

### P1: Criar etiqueta ⭐ MVP

**User Story**: Como usuário, quero criar uma etiqueta com nome e cor, para que eu possa categorizar minhas tarefas.

**Why P1**: Base de tudo — sem etiquetas não há categorização.

**Acceptance Criteria**:

1. WHEN `POST /labels` é chamado com `name` e `color` válidos THEN a API SHALL criar a etiqueta e retornar `201 Created` com o objeto criado
2. WHEN `POST /labels` é chamado com `name` vazio THEN a API SHALL retornar `400 Bad Request`
3. WHEN `POST /labels` é chamado com `color` inválido (não é hex válido) THEN a API SHALL retornar `400 Bad Request`
4. WHEN `POST /labels` é chamado com um `name` já existente THEN a API SHALL retornar `409 Conflict`
5. WHEN o usuário preenche o formulário e submete THEN o Angular SHALL exibir a nova etiqueta na lista imediatamente

**Independent Test**: Criar etiqueta via UI → aparece na lista com nome e cor corretos.

---

### P1: Listar etiquetas ⭐ MVP

**User Story**: Como usuário, quero ver todas as minhas etiquetas, para que eu possa gerenciá-las.

**Why P1**: Necessário para qualquer operação de gerenciamento.

**Acceptance Criteria**:

1. WHEN `GET /labels` é chamado THEN a API SHALL retornar `200 OK` com array de etiquetas
2. WHEN não há etiquetas cadastradas THEN a API SHALL retornar `200 OK` com array vazio
3. WHEN a tela de etiquetas é carregada THEN o Angular SHALL exibir todas as etiquetas com preview de cor

**Independent Test**: Acessar `/labels` na UI → lista de etiquetas exibida.

---

### P1: Editar etiqueta ⭐ MVP

**User Story**: Como usuário, quero editar o nome ou a cor de uma etiqueta existente, para que eu possa corrigir ou atualizar categorizações.

**Why P1**: Sem edição, erros de criação exigem deletar e recriar.

**Acceptance Criteria**:

1. WHEN `PUT /labels/{id}` é chamado com dados válidos THEN a API SHALL atualizar e retornar `200 OK` com objeto atualizado
2. WHEN `PUT /labels/{id}` é chamado com id inexistente THEN a API SHALL retornar `404 Not Found`
3. WHEN o usuário edita e salva THEN o Angular SHALL atualizar a etiqueta na lista sem recarregar a página

**Independent Test**: Editar nome de etiqueta via UI → nome atualizado na lista.

---

### P1: Excluir etiqueta ⭐ MVP

**User Story**: Como usuário, quero excluir uma etiqueta que não uso mais.

**Why P1**: Gerenciamento básico do CRUD.

**Acceptance Criteria**:

1. WHEN `DELETE /labels/{id}` é chamado THEN a API SHALL excluir e retornar `204 No Content`
2. WHEN `DELETE /labels/{id}` é chamado com id inexistente THEN a API SHALL retornar `404 Not Found`
3. WHEN o usuário confirma a exclusão THEN o Angular SHALL remover a etiqueta da lista imediatamente

**Independent Test**: Excluir etiqueta via UI → some da lista.

---

## Edge Cases

- WHEN a cor enviada não começa com `#` THEN a API SHALL retornar `400 Bad Request`
- WHEN o nome tem espaços em branco apenas THEN a API SHALL tratar como vazio e retornar `400`
- WHEN a lista está vazia THEN a UI SHALL exibir mensagem "Nenhuma etiqueta cadastrada"

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| LBL-01 | P1: Criar — endpoint | Design | Pending |
| LBL-02 | P1: Criar — validações | Design | Pending |
| LBL-03 | P1: Listar — endpoint | Design | Pending |
| LBL-04 | P1: Listar — UI | Design | Pending |
| LBL-05 | P1: Editar — endpoint | Design | Pending |
| LBL-06 | P1: Editar — UI | Design | Pending |
| LBL-07 | P1: Excluir — endpoint | Design | Pending |
| LBL-08 | P1: Excluir — UI | Design | Pending |

---

## Success Criteria

- [ ] CRUD completo de etiquetas funciona via UI
- [ ] Cores exibidas visualmente como preview (bolinha/badge colorida)
- [ ] Rotas protegidas — redireciona para `/login` sem token
- [ ] Lista atualiza sem reload de página em todas as operações
