# Tema e Polimento — Tasks

**Spec**: `.specs/features/polish/spec.md`
**Status**: In Progress

---

## Task List

### T1 — Loading inicial do board

**What**: Adicionar `loading = signal(true)` no `BoardComponent`. Setar para `false` quando colunas E cards chegarem. Exibir spinner centralizado enquanto `loading()` for true.
**Where**: `frontend/src/app/features/board/board.component.ts`
**Depends on**: —
**Done when**:
- Signal `loading` declarado
- `ngOnInit` usa `forkJoin` ou controle manual para setar `loading.set(false)` após ambas as respostas (colunas + cards)
- Template exibe spinner quando `loading()` é true, board quando false

---

### T2 — Toast de erro inline

**What**: Adicionar `toastMessage = signal('')` e `showToast(msg)` que seta a mensagem e limpa após 3s com `setTimeout`. Exibir toast fixo no topo da tela quando `toastMessage()` não estiver vazio. Chamar `showToast()` nos erros de `onDelete`, `onDrop` (rollback) e `onMove`.
**Where**: `frontend/src/app/features/board/board.component.ts`
**Depends on**: —
**Done when**:
- Toast visível no topo com z-50, fundo vermelho, texto branco
- Auto-desaparece após 3s
- Acionado nos 3 cenários de erro

---

### T3 — Responsividade header e FilterBar

**What**: Ajustar o header do board para não quebrar em mobile. Ajustar a FilterBar para empilhar em coluna em telas pequenas.
**Where**: `frontend/src/app/features/board/board.component.ts` (template)
**Depends on**: —
**Done when**:
- Header: links/botões usam `flex-wrap` ou se reorganizam em `sm:` breakpoint
- FilterBar: usa `flex-col sm:flex-row` para empilhar em mobile
- Scroll horizontal do board funciona em mobile

---

## Execution Order

T1, T2 e T3 são independentes — podem ser executadas em paralelo.

---

## Traceability

| Requirement | Task |
|---|---|
| POL-01 | T1 |
| POL-02, POL-03, POL-04 | T2 |
| POL-05, POL-06 | T3 |
