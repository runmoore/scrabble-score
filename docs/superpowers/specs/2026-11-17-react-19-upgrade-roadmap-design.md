# React 19 Upgrade Roadmap

Date: 2026-11-17
Status: Approved design. PRs 1 to 4 merged. PR 5 (low-risk Remix future flags) in progress.
Last re-ordered 2026-11-17 (see "Ordering change").

## Progress tracker

Update this table when each PR is opened and merged. A new session should read
this first to see where things stand.

| #   | PR                                    | Status      | Branch                     | PR link | Merged commit | Deploy verified                                                                      |
| --- | ------------------------------------- | ----------- | -------------------------- | ------- | ------------- | ------------------------------------------------------------------------------------ |
| 1   | happy-dom 2.55 -> 21                  | Merged      | `deps/happy-dom-21`        | #86     | `fb09398`     | Actions run (incl. Deploy) green, `/healthcheck` 200. Fly release check pending user |
| 2   | Remix 2.12 -> 2.17.5                  | Merged      | `deps/remix-2.17`          | #87     | `4f9a596`     | Actions run (incl. Deploy) green, `/healthcheck` 200. Fly release check pending user |
| 3   | ESLint 8 -> 9 flat config             | Merged      | `deps/eslint-9`            | #88     | `0e26e25`     | Actions run (incl. Deploy) green, `/healthcheck` 200. Fly release check pending user |
| 3b  | ESLint config on plugin presets       | Merged      | `chore/eslint-presets`     | #92     | `dd3c1f4`     | Fly release check pending user                                                       |
| 4   | Vite 5 -> 6.4+, Vitest 1 -> 5         | Merged      | `deps/vite-vitest`         | #93     | `e53149f`     | Actions run (incl. Deploy) green, `/healthcheck` 200. Fly release check pending user |
| 5   | Low-risk Remix future flags           | In progress | `chore/remix-future-flags` |         |               |                                                                                      |
| 6   | `v3_singleFetch`                      | Not started |                            |         |               |                                                                                      |
| 7   | Classic compiler -> Remix Vite plugin | Not started |                            |         |               |                                                                                      |
| 8   | Remix 2 -> React Router 7             | Not started |                            |         |               |                                                                                      |
| 9   | React 18 -> 19                        | Not started |                            |         |               |                                                                                      |
| 10  | Flat routes (follow-up)               | Not started |                            |         |               |                                                                                      |

## Ordering change

PRs 2 and 4 were swapped on 2026-11-17. The original plan did Vite 6 and Vitest 5
before the Remix bump. The install failed with an ERESOLVE error because the
installed `@remix-run/dev@2.12.1` declares `vite: ^5.1.0` as a peer. Optional
peers are still enforced when Vite is installed, so Vite 6 cannot coexist with
it. Remix 2.17.5 accepts Vite `^5.1.0 || ^6.0.0`, so the Remix bump has to land
first. The original check had only looked at 2.17.5's peers, not the version
actually installed. Lesson: check peer ranges of the **currently installed**
versions, not only the targets.

## Why

Remix 2.x only supports React 18 (`@remix-run/react` peers `react ^18`).
React 19 support comes through React Router 7, so staying current and supported
means leaving Remix 2. The app's own React code is already React 19 ready; the
cost is the framework and tooling migration.

The aim is to stay on supported versions. It is not to adopt React 19 features.

## Decisions

- **Delivery:** many small PRs, oldest dependency first. Each PR is
  independently deployable, so if the migration stops partway the repo is still
  better off.
- **Target framework:** React Router 7 (7.11.x), not 8. v7 has the documented
  migration path from Remix 2 and accepts React 18 or 19 and Vite 5, 6 or 7.
  A later v7 -> v8 move is out of scope.
- **Routing:** keep the Remix v1 folder convention through the migration using
  `@react-router/remix-routes-option-adapter` with `createRoutesFromFolders`.
  Move to flat routes (`@react-router/fs-routes`) in PR 10.
- **Scope:** only dependencies on the path to React 19, or blocking it.
  Adjacent upgrades are not included (see Out of scope).
- **Ordering:** oldest dependency first, unless a peer-dependency constraint
  forces another order (see Ordering change).

## Version facts (checked 2026-11-17)

- Latest React is 19.3.1. Latest `@types/react` and `@types/react-dom` are 19.3.0.
- Latest Remix 2.x is 2.17.5. `@remix-run/dev@2.17.5` peers Vite `^5.1.0 || ^6.0.0`.
- **Installed `@remix-run/dev@2.12.1` peers Vite `^5.1.0` only**, which blocks
  Vite 6 until the Remix bump (PR 2) is done.
- Installed `@vitejs/plugin-react@4.2.1` peers Vite `^4.2.0 || ^5.0.0`. The
  latest plugin-react (6.3.0) requires Vite 8, so use 5.2.0, which accepts
  Vite 4 to 8.
- Vitest 5.1.0 needs Node `^22.12 || ^24 || >=26`. The repo is on Node 24.
- Latest Vite 6.x is 6.4.6.
- React Router 7.11 accepts Vite 5, 6 or 7. `@react-router/dev@7.11` needs
  Node 20+. The repo is on Node 24.
- Vitest 5 requires Vite `^6.4.0 || ^7 || ^8`.
- **Vite 6.4+ is the one version accepted by Remix 2.17, React Router 7.11 and
  Vitest 5, but only once Remix is on 2.17.**
- `eslint-plugin-react` supports ESLint up to 9.x. ESLint 10 is not usable yet.
- `@remix-run/eslint-config@2.17.5` does **not** depend on `@remix-run/dev`
  (an earlier version of this spec said it did). Its blockers are the peers
  `eslint ^8` and `react ^18`, plus bundled typescript-eslint v5 and
  `eslint-plugin-node`.
- `@remix-run/v1-route-convention@0.1.4` peers `@remix-run/dev`. This may need
  an npm `overrides` entry after PR 8 until PR 10 removes the package.
- `@testing-library/react@16.3.3` already supports React 18 and 19.
- `recharts@3.10` already supports React 19.

## Code facts that shape the work

- React code is already compatible with React 19. The only fix is the global
  `JSX.Element` namespace in `app/routes/cryptogram.tsx:190-191`.
- Entry files already use `hydrateRoot` and `renderToPipeableStream`.
- 24 `json()` calls across routes, and about 46 `await res.json()` reads in
  route tests that call loaders and actions directly. These are the main cost
  of `v3_singleFetch` (PR 6).
- `test/setup-test-env.ts` calls `installGlobals()` (removed in React Router 7)
  and overrides `globalThis.URL` because happy-dom 2.x lacks `searchParams`.
- The app uses the classic Remix compiler: `remix.config.js`, CJS server
  module format, `<LiveReload />`, and `import stylesheet from "~/tailwind.css"`.
  There is no `postcss.config.js` or `vite.config.ts` for the app.
- Dev runs through `binode --require ./mocks` (MSW, CommonJS `mocks/index.js`).
  Cypress expects the dev server on port 3000 and the built server on 8811.
- Cypress `submitScore` asserts the response status is 200 or 204.
- `Dockerfile` copies `build/`, and `npm start` runs
  `remix-serve ./build/index.js`.

## Roadmap

| #   | PR                                    | Why here                                                                                                                               | Main work                                                                                                                                                                                                                                                                                                                                                                                   |
| --- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | happy-dom 2.55 -> 21                  | Oldest dependency (March 2022), and the biggest risk for React 19 DOM tests                                                            | Bump. Delete the `globalThis.URL` workaround in `test/setup-test-env.ts`. Fix any component test failures. Keep `installGlobals()`.                                                                                                                                                                                                                                                         |
| 2   | Remix 2.12 -> 2.17.5                  | Same major. `@remix-run/dev@2.12.1` peers Vite 5 only, so this unblocks Vite 6 (see Ordering change). Also moves to the latest 2.x.    | Version bump of all `@remix-run/*` packages, including `@remix-run/eslint-config`. Check the peer ranges and the build and tests. No code changes expected.                                                                                                                                                                                                                                 |
| 3   | ESLint 8 -> 9 flat config             | ESLint 8 is end of life. `@remix-run/eslint-config` peers `eslint ^8` and `react ^18`, so it blocks ESLint 9 now and React 19 in PR 9. | Replace `.eslintrc.js` with `eslint.config.js` using typescript-eslint, react, react-hooks, jsx-a11y, testing-library, jest-dom and prettier. Remove `@remix-run/eslint-config`. Update CLAUDE.md.                                                                                                                                                                                          |
| 3b  | ESLint config on plugin presets       | Added after PR 3: the explicit rule lists are brittle across plugin upgrades (six rules had already been renamed or removed).          | Replace ~165 hand-listed rules with each plugin's recommended preset plus a short kept-rules list, then triage the new findings (fix, disable in config with a reason, or inline-disable with a linked issue).                                                                                                                                                                              |
| 4   | Vite 5 -> 6.4+, Vitest 1 -> 5         | Vitest 1 is four majors behind. Vite 6.4 is the version Remix 2.17, React Router 7 and Vitest 5 all accept. Needs PR 2 first.          | Bump Vite to `^6.4.6`, Vitest and `@vitest/coverage-v8` to `^5.1.0`, `@vitejs/plugin-react` to `^5.2.0` (not 6.x, which needs Vite 8). Update `vitest.config.mts` and fix test API changes after reading the Vitest 2 to 5 migration guides. Vite is only used by Vitest at this stage, so the app build is untouched. Update CLAUDE.md.                                                    |
| 5   | Low-risk future flags                 | Small behaviour changes, isolated.                                                                                                     | `v3_fetcherPersist`, `v3_relativeSplatPath`, `v3_throwAbortReason`, `v3_lazyRouteDiscovery`.                                                                                                                                                                                                                                                                                                |
| 6   | `v3_singleFetch`                      | Largest code change. Separate PR makes Cypress problems easy to trace.                                                                 | Replace 24 `json()` calls with plain objects or `data()`. Rewrite about 46 `.json()` test reads, with a shared helper. Check Cypress status-code assertions and `useLoaderData<typeof loader>` inference.                                                                                                                                                                                   |
| 7   | Classic compiler -> Remix Vite plugin | Required before React Router 7.                                                                                                        | `vite.config.ts`, `app/routes.ts` with the v1-convention adapter (`v3_routeConfig`), `postcss.config.js`, `?url` CSS import, ESM and `"type": "module"` (port `mocks/index.js` and other `require` users), `build/server` paths, Dockerfile and start scripts, dev on port 3000 with MSW, remove `<LiveReload />`. Update CLAUDE.md. Screenshots likely differ if the CSS pipeline changes. |
| 8   | Remix 2 -> React Router 7             | The framework is now ready.                                                                                                            | Official `remix/2/react-router/upgrade` codemod, `@react-router/*` packages, remove `installGlobals`, `remix-routes-option-adapter`, possible npm `overrides`. Update CLAUDE.md.                                                                                                                                                                                                            |
| 9   | React 18 -> 19                        | The goal.                                                                                                                              | `react`, `react-dom`, `@types/react`, `@types/react-dom`. Fix `JSX.Element` in `cryptogram.tsx`. Testing-library minor bumps.                                                                                                                                                                                                                                                               |
| 10  | Flat routes (follow-up)               | Removes the legacy adapter.                                                                                                            | Move to `@react-router/fs-routes`, rename route files and tests, drop `@remix-run/v1-route-convention`. Update CLAUDE.md.                                                                                                                                                                                                                                                                   |

Each PR gets its own short design and plan when it starts. PRs 6, 7 and 8 are
the riskiest and each deserve a fuller design before work begins.

## Rules for every PR

- `npm run validate` passes locally: Vitest, lint, typecheck and Cypress.
- **Visual check, done locally.** Before and after screenshots at 375, 768 and
  1920px of: login, games list, new game, play, game summary, compare, players,
  school league table, anagram and cryptogram.
  - If they match, commit nothing and add no screenshots to the PR.
  - If anything differs, tell the user straight away, with the screens,
    viewports and what changed. Only then add screenshots to
    `docs/screenshots/###-name/` on the PR, per CLAUDE.md.
- No new `cy.wait(ms)`. If Cypress becomes flaky, fix the underlying cause in
  that PR.
- Only that PR's dependencies change. Unrelated version drift is left alone.
- The PR description explains why, says which roadmap step it is, and what it
  unblocks.
- `CLAUDE.md` is updated in PRs 3, 4, 7, 8 and 10, where commands or
  architecture change.

## Working agreements (environment)

- **npm installs are run by the user, not the agent.** The user's global npm
  registry is the Skyscanner Artifactory, which writes internal
  `artifactory.skyscannertools.net` URLs into `package-lock.json`. GitHub
  Actions and the Fly build get `403` on those. The agent gives the exact
  command, including `--registry=https://registry.npmjs.org`, and the user runs
  it.
- **Exact pins for Remix packages.** `npm install pkg@x` writes `^x` ranges,
  but `@remix-run/*` are pinned exactly (e.g. `2.17.5`) so they move in
  lockstep. After installing, restore exact pins in `package.json` and in
  `packages[""]` of `package-lock.json` (`npm ci` checks they agree).
- **Before every commit that touches `package-lock.json`**, check
  `grep -c artifactory package-lock.json` is 0. This broke PR 1's first CI run.
- **The agent cannot push** to this remote (guardrail
  `github_destination_not_sanctioned`). The user pushes, including any
  `--force-with-lease` after a rebase. `gh pr create` and `gh run` work.
- **The agent cannot run `flyctl` or `rm`.** The user runs
  `flyctl status -a scrabble-score-e630` and
  `flyctl releases -a scrabble-score-e630` and confirms the release matches the
  merged commit.
- **Vitest and `@vitest/coverage-v8` pin each other to an exact version**
  (5.1.1 needs 5.1.1). Installing both in one command fails with ERESOLVE while
  the old coverage package is still in the tree. Upgrade in three steps:
  `npm uninstall @vitest/coverage-v8`, then install `vite`, `vitest` and
  `@vitejs/plugin-react`, then install `@vitest/coverage-v8`. Always keep
  `--registry=https://registry.npmjs.org`.
- **Shell quirks.** `rg` is not installed (use `grep`). In zsh, quote globs such
  as `--include='*.ts'`. The agent's shell runs Node 22.22.2 while CI and the
  user run Node 24. `rm` is denied; `unlink` works. `gh issue create` and
  `gh pr edit` work.
- Check `origin/main` before opening each PR, because the user also pushes to
  `main`, and rebase if it moved.

## After merge: rollout verification

Never log in to production. The user does their own testing there.

1. Watch the GitHub Actions run on `main` until every job, including the Fly
   deploy, finishes successfully (`gh run watch`).
2. Request the public `/healthcheck` endpoint
   (`https://scrabble-score-e630.fly.dev/healthcheck`) and confirm a 200.
3. Ask the user to confirm on Fly that the new release is live, its machines are
   healthy and the release's commit SHA matches (`flyctl status`,
   `flyctl releases`). The agent cannot run these.
4. Tell the user it is live, with the release and commit details.
5. Update the progress tracker above.

## Risks

1. **(PR 1, done)** happy-dom 21 worked with Vitest 1.6 and the `URL`
   workaround was removed with no test changes.
2. **Single fetch (PR 6).** Action redirects become data responses instead of
   30x, so the Cypress `oneOf([200, 204])` assertion may need to change. Type
   inference for `useLoaderData<typeof loader>` changes. The tests need a small
   shared "read loader result" helper so 46 call sites do not each reinvent it.
3. **ESM switch (PR 7).** `mocks/index.js`, `remix.config.js` and other
   `require` users must become `.cjs` or be ported. `binode --require ./mocks`
   must keep working with `remix vite:dev`, and later `react-router dev`.
4. **Production start path (PR 7).** The start command, the Dockerfile
   `COPY build`, and `public/` assets must line up. Watch the first deploy.
5. **v1-convention adapter (PR 7, 8).** `@remix-run/v1-route-convention`
   peers `@remix-run/dev`, which PR 8 removes. May need `overrides` until PR 10.
6. **Rollback.** One revert per PR. Merge PRs 6 to 8 when the deploy can be
   watched.
7. **Dev server port.** Vite defaults to 5173. Cypress and `test:e2e:dev`
   expect 3000, so set the port explicitly in PR 7.
8. **Vitest 1 -> 5 (PR 4).** Four majors of breaking changes. Read the Vitest 2,
   3, 4 and 5 migration guides first and fix only what breaks. CI runs
   `npm run test -- --coverage`, so check coverage defaults too.
9. **Artifactory URLs in the lockfile (every PR with installs).** See Working
   agreements.

## PR 1 (done): happy-dom 2.55.0 -> 21.0.4

Merged as `fb09398` (#86). happy-dom 21's `URL` extends Node's, so the
`globalThis.URL` override in `test/setup-test-env.ts` was removed. `installGlobals()`
stays until PR 8. Vitest 1.6 worked with happy-dom 21. The first CI run failed
because the lockfile contained Artifactory URLs (see Working agreements).

## PR 2 (done): Remix 2.12.1 -> 2.17.5

Merged as `4f9a596` (#87). All six `@remix-run/*` packages are pinned exactly at
2.17.5. No app code changed. Checked in Chrome on the dev server: sign-up, game
flow, scoring, players, compare, school league table, anagram, cryptogram and
mobile. A leftover `remix-serve` held port 3000, so `remix dev` picked a random
free port. This is existing `remix-serve` behaviour (since 2.0.0), not a
regression. Consider setting `PORT=3000` explicitly in PR 7.

## PR 3 (done): ESLint 8 -> 9 flat config

Merged as `0e26e25` (#88). The config reproduced the old rules exactly (rule
parity checked per file type, deliberate violations caught, same files linted).
Renamed rules: `testing-library/await-async-query`, `no-await-sync-query` and
`no-render-in-setup` became `await-async-queries`, `no-await-sync-queries` and
`no-render-in-lifecycle`. Dropped (no longer exist): `jest/no-jest-import`,
`testing-library/no-wait-for-empty-callback`, `testing-library/prefer-wait-for`.
`import/no-duplicates` needs a resolver, so `eslint-import-resolver-node` is a
direct dev dependency. `npm audit` rose from 68 to 71, all from `picomatch@4.0.7`
under typescript-eslint's parser (dev-only, no patched release).

## PR 3b: ESLint config on plugin presets

Why: the explicit lists froze lint at the old Remix standard and break on plugin
upgrades. Measured before starting: a presets-only config enables 138 rules on
app files (was 95) but also drops 36 rules we enforced, and raises 135 errors in
41 files.

Three commits, then a fourth small one:

1. **Presets, kept rules and permanent config decisions.** `defineConfig` with
   `js`, `typescript-eslint`, `react`, `jsx-a11y` and `import` presets. Adds
   `@eslint/js` as a direct dev dependency. Lint is red after this commit by
   design.
2. **Fixes (11).** `&apos;` in JSX text (6), `@ts-ignore` replaced by an `Error`
   check, `isUser(unknown)`, the `GamesMenu` `games` prop typed as
   `SerializeFrom<typeof loader>["games"]` (derived from the loader, no
   hand-copied shape), and a
   type-only import in `compare.tsx`.
3. **Inline disables (11 findings, 8 comments).** Five `no-autofocus` and four
   anagram keyboard findings link #90 and #91; the `<dialog>` backdrop click is
   justified in place (Escape closes a modal dialog natively).
4. `import/no-duplicates` restored to error (the preset makes it a warning).

Decisions recorded in the config with reasons:

- `import/no-unresolved` off (TypeScript covers it; `~/` is not resolvable).
- `@typescript-eslint/no-explicit-any` off in test files only.
- `@typescript-eslint/no-unused-vars` and `no-unused-expressions` keep our
  looser options.
- `require()` allowed in the CommonJS config files; revisit at roadmap step 7.
- react-hooks: only `rules-of-hooks` and `exhaustive-deps`. The 14 React
  Compiler rules are off, tracked in #89.

The 36 old rules: kept 14 (+1 test-only): `no-eval`, `no-implied-eval`,
`no-new-func`, `no-script-url` (`no-implied-eval`, `no-new-func` and
`no-script-url` are now errors, were warnings), `array-callback-return`,
`no-caller`, `no-extend-native`, `no-loop-func`, `no-self-compare`, `no-sequences`,
`no-template-curly-in-string`, `import/first`, `jsx-a11y/lang`,
`consistent-type-imports`, and `testing-library/prefer-user-event`. Covered by the
presets: `no-unused-expressions` (TypeScript version, our options) and
`no-loss-of-precision` (core). Dropped 20 as obsolete, stylistic or covered by
TypeScript: `no-useless-*`, `no-labels` family, `no-lone-blocks`, `no-extra-bind`,
`no-new-object`, `import/no-amd`, `import/no-webpack-loader-syntax`, the
PropTypes-era `react/*` rules, `react/style-prop-object`, `react/jsx-pascal-case`,
`consistent-type-assertions`, `adjacent-overload-signatures`,
`no-use-before-define`.

Result: 136 rules on app files (was 95), 188 on test files (was 135). 41 rules went
from warning to error through preset defaults; lint was clean, so nothing new
blocks. `vitest.config.mts` is now linted (the old patterns missed `.mts`). Issues:
#89 (React Compiler hooks rules), #90 (autoFocus), #91 (anagram keyboard access).

Verification: break-a-rule across app, component, test, Cypress and plain JS
(kept rules fire, deliberately-off rules stay silent), enabled-rule comparison to
the pre-PR snapshot, typecheck, build, Vitest (159) and Cypress (38/38).

## PR 4 (done): Vite 5 -> 6.4, Vitest 1 -> 5

Vite 6.4.6, Vitest and `@vitest/coverage-v8` 5.1.1, `@vitejs/plugin-react` 5.2.0
(6.x needs Vite 8). `vite-tsconfig-paths` stays at 4.3.2. The only code change:
`test/setup-test-env.ts` imports `@testing-library/jest-dom/vitest`, because
Vitest 5 no longer reads the global `jest.Matchers` types (17 typecheck errors
otherwise). All 159 tests passed unchanged. Mocking is the main Vitest 3 to 5
risk area here (17 top-level `vi.mock`, 34 `vi.fn`, 11 `vi.clearAllMocks`) and
nothing needed changing: `clearMocks` now defaults to on, which makes the explicit
`vi.clearAllMocks()` calls redundant but harmless. Coverage reports only loaded
files now (`coverage.all` was removed in Vitest 4); there are no thresholds, so
CI is unaffected. The tree now has one Vite 6.4.6 plus the pre-existing nested
Vite 4.5.2 under `@remix-run/dev` (`@vanilla-extract`).

## PR 5: low-risk Remix future flags

`remix.config.js` gets `future: { v3_fetcherPersist, v3_relativeSplatPath,
v3_throwAbortReason, v3_lazyRouteDiscovery }` all `true`. No app code changes.
`v3_singleFetch` (PR 6) and `v3_routeConfig` (PR 7) stay off. The build warnings
drop from five to one (single fetch).

Impact check, flag by flag:

- `v3_fetcherPersist`: the only fetchers are the two `useFetcher` calls in
  `games/new.tsx`; `useFetchers` is unused.
- `v3_relativeSplatPath`: the only splat route (`$.tsx`) is a loader that throws a
  404 and renders no links; every relative `to=` lives in a non-splat route.
- `v3_throwAbortReason`: `entry.server.tsx` only calls `abort` on a timer and has
  no custom error handler.
- `v3_lazyRouteDiscovery`: no `prefetch` or `reloadDocument` in the app, and the
  Cypress intercepts only match POSTs, so the new `GET /__manifest` requests do
  not interfere.

Verification: the four flags are `true` in the built server bundle; unit tests
(159), lint, typecheck and build pass; Cypress passes 38/38. The server log of the
passing run shows 26 `GET /__manifest` requests, all 200, and no 4xx or 5xx
responses, which confirms lazy route discovery is exercised. One earlier Cypress
run crashed the Electron renderer in the cryptogram spec (which uses none of
these flags) and then hung; it left a `remix-serve` process behind that had to be
killed with `kill -9`. A rerun passed. If it recurs, run Cypress under
`timeout` and check for leftover processes on port 8811.

## Out of scope

Not on the React path, so separate efforts: prettier 3, Cypress 16, Prisma 7,
Tailwind 4, msw 3, TypeScript 7, ESLint 10, `@faker-js/faker` 10, bcryptjs 3,
React Router 8, and Vite or Vitest beyond what PR 4 needs.
