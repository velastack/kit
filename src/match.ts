/** A pathname keeps its leading slash even when every segment turned out to be optional. */
type Root<S extends string> = S extends '' ? '/' : S;

/**
 * Widen the `[param]`s inside a single segment to `string`. `[[optional]]` is
 * matched first so its `]]` is consumed as a pair — otherwise the lazy
 * `${string}` stops at the first `]` and leaves the second one in the output.
 */
type WidenParams<S extends string> = S extends `${infer Start}[[${string}]]${infer Rest}`
	? `${WidenParams<Start>}${string}${WidenParams<Rest>}`
	: S extends `${infer Start}[${string}]${infer Rest}`
		? `${Start}${string}${WidenParams<Rest>}`
		: S;

/** Prepend one route-id segment to the already-normalized remainder of the path. */
type Segment<S extends string, Rest extends string> = S extends `(${string})`
	? // a route group contributes nothing to the path
		Rest
	: S extends `[[${string}]]` | `[...${string}]`
		? // a whole-segment optional or rest param can match zero segments, and
			// when it does its leading slash goes with it
			`/${string}${Rest}` | Rest
		: `/${WidenParams<S>}${Rest}`;

/**
 * Walk the route id one `/`-delimited segment at a time, mirroring how SvelteKit
 * itself compiles a route id (see `get_route_segments` in `@sveltejs/kit`).
 */
type Normalize<S extends string> = S extends `/${infer Head}/${infer Tail}`
	? Segment<Head, Normalize<`/${Tail}`>>
	: S extends `/${infer Head}`
		? Segment<Head, ''>
		: S;

/**
 * Turn a SvelteKit route id into the shape of the URLs that match it: route
 * groups are stripped and `[param]` segments widen to `string`. Segments that
 * SvelteKit lets match zero segments — `[[optional]]` and `[...rest]` — produce
 * a union with the variant where the segment is absent.
 *
 * The widening is deliberately loose: `string` also spans `/`, so a URL with
 * extra segments can still satisfy a single `[param]`.
 *
 * ```ts
 * '/dashboard' satisfies Match<'/(app)/dashboard'>
 * '/blog' satisfies Match<'/[[lang]]/blog'>
 * '/en/blog' satisfies Match<'/[[lang]]/blog'>
 * ```
 */
export type Match<R extends string> = Root<Normalize<R>>;
