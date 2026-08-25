export type ProtectedRouteOptions = {
	/** `event.route.id` — matched by prefix against `protectedRoutes`. */
	routeId: string | null | undefined;
	/** `event.url` — used to build the `redirect` query parameter. */
	url: URL;
	/** Route-id prefixes that require a session, e.g. `['/(app)']`. */
	protectedRoutes?: string[] | null;
	/** Where to send unauthenticated visitors, e.g. `/login`. */
	loginPath: string;
	/** Whether the current request carries a valid session. */
	authenticated: boolean;
	/** Session cookies to expire on redirect, e.g. `['pb_auth']`. */
	clearCookies?: string[];
};

const expire = (name: string) =>
	`${name}=; Path=/; HttpOnly; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;

/**
 * Redirect unauthenticated requests for a protected route to the login page,
 * preserving the original destination in a `redirect` query parameter.
 *
 * Returns `null` when the request may proceed.
 */
export const protectedRouteRedirect = ({
	routeId,
	url,
	protectedRoutes,
	loginPath,
	authenticated,
	clearCookies = []
}: ProtectedRouteOptions): Response | null => {
	if (!protectedRoutes?.length || authenticated) return null;
	if (!routeId || !protectedRoutes.some((route) => routeId.startsWith(route))) return null;

	const redirect = encodeURIComponent(url.pathname + url.search);
	const headers = new Headers({ location: `${loginPath}?redirect=${redirect}` });

	// append, not set — a redirect may need to expire several cookies.
	for (const name of clearCookies) headers.append('set-cookie', expire(name));

	return new Response(null, { status: 302, headers });
};
