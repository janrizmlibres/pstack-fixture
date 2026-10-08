#!/usr/bin/env bash
# Prints every QA report on origin: one row per qa/* or claude/* branch whose
# tip commit carries a QA-Check trailer, as check, result, branch and session,
# tab-separated and sorted by check. A field the report left out prints as "?".
set -euo pipefail

git fetch --quiet --prune origin

trailer() {
  local value
  value=$(git log -1 --format="%(trailers:key=$1,valueonly,separator=%x20)" "$2")
  echo "${value:-?}"
}

rows=$(
  git for-each-ref --format='%(refname:lstrip=3)' refs/remotes/origin/qa refs/remotes/origin/claude |
    while read -r branch; do
      ref="refs/remotes/origin/$branch"
      check=$(trailer QA-Check "$ref")
      [[ "$check" == "?" ]] && continue
      printf '%s\t%s\t%s\t%s\n' "$check" "$(trailer QA-Result "$ref")" "$branch" "$(trailer Claude-Session "$ref")"
    done | sort
)

if [[ -z "$rows" ]]; then
  echo "qa-results: no reports on origin" >&2
  exit 0
fi
echo "$rows"
