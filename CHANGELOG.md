# Changelog

All notable changes to this project will be documented in this file.

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
