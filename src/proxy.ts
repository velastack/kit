import type { RequestEvent } from '@sveltejs/kit';

/**
 * Forward the current request to `urlPath` and return the upstream response
 * as-is.
 *
 * Hop-by-hop and length headers are stripped, and `accept-encoding` is pinned
 * to `identity` so the body can be streamed through untouched.
 */
export const proxy = async (urlPath: string, event: RequestEvent) => {
	const proxiedUrl = new URL(urlPath);

	// Copy rather than mutate: `event.request.headers` is visible to every later
	// hook in the chain, and callers do not expect a proxy to rewrite it.
	const headers = new Headers(event.request.headers);

	headers.delete('connection');

	headers.delete('host');
	headers.append('host', proxiedUrl.hostname);

	headers.delete('accept-encoding');
	headers.append('accept-encoding', 'identity');

	headers.delete('content-length');

	const res = await fetch(proxiedUrl, {
		method: event.request.method,
		headers,
		body: event.request.body,
		...(event.request.body ? { duplex: 'half' } : {})
	});

	return new Response(res.body, {
		headers: res.headers,
		status: res.status,
		statusText: res.statusText
	});
};
