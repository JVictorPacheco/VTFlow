# Roadmap — Todo Board

## v1 — MVP Funcional ✅

### Milestone 1: Fundação do Projeto ✅
- [x] Estrutura do projeto backend (.NET 9 Web API)
- [x] Estrutura do projeto frontend (Angular + TailwindCSS)
- [x] Configuração do SQLite + Entity Framework Core
- [x] Configuração do CORS e ambiente de desenvolvimento

### Milestone 2: Autenticação ✅
- [x] Endpoint de registro de usuário
- [x] Endpoint de login com geração de JWT
- [x] Guard de autenticação no Angular
- [x] Tela de login e registro

### Milestone 3: Etiquetas (Labels) ✅
- [x] CRUD de etiquetas (nome + cor)
- [x] Tela de gerenciamento de etiquetas

### Milestone 4: Colunas (Board Columns) ✅
- [x] Seed de colunas padrão: "A Fazer", "Em Andamento", "Concluído"
- [x] CRUD de colunas customizadas
- [x] Gerenciamento de ordem das colunas

### Milestone 5: Cards/Tarefas ✅
- [x] CRUD de cards (título, descrição, prazo, prioridade, etiquetas)
- [x] Associação de etiquetas a cards
- [x] Vinculação de card à coluna

### Milestone 6: Board Visual ✅
- [x] Drag-and-drop de cards entre colunas (HTML5 API nativa)
- [x] Filtro por etiqueta e prioridade (AND logic)
- [x] Atualização otimista com rollback em erro

### Milestone 7: Tema e Polimento ✅
- [x] Toggle dark/light mode
- [x] Responsividade básica (mobile/tablet)
- [x] Feedbacks visuais (loading spinner, toast de erro)
- [x] Navegação entre telas (← Voltar ao board)

---

## v2 — Qualidade e Profundidade do Card ✅

### Milestone 8: Segurança e UX básica ✅
- [x] Confirmação antes de excluir card ou coluna (modal customizado, sem `confirm()` nativo)
- [x] Coluna com cards não pode ser excluída (erro 409 com mensagem clara)
- [x] Vencimento destacado — cards atrasados em vermelho, vencendo hoje em amarelo
- [x] Busca por título no board (computed signal, sem backend)

### Milestone 9: Reordenação de cards ✅
- [x] Campo `order` no Card (migração de banco)
- [x] Drag-and-drop vertical para reordenar cards dentro da coluna
- [x] API `PATCH /cards/{id}/order` para persistir nova ordem
- [x] Ao mover card de coluna, order é atribuído como max+1 na coluna destino

### Milestone 10: Subtarefas ✅
- [x] Entidade `Subtask` (título, isCompleted, cardId) com cascade delete
- [x] CRUD completo: criar, toggle, renomear (dblclick ou botão ✎), excluir
- [x] Progresso visual no card (ex: "2/5") e barra de progresso no detalhe
- [x] Subtarefas carregadas junto com o card no `GET /cards`

### Milestone 11: Comentários ✅
- [x] Entidade `Comment` (texto, createdAt, updatedAt, cardId) com cascade delete
- [x] CRUD completo: criar, editar (com timestamp "editado"), excluir
- [x] Carregamento lazy — buscados na primeira abertura do modal de detalhe
- [x] Modal de detalhe estilo Trello: layout duas colunas (subtarefas à esq, comentários à dir)
- [x] Modal de detalhe clicável a partir do card no board

### Milestone 12: Histórico de Atividades ✅
- [x] Entidade `CardActivity` (tipo de evento, descrição, timestamp, cardId)
- [x] Registro automático de eventos: criação, mudança de coluna, prioridade, etiqueta, subtarefa, comentário
- [x] Timeline unificada de comentários + atividades no detalhe do card

---

## v3 — Expansão do Produto

### Milestone 13: Múltiplos Boards ✅
- [x] Entidade `Board` (nome, descrição) com cascade delete em colunas e cards
- [x] Colunas vinculadas ao board (campo `boardId` + migration com dados existentes preservados)
- [x] Tela de lista de boards como página inicial pós-login (`/boards`)
- [x] CRUD completo de boards — criar, listar, abrir, renomear, excluir
- [x] Novo board cria automaticamente as 3 colunas padrão
- [x] `BoardComponent` carrega colunas filtradas pelo board via rota `/boards/:id`
- [x] `ColumnsManagerComponent` recebe `boardId` via query param

### Milestone 14: Arquivar Cards
- [ ] Campo `archivedAt` no Card
- [ ] Ação de arquivar (em vez de deletar)
- [ ] View de cards arquivados com opção de restaurar

### Milestone 15: Notificações de Prazo
- [ ] Badge no header com contagem de cards vencidos/vencendo hoje
- [ ] Lista de notificações de prazo
- [ ] Marcar notificação como lida

### Milestone 16: Estatísticas do Board
- [ ] Dashboard com cards por coluna, por prioridade, por etiqueta
- [ ] Cards concluídos por semana (gráfico simples)
- [ ] Tempo médio de um card no board

### Milestone 17: OAuth
- [ ] Login com Google (substituir ou complementar login atual)
- [ ] Registrar app no Google Cloud Console
- [ ] Integrar fluxo OAuth no backend (.NET) e frontend (Angular)

---

## v4 — Infraestrutura Pesada e Colaboração

### Milestone 18: Anexos e Imagens
- [ ] Upload de imagens em comentários e cards
- [ ] Storage de arquivos (disco local ou Cloudflare R2)
- [ ] Servir arquivos via API com autenticação
- [ ] Thumbnail de imagem no card

### Milestone 19: Export
- [ ] Export do board para CSV
- [ ] Export do board para PDF (layout Kanban)
- [ ] Filtros aplicáveis antes do export

### Milestone 20: Colaboração Multi-usuário
- [ ] Múltiplos usuários por board (planejamento detalhado antes de iniciar)
- [ ] Permissões por usuário (editor, visualizador)
- [ ] Atribuição de cards a usuários
- [ ] Notificações entre usuários

---

## Deferred / Sem versão definida
- Aplicativo mobile (PWA ou React Native) — guardado para decisão futura
