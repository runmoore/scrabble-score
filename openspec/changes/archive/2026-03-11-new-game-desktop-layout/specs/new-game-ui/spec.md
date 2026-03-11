## MODIFIED Requirements

### Requirement: Section layout with Card grouping

The new game page SHALL organize its content into visually distinct sections using the existing Card component. Sections SHALL include: game type selection, player selection.

The page container SHALL use `max-w-lg` on mobile viewports and `max-w-4xl` at the `lg:` breakpoint and above.

At the `lg:` breakpoint and above, the Game Type and Players Card sections SHALL be displayed side-by-side in a two-column grid layout with equal-width columns. Below the `lg:` breakpoint, the cards SHALL remain stacked vertically (single column).

The Start Game button SHALL be positioned below both Card sections, spanning the full width of the container at all breakpoints.

#### Scenario: Visual grouping

- **WHEN** the new game page is rendered
- **THEN** the game type selection and player selection SHALL each be contained within a Card component with a section heading

#### Scenario: Desktop two-column layout

- **WHEN** the viewport width is at or above the `lg:` breakpoint (1024px)
- **THEN** the Game Type card and Players card SHALL be displayed side-by-side in a two-column grid
- **AND** each card SHALL occupy equal width
- **AND** the page container SHALL use `max-w-4xl`

#### Scenario: Mobile single-column layout

- **WHEN** the viewport width is below the `lg:` breakpoint
- **THEN** the Game Type card and Players card SHALL be stacked vertically
- **AND** the page container SHALL use `max-w-lg`

#### Scenario: Start Game button positioning

- **WHEN** the new game page is rendered at any viewport width
- **THEN** the Start Game button SHALL appear below both Card sections
- **AND** the button SHALL span the full width of the container

#### Scenario: Cards with unequal content height on desktop

- **WHEN** one Card section has more content than the other (e.g., many players vs few game types)
- **THEN** each card SHALL size to its own content height (not stretch to match the taller card)
