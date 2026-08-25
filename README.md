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

## License

MIT
