# React 19 Upgrade Roadmap

Date: 2026-11-17
Status: Approved design. PRs 1 to 7 merged (PR 7 moved the build to the Remix Vite plugin); `v3_routeConfig` is deferred to PR 7b.
Last re-ordered 2026-11-17 (see "Ordering change").

## Progress tracker

Update this table when each PR is opened and merged. A new session should read
this first to see where things stand.

| #   | PR                                    | Status      | Branch                     | PR link | Merged commit |
| --- | ------------------------------------- | ----------- | -------------------------- | ------- | ------------- |
| 1   | happy-dom 2.55 -> 21                  | Merged      | `deps/happy-dom-21`        | #86     | `fb09398`     |
| 2   | Remix 2.12 -> 2.17.5                  | Merged      | `deps/remix-2.17`          | #87     | `4f9a596`     |
| 3   | ESLint 8 -> 9 flat config             | Merged      | `deps/eslint-9`            | #88     | `0e26e25`     |
| 3b  | ESLint config on plugin presets       | Merged      | `chore/eslint-presets`     | #92     | `dd3c1f4`     |
| 4   | Vite 5 -> 6.4+, Vitest 1 -> 5         | Merged      | `deps/vite-vitest`         | #93     | `e53149f`     |
| 5   | Low-risk Remix future flags           | Merged      | `chore/remix-future-flags` | #94     | `b5294f5`     |
| 6   | `v3_singleFetch` (flag only)          | Merged      | `chore/single-fetch`       | #95     | `3d00d64`     |
| 6b  | Remove `json()`, native `Date`s       | Merged      | `chore/remove-json`        | #96     | `2dd90e0`     |
| 7   | Classic compiler -> Remix Vite plugin | Merged      | `chore/remix-vite`         | #97     | `c03bdec`     |
| 7b  | `v3_routeConfig` and `app/routes.ts`  | In review   | `chore/route-config`       |         |               |
| 8   | Remix 2 -> React Router 7             | Not started |                            |         |               |
| 9   | React 18 -> 19                        | Not started |                            |         |               |
| 10  | Flat routes (follow-up)               | Not started |                            |         |               |

## Ordering change

PRs 2 and 4 were swapped on 2026-11-17. The original plan did Vite 6 and Vitest 5
before the Remix bump. The install failed with an ERESOLVE error because the
installed `@remix-run/dev@2.12.1` declares `vite: ^5.1.0` as a peer. Optional
peers are still enforced when Vite is installed, so Vite 6 cannot coexist with
it. Remix 2.17.5 accepts Vite `^5.1.0 || ^6.0.0`, so the Remix bump has to land
first. The original check had only looked at 2.17.5's peers, not the version
actually installed. Lesson: check peer ranges of the **currently installed**
versions, not only the targets.

## Handoff (read this first in a new session)

- **State:** `main` has PRs 1 to 7. The app builds with the Remix Vite plugin. Remix is 2.17.5 with every `v3_*` flag on except
  `v3_routeConfig` (PR 7b, in review); Vite 6.4.6, Vitest 5, ESLint 9 (flat config on presets).
- **Next:** PR 7b (`v3_routeConfig`), then PR 8.
- **Test data in the dev database:** user `future-flags-check@example.com`, players
  Alice and Bob, game type Boggle and two completed games.
- **How we work:** see "Working agreements" below (the user runs installs and pushes;
  check `grep -c artifactory package-lock.json` is 0 before committing a lockfile;
  PR descriptions lead with why and say what was not tested).

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

| #   | PR                                    | Why here                                                                                                                                                                                 | Main work                                                                                                                                                                                                                                                                                                                                                                                   |
| --- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | happy-dom 2.55 -> 21                  | Oldest dependency (March 2022), and the biggest risk for React 19 DOM tests                                                                                                              | Bump. Delete the `globalThis.URL` workaround in `test/setup-test-env.ts`. Fix any component test failures. Keep `installGlobals()`.                                                                                                                                                                                                                                                         |
| 2   | Remix 2.12 -> 2.17.5                  | Same major. `@remix-run/dev@2.12.1` peers Vite 5 only, so this unblocks Vite 6 (see Ordering change). Also moves to the latest 2.x.                                                      | Version bump of all `@remix-run/*` packages, including `@remix-run/eslint-config`. Check the peer ranges and the build and tests. No code changes expected.                                                                                                                                                                                                                                 |
| 3   | ESLint 8 -> 9 flat config             | ESLint 8 is end of life. `@remix-run/eslint-config` peers `eslint ^8` and `react ^18`, so it blocks ESLint 9 now and React 19 in PR 9.                                                   | Replace `.eslintrc.js` with `eslint.config.js` using typescript-eslint, react, react-hooks, jsx-a11y, testing-library, jest-dom and prettier. Remove `@remix-run/eslint-config`. Update CLAUDE.md.                                                                                                                                                                                          |
| 3b  | ESLint config on plugin presets       | Added after PR 3: the explicit rule lists are brittle across plugin upgrades (six rules had already been renamed or removed).                                                            | Replace ~165 hand-listed rules with each plugin's recommended preset plus a short kept-rules list, then triage the new findings (fix, disable in config with a reason, or inline-disable with a linked issue).                                                                                                                                                                              |
| 4   | Vite 5 -> 6.4+, Vitest 1 -> 5         | Vitest 1 is four majors behind. Vite 6.4 is the version Remix 2.17, React Router 7 and Vitest 5 all accept. Needs PR 2 first.                                                            | Bump Vite to `^6.4.6`, Vitest and `@vitest/coverage-v8` to `^5.1.0`, `@vitejs/plugin-react` to `^5.2.0` (not 6.x, which needs Vite 8). Update `vitest.config.mts` and fix test API changes after reading the Vitest 2 to 5 migration guides. Vite is only used by Vitest at this stage, so the app build is untouched. Update CLAUDE.md.                                                    |
| 5   | Low-risk future flags                 | Small behaviour changes, isolated.                                                                                                                                                       | `v3_fetcherPersist`, `v3_relativeSplatPath`, `v3_throwAbortReason`, `v3_lazyRouteDiscovery`.                                                                                                                                                                                                                                                                                                |
| 6   | `v3_singleFetch` (flag only)          | Changes how data travels, so Cypress problems are easy to attribute.                                                                                                                     | Enable the flag, add the `Future` type augmentation, drop `installGlobals()` from the test setup, widen the Cypress redirect-status assertion. `json()` stays.                                                                                                                                                                                                                              |
| 6b  | Remove `json()`, native `Date`s       | React Router 7 removes `json()` and `defer()` (7.0.0 changelog), so this must land before step 8. Kept separate from 6 so a regression can be attributed to the flag or to the refactor. | Replace the 24 `json()` calls with plain returns or `data()` (about 14 set a status). Update about 46 `await res.json()` test reads with a shared helper. Date cleanup, see the PR 6 section.                                                                                                                                                                                               |
| 7   | Classic compiler -> Remix Vite plugin | Required before React Router 7.                                                                                                                                                          | `vite.config.ts`, `app/routes.ts` with the v1-convention adapter (`v3_routeConfig`), `postcss.config.js`, `?url` CSS import, ESM and `"type": "module"` (port `mocks/index.js` and other `require` users), `build/server` paths, Dockerfile and start scripts, dev on port 3000 with MSW, remove `<LiveReload />`. Update CLAUDE.md. Screenshots likely differ if the CSS pipeline changes. |
| 8   | Remix 2 -> React Router 7             | The framework is now ready.                                                                                                                                                              | Official `remix/2/react-router/upgrade` codemod, `@react-router/*` packages, remove `installGlobals`, `remix-routes-option-adapter`, possible npm `overrides`. Update CLAUDE.md.                                                                                                                                                                                                            |
| 9   | React 18 -> 19                        | The goal.                                                                                                                                                                                | `react`, `react-dom`, `@types/react`, `@types/react-dom`. Fix `JSX.Element` in `cryptogram.tsx`. Testing-library minor bumps.                                                                                                                                                                                                                                                               |
| 10  | Flat routes (follow-up)               | Removes the legacy adapter.                                                                                                                                                              | Move to `@react-router/fs-routes`, rename route files and tests, drop `@remix-run/v1-route-convention`. Update CLAUDE.md.                                                                                                                                                                                                                                                                   |

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
- **The agent cannot run `rm`.** Use `unlink`.
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

## Risks

1. **(PR 1, done)** happy-dom 21 worked with Vitest 1.6 and the `URL`
   workaround was removed with no test changes.
2. **Single fetch (PR 6, 6b).** Action redirects answer 202 (confirmed; the Cypress
   assertion was widened in PR 6). Type inference changes via the `Future`
   augmentation (done in PR 6). PR 6b needed no shared test helper (see the
   PR 6b section).
3. **ESM switch (PR 7).** `mocks/index.js`, `remix.config.js` and other
   `require` users must become `.cjs` or be ported. `binode --require ./mocks`
   must keep working with `remix vite:dev`, and later `react-router dev`.
4. **Production start path (PR 7).** The start command, the Dockerfile
   `COPY build`, and `public/` assets must line up.
5. **v1-convention adapter (PR 7, 8).** `@remix-run/v1-route-convention`
   peers `@remix-run/dev`, which PR 8 removes. May need `overrides` until PR 10.
6. **Rollback.** One revert per PR.
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

## PR 6: `v3_singleFetch` (flag only)

Changes: `future.v3_singleFetch: true` in `remix.config.js`; a `Future` type
augmentation in `app/single-fetch.d.ts`; `installGlobals()` removed from
`test/setup-test-env.ts` (the guide says to drop it on Node 20+; all 159 tests pass
under happy-dom 21 without the `nativeFetch` fallback); the Cypress `submitScore`
assertion widened to `[200, 202, 204]`. `entry.server.tsx` needed no change (it
already uses `renderToPipeableStream`, and the default `streamTimeout` of 4950 ms
is just under our 5000 ms `ABORT_DELAY`). The build now prints no future-flag
warnings.

Why 202: Single Fetch answers an action that redirects with
`SINGLE_FETCH_REDIRECT_STATUS = 202` (`@remix-run/server-runtime`), so the scoring
and start-game POSTs return 202. Without the assertion change, 5 Cypress tests
failed with `expected 202 to be one of [200, 204]`; nothing else broke.

Evidence from the passing Cypress run's server log: 120 `*.data` requests, zero
old `?_data=` requests, 25 `POST ... 202`, 20 `POST ... 200`, 26 `__manifest`
GETs, no 4xx or 5xx.

Types, proven with a throwaway probe that fails without the augmentation: a
plain-object loader infers `Date`, and a loader returning `json()` still infers
`string`. Runtime agrees: the router parses an `application/json` Response with
`result.json()` (`@remix-run/router`), so `json()` stringifies dates before
`turbo-stream` sees them.

Behaviour changes accepted: GET navigations now re-run all loaders (`root` user
lookup and the `games` list on every navigation; no `shouldRevalidate` or
`clientLoader` exists), and a 4xx/5xx action response no longer revalidates (forms
show errors from `actionData`).

## PR 6b: remove `json()` and use native `Date`s

`json()` and `defer()` are deprecated in Remix 2 ("deprecated in favor of opting
into Single Fetch") and removed in React Router 7.0.0 (`Response.json` is the
suggested fallback; `data()` replaces `json()` when a status or headers are
needed).

Commit 1, loaders and actions: 27 `json()` calls (the earlier estimate of 24
missed three written as `json<ActionData>(...)` in `login.tsx`). 21 became plain
returns; 6 carry `{ status: 400 }` (`login` x3, `join` x2, `new` x1) and became
`data(..., { status: 400 })`. `redirect()` and the thrown 404 `Response`s are
unchanged. The source typechecked immediately; only tests needed work. The 46
`.json()` reads needed no helper: loaders that return plain values are read
directly (`const data = await loader(...)`); redirect assertions are the original
`expect(response.status).toEqual(302)` lines with the result typed as `Response`;
and the 400 error actions assert the whole result with Remix's own `data()`, for
example `expect(response).toEqual(data({ errors: "..." }, { status: 400 }))`,
which checks payload and status together (a probe confirmed it fails on a wrong
status, a wrong payload, or a plain object). An earlier version of this PR added
a `test/loader-result.ts` helper (`dataOf`, `statusOf`, `responseOf`). It was
removed: about two thirds of its calls were identity functions on plain loaders,
and it duck-typed Remix's internal `DataWithResponseInit` shape, which was
brittle (its first version broke on that). Four tests were removed (2 in each of
`$gameid.test.tsx` and `$gameId.play.$playerId.test.tsx`): they only asserted
"returns a Response" and "status is 200", which describe the old transport; the
tests beside them check the content. Test count 159 -> 155.

Commit 2, Dates: dropped the 5 `new Date(x.createdAt)` wrappers (`games.tsx` x2,
`games/index.tsx` x3); the player page keeps a `Date | null` for the highest-score
date instead of an ISO string with an empty-string sentinel; and
`getNextPlayerToPlay` takes `Pick<Score, "playerId">[]` instead of
`Omit<Score, "scoredAt">[]`, because it only reads `playerId`. A type probe
(deleted afterwards) confirmed `createdAt` now infers exactly `Date` from both
loaders. `format()` accepts strings as well, so a green typecheck alone would not
have shown this.

Verification: typecheck, lint, build, 155 unit tests, Cypress 38/38 with no 4xx or
5xx in the server log.

## PR 7: classic compiler -> Remix Vite plugin

Why: React Router 7 builds with Vite, so the app has to be on Vite before the swap
(PR 8). This PR changes how the app is built and served, nothing else. Vite 6.4.6,
`@remix-run/dev` 2.17.5 (which ships the plugin), `vite-tsconfig-paths`, `tailwindcss`,
`postcss` and `autoprefixer` are already installed, so **no installs are expected**.

Changes:

1. **`vite.config.ts`** (new): the `remix` plugin with the five `future` flags moved
   from `remix.config.js`, `routes()` using `createRoutesFromFolders` (the plugin
   accepts the same `routes` function, so the v1 folder layout stays), `tsconfigPaths()`,
   and `server.port: 3000` (Vite defaults to 5173; Cypress `test:e2e:dev` expects 3000).
   `vitest.config.mts` stays separate, and Vitest prefers it.
2. **ESM:** the Vite server build is ESM, so `package.json` gets `"type": "module"`.
   CommonJS files must change: `tailwind.config.js` -> `.cjs`, `mocks/index.js` ->
   `.cjs` (`binode --require ./mocks/index.cjs`), and `remix.config.js` is deleted.
   The ESLint config already allows `require()` in `**/*.cjs`.
3. **CSS:** add `postcss.config.js` (`tailwindcss`, `autoprefixer`); the classic
   compiler did this implicitly. `root.tsx` imports `~/tailwind.css?url`.
4. **`root.tsx`:** remove `<LiveReload />` (Vite has HMR).
5. **Scripts:** `build` = `remix vite:build`; `dev` = `... remix vite:dev`; `start` and
   `start:mocks` serve `./build/server/index.js` (output moves to `build/server` and
   `build/client`). The Dockerfile copies `build/` and `public/`, so it should not need
   changes.
6. **TypeScript:** align `tsconfig.json` with Remix's Vite template (`module: ESNext`,
   `moduleResolution: Bundler`, `types` gain `vite/client`), replacing
   `remix.env.d.ts`. Typecheck is the safety net; the Cypress tsconfig already uses
   `Bundler`. Cypress's user scripts run through `tsx` (`cy.exec`), which handles both
   module systems.
7. **Docs:** update `CLAUDE.md` (commands, build output, dev port, CSS pipeline).

Decision (made by the user): **`v3_routeConfig` and `app/routes.ts` are deferred** to a small PR 7b. It needs two new packages (`@remix-run/route-config` and the routes
adapter), and the plugin's `routes()` already supports the v1 layout, so combining
them makes a failure harder to attribute.

Risks to check, in order: (a) the plugin rejects `.server` modules imported into
client code (the build will say where); (b) `recharts` under Vite SSR (ESM/CJS
interop on the school league table page); (c) MSW `--require` still runs in the dev
process under `vite:dev`; (d) Tailwind output parity, so compare the built CSS and
take before/after screenshots at 375, 768 and 1920px (the spec's visual check) using a
`main` worktree; (e) `/manifest.json`, `/anagram-manifest.json`, icons and other
`public/` assets are still served from `build/client`; (f) `npm run test:e2e:dev`
(port 3000) and `test:e2e:run` (build + `start:mocks` on 8811) both work; (g) the
first Fly deploy, which Dockerfile and start path changes make the likeliest place for
a surprise.

### PR 7 result

Implemented as designed with no installs. Notes beyond the design:

- The `remix` plugin takes `ignoredRouteFiles`, `future` and `routes()` exactly as
  `remix.config.js` did, so the v1 layout and all five flags carried over unchanged.
  `remix.config.js` and `remix.env.d.ts` are deleted; `tsconfig.json` gets
  `module: ESNext`, `moduleResolution: Bundler` and `types: [@remix-run/node, vite/client, vitest/globals]`.
- Output is `build/client` (served assets plus a copy of `public/`) and `build/server/index.js`.
  Every bare import in the server bundle is a production dependency, so the Dockerfile's
  `npm prune --omit=dev` stage still works. Docker was not available to run the image build.
- CSS parity: the same 436 rules plus one. The only differences are vendor prefixes added by
  autoprefixer (`-webkit-user-select`, `-webkit-text-decoration-line`, `-moz-tab-size` and
  similar) and `:nth-child(even)` minified to `:nth-child(2n)`.
- Visual check: before (`main` built by the classic compiler) and after screenshots of login,
  games, new game, play, summary, players, a player, compare, a matchup, school league table,
  anagram and cryptogram at 375, 768 and 1920px (1280px wide in Cypress's Electron). A pixel
  diff shows 16 of 36 pairs differ, all only in the same 23x16px box: the minutes of the game
  timestamp in the sidebar (two runs two minutes apart). No screenshots committed.
- `npm run validate` passes (155 Vitest, lint, typecheck, Cypress 38/38). `smoke` and
  `negative-score` also pass against `npm run dev` on port 3000. `/healthcheck`, both manifests,
  icons and `/school-league-table` (recharts under SSR) return 200 from the built server.
- MSW: the "Mock server running" line prints in the process that hosts the Vite dev server and
  the SSR modules, so the preload applies there. No handlers are registered, so this is
  a check that it loads, not that it intercepts.
- `prettier-plugin-tailwindcss` 0.2 is unaffected by the `.cjs` rename (same 7 pre-existing
  files flagged before and after).
- The old `public/build` directory is a stale artifact of the classic compiler (gitignored).

## PR 7b: `v3_routeConfig` and `app/routes.ts`

Why: React Router 7 reads routes from `app/routes.ts`, so the app has to be on it before
the swap (PR 8). Kept out of PR 7 so a build failure and a routing failure could not be
confused.

Changes: `app/routes.ts` wraps the same `createRoutesFromFolders` call in
`remixRoutesOptionAdapter`; `vite.config.ts` sets `v3_routeConfig: true` and drops
`routes()` and `ignoredRouteFiles` (the plugin errors if `routes` is set next to
`routes.ts`; `ignoredRouteFiles` only fed the flat-routes scan that the flag turns off).
New dev dependencies, pinned exactly with the other Remix packages:
`@remix-run/route-config` and `@remix-run/routes-option-adapter` 2.17.5. They are
build-time only, so the production image does not need them.

Verification: the built server's route table is identical to the one on `main` (19 routes,
same ids, parents and paths). Built CSS has the same hash, so there is nothing to compare
visually and no screenshots were taken. In `npm run dev`, adding and deleting a route file
is picked up without a restart. `npm run validate` passes (155 Vitest, lint, typecheck,
Cypress 38/38).

## Out of scope

Not on the React path, so separate efforts: prettier 3, Cypress 16, Prisma 7,
Tailwind 4, msw 3, TypeScript 7, ESLint 10, `@faker-js/faker` 10, bcryptjs 3,
React Router 8, and Vite or Vitest beyond what PR 4 needs.
