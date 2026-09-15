---
tags:
  - frontend
  - módulo
---

# Frontend

## Objetivo do Módulo

Single Page Application (SPA) Angular 21 que fornece a interface de usuário para o VTFlow, consumindo a API RESTful do backend.

## Responsabilidade Principal

- Interface Kanban board com drag-and-drop
- Autenticação (login/registro)
- Gestão de boards, colunas, cards, labels, subtarefas e comentários
- Tema dark/light com persistência
- Roteamento com lazy loading e guards de autenticação

## Estrutura Interna

```
frontend/
├── src/
│   ├── index.html                    # Root HTML (lang="pt-BR")
│   ├── main.ts                       # Bootstrap
│   ├── styles.css                    # Tailwind directives
│   ├── environments/
│   │   ├── environment.ts            # apiUrl = localhost:5253
│   │   └── environment.prod.ts       # apiUrl = '' (same-origin)
│   └── app/
│       ├── app.ts                    # Root component
│       ├── app.config.ts             # Providers (router, http, auth interceptor)
│       ├── app.routes.ts             # Lazy-loaded routes
│       ├── core/
│       │   ├── guards/               # authGuard
│       │   ├── interceptors/         # authInterceptor
│       │   └── services/             # 10 serviços HTTP + theme
│       └── features/
│           ├── auth/                 # Login + Register
│           ├── boards/               # Lista de boards
│           ├── board/                # Kanban board + card detail + card form
│           ├── columns/              # Gerenciador de colunas
│           └── labels/               # Gerenciador de etiquetas
├── angular.json
├── package.json
├── tailwind.config.js
└── tsconfig*.json
```

## Dependências Externas

| Pacote | Versão |
|---|---|
| `@angular/core` | ^21.2.0 |
| `@angular/router` | ^21.2.0 |
| `tailwindcss` | ^3.4.19 |
| `vitest` | ^4.0.8 |
| `typescript` | ~5.9.2 |

## Módulos Relacionados

- [[../backend/README]] — Backend que serve a API consumida
- [[../docs/Arquitetura do Sistema]] — Arquitetura completa
- [[../docs/Objetivo do Sistema]] — Visão de produto

## Pontos de Entrada

- `main.ts` — Bootstrap da aplicação
- `app.config.ts` — Configuração de providers
- `app.routes.ts` — Definição de rotas com lazy loading

## Scripts

| Comando | Descrição |
|---|---|
| `npm start` | Dev server em :4200 |
| `npm run build` | Build de produção |
| `npm test` | Vitest |

## Observações Técnicas

- Componentes usam **inline templates** (HTML no `.ts`) — não há arquivos `.html` separados.
- Estado é gerenciado com **Angular Signals** (`signal()`, `computed()`), não RxJS.
- Todos os componentes são **standalone** (sem NgModules).
- Estilização com **Tailwind CSS** utilitário + dark mode via classe `dark`.
- Formulários usam `ReactiveFormsModule` com `FormBuilder`.
- Ambiente de dev aponta para `http://localhost:5253` (backend HTTP).
- Layout é responsivo com grid Tailwind.

## Débitos Técnicos

1. Apenas 1 teste unitário (`app.spec.ts`) — cobertura quase zero
2. Templates inline longos dificultam leitura em componentes grandes (ex: `board.component.ts` com 584 linhas, `card-detail.component.ts` com 430 linhas)
3. Estado é local aos componentes — não há state management global (ex: NgRx, SignalStore)
4. Internacionalização (i18n) não implementada — strings em pt-BR hardcoded
