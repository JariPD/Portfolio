# Design System — Portfolio Website Jari Dijk

> Referentiedocument voor ontwikkeling. Alle kleuren, spacing, typografie en designprincipes voor de portfolio website van Jari Dijk.

---

## Project Links

| Fase | Link |
|------|------|
| **Prototype (HTML/CSS/JS)** | [github.com/JariPD/Portfolio](https://github.com/JariPD/Portfolio) |
| **Prototype (live)** | [jaridijk.netlify.app](https://jaridijk.netlify.app/) |
| **Productie (Next.js)** | *(volgt — Vercel deployment)* |

---

## Prototype Feedback & Verbeterpunten voor Next.js

Op basis van de usability tests uit LU20 zijn de volgende punten geïdentificeerd voor de productieversie.

### Geïmplementeerd in prototype

- Single-page layout met alle secties (Hero, About, Skills, Projects, Experience, Blog, Contact)
- Project modal met afbeeldingsgallerij, tech tags, probleem/aanpak/rol en GitHub/demo knoppen
- Login en registratiepagina naast elkaar
- User dashboard met statusbadges en postlijst
- Admin paneel met moderatie-interface
- Blog schrijfformulier met titel en inhoudsformulier
- Authenticatie gesimuleerd via localStorage

### Afwijkingen t.o.v. wireframes

| Onderdeel | Afwijking |
|-----------|-----------|
| Navigatietaal | Engels i.p.v. Nederlands — bewuste keuze voor bredere doelgroep |
| Demo-link statusindicatie | Nog niet geïmplementeerd in project modal |

### Verbeterpunten voor Next.js (productie)

Deze komen voort uit usability tests met drie deelnemers (20 maart 2026) en presentatiefeedback op het prototype:

1. **Indienknop blogpost** — De "Post insturen" knop zat verborgen achter het dashboard. Een secondary button wordt toegevoegd bij het blogoverzicht zodat ingelogde gebruikers direct een post kunnen aanmaken (kritiek, D1/D2/D3 — 33% zelfstandig slagingspercentage)
2. **Bevestigingsmelding blogpost** — De melding na indienen verdween te snel. Duur wordt verhoogd naar ±7 seconden zodat de gebruiker de statusbevestiging daadwerkelijk ziet (kritiek, D3)
3. **Thumbnails op projectkaarten** — Deelnemers misten afbeeldingen in het projectoverzicht. Echte screenshots worden gekoppeld aan projectcards in de productieversie (suggestie, D3)
---

## Inhoudsopgave

- [Kleuren](#kleuren)
- [Typografie](#typografie)
- [Spacing & Grid](#spacing--grid)
- [Componenten](#componenten)
- [Designprincipes](#designprincipes)
- [Pagina-structuur](#pagina-structuur)

---

## Kleuren

### Primaire kleuren

| Preview | Naam | Hex | Gebruik |
|---------|------|-----|---------|
| 🟦 | Donkerblauw | `#1A365D` | Headers, navigatie, primaire tekst |
| 🔵 | Accent blauw | `#3182CE` | Links, buttons, interactieve elementen |
| ⬜ | Wit | `#FFFFFF` | Achtergrond, witruimte |

### Secundaire kleuren

| Preview | Naam | Hex | Gebruik |
|---------|------|-----|---------|
| 🔲 | Lichtgrijs | `#F7FAFC` | Sectie-achtergronden, cards |
| ⬛ | Donkergrijs | `#2D3748` | Body tekst |

### Status / Feedback kleuren

| Preview | Naam | Hex | Gebruik |
|---------|------|-----|---------|
| 🟢 | Groen | `#38A169` | Success, bevestigingen, gepubliceerd |
| 🔴 | Rood | `#E53E3E` | Error, foutmeldingen, afgewezen |
| 🟠 | Oranje | `#DD6B20` | Warning, status "in afwachting" |

### CSS Custom Properties
```css
:root {
  /* Primair */
  --color-primary:        #1A365D;
  --color-accent:         #3182CE;
  --color-white:          #FFFFFF;

  /* Secundair */
  --color-gray-light:     #F7FAFC;
  --color-gray-border:    #E2E8F0;
  --color-gray-text:      #718096;
  --color-text:           #2D3748;

  /* Status */
  --color-success:        #38A169;
  --color-error:          #E53E3E;
  --color-warning:        #DD6B20;
}
```

---

## Typografie

**Font:** [Inter](https://fonts.google.com/specimen/Inter) — specifiek ontworpen voor schermen, uitstekende leesbaarheid op alle formaten.
```html
<!-- Google Fonts import -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Hiërarchie

| Element | Grootte | Gewicht | Gebruik |
|---------|---------|---------|---------|
| H1 | `48px` | `700` Bold | Hero titel (naam) |
| H2 | `32px` | `600` Semi-bold | Sectietitels |
| H3 | `20px` | `600` Semi-bold | Card titels |
| Body | `16px` | `400` Regular | Standaard tekst |
| Small | `14px` | `400` Regular | Metadata, labels, datum |
| Button | `16px` | `500` Medium | Knoppen |
| Tag | `12px` | `500` Medium | Tech tags, status badges |

### CSS
```css
body {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  font-weight: 400;
  color: var(--color-text);
  line-height: 1.6;
}

h1 { font-size: 48px; font-weight: 700; color: var(--color-primary); }
h2 { font-size: 32px; font-weight: 600; color: var(--color-primary); }
h3 { font-size: 20px; font-weight: 600; color: var(--color-text); }

.text-small { font-size: 14px; color: var(--color-gray-text); }
.text-tag   { font-size: 12px; font-weight: 500; font-family: 'Courier New', monospace; }
```

> **Let op:** Tech tags (React, Next.js, C#, etc.) gebruiken een monospace font om een developer-esthetiek te geven.

---

## Spacing & Grid

**Base unit: `8px`** — alle spacing is een veelvoud van 8.

### Spacing tokens

| Token | Waarde | Gebruik |
|-------|--------|---------|
| `--space-1` | `8px` | Minimale ruimte, inline elementen |
| `--space-2` | `16px` | Ruimte tussen elementen |
| `--space-3` | `24px` | Gutter tussen cards/kolommen |
| `--space-4` | `32px` | Padding binnen cards |
| `--space-8` | `64px` | Sectie padding top/bottom |

### Component hoogtes

| Component | Hoogte | Reden |
|-----------|--------|-------|
| Header | `64px` | Sticky navigatie |
| Primaire button | `48px` | Minimale touch target |
| Secundaire button | `48px` | - |
| Input veld | `44px` | Touch-friendly (Fitts's Law) |

### Grid systeem
```
Container:    1000px gecentreerd (max-width)
Kolommen:     12-koloms grid
Gutter:       24px
Sectie pad:   64px top / 64px bottom

Desktop (>1024px):   3 kolommen voor project cards
                     2 kolommen voor blog previews
Tablet (768–1024px): 2 kolommen
Mobiel (<768px):     1 kolom
```

### CSS
```css
:root {
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-8: 64px;

  --container-width: 1000px;
  --gutter: 24px;
}

.container {
  max-width: var(--container-width);
  margin: 0 auto;
  padding: 0 var(--space-3);
}

section {
  padding: var(--space-8) 0;
}
```

---

## Componenten

### Buttons
```
Primair:     Achtergrond #3182CE | Tekst wit | Hoogte 48px | Border-radius 6px
Secundair:   Border #3182CE | Tekst #3182CE | Transparante achtergrond | Hoogte 40px
Destructief: Achtergrond #E53E3E | Tekst wit | Hoogte 40px
```
```css
.btn-primary {
  background-color: var(--color-accent);
  color: var(--color-white);
  height: 48px;
  padding: 0 24px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

.btn-primary:hover {
  background-color: #2B6CB0; /* iets donkerder accent */
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-accent);
  height: 40px;
  padding: 0 20px;
  border: 1.5px solid var(--color-accent);
  border-radius: 6px;
}

.btn-danger {
  background-color: var(--color-error);
  color: var(--color-white);
  height: 40px;
}
```

### Cards (Projecten)
```
Achtergrond:   #FFFFFF
Border:        1px solid #E2E8F0
Border-radius: 8px
Padding:       24px
Shadow:        0 2px 8px rgba(0,0,0,0.08)
Hover shadow:  0 4px 16px rgba(0,0,0,0.14)
```

### Status Badges (Blogposts)

| Status | Kleur | Achtergrond |
|--------|-------|-------------|
| Gepubliceerd | `#38A169` | `#F0FFF4` |
| In afwachting | `#DD6B20` | `#FFFAF0` |
| Afgewezen | `#E53E3E` | `#FFF5F5` |
```css
.badge { font-size: 12px; font-weight: 500; padding: 2px 10px; border-radius: 12px; }
.badge-published  { color: #38A169; background: #F0FFF4; }
.badge-pending    { color: #DD6B20; background: #FFFAF0; }
.badge-rejected   { color: #E53E3E; background: #FFF5F5; }
```

### Formuliervelden
```
Hoogte:        44px (touch-friendly)
Border:        1px solid #E2E8F0
Border-radius: 6px
Focus border:  #3182CE
Padding:       0 12px
Font-size:     16px
```

### Header (Navigatie)
```
Hoogte:      64px
Positie:     sticky, top: 0
Achtergrond: #FFFFFF met box-shadow bij scrollen
Z-index:     100
```

---

## Designprincipes

De volgende vijf principes zijn leidend voor alle ontwerp- en ontwikkelkeuzes.

### 1. Visual Hierarchy
Stuur de aandacht van de gebruiker via grootte, gewicht en positie.
- H1 48px → H2 32px → Body 16px, nooit omgekeerd
- CTA-knoppen zijn altijd de meest opvallende interactieve elementen op de pagina
- De hero sectie is als eerste zichtbaar bij het laden

### 2. Consistency
Dezelfde elementen zien er altijd hetzelfde uit en gedragen zich hetzelfde.
- Eén kleurenpalet, consequent toegepast
- Alle knoppen van hetzelfde type hebben identieke stijl, padding en hover-effecten
- Spacing volgt altijd het 8px grid — geen uitzonderingen
- Header (64px) en container (1000px) zijn identiek op elke pagina

### 3. Progressive Disclosure
Toon eerst een overzicht, details pas op verzoek.
- Projectcards tonen alleen thumbnail, titel en korte beschrijving
- Volledige details verschijnen in een modal (niet op een nieuwe pagina)
- Blog toont alleen titel, auteur en datum in het overzicht

### 4. Feedback
Elke actie van de gebruiker krijgt een zichtbare reactie.
- Buttons tonen een hover state en active state
- Formuliervelden tonen inline validatie (groen bij correct, rood bij fout)
- Na het versturen van een formulier verschijnt een bevestigingsmelding
- Blogpost statussen zijn altijd zichtbaar voor de auteur (badge)
- Loading states tonen bij het ophalen van data

### 5. Responsive Design
De website werkt op alle schermformaten.
- Grid: 3 kolommen → 2 kolommen → 1 kolom
- Navigatie wordt een hamburger menu op mobiel (`< 768px`)
- Alle touch targets zijn minimaal `44×44px`
- Tekst is leesbaar zonder horizontaal scrollen

---

## Pagina-structuur

### Homepage (Single Page)
```
┌─────────────────────────────────────────┐
│ HEADER — 64px sticky                    │
│ Logo | Navigatie | Login                │
├─────────────────────────────────────────┤
│ HERO — padding 64px                     │
│ Naam (H1) | Functietitel | Tagline      │
│ Skills samenvatting | CTA Button        │
│                         [Profielfoto]   │
├─────────────────────────────────────────┤
│ OVER MIJ — padding 64px                 │
│ Introductietekst | Statistieken         │
├─────────────────────────────────────────┤
│ VAARDIGHEDEN — 3 kolommen               │
│ Frontend | Backend | Tools              │
├─────────────────────────────────────────┤
│ PROJECTEN — 3 kolommen card grid        │
│ [Card] [Card] [Card]                    │
├─────────────────────────────────────────┤
│ WERKERVARING — timeline 800px           │
│ Periode | Functie | Bedrijf             │
├─────────────────────────────────────────┤
│ BLOG — 2 kolommen                       │
│ [Preview] [Preview]                     │
├─────────────────────────────────────────┤
│ CONTACT — formulier 600px               │
│ Naam | Email | Bericht | Verstuur       │
│ Social icons                            │
└─────────────────────────────────────────┘
```

### Project Modal
```
┌─ Overlay (dim achtergrond) ────────────┐
│ ┌─ Modal 900px ───────────────────────┐│
│ │ Project Details (H2)           [✕]  ││
│ │                                     ││
│ │ [Hoofdafbeelding]  Titel (H2)       ││
│ │ [Thumb 1][2][3][4] [Tech tags]      ││
│ │                    Beschrijving     ││
│ │                    Probleem         ││
│ │                    Aanpak           ││
│ │                    Mijn rol         ││
│ │                                     ││
│ │ [Live Demo] [GitHub]                ││
│ │ ← Vorige               Volgende →  ││
│ └─────────────────────────────────────┘│
└────────────────────────────────────────┘
```

### User Dashboard
```
HEADER — Logo | Portfolio | Blog | [User] ▼
─────────────────────────────────────────
Mijn Dashboard (H1)        [+ Nieuwe post]

[Gepubliceerd] [In afwachting] [Afgewezen]
   [aantal]        [aantal]      [aantal]

Mijn blogposts (H2)
─────────────────────────────────────────
[badge] Titel                Datum [🗑]
[badge] Titel                Datum [🗑]
```

### Admin Panel
```
HEADER — Logo | Portfolio | Blog | Admin | Jari (Admin) ▼
──────────────────────────────────────────────────────────
Blog Moderatie (H1)

[In afwachting] [Gepubliceerd] [Afgewezen]
   [aantal]        [aantal]      [aantal]

Posts ter beoordeling (H2)
──────────────────────────────────────────────────────────
[Status] Titel | Auteur | Datum   [Accepteren] [Afwijzen]
         Preview tekst...
──────────────────────────────────────────────────────────
[Status] Titel | Auteur | Datum   [Accepteren] [Afwijzen]
         Preview tekst...
```

---

> **Versie:** 1.1 — Jari Dijk (24102725) — Portfolio Website Redesign