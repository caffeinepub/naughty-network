# Naughty Network

## Current State
The app uses a custom username/password auth system (on-chain). Users sign up with username + SHA-256 hashed password stored in `usersV1` map, with session tokens in a `sessions` map. The `useAuth` hook manages session tokens stored in localStorage. The `LoginPage` has two tabs: Sign In and Create Account, both using username/password forms. `config.ts` has a broken `ExternalBlob` import and calls `createActor` with 4 arguments (upload/download handlers) which don't exist, breaking actor initialization.

## Requested Changes (Diff)

### Add
- Backend: `registerWithII(username: Text) : async { #ok : Text; #err : Text }` -- registers a new username for the caller's II principal. Stores `principalId -> username` mapping.
- Backend: `getUsernameByPrincipal() : async ?Text` -- returns the stored username for the calling principal (null if not set yet).
- Frontend: `UsernameSetupPage` -- full-screen page shown after first II login when user has no username yet. Lets user pick a username (3-20 chars, letters/numbers/underscores). On save, calls `registerWithII`, then navigates to homepage.
- Frontend: Updated `useAuth` hook using Internet Identity (via `useInternetIdentity`) instead of username/password. Auth flow: (1) login with II, (2) check if principal has a username, (3) if no username, redirect to username setup, (4) if username exists, proceed as logged in.
- Frontend: Updated `LoginPage` -- single "Sign in with Internet Identity" button, no username/password form.

### Modify
- Backend: Keep all existing show/episode/watchlist/progress methods intact. Keep `usersV1` / `signUp` / `login` / `validateSession` for backwards compat but add the new II-based methods.
- Backend: `getAllUsersV2` should return II-registered users (principalId -> username map) in addition to or instead of the old usersV1 map.
- Frontend: `useAuth.ts` -- replace username/password session management with II identity + username lookup. `isLoggedIn` = has II identity AND has username. `username` = the stored username for their principal.
- Frontend: `config.ts` -- fix broken `ExternalBlob` import (remove it) and fix `createActor` call to only pass `(canisterId, options)` with proper agent.
- Frontend: `App.tsx` -- wrap app in `InternetIdentityProvider`. Route `/username-setup` as a semi-protected route (requires II identity but not username).
- Frontend: `Navbar.tsx` -- show username from II auth. Sign out clears II identity.
- Frontend: `AdminPage.tsx` -- users tab should use `getAllUsersV2` which now includes II-registered users.

### Remove
- Frontend: Username/password form from `LoginPage` (both Sign In and Create Account tabs).
- Frontend: `signUp`, `login`, `logout`, `validateSession` usage from `useAuth.ts` (replace with II flow).

## Implementation Plan
1. Add `registerWithII` and `getUsernameByPrincipal` to backend Motoko. Store a `principalUsernames: Map<Principal, Text>` and update `getAllUsersV2` to include these users.
2. Update `backend.d.ts` and `backend.ts` IDL to include new methods.
3. Fix `config.ts` to remove `ExternalBlob` import and pass only `(canisterId, options)` to `createActor`.
4. Rewrite `useAuth.ts` to use II identity: on init, check II auth state; if authenticated, call `getUsernameByPrincipal`; expose `isLoggedIn` (has identity + username), `needsUsername` (has identity but no username), `username`, `login()` (triggers II popup), `logout()` (clears II).
5. Add `UsernameSetupPage` component -- shown when `needsUsername` is true, calls `registerWithII`, then sets username in auth state.
6. Rewrite `LoginPage` to show only the II login button.
7. Update `App.tsx` to wrap in `InternetIdentityProvider` and add username-setup route.
8. Update `Navbar.tsx` to show username and use II logout.
