<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

For architecture, stack, route groups, and data flow, read `CLAUDE.md` — it's maintained separately.

## Gotchas

### Database

- **Use `pnpm`, not `npm`** — the lockfile is `pnpm-lock.yaml`.
- **`DATABASE_URL` must use `127.0.0.1`, NOT `localhost`** — the `postgres` npm driver interprets `localhost` as a Unix socket, which authenticates as the OS user (`blawness`) instead of the `postgres` user.
- **`drizzle.config.ts` and `drizzle/seed.ts` load `.env.local` via dotenv explicitly** — `drizzle-kit` and `tsx` do NOT auto-load `.env*` files. Do NOT add dotenv to `lib/db.ts`; Next.js already loads `.env.local` for server components and adding it causes double-load warnings.
- **Run DB setup in order**: `pnpm db:generate` → `pnpm db:migrate` → `pnpm db:seed`.
- **PostgreSQL must be installed and running** — `sudo service postgresql start`. The DB and role must exist: `sudo -u postgres createdb pasarku`, `sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'postgres';"`.

### Auth

- **Session strategy must be `"jwt"`**, not `"database"` — the `Credentials` (email/password) provider is incompatible with `strategy: "database"` when combined with the DrizzleAdapter. This will produce `UnsupportedStrategy` errors at runtime.
- **Route protection middleware lives in `proxy.ts`**, not `middleware.ts`. NextAuth's `auth()` function wraps the middleware as a default export; the `config.matcher` is also exported from `proxy.ts`.

### UI

- **Base UI Button with `render={<Link />}` must receive `nativeButton={false}`** — Base UI's Button defaults to `nativeButton={true}`, which expects the rendered element to be a native `<button>`. The `Button` wrapper in `components/ui/button.tsx` auto-detects this: if a `render` prop is present, it sets `nativeButton={false}`. When creating new Buttons that use `render`, pass the `render` prop and it's handled. Do NOT set `nativeButton={false}` globally — buttons used inside `<form>` with `type="submit"` need native behavior.

### Testing

- **Playwright tests require `LD_LIBRARY_PATH`** — the test scripts in `package.json` prefix the command with `LD_LIBRARY_PATH=$HOME/.playwright-libs:$LD_LIBRARY_PATH`. This is needed for headless browser support in WSL.
- **Playwright auto-starts the dev server** — no need to run `pnpm dev` separately for tests.

### Next.js 16 Breaking Changes

- `params`, `searchParams`, `cookies()`, `headers()` all return **Promises** — must be `await`ed.
- **Turbopack is default** — no `--turbopack` flag needed.

### Conventions

- **All monetary values are integers in Rupiah** — no floats anywhere.
- **API responses**: `{ data: T }` on success, `{ error: string }` on failure. Pagination adds `{ total, page, limit }`. See `types/index.ts`.
- **Cart state**: Zustand `cartStore.ts` handles UI-only state (drawer open/close, add indicator). Actual cart data lives in the DB via `carts` + `cartItems` tables.
- **shadcn/ui uses `base-nova` style, `neutral` base color, CSS variables enabled** — see `components.json`.
