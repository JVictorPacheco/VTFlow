# State — Todo Board

## Decisions

- **[2026-05-02]** Stack definida: .NET 9 + Angular + SQLite + JWT + TailwindCSS
- **[2026-05-02]** Sem integração com IA — foco em CRUD sólido; IA removida do roadmap
- **[2026-05-02]** Colunas têm padrão fixo (A Fazer, Em Andamento, Concluído) + criação customizada
- **[2026-05-02]** Etiquetas são globais e reutilizáveis entre cards
- **[2026-05-02]** Autenticação: login/senha simples com JWT — sistema de usuário único (pessoal)
- **[2026-05-02]** Tema: dark/light mode com toggle via TailwindCSS
- **[2026-05-05]** Modal de detalhe do card estilo Trello: layout duas colunas (subtarefas esq, comentários dir)
- **[2026-05-05]** Comentários carregados com lazy load na primeira abertura do modal
- **[2026-05-05]** Coluna com cards não pode ser excluída (409 com mensagem, botão Excluir oculto)
- **[2026-05-05]** `confirm()` nativo substituído por modal customizado em todas as telas
- **[2026-05-05]** OAuth (Google) vai para v3 (M17); colaboração multi-usuário vai para v4 (M20); mobile sem versão definida
- **[2026-05-11]** Boards introduzidos: cada board tem suas próprias colunas; etiquetas permanecem globais
- **[2026-05-11]** Seed de colunas padrão movido do `ColumnSeeder` global para o `POST /boards` — `ColumnSeeder.cs` removido
- **[2026-05-11]** `GET /columns` passa a exigir `?boardId=` obrigatório; sem o parâmetro retorna `400`
- **[2026-05-11]** Validação de nome duplicado de coluna é por board (não global)
- **[2026-05-11]** Migration `AddBoardEntity` preservou dados existentes: board padrão "Meu Board" criado e colunas existentes migradas automaticamente via SQL
- **[2026-05-11]** `ColumnsController` adota `ColumnResponse` DTO para não expor navigation property `Board` na resposta

## Blockers

_(nenhum no momento)_

## Todos

- Iniciar Milestone 14: Arquivar Cards

## Lessons Learned

- **Migration com FK em SQLite:** EF Core gera `AddColumn` antes de `CreateTable` quando há FK — a migration precisa ser reordenada manualmente: criar tabela → inserir dados → adicionar coluna → atualizar dados via `Sql()` → adicionar FK.
- **Navigation property vazando na resposta:** adicionar `BoardId` ao `Column` expôs `"board": null` na API. Solução: adotar `ColumnResponse` DTO em todos os retornos do `ColumnsController`, padrão já usado em `CardsController`.

- **Subtarefas visíveis só com cards existentes:** `@if (card.subtasks.length > 0)` criou chicken-and-egg — seção nunca aparecia para adicionar a primeira. Solução: sempre renderizar a seção de subtarefas.
- **Order de card ao mover coluna:** mover card para outra coluna mantinha o `order` antigo, causando posicionamento errado. Corrigido no backend: `PATCH /cards/{id}/column` atribui `order = max + 1` na coluna destino.
- **Race condition com signal em `onSaved`:** usar `signal` para guardar flag de "veio do detalhe" causava reset prematuro dentro de `closeForm`. Resolvido com flag booleana simples (`editingFromDetail: boolean`) capturada antes de qualquer outra chamada.
- **API de update não retorna `comments`:** `PUT /cards/{id}` devolve o card sem comentários. `onSaved` agora faz merge, preservando `comments` e `subtasks` já em memória para não quebrar o modal de detalhe ao reabrir.
- **Modal de confirmação mostrando confirmation + erro ao mesmo tempo:** na exclusão de coluna com 409, o template mostrava ambos. Corrigido com `@if (deleteError()) { erro } @else { confirmação }` — mutuamente exclusivos.

## Deferred Ideas

- Aplicativo mobile (PWA ou React Native) — sem versão definida
