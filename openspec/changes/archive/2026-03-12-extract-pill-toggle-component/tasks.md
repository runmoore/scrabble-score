## 1. Create PillToggle component

- [x] 1.1 Create `app/components/PillToggle.tsx` with `PillColor` type, `pillBase`/`pillUnselected` constants, `colorClasses` record, and `PillToggle` function component
- [x] 1.2 Export `PillToggle` as a named export

## 2. Refactor new.tsx to use PillToggle

- [x] 2.1 Import `PillToggle` from `~/components/PillToggle`
- [x] 2.2 Replace game type radio pill markup with `<PillToggle type="radio" color="blue" ...>`
- [x] 2.3 Replace player checkbox pill markup with `<PillToggle type="checkbox" color="purple" ...>`
- [x] 2.4 Remove `pillBase` and `pillUnselected` local variables from `NewGamePage`

## 3. Verification

- [x] 3.1 Run `npm run typecheck` — no type errors
- [x] 3.2 Run `npm run lint` — no lint errors
- [x] 3.3 Run `npm test -- --run` — all existing tests pass
- [ ] 3.4 Visual regression check: game type pills render identically (blue selected state, gray unselected)
- [ ] 3.5 Visual regression check: player pills render identically (purple selected state, gray unselected)
