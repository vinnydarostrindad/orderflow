# Endpoints (Padrao REST)

Este documento descreve o padrao de endpoints usado no projeto, com foco nos recursos principais.

## Principios

- Colecoes em plural (ex: /table-sessions, /menus)
- Recurso individual em /colecao/:id
- Acoes como sub-recursos (ex: /table-sessions/:id/close)
- Filtros via query string

## Base URL

- /api/v1

## Table sessions

- POST /api/v1/table-sessions

  - Body: { tableId, name? }
  - Abre uma sessao para uma mesa

- GET /api/v1/table-sessions/open

  - Lista todas as sessoes abertas do business

- GET /api/v1/table-sessions/:tableId

  - Retorna a sessao aberta da mesa (se existir)

- PATCH /api/v1/table-sessions/:tableSessionId/close
  - Fecha a sessao aberta

## Order items (por sessao)

- GET /api/v1/table-sessions/:tableSessionId/items

  - Lista itens da sessao

- POST /api/v1/table-sessions/:tableSessionId/items

  - Body: { menuItemId, quantity, unitPrice, totalPrice, notes? }
  - Cria item de pedido na sessao

- GET /api/v1/table-sessions/:tableSessionId/items/:orderItemId

  - Busca item especifico da sessao

- PATCH /api/v1/table-sessions/:tableSessionId/items/:orderItemId
  - Body: { status?, quantity? }
  - Atualiza item da sessao

## Payments

- POST /api/v1/table-sessions/:tableSessionId/payments

  - Body: { method, amount }
  - Cria um pagamento para a sessao

- GET /api/v1/table-sessions/:tableSessionId/payments

  - Lista os pagamentos da sessao

- GET /api/v1/table-sessions/:tableSessionId/payments/:paymentId

  - Retorna um pagamento especifico da sessao

- DELETE /api/v1/table-sessions/:tableSessionId/payments/:paymentId

  - Remove um pagamento e seus itens vinculados

- GET /api/v1/payments
  - Lista os pagamentos do business autenticado

## Payment items (itens pagos)

- POST /api/v1/table-sessions/:tableSessionId/payments/:paymentId/items

  - Body: { orderItemId, quantity, amount }
  - Vincula um item de pedido ao pagamento
  - Um item de pedido nao pode ser vinculado a mais de um pagamento

- GET /api/v1/table-sessions/:tableSessionId/payments/:paymentId/items

  - Lista os itens vinculados ao pagamento

- GET /api/v1/table-sessions/:tableSessionId/payments/:paymentId/items/:paymentItemId
  - Retorna um item de pagamento especifico

## Ordered items (relatorio por business)

- GET /api/v1/ordered-items
  - Query opcional: period=day|week|month
  - Retorna items com tableSessionId e tableNumber

## Tables (cadastro)

- GET /api/v1/tables
- POST /api/v1/tables
- GET /api/v1/tables/:tableId

## Menus e itens

- GET /api/v1/menus
- POST /api/v1/menus
- GET /api/v1/menus/:menuId
- GET /api/v1/menus/:menuId/items
- POST /api/v1/menus/:menuId/items
- GET /api/v1/menus/:menuId/items/:menuItemId
- GET /api/v1/menu-items/:menuItemId

## Auth

- POST /api/v1/sessions

## Businesses

- GET /api/v1/businesses
- POST /api/v1/businesses

## Employees

- GET /api/v1/employees
- POST /api/v1/employees
- GET /api/v1/employees/:employeeId
