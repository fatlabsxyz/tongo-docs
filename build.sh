#!/usr/bin/env bash
# Build the Tongo docs: v2 (canonical) at the site root, v1 (legacy) under /v1/.
set -euo pipefail

MDBOOK="${MDBOOK:-mdbook}"
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "==> Building v2 (canonical) -> book/"
"$MDBOOK" build "$ROOT"

echo "==> Building v1 (legacy)    -> book/v1/"
"$MDBOOK" build "$ROOT/v1" --dest-dir "$ROOT/book/v1"

echo "==> Done. Output in $ROOT/book (v1 under book/v1)."
