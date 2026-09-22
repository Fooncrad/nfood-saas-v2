# NFOOD SaaS

NFOOD is a multi-tenant restaurant SaaS platform with a public website, digital menu, customer and restaurant areas, and Super Admin V2.

## Current deployment branch

Use:

```txt
main
```

The `main` branch includes the merged Super Admin V2 state and the current production distribution state.

## Hosting quick settings

```txt
Repository: Fooncrad/nfood-saas-v2
Branch: main
Node version: 22.13.1
Install command: pnpm install --frozen-lockfile
Build command: pnpm build
Start command: pnpm start
Publish directory: dist/public
Server entry: dist/index.js
```

For full production, use the Node app mode rather than static-only hosting, because authentication, admin tools, API calls, uploads, permissions, and database-backed features require the server.

## Important safety notes

- Do not merge stale automated dist PRs generated before the current Super Admin V2 merge.
- Do not replace `dist/index.js` manually unless it comes from a verified `pnpm build`.
- Work on feature branches and merge through Pull Requests.
- See `docs/DEPLOYMENT_MAIN.md` for the full deployment checklist.

## Key routes to test

```txt
/
/login
/admin
/marketplace
/menu/nssercafa
```
