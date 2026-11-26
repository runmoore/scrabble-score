# React Router 8 Upgrade Roadmap

Date: 2026-11-26
Status: **In progress.** Four PRs take the app from React Router 7.18.6 to 8.5.3. PR 1 is open.
Follows on from [`2026-11-17-react-19-upgrade-roadmap-design.md`](./2026-11-17-react-19-upgrade-roadmap-design.md), which
listed React Router 8 as out of scope.

## Progress tracker

Update this table when each PR is opened and merged. A new session should read this first to see where things stand.

| #   | PR                                                                      | Status  | Branch                   | PR link | Merged commit |
| --- | ----------------------------------------------------------------------- | ------- | ------------------------ | ------- | ------------- |
| 1   | React Router 7.18.7 and Vite 7 (with this roadmap)                      | Open    | `deps/rr-7.18.7-vite-7`  |         |               |
| 2   | `v8_*` flags that need no code, and `useMatches().data` -> `loaderData` | Planned | `chore/rr8-flags`        |         |               |
| 3   | `v8_passThroughRequests`                                                | Planned | `chore/rr8-pass-through` |         |               |
| 4   | React Router 7.18.7 -> 8.5.3, and close-out                             | Planned | `chore/react-router-8`   |         |               |

## Why

React Router 7 is the current line only until v8 is adopted, and the v7 build already prints five v8 future-flag
warnings (middleware, route module splitting, Vite Environment API, request handling, data request URLs). The aim is the
same as the React 19 roadmap: stay on supported versions. It is not to adopt v8 features such as middleware or
instrumentation.

## Goals, non-goals, anti-goals

- **Goals:** `react-router` and the four `@react-router/*` packages on 8.5.3; every `future.v8_*` flag adopted on v7 first,
  so the v8 bump itself is small; the build prints no v8 warnings.
- **Non-goals:** using middleware, `Route.*` generated types, or any other new v8 feature; Vite 8; Vitest, React, Prisma,
  Tailwind or any other adjacent upgrade.
- **Anti-goals:** a change that silently alters post-login redirects or data request URLs (see PR 3).

## Decisions

- **Delivery:** small PRs, one flag or concern at a time, each independently deployable. This is the same approach as
  the React 19 roadmap, and the guide recommends it ("make a commit after each step and ship it").
- **Vite 7, not 8.** `@react-router/dev@8` needs Vite `^7 || ^8`. Vite 7 is the guide's minimum and the smaller change.
  `vitest@5` (`^6.4 || ^7 || ^8`), `@vitejs/plugin-react@5.2` (Vite 4 to 8) and `vite-tsconfig-paths@4.3.2` (`*`) already
  accept it. Vite 8 is a separate effort.
- **Adopt every flag.** It is what the guide recommends, and it clears the build warnings.
- **Fewer, larger PRs.** The first draft had seven. At the user's request, steps that are config-only or one line are
  bundled: React Router 7.18.7 and Vite 7 (PR 1, one commit); the flags that need no code and the `loaderData` rename
  (PR 2); the major bump and the close-out docs (PR 4). Only `v8_passThroughRequests` (PR 3) and the bump stay on their
  own, because they are the two that can change behaviour.
- **Validation:** `npm run validate` (Vitest, lint, typecheck, Cypress) is the safety net, and nothing more. No
  before/after screenshot diffs and no post-merge live-site checks (decided 2026-11-26). The deploy risk stays with the
  user, as in PR 9b of the React 19 roadmap.

## Version facts (checked 2026-11-26)

- Installed: `react-router` and `@react-router/{dev,node,serve,fs-routes}` 7.18.6, Vite 6.4.6, Vitest 5.1.1, React 19.3.1,
  Node 24 (the agent's shell is Node 22.22.2).
- Latest: React Router 8.5.3, 7.x is 7.18.7. Vite 7 is the line used here; Vite 8.3.8 exists.
- `react-router@8.5.3` needs Node `>=22.22.0` and React and React DOM `>=19.2.7`. Both are already met.
- `@react-router/dev@8.5.3` peers Vite `^7 || ^8`, TypeScript `^5.1 || ^6 || ^7`, `react-router ^8.5.3`. **Vite 6.4.6 is the
  only unmet requirement.**
- `@react-router/dev@7.18.7` accepts Vite `^5.1 || ^6 || ^7 || ^8`, so it can move before or after Vite.
- v8 reports an error if any `future.v8_*` flag is still in `react-router.config.ts`. `splitRouteModules` becomes a top-level
  option that defaults to `true`.
- **The react-router packages pin each other to the same exact version**, so they move together (see Working
  agreements).

## Code facts

- `react-router.config.ts` is `{ ssr: true, allowedActionOrigins: [...] }`. `vite.config.ts` has no `isSsrBuild` and no custom
  `rollupOptions`, so `v8_viteEnvironmentApi` needs no code change.
- No custom server, no `getLoadContext` (the app uses `react-router-serve`), no `react-router-dom`, and no code or Cypress test
  that matches `.data` URLs. The middleware, split-route-modules and trailing-slash flags therefore need no code changes.
- `meta` functions (`root.tsx`, `login.tsx`, `join.tsx`) take no arguments, so the `data` -> `loaderData` rename does not touch
  them. `app/utils.ts` `useMatchesData` reads `route?.data`; that is the one use.
- **`request.url` is read in four places:** `requireUserId` in `app/session.server.ts` (default `redirectTo` is
  `new URL(request.url).pathname`, 26 callers), `games.players_.$playerId.tsx`, `games.compare_.$playerOne.$playerTwo.tsx` and
  `$.tsx`. With `v8_passThroughRequests`, `request.url` on a client navigation ends in `.data`.
- Route tests hand-build loader and action arguments, including `url: new URL(...)` (added in PR 9b of the React 19
  roadmap), so the `url` argument already exists in the types.

## Roadmap

| #   | PR                                                                                                                                             | Why here                                                                                              | Main work                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | React Router 7.18.7 and Vite 7                                                                                                                 | The guide says to be on the latest 7.x first. Vite 7 is the one hard prerequisite for v8.             | The five React Router packages to 7.18.7 and `vite` to 7.3.8, in one commit with this roadmap. No code changes. Done: 155 Vitest tests and Cypress 38/38 pass; the build still prints the same five v8 warnings.                                                                                                                                                                              |
| 2   | `v8_viteEnvironmentApi`, `v8_middleware`, `v8_splitRouteModules`, `v8_trailingSlashAwareDataRequests`, and `useMatches().data` -> `loaderData` | Every change here is config or one line, none can alter behaviour for this app, and each works on v7. | Four flags in `react-router.config.ts`. `useMatchesData` in `app/utils.ts` reads `loaderData` (check tests that mock `useMatches`). Confirm no `getLoadContext`, no `.data` matching in Cypress or `fly.toml`, and check `build`, `dev` and `start:mocks` (the MSW preload runs in the SSR process). The build warnings drop from five to one.                                                |
| 3   | `v8_passThroughRequests`                                                                                                                       | The only flag with a behaviour risk (see below).                                                      | Flag on. The three loaders use the `url` argument. `requireUserId` stops deriving `redirectTo` from a raw `request.url`. One unit test for a `.data` URL.                                                                                                                                                                                                                                     |
| 4   | React Router 7.18.7 -> 8.5.3, and close-out                                                                                                    | Everything it needs is already in place.                                                              | Uninstall the five packages, then install at 8.5.3 (exact pins). Remove every `v8_*` flag. Read the 7.18 to 8 changelog and fix any type changes in hand-built loader and action arguments. Check `allowedActionOrigins` still exists. Update `CLAUDE.md`. Then, in the same PR: fill in this file's outcome and change "React Router 8" in the React 19 roadmap's Out of scope list to done. |

## PR 3: the passThroughRequests risk

On v7, `request.url` is normalised, so a logged-out client navigation to `/games/123` calls `requireUserId` with a request
whose pathname is `/games/123`, and redirects to `/login?redirectTo=/games/123`. With the flag, the request is the raw one and
the pathname is `/games/123.data`. The redirect would be `redirectTo=/games/123.data`, and after login the user would be sent
to a raw data response.

The unit tests build requests with no `.data` suffix, and Cypress logs in from a document request, so neither catches this.
Options for the fix, to be settled in the PR's own design:

- Pass `url.pathname` from each loader's `url` argument (26 call sites, mechanical, explicit). **Lean towards this.**
- Strip a `.data` or `_.data` suffix inside `requireUserId` (one place, but it duplicates React Router's URL rules, and
  `trailingSlashAwareDataRequests` makes the suffix format more than one shape).

Whichever is chosen, add a test that a `.data` URL yields the page path in `redirectTo`. This single test is the one addition
to "rely on existing tests".

## Rules for every PR

- `npm run validate` passes locally.
- Only that PR's dependencies change. Unrelated version drift is left alone.
- The PR description says why, which roadmap step it is, what it unblocks, and what was not tested.
- `CLAUDE.md` is updated where commands or architecture change.
- No new `cy.wait(ms)`. If Cypress is flaky, see the React 19 roadmap's known issues; a re-run is expected to clear a flake.

## Working agreements (environment)

These carry over from the React 19 roadmap.

- **npm installs are run by the user, not the agent.** The user's global registry is the Skyscanner Artifactory. The agent gives
  the exact command, including `--registry=https://registry.npmjs.org`. The agent does not run `npm install`, including
  `--dry-run`.
- **Exact pins** for `react-router` and `@react-router/*`. After installing, check `package.json` and `packages[""]` in
  `package-lock.json` agree.
- **Before every commit that touches `package-lock.json`**, check `grep -c artifactory package-lock.json` is 0.
- **Install order for the React Router packages:** `npm uninstall` all five, then install `react-router`, `@react-router/node`
  and `@react-router/serve` with `--save-exact`, then `@react-router/dev` and `@react-router/fs-routes` with
  `--save-dev --save-exact`. A plain `npm install` after editing `package.json` fails with ERESOLVE.
- **The agent cannot push**; the user pushes. `gh pr create` works. The agent cannot run `rm` (use `unlink`).
- Check `origin/main` before opening each PR and rebase if it moved.
- Shell quirks: `rg` is not installed (use `grep`); quote globs in zsh.

## Risks

1. **Redirect after login** (PR 3): described above.
2. **Origin check behind Fly** (PR 4). 7.12 broke form posts behind Fly's TLS-terminating proxy, and CI could not see it.
   `allowedActionOrigins` fixed it. Confirm the option is still supported and still needed in v8. Not verifiable locally
   beyond a simulation with `Host`, `Origin` and `X-Forwarded-Proto`; production is the user's to test.
3. **Vite 7** (PR 1): the build, dev server, MSW preload and Vitest all run on it. `react-router dev` under `binode` is the
   most likely thing to surprise.
4. **Hand-built loader and action arguments in tests** have broken on router type changes twice (28 sites each time). Typecheck
   will find them; a shared helper has been rejected twice and stays rejected.
5. **Flaky Cypress** can cost CI re-runs.
6. **Docker image build** is still never verified locally; CI deploys exercise it.
7. **Install ordering** (ERESOLVE): see Working agreements.

## Rollback

One revert per PR. For PR 4, reverting restores the 7.x packages and the `v8_*` flags together, which is why the flag PRs
come first.

## Out of scope

Vite 8, Prisma 7, Tailwind 4, prettier 3, Cypress 16, TypeScript 6 or 7, ESLint 10, msw 3, adopting the generated `Route.*`
types, middleware or instrumentation.

## Left to the builder

Each PR gets its own short design when it starts. PR 3 and PR 4 are the riskiest and should get fuller ones.
