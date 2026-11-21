# Projeto - FullStack — Aplicação de Controle de Estoque

Aplicação fullstack modular desenvolvida em **TypeScript** com **React + Tailwind CSS** no frontend e **Node.js + Express + Prisma + SQLite** no backend.

## Estrutura Modular

- `backend/src/modules/`
  - `suppliers/` — Cadastro, listagem, edição, exclusão e validação de fornecedores (CNPJ único)
  - `products/` — Cadastro, listagem, edição, exclusão, categoria customizável (`Outro`), upload de imagem e código de barras único
  - `associations/` — Associação/desassociação N:N entre fornecedores e produtos e métricas da visão geral
- `frontend/src/modules/`
  - `suppliers/` — Listagem e tela de Cadastro/Edição de Fornecedor com máscaras e validação por campo
  - `products/` — Listagem e tela de Cadastro/Edição de Produto com preview de imagem e categoria dinâmica
  - `associations/` — Visão Geral (Dashboard) e tela de Associação de Fornecedor a Produto

## Como executar localmente

### 1. Backend (porta `3333`)

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:push
npm run dev
```

### 2. Frontend (porta `5173`)

```bash
cd frontend
npm install
npm run dev
```

Acesse a aplicação em `http://localhost:5173`.
