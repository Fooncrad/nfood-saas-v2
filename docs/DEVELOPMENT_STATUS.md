# NFOOD Development Status

This file is the durable restart point for development when a ChatGPT conversation reaches its context limit.

## Source of truth
- Protected integration branch: `build/production-dist`
- Workflow gate: `NFOOD Verify`
- Never merge a feature/fix PR before the workflow succeeds.
- Use one branch and one PR per safe development batch.

## Current checkpoint — 2026-09-21
- PR #19 — **merged** — simplify registration and harden authentication.
- PR #20 — **merged** — synchronize registration currency display and replace the demo business name with Nasser Café.
- PR #21 — **merged** — enforce scoped `orders.refund` permission on POS refunds.
- Current RBAC foundation resolves effective permission keys from active scoped role assignments.

## Next roadmap
1. Continue server-side enforcement of sensitive permission keys where the underlying operation exists and scope can be verified safely.
2. Build RBAC management UI.
3. Add branches, departments, and modules to Super Admin management.
4. Link establishment owners and users.
5. Move countries, currencies, taxes, and timezones to database-backed management.
6. Complete remaining Super Admin modules.
7. Mobile UX overhaul.
8. Advanced multi-tenant PWA improvements.

## Restart protocol
On a new conversation, read this file and inspect open PRs plus `NFOOD Verify` before making changes. Reconcile GitHub state with this checkpoint, then continue from the first unfinished roadmap item. GitHub state wins if this document is stale.
