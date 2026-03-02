# Daily Routine Tracker

## Current State
- Full-stack gamified habit tracker with Internet Identity authentication
- Dashboard showing today's tasks, coins, streak, level
- Task management (create, update, delete) with categories and coin rewards
- Stats page, achievements, settings with dark/light mode

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- **Backend `initialize()`**: Remove admin-only restriction. Make it idempotent -- anyone can call it, it only sets up state if not already done. This unblocks all regular users.
- **Frontend App.tsx**: Remove the `initialized` state guard from `isLoading`. The UI should show content as soon as the actor and data are ready, not waiting for `initialize()` to resolve with admin success.
- **Frontend Dashboard.tsx**: Replace the raw principal ID display (`mp4fn...xxxx`) with a friendly label. Since Internet Identity doesn't expose a display name, derive a short readable alias from the principal (e.g. "Adventurer #1234" using last 4 chars), or simply show "Welcome back!" or use the first segment of the principal as a username-like string.

### Remove
- Nothing

## Implementation Plan
1. Regenerate backend with `initialize()` open to all callers (idempotent, no auth check)
2. In `App.tsx`: remove `initialized` state and the `initialize()` effect; pass no `initialized` prop to Dashboard
3. In `Dashboard.tsx`: remove `initialized` from props and `isLoading` condition; show a friendly name derived from the principal instead of the raw truncated principal string
