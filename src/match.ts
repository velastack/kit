type StripGroups<S extends string> =
	// group at start: "/(foo)/rest" → "/rest"
	S extends `/${`(${string})`}/${infer Rest}`
		? `/${StripGroups<Rest>}`
		: // group at start, no trailing slash: "/(foo)" → "/"
			S extends `/${`(${string})`}`
			? '/'
			: // group in middle: ".../(foo)/rest" → ".../rest"
				S extends `${infer Head}/${`(${string})`}/${infer Tail}`
				? `${Head}/${StripGroups<Tail>}`
				: // group at end: ".../(foo)" → "..."
					S extends `${infer Head}/${`(${string})`}`
					? Head
					: // otherwise no groups
						S;

type Normalize<S extends string> = S extends `${infer Start}[${string}]${infer Rest}`
	? `${Start}${string}${Normalize<Rest>}`
	: S;

/**
 * Turn a SvelteKit route id into the shape of the URLs that match it: route
 * groups are stripped and `[param]` segments widen to `string`.
 *
 * ```ts
 * '/dashboard' satisfies Match<'/(app)/dashboard'>
 * ```
 */
export type Match<R extends string> = Normalize<StripGroups<R>>;
