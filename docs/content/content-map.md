# Genes Consulting: content, copy and SEO map

Status: draft for review. Source of truth for building the EmDash collections and the Astro pages.

This document maps every piece of content found in `docs/requirements/initial` onto site pages and sections, proposes improved Italian copy where the source is thin, and defines the topic structure for SEO and AI SEO (answer engines such as ChatGPT, Perplexity, Google AI Overviews).

Conventions used below:

- **[Source]** means the text is taken verbatim, or nearly, from the client's material.
- **[Proposed]** means the text is new or rewritten and needs the client's approval.
- Site copy is in Italian, because all the source material is Italian. Notes for the team are in English.

---

## 1. Source inventory

| File | What it is | What it contributes |
| --- | --- | --- |
| `GENES_Consulting_Presentazione_WOW.pptx` | 13-slide company presentation, dark theme | Almost all of the copy: positioning, history, method, three service areas, six areas of assistance, two audiences, values, collaboration model, contacts |
| `Banner aziendale Genes Consulting blu e ciano.png` | Wide brand banner, light theme | Headline, tagline, the three headline services with one-line descriptions, logo on a dark panel |
| `Firma email aziendale GENES Consulting (4).jpg` | Email signature | Legal name, address, VAT number, phone, website address, LinkedIn mention, privacy notice, AI usage notice |

Slide by slide, the presentation contains:

| # | Eyebrow | Title | Used on |
| --- | --- | --- | --- |
| 1 | (cover) | Meno Complessità. Più Impresa. | Home hero |
| 2 | La nostra evoluzione | Dalla semplificazione al supporto alle imprese | Chi siamo, Home intro |
| 3 | Il nostro approccio | Un unico punto di riferimento | Metodo, Home |
| 4 | Area 01 | Consulenza aziendale trasversale | Servizi: consulenza |
| 5 | Area 02 | Servizi amministrativi e societari | Servizi: amministrativi e societari |
| 6 | Area 03 | Digitale e gestione documentale | Servizi: digitali |
| 7 | Collaborazione interprofessionale | Competenze complementari, ruoli chiari | Collaborazione |
| 8 | Il nostro valore | Perché scegliere Genes | Home, Chi siamo |
| 9 | La nostra identità | Dall'esperienza alla consulenza integrata | Chi siamo |
| 10 | Il modello Genes | Due destinatari, un unico riferimento | Home, pagine Per le imprese / Per gli studi |
| 11 | Le nostre competenze | Sei aree di assistenza | Servizi (indice) |
| 12 | Competenze integrate | Collaborazione e autonomia professionale | Collaborazione |
| 13 | Genes Consulting Srl | Parliamone. | Contatti, CTA finale |

### Company facts (the entity)

These facts must be identical everywhere on the site (footer, Contatti, structured data), because consistency is what search engines and AI assistants use to recognise the company.

| Fact | Value | Source |
| --- | --- | --- |
| Legal name | GENES CONSULTING S.r.l. | Signature |
| Brand name | Genes Consulting (short: Genes) | All |
| Address | Via Lanzone 31, 20123 Milano (MI) | Signature, slide 13 |
| P.IVA / C.F. | 07558570961 | Signature |
| Phone | +39 02 94556110 | Signature, slide 13 |
| Email | genesconsulting@genesconsulting.it | Slide 13 |
| Website | www.genesconsulting.it | Signature |
| LinkedIn | Mentioned, no URL given | Signature |
| Payoff | Meno complessità. Più impresa. | All three files |
| Tagline | L'esperienza che semplifica, le competenze che si integrano. | Banner, slides 10 and 13 |
| Descriptor | Consulenza aziendale e servizi integrati per imprese e studi professionali | Banner, slide 1 |

---

## 2. Positioning and messaging

**One-sentence definition [Proposed].** This is the sentence AI assistants should be able to quote, so it appears near the top of the home page and of Chi siamo, and in the Organization description:

> Genes Consulting è una società di Milano che offre consulenza aziendale e servizi amministrativi, societari e digitali a imprese e studi professionali: un unico riferimento operativo per pratiche, documenti e rapporti con gli enti.

**Message hierarchy.**

1. Promise: *Meno complessità. Più impresa.*
2. How: one operational point of contact, from the first need to ongoing management.
3. Proof: long experience with filings and with the Public Administration.
4. Who: companies, and professional firms that need operational support.
5. Boundary: activities reserved by law to licensed professionals stay with those professionals. Genes coordinates and does not replace them.

**Compliance wording to preserve.** The source is careful about three phrases and the site must stay just as careful. They are not style, they define what the company legally does:

- "consulenza aziendale **non riservata**"
- "predisposizione e invio **nei limiti consentiti**"
- "le prestazioni professionali riservate restano affidate ed eseguite dai **soggetti legittimati**, secondo **incarichi distinti**"

Do not rewrite these into stronger claims such as "consulenza fiscale" or "consulenza legale". Do not present Genes as a law firm, an accounting firm or a notary.

**Tone of voice.** Short declarative sentences. Concrete nouns (pratiche, visure, depositi, PEC). No superlatives, no "leader", no "a 360 gradi". Formal but warm: address the reader as "voi" or impersonally, as the source does.

---

## 3. Site map

```
/                                   Home
/chi-siamo/                         Chi siamo
/metodo/                            Il nostro approccio
/servizi/                           Servizi (indice, sei aree)
/servizi/consulenza-aziendale/      Area 01
/servizi/amministrativi-societari/  Area 02
/servizi/digitali-documentali/      Area 03
/per-le-imprese/                    Audience page
/per-gli-studi-professionali/       Audience page
/collaborazione-professionale/      Collaboration model
/aggiornamenti/                     Blog / updates index
/aggiornamenti/[slug]/              Article
/aggiornamenti/categoria/[slug]/    Category archive
/contatti/                          Contacts
/privacy/                           Privacy policy
/cookie/                            Cookie policy
/note-legali/                       Legal notes, incl. AI usage notice
```

Main navigation: Chi siamo, Servizi (with the three areas as a dropdown), Per le imprese, Per gli studi, Aggiornamenti, and a "Parliamone" button that goes to Contatti.

Footer: logo, payoff, full company facts, service links, legal links, LinkedIn.

### How the "three areas" and the "six areas" fit together

The source describes services twice: three areas (slides 4 to 6, and the banner) and six areas of assistance (slide 11). They are the same offer at two levels of detail. The site uses three service pages as hubs, and the six areas become sections inside them, each with its own anchor so it can be linked and cited directly.

| Six areas (slide 11) | Lives on | Anchor |
| --- | --- | --- |
| 01 Consulenza aziendale | `/servizi/consulenza-aziendale/` | page itself |
| 02 Servizi societari | `/servizi/amministrativi-societari/` | `#servizi-societari` |
| 03 Documentazione | `/servizi/amministrativi-societari/` | `#visure-certificati` |
| 04 Rapporti con enti | `/servizi/amministrativi-societari/` | `#rapporti-con-enti` |
| 05 Servizi digitali | `/servizi/digitali-documentali/` | page itself |
| 06 Servizi integrati | `/collaborazione-professionale/` | page itself |

---

## 4. Page by page

Each page lists: search intent, title and meta description, the single H1, the sections in order, the copy, internal links, and structured data.

### 4.1 Home `/`

- **Intent:** brand search, and "consulenza aziendale Milano", "servizi societari Milano".
- **Title:** Genes Consulting | Consulenza aziendale e servizi integrati a Milano
- **Meta description:** Genes Consulting affianca imprese e studi professionali a Milano: consulenza aziendale, pratiche camerali e societarie, visure, PEC e firme digitali. Un unico riferimento.
- **Schema:** `Organization` + `ProfessionalService` (with address, phone, VAT), `WebSite`.

**Section 1: Hero**

- Eyebrow [Source]: Consulenza aziendale e servizi integrati
- H1 [Source]: Meno complessità. Più impresa.
- Lead [Source, banner]: Consulenza aziendale e servizi integrati per imprese e studi professionali.
- Supporting line [Source]: L'esperienza che semplifica, le competenze che si integrano.
- Primary button: Parliamone (to `/contatti/`). Secondary: Scopri i servizi (to `/servizi/`).
- Visual: the hub-and-spoke "G" network from slides 1, 2 and 7, redrawn as SVG.

**Section 2: Chi è Genes (short)**

- H2 [Source, slide 2]: Dalla semplificazione al supporto alle imprese
- Body [Source]: Genes nasce per facilitare gli adempimenti e i rapporti con la Pubblica Amministrazione. Oggi affianca imprese e professionisti nelle esigenze amministrative, societarie e operative.
- Link: La nostra storia (to `/chi-siamo/`).

**Section 3: Servizi (three cards)**

- H2 [Proposed]: Tre aree, un unico interlocutore
- Cards, from the banner [Source]:
  - **Servizi amministrativi e societari.** Pratiche camerali e adempimenti amministrativi.
  - **Consulenza aziendale integrata.** Un supporto concreto per le imprese.
  - **Servizi digitali.** PEC, firme digitali e pratiche telematiche.
- Each card links to its service page.

**Section 4: Il modello Genes (two audiences)**

- H2 [Source, slide 10]: Due destinatari, un unico riferimento
- Lead [Source]: Due interlocutori, esigenze differenti: un supporto operativo costruito sul lavoro di ciascuno.
- **Per le imprese** [Source]: Quando servono adempimenti societari, documenti, rapporti con enti e assistenza amministrativa continuativa.
- **Per gli studi professionali** [Source]: Quando occorre supporto per pratiche telematiche, documentazione e attività operative complementari agli incarichi.
- Each block links to its audience page.

**Section 5: Metodo (four steps)**

- H2 [Source, slide 3]: Un unico punto di riferimento
- Lead [Source]: Un percorso chiaro: dall'esigenza iniziale alla gestione operativa, con un riferimento che resta nel tempo.
- Steps [Source]: 01 Ascolto e analisi, 02 Proposta operativa, 03 Gestione e coordinamento, 04 Consegna e continuità.
- Link: Come lavoriamo (to `/metodo/`).

**Section 6: Perché scegliere Genes**

- H2 [Source, slide 8]: Perché scegliere Genes
- Four values [Source]:
  - **Semplificazione.** Esigenze diverse, un riferimento operativo.
  - **Flessibilità.** Attività calibrate sulle necessità reali.
  - **Trasparenza.** Passaggi, ruoli e responsabilità definiti.
  - **Continuità.** Un rapporto che supera la singola pratica.

**Section 7: Ultimi aggiornamenti.** Latest three posts from `/aggiornamenti/`. Hidden until at least one post is published.

**Section 8: Final call to action**

- H2 [Source, slide 13]: Parliamone.
- Body [Source]: L'esperienza che semplifica, le competenze che si integrano.
- Button: Contattaci, plus phone and email.

### 4.2 Chi siamo `/chi-siamo/`

- **Intent:** "Genes Consulting chi è", trust check before contacting.
- **Title:** Chi siamo | Genes Consulting, Milano
- **Meta description:** Genes Consulting nasce per semplificare adempimenti e rapporti con la Pubblica Amministrazione. Oggi offre consulenza aziendale integrata a imprese e studi professionali.
- **Schema:** `AboutPage`, `BreadcrumbList`.

Sections:

1. **H1** [Source, slide 9]: Dall'esperienza alla consulenza integrata
2. **Opening** [Proposed]: the one-sentence definition from section 2 of this document.
3. **La nostra identità** [Source]: Genes nasce per semplificare gli adempimenti e i rapporti con la Pubblica Amministrazione.
   - **Esperienza consolidata.** Conoscenza delle procedure, assistenza amministrativa e servizi documentali.
   - **Evoluzione dei servizi.** Consulenza aziendale non riservata e collaborazione con professionisti specializzati.
4. **La nostra evoluzione** [Source, slide 2]: Oggi affianca imprese e professionisti nelle esigenze amministrative, societarie e operative.
5. **I nostri valori**: the four values from slide 8.
6. **Dove siamo**: address, map link, link to Contatti.

Missing and worth asking the client for: founding year, the people (names, roles, photos), number of clients or filings handled. Each of these raises trust for readers and for AI answers. See open questions.

### 4.3 Il nostro approccio `/metodo/`

- **Intent:** "come funziona", evaluation stage.
- **Title:** Il nostro approccio | Genes Consulting
- **Meta description:** Dall'ascolto alla consegna: quattro passaggi chiari e un unico punto di riferimento che resta nel tempo. Ecco come lavora Genes Consulting.
- **Schema:** `HowTo` is not appropriate here. Use `WebPage` + `BreadcrumbList`, and mark the steps up as an ordered list.

- **H1** [Source]: Un unico punto di riferimento
- **Lead** [Source]: Un percorso chiaro: dall'esigenza iniziale alla gestione operativa, con un riferimento che resta nel tempo.
- **Four steps.** Titles are [Source], descriptions are [Proposed]:
  1. **Ascolto e analisi.** Partiamo dall'esigenza concreta: che cosa serve, entro quando, con quali enti e quali documenti.
  2. **Proposta operativa.** Definiamo attività, tempi e responsabilità prima di iniziare, così ogni passaggio è chiaro.
  3. **Gestione e coordinamento.** Seguiamo la pratica e coordiniamo le attività, anche quando coinvolgono più soggetti.
  4. **Consegna e continuità.** Consegniamo il risultato e restiamo il riferimento per le esigenze successive.
- **Closing CTA:** Parliamone.

### 4.4 Servizi (indice) `/servizi/`

- **Intent:** "servizi Genes Consulting", overview.
- **Title:** Servizi | Consulenza, pratiche societarie e servizi digitali | Genes Consulting
- **Meta description:** Sei aree di assistenza per imprese e studi professionali: consulenza aziendale, servizi societari, documentazione, rapporti con enti, servizi digitali e servizi integrati.
- **Schema:** `ItemList` of `Service`, `BreadcrumbList`.

- **H1** [Source, slide 11]: Sei aree di assistenza
- **Lead** [Source]: Un insieme di servizi che valorizza le competenze proprie di Genes.
- **Six cards** [Source], each linking to the anchor in the table of section 3:
  1. **Consulenza aziendale.** Analisi delle esigenze e supporto non riservato.
  2. **Servizi societari.** Pratiche camerali e adempimenti amministrativi.
  3. **Documentazione.** Visure, certificati e flussi documentali.
  4. **Rapporti con enti.** Procedure e interlocuzioni amministrative.
  5. **Servizi digitali.** PEC, firme digitali e pratiche telematiche.
  6. **Servizi integrati.** Raccordo con professionisti qualificati.

### 4.5 Consulenza aziendale `/servizi/consulenza-aziendale/`

- **Intent:** "consulenza aziendale Milano", "supporto operativo imprese".
- **Title:** Consulenza aziendale a Milano | Genes Consulting
- **Meta description:** Consulenza aziendale trasversale: analisi delle esigenze, coordinamento di attività e adempimenti, supporto operativo e documentale calibrato sul cliente.
- **Schema:** `Service` (provider: the Organization, areaServed: Milano and Italia), `FAQPage`, `BreadcrumbList`.

- **Eyebrow:** Area 01
- **H1** [Source, slide 4]: Consulenza aziendale trasversale
- **Lead** [Source]: Dalla singola necessità a un percorso operativo coordinato, calibrato sulle esigenze del cliente.
- **Cosa facciamo** [Source]:
  - Analisi delle necessità e delle priorità
  - Coordinamento di attività e adempimenti
  - Supporto operativo e documentale
  - Interventi calibrati sul cliente
- **A chi si rivolge** [Proposed]: Imprese che vogliono un solo interlocutore per le esigenze amministrative e operative, senza moltiplicare i contatti.
- **Cosa non è** [Proposed, based on slides 9 and 11]: La consulenza di Genes riguarda attività non riservate. Quando servono prestazioni riservate per legge a professionisti abilitati, Genes si raccorda con loro. Link to `/collaborazione-professionale/`.
- **FAQ:** see section 6.

Note: the source slide has a typo, "Supporto operatico". The correct word is "operativo", used above.

### 4.6 Servizi amministrativi e societari `/servizi/amministrativi-societari/`

- **Intent:** "pratiche camerali Milano", "deposito Registro Imprese", "visura camerale", "visura catastale". This is the page with the strongest search demand.
- **Title:** Pratiche camerali, Registro Imprese e visure a Milano | Genes Consulting
- **Meta description:** Iscrizioni, variazioni e depositi al Registro delle Imprese, pratiche camerali, certificati, visure e supporto documentale immobiliare e catastale.
- **Schema:** `Service` with an `OfferCatalog` listing the four services, `FAQPage`, `BreadcrumbList`.

- **Eyebrow:** Area 02
- **H1** [Source, slide 5]: Servizi amministrativi e societari
- **Lead** [Source]: L'esperienza storica di Genes resta un valore distintivo.
- **Four sections**, titles from [Source], one-line descriptions [Proposed]:
  - `#servizi-societari` **Registro delle Imprese: iscrizioni, variazioni e depositi.** Prepariamo e seguiamo le pratiche verso il Registro delle Imprese, dalla costituzione alle variazioni successive.
  - `#pratiche-camerali` **Pratiche camerali e documentazione amministrativa.** Gestiamo gli adempimenti verso la Camera di Commercio e la documentazione collegata.
  - `#visure-certificati` **Certificati, visure e richieste presso gli enti.** Richiediamo visure e certificati e curiamo le richieste presso gli uffici competenti.
  - `#immobiliare-catastale` **Supporto documentale immobiliare e catastale.** Recuperiamo e organizziamo la documentazione immobiliare e catastale necessaria.
- `#rapporti-con-enti` **Rapporti con enti** [Source, slide 11]: Procedure e interlocuzioni amministrative.
- **FAQ:** see section 6.

### 4.7 Digitale e gestione documentale `/servizi/digitali-documentali/`

- **Intent:** "PEC azienda", "firma digitale Milano", "pratiche telematiche", "domiciliazione Milano".
- **Title:** PEC, firma digitale e pratiche telematiche | Genes Consulting
- **Meta description:** Pratiche telematiche, supporto per PEC, firme digitali e dispositivi, organizzazione dei documenti, domiciliazione e gestione della corrispondenza.
- **Schema:** `Service` with `OfferCatalog`, `FAQPage`, `BreadcrumbList`.

- **Eyebrow:** Area 03
- **H1** [Source, slide 6]: Digitale e gestione documentale
- **Three sections** [Source]:
  - `#pratiche-telematiche` **Pratiche telematiche.** Predisposizione e invio nei limiti consentiti.
  - `#identita-digitale` **Identità digitale.** Supporto per PEC, firme digitali e dispositivi.
  - `#documenti-corrispondenza` **Documenti e corrispondenza.** Organizzazione, domiciliazione e gestione operativa.
- **FAQ:** see section 6.

### 4.8 Per le imprese `/per-le-imprese/`

- **Intent:** "supporto amministrativo per aziende", "esternalizzare pratiche societarie".
- **Title:** Per le imprese | Adempimenti, documenti e rapporti con gli enti | Genes Consulting
- **Meta description:** Adempimenti societari, documenti, rapporti con gli enti e assistenza amministrativa continuativa: un riferimento operativo unico per la vostra impresa.
- **Schema:** `WebPage` with `audience` set to `BusinessAudience`, `BreadcrumbList`.

- **H1** [Proposed]: Un riferimento operativo per la vostra impresa
- **Lead** [Source, slide 10]: Quando servono adempimenti societari, documenti, rapporti con enti e assistenza amministrativa continuativa.
- **Situazioni tipiche** [Proposed, each one links to the matching service anchor]:
  - Costituire una società o comunicare una variazione
  - Depositare un atto o un bilancio al Registro delle Imprese
  - Ottenere una visura o un certificato in tempi certi
  - Attivare o rinnovare PEC e firma digitale
  - Avere una sede per la corrispondenza e qualcuno che la gestisce
- **Come lavoriamo:** the four steps, short, linking to `/metodo/`.
- **CTA:** Parliamone.

### 4.9 Per gli studi professionali `/per-gli-studi-professionali/`

- **Intent:** "service pratiche telematiche per commercialisti", "supporto operativo studi professionali".
- **Title:** Per gli studi professionali | Supporto operativo e pratiche telematiche | Genes Consulting
- **Meta description:** Supporto per pratiche telematiche, documentazione e attività operative complementari agli incarichi dello studio, nel rispetto dei ruoli professionali.
- **Schema:** `WebPage` with `audience`, `BreadcrumbList`.

- **H1** [Proposed]: Il supporto operativo che affianca lo studio
- **Lead** [Source, slide 10]: Quando occorre supporto per pratiche telematiche, documentazione e attività operative complementari agli incarichi.
- **Cosa possiamo seguire** [Proposed]: pratiche telematiche, visure e certificati, raccolta e organizzazione dei documenti, corrispondenza.
- **Ruoli chiari** [Source, slide 12]: Genes favorisce il coordinamento operativo, nel rispetto dei ruoli e delle competenze di ciascuno. Link to `/collaborazione-professionale/`.
- **CTA:** Parliamone.

### 4.10 Collaborazione interprofessionale `/collaborazione-professionale/`

- **Intent:** trust and compliance. Also answers "Genes Consulting è uno studio di commercialisti?".
- **Title:** Collaborazione con professionisti abilitati | Genes Consulting
- **Meta description:** Quando occorrono competenze specialistiche, Genes si raccorda con professionisti abilitati. Le attività riservate restano affidate ai soggetti legittimati.
- **Schema:** `WebPage`, `FAQPage`, `BreadcrumbList`.

- **Eyebrow** [Source]: Collaborazione interprofessionale
- **H1** [Source, slide 7]: Competenze complementari, ruoli chiari
- **Lead** [Source]: Quando occorrono competenze specialistiche, Genes si raccorda con professionisti abilitati.
- **Statement** [Source]: Le prestazioni professionali riservate restano affidate ed eseguite dai soggetti legittimati, secondo incarichi distinti.
- **Two blocks** [Source, slide 12]:
  - **Competenze complementari.** Collaborazione con professionalità qualificate, secondo le esigenze di ciascun incarico.
  - **Autonomia e responsabilità.** Le attività riservate sono svolte dai soggetti abilitati, nel rispetto delle rispettive attribuzioni.
- **Closing line** [Source]: Genes favorisce il coordinamento operativo, nel rispetto dei ruoli e delle competenze di ciascuno.

### 4.11 Contatti `/contatti/`

- **Intent:** "Genes Consulting contatti", "Genes Consulting Milano telefono".
- **Title:** Contatti | Genes Consulting, Via Lanzone 31, Milano
- **Meta description:** Parliamone: Genes Consulting S.r.l., Via Lanzone 31, 20123 Milano. Telefono 02 94556110, email genesconsulting@genesconsulting.it.
- **Schema:** `ContactPage`, plus the `ProfessionalService` block with `address`, `telephone`, `email`, `geo`, `openingHoursSpecification` (hours are missing, see open questions).

- **H1** [Source]: Parliamone.
- **Body** [Source]: L'esperienza che semplifica, le competenze che si integrano.
- **Details:** address, phone as a `tel:` link, email as a `mailto:` link, LinkedIn, map.
- **Form** (optional, see open questions): nome, azienda o studio, email, telefono, messaggio, consenso privacy.

### 4.12 Legal pages

- `/privacy/`: full privacy policy. The signature only carries a short confidentiality notice [Source]; the site needs a complete GDPR policy from the client or their consultant.
- `/cookie/`: cookie policy, depending on which analytics are used.
- `/note-legali/`: company data (legal name, registered office, P.IVA / C.F.; REA number and share capital are missing and are mandatory on Italian company websites), plus the AI notice below.

**AI usage notice [Source, signature], to publish on `/note-legali/`:**

> GENES CONSULTING S.r.l. può avvalersi, nell'ambito delle proprie attività, di strumenti tecnologici, inclusi sistemi di intelligenza artificiale, a supporto delle attività operative e documentali, nel rispetto della normativa applicabile e delle esigenze di riservatezza e protezione dei dati. L'eventuale utilizzo di tali strumenti non sostituisce la supervisione e la valutazione umana delle attività svolte.

As on finduck, legal pages should be publishable only by an EmDash approver (Editor or higher).

---

## 5. Aggiornamenti (blog and updates)

**Purpose.** Give Genes a place to share things their public cares about, and give the site fresh, specific pages that answer real questions. For a firm like this, useful explanations of procedures are what bring organic traffic and AI citations.

**URL and naming.** `/aggiornamenti/`, labelled "Aggiornamenti" in the navigation. It matches the wording in the email signature ("Segui i nostri aggiornamenti su LinkedIn").

**Categories.**

| Category | Slug | What goes here |
| --- | --- | --- |
| Novità normative | `novita-normative` | New obligations and deadlines that affect companies, explained plainly |
| Guide pratiche | `guide-pratiche` | Step-by-step explanations of a procedure or a document |
| Digitale | `digitale` | PEC, firma digitale, SPID, pratiche telematiche |
| Vita di Genes | `genes` | Company news, new services, events |

**Post fields (EmDash).** Title, slug, excerpt (max 160 characters, reused as meta description), cover image with alt text, category, tags, author, publish date, last reviewed date, body, optional FAQ block, related service (a reference to one service page, which drives internal links in both directions).

**Editorial rules.**

- The first paragraph answers the question in the title in two or three sentences. This is the part AI assistants quote.
- One H1, then H2s phrased as the questions people ask.
- Every post links to one service page and to Contatti.
- Guides carry a visible "ultimo aggiornamento" date and are reviewed when rules change.
- Posts explain procedures. They do not give legal or tax advice, and they say so in a short standard footer.

**Starter topics [Proposed].** Ten posts that map directly onto the services. The facts in each must be checked by Genes before publishing.

| Title | Category | Links to |
| --- | --- | --- |
| Visura camerale: che cos'è, a cosa serve e come richiederla | Guide pratiche | Amministrativi e societari |
| Visura ordinaria e visura storica: le differenze | Guide pratiche | Amministrativi e societari |
| Variazioni al Registro delle Imprese: quando vanno comunicate | Guide pratiche | Amministrativi e societari |
| Deposito del bilancio: documenti e passaggi | Guide pratiche | Amministrativi e societari |
| Visura catastale: cosa contiene e quando serve | Guide pratiche | Amministrativi e societari |
| PEC aziendale e domicilio digitale: cosa deve fare un'impresa | Digitale | Digitali e documentali |
| Firma digitale: tipologie, dispositivi e rinnovo | Digitale | Digitali e documentali |
| Pratiche telematiche: cosa sono e chi può inviarle | Digitale | Digitali e documentali |
| Domiciliazione della sede: come funziona | Guide pratiche | Digitali e documentali |
| Un unico riferimento per le pratiche: come lavora Genes | Vita di Genes | Metodo |

---

## 6. FAQ bank

Short, self-contained answers. Each one is placed on the page named in the last column and marked up as `FAQPage`. Answers are [Proposed], written only from what the source states. Anything marked "to confirm" needs the client's input before publishing.

| Question | Answer | Page |
| --- | --- | --- |
| Che cosa fa Genes Consulting? | Genes Consulting offre consulenza aziendale e servizi amministrativi, societari e digitali a imprese e studi professionali. Segue pratiche, documenti e rapporti con gli enti come unico riferimento operativo. | Home, Chi siamo |
| Dove si trova Genes Consulting? | In Via Lanzone 31, 20123 Milano. | Contatti |
| A chi si rivolge Genes? | A due interlocutori: le imprese, per adempimenti societari, documenti e assistenza amministrativa continuativa, e gli studi professionali, per pratiche telematiche e attività operative complementari ai loro incarichi. | Home |
| Genes Consulting è uno studio di commercialisti o di avvocati? | No. Genes svolge consulenza aziendale non riservata e servizi operativi. Le prestazioni riservate per legge restano affidate a professionisti abilitati, con incarichi distinti. | Collaborazione |
| Come lavora Genes con i professionisti? | Quando occorrono competenze specialistiche, Genes si raccorda con professionisti abilitati e favorisce il coordinamento operativo, nel rispetto dei ruoli di ciascuno. | Collaborazione |
| Quali pratiche seguite presso il Registro delle Imprese? | Iscrizioni, variazioni e depositi. | Amministrativi e societari |
| Potete richiedere visure e certificati? | Sì. Genes richiede certificati e visure e cura le richieste presso gli enti. | Amministrativi e societari |
| Seguite anche pratiche immobiliari e catastali? | Genes offre supporto documentale immobiliare e catastale. | Amministrativi e societari |
| Potete aiutarci con PEC e firma digitale? | Sì. Genes offre supporto per PEC, firme digitali e dispositivi. | Digitali e documentali |
| Inviate pratiche telematiche per conto dei clienti? | Sì, Genes si occupa della predisposizione e dell'invio nei limiti consentiti. | Digitali e documentali |
| Offrite un servizio di domiciliazione? | Sì. Genes si occupa di organizzazione dei documenti, domiciliazione e gestione operativa della corrispondenza. Details to confirm. | Digitali e documentali |
| Lavorate solo a Milano? | To confirm with the client. | Contatti |
| Come si inizia a lavorare con Genes? | Con un primo confronto sull'esigenza. Da lì Genes prepara una proposta operativa, gestisce le attività e resta il riferimento anche dopo la consegna. | Metodo |

---

## 7. SEO and AI SEO foundations

### Topic clusters

Three pillars, each a service page, each supported by FAQ entries and blog posts that link back to it.

| Pillar page | Main queries | Supporting content |
| --- | --- | --- |
| Amministrativi e societari | pratiche camerali Milano, Registro Imprese deposito, visura camerale, certificato camerale, visura catastale | Guides on visure, variazioni, deposito bilancio |
| Digitali e documentali | PEC azienda, firma digitale Milano, pratiche telematiche, domiciliazione sede Milano | Guides on PEC, firma digitale, domiciliazione |
| Consulenza aziendale | consulenza aziendale Milano, supporto amministrativo imprese, servizi per studi professionali | Metodo, audience pages, company posts |

### Entities to name consistently

Use the full, official names at least once per page, because these are the entities search engines and language models connect to:

Genes Consulting S.r.l., Milano, Registro delle Imprese, Camera di Commercio, Pubblica Amministrazione, Catasto, visura camerale, visura catastale, PEC (Posta Elettronica Certificata), firma digitale, pratiche telematiche, domiciliazione, studi professionali, professionisti abilitati.

### Internal linking rules

- Every service page links to: the other two service pages, the relevant audience page, Collaborazione, Contatti.
- Every audience page links to each service section it mentions, using the anchors in section 3.
- Every blog post links to one service page. Every service page lists its three most recent related posts.
- Breadcrumbs on every page below Home.
- Anchor text is descriptive ("pratiche al Registro delle Imprese"), never "clicca qui".

### Structured data (JSON-LD)

| Type | Where | Key properties |
| --- | --- | --- |
| `Organization` + `ProfessionalService` | Site-wide, once | `name`, `legalName`, `url`, `logo`, `slogan`, `description`, `address`, `telephone`, `email`, `vatID`, `taxID`, `areaServed`, `sameAs` (LinkedIn) |
| `WebSite` | Home | `name`, `url`, `inLanguage: it-IT` |
| `Service` | Each service page | `name`, `description`, `provider`, `areaServed`, `audience`, `hasOfferCatalog` |
| `FAQPage` | Pages with FAQ | Questions and answers exactly as shown on the page |
| `BreadcrumbList` | All inner pages | |
| `BlogPosting` | Articles | `headline`, `datePublished`, `dateModified`, `author`, `publisher`, `image`, `about` |
| `ContactPage` | Contatti | |

### Technical checklist for the Astro build

- `<html lang="it">`, one H1 per page, headings in order.
- Unique title (under 60 characters where possible) and meta description (under 160) per page, editable in EmDash.
- Canonical URLs, trailing slash consistently on.
- `sitemap.xml` and `robots.txt`. While the site is only a preview on the workers.dev address, send `noindex` so the preview is not indexed before the real domain is attached.
- Open Graph and Twitter card per page, with a default brand image built from the banner.
- `llms.txt` at the root: the one-sentence definition, the company facts, and links to the service pages and FAQ. Do not block AI crawlers in `robots.txt`.
- Server-rendered HTML for all copy. No content that only appears after JavaScript runs.
- Images with alt text, in modern formats, with explicit sizes.
- Visible "last updated" dates on guides.

### Off-site, for the client to do

- Create or claim the Google Business Profile with the exact same name, address and phone.
- Keep the LinkedIn company page aligned with the site description.

---

## 8. EmDash content model

Suggested collections, so content edits never need a code release. Every collection also carries the `locale` and `translationKey` fields described in section 9.

| Collection | Type | Fields |
| --- | --- | --- |
| `site_settings` | Single | Company facts (section 1), payoff, tagline, social links, default SEO image |
| `pages` | Many | Title, slug, SEO title, SEO description, hero (eyebrow, heading, lead, buttons), sections (repeatable blocks) |
| `services` | Many | Area number, title, slug, lead, items (title, description, anchor), FAQ references, SEO fields |
| `audiences` | Many | Title, slug, lead, situations (text plus link to a service anchor), SEO fields |
| `values` | Many | Title, description, order |
| `method_steps` | Many | Number, title, description |
| `faqs` | Many | Question, answer, pages where shown |
| `posts` | Many | See section 5 |
| `categories` | Many | Name, slug, description |
| `legal_pages` | Many | Title, slug, body, last updated. Publishing restricted to approvers |

Section blocks for `pages`: hero, text, card grid, steps, two columns, FAQ, latest posts, call to action.

---

## 9. Internationalisation

Decision from Zam: the site launches in Italian only, with an Italian-first home page and no language switcher. The architecture is prepared for more languages from day one, in the i18next style, so adding one later is a content task and not a rebuild.

**Locales and URLs.**

- Default locale `it`, served at the root with no prefix. The URLs in section 3 are the Italian URLs and never change.
- Future locales get a prefix: `/en/`, with their own translated slugs (for example `/en/services/company-filings/`).
- Supported locales live in one config list. Today it contains only `it`.
- The language switcher and the `hreflang` tags are rendered only when that list has more than one locale, so nothing English shows up now.

**Two kinds of text, two homes.**

| Kind | Examples | Where it lives |
| --- | --- | --- |
| Interface strings | Navigation labels, button text, form labels, "Ultimo aggiornamento", breadcrumbs, 404 text | Locale files in the code, `src/i18n/locales/it/<namespace>.json`, read through i18next-style keys |
| Content | Everything in sections 4 to 6: page copy, services, FAQ, posts, legal pages | EmDash, one entry per locale |

**Key convention for interface strings.** Namespaced, lower camel case, named by meaning and not by wording:

```json
// src/i18n/locales/it/common.json
{
  "nav": {
    "about": "Chi siamo",
    "services": "Servizi",
    "forBusinesses": "Per le imprese",
    "forFirms": "Per gli studi",
    "updates": "Aggiornamenti",
    "cta": "Parliamone"
  },
  "actions": {
    "discoverServices": "Scopri i servizi",
    "contactUs": "Contattaci",
    "readMore": "Leggi tutto"
  },
  "post": {
    "lastUpdated": "Ultimo aggiornamento: {{date}}"
  }
}
```

Suggested namespaces: `common` (navigation, actions, footer), `forms`, `blog`, `seo` (title suffix, default descriptions), `errors`. No Italian text is hard-coded in components.

**Content in EmDash.** Every collection in section 8 carries two extra fields:

- `locale`: `it` for everything today.
- `translationKey`: a stable identifier shared by all language versions of the same entry (for example `service.corporate-filings`). It is what links the Italian page to its future English page for the switcher and for `hreflang`.

Slugs are per locale. `site_settings` holds the translatable company strings (payoff, tagline, description) per locale, while facts such as address, phone and VAT number are stored once. If EmDash offers built-in localisation, use that instead of the two manual fields; this is to be checked when the project is scaffolded.

**Stable keys for this document.** So the map itself is ready, pages and services are identified by these keys, independent of language:

| translationKey | Italian slug |
| --- | --- |
| `page.home` | `/` |
| `page.about` | `/chi-siamo/` |
| `page.method` | `/metodo/` |
| `page.services` | `/servizi/` |
| `service.consulting` | `/servizi/consulenza-aziendale/` |
| `service.corporate-filings` | `/servizi/amministrativi-societari/` |
| `service.digital-documents` | `/servizi/digitali-documentali/` |
| `audience.businesses` | `/per-le-imprese/` |
| `audience.firms` | `/per-gli-studi-professionali/` |
| `page.collaboration` | `/collaborazione-professionale/` |
| `page.updates` | `/aggiornamenti/` |
| `page.contact` | `/contatti/` |
| `legal.privacy` | `/privacy/` |
| `legal.cookies` | `/cookie/` |
| `legal.notes` | `/note-legali/` |

**SEO with one locale.** `<html lang="it">`, `inLanguage: it-IT` in structured data, `og:locale` set to `it_IT`. When a second locale is added: `hreflang` pairs plus `x-default` pointing to Italian, one sitemap entry per locale, and a page is only published in a language once its translation exists (no automatic fallback pages, which would create duplicate content).

**Dates and numbers** are formatted through the locale (`Intl.DateTimeFormat('it-IT')`), never as fixed strings.

---

## 10. Open questions for the client

1. **Language.** Decided: Italian only at launch, with the structure ready for more languages (section 9). No action needed from the client now.
2. **Domain.** The signature already shows `www.genesconsulting.it` and an email on that domain. Is that domain already owned, and is it the one that will point to the worker?
3. **LinkedIn.** The signature mentions LinkedIn but gives no URL.
4. **Company data.** REA number, share capital and PEC address are needed for the footer and legal notes.
5. **History and people.** Founding year, team names, roles and photos would strengthen Chi siamo. Is the client willing to publish them?
6. **Service detail.** The source lists services by name only. For each one, a short list of what is included, typical timing and what the client must provide would make the service pages far more useful. Domiciliazione in particular needs detail.
7. **Area served.** Milan only, Lombardy, or all of Italy?
8. **Opening hours.**
9. **Contact form.** Is a form wanted, and which inbox receives it? Otherwise the page shows phone and email only.
10. **Privacy and cookie policy.** Who supplies the legal text?
11. **Logo files.** The repository only has the logo inside images. A vector logo (SVG) in the light and dark versions is needed.
12. **Three areas or six.** Section 3 treats the six areas as sections of three service pages. Does the client prefer six separate pages?
13. **Blog authorship.** Who writes and who approves posts, and how often?
