/**
 * Page illustrations of the redesign (flag design_refresh): each page gets a small
 * "constellation" in the style of the deck's network, a hub icon with satellites that
 * say what the page is about. Icons are default lucide names, rendered by refresh/Scene.astro.
 *
 * Pure data, keyed by route key (i18n/routes.ts), so it is unit tested.
 */
import { ROUTES, type RouteKey } from "../i18n/routes";

export type SceneIcon =
	| "Building2"
	| "Users"
	| "Handshake"
	| "ShieldCheck"
	| "Landmark"
	| "Waypoints"
	| "Briefcase"
	| "FileText"
	| "MonitorSmartphone"
	| "Stamp"
	| "FolderOpen"
	| "ChartLine"
	| "Target"
	| "Lightbulb"
	| "ListChecks"
	| "Mail"
	| "PenLine"
	| "Send"
	| "FolderArchive"
	| "Scale"
	| "Route"
	| "Ear"
	| "ClipboardList"
	| "Workflow"
	| "PackageCheck"
	| "MessageCircle"
	| "Phone"
	| "MapPin"
	| "Puzzle"
	| "ScrollText"
	| "Lock"
	| "Newspaper"
	| "Calendar"
	| "Cookie";

export interface Scene {
	hub: SceneIcon;
	/** Four satellites, clockwise from the top right. The first is drawn in gold. */
	satellites: [SceneIcon, SceneIcon, SceneIcon, SceneIcon];
}

export const SCENES: Partial<Record<RouteKey, Scene>> = {
	"page.about": { hub: "Building2", satellites: ["Handshake", "Users", "ShieldCheck", "Landmark"] },
	"page.method": { hub: "Route", satellites: ["Ear", "ClipboardList", "Workflow", "PackageCheck"] },
	"page.services": { hub: "Waypoints", satellites: ["Briefcase", "FileText", "MonitorSmartphone", "Landmark"] },
	"service.consulting": { hub: "ChartLine", satellites: ["Target", "Lightbulb", "ListChecks", "Briefcase"] },
	"service.corporate-filings": { hub: "Landmark", satellites: ["Stamp", "FileText", "Building2", "FolderOpen"] },
	"service.digital-documents": { hub: "MonitorSmartphone", satellites: ["PenLine", "Mail", "Send", "FolderArchive"] },
	"audience.businesses": { hub: "Building2", satellites: ["Briefcase", "FileText", "Landmark", "Users"] },
	"audience.firms": { hub: "Scale", satellites: ["Handshake", "Send", "FileText", "FolderOpen"] },
	"page.collaboration": { hub: "Handshake", satellites: ["Scale", "Puzzle", "ShieldCheck", "Users"] },
	"page.updates": { hub: "Newspaper", satellites: ["Calendar", "FileText", "Landmark", "Mail"] },
	"page.contact": { hub: "MessageCircle", satellites: ["Phone", "Mail", "MapPin", "Calendar"] },
	"legal.privacy": { hub: "ShieldCheck", satellites: ["Lock", "FileText", "Users", "ScrollText"] },
	"legal.cookies": { hub: "Cookie", satellites: ["ShieldCheck", "Lock", "ListChecks", "FileText"] },
	"legal.notes": { hub: "ScrollText", satellites: ["Building2", "ShieldCheck", "FileText", "Scale"] },
};

/** "/servizi/consulenza-aziendale/" -> "service.consulting" (any trailing slash). */
export function routeKeyFor(pathname: string): RouteKey | null {
	const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
	for (const [key, paths] of Object.entries(ROUTES) as [RouteKey, Record<string, string>][]) {
		if (Object.values(paths).includes(path)) return key;
	}
	return null;
}

export function sceneFor(pathname: string): Scene | null {
	const key = routeKeyFor(pathname);
	return (key && SCENES[key]) || null;
}
