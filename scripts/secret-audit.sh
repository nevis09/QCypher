#!/usr/bin/env bash
# ============================================================
# QCypher CRM — Secret & Client-Bundle Exposure Audit
#
# Checks:
#   1. No server-only secret env vars referenced in 'use client' files
#   2. No hardcoded secret values (key-like strings) in any source file
#   3. No .env.local committed to git history
#   4. service_role key only used in server-side paths
#   5. NEXT_PUBLIC_ vars only contain intentionally public values
#
# Run before every deploy: bash scripts/secret-audit.sh
# Exits non-zero if any check fails.
# ============================================================

set -euo pipefail
PASS=0; FAIL=0
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/apps/web/src"

ok()   { echo "  ✓ $*"; PASS=$((PASS+1)); }
fail() { echo "  ✗ $*" >&2; FAIL=$((FAIL+1)); }

echo ""
echo "=== 1. Server-only secrets in client components ==="
SERVER_SECRETS="SUPABASE_SERVICE_ROLE_KEY|RESEND_API_KEY|TWILIO_AUTH_TOKEN|TWILIO_ACCOUNT_SID|TWILIO_FROM_NUMBER"
CLIENT_FILES=$(grep -rl "'use client'" "$SRC" --include="*.ts" --include="*.tsx" 2>/dev/null || true)
if [ -n "$CLIENT_FILES" ]; then
  HITS=$(echo "$CLIENT_FILES" | xargs grep -l -E "$SERVER_SECRETS" 2>/dev/null || true)
  if [ -n "$HITS" ]; then
    fail "Server secrets referenced in client components:"
    echo "$HITS" | while read -r f; do echo "    $f"; done
  else
    ok "No server secrets in client components"
  fi
else
  ok "No client components found (or grep failed gracefully)"
fi

echo ""
echo "=== 2. No hardcoded secret-looking values ==="
# Patterns: Resend keys (re_), Twilio SIDs (AC+32 hex), JWT-like strings
BAD=$(grep -rn \
  -E "(re_[a-zA-Z0-9]{20,}|AC[a-f0-9]{32}|eyJ[A-Za-z0-9_-]{40,}\.[A-Za-z0-9_-]+)" \
  "$SRC" --include="*.ts" --include="*.tsx" \
  | grep -v "test\|spec\|mock\|example\|placeholder" || true)
if [ -n "$BAD" ]; then
  fail "Possible hardcoded secrets:"
  echo "$BAD" | while read -r line; do echo "    $line"; done
else
  ok "No hardcoded secret patterns"
fi

echo ""
echo "=== 3. .env.local never committed ==="
cd "$ROOT"
COMMITTED_ENV=$(git log --all --full-history --name-only --format="" -- \
  ".env.local" "apps/**/.env.local" "**/.env.local" 2>/dev/null | grep "env.local" || true)
if [ -n "$COMMITTED_ENV" ]; then
  fail ".env.local was committed to git history"
else
  ok ".env.local not in git history"
fi

# Also check that .env files with real content aren't committed
COMMITTED_ENV2=$(git log --all --full-history --name-only --format="" -- \
  ".env" "apps/**/.env" 2>/dev/null | grep -E "^\.env$|/\.env$" || true)
if [ -n "$COMMITTED_ENV2" ]; then
  fail ".env was committed (check it contains only examples)"
else
  ok ".env not committed"
fi

echo ""
echo "=== 4. service_role key only in server-safe paths ==="
# Allowed: API routes, server components, tests, scripts — never 'use client' files
BAD_SERVICE_ROLE=$(grep -rn "SUPABASE_SERVICE_ROLE_KEY\|service_role" \
  "$SRC" --include="*.ts" --include="*.tsx" \
  | grep -vE "(app/api/|admin/page\.tsx|__tests__|scripts/)" || true)
if [ -n "$BAD_SERVICE_ROLE" ]; then
  fail "service_role referenced outside allowed paths:"
  echo "$BAD_SERVICE_ROLE" | while read -r line; do echo "    $line"; done
else
  ok "service_role only in server-safe paths"
fi

echo ""
echo "=== 5. NEXT_PUBLIC_ vars are intentionally public ==="
# These are the only vars that SHOULD be public
ALLOWED_PUBLIC="NEXT_PUBLIC_SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY"
UNEXPECTED_PUBLIC=$(grep -rn "NEXT_PUBLIC_" "$SRC" --include="*.ts" --include="*.tsx" \
  | grep -v -E "$ALLOWED_PUBLIC" || true)
if [ -n "$UNEXPECTED_PUBLIC" ]; then
  fail "Unexpected NEXT_PUBLIC_ vars (review if they should be public):"
  echo "$UNEXPECTED_PUBLIC" | while read -r line; do echo "    $line"; done
else
  ok "Only expected vars are NEXT_PUBLIC_"
fi

echo ""
echo "=== 6. No Supabase URL hardcoded (must come from env) ==="
HARDCODED_URL=$(grep -rn "\.supabase\.co" "$SRC" --include="*.ts" --include="*.tsx" \
  | grep -v "process\.env\." || true)
if [ -n "$HARDCODED_URL" ]; then
  fail "Hardcoded Supabase URL (should use process.env):"
  echo "$HARDCODED_URL" | while read -r line; do echo "    $line"; done
else
  ok "No hardcoded Supabase URLs"
fi

echo ""
echo "══════════════════════════════════════════"
echo "  Secret audit: $PASS passed, $FAIL failed"
echo "══════════════════════════════════════════"
echo ""

[ "$FAIL" -eq 0 ] || exit 1
