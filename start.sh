#!/usr/bin/env bash
# Run the whole project at once (API, MinIO, storefront, admin). From skoda folder.
set -e
cd "$(dirname "$0")"
echo "Starting full stack (API, MinIO, storefront, admin)..."
docker compose up --build -d
echo "Waiting for API at http://localhost:4000/health ..."
for i in {1..30}; do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/health 2>/dev/null | grep -q 200; then
    echo "API is ready."
    echo ""
    echo "Storefront:  http://localhost:8080"
    echo "Admin panel: http://localhost:8081 (login: admin / admin)"
    echo "API:         http://localhost:4000"
    echo "MinIO:       http://localhost:9001"
    exit 0
  fi
  sleep 2
done
echo "API did not respond in time. Check: docker compose logs api"
exit 1
