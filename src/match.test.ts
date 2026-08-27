import { describe, it, expectTypeOf } from 'vitest';
import type { Match } from './match.js';

describe('Match', () => {
	it('strips route groups', () => {
		expectTypeOf<Match<'/(app)/dashboard'>>().toEqualTypeOf<'/dashboard'>();
		expectTypeOf<Match<'/(app)'>>().toEqualTypeOf<'/'>();
		expectTypeOf<Match<'/api/(v1)/health'>>().toEqualTypeOf<'/api/health'>();
		// consecutive groups: every `(group)` segment goes, not just the first
		expectTypeOf<Match<'/(a)/(b)/x'>>().toEqualTypeOf<'/x'>();
		expectTypeOf<Match<'/blog'>>().toEqualTypeOf<'/blog'>();
		expectTypeOf<Match<'/'>>().toEqualTypeOf<'/'>();
	});

	it('widens params', () => {
		expectTypeOf<'/teams/abc'>().toExtend<Match<'/(app)/teams/[id]'>>();
		expectTypeOf<'/teams/abc'>().toExtend<Match<'/(app)/teams/[id=integer]'>>();
		expectTypeOf<'/items/1-abc'>().toExtend<Match<'/items/[id]-[slug]'>>();
	});

	it('lets an optional param match zero segments', () => {
		expectTypeOf<'/'>().toExtend<Match<'/[[language=language]]'>>();
		expectTypeOf<'/en'>().toExtend<Match<'/[[language=language]]'>>();
		expectTypeOf<'/blog'>().toExtend<Match<'/[[lang]]/blog'>>();
		expectTypeOf<'/en/blog'>().toExtend<Match<'/[[lang]]/blog'>>();
		expectTypeOf<'/blog/hi'>().toExtend<Match<'/(app)/[[lang]]/blog/[slug]'>>();
		expectTypeOf<'/en/blog/hi'>().toExtend<Match<'/(app)/[[lang]]/blog/[slug]'>>();
		expectTypeOf<'/c'>().toExtend<Match<'/[[a]]/[[b]]/c'>>();
		expectTypeOf<'/x/y/c'>().toExtend<Match<'/[[a]]/[[b]]/c'>>();
	});

	it('lets a rest param match zero segments', () => {
		expectTypeOf<'/a/z'>().toExtend<Match<'/a/[...rest]/z'>>();
		expectTypeOf<'/a/b/c/z'>().toExtend<Match<'/a/[...rest]/z'>>();
		expectTypeOf<'/o/r/tree/main'>().toExtend<Match<'/[org]/[repo]/tree/[branch]/[...file]'>>();
		expectTypeOf<'/o/r/tree/main/src/a.ts'>().toExtend<
			Match<'/[org]/[repo]/tree/[branch]/[...file]'>
		>();
	});

	it('still rejects urls the route does not match', () => {
		expectTypeOf<'/x'>().not.toExtend<Match<'/(app)/dashboard'>>();
		expectTypeOf<'/blogg'>().not.toExtend<Match<'/blog'>>();
		expectTypeOf<'/teams'>().not.toExtend<Match<'/(app)/teams/[id]'>>();
		expectTypeOf<'/blog/x'>().not.toExtend<Match<'/[[lang]]/blog'>>();
		expectTypeOf<'/hi'>().not.toExtend<Match<'/(app)/[[lang]]/blog/[slug]'>>();
		expectTypeOf<'/a/b'>().not.toExtend<Match<'/a/[...rest]/z'>>();
		expectTypeOf<'/items/abc'>().not.toExtend<Match<'/items/[id]-[slug]'>>();
	});

	it('stays usable for a route id that is only known to be a string', () => {
		// `event.route.id` is `string | null`
		expectTypeOf<Match<string>>().toEqualTypeOf<string>();
	});
});
