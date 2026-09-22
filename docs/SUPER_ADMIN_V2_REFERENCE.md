# NFOOD Super Admin V2 — Work Continuity Reference

> Source of truth for the current admin rebuild. Update this file before stopping work.

## Current work
- Repository: `Fooncrad/nfood-saas-v2`
- Production/build base: `build/production-dist`
- Active rebuild branch: `feat/super-admin-v2`
- Tracking PR: `#61`
- Admin route: `/admin`
- Standalone entry: `client/src/pages/SuperAdminApp.tsx`
- Active shell: `client/src/components/CentralAdminCommandCenter.tsx`
- Legacy `CentralAdminDashboard.tsx`: removed; do not restore.
- `Home.tsx` remains for non-admin application routes; do not make it the Super Admin entry again.

## Architecture rules
1. Super Admin is isolated from restaurant/store dashboards.
2. Real API/database data only; no fake KPI values.
3. Preserve multi-country, multi-sector and tenant isolation.
4. Platform Admin manages platform/site/store capabilities; reservations remain store-owned.
5. Every admin module must be reachable from the new shell and protected by admin/RBAC guards.
6. Before merge: TypeScript check, admin/RBAC tests, i18n check, production build.
7. Workflow: feature branch -> PR -> NFOOD Verify -> merge. Never bypass protected production branches.

## Admin modules checklist
- [x] Standalone `/admin` separated from legacy `Home.tsx`
- [x] Live orders wired
- [x] Live notifications wired
- [ ] Overview / platform KPIs
- [ ] Activities & sectors: canonical 9 sectors; Trend Kitchen separate
- [ ] Stores
- [ ] Accounts & subscriptions
- [ ] Site pages & identity
- [ ] NFC business cards
- [ ] Trend Kitchen / marketplace
- [ ] Languages & translations
- [ ] Media library
- [ ] General settings
- [ ] Security & sessions
- [ ] System health
- [ ] Full RBAC/navigation integration tests
- [ ] Final Verify + build + production dist publication

## Resume instruction
Read this file first, inspect PR #61 and the latest commit on `feat/super-admin-v2`, then continue from the first unchecked item. Do not restart from legacy admin code.
