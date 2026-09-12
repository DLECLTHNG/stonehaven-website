#!/bin/bash
# QA gate for Family Opportunity draft posts. Run from site root.
cd "$(dirname "$0")/../.." || exit 1
D=docs/family-drafts; shopt -s nullglob; fail=0
POSTS=(); for f in "$D"/*.md; do [ "$(basename "$f")" = "00-EDITORIAL-MAP.md" ] || POSTS+=("$f"); done
echo "=== 1. EM DASHES ==="; if grep -n '—' "$D"/*.md; then echo FAIL; fail=1; else echo "OK: none"; fi
echo; echo "=== 2. BANNED PHRASES ==="
if grep -niE 'ever-changing landscape|unlock|delve|game.changer|navigate the complexit|secret program|loophole' "$D"/*.md; then echo FAIL; fail=1; else echo "OK: none"; fi
echo; echo "=== 3. REG Z TRIGGER TERMS in article bodies (no rates, payments, down payment amounts) ==="
out=""; for f in "${POSTS[@]}"; do b=$(sed '/## EDITOR NOTES/,$d' "$f" | grep -nE '[0-9]+(\.[0-9]+)? ?%|APR|\$[0-9]'); [ -n "$b" ] && out="$out$(basename $f): $b
"; done
if [ -n "$out" ]; then printf "%b" "$out"; fail=1; else echo "OK: none in any body"; fi
echo; echo "=== 4. THE DISJUNCTIVE MUST SURVIVE (no 'cannot work and') ==="
if grep -niE 'cannot work and|unable to work and (lacks|does not)|both unable to work' "$D"/*.md; then echo FAIL; fail=1; else echo "OK"; fi
echo; echo "=== 5. FORBIDDEN FRAMING in article bodies ==="
out=""; for f in "${POSTS[@]}"; do b=$(sed '/## EDITOR NOTES/,$d' "$f" | grep -niE 'burden|government (grant|benefit) program|guarantees (independent living|approval)|substitute for care'); [ -n "$b" ] && out="$out$(basename $f): $b
"; done
if [ -n "$out" ]; then printf "%b" "$out"; fail=1; else echo "OK: none in any body"; fi
echo; echo "=== 6. INQUIRY MUST NOT BE CALLED APPROVAL/APPLICATION ==="
if grep -niE '(inquiry|form|contact us) (is|as) an? (approval|prequalification|application)|get prequalified now|apply now' "$D"/*.md; then echo FAIL; fail=1; else echo "OK"; fi
echo; echo "=== 7. REQUIRED ELEMENTS PER POST ==="
for f in "${POSTS[@]}"; do n=$(basename "$f"); miss=""
  grep -q '^# ' "$f" || miss="$miss H1"
  if sed '/## EDITOR NOTES/,$d' "$f" | grep -qiE 'imagine|situation one|for example, a|illustration'; then
    sed '/## EDITOR NOTES/,$d' "$f" | grep -qi 'hypothetical\|illustration only\|not customers' || miss="$miss unlabeled-example"
  fi
  grep -qiE '^## (FAQ|Questions)' "$f" || miss="$miss FAQ"
  grep -q 'selling-guide.fanniemae.com\|guide.freddiemac.com\|ssa.gov' "$f" || miss="$miss primary-source-link"
  grep -qi 'not a direct lender' "$f" || miss="$miss disclosure"
  grep -qi 'EDITOR' "$f" || miss="$miss editor-notes"
  [ -n "$miss" ] && { echo "  FAIL $n:$miss"; fail=1; } || echo "  OK   $n"
done
echo; echo "=== 8. WORD COUNTS ==="
for f in "${POSTS[@]}"; do w=$(sed '/## EDITOR/,$d' "$f" | awk '/^---$/{n++} n>=2' | wc -w); printf "  %-44s %s\n" "$(basename "$f")" "$w"; done
echo; [ $fail -eq 0 ] && echo "GATE: PASS" || echo "GATE: REVIEW NEEDED"
