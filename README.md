# DCC-D-D — Loot Box Generator

Et værktøj til at generere loot boxes til et D&D-spil med fokus på pakker og kort.
Hele opsætningen — pakketyper, tiers, kort og rarity-fordelinger — kan redigeres i browseren
og gemmes automatisk fra session til session.

Ren statisk HTML/CSS/JS. Ingen build, ingen dependencies, intet backend.

## Sådan kommer du i gang

**Lokalt:** åbn `index.html` direkte i en browser. Det virker også fra `file://`.

**På GitHub Pages:** gå til *Settings → Pages* i repoet, vælg **Deploy from a branch**,
sæt branch til den branch du vil publicere fra og mappe til `/ (root)`. Siden ligger så på
`https://<brugernavn>.github.io/DCC-D-D/`.

Der ligger også en workflow i `.github/workflows/pages.yml` hvis du hellere vil deploye
via GitHub Actions — så skal du vælge **GitHub Actions** som kilde under *Settings → Pages*.

## Fanerne

### Generator
Vælg pakketype, tier og antal pakker, og tryk **Generér**. Hvert kort viser item, kategori,
rarity og pris. Du kan printe resultatet (der er et print-stylesheet) eller kopiere det som tekst.

### Pakker
Her ligger selve konfigurationen:

- **Pakketyper** — de seks er sat op fra start (Adventurer, Weapons, Armor, Consumables, Magic,
  Classes), og du kan tilføje, omdøbe og slette frit.
- **Kategorier pr. pakke** — bestemmer hvilke items pakken trækker fra. Ingen valgt = alle items.
- **Tiers** — Bronze/Sølv/Guld som standard. Du kan tilføje, kopiere og slette tiers, så en
  pakketype uden gradueringer bare får ét tier.
- **Kort** — hvert kort har sin egen rarity-fordeling i procent. Summen vises live og bliver
  rød hvis den ikke rammer 100. Et kort kan overstyre pakkens kategorier, hvis fx kort 3 i en
  Adventurer-pakke kun skal trække magiske ting.

Adventurer Bronze er sat op præcis som specificeret:

| Kort | Fordeling |
|------|-----------|
| Kort 1 | 100 % Common |
| Kort 2 | 90 % Common, 10 % Uncommon |
| Kort 3 | 95 % Uncommon, 4 % Rare, 1 % Very Rare |

Sølv og Guld samt de fem øvrige pakketyper er udfyldt med rimelige gæt som **placeholders** —
de er ment til at blive tunet i UI'et.

### Items
Importér din itemliste som **CSV** (komma, semikolon eller tab) eller **JSON**, enten via fil
eller ved at indsætte tekst. Ved CSV gætter værktøjet hvilke kolonner der er navn, kategori,
pris osv., og du retter det i dropdowns før import.

Priser forstås i flere formater: `150`, `150 gp`, `1.500`, `2,5 gp`, og `sp`/`cp`/`pp` regnes
om til gp. Har en række allerede en rarity-kolonne, bliver den brugt og låst; ellers udledes
rarity af prisen.

Statistikfelterne øverst viser hvor mange items du har i hver rarity. **Rammer et felt nul,
lyser det rødt** — det er dét, der afslører huller i din data, fx at en pakke er sat til at
trække Very Rare fra en kategori hvor du ikke har nogen.

### Indstillinger
- **Rarity ud fra pris** — tærsklerne i gp. Standard: Common 0, Uncommon 101, Rare 501,
  Very Rare 5.001, Legendary 50.001. Ret dem og tryk *Genberegn* — items hvor du selv har
  sat rarity manuelt bliver ikke rørt.
- **Undgå dubletter** — sikrer at samme item ikke optræder to gange i samme pakke.
- **Hvis puljen er tom** — hvad der skal ske når et kort trækker en rarity der ikke findes
  items af: fald ned til nærmeste lavere, brug nærmeste i begge retninger, eller vis et tomt
  kort så du kan se hullet.
- **Eksport/import** — hele opsætningen kan hentes som JSON og lægges i repoet eller flyttes
  til en anden maskine.

## Datamodel

Et item:

```json
{
  "name": "Flame Tongue",
  "category": "Weapon",
  "price": 5500,
  "rarity": "very_rare",
  "rarityLocked": false,
  "source": "DMG"
}
```

Rarity-nøgler er `common`, `uncommon`, `rare`, `very_rare`, `legendary`.

## Lagring

Alt gemmes i browserens `localStorage` under `dccdd.config.v1` og `dccdd.items.v1`.
Det er bundet til den enkelte browser på den enkelte maskine — så brug eksport-knapperne,
hvis opsætningen skal deles eller sikkerhedskopieres.

## Filer

```
index.html                 markup og faner
assets/css/app.css         styling, inkl. print-layout
assets/js/core.js          datamodel, prisparsing, CSV/JSON-import, trækning
assets/js/ui.js            UI og hændelser
assets/js/sample-items.js  ~150 eksempel-items til at teste med
```
