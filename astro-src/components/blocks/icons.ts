/**
 * Icons an editor can pick for a card ("Icona" in EmDash). Each Italian word maps
 * to one default lucide icon; the list must match OPTIONS.icon in section-style.ts
 * (checked in tests/section-style.test.ts).
 */
import {
	Briefcase,
	Building2,
	Calendar,
	ChartLine,
	CircleCheck,
	FileText,
	Handshake,
	Landmark,
	type LucideIcon,
	Mail,
	Phone,
	Scale,
	ShieldCheck,
	Users,
	Waypoints,
} from "lucide-react";

import type { OPTIONS } from "@/lib/section-style";

export const CARD_ICONS: Record<(typeof OPTIONS.icon)[number], LucideIcon> = {
	Rete: Waypoints,
	Documento: FileText,
	Edificio: Building2,
	Persone: Users,
	Scudo: ShieldCheck,
	Grafico: ChartLine,
	Telefono: Phone,
	Posta: Mail,
	Calendario: Calendar,
	Bilancia: Scale,
	Valigetta: Briefcase,
	Spunta: CircleCheck,
	"Stretta di mano": Handshake,
	Istituzione: Landmark,
};

export function cardIcon(name: string | null | undefined): LucideIcon | null {
	return name && Object.hasOwn(CARD_ICONS, name) ? CARD_ICONS[name as keyof typeof CARD_ICONS] : null;
}
