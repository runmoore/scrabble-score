# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Scrabble score tracking application built with the Remix Indie Stack. It allows users to create games, track multiple players, and record scores throughout the game with turn-by-turn play.

**Target Platform**: Progressive Web App (PWA) optimized for mobile browsers, specifically iPhone devices. The app is designed to be installed on the iPhone home screen and used as a native-like experience.

## Common Commands

### Development

```bash
npm run dev              # Start development server with MSW mocks
npm run build            # Build production bundle
npm start                # Run production server
npm run start:mocks      # Run production server with MSW mocks
```

### Testing

```bash
npm test                 # Run Vitest unit tests (watch mode)
npm run test -- --run    # Run Vitest once without watch mode
npm run test:e2e:dev     # Open Cypress for interactive e2e testing
npm run test:e2e:run     # Run Cypress e2e tests headlessly
npm run validate         # Run all tests, lint, typecheck, and e2e
```

### Code Quality

```bash
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript type checking
npm run format           # Format code with Prettier
```

### Database

```bash
npm run setup            # Reset database and run seed (prisma migrate dev + seed)
npx prisma migrate dev   # Create and apply new migration
npx prisma db seed       # Seed database with test data
npx prisma studio        # Open Prisma Studio UI
```

## Code Quality Requirements

**IMPORTANT**: After making ANY code changes, Claude must run the following commands in sequence:

1. `npm run lint` - Check code quality with ESLint
2. `npm run typecheck` - Verify TypeScript type safety
3. `npm run format` - Format code with Prettier

These commands must complete successfully before considering any task complete. If any command fails, the issues must be fixed before moving on.

## Architecture

### Database Schema (Prisma + SQLite)

The data model centers around multiplayer Scrabble games:

- **User**: Authentication and owns games/players
- **Password**: Separate table for bcrypt hashes (cascade delete with User)
- **Player**: Reusable player profiles (e.g., "Alice", "Bob") owned by a User
- **Game**: A game session linking multiple Players, owned by a User
- **Score**: Individual point entries linked to both a Player and Game

Key relationships:

- A Game has many Players (many-to-many)
- A Game has many Scores
- A Player has many Scores
- Scores link Player → Game for turn-by-turn tracking

### Core Game Logic

**app/game-utils.ts**: Contains `getNextPlayerToPlay()` which determines turn order by:

1. Finding the last score entry
2. Cycling through players array in order
3. Wrapping to first player after last player

**app/models/game.server.ts**: Database operations including:

- `getGame()`: Fetches game with scores and calculates `totalScore` for each player
- `createGame()`: Creates game with connected players
- `addScore()`: Records points for a player's turn
- `completeGame()`/`reopenGame()`: Toggle game completion status

The `EnhancedGame` type augments Prisma's Game model with:

- `PlayerWithScores[]` - players with their scores array and computed totalScore
- Used throughout the app for displaying game state

### Routes & User Flow

**File-based routing** (Remix v1 convention via `@remix-run/v1-route-convention`):

- **app/routes/games/new.tsx**: Create game by selecting existing players or adding new ones
- **app/routes/games/$gameId.tsx**: Game summary showing final scores and winner
- **app/routes/games/$gameId.play.$playerId.tsx**: Active play screen where:
  - Current player's turn is shown
  - Score input with +/- buttons for negative scores (iOS-friendly)
  - Displays all players' scores in columns
  - Highlights leading player with yellow background
  - Allows switching turns manually or completing the game
- **app/routes/games/compare.$playerOne.$playerTwo.tsx**: Head-to-head player comparison
- **app/routes/anagram.tsx**: Utility for finding anagrams (unrelated to scoring)

### Session Management

**app/session.server.ts**: Cookie-based sessions with helpers:

- `requireUserId()`: Enforces authentication
- `getUser()`: Retrieves current user from session
- `createUserSession()`: Sets cookie after login

### Testing Architecture

**Vitest** (unit tests): Co-located `.test.ts` files using `@testing-library/react` for component tests. Key files:

- app/game-utils.test.ts
- app/models/game.server.test.ts
- app/routes/games/\*.test.tsx

**Cypress** (e2e tests): Located in `cypress/e2e/`:

- **cypress/support/commands.ts**: Custom commands for game workflows:
  - `cy.login()`: Authenticates test user
  - `cy.createGameWithPlayers(players)`: Full game setup flow with player creation
  - `cy.submitScore(score)`: Submits score and waits for navigation
  - `cy.togglePlusScoreSign()`/`cy.toggleNegativeScoreSign()`: Toggle score sign with +/- buttons
  - `cy.checkButtonStates(minusEnabled, plusEnabled)`: Verify button states
  - All commands include proper intercepts and waits for reliability
- Tests use `cy.cleanupUser()` in `afterEach()` to delete test users

**MSW (Mock Service Worker)**: API mocking for development and testing. Configured in `mocks/` directory.

### CI/CD

**GitHub Actions** (.github/workflows/deploy.yml):

- Runs on push to `main` (production) and `dev` (staging) branches
- Jobs: lint → typecheck → vitest → cypress → deploy
- Cypress runs with build server on port 8811
- Auto-deploys to Fly.io after all tests pass

### Styling

- **Tailwind CSS** for all styling
- Custom colors: `blue-primary`, `green-primary/secondary`, `purple-primary/secondary`, `red-primary/secondary`
- Mobile-first responsive design (primary target: iPhone)
- Progressive Web App (PWA) capabilities:
  - `manifest.json` for app installation
  - `apple-touch-icon` for iPhone home screen icon
  - `apple-mobile-web-app-capable` meta tag for standalone mode
  - Routes can override default manifest (e.g., anagram route has custom manifest)

### Important Patterns

1. **Server-side data models**: Files ending in `.server.ts` contain Prisma queries and business logic that only runs on the server
2. **Type safety**: Prisma types (`Game`, `Player`, `Score`) are re-exported from `game.server.ts` for use throughout the app
3. **Progressive enhancement**: Forms work without JavaScript, use Remix's `Form` component and `action` functions
4. **Optimistic UI**: Score input clears immediately on submit before server response
5. **iOS considerations**: Uses `inputMode="numeric"` with +/- buttons instead of negative number input (iOS doesn't show minus key on number pad)
6. **Authorization**: All database queries include userId filtering to ensure users can only access their own data
7. **PWA-first design**: All features should be optimized for mobile use and work when installed as a PWA on iPhone home screen

## Active Technologies
- TypeScript 5.x (existing project stack) + React 18, Remix 2.12.1 (Indie Stack), Tailwind CSS (001-cryptogram-aid)
- N/A (session-only, no database persistence) (001-cryptogram-aid)

## Recent Changes
- 001-cryptogram-aid: Added TypeScript 5.x (existing project stack) + React 18, Remix 2.12.1 (Indie Stack), Tailwind CSS
