# React 19 Upgrade Roadmap

Date: 2026-11-17
Status: Approved design, implementation not started

## Progress tracker

Update this table when each PR is opened and merged. A new session should read
this first to see where things stand.

| #   | PR                                    | Status      | Branch | PR link | Merged commit | Deploy verified |
| --- | ------------------------------------- | ----------- | ------ | ------- | ------------- | --------------- |
| 1   | happy-dom 2.55 -> 21                  | Not started |        |         |               |                 |
| 2   | Vite 5 -> 6.4+, Vitest 1 -> 5         | Not started |        |         |               |                 |
| 3   | ESLint 8 -> 9 flat config             | Not started |        |         |               |                 |
| 4   | Remix 2.12 -> 2.17.5                  | Not started |        |         |               |                 |
| 5   | Low-risk Remix future flags           | Not started |        |         |               |                 |
| 6   | `v3_singleFetch`                      | Not started |        |         |               |                 |
| 7   | Classic compiler -> Remix Vite plugin | Not started |        |         |               |                 |
| 8   | Remix 2 -> React Router 7             | Not started |        |         |               |                 |
| 9   | React 18 -> 19                        | Not started |        |         |               |                 |
| 10  | Flat routes (follow-up)               | Not started |        |         |               |                 |

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

## Version facts (checked 2026-11-17)

- Latest React is 19.3.1. Latest `@types/react` and `@types/react-dom` are 19.3.0.
- Latest Remix 2.x is 2.17.5. Its Vite plugin accepts Vite 5 or 6.
- React Router 7.11 accepts Vite 5, 6 or 7. `@react-router/dev@7.11` needs
  Node 20+. The repo is on Node 24.
- Vitest 5 requires Vite `^6.4.0 || ^7 || ^8`.
- **Vite 6.4+ is the one version accepted by Remix 2.17, React Router 7.11 and
  Vitest 5.**
- `eslint-plugin-react` supports ESLint up to 9.x. ESLint 10 is not usable yet.
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

| #   | PR                                    | Why here                                                                                                      | Main work                                                                                                                                                                                                                                                                                                                                                                                   |
| --- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | happy-dom 2.55 -> 21                  | Oldest dependency (March 2022), and the biggest risk for React 19 DOM tests                                   | Bump. Delete the `globalThis.URL` workaround in `test/setup-test-env.ts`. Fix any component test failures. Keep `installGlobals()`.                                                                                                                                                                                                                                                         |
| 2   | Vite 5 -> 6.4+, Vitest 1 -> 5         | Vitest 1 is four majors behind. Vite 6 is required later by both Remix and React Router.                      | Bump Vite, Vitest, `@vitest/coverage-v8`, `@vitejs/plugin-react`, `vite-tsconfig-paths`. Update `vitest.config.mts` and fix test API changes. Vite is only used by Vitest at this stage, so the app build is untouched. Update CLAUDE.md.                                                                                                                                                   |
| 3   | ESLint 8 -> 9 flat config             | ESLint 8 is end of life, and `@remix-run/eslint-config` depends on `@remix-run/dev`, which goes away in PR 8. | Replace `.eslintrc.js` with `eslint.config.js` using typescript-eslint, react, react-hooks, jsx-a11y, testing-library, jest-dom and prettier. Remove `@remix-run/eslint-config`. Update CLAUDE.md.                                                                                                                                                                                          |
| 4   | Remix 2.12 -> 2.17.5                  | Same major. Gives the final future flags and the Vite 6 peer.                                                 | Version bump of all `@remix-run/*` packages.                                                                                                                                                                                                                                                                                                                                                |
| 5   | Low-risk future flags                 | Small behaviour changes, isolated.                                                                            | `v3_fetcherPersist`, `v3_relativeSplatPath`, `v3_throwAbortReason`, `v3_lazyRouteDiscovery`.                                                                                                                                                                                                                                                                                                |
| 6   | `v3_singleFetch`                      | Largest code change. Separate PR makes Cypress problems easy to trace.                                        | Replace 24 `json()` calls with plain objects or `data()`. Rewrite about 46 `.json()` test reads, with a shared helper. Check Cypress status-code assertions and `useLoaderData<typeof loader>` inference.                                                                                                                                                                                   |
| 7   | Classic compiler -> Remix Vite plugin | Required before React Router 7.                                                                               | `vite.config.ts`, `app/routes.ts` with the v1-convention adapter (`v3_routeConfig`), `postcss.config.js`, `?url` CSS import, ESM and `"type": "module"` (port `mocks/index.js` and other `require` users), `build/server` paths, Dockerfile and start scripts, dev on port 3000 with MSW, remove `<LiveReload />`. Update CLAUDE.md. Screenshots likely differ if the CSS pipeline changes. |
| 8   | Remix 2 -> React Router 7             | The framework is now ready.                                                                                   | Official `remix/2/react-router/upgrade` codemod, `@react-router/*` packages, remove `installGlobals`, `remix-routes-option-adapter`, possible npm `overrides`. Update CLAUDE.md.                                                                                                                                                                                                            |
| 9   | React 18 -> 19                        | The goal.                                                                                                     | `react`, `react-dom`, `@types/react`, `@types/react-dom`. Fix `JSX.Element` in `cryptogram.tsx`. Testing-library minor bumps.                                                                                                                                                                                                                                                               |
| 10  | Flat routes (follow-up)               | Removes the legacy adapter.                                                                                   | Move to `@react-router/fs-routes`, rename route files and tests, drop `@remix-run/v1-route-convention`. Update CLAUDE.md.                                                                                                                                                                                                                                                                   |

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
- `CLAUDE.md` is updated in PRs 2, 3, 7, 8 and 10, where commands or
  architecture change.

## After merge: rollout verification

Never log in to production. The user does their own testing there.

1. Watch the GitHub Actions run on `main` until every job, including the Fly
   deploy, finishes successfully (`gh run watch`).
2. Confirm on Fly that the new release is live, its machines are healthy and the
   release's commit SHA matches (`flyctl status`, `flyctl releases`).
3. Request the public `/healthcheck` endpoint and confirm a 200.
4. Tell the user it is live, with the release and commit details.
5. Update the progress tracker above.

## Risks

1. **happy-dom 21 behaviour changes (PR 1).** Component tests are light. The
   loader tests that parse search params depend on `URL` and are the real check.
   If Vitest 1.6's happy-dom environment does not work with v21, stop and tell
   the user rather than pulling Vitest into PR 1.
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

## PR 1 design: happy-dom 2.55.0 -> 21.0.4

happy-dom 2.55.0 is from March 2022. Its `URL` lacks `searchParams`, which is
the only reason `test/setup-test-env.ts` overrides `globalThis.URL`.

- **Change:**
  - Bump `happy-dom` in `package.json` and the lockfile.
  - Remove the `NodeURL` override and its import from `test/setup-test-env.ts`.
  - Keep `installGlobals()` until PR 8.
- **Affected tests:** the two component test files
  (`app/components/Leaderboard.test.tsx`, `InProgressBadge.test.tsx`) only use
  `render` and `getByText`. The route tests that parse search params rely on the
  `URL` workaround and are the real check.
- **Checks:** `npm run test -- --run`, then `npm run validate`.
- **Visual check:** only test tooling changes, so no difference is expected.

## Out of scope

Not on the React path, so separate efforts: prettier 3, Cypress 16, Prisma 7,
Tailwind 4, msw 3, TypeScript 7, ESLint 10, `@faker-js/faker` 10, bcryptjs 3,
React Router 8, and Vite or Vitest beyond what PR 2 needs.
