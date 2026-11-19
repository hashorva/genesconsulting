/**
 * Cookie notice (flag cookie_notice), following the Garante's "Linee guida cookie e altri
 * strumenti di tracciamento" (10 June 2021). See docs/legal/garante-compliance.md.
 *
 * The site sets no cookies for visitors and uses only technical browser storage (the theme
 * choice and this notice's own record), so no consent is needed: the notice only informs.
 * The visitor's choice is recorded in localStorage and the notice is not shown again for
 * 6 months (par. 6.2 and 7.1), or until NOTICE_VERSION changes (e.g. when a service that
 * needs consent is added: bump the version so everybody sees the notice again).
 */
export const NOTICE_STORAGE_KEY = "cookie-notice";

/** Bump when the cookies or third parties used by the site change. */
export const NOTICE_VERSION = 1;

/** 6 months, the Garante's minimum before showing the notice again. */
export const NOTICE_MAX_AGE_MS = 183 * 24 * 60 * 60 * 1000;

export interface NoticeRecord {
	v: number;
	/** When the visitor closed the notice (ms since epoch). */
	at: number;
}

export function makeNoticeRecord(now: number): string {
	return JSON.stringify({ v: NOTICE_VERSION, at: now } satisfies NoticeRecord);
}

/** True when the stored record is valid, for the current version and younger than 6 months. */
export function isNoticeCurrent(raw: string | null | undefined, now: number): boolean {
	if (!raw) return false;
	let record: unknown;
	try {
		record = JSON.parse(raw);
	} catch {
		return false;
	}
	if (typeof record !== "object" || record === null) return false;
	const { v, at } = record as Partial<NoticeRecord>;
	if (v !== NOTICE_VERSION || typeof at !== "number" || !Number.isFinite(at)) return false;
	return at <= now && now - at < NOTICE_MAX_AGE_MS;
}
