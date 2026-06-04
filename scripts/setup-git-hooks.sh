#!/usr/bin/env sh
set -eu

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

chmod +x .githooks/pre-commit .githooks/pre-push scripts/setup-git-hooks.sh
git config core.hooksPath .githooks

echo "Git hooks enabled: core.hooksPath=.githooks"
