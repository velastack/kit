import type { Handle } from '@sveltejs/kit';
import { errorPage } from './error-page.js';

/** Paths a `vela` command creates, mapped to the command that creates them. */
export type GeneratedPages = Readonly<Record<string, string>>;

/**
 * Legal pages. Every template's footer links to these before they exist, so
 * every template — backend or not — can hit a 404 on them.
 */
export const LEGAL_PAGES: GeneratedPages = {
	'/privacy': 'vela legal privacy',
	'/terms': 'vela legal terms'
};

/** Auth pages. Only a project with a backend can generate these. */
export const AUTH_PAGES: GeneratedPages = {
	'/login': 'vela enable auth',
	'/signup': 'vela enable auth'
};

/**
 * A 404 naming the command that creates `pathname`, or `null` when nothing
 * generates it and the caller should pass its own 404 through.
 *
 * Standalone HTML rather than `error()`: the app's `+error.svelte` renders
 * inside a layout whose load never ran for this request, so it would have no
 * data to render with.
 */
export const generatedPageResponse = (pathname: string, pages: GeneratedPages): Response | null => {
	const command = pages[pathname];
	if (!command) return null;

	return new Response(errorPage(404, `Run <code>${command}</code> to create this page.`), {
		status: 404,
		headers: { 'Content-Type': 'text/html' }
	});
};

/**
 * The whole server hook for a project with no backend: in dev, answer a 404 on
 * a page `vela` can generate with the command that generates it.
 *
 * Takes no options — there is no backend to point it at. A backend project gets
 * the same behaviour, plus the auth pages, from `handlePocketbase`.
 *
 * Dev-only because a static build has no server: there the hook runs only at
 * prerender time, where the hint must not reach the prerendered output.
 */
export const handleStatic = (): Handle => {
	return async ({ event, resolve }) => {
		const response = await resolve(event);

		if (process.env.NODE_ENV !== 'development' || response.status !== 404) return response;

		return generatedPageResponse(event.url.pathname, LEGAL_PAGES) ?? response;
	};
};
