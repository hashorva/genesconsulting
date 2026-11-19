import { describe, expect, it } from "vitest";

import {
	NOTICE_MAX_AGE_MS,
	NOTICE_VERSION,
	isNoticeCurrent,
	makeNoticeRecord,
} from "../astro-src/lib/cookie-notice";

const now = Date.UTC(2026, 10, 19);

describe("cookie notice record", () => {
	it("is current right after closing", () => {
		expect(isNoticeCurrent(makeNoticeRecord(now), now)).toBe(true);
	});

	it("shows again after 6 months", () => {
		const closed = makeNoticeRecord(now - NOTICE_MAX_AGE_MS);
		expect(isNoticeCurrent(closed, now)).toBe(false);
		expect(isNoticeCurrent(makeNoticeRecord(now - NOTICE_MAX_AGE_MS + 1000), now)).toBe(true);
	});

	it("shows again when the version changes", () => {
		expect(isNoticeCurrent(JSON.stringify({ v: NOTICE_VERSION + 1, at: now }), now)).toBe(false);
	});

	it("treats missing, broken or future records as not seen", () => {
		for (const raw of [null, undefined, "", "x", "null", "{}", '{"v":1}', JSON.stringify({ v: NOTICE_VERSION, at: now + 1000 })]) {
			expect(isNoticeCurrent(raw, now)).toBe(false);
		}
	});
});
