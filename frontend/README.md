# Farmácia — Front-end

Painel de gestão em **React + TypeScript + Vite + Tailwind CSS** para a API Spring Boot da farmácia.

## Funcionalidades

- **Dashboard** — vendas de hoje/mês, ticket médio, contadores e alertas de estoque baixo / medicamentos vencendo.
- **Medicamentos** — CRUD completo, busca, filtros (estoque baixo, vencendo, vencidos), filtro por categoria e ajuste rápido de estoque.
- **Clientes** — CRUD completo com máscaras de CPF/telefone e busca.
- **Vendas** — histórico com detalhamento por item e cancelamento (estorna estoque).
- **PDV (Nova venda)** — busca de produtos, carrinho, cliente, desconto, forma de pagamento e finalização.

## Pré-requisitos

- Node.js 18+ (testado no Node 22)
- A API rodando em `http://localhost:8081` (porta definida em `farmacia/src/main/resources/application.properties`)

## Como rodar

```bash
cd frontend
npm install
npm run dev
```

Acesse http://localhost:5173

## Configuração da API

A URL base fica em [.env](.env):

```
VITE_API_URL=http://localhost:8081/api
```

O backend já expõe `@CrossOrigin(origins = "*")` em todos os controllers, então o CORS funciona em desenvolvimento sem configuração extra.

## Scripts

| Comando            | Descrição                                  |
| ------------------ | ------------------------------------------ |
| `npm run dev`      | Servidor de desenvolvimento (porta 5173)   |
| `npm run build`    | Type-check + build de produção em `dist/`  |
| `npm run preview`  | Servir o build de produção localmente      |
| `npm run typecheck`| Apenas verificação de tipos                |

## Estrutura

```
src/
  api/          # Cliente axios + funções por recurso (medicamentos, clientes, vendas, financeiro)
  components/   # Layout, PageHeader e UI reutilizável (Button, Modal, Toast, etc.)
  lib/          # Formatação (moeda, data, CPF) e helpers de estoque/validade
  pages/        # Dashboard, Medicamentos, Clientes, Vendas, NovaVenda
  types.ts      # Tipos espelhando as entidades da API
```
