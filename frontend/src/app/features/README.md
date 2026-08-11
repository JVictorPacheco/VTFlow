---
tags:
  - frontend
  - features
---

# Features

## Objetivo do Módulo

Componentes de página da aplicação. Cada subpasta representa uma rota (ou conjunto de rotas) com lazy loading.

## Estrutura

```
features/
├── auth/                    # Autenticação (rotas públicas)
│   ├── login/               # LoginComponent
│   └── register/            # RegisterComponent
├── boards/                  # Lista de boards (/boards)
│   └── board-list.component.ts
├── board/                   # Kanban board + card detail + card form (/boards/:id)
│   ├── board.component.ts
│   ├── card-detail.component.ts
│   └── card-form.component.ts
├── columns/                 # Gerenciador de colunas (/columns)
│   └── columns-manager.component.ts
└── labels/                  # Gerenciador de etiquetas (/labels)
    └── labels.component.ts
```

## Dependências Internas

- [[../core/services/README]] — Todos os serviços HTTP
- [[../core/guards/README]] — `authGuard` (protege rotas)

## Dependências Externas

- `@angular/router` — Lazy loading (`loadComponent`)
- `@angular/forms` — ReactiveFormsModule + FormBuilder
- `@angular/common` — DatePipe (para formatação de datas)
- Tailwind CSS — Classes utilitárias para UI

## Convenções

- **Standalone components**: Todos os componentes são standalone
- **Inline templates**: HTML dentro do arquivo `.ts` (sem `.html` separado)
- **Signals**: Estado gerenciado com `signal()` e `computed()`
- **Formulários**: `ReactiveFormsModule` com `FormBuilder`
- **Injeção**: `inject()` no corpo da classe, não no construtor

## Rotas (Lazy Loading)

| Rota | Componente | Auth |
|---|---|---|
| `/login` | `LoginComponent` | Público |
| `/register` | `RegisterComponent` | Público |
| `/boards` | `BoardListComponent` | JWT |
| `/boards/:id` | `BoardComponent` | JWT |
| `/labels` | `LabelsComponent` | JWT |
| `/columns` | `ColumnsManagerComponent` | JWT |

## Observações Técnicas

- `BoardComponent` é o maior componente (584 linhas) — contém lógica de drag-and-drop manual (não usa biblioteca externa).
- `CardDetailComponent` (430 linhas) é um modal com abas (subtarefas, comentários, timeline).
- Estado é puramente local — cada componente gerencia seu próprio estado via signals. Não há compartilhamento de estado entre componentes irmãos.
