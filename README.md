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

## License

MIT
