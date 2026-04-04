# Naughty Network

## Current State
The app has a custom username/password auth system. Currently ALL routes are protected behind AuthGuard -- users are redirected to /login immediately on page load. ShowCard still imports useInternetIdentity instead of useAuth. The backend getAllShows calls .sort() with no comparator which traps at runtime after a show is created, causing "Sign up failed" errors (signup triggers an auto-login which calls getAllShows). 

## Requested Changes (Diff)

### Add
- Auth modal (signup/login) that appears when a logged-out user clicks Play or tries to watch a show on ShowPage
- Sign In button visible on navbar for logged-out users (already exists, keep)

### Modify
- App.tsx: Remove AuthGuard from homepage (/), series (/series), and show page (/show/$id) routes -- these should be publicly browseable. Keep AuthGuard only on /my-list, /profile, /admin.
- ShowCard.tsx: Replace useInternetIdentity with useAuth for auth state
- ShowPage.tsx: When logged-out user tries to interact with the video player (or episode list), show an auth modal instead of playing. Show details, thumbnails, description, episode list titles are all visible without login. Only actual video playback is gated.
- backend/main.mo: Fix getAllShows -- change results.toArray().sort() to results.toArray().sort(Show.compare) to prevent runtime trap

### Remove
- useInternetIdentity import from ShowCard.tsx

## Implementation Plan
1. Fix backend getAllShows sort comparator
2. Update App.tsx routing -- public routes for /, /series, /show/$id; protected for /my-list, /profile, /admin
3. Fix ShowCard.tsx to use useAuth instead of useInternetIdentity
4. Add AuthModal component (reuses LoginPage form logic in a Dialog)
5. Update ShowPage.tsx to show AuthModal when logged-out user clicks play/episode
