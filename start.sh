#!/bin/bash
# ── start.sh — Sobe backend + frontend + dois túneis Cloudflare ─────────────
set -e

# ── Configuração ─────────────────────────────────────────────────────────────
BACKEND_DIR="C:/Users/power/OneDrive/Documentos/PROJETOS_/Trabalhos/FlyingStudio/PESQUISADOR"
FRONTEND_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_PORT=8000
FRONTEND_PORT=3000
ENV_FILE="${FRONTEND_DIR}/.env.local"

CF_BACKEND_LOG="/tmp/cf_backend.log"
CF_FRONTEND_LOG="/tmp/cf_frontend.log"

# ── Cleanup ao Ctrl+C ─────────────────────────────────────────────────────────
cleanup() {
  echo ""
  echo "→ Encerrando tudo..."
  [[ -n "$CF_BACKEND_PID" ]]  && kill "$CF_BACKEND_PID"  2>/dev/null || true
  [[ -n "$CF_FRONTEND_PID" ]] && kill "$CF_FRONTEND_PID" 2>/dev/null || true
  docker compose -f "${FRONTEND_DIR}/docker-compose.yml" down 2>/dev/null || true
  docker compose -f "${BACKEND_DIR}/docker-compose.yml"  down 2>/dev/null || true
  rm -f "$CF_BACKEND_LOG" "$CF_FRONTEND_LOG"
  echo "✓ Encerrado."
}
trap cleanup EXIT INT TERM

# ── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  FlyingStudio Tools — Start Script"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── [1/6] Subir backend ───────────────────────────────────────────────────────
echo "→ [1/6] Subindo backend (FastAPI)..."
docker compose -f "${BACKEND_DIR}/docker-compose.yml" up -d --build
echo "   Aguardando backend ficar saudável..."
until curl -sf "http://localhost:${BACKEND_PORT}/health" > /dev/null 2>&1; do
  printf "."
  sleep 2
done
echo ""
echo "   ✓ Backend pronto em http://localhost:${BACKEND_PORT}"

# ── [2/6] Túnel do backend ────────────────────────────────────────────────────
echo ""
echo "→ [2/6] Criando túnel Cloudflare para o backend..."
rm -f "$CF_BACKEND_LOG"
cloudflared tunnel --url "http://localhost:${BACKEND_PORT}" > "$CF_BACKEND_LOG" 2>&1 &
CF_BACKEND_PID=$!

BACKEND_URL=""
for i in $(seq 1 40); do
  BACKEND_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$CF_BACKEND_LOG" 2>/dev/null | head -1)
  [[ -n "$BACKEND_URL" ]] && break
  sleep 1
done

if [[ -z "$BACKEND_URL" ]]; then
  echo "✗ Não foi possível capturar a URL do backend. Verifique o cloudflared."
  exit 1
fi
echo "   ✓ Backend público: $BACKEND_URL"

# ── [3/6] Atualizar .env.local com URL do backend ────────────────────────────
echo ""
echo "→ [3/6] Atualizando .env.local..."
sed -i "s|NEXT_PUBLIC_PESQUISADOR_URL=.*|NEXT_PUBLIC_PESQUISADOR_URL=${BACKEND_URL}|" "$ENV_FILE"
echo "   ✓ NEXT_PUBLIC_PESQUISADOR_URL=${BACKEND_URL}"

# ── [4/6] Build + subir frontend ─────────────────────────────────────────────
echo ""
echo "→ [4/6] Buildando frontend (pode levar ~2 min)..."
docker compose --env-file "$ENV_FILE" -f "${FRONTEND_DIR}/docker-compose.yml" up --build -d
echo "   ✓ Frontend pronto em http://localhost:${FRONTEND_PORT}"

# ── [5/6] Túnel do frontend ───────────────────────────────────────────────────
echo ""
echo "→ [5/6] Criando túnel Cloudflare para o frontend..."
rm -f "$CF_FRONTEND_LOG"
cloudflared tunnel --url "http://localhost:${FRONTEND_PORT}" > "$CF_FRONTEND_LOG" 2>&1 &
CF_FRONTEND_PID=$!

FRONTEND_URL=""
for i in $(seq 1 40); do
  FRONTEND_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$CF_FRONTEND_LOG" 2>/dev/null | head -1)
  [[ -n "$FRONTEND_URL" ]] && break
  sleep 1
done

if [[ -z "$FRONTEND_URL" ]]; then
  echo "✗ Não foi possível capturar a URL do frontend."
  exit 1
fi

# ── [6/6] Resultado ───────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✓ TUDO PRONTO — compartilhe o link abaixo:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  🌐 Frontend : $FRONTEND_URL"
echo "  ⚙️  Backend  : $BACKEND_URL"
echo ""
echo "  Pressione Ctrl+C para encerrar tudo."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Mantém o script vivo enquanto os túneis rodam
wait $CF_BACKEND_PID $CF_FRONTEND_PID
