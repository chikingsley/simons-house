# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2025-12-10

### Added

- **Theming & Resilience**
  - Introduced global `ThemeProvider`/`ThemeToggle` (light/dark) and set default color scheme in `index.html`
  - Added app/section error boundaries via `AppErrorBoundary`/`SectionErrorBoundary`
- **UI Enhancements**
  - Added motion animation helpers and skeleton loaders for user cards with improved dashboard loading states
  - Expanded dark-mode styling across navbar, dashboard, inbox, profile, settings, status badges, and identity cards
- **Data & Flow**
  - Implemented paginated `/api/users` (limit/offset) with dashboard "Load more" controls and seeded 30 mock users
  - Added interaction history check endpoint plus gated "Write reference" modal that submits references through `api.createReference`
- **Tooling & Tests**
  - Set up Vitest + Testing Library (jsdom, coverage) with tests for API client, status badges, skeletons, and utilities

### Changed

- Made the user switcher draggable and fetch all users via the paginated API
- Conversation queries now include both sent and received threads and annotate incoming requests

## [0.1.0] - 2025-12-08

### Added

- **Linting & Code Quality**
  - Added `bun lint` script that runs TypeScript type checking and Ultracite/Biome linting
  - Added `bun lint:fix` to auto-fix linting issues
  - Added `bun typecheck` for standalone type checking
  - Configured Biome with sensible defaults for React projects
  - Files renamed to kebab-case for consistency (App.tsx -> app.tsx, etc.)

- **Database Setup**
  - Added SQLite database with Drizzle ORM using bun:sqlite
  - Created database schema for:
    - `users` - User profiles with verification status, interests, home details
    - `references` - User references/reviews
    - `conversations` - Chat threads between users
    - `messages` - Individual messages within conversations
    - `settings` - User settings and preferences
  - Added seed script (`bun db:seed`) with realistic mock data
  - Added Drizzle Kit for database management (`bun db:push`, `bun db:studio`)

- **Project Structure**
  - Organized components in kebab-case naming convention
  - Set up path alias `@/` for cleaner imports

### Fixed

- Fixed all TypeScript errors (project now type-checks cleanly)
- Fixed formatting issues across all source files
- Added missing `alt` attributes to images for accessibility
- Added `type="button"` to buttons to prevent form submission issues
- Replaced invalid anchor hrefs with proper button elements

### Changed

- Migrated from better-sqlite3 to bun:sqlite for Bun compatibility
- Updated button and interactive element accessibility
