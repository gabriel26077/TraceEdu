#!/bin/sh
set -e

if [ "$ENV" = "development" ]; then
  echo ">> Frontend running in DEVELOPMENT mode (with hot-reload)"
  exec pnpm dev
else
  echo ">> Frontend running in PRODUCTION mode"
  exec pnpm start
fi
