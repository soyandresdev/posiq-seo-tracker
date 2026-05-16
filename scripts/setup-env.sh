#!/usr/bin/env bash
# Creates the root .env for docker compose and generates JWT_SECRET.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ -f .env ]; then
    echo ".env already exists, leaving it untouched."
else
    cp .env.example .env
    echo "Created .env from .env.example"
fi

if ! grep -qE '^JWT_SECRET=.{32,}' .env; then
    secret="$(openssl rand -hex 48)"
    # Portable in-place edit (macOS and Linux)
    tmp="$(mktemp)"
    sed "s|^JWT_SECRET=.*|JWT_SECRET=${secret}|" .env > "$tmp" && mv "$tmp" .env
    echo "Generated JWT_SECRET"
fi

missing=()
for key in BROWSERBASE_API_KEY GEMINI_API_KEY; do
    grep -qE "^${key}=.+" .env || missing+=("$key")
done

if [ ${#missing[@]} -gt 0 ]; then
    echo
    echo "Fill these in .env before running docker compose up:"
    for k in "${missing[@]}"; do echo "  - $k"; done
else
    echo "All set. Run: docker compose up --build"
fi
