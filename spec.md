# Naughty Network

## Current State

The app uses Internet Identity (ICP's built-in auth) for user login. There is no username/password system. The backend stores user profiles by Principal ID and has `registerUser`, `saveCallerUserProfile`, and `getAllUsers` functions. The admin panel's Users tab polls `getAllUsers` every 5 seconds to show registered users.

Currently, users must authenticate via Internet Identity (a browser popup to ICP identity service). This is being replaced entirely with a custom username/password system.

## Requested Changes (Diff)

### Add
- `signUp(username: Text, passwordHash: Text)` backend function: creates a new user account with a username (must be unique) and a hashed password. Returns success or error message.
- `login(username: Text, passwordHash: Text)` backend function: validates credentials, returns a session token (random Text) on success or null on failure.
- `validateSession(token: Text)` backend query: checks if a session token is valid, returns the associated username or null.
- `logout(token: Text)` backend function: invalidates the session token.
- `getUserByUsername(username: Text)` backend query (admin only): gets a user record by username.
- Store all users in a new stable map `usersV1: Map<Text, UserAccount>` where key is username.
- Store all sessions in `sessions: Map<Text, Text>` where key is token and value is username.
- `UserAccount` type: `{ username: Text; passwordHash: Text; createdAt: Int }`
- `getAllUsersV2` backend function: returns all registered accounts as array of `{ username: Text; createdAt: Int }` -- no password hashes exposed.
- Frontend: `LoginPage.tsx` -- A dedicated full-screen page with Naughty Network branding. Has two tabs: "Sign In" and "Create Account". Sign In asks for username + password. Create Account asks for username + password + confirm password. Password min 8 characters. On successful signup, immediately redirect to homepage AND the user shows up in admin live users list.
- Frontend: `useAuth` hook (`useAuth.ts`) -- Manages login state in React. Stores session token + username in `localStorage`. Provides `login`, `signUp`, `logout`, `isLoggedIn`, `username`, and `sessionToken` properties. On page load, validates stored session token with backend.
- Gating: Any route except `/login` and `/` redirects unauthenticated users to `/login`.
- Admin panel live users: On signup, the new user appears instantly in the Users tab (polling every 2 seconds instead of 5).

### Modify
- Remove Internet Identity (`useInternetIdentity.ts`) from all usage in components (Navbar, ProfilePage, AdminPage, HomePage, ShowPage, MyListPage).
- Replace all `useInternetIdentity` calls with `useAuth` hook.
- `Navbar.tsx`: show the logged-in username (or a profile icon with username) and a logout button instead of the II login button.
- `AdminPage.tsx`: User management tab polls `getAllUsersV2` instead of `getAllUsers`, shows username and join date.
- Backend `registerUser` and `saveCallerUserProfile` can remain for legacy compatibility but are no longer called from the new auth flow.
- Password hashing: done on the frontend with SHA-256 (Web Crypto API) before sending to backend -- never send plaintext passwords.
- All backend calls that previously required an ICP identity/principal now just need a valid session token. The `createShow`, `createEpisode`, etc. functions do not require auth changes since admin uses password `20417` separately.

### Remove
- Internet Identity login button from Navbar.
- `useInternetIdentity` usage from all pages/components.
- The old `getAllUsers` function can stay for migration but `getAllUsersV2` is used by the frontend going forward.

## Implementation Plan

1. **Backend**: Add `UserAccount` type, `usersV1` stable map, `sessions` stable map. Add `signUp`, `login`, `validateSession`, `logout`, `getAllUsersV2` functions. Keep existing show/episode/watchlist functions unchanged.
2. **Frontend auth hook**: Create `src/frontend/src/hooks/useAuth.ts` -- wraps localStorage session token, calls backend `signUp`/`login`/`validateSession`/`logout`.
3. **Login page**: Create `src/frontend/src/pages/LoginPage.tsx` -- cinematic dark branded page with Sign In / Create Account tabs.
4. **Route guard**: In `App.tsx`, add `/login` route, and wrap protected routes so unauthenticated users redirect to `/login`.
5. **Navbar update**: Replace II login button with username + logout button using `useAuth`.
6. **Admin Users tab**: Switch to `getAllUsersV2`, poll every 2 seconds, show username + join date.
7. **Remove II**: Remove `useInternetIdentity` imports from all components that no longer need it.
