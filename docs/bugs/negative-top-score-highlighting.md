# Bug: Leader not highlighted when all scores are negative

## Summary

When all players have negative total scores, the leading player is not highlighted with the yellow background. Verified on the completed game page — Alex (-4) vs Nora (-8), neither column is highlighted. Alex should be.

## Root Cause

`ScoreTable.tsx` checks `player.totalScore === topScore && player.totalScore > 0`. The `> 0` guard exists to suppress highlighting when no scores have been submitted yet (all players at 0), but it also suppresses highlighting for any negative leader.

Additionally, the play page loader computes `topScore` using `reduce` with an initial value of `0`, so a negative top score is never even passed to the component.

## Fix

The `> 0` check needs to be smarter — it should suppress highlighting only when there are genuinely no scores yet (e.g., check that at least one player has scores), not based on the sign of the total. The play page loader also needs its `reduce` initial value fixed (use `-Infinity` or the first player's score).

## Affected Code

- `app/components/ScoreTable.tsx:25` — `player.totalScore > 0` guard
- `app/routes/games/$gameId.play.$playerId.tsx:38-41` — loader `topScore` reduce with initial value `0`
