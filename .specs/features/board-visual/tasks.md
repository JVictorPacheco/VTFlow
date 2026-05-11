# Board Visual — Tasks

**Spec**: `.specs/features/board-visual/spec.md`
**Design**: `.specs/features/board-visual/design.md`
**Status**: In Progress

---

## Task List

### T1 — Drag-and-drop: signals + eventos HTML5 no BoardComponent
**What**: Adicionar sinais `draggingCardId` e `dragOverColumnId`, e os handlers `onDragStart`, `onDragOver`, `onDrop`, `onDragLeave`, `onDragEnd` no `BoardComponent`.
**Where**: `frontend/src/app/features/board/board.component.ts`
**Depends on**: —
**Done when**:
- Signals declarados no componente
- Handlers implementados conforme data flow do design.md
- Lógica de guard para drop na mesma coluna
- Rollback em caso de erro da API
- `CardService.move()` chamado no drop com sucesso

---

### T2 — Drag-and-drop: template HTML com eventos e classes visuais
**What**: Adicionar `draggable="true"`, eventos `(dragstart)`, `(dragover)`, `(drop)`, `(dragleave)`, `(dragend)` no template. Aplicar classe `opacity-50` no card sendo arrastado e `ring-2 ring-blue-400` na coluna alvo.
**Where**: `frontend/src/app/features/board/board.component.ts` (template)
**Depends on**: T1
**Done when**:
- Cards têm `draggable="true"` e eventos corretos
- Card arrastado tem visual "fantasma" (opacity-50)
- Coluna de destino tem highlight (ring-2 ring-blue-400) durante dragover
- Drop limpa os estados visuais

---

### T3 — Filtros: signals computados no BoardComponent
**What**: Adicionar `filterLabelId = signal<number | null>(null)`, `filterPriority = signal<Priority | null>(null)`, e `filteredCards = computed(...)`. Atualizar `cardsForColumn()` para usar `filteredCards()`.
**Where**: `frontend/src/app/features/board/board.component.ts`
**Depends on**: —
**Done when**:
- Signals de filtro declarados
- `filteredCards` aplica ambos os filtros (AND)
- `cardsForColumn()` usa `filteredCards()`
- Contadores de cards refletem filtros ativos

---

### T4 — Filtros: FilterBar no template + botão limpar
**What**: Adicionar barra de filtros no topo do board (após o header): select de etiqueta, select de prioridade, botão "Limpar filtros".
**Where**: `frontend/src/app/features/board/board.component.ts` (template)
**Depends on**: T3
**Done when**:
- FilterBar visível no topo do board
- Select de etiqueta lista todas as etiquetas + opção "Todas"
- Select de prioridade lista Todas / Baixa / Média / Alta
- Botão "Limpar filtros" reseta ambos os signals
- Mensagem "Nenhum card" exibida quando coluna fica vazia após filtro

---

## Execution Order

```
T1 ─────────────────── T2 (depende de T1)
T3 ─────────────────── T4 (depende de T3)
```

T1 e T3 em paralelo → T2 e T4 em paralelo.

---

## Traceability

| Requirement | Task |
|---|---|
| BRD-01 Move visual | T1, T2 |
| BRD-02 Chamar API | T1 |
| BRD-03 Fantasma drag | T2 |
| BRD-04 Rollback erro | T1 |
| BRD-05 Filtro etiqueta | T3, T4 |
| BRD-06 Filtro prioridade | T3, T4 |
| BRD-07 Filtro AND | T3 |
| BRD-08 Limpar filtros | T4 |
