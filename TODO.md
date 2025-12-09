# TODO

## Completed

### Database Integration

- [x] Create API layer to connect frontend to SQLite database
- [x] Replace mock data in components with database queries
- [x] Add data mutation functions (create, update, delete)
- [x] Implement user switcher for testing different user perspectives

### Component Refactoring

- [x] Migrate to shadcn/ui for consistent design system
- [x] Extract common UI components to `components/ui/`
- [x] Add Lucide React icons consistently across all components
- [x] Create reusable StatusBadge component (replaces duplicate status logic)
- [x] Create reusable VerificationList component (replaces duplicate verification UI)
- [x] Create reusable UserIdentityCard component with variants (dashboard-grid, dashboard-list, inbox-sidebar)
- [x] Refactor dashboard.tsx to use shared components (369 → 228 lines, -38%)
- [x] Refactor inbox-view.tsx to use shared components (955 → 877 lines)
- [x] Refactor profile-view.tsx to use shared components (1318 → 1204 lines)

### Code Quality

- [x] Fix all linting errors (14 errors -> 0)
- [x] Fix all linting warnings (157 warnings -> 0)
- [x] Move nested component definitions outside parent components
- [x] Fix accessibility issues (semantic buttons, keyboard navigation)
- [x] Add proper TypeScript types throughout

### Navigation & Routing

- [x] Add React Router for URL-based navigation
- [x] Implement proper routes (/profile, /people/:username, /inbox, /settings)
- [x] Add back/forward browser navigation support

### Inbox & Messaging Improvements

- [x] Make user avatars/names in inbox clickable (link to profiles)
- [x] Implement reusable labels system for conversations
- [x] Add labels filter in inbox sidebar
- [x] Add search filter for conversations
- [x] Fix dropdowns to close when clicking outside

### Profile & References

- [x] Make reference author photos/names clickable (link to their profiles)
- [x] Add authorId to references for proper linking
- [x] Fix photo uploads to use local file selection instead of URL prompts

---

## CRITICAL - Stack Migration

### Migrate to Convex (Backend)

- [ ] Set up Convex project
- [ ] Define Convex schema (users, conversations, messages, references, labels)
- [ ] Migrate server handlers to Convex functions
- [ ] Set up real-time subscriptions for messages
- [ ] Remove Drizzle/SQLite dependencies
- [ ] Update all API calls to use Convex client

### Authentication (Clerk)

- [ ] Set up Clerk project
- [ ] Add ClerkProvider + ConvexProviderWithClerk
- [ ] Create login/signup pages
- [ ] Protect routes requiring authentication
- [ ] Sync Clerk users to Convex via webhooks
- [ ] Remove user-switcher (will have real auth)

### Hardcoded Values to Replace

Files with hardcoded data that need real data:

- [ ] `db/seed.ts` - All picsum.photos URLs (placeholder images - will be replaced when users upload real images)
- [x] `db/seed.ts` - Personal info (replaced with generic placeholders)
- [x] `components/settings-view.tsx` - Now loads data from API dynamically
- [x] `constants.ts` - Removed unused mock data (CURRENT_USER, MOCK_USERS, MOCK_INBOX)
- [x] `components/navbar.tsx` - Now shows dynamic unread count from API

---

## High Priority

### Core Features

- [x] Implement reference submission system
  - [x] "Write Reference" button on other users' profiles
  - [x] Reference type selector (Host/Surfer/Personal)
  - [x] Positive/Negative toggle
  - [ ] 14-day window logic (can only write within 14 days of interaction)
  - [ ] "Blind" system (don't see theirs until you write yours or 14 days pass)
- [ ] Location-based search/filtering
- [ ] Map view for browsing nearby hosts (Mapbox or Google Maps)
- [ ] Notification system
  - [x] In-app toasts (shadcn/sonner)
  - [ ] Email notifications (Resend)
  - [ ] Push notifications (optional)

### Content Pages (from courchsurfing-pages/)

Adapt these pages for the app:

- [ ] How It Works (`about-how-it-works.md`) - Onboarding flow
- [ ] Safety Basics (`about-safety.md`) - Trust/safety messaging
- [ ] Our Values (`about-values.md`) - The 5 core values
- [ ] FAQ (`about-faq.md`) - User questions
- [ ] Safety Tips (`about-tips.md`) - Safety guidelines

---

## Medium Priority

### Performance & UX

- [ ] Add TanStack Query for client-side caching (if not using Convex's built-in)
- [ ] Implement lazy loading for images
- [ ] Add pagination for user lists
- [ ] Add loading states/skeletons (shadcn)
- [ ] Add error boundaries

### AI Features (Gemini API)

- [ ] AI-powered tag suggestions for profiles
- [ ] Smart reply suggestions in messages
- [ ] Profile summary generation
- [ ] Travel recommendations

### Testing

- [ ] Set up Vitest
- [ ] Add unit tests for utility functions
- [ ] Add component tests
- [ ] Add integration tests for key flows

---

## Low Priority

### Polish

- [ ] Dark mode
- [ ] Responsive design improvements for mobile
- [ ] Animations with Framer Motion
- [ ] Internationalization (i18n)

### DevOps

- [ ] Deploy frontend to Vercel
- [ ] Set up Convex production environment
- [ ] Configure Clerk production
- [ ] Set up CI/CD pipeline
- [ ] Add environment variable validation

---

## Tech Stack Decision

### Current Stack

- Vite + React + TypeScript
- Drizzle ORM + SQLite (local only, NOT deployable to Vercel)
- React Router
- shadcn/ui + Tailwind CSS

### Target Stack

- **Keep:** Vite + React + TypeScript (no need for Next.js!)
- **Backend:** Convex (replaces Drizzle/SQLite, adds real-time)
- **Auth:** Clerk (integrates with Convex)
- **Hosting:** Vercel (frontend) + Convex Cloud (backend)
- **Keep:** React Router, shadcn/ui, Tailwind CSS

### Why This Works

- Convex has official Vite/React support (not just Next.js)
- Real-time messaging built-in (WebSocket-based)
- Clerk + Convex have first-class integration
- Vercel free tier is generous for frontend-only
- Convex free tier: 1M function calls/month

### Vercel Cost Gotchas to Avoid

- Image optimization charges ($5/1K images) - use Cloudinary or R2 instead
- Serverless function execution time - Convex handles this separately
- Don't put videos in /public - use external hosting
- Disable aggressive link prefetching if needed
