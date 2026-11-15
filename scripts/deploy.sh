#!/usr/bin/env bash
# Runs on the VPS: pull main and rebuild the app. Called by GitHub Actions through a forced SSH command
# (README "Auto deploy"), or by hand: ./scripts/deploy.sh. If the build fails, the running app is left untouched.
set -euo pipefail
# everything inside main(), so bash has read the whole script before git pull replaces this file
main() {
  cd "$(dirname "$0")/.."
  exec 9>/tmp/portfolio-deploy.lock
  flock -n 9 || { echo "another deploy is still running"; exit 1; }
  local before
  before=$(git rev-parse HEAD)
  git pull --ff-only
  docker compose up -d --build app
  docker image prune -f >/dev/null
  if ! git diff --quiet "$before" HEAD -- deploy/; then
    echo "NOTE: deploy/portfolio.caddy changed. Copy it to /opt/proxy/sites/, then:"
    echo "      cd /opt/proxy && docker compose exec caddy caddy reload --config /etc/caddy/Caddyfile"
  fi
  echo "deployed $(git log -1 --format='%h %s')"
}
main "$@"
