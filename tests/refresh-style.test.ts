import { describe, expect, it } from "vitest";

import { ROUTES } from "../astro-src/i18n/routes";
import { routeKeyFor, SCENES, sceneFor } from "../astro-src/lib/page-scenes";
import { headingAnchors, ordinal, refreshBackground, refreshBand, revealDelay, splitClaim, splitLead } from "../astro-src/lib/refresh-style";

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


describe("page scenes", () => {
	it("gives every page except home an illustration", () => {
		const keys = Object.keys(ROUTES).filter((key) => key !== "page.home");
		expect(keys.filter((key) => !(key in SCENES))).toEqual([]);
	});
	it("finds the scene from the path, with or without the slash", () => {
		expect(routeKeyFor("/servizi/consulenza-aziendale/")).toBe("service.consulting");
		expect(routeKeyFor("/contatti")).toBe("page.contact");
		expect(sceneFor("/nessuna-pagina/")).toBeNull();
	});
	it("uses four satellites per scene", () => {
		for (const scene of Object.values(SCENES)) expect(scene!.satellites).toHaveLength(4);
	});
});

describe("splitLead", () => {
	const p = (text: string, extra: object = {}) => ({ _type: "block", style: "normal", markDefs: [], children: [{ text, marks: [] }], ...extra });
	it("moves a plain first paragraph up", () => {
		const { lead, rest } = splitLead([p("Intro."), p("Body.")]);
		expect(lead).toBe("Intro.");
		expect(rest).toHaveLength(1);
	});
	it("keeps rich openings in the body", () => {
		expect(splitLead([p("Link", { markDefs: [{ _key: "a" }] }), p("x")]).lead).toBeNull();
		expect(splitLead([p("Title", { style: "h2" }), p("x")]).lead).toBeNull();
		expect(splitLead([p("Only paragraph")])).toEqual({ lead: "Only paragraph", rest: [] });
		expect(splitLead(null)).toEqual({ lead: null, rest: [] });
	});
});

describe("headingAnchors", () => {
	const h2 = (text: string) => ({ _type: "block", style: "h2", children: [{ text }] });
	it("gives repeated headings and section anchors distinct ids", () => {
		const { content, headings } = headingAnchors(
			[h2("Contatti"), { _type: "block", style: "normal", children: [{ text: "x" }] }, h2("Contatti"), h2("Servizi")],
			["servizi"],
		);
		expect(headings.map((h) => h.id)).toEqual(["contatti", "contatti-2", "servizi-2"]);
		expect((content[2] as { anchor?: string }).anchor).toBe("contatti-2");
		expect((content[1] as { anchor?: string }).anchor).toBeUndefined();
	});
});
