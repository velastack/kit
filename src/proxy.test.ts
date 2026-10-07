import { describe, it, expect, vi, afterEach } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { proxy } from './proxy.js';

const makeEvent = (headers: HeadersInit, getClientAddress: () => string) =>
	({
		request: new Request('http://app.test/api/health', { headers }),
		getClientAddress
	}) as unknown as RequestEvent;

/** Proxy the event and return the headers the upstream received. */
const upstreamHeaders = async (event: RequestEvent) => {
	const upstream = vi.fn(
		async (_input: URL | RequestInfo, _init?: RequestInit) => new Response('{}')
	);
	vi.stubGlobal('fetch', upstream);
	await proxy('http://pocketbase.test/api/health', event);
	return new Headers(upstream.mock.calls[0]?.[1]?.headers);
};

describe('proxy', () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it('sets x-forwarded-for from getClientAddress()', async () => {
		const headers = await upstreamHeaders(makeEvent({}, () => '203.0.113.7'));
		expect(headers.get('x-forwarded-for')).toBe('203.0.113.7');
	});

	it('replaces an x-forwarded-for the client sent', async () => {
		const event = makeEvent({ 'x-forwarded-for': '198.51.100.1' }, () => '203.0.113.7');
		const headers = await upstreamHeaders(event);
		expect(headers.get('x-forwarded-for')).toBe('203.0.113.7');
	});

	it('drops the client-sent header when there is no client address', async () => {
		const event = makeEvent({ 'x-forwarded-for': '198.51.100.1' }, () => {
			throw new Error('Address header was specified but is absent from request');
		});
		const headers = await upstreamHeaders(event);
		expect(headers.has('x-forwarded-for')).toBe(false);
	});
});
