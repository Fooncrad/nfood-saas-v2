# NFOOD Development Status

This file is the durable restart point for development when a ChatGPT conversation reaches its context limit.

## Source of truth
- Protected integration branch: `build/production-dist`
- Workflow gate: `NFOOD Verify`
- Never merge a feature/fix PR before the workflow succeeds.
- Use one branch and one PR per safe development batch.
- `testAccounts` is deprecated for new account/auth work. Use `users`, auth sessions/tokens, and production account models.

## Current checkpoint — 2026-09-21
- PR #31 — **merged** — sanitized authentication/database error logging after production login recovery.
- PR #32 — **merged** — established the dark NFOOD Super Admin shell and direct website/marketplace access.
- PR #33 — **merged** — introduced the reference overview structure.
- PR #34 — **merged** — rebuilt the Super Admin toward the approved RTL reference; merge commit `59ad2c29e42b28787a5c5f1567754a9ba287d6c2`.
- `NFOOD Verify` run #160 passed before PR #34 was merged.
- Current continuation branch: `feat/super-admin-phase-2`.

## Super Admin decisions that must not regress
- The approved reference screenshot is the visual target: right RTL sidebar, compact dark SaaS shell, five KPI cards, overview/health/quick actions/latest stores, Arabic/English/French, light/dark support.
- Main Super Admin navigation must not contain a standalone global Orders/Reservations item. Orders, reservations, appointments, and similar operations belong inside each business/store context.
- Top-level admin must retain direct access to the public website and NFOOD Marketplace.
- Never display invented revenue/order metrics or hard-coded green health states. Unknown health must remain explicit until a real check exists.
- Store/site identity customization is controlled by Super Admin entitlements/plans; per-store customization comes later.
- Email/messages administration should cover templates, SMTP configuration, test delivery, and notifications without exposing secrets to the client.

## Phase 2 priorities
1. Replace the current duplicate overview greeting and six-card quick-action area with the approved ordering: greeting → exactly five KPIs → analytics/category/system status → exactly five quick actions → latest stores.
2. Remove the production-facing demo-data seeding control from the primary Super Admin overview. Demo tooling must not be presented as a normal production admin action.
3. Back system status with real server/database/config-presence checks. Never expose credentials or secret values; payment, messaging, and storage should report configured/unconfigured/unknown unless a safe live probe exists.
4. Make Latest Stores match the reference with real entity/store, owner/email, sector/category, plan, operational status, date, and actions. Add “Open store” only after confirming the real public storefront route; do not invent a URL.
5. Complete Stores, Users, Subscriptions, Messages/Email, Appearance, General Settings, Languages, and Security sections without dead navigation.
6. Keep Marketplace access in the topbar/sidebar rather than consuming one of the five reference quick-action cards.
7. Preserve real-data behavior and production auth (`users`); do not add new dependencies on `testAccounts`.

## Known cleanup in `CentralAdminDashboard.tsx`
- Remove the unused `cycleLanguage` helper after the AR/EN/FR select replacement.
- Remove the duplicate greeting block introduced during the reference rebuild.
- Quick actions currently include Marketplace as a sixth card; reduce to the five approved actions.
- The overview still exposes `seedPlatformDemoData`; remove that primary UI action before calling the dashboard production-complete.
- The header/sidebar still contains optimistic “system live/stable” wording in places while the health card correctly says checks are not yet performed. Replace optimistic wording until real health data is wired.

## Restart protocol
On every continuation, inspect the current branch/PR and `NFOOD Verify` first. Reconcile this checkpoint with GitHub state, then continue the largest safe coherent Phase 2 batch. GitHub state wins if this document is stale.
