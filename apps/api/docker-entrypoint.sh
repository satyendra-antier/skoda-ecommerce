#!/bin/sh
# Seed DB if we have ts-node and src (idempotent; skips if products exist). Do not exit on failure.
if [ -f src/seed.ts ]; then
  npx ts-node -r tsconfig-paths/register src/seed.ts 2>/dev/null || true
fi
exec "$@"
