# Apollo Solutions - Teste Pratico

Aplicacao fullstack com FastAPI no backend, React + Vite no frontend e Postgres como banco de dados. O projeto inclui endpoints para categorias e produtos, alem de arquivos CSV de apoio em `Docs/`.

## Stack

- Backend: FastAPI + SQLAlchemy + Alembic
- Frontend: React + Vite
- Banco: PostgreSQL 16
- Orquestracao: Docker Compose

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

- `GET /categories`
- `POST /categories`
- `PUT /categories/{category_id}`
- `GET /products`
- `POST /products`
- `PUT /products/{product_id}`

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

## Dados de apoio

Os arquivos CSV do enunciado estao em `Docs/`:
- `categories.csv`
- `products.csv`
- `sales.csv`
