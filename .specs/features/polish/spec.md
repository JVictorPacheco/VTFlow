# Tema e Polimento — Specification

## Problem Statement

O board funciona, mas faltam feedbacks visuais para estados de carregamento e erros silenciosos, e o layout quebra em telas menores.

## Goals

- [ ] Usuário vê loading enquanto o board carrega
- [ ] Usuário recebe feedback quando uma ação falha (delete, drag, move)
- [ ] Layout funciona em telas menores (mobile/tablet)

## Out of Scope

- Animações complexas / transições de página
- Toast com fila de múltiplas mensagens
- Skeleton screens detalhados por card
- Dark/light toggle — já implementado

---

## User Stories

### P1: Loading inicial do board

**Acceptance Criteria**:
1. WHEN o board está carregando colunas/cards THEN SHALL exibir um spinner centralizado
2. WHEN os dados chegam THEN o spinner SHALL desaparecer e o board SHALL ser exibido

---

### P1: Feedback de erros silenciosos

**Acceptance Criteria**:
1. WHEN o delete de um card falha THEN SHALL exibir toast de erro por 3 segundos
2. WHEN o drag-and-drop falha (rollback) THEN SHALL exibir toast de erro por 3 segundos
3. WHEN o move via select falha THEN SHALL exibir toast de erro por 3 segundos
4. WHEN o toast aparece THEN SHALL ser visível sobre todo o conteúdo (z-index alto)

---

### P1: Responsividade básica

**Acceptance Criteria**:
1. WHEN a tela é menor que 640px THEN o header SHALL empilhar os links/botões sem overflow
2. WHEN a tela é menor que 640px THEN a FilterBar SHALL mostrar os selects em coluna
3. WHEN a tela é menor que 640px THEN o board SHALL ter scroll horizontal funcional

---

## Requirement Traceability

| Requirement ID | Story | Status |
|---|---|---|
| POL-01 | Loading spinner inicial | Pending |
| POL-02 | Toast erro delete | Pending |
| POL-03 | Toast erro drag rollback | Pending |
| POL-04 | Toast erro move select | Pending |
| POL-05 | Responsividade header | Pending |
| POL-06 | Responsividade FilterBar | Pending |
