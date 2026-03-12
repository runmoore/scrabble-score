# PillToggle Component

## Purpose

Reusable toggle pill component for radio and checkbox inputs, styled as rounded pill buttons with color-coded checked states. Used across the app for filter controls and selection groups.

## Requirements

### Requirement: PillToggle component API

The `PillToggle` component SHALL accept the following required props: `id` (string), `name` (string), `value` (string), `type` (`"radio"` | `"checkbox"`), `color` (`PillColor`), and `children` (React.ReactNode). Optional props SHALL include `form` (string), `onChange` (event handler), and `defaultChecked` (boolean).

#### Scenario: Rendering a radio pill

- **WHEN** `PillToggle` is rendered with `type="radio"`
- **THEN** the component SHALL render a visually-hidden `<input type="radio">` with a styled `<label>` as its sibling
- **AND** the label SHALL be associated with the input via matching `id`/`htmlFor` attributes

#### Scenario: Rendering a checkbox pill

- **WHEN** `PillToggle` is rendered with `type="checkbox"`
- **THEN** the component SHALL render a visually-hidden `<input type="checkbox">` with a styled `<label>` as its sibling

### Requirement: PillToggle color system

The component SHALL support a `color` prop typed as `PillColor` (union of `"blue"` | `"purple"`). The color mapping SHALL be implemented as a `Record<PillColor, string>` to guarantee compile-time exhaustiveness.

#### Scenario: Blue color when checked

- **WHEN** a pill with `color="blue"` is checked
- **THEN** the label SHALL display `bg-blue-primary` background with white text via `peer-checked:` classes

#### Scenario: Purple color when checked

- **WHEN** a pill with `color="purple"` is checked
- **THEN** the label SHALL display `bg-purple-primary` background with white text via `peer-checked:` classes

#### Scenario: Unselected state

- **WHEN** a pill is not checked (regardless of color)
- **THEN** the label SHALL display `bg-gray-100 text-gray-700` (light mode) or `bg-gray-700 text-gray-200` (dark mode)

### Requirement: PillToggle base styling

All pill labels SHALL apply consistent base classes: `cursor-pointer`, `select-none`, `rounded-full`, `px-4 py-2`, `text-sm font-medium`, `transition-colors`, and `[-webkit-tap-highlight-color:transparent]`.

#### Scenario: Consistent pill appearance

- **WHEN** any `PillToggle` is rendered
- **THEN** the label SHALL have rounded-full shape, small/medium text, and pointer cursor
- **AND** tap highlight SHALL be suppressed for iOS

### Requirement: PillToggle peer scoping

`PillToggle` SHALL render its input and label as a fragment (`<>`), delegating wrapper responsibility to the caller. The caller SHALL wrap each `PillToggle` in a `<div>` to scope the Tailwind `peer` modifier correctly when multiple pills are adjacent.

#### Scenario: Multiple adjacent pills

- **WHEN** multiple `PillToggle` components are rendered as siblings in a flex container
- **THEN** each pill SHALL be wrapped in a caller-provided `<div>` so that each pill's checked state only affects its own label, not adjacent labels
