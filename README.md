# EagleOne Military Bank — Online Banking

React + Vite + Tailwind CSS single-page banking interface.

## Local development

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:5173.

## Production build

```bash
npm run build
```

The build output is written to `./dist`. The project uses `vite-plugin-singlefile`,
so `dist/index.html` is a fully self-contained page that can be served from any
static host.

## Deploy to Render

This repository ships with a [Render Blueprint](https://render.com/docs/blueprint-spec)
in `render.yaml`. Two easy ways to deploy:

### Option A — One-click blueprint (recommended)

1. Push this repo to GitHub / GitLab / Bitbucket.
2. In the Render dashboard click **New +** → **Blueprint**.
3. Point Render at your repository. It will read `render.yaml` and create the
   `eagleone-military-bank` static site automatically.
4. Click **Apply**. The first deploy runs `npm ci && npm run build` and serves
   the contents of `./dist`.

### Option B — Manual static site

1. In the Render dashboard click **New +** → **Static Site**.
2. Connect the repository.
3. Use these settings:
   - **Build Command:** `npm ci && npm run build`
   - **Publish Directory:** `dist`
   - **Node Version:** `20.11.1` (already pinned via `.nvmrc` / `.node-version`)
4. Under **Redirects/Rewrites**, add: `Source: /*` → `Destination: /index.html`
   with type **Rewrite** (or rely on the bundled `public/_redirects` file).
5. Click **Create Static Site**.

Every push to the default branch triggers an automatic deploy. Pull-request
previews are enabled by the blueprint.

### Environment / runtime notes

- Node version is pinned in `.nvmrc`, `.node-version`, and `render.yaml`.
- `NPM_CONFIG_PRODUCTION=false` is set so devDependencies (Vite, TypeScript,
  Tailwind) install during the build.
- Long-lived cache headers are applied to `/assets/*`; the SPA HTML is served
  with default (short) caching so updates roll out immediately.
- Basic security headers (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`) are configured in the blueprint.

## Project structure

```
src/
  App.tsx                # Router / top-level layout
  data.ts                # Accounts, transactions, credentials, OTP list
  components/
    Login.tsx            # Sign-in + OTP gate
    Dashboard.tsx        # Balances, recent activity, notifications
    Accounts.tsx         # Per-account detail view
    TransferFlow.tsx     # Internal + external transfer wizard
    AchFlow.tsx          # ACH origination wizard
    LinkAccount.tsx      # External account linking wizard
    Security.tsx         # Alerts, sessions, transfer controls
    ui.tsx               # Shared primitives (Card, Field, Button, OtpStep…)
```
