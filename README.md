# DRAII Music

The public music player and admin CMS for draiirynell.com. Built with React, Vite, TypeScript, and Supabase; deployed through Netlify from `main`.

## Local development

Use Node.js and npm. `package-lock.json` is the canonical install lockfile.

```sh
npm ci
npm run dev
```

The Vite app requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. These are public client configuration values; never put a service-role or secret key in a `VITE_` variable. Keep private server credentials in the hosting or Supabase secret store.

## Checks

```sh
npm run typecheck
npm run lint
npm run build
```

The repository currently has pre-existing lint errors. Treat a failing lint run as a release gate until those errors are resolved or a scoped baseline is approved.

## Release smoke test

Before publishing, verify the player on desktop and mobile: play/pause, next/previous, seeking, repeat, audio resume, library tabs/search/no-results, album tracks, song share links, signup states, social links, support flow, and the 404 page. Confirm a release is visible to the public before promoting its Netlify preview. Preserve the last working Netlify deploy for rollback.

Admin content changes should be checked on a preview or nonproduction environment before changing live catalog visibility. Never use production records as disposable test data.
