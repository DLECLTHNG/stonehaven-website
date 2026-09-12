#!/bin/bash
# QA gate for DSCR draft articles. Run from site root.
cd "$(dirname "$0")/../.." || exit 1
D=docs/blog-drafts
shopt -s nullglob
fail=0
ARTS=()
for f in "$D"/*.md; do [ "$(basename "$f")" = "00-CONTENT-MAP.md" ] || ARTS+=("$f"); done
echo "=== 1. EM DASHES (must be none) ==="
if grep -n '—' $D/*.md; then echo "FAIL: em dashes found"; fail=1; else echo "OK: none"; fi
echo
echo "=== 2. BANNED PROMISE LANGUAGE ==="
if grep -niE 'guaranteed|lowest rate|everyone qualifies|approved in [0-9]+ days|no doc(umentation)? (loan|required)' $D/*.md; then echo "FAIL"; fail=1; else echo "OK: none"; fi
echo
echo "=== 3. DIRECT-LENDER CLAIMS ==="
if grep -niE 'we lend|our loan program|Stonehaven lends|we fund' $D/*.md; then echo "FAIL"; fail=1; else echo "OK: none"; fi
echo
echo "=== 4. INTERNAL LINKS RESOLVE TO REAL FILES ==="
grep -ohE '\]\(/[a-z0-9/-]+\)' $D/*.md | tr -d '](){}' | sort -u | while read -r p; do
  f=".${p}.html"; alt=".${p}/index.html"
  if [ -f "$f" ] || [ -f "$alt" ] || [ -f ".${p}" ]; then
    printf "  OK   %s\n" "$p"
  elif grep -q "slug: ${p#/blog/}$" $D/*.md 2>/dev/null; then
    printf "  DRAFT %s (sibling draft, not yet published)\n" "$p"
  else
    printf "  MISS %s\n" "$p"
  fi
done
echo
echo "=== 5. EVERY ARTICLE HAS REQUIRED SECTIONS ==="
for f in "${ARTS[@]}"; do
  n=$(basename "$f"); miss=""
  grep -q '^# ' "$f" || miss="$miss H1"
  grep -qi 'Short answer' "$f" || miss="$miss direct-answer"
  grep -qi 'hypothetical' "$f" || miss="$miss hypothetical-label"
  grep -qi '^## FAQ' "$f" || miss="$miss FAQ"
  grep -qi 'Mistakes to watch for' "$f" || miss="$miss mistakes"
  grep -q 'dscr-program-calculator\|dscr-analyzer' "$f" || miss="$miss calculator-link"
  grep -q 'dscr-review' "$f" || miss="$miss deal-submission"
  grep -qi 'not a direct lender' "$f" || miss="$miss disclaimer"
  grep -qi 'EDITOR NOTES' "$f" || miss="$miss editor-notes"
  if [ -n "$miss" ]; then echo "  FAIL $n:$miss"; fail=1; else echo "  OK   $n"; fi
done
echo
echo "=== 6. WORD COUNTS (body, excluding front matter and editor notes) ==="
for f in "${ARTS[@]}"; do
  w=$(awk '/^---$/{n++} n>=2 && !/EDITOR NOTES/{print}' "$f" | sed '/## EDITOR NOTES/,$d' | wc -w)
  printf "  %-46s %s words\n" "$(basename "$f")" "$w"
done
echo
echo "=== 7. UNIQUE PRIMARY QUERIES (duplicate intent check) ==="
grep -h '^primary_query:' $D/*.md | sort | uniq -c | sort -rn
echo
[ $fail -eq 0 ] && echo "GATE: PASS" || echo "GATE: FAIL"
