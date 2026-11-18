#!/bin/sh
# Fails if any page, stylesheet, script or sitemap still points at Squarespace.
# Run from the repo root: sh tools/check-no-squarespace.sh
cd "$(dirname "$0")/.." || exit 1
hits=$(grep -rniE "squarespace|sqspcdn|sqsp\.|static1\.squarespace" --include='*.html' --include='*.css' --include='*.js' --include='*.xml' --include='*.json' --include='*.txt' --include='*.svg' . 2>/dev/null | grep -v '^./tools/')
if [ -n "$hits" ]; then
  echo "$hits"
  echo "FAIL: $(echo "$hits" | wc -l | tr -d ' ') lines still point at Squarespace."
  exit 1
fi
echo "OK: no Squarespace URLs left."
