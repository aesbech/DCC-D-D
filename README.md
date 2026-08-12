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

Første gang siden åbnes, indlæses de 215 items fra regnearket, 140 Class-kort og 441 magic items automatisk.

## Data

| Fil | Indhold |
|-----|---------|
| `data/dnd_items.xlsx` | Dit originale regneark — kilden til alt udstyr |
| `assets/data/items.js` | 215 items genereret fra arket `Alle items` |
| `assets/data/class-cards.js` | 140 Class-kort i fem typer (Class, Stat, Feat, Skill, Perk) |
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

### Items uden pris

Regnearkets rarity-formel er `IF(pris < 2; "Common"; …)`, og en tom celle tæller som 0.
Derfor stod prisløst moderne udstyr — granatkastere, laserrifler, revolvere — som Common.
Importen bruger derfor kun arkets Rarity-kolonne når der faktisk er en pris; uden pris
får et item ingen rarity og bliver aldrig trukket.

Det gælder pt. 13 items: syv skydevåben, tre eksplosiver, en energicelle og to generiske
fokus-rækker. De er markeret i statistikken på Items-fanen. Skal de med i spillet, så
filtrér på **Uden rarity** og brug bulk-vælgeren over tabellen til at sætte dem alle på
én gang.

Prisen læses desuden fra tekstkolonnen når `Pris (GP)` er tom — det er tilfældet for de
store skibe, som derfor nu får deres rigtige pris (Keelboat 3.000 gp, Galley 30.000 gp)
og dermed Legendary.

### Når regnearket ændrer sig

`items.js` indeholder et fingeraftryk af sit eget indhold. Har du kørt importen igen og
deployet, opdager appen at dens datafiler er nyere end det browseren har gemt, og viser
et banner med valget mellem at genindlæse eller beholde sine egne rettelser.

## Fanerne

### Generator
Vælg pakketype, tier og antal pakker, og tryk **Generér**. Hvert kort viser item,
underkategori, beskrivelse, rarity og pris. Resultatet kan printes eller kopieres som tekst.

**Print** giver klippeklare samlekort i standardstørrelsen **63 × 88 mm** — samme mål som
Magic- og Pokémon-kort. Ni kort pr. A4-side i et 3 × 3-gitter, hvor kortene støder op til
hinanden, så ét snit deler to kort.

Kortene sættes op til papir frem for skærm: hvid bund, sort tekst og ingen farvekode.
Rarity vises i stedet som **1–5 stjerner** i en lille pille — Common er én stjerne,
Legendary er fem. På magic items står stjernerne i guld og viser magic itemets **egen**
rarity, ikke korttrinnet.

Våben og rustning tager deres spilmekanik med: skade og skadetype, mastery, egenskaber som
Finesse og Thrown, AC, styrkekrav og stealth-ulempe. Er et magic item rullet på et
basisvåben, står basisitemets tal også på kortet.

Kortnummer (`Kort 1/2/3`) og pakkeoprindelse er arbejdsdata og udelades ved print.

Under kontrollerne står puljens størrelse — og en rød advarsel hvis en fordeling peger på
en rarity der ikke findes items af.

### Pakker
Selve konfigurationen. Hver pakketype har et **filter** (kategorier og/eller tags) og et
antal **tiers**, som hver har et antal **kort** med sin egen rarity-fordeling i procent.
Summen vises live og bliver rød hvis den ikke rammer 100.

Filteret kan kombineres på to måder: *begge skal passe* (kategori **og** tag) eller
*én af delene er nok* (kategori **eller** tag). Hver pakke vælger desuden om den vil have
forbrugsvarer med, udenom, eller kun dem.

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
| Adventurer | Udstyr, Våben, Rustning, Værktøj, Gift, Ammunition | 166 | Bronze / Sølv / Guld |
| Weapons | Våben + Ammunition | 48 | Bronze / Sølv / Guld |
| Armor | Rustning | 14 | Bronze / Sølv / Guld |
| Consumables | alle forbrugsvarer | 24 + 75 magiske | Bronze / Sølv / Guld |
| Magic | alle magic items | 441 | Bronze / Sølv / Guld |
| Classes | Class | 140 | Standard (ikke gradueret) |

### Adventurer

Fokus, køretøjer, ridedyr og udstyrspakker er valgt fra — en galej eller en ridehest
hører ikke hjemme i en almindelig pakke.

| Kort | Bronze | Sølv | Guld |
|------|--------|------|------|
| Kort 1 | 100 % C | 20 % C, 80 % U | 25 % C, 50 % U, 25 % R |
| Kort 2 | 50 % C, 50 % U | 80 % U, 20 % R | 75 % U, 25 % R |
| Kort 3 | 96 % U, 3,7 % R, 0,2 % VR, 0,1 % L | 60 % U, 35 % R, 4 % VR, 1 % L | 40 % U, 45 % R, 12 % VR, 3 % L |

Verificeret over 20.000 simulerede pakker pr. tier: alle ni fordelinger rammer inden for
0,4 procentpoint, og der er hverken fallback, tomme kort eller dubletter.

Øvrige pakketyper er startgæt, tænkt til at blive tunet i UI'et.

### Forbrugsvarer

Forbrugsvare er en markering på både udstyr og magic items, så alt der bruges op kan
holdes samlet ét sted. **24 af de 215 udstyrsting** er markeret: hele Gift-gruppen (13
poisons — en dosis bruges op), plus fakler, olie, vievand, rationer, papir, pergament,
blæk, parfume, lys, foder og healer's kit. `Ink Pen` og `Poisoner's Kit` er undtaget, da
de er værktøj der kan bruges igen.

På magisiden er **75 af de 441** forbrugsvarer — se afsnittet om magic items.

Consumables-pakken bruger nu markeringen frem for et kategori- og tagfilter, så den fanger
alt uanset hvor det står i regnearket. Puljen er tynd i midten (kun to uncommon), og de ni
dyreste er alle gift, så pakkens høje trin læner sig bevidst på magic item-kortene: Guld
er 29 % magiske, mod 2 % i Bronze.

Adventurer, Weapons og Armor står på **både forbrugsvarer og varigt udstyr**. Vil du have
poisons, fakler og rationer helt ud af Adventurer, er det én dropdown under Pakker —
puljen går så fra 166 til 142, og legendary-items fra 16 til 7, fordi ni af dem er gift.

Det samme gælder på magisiden: Adventurer trækker både permanente magic items og magiske
forbrugsvarer, så en healing potion eller et spell scroll kan falde som loot. Hvilket
korttrin de lander på følger af deres magi-rarity:

| Item | Magi-rarity | Kommer typisk på |
|------|-------------|------------------|
| Potion of Healing, Spell Scroll (Cantrip / 1st) | Common | allerede et Rare-kort |
| Potion of Healing (Greater) | Uncommon | Rare og opefter |
| Potion of Healing (Superior), Spell Scroll (5th) | Rare | Very Rare og opefter |
| Potion of Healing (Supreme) | Very Rare | Very Rare / Legendary |
| Spell Scroll (9th) | Legendary | Legendary |

Det falder ud som ønsket uden særregler: de mindste kommer helt ned på Rare-kort, de
største kræver de høje trin.

### To pakker der kræver din opmærksomhed

**Armor** har kun 14 items, og ingen af dem er Common — den billigste er Padded til 5 gp,
hvilket er Uncommon på udstyrs-skalaen. Pakkens fordelinger starter derfor ved Uncommon,
og Bronze kort 1 er den eneste der sigter efter Uncommon, fordi der kun findes ét sådant
item. Gentagelser på tværs af pakker er uundgåelige med så lille en pulje.

**Magic** trækker nu fra de 441 magic items — se afsnittet om magic items nedenfor.

## Magic items

Et magic item kommer ikke i puljen på linje med almindelige items. I stedet kan en
kortplads **blive til et magic item-kort**, og så følger to rul mere.

### To slags rarity

Ordet "rarity" dækker over to forskellige ting, og det er værd at holde adskilt:

| Begreb | Hvad det er | Værdier |
|--------|-------------|---------|
| **Korttrin** | Hvad en kortplads i en pakke slår. Styres af fordelingen på kortet. | Common … Legendary |
| **Magi-rarity** | Magic itemets egen rarity fra D&D. | Common … Artifact |

De to er bevidst afkoblet: et **Rare kort** giver som regel et **Common magic item**.

### De tre rul

1. **Bliver kortet magisk?** Kortpladsen har allerede slået sit korttrin. Pakkens
   magic item-chance for netop det trin afgør, om kortet bliver et magic item i stedet
   for et almindeligt item. Sættes pr. pakke under fanen Pakker.
2. **Hvilken magi-rarity?** Tabellen under fanen Magic oversætter korttrinnet til en
   fordeling over magi-rarity.
3. **Hvilket basisitem?** Er magic itemet generisk — `Weapon, +1`, `Armor of Resistance`,
   `Shield, +2` — rulles der til sidst hvilket konkret våben eller rustning det sidder på.
   52 af de 441 magic items har sådan et rul.

Standardtabellen for rul 2:

| Korttrin | Common | Uncommon | Rare | Very Rare | Legendary |
|----------|--------|----------|------|-----------|-----------|
| Common | 100 % | | | | |
| Uncommon | 90 % | 10 % | | | |
| Rare | 70 % | 25 % | 5 % | | |
| Very Rare | 40 % | 40 % | 18 % | 2 % | |
| Legendary | 10 % | 30 % | 40 % | 17 % | 3 % |

Artifacts står på 0 % overalt. De 11 artifacts ligger i listen, men trækkes aldrig,
før du selv giver dem vægt.

### Forbrugsvarer holdes adskilt

En potion er ikke det samme som et permanent magic item, så hvert magic item er markeret
som enten **forbrugsvare** eller **permanent**, og hver pakke vælger hvad den må trække:
begge dele, kun permanente, eller kun forbrugsvarer.

75 af de 441 er forbrugsvarer. Markeringen kommer fra tre kilder i prioriteret rækkefølge:
typen `Potion` eller `Scroll`, kildens eget `Consumable`-tag (kun 19 poster har det), og
til sidst navnemønstre som `Dust of…`, `Oil of…`, `Philter…`, `Elemental Gem`,
`Necklace of Fireballs` og `Tome of…`. `Tome of the Stilled Tongue` er undtaget, da den er
permanent. Alt kan rettes i tabellen på Magic-fanen, også som bulk-handling på et filter.

### Chance pr. pakke

| Pakke | Rare | Very Rare | Legendary | Typer | Forbrugsvarer |
|-------|------|-----------|-----------|-------|---------------|
| Adventurer | 10 % | 20 % | 30 % | alle | kun permanente |
| Weapons | 15 % | 25 % | 40 % | Weapon | kun permanente |
| Armor | 15 % | 25 % | 40 % | Armor | kun permanente |
| Consumables | 25 % | 40 % | 55 % | alle | **kun forbrugsvarer** |
| Magic | 100 % | 100 % | 100 % | alle | begge dele |
| Classes | — | — | — | — | — |

Typefiltret sikrer, at en Weapons-pakke ikke deler ringe ud. Consumables-pakken bruger
ikke længere et typefilter — den tager alle forbrugsvarer, så den også fanger `Dust of
Disappearance` og andre wondrous items der bruges op. Magic-pakken har 100 % på alle trin,
så hvert kort er et magic item; dens korttrin ligger til gengæld højt, fordi trinnet nu
kun bruges som opslag i tabellen ovenfor.

### Data

`data/magic_items.txt` er kilden, og `scripts/import_magic.py` laver den om til
`assets/data/magic-items.js`:

```bash
python3 scripts/import_magic.py
```

441 magic items, hvoraf 92 er foldet ud fra varianttabeller — `Potion of Healing`
bliver til fire poster, `Ioun Stone` til fjorten, `Belt of Giant Strength` til seks.

Tre poster kunne ikke tages med, fordi kilden ikke angiver deres varianters rarity:
**Horn of Valhalla**, **Rod of the Pact Keeper** og **Wand of the War Mage**. Vil du
have dem med, skal de tilføjes manuelt.

## Classes-pakken

Class-kortene er ikke items, men det der mekanisk sker med spilleren. De er delt i **fem
korttyper**, som ligger som tag på hvert kort, så en kortplads kan bede om præcis én type:

| Type | Indhold | Antal | Rarities |
|------|---------|-------|----------|
| **Class** | Class levels for de 12 klasser | 12 | Very Rare |
| **Stat** | Attribut +1 og +2 | 12 | Common, Very Rare |
| **Feat** | Origin feats, fighting styles, general feats, epic boons | 73 | Common → Legendary |
| **Skill** | Proficiency og expertise i de 18 færdigheder | 36 | Uncommon, Rare |
| **Perk** | Mekaniske fordele udenfor de fire ovenstående (homebrew) | 7 | Uncommon, Rare |

Pakken har tre kortpladser — én Class, én Perk, én Stat — og hver plads har en fordeling
der matcher netop den types rarities, så der hverken bliver fallback eller tomme kort.
Verificeret over 24.000 kort: nul fejltyper, nul fallback.

**Feat- og Skill-kortene har ingen plads endnu.** De ligger klar med 73 og 36 kort; vil du
have dem med, så tilføj et kort på tieren og vælg typen som tag.

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
assets/data/magic-items.js     magic items
scripts/import_xlsx.py         regneark → items.js
scripts/import_magic.py        magic_items.txt → magic-items.js
data/dnd_items.xlsx            kilderegnearket
data/magic_items.txt           kildeliste over magic items
```
