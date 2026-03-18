## MODIFIED Requirements

### Requirement: Stats card grid layout

The player overview stats cards display in a responsive grid: 2 columns on mobile and tablet, 3 columns on desktop.

#### Scenario: Viewing player stats on mobile

- **WHEN** the viewport is below the `md` breakpoint (< 768px)
- **THEN** the stats cards grid displays in 2 columns

#### Scenario: Viewing player stats on tablet

- **WHEN** the viewport is at or above the `md` breakpoint (≥ 768px) and below `lg` (< 1024px)
- **THEN** the stats cards grid displays in 2 columns

#### Scenario: Viewing player stats on desktop

- **WHEN** the viewport is at or above the `lg` breakpoint (≥ 1024px)
- **THEN** the stats cards grid displays in 3 columns
