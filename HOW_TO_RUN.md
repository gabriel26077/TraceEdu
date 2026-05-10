# How to Run TraceEdu

This guide explains how to run the application in different scenarios, depending on your needs (rapid development, Docker testing, or production environment simulation).

---

## 1. Locally (On Host, without Docker)
Ideal for when you don't want to use Docker and want to run everything directly on your machine.

### Backend Only
1. Certifique-se de ter um banco PostgreSQL rodando ou use o do Docker: `docker compose up -d db`.
2. Configure a variável de ambiente `DATABASE_URL`.
```bash
cd backend
poetry install
export DATABASE_URL=postgresql://traceedu_user:traceedu_pass@localhost:5432/traceedu_db
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
The API will be running at: `http://localhost:8000`

### Frontend Only
```bash
cd frontend
pnpm install
pnpm dev
```
The web application will be running at: `http://localhost:3000`

---

## 2. Locally via Docker (Development Mode)
Ideal for daily work. It automatically uses `docker-compose.override.yml` to **mount your local files** inside the container. **Supports Hot-Reload** (you edit the code and the container updates itself).

> [!TIP]
> Docker Compose reads the `docker-compose.override.yml` file by default, ensuring that the `ENV=development` variable is activated and volumes are mounted.

### Backend Only
```bash
docker compose up --build backend
```

### Frontend Only
```bash
docker compose up --build frontend
```

### Both at the same time
```bash
docker compose up --build
```
*(To run in the background, add the `-d` flag at the end of the commands).*

> [!NOTE]
> No primeiro boot, o backend irá criar as tabelas e popular o banco com dados de teste (Seed) automaticamente.

---

## 3. Locally via Docker (Production Mode)
Ideal for testing **exactly** what goes to the production server. **No Hot-Reload**. The code is "frozen" inside the image at build time.

> [!IMPORTANT]
> To simulate production locally, we need to force Docker to **ignore** the override file. We do this by explicitly passing the `-f docker-compose.yml` flag.

### Backend Only
```bash
docker compose -f docker-compose.yml up --build backend
```

### Frontend Only
```bash
docker compose -f docker-compose.yml up --build frontend
```

### Both at the same time
```bash
docker compose -f docker-compose.yml up --build
```

## 4. Banco de Dados e Migrações (Alembic)
O projeto utiliza **Alembic** para versionamento do banco de dados PostgreSQL.

* **Automação:** Ao subir o Docker, o backend roda automaticamente o `alembic upgrade head`.
* **Criar nova migração:** (Sempre que alterar um modelo em `app/infrastructure/database/models.py`)
  ```bash
  cd backend
  poetry run alembic revision --autogenerate -m "descrição da mudança"
  ```
* **Aplicar migrações manualmente:**
  ```bash
  cd backend
  poetry run alembic upgrade head
  ```

---

## Useful Tips

* **Stop containers:** Press `Ctrl+C` in the terminal where they are running, or run `docker compose down` in another tab.
* **Delete everything and start from scratch:** `docker compose down -v` (the `-v` also removes volumes, useful if the database locks up in the future).
* **View logs of a specific container:** `docker compose logs -f service_name` (e.g., `docker compose logs -f frontend`).
