import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { isTheme, readTheme, saveTheme, type Theme } from "@/lib/theme";

interface Props {
	/** Translated labels (i18n stays in Astro; the island only gets strings). */
	labels: { group: string; light: string; system: string; dark: string };
}

const ICONS = { light: Sun, system: Monitor, dark: Moon } as const;

export default function ThemeToggle({ labels }: Props) {
	const [theme, setTheme] = useState<Theme>("system");

	useEffect(() => setTheme(readTheme()), []);

	return (
		<ToggleGroup
			variant="outline"
			size="sm"
			spacing={0}
			aria-label={labels.group}
			value={[theme]}
			onValueChange={(value) => {
				const next = value[0];
				if (!isTheme(next)) return; // keep one item pressed
				setTheme(next);
				saveTheme(next);
			}}
		>
			{(["light", "system", "dark"] as const).map((value) => {
				const Icon = ICONS[value];
				return (
					<ToggleGroupItem key={value} value={value} aria-label={labels[value]} title={labels[value]}>
						<Icon />
					</ToggleGroupItem>
				);
			})}
		</ToggleGroup>
	);
}
