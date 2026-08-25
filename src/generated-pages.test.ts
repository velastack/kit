import { describe, it, expect, afterEach } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { AUTH_PAGES, LEGAL_PAGES, generatedPageResponse, handleStatic } from './generated-pages.js';

const nodeEnv = process.env.NODE_ENV;

afterEach(() => {
	process.env.NODE_ENV = nodeEnv;
});

/** Just enough of a `RequestEvent` for the hook: it only reads the pathname. */
const eventFor = (pathname: string) =>
	({ url: new URL(`https://example.com${pathname}`) }) as RequestEvent;

const resolveWith = (status: number) => async () => new Response(null, { status });

describe('generatedPageResponse', () => {
	it('names the command that creates the page', async () => {
		const res = generatedPageResponse('/privacy', LEGAL_PAGES);
		expect(res?.status).toBe(404);
		expect(res?.headers.get('Content-Type')).toBe('text/html');
		expect(await res!.text()).toContain('<code>vela legal privacy</code>');
	});

	it('returns null for a path nothing generates', () => {
		expect(generatedPageResponse('/nope', LEGAL_PAGES)).toBeNull();
	});

	it('only knows the pages it was handed', () => {
		expect(generatedPageResponse('/login', LEGAL_PAGES)).toBeNull();
		expect(generatedPageResponse('/login', { ...LEGAL_PAGES, ...AUTH_PAGES })).not.toBeNull();
	});
});

describe('handleStatic', () => {
	it('replaces a dev 404 on a generated page', async () => {
		process.env.NODE_ENV = 'development';
		const res = await handleStatic()({
			event: eventFor('/terms'),
			resolve: resolveWith(404)
		});
		expect(res.status).toBe(404);
		expect(await res.text()).toContain('<code>vela legal terms</code>');
	});

	it('passes a dev 404 on any other page through', async () => {
		process.env.NODE_ENV = 'development';
		const res = await handleStatic()({
			event: eventFor('/missing'),
			resolve: resolveWith(404)
		});
		expect(await res.text()).toBe('');
	});

	// A static build has no server, so the only place this could fire outside dev
	// is prerendering — where the hint would be baked into the output.
	it('is inert outside dev', async () => {
		process.env.NODE_ENV = 'production';
		const res = await handleStatic()({
			event: eventFor('/privacy'),
			resolve: resolveWith(404)
		});
		expect(await res.text()).toBe('');
	});

	it('leaves a successful response alone', async () => {
		process.env.NODE_ENV = 'development';
		const res = await handleStatic()({
			event: eventFor('/privacy'),
			resolve: resolveWith(200)
		});
		expect(res.status).toBe(200);
	});
});
