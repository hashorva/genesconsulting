# Privacy and cookies: what the Garante requires

Checked on 2026-11-19 against the Garante per la protezione dei dati personali: [Linee guida cookie e altri strumenti di tracciamento, 10 June 2021](https://www.garanteprivacy.it/home/docweb/-/docweb-display/docweb/9677876) (in force since 9 January 2022), its [press release](https://garanteprivacy.it/garante/doc.jsp?ID=9679893), and the Garante's own site ([informativa](https://www.garanteprivacy.it/informativa-protezione-dati), [newsletter page](https://www.garanteprivacy.it/home/stampa-comunicazione/newsletter)). Not legal advice: have the client's privacy advisor confirm the final texts.

## What the site uses today

Checked in the code (2026-11-19): visitors get **no cookies**. Fonts are self-hosted (`@fontsource-variable/noto-sans`), there is no analytics, no embedded video, map or social widget, and no contact form (the Contatti page links to Google Maps, it does not embed it). Browser storage, all first party and technical:

| Key | Where | Purpose | Lifetime |
| --- | --- | --- | --- |
| `theme` | localStorage | Light/dark/system choice, only when the visitor uses the footer toggle | Until cleared |
| `cookie-notice` | localStorage | The visitor closed the cookie notice (flag `cookie_notice`) | 6 months, then the notice shows again |

EmDash sets its cookies (`emdash_session`, `__em_d1_bookmark`, `emdash_preview`...) only for signed-in staff, never for visitors. Cloudflare dashboard features (Web Analytics, Bot Fight Mode) could add cookies or beacons: check before release.

## Requirements and how the site meets them

| Requirement | Source | Where |
| --- | --- | --- |
| Before any choice, only technical cookies/trackers | Linee guida par. 3, 6 | Already true |
| Technical cookies need no consent, only an informativa (homepage or general privacy notice), **no banner required** | par. 5, 7.1 last paragraph | Cookie policy page; the notice is an extra, informational only |
| Informativa per art. 13 GDPR: controller, purposes, legal basis, recipients, retention, rights, complaint to the Garante | GDPR art. 13; par. 8.1 | `content/it/pages/privacy.md`, `cookie.md` (drafts) |
| State the criteria used to classify trackers (no standard coding exists) | par. 8.2 | Cookie policy, "Come li classifichiamo" |
| Privacy/cookie policy reachable in one click from the footer of every page | par. 7.1 iii | `LegalBar.astro` |
| A footer link to review cookie choices at any time | par. 7.1 | "Preferenze cookie" in `LegalBar.astro` |
| Record the choice; do not show the banner again for at least 6 months unless the cookies or third parties change | par. 6.2, 7.1 | `lib/cookie-notice.ts` (`NOTICE_MAX_AGE_MS`, `NOTICE_VERSION`) |
| Scrolling is not consent; no cookie walls | par. 6.1, 6.3 | Nothing is inferred from scrolling |
| VAT number on the company website's homepage | art. 35 DPR 633/1972 | `LegalBar.astro` (footer on every page) |
| Company data on the website: registered office, Registro Imprese office and REA number, share capital, sole shareholder status if any | art. 2250 c.c. | Note legali page: **REA, capitale sociale and PEC still missing** |

## If a service that needs consent is added later

Analytics that are not anonymised, YouTube or Google Maps embeds, Google Fonts from Google's servers, LinkedIn or ads pixels all need **prior consent**. Then the notice must become a consent banner (par. 7.1): close with an X at the top right = refuse, with the same visual weight as "Accetta"; an "Accetta tutti" button; a link to choose per purpose/third party, all off by default; a short notice and the link to the policy. Bump `NOTICE_VERSION` so everybody is asked again, load the service only after consent, and add it to the cookie policy table. Analytics count as technical (no consent) only with at least the last IPv4 octet masked, aggregate statistics for this site only, and a provider that does not combine the data (par. 7.2).

## Contact form (none today)

A form needs a short notice next to the submit button with a link to the privacy policy (art. 13 GDPR). No consent checkbox is needed to answer a request (art. 6.1.b); a separate, unticked checkbox is needed only for marketing or newsletter.
