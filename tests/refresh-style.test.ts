import { describe, expect, it } from "vitest";

import { ordinal, refreshBackground, refreshBand, revealDelay, splitClaim } from "../astro-src/lib/refresh-style";

describe("refreshBackground", () => {
	it("keeps the editor's choice", () => {
		expect(refreshBackground({ _type: "cta", background: "Nessuno" })).toBe("Nessuno");
		expect(refreshBackground({ _type: "text", background: "Blu" })).toBe("Blu");
	});
	it("falls back to the page rhythm when empty", () => {
		expect(refreshBackground({ _type: "cta" })).toBe("Blu");
		expect(refreshBackground({ _type: "steps", background: null })).toBe("Blu");
		const linked = { link_url: "/servizi/" };
		expect(refreshBackground({ _type: "card_grid", cards: [linked, linked, linked] })).toBe("Tenue");
		expect(refreshBackground({ _type: "card_grid", cards: [{}, {}, {}, {}] })).toBe("Nessuno");
		expect(refreshBackground({ _type: "card_grid", cards: [linked, linked] })).toBe("Nessuno");
		expect(refreshBackground({ _type: "text" })).toBe("Nessuno");
	});
	it("ignores values that are not in the list", () => {
		expect(refreshBackground({ _type: "text", background: "Rosso" })).toBe("Nessuno");
	});
});

describe("refreshBand", () => {
	it("scopes the dark theme on the blue band and gives the CTA more room", () => {
		const { band } = refreshBand({ _type: "cta" });
		expect(band).toContain("dark");
		expect(band).toContain("to-sky-950");
		expect(band).toContain("md:py-32");
	});
});

describe("helpers", () => {
	it("staggers with capped default delays", () => {
		expect(revealDelay(0)).toBe("delay-0");
		expect(revealDelay(2)).toBe("delay-150");
		expect(revealDelay(40)).toBe("delay-300");
	});
	it("numbers like the deck", () => {
		expect(ordinal(0)).toBe("01");
		expect(ordinal(11)).toBe("12");
	});
	it("splits a two-sentence claim", () => {
		expect(splitClaim("Meno complessità. Più impresa.")).toEqual(["Meno complessità.", "Più impresa."]);
		expect(splitClaim("Parliamone.")).toEqual(["Parliamone."]);
		expect(splitClaim("Servizi digitali")).toEqual(["Servizi digitali"]);
	});
});
