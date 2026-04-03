# Naughty Network

## Current State
- Admin panel uses URL-based media (paste thumbnail/video URL)
- `StorageClient` exists with blob upload code but `uploadBlobTree` uses broken `OwnerEgressSignature` auth format
- `getCertificate` makes raw agent calls bypassing the Backend actor (root cause of all past failures)
- Episode video field only accepts a URL string
- No file upload capability anywhere in the admin panel

## Requested Changes (Diff)

### Add
- Video file upload button in the episode add/edit forms (alongside existing URL field)
- A `useStorageClient` hook that returns a `StorageClient` properly wired to the Backend actor
- A `VideoUploadButton` component that lets admin pick a local video file, uploads it via StorageClient, and populates the video URL field with the resulting blob URL

### Modify
- `StorageClient.uploadBlobTree`: change auth from `OwnerEgressSignature` (broken) to `OwnerCanisterMethod` with `{ method, blob_hash }` returned from the Backend actor
- `StorageClient.getCertificate`: instead of raw `agent.call()`, accept a callback function that calls the Backend actor properly
- `config.ts`: wire the StorageClient's certificate function to use `actor._caffeineStorageCreateCertificate`
- `EpisodeForm` and `EpisodeEditForm` in AdminPage: add a file upload button that shows upload progress and populates the `videoUrl` field

### Remove
- Nothing removed; URL-based input stays as a fallback

## Implementation Plan
1. Fix `StorageClient`: change `getCertificate` to accept a callback; change `uploadBlobTree` to use `OwnerCanisterMethod`
2. Update `config.ts` `createActorWithConfig` to wire the cert callback using the actor
3. Add `useStorageClient` hook in `useQueries.ts` to expose the StorageClient to components
4. Add `VideoUploadButton` component in AdminPage that handles file pick, upload, progress display
5. Wire `VideoUploadButton` into `EpisodeForm` and `EpisodeEditForm`
