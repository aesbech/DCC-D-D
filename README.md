# DCC-D-D — Loot Box Generator

Et værktøj til at generere loot boxes til et D&D-spil med fokus på pakker og kort.
Hele opsætningen — pakketyper, tiers, kort og rarity-fordelinger — redigeres i browseren
og gemmes automatisk fra session til session.

Ren statisk HTML/CSS/JS. Ingen build, ingen dependencies, intet backend.

## Sådan kommer du i gang

**Lokalt:** åbn `index.html` direkte i en browser. Det virker også fra `file://`.

**På GitHub Pages:** *Settings → Pages*. Enten **Deploy from a branch** (vælg branch og
mappe `/ (root)`), eller **GitHub Actions** — så bruges workflowen i
`.github/workflows/pages.yml`, der deployer ved hvert push til `main`.

Første gang siden åbnes, indlæses de 215 items fra regnearket plus 104 Class-kort automatisk.

## Data

| Fil | Indhold |
|-----|---------|
| `data/dnd_items.xlsx` | Dit originale regneark — kilden til alt udstyr |
| `assets/data/items.js` | 215 items genereret fra arket `Alle items` |
| `assets/data/class-cards.js` | 104 Class-kort (levels, attributter, feats, perks) |
| `scripts/import_xlsx.py` | Konverterer regnearket til `items.js` |

Har du opdateret regnearket, så kør konverteringen igen:

```bash
pip install openpyxl
python3 scripts/import_xlsx.py
```

### To rarity-skalaer

Dit regneark bruger to helt forskellige prisskalaer, og begge er lagt ind i appen:

| Rarity | Udstyr (til og med) | Magic Items (til og med) |
|--------|--------------------|--------------------------|
| Common | 2 gp | 100 gp |
| Uncommon | 10 gp | 400 gp |
| Rare | 40 gp | 4.000 gp |
| Very Rare | 250 gp | 40.000 gp |
| Legendary | derover | derover |

Udstyrs-skalaen er verificeret mod arket: den reproducerer rarity for alle 210 items med
en pris, uden en eneste afvigelse. Magic-skalaen ligger klar til når du får dine magic items
ind — vælg blot **Magic Items** som prisskala under importen.

Items uden pris får ingen rarity og bliver aldrig trukket. Det gælder pt. fem skibe
(Keelboat, Longship, Sailing Ship, Warship, Galley), som er markeret i statistikken på
Items-fanen. Sæt en rarity på dem manuelt, hvis de skal med i puljen.

## Fanerne

### Generator
Vælg pakketype, tier og antal pakker, og tryk **Generér**. Hvert kort viser item,
underkategori, beskrivelse, rarity og pris. Resultatet kan printes (der er et print-stylesheet)
eller kopieres som tekst.

Under kontrollerne står puljens størrelse — og en rød advarsel hvis en fordeling peger på
en rarity der ikke findes items af.

### Pakker
Selve konfigurationen. Hver pakketype har et **filter** (kategorier og/eller tags) og et
antal **tiers**, som hver har et antal **kort** med sin egen rarity-fordeling i procent.
Summen vises live og bliver rød hvis den ikke rammer 100.

Filteret kan kombineres på to måder: *begge skal passe* (kategori **og** tag) eller
*én af delene er nok* (kategori **eller** tag). Consumables bruger det sidste, så pakken
rammer både hele Gift-gruppen og alt med tagget Consumable eller Healing.

Et enkelt kort kan overstyre pakkens filter — fx hvis kort 3 i en Adventurer-pakke kun
skal trække magiske ting.

### Items
Importér CSV (komma, semikolon eller tab) eller JSON, via fil eller indsat tekst.
Værktøjet gætter kolonnerne og lader dig rette dem inden import. Priser forstås som
`150`, `150 GP`, `1.500`, `2,5 gp`, og `SP`/`CP`/`PP` regnes om til gp.

Har dine data en Rarity-kolonne, bliver den brugt og låst; ellers udledes rarity af prisen
via den valgte skala. Statistikfelterne øverst lyser rødt ved nul items i en rarity — det er
dér, huller i puljen bliver synlige.

### Indstillinger
Rarity-skalaer, dublet-håndtering, fallback-adfærd, udelukkede kategorier og
eksport/import af hele opsætningen som JSON.

## Pakkerne som de står nu

| Pakke | Filter | Pulje | Tiers |
|-------|--------|-------|-------|
| Adventurer | alt undtagen Class | 210 | Bronze / Sølv / Guld |
| Weapons | Våben + Ammunition | 48 | Bronze / Sølv / Guld |
| Armor | Rustning | 14 | Bronze / Sølv / Guld |
| Consumables | Gift **eller** tag Consumable/Healing | 22 | Bronze / Sølv / Guld |
| Magic | Magic Item | 0 | Bronze / Sølv / Guld |
| Classes | Class | 104 | Standard (ikke gradueret) |

Adventurer Bronze er sat op præcis som specificeret:

| Kort | Fordeling |
|------|-----------|
| Kort 1 | 100 % Common |
| Kort 2 | 90 % Common, 10 % Uncommon |
| Kort 3 | 95 % Uncommon, 4 % Rare, 1 % Very Rare |

Verificeret over 20.000 simulerede pakker: 100 % / 90,0 + 10,0 / 94,9 + 3,9 + 1,1.

Øvrige tiers og pakketyper er startgæt, tænkt til at blive tunet i UI'et.

### To pakker der kræver din opmærksomhed

**Armor** har kun 14 items, og ingen af dem er Common — den billigste er Padded til 5 gp,
hvilket er Uncommon på udstyrs-skalaen. Pakkens fordelinger starter derfor ved Uncommon,
og Bronze kort 1 er den eneste der sigter efter Uncommon, fordi der kun findes ét sådant
item. Gentagelser på tværs af pakker er uundgåelige med så lille en pulje.

**Magic** er tom indtil du har importeret dine magic items. Giv dem kategorien
`Magic Item` og vælg prisskalaen **Magic Items** under importen, så virker pakken med det samme.

## Classes-pakken

Class-kortene er ikke items, men det der mekanisk sker med spilleren. De har ingen pris,
så deres rarity er sat manuelt. Fordelingen er et **forslag**:

| Rarity | Indhold | Antal |
|--------|---------|-------|
| Common | Attribut +1, Origin feats | 18 |
| Uncommon | Fighting Style feats, simple perks | 15 |
| Rare | General feats, stærkere perks | 44 |
| Very Rare | Class levels, attribut +2 | 18 |
| Legendary | Epic Boons | 9 |

Class levels ligger på Very Rare, fordi de er pakkens egentlige gevinst. Rediger frit i
Items-fanen, eller udskift hele `assets/data/class-cards.js` med dit eget indhold.

Kategorien `Class` er sat på listen over kategorier der aldrig trækkes af en pakke uden
filter — så Class-kort ikke lækker ind i Adventurer-pakken. Det er verificeret over
9.000 trukne kort.

## Datamodel

```json
{
  "name": "Longsword",
  "category": "Våben",
  "subcategory": "Martial Melee Weapon",
  "price": 15,
  "priceText": "15 GP",
  "rarity": "rare",
  "rarityLocked": false,
  "scale": "gear",
  "source": "Player's Handbook",
  "tags": ["Damage", "Combat"],
  "desc": "..."
}
```

Rarity-nøgler er `common`, `uncommon`, `rare`, `very_rare`, `legendary` — eller `null`
for items uden rarity. `scale` er `gear`, `magic` eller `none`.

## Lagring

Alt gemmes i browserens `localStorage` under `dccdd.config.v1` og `dccdd.items.v1`.
Det er bundet til den enkelte browser på den enkelte maskine — brug eksport-knapperne,
hvis opsætningen skal deles eller sikkerhedskopieres.

## Filer

```
index.html                     markup og faner
assets/css/app.css             styling, inkl. print-layout
assets/js/core.js              datamodel, prisparsing, import, trækning
assets/js/ui.js                UI og hændelser
assets/data/items.js           items fra regnearket
assets/data/class-cards.js     Class-pakkens indhold
scripts/import_xlsx.py         regneark → items.js
data/dnd_items.xlsx            kilderegnearket
```
