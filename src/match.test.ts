import { describe, it, expectTypeOf } from 'vitest';
import type { Match } from './match.js';

describe('Match', () => {
	it('strips route groups and widens params', () => {
		expectTypeOf<Match<'/(app)/dashboard'>>().toEqualTypeOf<'/dashboard'>();
		expectTypeOf<Match<'/(app)'>>().toEqualTypeOf<'/'>();
		expectTypeOf<Match<'/api/(v1)/health'>>().toEqualTypeOf<'/api/health'>();
		expectTypeOf<Match<'/blog'>>().toEqualTypeOf<'/blog'>();
		expectTypeOf<'/teams/abc'>().toMatchTypeOf<Match<'/(app)/teams/[id]'>>();
	});
});
