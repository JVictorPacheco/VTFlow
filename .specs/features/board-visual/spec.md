# Board Visual — Specification

## Problem Statement

O board já exibe colunas e cards, mas falta a experiência visual esperada de um Kanban: arrastar cards entre colunas com o mouse e filtrar para focar no que importa.

## Goals

- [ ] Usuário consegue mover cards entre colunas via drag-and-drop
- [ ] Usuário consegue filtrar cards por etiqueta e/ou prioridade

## Out of Scope

| Feature | Razão |
|---|---|
| Drag-and-drop de colunas | Complexidade extra — reordenação por botões já existe |
| Drag-and-drop entre boards | Fora do v1 |
| Filtro por texto/título | Fora do v1 |
| Salvar filtros aplicados | Fora do v1 |

---

## User Stories

### P1: Drag-and-drop de cards entre colunas ⭐ MVP

**User Story**: Como usuário, quero arrastar um card de uma coluna para outra, para que eu possa atualizar o status da tarefa de forma intuitiva.

**Why P1**: É o gesto central de um board Kanban — mover cards com o mouse.

**Acceptance Criteria**:

1. WHEN o usuário arrasta um card e solta em outra coluna THEN o card SHALL aparecer na nova coluna imediatamente
2. WHEN o card é solto em outra coluna THEN a API SHALL ser chamada com `PATCH /cards/{id}/column`
3. WHEN o drag está em andamento THEN o card original SHALL ter aparência de "fantasma" (opaco)
4. WHEN o card é solto na mesma coluna de origem THEN nenhuma chamada à API SHALL ser feita
5. WHEN a chamada à API falha THEN o card SHALL voltar para a coluna original

**Independent Test**: Arrastar card da coluna "A Fazer" para "Em Andamento" → card aparece em "Em Andamento" e persiste após reload.

---

### P1: Filtro por etiqueta e prioridade ⭐ MVP

**User Story**: Como usuário, quero filtrar os cards do board por etiqueta e/ou prioridade, para que eu possa focar nas tarefas relevantes.

**Why P1**: Com muitos cards o board fica poluído — filtros são essenciais para usabilidade.

**Acceptance Criteria**:

1. WHEN o usuário seleciona uma etiqueta no filtro THEN o board SHALL exibir apenas cards com aquela etiqueta
2. WHEN o usuário seleciona uma prioridade no filtro THEN o board SHALL exibir apenas cards com aquela prioridade
3. WHEN ambos os filtros estão ativos THEN o board SHALL exibir cards que satisfazem os dois critérios (AND)
4. WHEN o usuário limpa os filtros THEN todos os cards SHALL ser exibidos novamente
5. WHEN um filtro está ativo THEN o número de cards por coluna SHALL refletir apenas os cards visíveis

**Independent Test**: Selecionar etiqueta "Urgente" → apenas cards com essa etiqueta aparecem nas colunas.

---

## Edge Cases

- WHEN todas as colunas ficam vazias após filtro THEN cada coluna SHALL exibir mensagem "Nenhum card"
- WHEN o drag é cancelado (Esc ou solto fora) THEN o card SHALL voltar à posição original
- WHEN não há etiquetas cadastradas THEN o filtro de etiquetas SHALL estar desabilitado/oculto

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| BRD-01 | P1: Drag-and-drop — mover visualmente | Design | Pending |
| BRD-02 | P1: Drag-and-drop — chamar API | Design | Pending |
| BRD-03 | P1: Drag-and-drop — aparência fantasma | Design | Pending |
| BRD-04 | P1: Drag-and-drop — rollback em erro | Design | Pending |
| BRD-05 | P1: Filtro — por etiqueta | Design | Pending |
| BRD-06 | P1: Filtro — por prioridade | Design | Pending |
| BRD-07 | P1: Filtro — combinado AND | Design | Pending |
| BRD-08 | P1: Filtro — limpar | Design | Pending |

---

## Success Criteria

- [ ] Arrastar card entre colunas funciona e persiste no banco
- [ ] Filtros por etiqueta e prioridade funcionam em combinação
- [ ] Contadores de cards por coluna refletem filtros ativos
