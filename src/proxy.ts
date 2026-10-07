import type { RequestEvent } from '@sveltejs/kit';

/**
 * The visitor's address, or null when there is none to give. `getClientAddress()`
 * throws while prerendering, and under adapter-node when `ADDRESS_HEADER` is set
 * but the request lacks it.
 */
const clientAddress = (event: RequestEvent): string | null => {
	try {
		return event.getClientAddress() || null;
	} catch {
		return null;
	}
};

/**
 * Forward the current request to `urlPath` and return the upstream response
 * as-is.
 *
 * Hop-by-hop and length headers are stripped, `accept-encoding` is pinned
 * to `identity` so the body can be streamed through untouched, and
 * `x-forwarded-for` is set from `event.getClientAddress()`.
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

	// Whatever X-Forwarded-For came in is the client's to write unless a proxy
	// in front replaced it, so say who is asking from what SvelteKit resolved.
	headers.delete('x-forwarded-for');
	const address = clientAddress(event);
	if (address) headers.set('x-forwarded-for', address);

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
