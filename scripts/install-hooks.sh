#!/bin/sh
# Installs the repo's git hooks (git doesn't version .git/hooks). Safe to re-run.
set -e
ROOT=$(git rev-parse --show-toplevel)
for h in post-merge post-rewrite; do
  install -m 755 "$ROOT/scripts/hooks/$h" "$ROOT/.git/hooks/$h"
done
echo "installed: post-merge, post-rewrite -> upstream check runs after git pull"
