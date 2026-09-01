# @velastack/kit

Backend-agnostic SvelteKit plumbing shared by Velastack's backend bindings
(`@velastack/pocketbase` and friends). Nothing here knows about any particular
database or backend.

```sh
npm install @velastack/kit
```

## `Match<RouteId>`

Turns a SvelteKit route id into the shape of the URLs that match it — route
groups are stripped, `[param]` segments widen to `string`. Useful for keeping
test URLs honest:

```ts
import type { Match } from '@velastack/kit';
import type { RouteId } from './$types';

const res = await context.request.get('/dashboard' satisfies Match<RouteId>);
```

Segments SvelteKit lets match zero segments — `[[optional]]` and `[...rest]` —
widen to a union that includes the variant where the segment is absent, so both
of these hold for `/[[lang]]/blog`:

```ts
'/blog' satisfies Match<'/[[lang]]/blog'>;
'/en/blog' satisfies Match<'/[[lang]]/blog'>;
```

The widening is deliberately loose — `string` also spans `/`, so a URL with
extra segments can still satisfy a single `[param]`.

## `proxy(url, event)`

Forwards the current request to `url` and returns the upstream response. Strips
hop-by-hop headers and pins `accept-encoding: identity` so the body streams
through untouched. The incoming `event.request.headers` is copied, never
mutated.

## `protectedRouteRedirect(options)`

Returns a 302 to `loginPath` (with the original destination in a `redirect`
query parameter) when an unauthenticated request matches one of
`protectedRoutes` by route-id prefix, or `null` when the request may proceed.

```ts
protectedRouteRedirect({
	routeId: event.route.id,
	url: event.url,
	protectedRoutes: ['/(app)'],
	loginPath: '/login',
	authenticated: pb.authStore.isValid,
	clearCookies: ['pb_auth']
});
```

## `errorPage(status, message)`

A standalone HTML error page styled for both colour schemes. `message` is
interpolated as **trusted HTML**, not escaped — never pass user input to it.

## Generated pages

Templates link to pages a `vela` command has yet to create — the footer points
at `/privacy` and `/terms`, the navbar at `/login`. `LEGAL_PAGES` and
`AUTH_PAGES` map those paths to the command that creates them, and
`generatedPageResponse(pathname, pages)` turns one into a 404 that says so (or
returns `null`, leaving the caller's own 404 alone).

`handleStatic()` is the whole server hook for a project with no backend: in dev
it answers a 404 on a legal page with the command that generates it, and does
nothing otherwise. It takes no options — there is no backend to point it at.

```ts
// src/hooks.server.ts
import { handleStatic } from '@velastack/kit';

export const handle = handleStatic();
```

A backend project gets the same behaviour, plus the auth pages, from
`handlePocketbase`.

## `dataDir()` / `dataPath(...)`

```ts
import { dataPath } from '@velastack/kit/server';
```

Where the app keeps state that has to outlive a release: its own SQLite
database, uploaded files, anything it writes and expects to find again.

```ts
const db = new Database(dataPath('app.sqlite'));
const uploads = dataPath('uploads');
```

`vela` sets `VELA_DATA_DIR` everywhere it runs an app — `vela dev`, `vela
build`, and the environment written on each deploy — so the same call answers
`<project>/data` in a checkout and `/var/lib/vela/apps/<id>/shared/pb_data` on a
server. Both are directories that survive a deploy. With nothing in the
environment it falls back to `data/` under the working directory, which is what
a bare `vitest` run or a hand-run script wants.

Deriving the path from `process.cwd()` instead is the mistake this replaces: the
working directory is the project root during development but a _release_
directory in production, so the database lands somewhere the next deploy leaves
behind, the pruner later deletes, and no backup ever captured.

On a server with a backend this is PocketBase's own directory, so `vela backup`
captures whatever the app put there and `vela restore` replaces it.

Imported from `@velastack/kit/server`, not the package root: it reads
`node:path`, and the root entry point stays free of anything that cannot be
bundled for a browser.

## License

MIT
