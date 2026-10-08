#!/usr/bin/env bash
# Puts the fixture on GitHub, creating only what is missing: the public repo,
# its main, develop and gated branches, the rulesets in .github/rulesets
# (updated in place when they exist), and the spec issue in qa/spec-issue.md
# (its first line is the title) with qa/spec-comment.md as its first comment.
# Safe to re-run.
set -euo pipefail

repo="${1:-janrizmlibres/pstack-fixture}"
branches=(main develop gated)

for branch in "${branches[@]}"; do
  if ! git show-ref --quiet --verify "refs/heads/$branch"; then
    echo "publish: missing local branch $branch" >&2
    exit 1
  fi
done

if ! gh repo view "$repo" --json name > /dev/null 2>&1; then
  gh repo create "$repo" --public --description "Throwaway repo the pstack release and watch checks run in"
fi
git remote get-url origin > /dev/null 2>&1 || git remote add origin "https://github.com/$repo.git"

for branch in "${branches[@]}"; do
  if ! git ls-remote --exit-code --heads origin "$branch" > /dev/null; then
    git push --quiet origin "$branch"
  fi
done

existing=$(gh api "repos/$repo/rulesets" --jq '.[] | "\(.id)\t\(.name)"')
for file in .github/rulesets/*.json; do
  name=$(basename "$file" .json)
  id=$(printf '%s\n' "$existing" | awk -F '\t' -v name="$name" '$2 == name { print $1 }')
  if [[ -n "$id" ]]; then
    gh api --method PUT "repos/$repo/rulesets/$id" --input "$file" > /dev/null
  else
    gh api --method POST "repos/$repo/rulesets" --input "$file" > /dev/null
  fi
done

title=$(head -1 qa/spec-issue.md | sed 's/^# //')
filed=$(gh issue list --repo "$repo" --state all --search "in:title \"$title\"" --json title --jq '.[].title')
if ! grep -Fxq "$title" <<< "$filed"; then
  issue=$(tail -n +3 qa/spec-issue.md | gh issue create --repo "$repo" --title "$title" --body-file -)
  gh issue comment "$issue" --body-file - < qa/spec-comment.md > /dev/null
fi
