import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { dataDir, dataPath } from './server.js';

describe('dataDir', () => {
	let original: string | undefined;

	beforeEach(() => {
		original = process.env.VELA_DATA_DIR;
	});

	afterEach(() => {
		if (original === undefined) delete process.env.VELA_DATA_DIR;
		else process.env.VELA_DATA_DIR = original;
	});

	test('is what vela put in the environment', () => {
		process.env.VELA_DATA_DIR = '/var/lib/vela/apps/abc123/shared/pb_data';
		expect(dataDir()).toBe('/var/lib/vela/apps/abc123/shared/pb_data');
	});

	test('falls back to data/ under the working directory', () => {
		delete process.env.VELA_DATA_DIR;
		expect(dataDir()).toBe(path.resolve(process.cwd(), 'data'));
	});

	// Resolved per call: a test that sets the variable after this module was
	// first imported still gets the directory it asked for.
	test('follows a change made after import', () => {
		process.env.VELA_DATA_DIR = '/tmp/one';
		expect(dataDir()).toBe('/tmp/one');
		process.env.VELA_DATA_DIR = '/tmp/two';
		expect(dataDir()).toBe('/tmp/two');
	});
});

describe('dataPath', () => {
	let original: string | undefined;

	beforeEach(() => {
		original = process.env.VELA_DATA_DIR;
		process.env.VELA_DATA_DIR = '/srv/data';
	});

	afterEach(() => {
		if (original === undefined) delete process.env.VELA_DATA_DIR;
		else process.env.VELA_DATA_DIR = original;
	});

	test('joins segments onto the data directory', () => {
		expect(dataPath('app.sqlite')).toBe(path.join('/srv/data', 'app.sqlite'));
		expect(dataPath('uploads', 'a.jpg')).toBe(path.join('/srv/data', 'uploads', 'a.jpg'));
	});

	test('with no segments is the data directory itself', () => {
		expect(dataPath()).toBe('/srv/data');
	});
});
