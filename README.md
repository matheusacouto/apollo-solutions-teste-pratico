# Apollo Solutions - Teste Pratico

Aplicacao fullstack com FastAPI no backend, React + Vite no frontend e Postgres como banco de dados. O projeto inclui dashboard com charts de vendas, CRUD de produtos e categorias, upload/download de CSV e edicao mensal das vendas.

## Stack

- Backend: FastAPI + SQLAlchemy + Alembic
- Frontend: React + Vite
- Banco: PostgreSQL 16
- Orquestracao: Docker Compose
- UI: Tailwind CSS + shadcn/ui

## Estrutura

- `backend/`: API FastAPI, modelos e servicos
- `frontend/`: app React
- `Docs/`: arquivos CSV e o enunciado do desafio
- `docker-compose.yaml`: ambiente dev (hot reload)
- `docker-compose.prod.yaml`: build de producao

## Como rodar (Docker - recomendado)

### Desenvolvimento

```bash
docker compose up --build
```

O container do backend cria automaticamente o `.venv` em `backend/.venv` na primeira execucao.
As migrations rodam automaticamente no startup (pode desativar com `RUN_MIGRATIONS=0`).

Servicos:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Swagger: http://localhost:8000/docs
- Postgres: localhost:5432 (user: app, pass: app, db: app_db)

### Producao

```bash
docker compose -f docker-compose.yaml -f docker-compose.prod.yaml up --build
```

Servicos:
- Frontend (build): http://localhost:8080
- Backend: http://localhost:8000

## Endpoints principais

- `GET /categories` (lista categorias)
- `POST /categories` (criar categoria)
- `PUT /categories/{category_id}` (editar categoria)
- `POST /categories/upload` (importar categorias via CSV)
- `GET /products` (lista produtos)
- `POST /products` (criar produto)
- `PUT /products/{product_id}` (editar produto)
- `DELETE /products/{product_id}` (remover produto)
- `POST /products/upload` (importar produtos via CSV)
- `GET /products/csv` (exportar produtos em CSV)
- `GET /sales/summary?year=YYYY` (resumo mensal de vendas e variacao)
- `GET /sales/years` (anos disponiveis)
- `PUT /sales/override/{year}/{month}` (editar dados mensais)
- `POST /sales/upload` (importar vendas via CSV)
- `GET /sales/csv?year=YYYY` (exportar vendas em CSV)

## Rodar localmente (sem Docker)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Observação: o `DATABASE_URL` esta fixo em `backend/db.py` e aponta para o host `db`. Para rodar localmente sem Docker, ajuste para o seu Postgres local.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Observacao: se precisar apontar para outro backend, defina `VITE_API_URL` no ambiente.

## Dados de apoio

Os arquivos CSV do enunciado estao em `Docs/`:
- `categories.csv`
- `products.csv`
- `sales.csv`

## Funcionalidades

- Dashboard com dois charts (quantidade vendida e variacao de faturamento).
- Filtro de produtos por nome, categoria e ordem de preco.
- Paginacao da lista de produtos.
- Modal para cadastro/edicao de produtos e categorias.
- Upload de CSV com validacao all-or-nothing.
- Download de CSV de produtos e vendas.

## Como testar

### Fluxo rapido (Docker)

```bash
docker compose up --build
```

1. Acesse http://localhost:5173
2. No painel, use o Upload CSV de vendas com `Docs/sales.csv`.
3. Em Produtos, use o Upload CSV com `Docs/products.csv`.
4. Em Categorias, use o Upload CSV com `Docs/categories.csv`.
5. Verifique os charts e a lista de produtos.

### Endpoints com curl (opcional)

```bash
curl http://localhost:8000/categories/
curl http://localhost:8000/products/
curl "http://localhost:8000/sales/summary?year=2025"
```
