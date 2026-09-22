# NFOOD main deployment checklist

This repository now uses `main` as the deployable branch after the Super Admin V2 merge.

## Recommended hosting settings

Use these settings when reconnecting the app to a hosting provider:

```txt
Repository: Fooncrad/nfood-saas-v2
Branch: main
Node version: 22.13.1
Install command: pnpm install --frozen-lockfile
Build command: pnpm build
Start command: pnpm start
Publish/static directory: dist/public
Server entry: dist/index.js
```

## Safe deployment modes

### Full Node app

Use this mode when the host supports a Node server and API routes:

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm start
```

This is the preferred mode for production because the project includes server/API code, authentication, permissions, notifications, and admin modules.

### Static preview only

Use this only for a quick visual preview of the committed frontend assets:

```bash
echo "Using committed production dist"
```

Publish directory:

```txt
dist/public
```

Do not use static-only mode as the final production mode if API, login, Super Admin actions, uploads, orders, or database-backed screens must work.

## Branch safety rules

- Do not push directly to `main` for large changes.
- Use a feature branch and Pull Request.
- Do not merge stale dist PRs such as old automated builds if they were generated before the current Super Admin V2 source.
- Do not replace `dist/index.js` manually unless the replacement comes from a verified `pnpm build` output.
- If a PR shows massive deletions in `dist/index.js`, stop and inspect before merging.

## Smoke test after deployment

After deployment, open these routes:

```txt
/
/login
/admin
/marketplace
/menu/nssercafa
/api/health or /health if available on the deployed server
```

Expected result:

- `/admin` should route to Super Admin V2 for admin users.
- Non-admin users should not access `/admin`.
- Static assets under `/assets/...` should load without 404.
- The app should not show a white screen on first load.
