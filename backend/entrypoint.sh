#!/bin/sh
set -e

if [ "$ENV" = "development" ]; then
  echo ">> Backend running in DEVELOPMENT mode (with hot-reload)"
  # Rodar migrações automaticamente
  alembic upgrade head
  exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
else
  echo ">> Backend running in PRODUCTION mode"
  # Em produção também é importante garantir que o banco está atualizado
  alembic upgrade head
  exec uvicorn main:app --host 0.0.0.0 --port 8000
fi
