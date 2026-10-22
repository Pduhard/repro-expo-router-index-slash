# expo-router puts a slash before the query of a group's index after `setParams`

`app/foo/(group)/index.tsx` is served at `/foo`. After `router.setParams({ q: '2' })` on it, the browser shows `/foo/?q=2` instead of `/foo?q=2`.

## Run

```sh
pnpm install
pnpm test     # expo export -p web, then Playwright reads the address bar
```

Expo SDK 58, expo-router 58.0.25, web, no other dependency:

| case | expected | main | with-fix |
|---|---|---|---|
| link to `/foo` (group index, no query) | `/foo` | ✓ | ✓ |
| link to `/foo?q=1` | `/foo?q=1` | ✓ | ✓ |
| load `/foo?q=1` directly | `/foo?q=1` | ✓ | ✓ |
| `router.setParams({ q: '2' })` on `/foo` | `/foo?q=2` | ✗ `/foo/?q=2` | ✓ |
| link to `/bar?q=1` (index, no group) | `/bar?q=1` | ✓ | ✓ |
| `router.setParams({ q: '2' })` on `/bar` | `/bar?q=2` | ✓ | ✓ |

The same happens with `<Stack />` in the group layout, and on expo-router 57.0.29.

## Cause

[`getPathFromState`](https://github.com/expo/expo/blob/main/packages/expo-router/src/fork/getPathFromState.ts) adds `/` after each nested state, and an `index` route adds an empty segment, so the path ends with `/foo/`.
It then appends the query (`/foo/?q=2`), and only after that removes the trailing slash with `path.replace(/\/$/, '')`.
With a query, the slash is no longer at the end, so it stays.

A link or a direct load keeps the URL it was given. `setParams` changes the params, so the URL is serialized again from the state.

## Fix

Branch [`with-fix`](../../tree/with-fix) (`patches/`): keep the query aside and append it after the trailing-slash cleanup.
