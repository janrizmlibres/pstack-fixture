#!/usr/bin/env bash
# Deletes the qa/* and claude/* branches that release and watch checks leave
# behind, on origin and locally. Cloud sessions cannot delete branches, so this
# runs from a local clone after a round of checks.
set -euo pipefail

usage="usage: scripts/reset.sh [--dry-run]"
dry_run=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) dry_run=true ;;
    *) echo "$usage" >&2; exit 2 ;;
  esac
done

is_check_branch() {
  [[ "$1" == qa/* || "$1" == claude/* ]]
}

current=$(git branch --show-current)
if is_check_branch "$current"; then
  echo "reset: you are on $current, which this deletes: switch off $current first" >&2
  exit 1
fi

git fetch --quiet --prune origin

remote_branches=()
while read -r branch; do
  is_check_branch "$branch" && remote_branches+=("$branch")
done < <(git ls-remote --heads origin | sed 's|.*refs/heads/||')

local_branches=()
while read -r branch; do
  is_check_branch "$branch" && local_branches+=("$branch")
done < <(git for-each-ref --format='%(refname:short)' refs/heads)

if [[ ${#remote_branches[@]} -eq 0 && ${#local_branches[@]} -eq 0 ]]; then
  echo "reset: nothing to delete"
  exit 0
fi

for branch in ${remote_branches[@]+"${remote_branches[@]}"}; do echo "origin/$branch"; done
for branch in ${local_branches[@]+"${local_branches[@]}"}; do echo "local $branch"; done

if $dry_run; then
  echo "reset: dry run, nothing deleted"
  exit 0
fi

if [[ ${#remote_branches[@]} -gt 0 ]]; then
  git push --quiet origin --delete "${remote_branches[@]}"
fi
if [[ ${#local_branches[@]} -gt 0 ]]; then
  git branch --quiet -D "${local_branches[@]}"
fi
echo "reset: deleted ${#remote_branches[@]} branches on origin and ${#local_branches[@]} locally"
