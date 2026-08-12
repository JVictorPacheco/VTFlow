---
tags:
  - arquitetura
  - visão-geral
  - objetivo
created: 2026-08-10
---

# Objetivo do Sistema

## Propósito Principal

O **VTFlow** é uma aplicação web de gestão de tarefas no estilo **Kanban Board**, permitindo que usuários organizem seu trabalho em quadros (boards), colunas personalizáveis e cards com subtarefas, comentários, etiquetas e log de atividades.

## Problemas que Resolve

- **Falta de organização visual de tarefas**: Substitui listas planas por um modelo Kanban com colunas e cards arrastáveis.
- **Rastreabilidade de atividades**: Cada alteração em um card (movimentação, etiquetas, subtarefas, comentários) é registrada como atividade, formando um histórico completo.
- **Centralização de informações**: Subtarefas, comentários, etiquetas e datas de vencimento coabitam no mesmo card, evitando dispersão de informações.

## Principais Fluxos de Negócio

### Fluxo 1: Autenticação
1. Usuário se registra com username + senha (mín. 6 caracteres)
2. Usuário faz login e recebe token JWT (válido por 8h)
3. Token é anexado automaticamente a todas as requisições via interceptor
4. Em caso de 401 (não autorizado), o usuário é redirecionado ao login

### Fluxo 2: Criação e Gestão de Board
1. Usuário cria um board (nome obrigatório, descrição opcional)
2. Ao criar, o sistema automaticamente gera 3 colunas padrão: "A Fazer", "Em Andamento", "Concluído"
3. Usuário pode renomear ou excluir o board
4. Usuário pode adicionar/remover/reordenar colunas

### Fluxo 3: Gestão de Cards (Kanban)
1. Usuário cria cards dentro de colunas, com título, descrição, prioridade, data de vencimento e etiquetas
2. Cards podem ser movidos entre colunas (drag-and-drop ou via API)
3. Cards podem ser reordenados dentro da mesma coluna
4. Cada card pode ter subtarefas (com toggle de concluído), comentários e etiquetas
5. Toda alteração gera uma entrada no log de atividades do card

### Fluxo 4: Etiquetas (Labels)
1. Usuário gerencia etiquetas globalmente (CRUD)
2. Etiquetas têm nome e cor hexadecimal (ex: `#FF5733`)
3. Etiquetas são associadas a cards via relação N:N

## Atores Envolvidos

| Ator | Descrição |
|---|---|
| **Usuário autenticado** | Único ator do sistema. Realiza todas as operações após login. |
| **Sistema (backend)** | API RESTful que persiste dados, valida regras de negócio e gera log de atividades. |

> **Hipótese**: O sistema foi projetado para um único tenant (não há isolamento de boards por usuário). Todos os usuários autenticados compartilham o mesmo conjunto de boards. Isso é inferido pela ausência de relação `UserId` nos modelos `Board` e `Card`.

## Funcionalidades Centrais

1. **Autenticação JWT**: Registro e login com BCrypt + JWT Bearer
2. **CRUD de Boards**: Criação com colunas padrão automáticas
3. **Kanban Board**: Colunas ordenáveis, cards arrastáveis entre colunas
4. **Gestão de Cards**: Título, descrição, prioridade (Low/Medium/High), data de vencimento, ordem
5. **Subtarefas**: CRUD com toggle de concluído/reaberto e renomeação
6. **Comentários**: CRUD com timestamp de criação e edição
7. **Etiquetas (Labels)**: CRUD global, associação N:N com cards, validação de cor hex
8. **Log de Atividades**: Registro automático de 12 tipos de eventos (criação, movimentação, alteração de prioridade, etiquetas, subtarefas, comentários)
9. **Tema Dark/Light**: Alternância com persistência em localStorage
10. **Health Check**: Endpoint anônimo `GET /health`

## Visão de Produto

O VTFlow é um **MVP funcional** de um gerenciador Kanban pessoal. A UI é em português brasileiro (`lang="pt-BR"`), indicando foco no mercado lusófono.

**Estágio atual**: Produto mínimo viável com todas as operações CRUD implementadas, autenticação funcional e UI responsiva com Tailwind CSS.

## Contexto Operacional

| Aspecto | Configuração |
|---|---|
| **Runtime backend** | .NET 9.0 (ASP.NET Core Web API) |
| **Runtime frontend** | Angular 21 (browser, SPA) |
| **Banco de dados** | SQLite (`VTFlow.db`, arquivo local) |
| **Persistência frontend** | localStorage (token JWT, preferência de tema) |
| **Porta backend (dev)** | HTTP:5253 / HTTPS:7135 |
| **Porta frontend (dev)** | 4200 |
| **Idioma** | pt-BR |
| **OpenAPI** | Disponível em dev via `MapOpenApi()` |
