#!/usr/bin/env bash
#
# TnC Pharmacy frontend — server-side deploy step.
#
# CI builds the app (standalone output) and rsyncs the result into
# /srv/tncpharmacy/<env>/app. Nothing is built here, so this box never needs
# build-sized memory. This script only restarts the service and verifies it.
#
#     ./deploy.sh dev
#     ./deploy.sh prod

set -euo pipefail

ENV_NAME="${1:-}"
if [[ "$ENV_NAME" != "dev" && "$ENV_NAME" != "prod" ]]; then
    echo "usage: $0 {dev|prod}" >&2
    exit 2
fi

APP_DIR="/srv/tncpharmacy/${ENV_NAME}/app"
SERVICE="tnc-app@${ENV_NAME}"

log() { printf '\n\033[1;32m==>\033[0m %s\n' "$*"; }

cd "$APP_DIR"

# The standalone build must have produced a server entrypoint. If it is
# missing, the rsync went wrong and restarting would only take the site down.
if [[ ! -f "server.js" ]]; then
    echo "ERROR: server.js not found in ${APP_DIR}." >&2
    echo "The build artifact did not arrive correctly — not restarting." >&2
    exit 1
fi

log "Restarting ${SERVICE}"
sudo systemctl restart "$SERVICE"

sleep 4
if ! systemctl is-active --quiet "$SERVICE"; then
    echo "ERROR: ${SERVICE} failed to start. Recent logs:" >&2
    journalctl -u "$SERVICE" -n 40 --no-pager >&2
    exit 1
fi

# Confirm it is actually serving, not merely running.
PORT="$(grep -E '^PORT=' "/etc/tncpharmacy/app.${ENV_NAME}.env" | cut -d= -f2)"
if ! curl -fsS --max-time 10 "http://127.0.0.1:${PORT}/" -o /dev/null; then
    echo "ERROR: ${SERVICE} is running but not responding on port ${PORT}." >&2
    journalctl -u "$SERVICE" -n 40 --no-pager >&2
    exit 1
fi

log "Deployed. ${SERVICE} is serving on port ${PORT}."
