# Dev workflow notes (Clerk, seeding, and testing)

This note captures the decision discussion about **dev testing**, **seeding**, and whether to **remove Clerk** during development.

## Recommendation (tl;dr)

- **Do not remove Clerk** “for dev”. It tends to create two modes (auth vs no-auth) and causes bugs to slip in at the seam.
- Prefer keeping Clerk in place and improving developer experience with one of the options below.

## Options (least → most work)

### Option A — Vitest + minimal manual checks (low effort)

- Use **Vitest** for regression coverage of key inbox behaviors.
- Do a small amount of manual testing (1–2 accounts) before shipping.

Best when: you can tolerate some manual multi-user testing later.

### Option B — Keep Clerk; streamline local testing (boring + reliable)

- Create 2–3 Clerk test accounts.
- Use **separate browser profiles/incognito windows** to simulate multiple users concurrently.
- (Optional) configure Clerk dev settings to reduce friction (e.g. easier sign-in).

Best when: you want real auth flows exercised with minimal custom code.

### Option C — Dev-only impersonation switcher (best DX, more work)

Add a **strictly dev-only** mechanism to “act as” a chosen user:

- A small UI switcher: “Act as user X”
- Server-side `getViewer()` logic:
  - If Clerk identity exists → use it.
  - If missing and `DEV_IMPERSONATION_ENABLED=true` → use the selected dev user.
  - Hard-disable this in prod (both frontend + backend guardrails).

Best when: you want to iterate fast without constant Clerk logins, but still keep auth-shaped behavior.

## Testing coverage (Vitest)

- Unit tests are useful for catching regressions early, but they **won’t replace** true multi-user + auth testing.
- Current suite includes inbox behavior checks (read receipts, archive, block, notes, accept request).

Run:

```bash
bun run test:run

```text

## Seeding / generating 100 fake users (Convex)

There is a Convex dev seeder in:

- `convex/devSeed.ts`

It can create ~100 users + conversations + messages for stress-testing UI and inbox behavior.

### Why seeding is worth it

- Performance + UI realism (long lists, lots of messages)
- Unread counts, sorting, label filtering
- Edge cases (blocked, archived, requests)

### Guardrail

Seeding is **disabled unless** Convex env var is set:

- `DEV_SEED_ENABLED=true`

(This is intentional to avoid accidentally seeding a shared/prod deployment.)

## Suggested path

If the goal is “ship-quality messaging” with good dev velocity:

- Start with **Option B** (fast, reliable).
- If Clerk friction continues, move to **Option C** (dev impersonation) with strong guardrails.
