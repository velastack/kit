import { describe, it, expect } from 'vitest';
import { protectedRouteRedirect } from './protected-route.js';

const base = {
	url: new URL('https://example.com/dashboard?tab=1'),
	protectedRoutes: ['/(app)'],
	loginPath: '/login',
	authenticated: false
};

describe('protectedRouteRedirect', () => {
	it('redirects an unauthenticated request under a protected prefix', () => {
		const res = protectedRouteRedirect({ ...base, routeId: '/(app)/dashboard' });
		expect(res?.status).toBe(302);
		expect(res?.headers.get('location')).toBe('/login?redirect=%2Fdashboard%3Ftab%3D1');
	});

	it('lets an authenticated request through', () => {
		expect(
			protectedRouteRedirect({ ...base, routeId: '/(app)/dashboard', authenticated: true })
		).toBeNull();
	});

	it('lets an unprotected route through', () => {
		expect(protectedRouteRedirect({ ...base, routeId: '/(public)/about' })).toBeNull();
	});

	it('is a no-op with no protected routes configured', () => {
		expect(
			protectedRouteRedirect({ ...base, routeId: '/(app)/x', protectedRoutes: null })
		).toBeNull();
		expect(
			protectedRouteRedirect({ ...base, routeId: '/(app)/x', protectedRoutes: [] })
		).toBeNull();
	});

	it('is a no-op when the route id is unknown', () => {
		expect(protectedRouteRedirect({ ...base, routeId: null })).toBeNull();
	});

	it('expires each named cookie with HttpOnly and SameSite', () => {
		const res = protectedRouteRedirect({
			...base,
			routeId: '/(app)/dashboard',
			clearCookies: ['pb_auth', 'team']
		});
		const cookies = res!.headers.getSetCookie();
		expect(cookies).toHaveLength(2);
		expect(cookies[0]).toContain('pb_auth=;');
		expect(cookies[0]).toContain('HttpOnly');
		expect(cookies[0]).toContain('SameSite=Lax');
		expect(cookies[1]).toContain('team=;');
	});
});
