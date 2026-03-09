## MODIFIED Requirements

### Requirement: Dashboard grid layout

The games index page SHALL use a responsive card grid layout consistent with the compare page. Cards SHALL display in a single column on mobile, two columns on tablet, and three columns on desktop. The stats cards (Most Popular Games, Most Active Players) SHALL be displayed alongside the existing dashboard cards within the same grid.

#### Scenario: Mobile layout

- **WHEN** the page is viewed on a mobile-width viewport
- **THEN** all cards including stats cards stack in a single column

#### Scenario: Desktop layout

- **WHEN** the page is viewed on a desktop-width viewport
- **THEN** cards including stats cards are arranged in up to three columns
