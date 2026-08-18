# DCC-D-D — Loot Box Generator

Et værktøj til at generere loot boxes til et D&D-spil med fokus på pakker og kort.
Hele opsætningen — pakketyper, tiers, kort og rarity-fordelinger — redigeres i browseren
og gemmes automatisk fra session til session.

Ren statisk HTML/CSS/JS. Ingen build, ingen dependencies, intet backend.

**Spillet selv** er beskrevet i [`docs/ideen.md`](docs/ideen.md), og de 150 bedrifter der
udløser pakkerne ligger i [`docs/achievements.md`](docs/achievements.md) — med
[`docs/bogfoering.md`](docs/bogfoering.md) og et printbart tælleark
([`docs/tallysheet.html`](docs/tallysheet.html)) til det man skal holde styr på undervejs.
Denne fil handler kun om generatoren.

## Sådan kommer du i gang

**Lokalt:** åbn `index.html` direkte i en browser. Det virker også fra `file://`.

**På GitHub Pages:** *Settings → Pages*. Enten **Deploy from a branch** (vælg branch og
mappe `/ (root)`), eller **GitHub Actions** — så bruges workflowen i
`.github/workflows/pages.yml`, der deployer ved hvert push til `main`.

Første gang siden åbnes, indlæses de 216 udstyrsitems, 140 Class-kort og 450 magic items automatisk.

## Data

| Fil | Indhold |
|-----|---------|
| `data/dnd_items.xlsx` | Dit originale regneark — kilden til alt udstyr |
| `assets/data/items.js` | 216 items: 214 fra arket `Alle items` plus to ammunitionsrækker arket mangler |
| `assets/data/class-cards.js` | 140 Class-kort i fem typer (Class, Stat, Feat, Skill, Perk) |
| `assets/data/magic-items.js` | 450 magic items, heraf 9 tomes vi selv genererer |
| `assets/data/spells.js` | 202 spells fra D&D Beyond, fordelt på niveau 0–9 |
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
| Uncommon | 20 gp | 400 gp |
| Rare | 50 gp | 4.000 gp |
| Very Rare | 250 gp | 40.000 gp |
| Legendary | derover | derover |

Udstyrs-skalaen startede som regnearkets egen (10 og 40 gp), som blev verificeret mod arket
uden en eneste afvigelse. Grænserne er siden rykket til 20 og 50 gp, så mellemfeltet bliver
bredere — puljen står nu på 49 Common, 40 Uncommon, 62 Rare, 28 Very Rare og 23 Legendary.
Vil du tilbage til arkets tal, kan de rettes under Indstillinger.

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

### Rustninger får ordet "Armor" med

Arket fører de fleste rustninger under materialet alene — `Padded`, `Plate`, `Hide`. Alene
på et kort ser det forkert ud, så importen sætter det ord på som Player's Handbook selv
bruger: **Padded Armor, Leather Armor, Studded Leather Armor, Hide Armor, Splint Armor,
Plate Armor, Half Plate Armor**. Ring Mail, Chain Mail, Chain Shirt, Scale Mail,
Breastplate, Spiked Armor og Shield hedder allerede noget der læses som en rustning og
røres ikke. Rettelsen sker i `scripts/import_xlsx.py`, så regnearket kan blive som det er.

### To rækker arket mangler

Player's Handbooks ammunitionstabel har fire rækker, men regnearket har kun to af dem:

| Item | Pris | Vægt | Status |
|------|------|------|--------|
| Arrows (20) | 1 gp | 1 lb. | **tilføjet af importen** |
| Blowgun needles (50) | 1 gp | 1 lb. | i arket som `Needles` |
| Crossbow bolts (20) | 1 gp | 1½ lb. | **tilføjet af importen** |
| Sling bullets (20) | 4 cp | 1½ lb. | i arket som `Sling Bullets` |

`Arrows` og `Crossbow Bolts` ligger derfor i `MISSING_ROWS` i `scripts/import_xlsx.py` og
lægges oveni ved importen — arket kan blive som det er, og ændringen kan ses i git.
Importen springer dem over hvis arket selv får rækkerne, så navnene aldrig står to steder.
Begge er Common til 1 gp, og de gør `Ammunition +1/+2/+3` til et rigtigt rul: fem
basisitems i stedet for tre.

### Rækker der ikke skal med

Arket rummer `Net (Legacy)` — 2014-udgaven af nettets regler, side om side med den
gældende `Net`. To kort med samme navn og forskellige regler hjælper ingen, så den er
taget ud i `DROP_ROWS` i `scripts/import_xlsx.py`. Skal andre rækker samme vej, er det
listen at føje dem til.

### Når regnearket ændrer sig

Hver datafil indeholder et fingeraftryk af sit eget indhold. Appen arbejder på en kopi i
browserens localStorage, ikke på filen, så en kopi der er blevet gammel betyder forkerte
kort: gamle navne, manglende items, manglende skade.

Derfor **opdateres kopien automatisk** når fingeraftrykket ikke passer. Du får en besked om
hvad der skete — `356 items og 450 magic items (før 357 items)` — og den gamle kopi lægges
til side, så en opdatering kan fortrydes med ét klik:

| Knap | Gør |
|------|-----|
| **Fortryd — hent min gamle kopi** | ruller tilbage til det du havde, og bliver ved det |
| **Fint** | lukker beskeden |

Fortryder du, bliver versionsstemplet stående på den nye udgave, så din kopi ikke bare
bliver skiftet ud igen ved næste indlæsning. Vil du senere hente den friske udgave, ligger
**Genindlæs D&amp;D-items** og **Genindlæs Class-kort** under fanen Items.

Tidligere skulle opdateringen bekræftes manuelt, og et enkelt klik på "Behold mine" gjorde
valget permanent. Det var sådan `Padded` overlevede omdøbningen til `Padded Armor`, og
sådan våben endte med at blive printet uden skade.

## Fanerne

### Generator
Vælg pakketype, tier og antal pakker, og tryk **Generér**. Hvert kort viser item,
underkategori, beskrivelse, rarity og pris. Resultatet kan printes eller kopieres som tekst.

**Print** giver klippeklare samlekort i standardstørrelsen **63 × 88 mm** — samme mål som
Magic- og Pokémon-kort. Ni kort pr. A4-side i et 3 × 3-gitter, hvor kortene støder op til
hinanden, så ét snit deler to kort.

**Hver række er én pakke, og margenen siger hvilken.** Ud for hver række står en lodret
etiket — `ADVENTURER · GULD · PAKKE 1` — så en printet stak kan sorteres uden at læse
kortene. Etiketkolonnen er 8 mm bred, og 8 + 3 × 63 = 197 mm går lige akkurat op i A4
minus margenerne. En pakke bliver aldrig delt af et sideskift.

Knappen **+ Tilføj** lægger nye pakker oveni i stedet for at erstatte, så flere pakketyper
kan komme med i samme print. Det er dér etiketten tjener sig hjem: tre rækker, tre
forskellige bokse, hver med sit navn i margenen. **Generér** erstatter som før, og **Ryd**
tømmer.

#### Målestregen

Øverst på første ark står en **50 mm målestreg**. Den fanger den dyreste printfejl:
browseren eller printerdriveren sætter "tilpas til side", og 63 × 88 mm bliver til noget
andet, som ikke passer i kortlommer. Mål efter med en lineal, før du bruger en hel bunke
300 g papir. Stregen ligger i den ledige plads — tre rækker fylder 264 mm, målestregen
gør det til 271 mm, og der er 285 mm at tage af, så der er stadig ni kort på siden.

Under **Printindstillinger** på Generator-fanen står resten: skalering 100 %, standard­marginer
(ikke uden kant), papirtype tykt papir, og at arkene skal tørre før de stables. På Linux er
der to skaleringstrin at passe på — browserens og PDF-fremviserens (Evince og Okular har
*shrink to fit* slået til som standard) — og målestregen fanger begge.

#### Skæremærker

Ud for hver rækkes over- og underkant står en kort streg i **begge margener**. De vandrette
snit er dem der forsvinder under klemmen på en skæremaskine; mærkerne stikker ud til siden,
hvor de stadig kan ses, og to mærker over for hinanden afslører samtidig et skævt ark. De
lodrette snit følger kortenes egne rammer, som løber hele arkets højde.

Rammen om hvert kort er derfor gjort mørkere (0,25 mm i grå frem for lysegrå): den er selve
skærelinjen. Farvekanten efter type er samtidig sat ned fra 3 mm til 1,5 mm — den kan stadig
kendes på afstand, men bruger det halve blæk, og det er langt det meste af farven på arket.
Browseren afrunder kanter til hele pixels, så den lander i praksis på ca. 1,3 mm.

Layoutet er 6 mm etiketkolonne + 3 × 63 mm + 3 mm til højre = 198 mm, altså hele den
brugbare bredde på A4 med 6 mm margen.

Kortene bruger **ingen baggrundsfarver** — den farvede typekant er en ramme og stjernerne
er streger. Det betyder to ting: printet er uafhængigt af driverens "udskriv baggrunds­grafik",
og der bruges kun blæk på tekst og de ni farvede kanter. Verificeret ved at rendere arket
med alle baggrunde slået fra: kanter og stjerner står uændret.

Kortene sættes op til papir frem for skærm: hvid bund og sort tekst. Rarity vises som
**1–5 stjerner** i en lille pille — Common er én stjerne, Legendary er fem. På magic items
står stjernerne i guld og viser magic itemets **egen** rarity, ikke korttrinnet.

Venstrekanten er farvet efter **type**, så en bunke kan sorteres visuelt:

| Farve | Type |
|-------|------|
| Rød | Våben |
| Rustrød | Ammunition |
| Blå | Rustning |
| Okker | Værktøj |
| Grøn | Gift |
| Turkis | Potions og scrolls |
| Lilla | Fokus, ringe, staver, wands, wondrous items |
| Brun | Udstyr og pakker |
| Grå | Køretøjer og ridedyr |
| Guld | Class-kort |

Magic items følger deres egen type, så et magisk sværd får samme røde kant som et
almindeligt.

Våben og rustning tager deres spilmekanik med. Tallene man slår med — skade og skadetype,
AC, styrkekrav og stealth-ulempe — står fremhævet. Egenskaber som Finesse og Thrown står i
en mindre linje under, da det er regeltekst og ikke tal.

**Mastery står med sin egen regel.** Arkets våbenbeskrivelser er næsten kun kedeltekst —
en sætning om proficiency, så *"This weapon has the following mastery property. To use this
property, you must have a feature that lets you use it."*, og først derefter selve reglen.
Importen skærer kedelteksten væk og løfter reglen ud, så kortet skriver:

> **Mastery: Sap.** If you hit a creature with this weapon, that creature has Disadvantage
> on its next attack roll before the start of your next turn.

Mastery-egenskaben tages samtidig ud af egenskabslisten, så den ikke står to gange. Er der
noget tilbage i beskrivelsen ud over kedelteksten, bliver det stående — Lancens
tohåndsregel og skydevåbnenes `Reload (6 shots)`. På et magic item-kort fylder itemets egen
regeltekst pladsen, så basisvåbnets mastery nævnes dér kun ved navn.

**Generiske magic items navngives efter det basisitem de blev rullet på.** `Weapon +1`
bliver til `Shortsword +1` med kortsværdets 1d6 Piercing, `Armor of Resistance` bliver til
`Padded Armor of Resistance`, og `Walloping Ammunition` bliver til `Walloping Sling Bullets`.
Magic items med et egennavn uden generisk ord — Flame Tongue, Holy Avenger, Dragon Slayer —
beholder navnet og viser basisitemet på sin egen linje.

Kilden skriver `Armor, +1` med komma. Sammensat med basisitemet ville det blive
`Padded Armor, +1`, så kommaet fjernes ved importen — kortet hedder **`Padded Armor +1`**.

**Basisitemet tager sine egne regler med.** Et `Padded Armor +1` er stadig et Padded Armor:
det spiller som Light Armor, har samme stealth-ulempe og samme styrkekrav, og kun AC'en
flytter sig. Kortet viser basisitemets kategori dér hvor et almindeligt kort viser sin, med
**Magic** foran — det er en magisk Light Armor, ikke bare en Light Armor — og lægger
bonussen oveni tallene:

| Kort | Typelinje | Tal |
|------|-----------|-----|
| `Padded Armor +1` | Magic Light Armor | AC **12** + Dex modifier · Stealth: Disadvantage |
| `Chain Mail +2` | Magic Heavy Armor | AC **18** · Styrke 13 · Stealth: Disadvantage |
| `Shield +1` | Magic Shield | AC **+3** |
| `Maul +1` | Magic Martial Melee Weapon | 2d6 **+ 1** Bludgeoning |

Magic items uden basisrul — `Ring of Protection`, `Cloak of Elvenkind` — beholder deres
egen type på linjen (`Ring`, `Wondrous Item`), for den siger allerede at det er magi.

Bonussen læses ud af navnet (`+1`, `+2`, `+3`) og lægges til det første tal i AC eller
skade. Magic items uden et tal i navnet — `Adamantine Splint Armor`, `Sun Blade` — viser
basisitemets tal uændret.

**Lange beskrivelser skæres af med en kildehenvisning.** Der er plads til omkring 950 tegn
brødtekst på et 63 × 88 mm kort, og alt derover blev bare klippet af — sætningen sluttede
midt i et ord uden at man kunne se at der manglede noget. Nu skæres teksten ved sidste hele
sætning inden for 700 tegn, og kortet slutter med `Se Player's Handbook.` efter itemets
egen kilde. Er der ingen sætningsgrænse langt nok inde, klippes der ved et ord med `…`.

Budgettet deles med mastery-reglen, så et våben med en lang mastery får skåret sin
beskrivelse tilsvarende mere. Målt over 1.200 kort på tværs af alle pakker og tiers bliver
ingen tekst længere klippet af usynligt, og intet indhold falder uden for kortet. Kun 11
items er lange nok til at blive skåret — `Oil`, `Hunting Trap`, `Manacles` og et par
magic items.

Kortnummeret (`Kort 1/2/3`) er arbejdsdata og udelades ved print — pakkens navn står i
margenen i stedet for på hvert enkelt kort.

Under kontrollerne står puljens størrelse — og en rød advarsel hvis en fordeling peger på
en rarity der ikke findes items af.

### Pakker
Selve konfigurationen. Hver pakketype har et **filter** (kategorier og/eller tags) og et
antal **tiers**, som hver har et antal **kort** med sin egen rarity-fordeling i procent.
Summen vises live og bliver rød hvis den ikke rammer 100.

Filteret kan kombineres på to måder: *begge skal passe* (kategori **og** tag) eller
*én af delene er nok* (kategori **eller** tag). Hver pakke vælger desuden om den vil have
forbrugsvarer med, udenom, eller kun dem.

Et enkelt kort kan overstyre pakkens filter. Det er sådan en pakke garanterer én ting:
kort 3 i Weapons filtrerer på våben, kort 3 i Magic på kategorien `Magic`. Har kortet sit
eget filter, kan det også få sine **egne vægte**; se afsnittet om vægtning pr. kort.

Tag-listen er lang — magic items bragte 189 tags med — så den er foldet sammen: valgte
tags står øverst, resten ligger bag en søgning og en **+ N flere**-knap.

### Items
Importér CSV (komma, semikolon eller tab) eller JSON, via fil eller indsat tekst.
Værktøjet gætter kolonnerne og lader dig rette dem inden import. Priser forstås som
`150`, `150 GP`, `1.500`, `2,5 gp`, og `SP`/`CP`/`PP` regnes om til gp.

Har dine data en Rarity-kolonne, bliver den brugt og låst; ellers udledes rarity af prisen
via den valgte skala. Statistikfelterne øverst lyser rødt ved nul items i en rarity — det er
dér, huller i puljen bliver synlige.

### Magic
Tabellen over de 450 magic items: rarity, forbrugsvare, basisitem-rul og om de er med i
puljen. Plus en afbryder for magi i det hele taget, og chancen for upcast på spell
scrolls. Alt andet om magi sættes under Pakker, som for alt andet indhold.

### Indstillinger
Rarity-skalaer, dublet-håndtering, fallback-adfærd, udelukkede kategorier,
eksport/import af hele opsætningen som JSON — og to knapper til at komme ud af den
lokalt gemte kopi, når datafilerne er blevet opdateret.

## Pakkerne som de står nu

| Pakke | Filter | Pulje | Garanteret kort 3 |
|-------|--------|-------|-------------------|
| Adventurer | Udstyr, Våben, Rustning, Værktøj, Gift, Ammunition, Magic | 617 | — |
| Weapons | Våben, Ammunition, Udstyr **eller** tagget Weapon | 169 | et våben |
| Armor | Rustning, Udstyr **eller** tagget Armor | 116 | en rustning |
| Consumables | Gift **eller** tagget Consumable | 65 | en magisk forbrugsvare |
| Magic | Udstyr, Våben, Rustning, Værktøj, Gift, Ammunition, Magic | 617 | et magic item |
| Classes | Class | 140 | (ikke gradueret) |

Alle undtagen Classes har Bronze / Sølv / Guld. Puljetallene rummer magic items, som nu
ligger i samme liste — 806 items i alt, heraf 450 magiske.

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

Weapons, Armor, Consumables og Magic har hver et garanteret kort med sit eget filter —
se afsnittet om det. Hvor tit magi falder styres af vægten på kategorien `Magic`, som er
gradbøjet pr. tier; se afsnittet om magic items.

### Vægtning pr. kategori

Uden vægte er alle items i en rarity lige sandsynlige, og så dominerer den største
kategori. Udstyr fyldte 55 % af en bronzepakke, mens rustning lå på under 2 %.

Hver pakke kan derfor vægte sine kategorier. En vægt på 2 gør hvert item i kategorien
dobbelt så sandsynligt som et uvægtet item af samme rarity; 1 er neutralt, og 0 slår
kategorien fra uden at fjerne den fra filteret.

Vægtene kan også **overstyres pr. tier**, så en pakke kan opføre sig forskelligt i Bronze
og Guld. Adventurer bruger det ikke længere — den kører ét vægtsæt hele vejen igennem:
Våben 2, Rustning 4, Ammunition 2, resten 1.

Fordelingen det giver, målt over 15.000 pakker pr. tier:

| Tier | Våben | Udstyr | Rustning | Værktøj | Ammunition | Magic |
|------|-------|--------|----------|---------|------------|-------|
| Bronze | 32 % | 44 % | 4 % | 15 % | 5 % | 0 % |
| Sølv | 34 % | 33 % | 10 % | 17 % | 4 % | 2 % |
| Guld | 33 % | 28 % | 13 % | 18 % | 3 % | 4 % |

Rustning stiger med trinnet af sig selv: de dyre rustninger ligger på de høje rarities,
så et Guld-kort rammer dem oftere end et Bronze-kort gør.

### Vægtning pr. kort

Vægte findes på tre niveauer: **pakke → tier → kort**, hvor det mest specifikke vinder.
Kortvægte er kun tilgængelige når kortet har fået **sit eget filter** — uden det trækker
kortet fra pakkens pulje, og så er det pakkens vægte der er de rigtige. Slår du kortets
filter fra igen, ryger vægtene med.

Det giver to ting man ikke kunne før:

**En fordeling på én plads.** Sæt kortets filter til Rustning + Udstyr og vægt dem, så
pladsen bliver 50/50 i stedet for enten en garanti eller hele pakkens blanding.

**Et skub uden en garanti.** Weapons kort 3 er `kun Våben`. Tilføjer du Ammunition til
kortets filter og vægter den, dukker den op oftere uden at nogen plads er reserveret til
den — målt over 4.000 pakker på Guld kort 3:

| Opsætning | Våben | Ammunition | Magic |
|-----------|-------|------------|-------|
| Kun Våben (standard) | 87 % | — | 13 % |
| \+ Ammunition, ingen vægte | 84 % | 3 % | 13 % |
| \+ Ammunition, vægt 5 | 76 % | **12 %** | 13 % |
| \+ Ammunition, vægt 0 | 87 % | 0 % | 13 % |

Standardopsætningen bruger ikke kortvægte — de er der til at tune med.

### Vægtlisterne viser kun det niveauet faktisk rammer

Et vægtsæt kan kun påvirke de kort det er det mest specifikke for, og et kort kan kun
trække fra sit eget filter. Listen på hvert niveau følger derfor nøjagtig samme regel som
trækningen, og skjuler resten:

| Niveau | Viser |
|--------|-------|
| Pakke | kategorierne fra de kort der hverken har tier- eller kortvægte |
| Tier | kategorierne fra tierets kort uden egne kortvægte |
| Kort | kortets eget filter |

Det betyder fx at **Classes** viser `Class (31)` og ikke alle 140 kort — pakkens tre
kortpladser filtrerer på Class, Perk og Stat, og det er kun de 31 der kan falde. **Armor**
viser Rustning og Udstyr, ikke hele listen. Og et kort der kun trækker rustning viser kun
rustning, hvilket gør det tydeligt at vægtningen er overflødig dér.

Tre situationer får en note i stedet for tal:

- alle kort på niveauet har deres egne vægte → sættet bruges ikke
- kortet filtrerer kun på kategorien `Magic` (fx **Magic**-pakkens kort 3) → der er ingen
  andre kategorier at veje det imod
- puljen rummer kun én kategori → vægten gør ingen forskel

### Ét garanteret kort pr. pakke

Fire pakker garanterer **én ting på kort 3** og lader de to første trække bredere, så en
våbenpakke ikke bliver tre våben og intet andet. Garantien er den samme mekanisme hver
gang: **et filter på kortpladsen**. Det gælder også magi, som ikke længere har sin egen
vej ind.

| Pakke | Kort 1–2 | Kort 3 |
|-------|----------|--------|
| Weapons | Våben, Ammunition, Udstyr, magiske våben | **et våben** — kategori Våben *eller* tag Weapon |
| Armor | Rustning, Udstyr, magiske rustninger | **en rustning** — kategori Rustning *eller* tag Armor |
| Consumables | Gift plus alt tagget Consumable | **en magisk forbrugsvare** — kategori Magic *og* tag Consumable |
| Magic | hele udstyrspuljen plus magi | **et magic item** — kategori Magic |

Adventurer har med vilje ingen garanti. Det er den blandede pakke, og en garanti ville
gøre den til en af de andre.

Weapons' og Armors garanterede kort kan lande på et magisk våben eller en magisk rustning
— det er stadig et våben eller en rustning. Hvor tit det sker, følger magi-vægten for
tieret: 10 % i Bronze, 21 % i Sølv, 36 % i Guld.

**Weapons**

| Kort | Bronze | Sølv | Guld |
|------|--------|------|------|
| Kort 1 | 100 % C | 70 % C, 30 % U | 40 % C, 60 % U |
| Kort 2 | 85 % C, 15 % U | 50 % C, 50 % U | 80 % U, 20 % R |
| Kort 3 | 10 % C, 80 % U, 9 % R, 1 % VR | 65 % U, 30 % R, 5 % VR | 30 % U, 50 % R, 17 % VR, 3 % L |

**Armor**

| Kort | Bronze | Sølv | Guld |
|------|--------|------|------|
| Kort 1 | 80 % C, 20 % U | 50 % C, 30 % U, 20 % R | 50 % U, 50 % R |
| Kort 2 | 50 % C, 50 % U | 10 % C, 40 % U, 40 % R, 10 % VR | 50 % R, 50 % VR |
| Kort 3 | 80 % U, 15 % R, 4 % VR, 1 % L | 40 % U, 40 % R, 15 % VR, 5 % L | 50 % R, 40 % VR, 10 % L |

Prisen for garantien er gentagelser i bunden. Armor Bronze kort 3 sigter efter Uncommon,
og der findes præcis én Uncommon-rustning, så resultatet er **78 % Padded Armor** — det er
pakkens skraldeitem. Guld kort 3 ligger på Rare og opefter og rammer hele hylden.

**Magic**

| Kort | Bronze | Sølv | Guld |
|------|--------|------|------|
| Kort 1 | 78,5 % C, 12 % U, 7 % R, 2 % VR, 0,5 % L | 10 % C, 66 % U, 15 % R, 8 % VR, 1 % L | 60 % C, 30 % U, 8 % R, 2 % VR |
| Kort 2 | 78,5 % C, 12 % U, 7 % R, 2 % VR, 0,5 % L | 10 % C, 66 % U, 15 % R, 8 % VR, 1 % L | 60 % C, 30 % U, 8 % R, 2 % VR |
| Kort 3 | 78,5 % C, 12 % U, 7 % R, 2 % VR, 0,5 % L | 10 % C, 66 % U, 15 % R, 8 % VR, 1 % L | 5 % U, 45 % R, 35 % VR, 15 % L |

Magic-pakken trækker fra samme udstyrspulje som Adventurer og bruger samme vægte
(Våben 2, Rustning 4, Ammunition 2), fordi kort 1 og 2 falder tilbage på udstyr i Bronze
og Sølv — 11 % af tiden bliver de magiske i Bronze, 42 % i Sølv. I Guld har alle tre kort
kategorifilteret på, så pakken er ren magi, og de to første er tungt vægtet mod Common,
så tyngden ligger på kort 3.

Målt over 8.000 pakker pr. tier er der ingen tomme kort og ingen fallback nogen steder,
og kort 3 rammer sin kategori hver gang.

### Forbrugsvarer

Forbrugsvare er en markering på både udstyr og magic items, så alt der bruges op kan
holdes samlet ét sted. **23 af de 216 udstyrsting** er markeret: hele Gift-gruppen (13
poisons — en dosis bruges op), plus fakler, olie, vievand, rationer, papir, pergament,
blæk, parfume, lys og foder. `Ink Pen`, `Poisoner's Kit`, `Healer's Kit` og
`Herbalism Kit` er undtaget, da de er grej der kan bruges igen.

På magisiden er **84 af de 450** forbrugsvarer — se afsnittet om magic items.

Consumables-pakken bruger et **union-filter**: hele Gift-gruppen plus alt med tagget
`Consumable`. Det giver 20 udstyrsting, fordelt 5 Common, 1 Uncommon, 1 Rare, 4 Very Rare
og 9 Legendary. Puljen er altså tynd i midten, og de ni dyreste er alle gift, så pakkens
høje trin læner sig bevidst på magisiden. Kort 3 er derfor filtreret til en magisk
forbrugsvare, så pakken altid giver mindst én potion eller ét scroll.

`Healing`-tagget var med i filteret, men rammer kun **Healer's Kit** og **Herbalism Kit**
på udstyrssiden — grej man bærer rundt på, ikke noget der bruges op. Healing potions er
magic items og kommer ind via typerne `Potion` og `Scroll`, så tagget hørte ikke til her.
Begge kits er samtidig taget ud af `CONSUMABLE_NAME` i importen, så de heller ikke
forsvinder når en pakke står på "kun varigt udstyr".

Adventurer, Weapons og Armor står på **både forbrugsvarer og varigt udstyr**. Vil du have
poisons, fakler og rationer helt ud af Adventurer, er det én dropdown under Pakker —
puljen går så fra 167 til 143, og legendary-items fra 16 til 7, fordi ni af dem er gift.

Det samme gælder på magisiden: Adventurer trækker både permanente magic items og magiske
forbrugsvarer, så en healing potion eller et spell scroll kan falde som loot. Nu hvor der
kun er én rarity-akse, lander de på deres eget trin:

| Item | Rarity | Falder på |
|------|--------|-----------|
| Potion of Healing, Spell Scroll (Cantrip / 1st) | Common | Common-kort |
| Potion of Healing (Greater) | Uncommon | Uncommon-kort |
| Potion of Healing (Superior), Spell Scroll (5th) | Rare | Rare-kort |
| Potion of Healing (Supreme) | Very Rare | Very Rare-kort |
| Spell Scroll (9th) | Legendary | Legendary-kort |

Det er den store forenkling: hvor der før stod en oversættelsestabel imellem, står der nu
ingenting. Et Legendary-kort giver et Legendary magic item.

### Armor er en tynd hylde

Der findes kun **14 rustninger**, og ingen af dem er Common — den billigste er Padded Armor
til 5 gp, hvilket er Uncommon på udstyrs-skalaen. Derfor er Udstyr med i Armor-pakkens
filter: de lave trin har ellers intet at trække. Gentagelser er uundgåelige med så lille en
pulje, og på Bronze kort 3 er det Padded Armor der går igen.

**Magic** trækker fra alle 450 magic items — se afsnittet om magic items nedenfor.

## Magic items

Et magic item **er et item**. Det ligger i den samme liste som alt andet, med kategorien
`Magic` og sin D&D-type som tag — `Potion`, `Scroll`, `Weapon`, `Armor`, `Wand`, `Ring`,
`Rod`, `Staff`, `Wondrous Item`. Der er ikke noget særligt maskineri: en pakke får magi
ind med et ganske almindeligt filter, og vægten på kategorien afgør hvor tit den falder.

Sådan var det ikke før. Magic items lå i deres egen liste, en kortplads kunne *blive til*
et magic item-kort med en chance pr. korttrin, og en tabel oversatte korttrinnet til en
magi-rarity. Det var fem mekanismer der kun fandtes for magiens skyld — chance pr. pakke,
chance pr. kort, typer pr. pakke, typer pr. kort og en oversættelsestabel — og de gjorde
pakkeregler sværere at skrive, ikke lettere. De er alle sammen væk.

### Én rarity-akse

| Før | Nu |
|-----|-----|
| **Korttrin** — hvad kortpladsen slår | Samme akse |
| **Magi-rarity** — magic itemets egen rarity fra D&D | Samme akse |
| Et Rare *kort* gav som regel et Common *magic item* | Et Rare kort giver et Rare magic item |

De to var bevidst afkoblet, fordi den samme kortplads skulle servicere både udstyr og
magi: at få magi overhovedet var gevinsten, så et Rare-kort skulle ikke give en Flame
Tongue. Nu hvor hver pakke har et kort der er dedikeret til sin egen kategori, er
afkoblingen overflødig — den plads har sin egen fordeling, og den betyder hvad den siger.

Magic items får deres plads på aksen fra kilden, ikke fra en pris. Det er samme mekanik
som Class-kort bruger: `scale` er `none`, og rarityen står direkte på itemet.

**Artifacts ligger uden for de fem trin.** De 11 artifacts er i listen, men et kort kan
kun slå Common … Legendary, så de bliver aldrig trukket — præcis som før, hvor de stod på
0 % i tabellen. Vil du have dem i spil, giver du dem en af de fem rarities under Items.

### Hvor tit falder magi?

Vægten på kategorien `Magic`. Den er relativ, ikke en procentsats: vægt 0,1 gør hvert
magic item en tiendedel så sandsynligt som et uvægtet item af samme rarity. Fordi puljerne
har vidt forskellig størrelse fra trin til trin, giver den samme vægt forskellige andele i
Bronze og Guld — derfor er magi-vægten **gradbøjet pr. tier**:

| Pakke | Bronze | Sølv | Guld |
|-------|--------|------|------|
| Adventurer | 0,03 | 0,06 | 0,11 |
| Weapons | 0,09 | 0,19 | 0,33 |
| Armor | 0,02 | 0,06 | 0,25 |
| Consumables | 0,39 | 0,35 | 0,26 |
| Magic | 0,10 | 0,40 | (kortfilter) |

Tallene er regnet baglæns fra hvor tit magi skal falde på det garanterede kort. Målt over
8.000 pakker pr. tier:

| Pakke | Kort 3, Bronze | Kort 3, Sølv | Kort 3, Guld |
|-------|----------------|--------------|--------------|
| Adventurer | 6,3 % magi | 12,0 % | 19,1 % |
| Weapons | 10,1 % | 21,1 % | 35,7 % |
| Armor | 12,8 % | 20,1 % | 36,4 % |
| Consumables | 100 % | 100 % | 100 % |
| Magic | 100 % | 100 % | 100 % |

Consumables og Magic er 100 % fordi deres kort 3 filtrerer på kategorien — se afsnittet om
det garanterede kort. Skal magi helt væk, er der en enkelt afbryder under fanen Magic.

### De to rul

Trækningen er den samme som for alt andet: kortet slår et trin og henter et item. Men et
magic item kan have mere i sig, og det afgøres bagefter:

1. **Hvilket basisitem?** Er magic itemet generisk — `Weapon +1`, `Armor of Resistance`,
   `Shield +2` — rulles der hvilket konkret våben eller rustning det sidder på.
   **99 af magic itemsne har sådan et rul.** Basisitemet trækkes fra udstyrssiden;
   et magic item kan ikke sidde på et andet magic item.
2. **Hvilken spell?** Bærer itemet en spell, rulles den blandt de 202 spells på kortets
   eget niveau. Det gælder spell scrolls og tomes, hvor spellen *er* kortet, og de 27
   Enspelled-poster, hvor den er ladt i et våben, en rustning eller en stav.

Basisrullet peger enten på en **gruppe** eller på **bestemte items**. Typelinjen i kilden
afgør hvilket:

| Typelinje | Bliver til |
|-----------|------------|
| `Armor (light, medium, or heavy)` | alle 13 rustninger |
| `Armor (any medium or heavy, except hide armor)` | Medium + Heavy, minus Hide Armor |
| `Weapon (any simple or martial)` | alle våben |
| `Weapon (longsword)` | altid Longsword |
| `Weapon (glaive, greatsword, longsword, or scimitar)` | ét af de fire |

41 af de 99 er navnelister. Nævner typelinjen intet — kilden skriver bare `Armor, common`
— falder rullet tilbage på hele gruppen, så kortet aldrig står uden AC eller skade.
Fire poster har ingen basis at rulle på, fordi udstyrsarket mangler våbnet:
`Axe of the Dwarvish Lords` (battleaxe) og `Boomerang +1/+2/+3`. Tilføj Battleaxe og
Boomerang til regnearket, så ordner de sig selv.

### Forbrugsvarer holdes adskilt

En potion er ikke det samme som et permanent magic item, så hvert magic item er markeret
som enten **forbrugsvare** eller **permanent**, og hver pakke vælger hvad den må trække:
begge dele, kun permanente, eller kun forbrugsvarer.

84 af de 450 er forbrugsvarer. Markeringen kommer fra tre kilder i prioriteret rækkefølge:
typen `Potion` eller `Scroll`, kildens eget `Consumable`-tag (kun 19 poster har det), og
til sidst navnemønstre som `Dust of…`, `Oil of…`, `Philter…`, `Elemental Gem`,
`Necklace of Fireballs` og `Tome of…`. `Tome of the Stilled Tongue` er undtaget, da den er
permanent. Alt kan rettes i tabellen på Magic-fanen, også som bulk-handling på et filter.

### Typerne er tags

Typen ligger som tag på itemet, så et filter kan bede om præcis den slags magi. Det er
sådan Weapons-pakken slipper magiske våben ind uden at åbne for ringe:

```
kategorier: Våben, Ammunition, Udstyr
tags:       Weapon
kombination: Én af delene er nok (or)
```

Et rigtigt våben matcher på kategorien; et magisk våben matcher på tagget; en Ring of
Protection matcher ingen af delene. Havde kombinationen været `and`, ville filteret kræve
at *alle* items bar tagget `Weapon`, og så ville de almindelige våben ryge ud — så det er
`or` der bærer hele konstruktionen.

| Pakke | Kategorier | Tags | Kombination |
|-------|-----------|------|-------------|
| Adventurer | Ammunition, Gift, Rustning, Udstyr, Våben, Værktøj, **Magic** | — | and |
| Weapons | Våben, Ammunition, Udstyr | **Weapon** | or |
| Armor | Rustning, Udstyr | **Armor** | or |
| Consumables | Gift | **Consumable** | or |
| Magic | Ammunition, Gift, Rustning, Udstyr, Våben, Værktøj, **Magic** | — | and |
| Classes | Class | — | and |

Magiske potions og scrolls bærer selv tagget `Consumable`, så de kommer ind i Consumables
af sig selv — uden en linje kode der siger noget om magi.

Magic items bragte **189 tags** med sig ud over typerne — `Bonus: Armor Class`,
`Resistance: Fire`, `Jewelry`, `Bard` og så videre. Listen er derfor foldet sammen i
filtereditoren: de valgte står øverst, resten ligger bag en søgning og en
**+ N flere**-knap.

### Data

`data/magic_items.txt` er kilden, og `scripts/import_magic.py` laver den om til
`assets/data/magic-items.js`:

```bash
python3 scripts/import_xlsx.py    # først — magic-importen slår basisitems op i denne
python3 scripts/import_magic.py
```

Rækkefølgen betyder noget: `import_magic.py` læser navnene fra `assets/data/items.js` for
at kunne oversætte `Weapon (longsword)` til et rul på det rigtige våben.

450 magic items, hvoraf 92 er foldet ud fra varianttabeller — `Potion of Healing`
bliver til fire poster, `Ioun Stone` til fjorten, `Belt of Giant Strength` til seks.

Tre poster kunne ikke tages med, fordi kilden ikke angiver deres varianters rarity:
**Horn of Valhalla**, **Rod of the Pact Keeper** og **Wand of the War Mage**. Vil du
have dem med, skal de tilføjes manuelt.

### Spell scrolls og tomes

En spell scroll bærer ikke en bestemt spell, men et **niveau**. Når kortet trækkes, rulles
der en spell af netop det niveau, og kortet hedder så `Scroll of Fireball` med spellens
egne tal og tekst: skole, casting time, rækkevidde og komponenter. Dér hvor et almindeligt
kort skriver sin type — `Tool`, `Medium Armor`, `Simple Weapon` — står i stedet
`Spell Scroll (3rd level)`.

**Tomes** er den permanente udgave — man læser bogen og lærer spellen for altid. En tome
ligger derfor **ét rarity-trin over** scrollen med samme spellniveau:

| Spellniveau | Spell Scroll | Tome |
|-------------|--------------|------|
| Cantrip, 1st | Common | Uncommon |
| 2nd, 3rd | Uncommon | Rare |
| 4th, 5th | Rare | Very Rare |
| 6th, 7th, 8th | Very Rare | Legendary |
| 9th | Legendary | **findes ikke** |

Der er intet trin over Legendary, så der findes ingen tome til 9.-niveau spells — de
stærkeste spells kan kun findes som scroll og bruges én gang.

Tomes er homebrew og genereres af `scripts/import_magic.py` ud fra scroll-posterne. De er
markeret som forbrugsvarer, da bogen bruges op, selvom gevinsten er permanent.

#### Upcasting

Et scroll er skrevet i et bestemt slot, og spellen i det slot behøver ikke være af samme
niveau — et Magic Missile skrevet som 5.-niveau er *upcastet*. Under fanen **Magic** sætter
du **chancen for upcast** (standard 30 %). Slår den til, ruller kortet en spell fra et
tilfældigt lavere niveau, men beholder sit eget:

```
Scroll of Magic Missile
Spell Scroll (5th level)
Evocation · Upcastet fra 1st
```

To ting upcaster aldrig: **cantrips** (de skalerer med karakterniveau, ikke med slot) og
**tomes** (bogen lærer dig spellen, hvorefter du bruger dine egne slots — kortets niveau er
spellens eget). Et scroll på 1. niveau har heller ikke noget lavere trin at hente fra.

### Enspelled Armor, Staff og Weapon

Kilden fører dem som `Enspelled Weapon (1)` … `(8)` plus `(Cantrip)`. Tallet er
**spellniveauet**, ikke et løbenummer, og det er også det der bestemmer rarity, save DC og
attack bonus. Kortet ruller derfor sin egen spell, og navnet bærer den i stedet for tallet:

```
Enspelled Morningstar (Speak with Dead)
Magic Martial Melee Weapon · attunement
1d8 Piercing
Mastery: Sap
3rd level Necromancy · Save DC 15 · +7 to hit
The weapon has 6 charges and regains 1d6 expended charges daily at dawn …
```

Modsat et scroll er kortet ikke *spellen* — det er stadig et våben man slår med, så
basisitemets skade, egenskaber og mastery bliver stående. Den ladte spell får sin egen
linje med niveau, skole, save DC og attack bonus.

Hver familie binder kun spells fra bestemte skoler, og begrænsningen læses ud af kildens
egen tekst:

| Item | Skoler | Basisitem |
|------|--------|-----------|
| Enspelled Armor | Abjuration, Illusion | ruller en rustning |
| Enspelled Weapon | Conjuration, Divination, Evocation, Necromancy, Transmutation | ruller et våben |
| Enspelled Staff | alle | — |

Beskrivelsen trimmes: kildens *"Bound into this weapon is a spell … must belong to the …
school of magic"* er netop det kortet nu selv svarer på, så kun ladningsreglerne står
tilbage.

Spell-listen kommer fra `data/spells.txt`:

```bash
python3 scripts/import_spells.py
```

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

Et magic item er det samme objekt med kategorien `Magic`, typen som første tag, og et par
felter mere:

```json
{
  "name": "Flame Tongue",
  "category": "Magic",
  "subcategory": "Weapon",
  "price": null,
  "rarity": "rare",
  "rarityLocked": true,
  "scale": "none",
  "tags": ["Weapon", "Damage: Fire", "Attunement"],
  "attunement": true,
  "consumable": false,
  "baseFilter": { "subcategories": ["Simple Melee Weapon", "Martial Melee Weapon"] },
  "spellLevel": null,
  "typeLine": "Weapon (any melee weapon), rare (requires attunement)"
}
```

Rarity-nøgler er `common`, `uncommon`, `rare`, `very_rare`, `legendary` — eller `null`
for items uden rarity. Magic items kan desuden være `artifact`, som ingen kortplads kan
slå. `scale` er `gear`, `magic` eller `none`. `enabled: false` tager et item ud af alle
puljer uden at slette det.

## Lagring

Alt gemmes i browserens `localStorage` under `dccdd.config.v1` og `dccdd.items.v1`
(magic items ligger i den sidste sammen med alt andet). Det er bundet til den enkelte
browser på den enkelte maskine — brug eksport-knapperne, hvis opsætningen skal deles eller
sikkerhedskopieres.

Den gemte kopi opdateres automatisk når datafilerne i repoet er nyere, med ét klik til at
fortryde. Vil man ud af den manuelt, ligger der to knapper under Indstillinger:
**Hent data forfra** kasserer items og beholder pakkerne, og **Ryd alt** sletter appens
fem nøgler og genindlæser siden.

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
