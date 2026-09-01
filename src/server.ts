import path from 'node:path';
import process from 'node:process';

/**
 * The directory this app keeps its state in.
 *
 * `vela` sets `VELA_DATA_DIR` in every context it runs an app — `vela dev`,
 * `vela build`, and the environment it writes on each deploy — so this answers
 * the project's `data/` directory in a checkout and the instance's own data
 * directory on a server. Both outlive a release, which is the entire point.
 *
 * Working it out from the working directory instead is the mistake this exists
 * to prevent: that directory is the project root during development and a
 * release directory in production, so a path derived from it puts the app's
 * state inside the release — where the next deploy leaves it behind, the
 * pruner eventually deletes it, and no backup ever captures it.
 *
 * The fallback covers the contexts vela does not launch: a bare `vitest`, a
 * script run by hand. There the working directory is the project root, and
 * `data/` is the right answer.
 */
export function dataDir(): string {
	return process.env.VELA_DATA_DIR ?? path.resolve(process.cwd(), 'data');
}

/**
 * A path inside {@link dataDir}.
 *
 * ```ts
 * const db = new Database(dataPath('app.sqlite'));
 * const uploads = dataPath('uploads');
 * ```
 *
 * Read fresh on every call rather than resolved once at import, so that a test
 * which points `VELA_DATA_DIR` at a temporary directory does not depend on
 * having done so before this module was first imported.
 */
export function dataPath(...segments: string[]): string {
	return path.join(dataDir(), ...segments);
}
