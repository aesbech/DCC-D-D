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

Første gang siden åbnes, indlæses de 216 udstyrsitems, 186 Class-kort og 450 magic items automatisk.

## Data

| Fil | Indhold |
|-----|---------|
| `data/dnd_items.xlsx` | Dit originale regneark — kilden til alt udstyr |
| `assets/data/items.js` | 216 items: 214 fra arket `Alle items` plus to ammunitionsrækker arket mangler |
| `assets/data/class-cards.js` | 186 Class-kort i fem typer (Class, Stat, Feat, Skill, Perk) |
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
Selve konfigurationen. Hver pakketype har et **filter** (kategorier og forbrugsvarer), et
**flow-panel** med de fem indstillinger, og et antal **tiers** med hver deres **kort** —
som begge har deres eget flow-panel. Summen af en fordeling vises live og bliver rød hvis
den ikke rammer 100.

Filteret er to ting: hvilke **kategorier** der må trækkes, og om **forbrugsvarer** er med,
udenom eller alene. Ingen kategorier valgt betyder alle — undtagen dem der er udelukket
under Indstillinger.

Et enkelt kort kan overstyre pakkens filter. Det er sådan en pakke garanterer én ting:
kort 3 i Weapons filtrerer på våben.

Filteret bestemmer **udstyrspuljen**. Hvad der så trækkes af den — og om kortet
overhovedet bliver et udstyrskort — sættes i panelet **Flowet** lige under. De to ting er
uafhængige.

Der er ikke en tag-akse i filteret. Typen ligger i kategorien for alt indhold — også for
Class-kortene, hvis fem typer er deres kategori — så et tag-filter kunne ikke sige noget
kategorien ikke allerede siger. Tags ligger stadig på itemsne som metadata.

### Items
Importér CSV (komma, semikolon eller tab) eller JSON, via fil eller indsat tekst.
Værktøjet gætter kolonnerne og lader dig rette dem inden import. Priser forstås som
`150`, `150 GP`, `1.500`, `2,5 gp`, og `SP`/`CP`/`PP` regnes om til gp.

Har dine data en Rarity-kolonne, bliver den brugt og låst; ellers udledes rarity af prisen
via den valgte skala. Statistikfelterne øverst lyser rødt ved nul items i en rarity — det er
dér, huller i puljen bliver synlige.

### Magic
Den fælles tabel **korttrin → magi-rarity**, og tabellen over de 450 magic items: rarity,
forbrugsvare, basisitem-rul og om de er med i puljen. Plus en afbryder for magi i det hele
taget og chancen for upcast på spell scrolls. Hvor *tit* magi falder, sættes derimod under
Pakker som en vægt — det er ikke en magi-indstilling længere.

### Indstillinger
Rarity-skalaer, dublet-håndtering, fallback-adfærd, udelukkede kategorier,
eksport/import af hele opsætningen som JSON — og to knapper til at komme ud af den
lokalt gemte kopi, når datafilerne er blevet opdateret.

## Den fysiske farvekode

Pakkerne pakkes i farvet papir og forsegles med voks. **Papiret siger hvilken pakke det er;
voksen siger hvilket tier.** To kanaler, hver med én betydning, så en pakke kan aflæses på
tværs af bordet uden at nogen siger noget.

| Pakke | Papir | Segl |
|-------|-------|------|
| Adventurer | Orange | bronze / sølv / guld efter tier |
| Weapons | Rød | bronze / sølv / guld efter tier |
| Armor | Blå | bronze / sølv / guld efter tier |
| Consumables | Mørkegrøn | bronze / sølv / guld efter tier |
| Magic | Lavendel | bronze / sølv / guld efter tier |
| Classes | Guldgul | **sort** — Classes er ikke gradueret |

De seks papirfarver er valgt så ingen to ligger ved siden af hinanden i kulør: gul → orange
→ rød → lavendel → blå → grøn. Pastelfarverne er valgt fra, fordi mættet papir læses på
afstand og føles som indpakning frem for kuvert.

Farven står i hver pakkes beskrivelse under Pakker, så den er ved hånden når der printes.

**Sæt seglet på flappen, ikke hen over kortene.** Varm voks slår igennem tyndt papir, og
pakken åbnes ved at brække seglet — bruddet skal ikke rive det øverste kort med.

## Pakkerne som de står nu

| Pakke | Filter (udstyrssiden) | Pulje | Magi | Garanteret kort 3 |
|-------|----------------------|-------|------|-------------------|
| Adventurer | Udstyr, Våben, Rustning, Værktøj, Gift, Ammunition | 167 | 6–18 %, alle typer | — |
| Weapons | Våben, Ammunition, Udstyr | 105 | 8–32 %, kun Weapon | et våben |
| Armor | Rustning, Udstyr | 78 | 8–32 %, kun Armor | en rustning |
| Consumables | alle kategorier, kun forbrugsvarer | 23 | 40–100 %, Potion og Scroll | en magisk forbrugsvare |
| Magic | Udstyr, Våben, Rustning, Værktøj, Gift, Ammunition | 167 | 10–100 %, alle typer | et magic item |
| Classes | Class, Stat, Feat, Skill, Perk | 186 | — | (ikke gradueret) |

Adventurer og Magic vægter udstyrssiden hver sin vej — se afsnittet om vægtning.

Alle undtagen Classes har Bronze / Sølv / Guld. Puljetallet er udstyrssiden; magisiden er
de 450 magic items, som trækkes for sig når chancen siger ja. I alt 806 items.

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
se afsnittet om det. Hvor tit magi falder, og hvad den så bliver, sættes pr. kort under
Pakker; se afsnittet om magic items.

### Vægtning: lodder i en hat

Uden vægte er alle items i en rarity lige sandsynlige, og så dominerer den største gruppe.
Udstyr fyldte 55 % af en bronzepakke, mens rustning lå på under 2 %.

**Vægten er antal lodder, ikke en faktor pr. kort.** Skriver du

```
Rustning 2    Våben 1    Udstyr 1
```

er der fire lodder i hatten: to på rustning og ét på hver af de andre. Altså **50 %
rustning og 25 % til hver af de to** — uanset at der er 67 udstyrsting og kun 14
rustninger. Tallet du taster ind *er* andelen.

Derfor trækkes der i to trin: først en gruppe efter vægt, så et item inden i gruppen.
Kun grupper der faktisk har et brugbart item ved den rarity er med i hatten, så lodder
ikke går til spilde på en tom hylde — beder et kort om Uncommon, og har rustning ingen
Uncommon-item tilbage, fordeles dens lodder på resten.

1 er neutralt, 0 slår gruppen fra uden at fjerne den fra filteret. Ved siden af hvert felt
står den andel vægten giver, så tallet kan aflæses direkte.

Vægtene ligger i **Flowet** — *Hvilken type* på begge grene — og findes på pakke, tier og
kort. Ja-grenen bruger magic itemets type i stedet for kategorien; samme greb, samme
procenter ved siden af.

**Kategorier du ikke nævner har ét lod hver.** Det er dét der gør vægtene korte at skrive:
i Adventurer står der kun to tal, og resten følger med af sig selv.

Adventurer kører ét sæt hele vejen igennem — 29 lodder i alt:

| Kategori | Lodder | Andel | Målt, Bronze | Målt, Guld |
|----------|-------:|------:|-------------:|-----------:|
| Udstyr | 20 | 69 % | 70 % | 59 % |
| Værktøj | 5 | 17 % | 17 % | 15 % |
| Våben | *1* | 3 % | 3 % | 3 % |
| Rustning | *1* | 3 % | 1 % | 2 % |
| Ammunition | *1* | 3 % | 3 % | 2 % |
| Gift | *1* | 3 % | 0 % | 1 % |

De kursiverede står ikke i opsætningen; de er det underforståede ene lod. De målte tal på
Guld ligger lavere hele vejen ned, fordi magi tager 18 % af pladserne dér.

Magic-pakken vægter modsat. Dens udstyrsside er kun det man kan få *i stedet for* magi, så
den læner mod det der ligner et magic item — `Våben 2, Rustning 4, Ammunition 2`, og
Udstyr, Værktøj og Gift på deres ene lod.

Hvor de målte tal afviger fra lodderne, er det fordi gruppen mangler items ved den rarity
kortet beder om: der findes ingen Common-rustning og ingen billig gift, så de grupper er
slet ikke i hatten på de lave trin. Det er meningen — et lod på en tom hylde ville bare
give tomme kort.

**Alt vægtet til nul er ikke et valg, det er en tom hat.** Sætter man hver eneste gruppe
til 0, er der intet at trække, og kortet ville falde tilbage til den anden gren uden at
sige det. Derfor tæller et gennemført nul som "ikke sat", og niveauet ovenover gælder —
samme regel som en rarity-fordeling med lutter nuller. `Potion 0` alene betyder stadig
"alt andet end potions".

### Ét garanteret kort pr. pakke

Fire pakker garanterer **én ting på kort 3** og lader de to første trække bredere, så en
våbenpakke ikke bliver tre våben og intet andet. Garantien laves med to skruer, alt efter
om det garanterede er udstyr eller magi:

| Pakke | Kort 3 er garanteret | Sådan |
|-------|----------------------|-------|
| Weapons | et våben | kortfilter `Våben` + magisiden låst til typen `Weapon` |
| Armor | en rustning | kortfilter `Rustning` + magisiden låst til typen `Armor` |
| Consumables | en magisk forbrugsvare | magic item-chance **100 %** + typer `Potion`, `Scroll` |
| Magic | et magic item | magic item-chance **100 %** |

Adventurer har med vilje ingen garanti. Det er den blandede pakke, og en garanti ville
gøre den til en af de andre.

Weapons og Armor bruger begge skruer på én gang: filteret sikrer at udstyrssiden kun kan
give et våben, og typevægtene at magisiden kun kan give et magisk våben. Uanset hvilken
vej trækningen går, er kortet et våben. Hvor tit det bliver magisk, følger chancen for
tieret: 8 % i Bronze, 18 % i Sølv, 32 % i Guld.

Consumables og Magic har ikke brug for et filter — chancen på 100 % gør arbejdet alene.

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
og Sølv — 10 % af tiden bliver de magiske i Bronze, 45 % i Sølv. I Guld har alle tre kort
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

Consumables-pakken vælger **ingen kategorier og "kun forbrugsvarer"**. Det giver alle 23
markerede udstyrsting — hele Gift-gruppen plus fakler, olie, vievand, rationer og resten.
Puljen er tynd i midten og tung i toppen, fordi de dyreste alle er gift, så pakkens høje
trin læner sig bevidst på magisiden. Kort 3 er 100 % magisk, så pakken altid giver mindst
én potion eller ét scroll.

Tidligere brugte pakken et union-filter — Gift-gruppen **eller** tagget `Consumable` — men
de syv tagged items er en delmængde af de 23 markerede, så forbrugsvare-valget dækker det
hele og rammer bredere.

**Healer's Kit** og **Herbalism Kit** er taget ud af `CONSUMABLE_NAME` i importen: de er
grej man bærer rundt på, ikke noget der bruges op, og de skal ikke forsvinde når en pakke
står på "kun varigt udstyr".

Adventurer, Weapons og Armor står på **både forbrugsvarer og varigt udstyr**. Vil du have
poisons, fakler og rationer helt ud af Adventurer, er det én dropdown under Pakker —
puljen går så fra 167 til 143, og legendary-items fra 16 til 7, fordi ni af dem er gift.

Det samme gælder på magisiden: Adventurer trækker både permanente magic items og magiske
forbrugsvarer, så en healing potion eller et spell scroll kan falde som loot. Hvilket
korttrin de lander på, følger af oversættelsen:

| Item | Magi-rarity | Kommer typisk på |
|------|-------------|------------------|
| Potion of Healing, Spell Scroll (Cantrip / 1st) | Common | allerede et Rare-kort |
| Potion of Healing (Greater) | Uncommon | Rare og opefter |
| Potion of Healing (Superior), Spell Scroll (5th) | Rare | Very Rare og opefter |
| Potion of Healing (Supreme) | Very Rare | Very Rare / Legendary |
| Spell Scroll (9th) | Legendary | Legendary |

De mindste kommer helt ned på Rare-kort, de største kræver de høje trin — uden særregler,
fordi oversættelsen gør arbejdet.

### Værktøj lærer man undervejs

Et værktøjskort er ingen hjælp hvis man ikke må bruge det, og ingen pakke deler
proficiencies ud. Derfor bærer **alle 35 værktøjskort deres egen regel** nederst på kortet:

> **Learn the tool:** If you lack proficiency, you can practise during a Long Rest and
> roll 1d20 + Intelligence. On a 15 or higher you gain proficiency with the tool.

Det er den eneste del af "Parts of a Background" der ikke allerede har et kort — ability
scores er Stat-kortene, feat'et er Origin-feats, færdighederne er Skill-kortene og udstyret
er hele resten af pakkerne. Tool proficiency var det sidste hul, og det lukkes med et slag
i stedet for et kort. Reglen står i `TOOL_RULE` i `assets/js/ui.js` og trykkes automatisk
på alt i kategorien `Værktøj`; teksten er trukket fra kortets tekstbudget, så beskrivelsen
beskæres i stedet for at flyde ud over kortet.

### Armor er en tynd hylde

Der findes kun **14 rustninger**, og ingen af dem er Common — den billigste er Padded Armor
til 5 gp, hvilket er Uncommon på udstyrs-skalaen. Derfor er Udstyr med i Armor-pakkens
filter: de lave trin har ellers intet at trække. Gentagelser er uundgåelige med så lille en
pulje, og på Bronze kort 3 er det Padded Armor der går igen.

**Magic** trækker fra alle 450 magic items — se afsnittet om magic items nedenfor.

## Magic items

Et magic item **er et item**. Det ligger i den samme liste som alt andet, med kategorien
`Magic` og sin D&D-type som tag — `Potion`, `Scroll`, `Weapon`, `Armor`, `Wand`, `Ring`,
`Rod`, `Staff`, `Wondrous Item`.

Det gør dem nemme at finde og redigere ét sted, og det lader typen bruges som filter.
Men magi trækkes ikke sammen med udstyret — den har sin egen pulje og sin egen chance,
sat pr. kort. Kæden nedenfor er hele historien.

### Flowet: ét spørgsmål, to grene

Et kort stiller ét spørgsmål og går derefter ned ad én af to grene. De to grene har
**præcis de samme to knapper** — kun puljen er forskellig:

```
                     Magic item?          ← chance i procent, ét felt
                    /            \
                  nej             ja
                   |               |
             Hvilken rarity   Hvilken rarity     ← vægtet fordeling
             Hvilken type     Hvilken type       ← vægt pr. type
                   |               |
             Standard Item    Magic Item
             udstyrspuljen    450 magic items
```

Det er **fem indstillinger**, og alle fem findes på **pakke, tier og kort**. Hvert felt
arver for sig, så man kan sætte chancen på ét kort og lade resten følge pakken:

| Felt | Hvad det gør | Arver fra |
|------|--------------|-----------|
| `magicChance` | Chancen for at kortet bliver magisk, 0–100 % | tier → pakke |
| `magicDist` | Rarity-fordeling på Magic-grenen | tier → pakke → fælles tabel |
| `magicTypes` | Typevægte på Magic-grenen | tier → pakke |
| `dist` | Rarity-fordeling på Standard-grenen | tier → pakke |
| `weights` | Kategorivægte på Standard-grenen | tier → pakke |

Panelet hedder **Flowet** og ligger under Pakker: én gang for pakken, én gang for hvert
tier, og én gang for hvert kort. Det ser ud som diagrammet — spørgsmålet øverst, de to
grene ved siden af hinanden nedenunder.

**Panelerne er foldet sammen.** En gradueret pakke har tretten af dem, og de fleste rører
ingenting, så overskriften bærer sammenfatningen i stedet:

```
▸ Flowet for dette kort   [Standard 30/50/17/3] [Magic 32 %] [rarity fælles tabel]   1 egen
```

Chipsene viser hvad der **gælder**, uanset hvor det kommer fra. En markeret chip er sat på
netop dette niveau; de umarkerede er arvet. Typevægte vises kun når de er sat lokalt —
arvede vægte ville stå ens på hver eneste række uden at sige noget nyt. Badgen til højre
tæller hvor mange af de fem felter niveauet selv bestemmer, så man kan se hvor der er
skruet på noget uden at åbne noget.

Tiers kan foldes på samme måde, og der er **Fold alle ud / Fold alle sammen** øverst.
En gradueret pakke fylder 3.000 px foldet sammen mod 11.700 px foldet ud.

**Chancen** er ét felt. Lader man det stå tomt, arves tallet fra niveauet over — der
skal ikke et flueben til for at sige "ikke sat". Bliver kortet ikke magisk, går det ned ad
Standard-grenen. Udstyr og
magi er to adskilte puljer, så de konkurrerer ikke om pladsen — chancen afgør det alene.
Derfor optræder kategorien `Magic` heller ikke i pakkefiltrene: filteret bestemmer
udstyrspuljen, ikke om der bliver magi.

**Grenene vises kun når de er i spil.** Er chancen 0, kan kortet aldrig blive magisk, og
Magic-grenen skjules; er den 100, trækker kortet aldrig almindeligt, og Standard-grenen
skjules. Et Classes-kort viser derfor kun én gren, og Magic-pakkens guldkort ligeså.

**Rarity på Magic-grenen** holdes adskilt fra Standard-grenens, og det er med vilje. Et Rare kort
er 20–50 gp på udstyrssiden — et pænt stykke grej. Et Rare magic item er en Flame Tongue.
Uden en egen fordeling oversættes korttrinnet derfor af den fælles tabel under fanen Magic:

| Korttrin | Common | Uncommon | Rare | Very Rare | Legendary |
|----------|--------|----------|------|-----------|-----------|
| Common | 100 % | | | | |
| Uncommon | 90 % | 10 % | | | |
| Rare | 70 % | 25 % | 5 % | | |
| Very Rare | 40 % | 40 % | 18 % | 2 % | |
| Legendary | 10 % | 30 % | 40 % | 17 % | 3 % |

Sætter man en fordeling på kortet, springes tabellen over, og fordelingen gælder uanset
hvad nej-grenen slår. Det er det Magic-pakken gør. Ja-grenen har **Artifact** med som
sjette mulighed; den står på 0 overalt, så de 11 artifacts trækkes aldrig af sig selv.

**Typevægte** virker ens på begge grene og er lodder på samme måde: ni typer med vægt 1
giver 11 % hver, uanset at der er 228 wondrous items og 13 scrolls. Sætter du `Scroll` til
2, får scrolls 20 %. 0 slår typen fra. Ved siden af hvert felt står den andel vægten giver,
så tallet ikke skal gættes.

På Magic-grenen er typen magic itemets D&D-type (`Potion`, `Scroll`, `Weapon`, `Armor`,
`Wand`, `Ring`, `Rod`, `Staff`, `Wondrous Item`). På Standard-grenen er det itemets
kategori (`Våben`, `Rustning`, `Udstyr`, `Værktøj`, `Gift`, `Ammunition`, og Class-kortenes
`Class`, `Stat`, `Feat`, `Skill`, `Perk`). Samme greb, to ordlister.

**Fjerde rul** sker af sig selv: er magic itemet generisk (`Weapon +1`), rulles
basisvåbnet; bærer det en spell, rulles spellen. Se afsnittet nedenfor.

### Sådan står pakkerne

| Pakke | Chance B / S / G | Typer |
|-------|------------------|-------|
| Adventurer | 6 / 12 / 18 % | alle |
| Weapons | 8 / 18 / 32 % | kun Weapon |
| Armor | 8 / 18 / 32 % | kun Armor |
| Consumables | 40 / 55 / 70 %, kort 3 = **100 %** | kun Potion og Scroll |
| Magic | 10 / 45 / 100 %, kort 3 = **100 %** | alle |
| Classes | — | — |

Magic-pakken sætter desuden magi-rarity pr. kort, fordi det er dér hele pointen ligger:

| Tier | Kort 1 og 2 | Kort 3 |
|------|-------------|--------|
| Bronze | 85 / 12 / 3 | 78,5 / 12 / 7 / 2 / 0,5 |
| Sølv | 25 / 60 / 12 / 3 | 10 / 66 / 15 / 8 / 1 |
| Guld | 60 / 30 / 8 / 2 | 5 U / 45 R / 35 VR / **15 L** |

Målt over 8.000 pakker pr. tier rammer både chancer og fordelinger inden for en
procentpoint, og der er ingen tomme kort.

**Artifacts** står på 0 % overalt. De 11 artifacts ligger i listen, men trækkes aldrig,
før du selv giver dem vægt i en fordeling.

### De to efterrul

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

### Tags er metadata

Hvert magic item bærer sin type og et par snese beskrivende tags — `Bonus: Armor Class`,
`Resistance: Fire`, `Jewelry`, `Bard` og så videre; **189 forskellige** i alt. De bruges
ikke til at trække med: magi-typen aflæses af `subcategory`, og typevægtene er det man
skruer på. Tags ligger i data og kommer med i eksporten, men vises ikke i UI'et.

**Forbrugsvarer virker på tværs.** Magiske potions og scrolls bærer selv `Consumable`, og
pakkens forbrugsvare-valg gælder begge puljer: står en pakke på "kun varigt udstyr",
holdes både fakler og healing potions ude.

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

## Kortene taler engelsk

**Alt der står på et kort er på engelsk. Alt uden om er på dansk.** Grænsen går ved
kortets kant: navn, type, krav, regeltekst, rarity og de faste etiketter — `Requires:`,
`Learn the tool:`, `Base:`, `Mastery:` — står på samme sprog som de 216 udstyrsitems, de
450 magic items og de 202 spells, der kommer fra D&D Beyond og aldrig har været andet end
engelske. Et kort skal kunne slås op i regelbogen uden at oversætte tilbage først.

Appen omkring dem er dansk: fanerne, pakkenavnene, tier-navnene, pakkebeskrivelserne,
knapperne og forklaringerne. Det er værktøjet, ikke spillet.

To ting sidder på grænsen og er med vilje ladt i ro:

- **Kortpladsens navn** (`Card 1`, `Class`, `Feat`) er engelsk, men det er data du selv
  redigerer under Pakker, og det trykkes ikke — det er skjult i print og står kun i
  forhåndsvisningen.
- **Kategorierne** (`Udstyr`, `Våben`, `Rustning`, `Værktøj`, `Gift`, `Ammunition`) er
  danske, men de når aldrig et kort: hvert item har en engelsk subcategory —
  `Adventuring Gear`, `Martial Melee Weapon`, `Tool` — og det er den der trykkes.
  Kategorien er noget filtre og vægte taler om, ikke noget spilleren læser.

En gemt opsætning bevarer sine egne kortnavne. Har du `Kort 1` liggende fra før, står der
`Kort 1` indtil du enten omdøber pladsen eller trykker **Ryd alt**.

## Classes-pakken

Class-kortene er ikke items, men det der mekanisk sker med spilleren. De er delt i **fem
korttyper**, som er kortets **kategori** — samme akse som Våben og Rustning — så en
kortplads kan bede om præcis én type med et almindeligt filter:

| Type | Indhold | Antal | Rarities |
|------|---------|-------|----------|
| **Class** | Class levels for de 12 klasser | 12 | alle Common |
| **Stat** | Attribut +1, gradueret efter loft | 30 | Common → Legendary |
| **Feat** | Origin feats, fighting styles, general feats, epic boons | 77 | Common → Legendary |
| **Skill** | Proficiency og expertise i de 18 færdigheder | 36 | Uncommon, Rare |
| **Perk** | Mekaniske fordele udenfor de fire ovenstående (homebrew) | 31 | Common → Legendary |

Classes-pakken trækker Class, Feat og Stat; Skill og Perk ligger klar uden en plads.

**Rarity trykkes kun der hvor den betyder noget.** På class levels, feats, skills og perks
styrer den trækningen, men siger intet brugbart på selve kortet — alle class levels er lige
sandsynlige, og et feats reelle begrænsning er dets krav. **Attributkortene viser den**,
fordi rarityen dér *er* kortets styrke: den er loftet. Kortene har ingen pris, så
bundlinjen udgår og pladsen går til reglen. Det sættes med `hideRarity` på det enkelte
item, ikke som en regel om kategorien.

### Attributkort er graduerede

Et attributkort hæver altid med **1**. Det der er gradueret, er hvor højt det må hæve — og
det er dét rarityen betyder:

| Rarity | Loft | Værd for |
|--------|-----:|----------|
| Common | 13 | en der står lavt |
| Uncommon | 15 | |
| Rare | 17 | |
| Very Rare | 19 | |
| Legendary | 20 | det eneste kort der når 20 |

Seks evner gange fem lofter giver 30 kort. Kortet hedder bare **`Strength +1`** — loftet
ville stå tre gange på samme kort, så det står de to steder hvor det gør arbejde: som
`Requires: Strength below 13` øverst og i regelteksten. Rarityen på bundlinjen er den tredje
læsning af det samme, for her *er* trinnet loftet. Stat-pladsens fordeling spænder over
alle fem trin: 50 / 30 / 11 / 6 / 3 %.

### Feats bærer deres krav

De 77 feats kommer fra `data/feats.txt` med **prerequisite og fuld regeltekst**. Kravet
står øverst på kortet, fordi det er dét der afgør om kortet kan spilles:

| Slags | Antal | Rarity | Krav på kortet |
|-------|------:|--------|----------------|
| Origin Feat | 12 | Common | *Ingen — men du må kun have ét Origin feat.* |
| Fighting Style Feat | 10 | Uncommon | *Fighting Style Feature* |
| General Feat | 43 | Rare | *Level 4+* og ofte en evne på 13+ |
| Epic Boon Feat | 12 | Legendary | *Level 19+* |

Origin-begrænsningen står ikke i kilden — den skriver ingen prerequisite på origin feats —
men det er den begrænsning der betyder noget når kortene ligger på bordet, så den er
skrevet ind.

Under navnet står kildens egen stikordsliste (`+1 Charisma, Impersonation, Mimicry`), så
man kan se hvad feat'et gør uden at læse hele reglen. Magic Initiate er delt i tre kort —
Cleric, Druid og Wizard — fordi listen vælges når man tager feat'et, og som fysisk kort er
hver liste sit eget kort.

### Perks er husets egne

Perks ligger uden for D&D's fem kategorier. Det er stedet hvor dungeon'et kan give noget
der ikke findes i regelbogen, så de er formuleret i importscriptet og ikke i en kildefil —
byt frit ud.

De tre perks der bare gav en proficiency — nyt sprog, nyt instrument, nyt værktøj — er
taget ud igen. Værktøjet lærer man nu ved et slag på selve værktøjskortet, og resten af
baggrunden dækkes af Stat-, Feat- og Skill-kortene. Tilbage står kun det regelbogen ikke
har et sted til.

**19 almindelige perks**, gradueret fra et ekstra Hit Die til +1 AC:

| Rarity | Eksempler |
|--------|-----------|
| Common | Extra Hit Die · Hardy · Permanent +3 Hit Points |
| Uncommon | Weapon Mastery Slot · Dark-Adapted · Tenacious |
| Rare | Extra Attunement Slot · Second Wind · Quick Off the Mark |
| Very Rare | Resilient · Watchful Soul · Extra Reaction |
| Legendary | Indomitable Will · Extra Attack · Armoured Hide |

**12 væsen-perks** i to familier. Dungeon'et er befolket, og det husker hvem man er:

| Familie | Rarity | Hvad kortet gør |
|---------|--------|-----------------|
| *Friend of the Goblins* | Uncommon | De angriber dig ikke på sigte. Første møde starter neutralt — angriber du først, er aftalen brudt for resten af etagen. |
| *Bane of the Goblins* | Rare | +2 skade med våbenangreb mod dem, og advantage på at spore dem. |

Seks væsener har begge kort: Goblins, Kobolds, Orcs, Gnolls, Skeletons og Spiders. **Fred er sat billigere end vold**, fordi et fjende-kort virker i hver eneste
kamp mod den slags, mens en våbenhvile kun tæller til det første møde.

Perk-pladsens fordeling spænder derfor over alle fem trin: 20 / 38 / 27 / 11 / 4 %.

### Pladserne

Pakken har tre kortpladser — én **Class**, én **Feat**, én **Stat**. Det er de tre dele af
en baggrund som pakken selv skal levere; færdigheder og perks findes som kort, men har
ingen plads endnu. Vil du have dem med, så tilføj et kort på tieren og vælg kategorien.

| Plads | Fordeling | Hvad der faktisk falder |
|-------|-----------|-------------------------|
| Class | 100 % Common | alle tolv class levels er Common, så alle er lige sandsynlige |
| Feat | 20 % pr. trin | 20 % origin · 20 % fighting style · 39 % general · 21 % epic boon |
| Stat | 50 / 30 / 11 / 6 / 3 | loftet følger trinnet: 13 · 15 · 17 · 19 · 20 |

Feat-pladsen beder om en femtedel Very Rare, og **der findes ingen Very Rare feat** — den
femtedel glider til nabotrinnet, hvilket er hvorfor general feats lander på 39 % og epic
boons på 21 %. Vil du have epic boons sjældnere, er det Legendary-tallet der skal ned.

Class-kortenes fem kategorier står på listen over kategorier der aldrig trækkes af en pakke
uden filter — så de ikke lækker ind i Adventurer-pakken.

### Data

`data/feats.txt` er kilden til feats, klippet fra D&D Beyond.
`scripts/import_class_cards.py` bygger hele `assets/data/class-cards.js` ud fra den plus de
systematiske kort, som er formuleret i scriptet:

```bash
python3 scripts/import_class_cards.py
```

Rediger frit i Items-fanen, eller udskift hele datafilen med dit eget indhold.

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

En kortplads bærer alle fem indstillinger. De samme fem felter findes på tier og pakke,
og det mest specifikke vinder — hvert felt for sig:

```json
{
  "label": "Kort 3",
  "filter":      null,
  "magicChance": 100,
  "magicDist":   { "common": 78.5, "uncommon": 12, "rare": 7, "very_rare": 2, "legendary": 0.5 },
  "magicTypes":  { "Scroll": 2, "Ring": 0 },
  "dist":        { "uncommon": 80, "rare": 15, "very_rare": 4, "legendary": 1 },
  "weights":     { "Rustning": 4, "Ammunition": 0 }
}
```

De tre `magic*`-felter er ja-grenen; `dist` og `weights` er nej-grenen. I typevægtene
skrives kun værdier forskellige fra 1. `null` — eller en fordeling med lutter nuller —
betyder at feltet arves fra tieret, pakken eller den fælles tabel.

Et magic item er det samme objekt som et almindeligt item, med kategorien `Magic`, typen
som første tag, og et par felter mere:

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
for items uden rarity. Magic items kan desuden være `artifact`, som kun kan trækkes hvis
en magi-fordeling giver artifacts vægt. `scale` er `gear`, `magic` eller `none`.
`enabled: false` tager et item ud af alle puljer uden at slette det.

## Lagring

Alt gemmes i browserens `localStorage` under `dccdd.config.v1` og `dccdd.items.v1`
(magic items ligger i den sidste sammen med alt andet). Det er bundet til den enkelte
browser på den enkelte maskine — brug eksport-knapperne, hvis opsætningen skal deles eller
sikkerhedskopieres.

Den gemte kopi opdateres automatisk når datafilerne i repoet er nyere, med ét klik til at
fortryde. Vil man ud af den manuelt, ligger der to knapper under Indstillinger:
**Hent data forfra** kasserer items og beholder pakkerne, og **Ryd alt** sletter appens
fem nøgler og genindlæser siden.

### Opsætningen migreres, ikke overskrives

Pakkeopsætningen bærer et versionsnummer (nu **9**), og en gemt opsætning løftes op til
det nyeste ved indlæsning. Det er dét der gør at man kan tilpasse pakkerne uden at miste
tilpasningerne næste gang appen ændrer sig — men det betyder også at **nye standardværdier
ikke automatisk gælder for en opsætning der allerede er gemt**. Vil du have de nye
pakkeindstillinger som de står i koden, skal du trykke **Ryd alt**.

Migreringen retter kun det den kan se er gået tabt, og kun på de indbyggede pakker. v9
reparerer tre ting som tidligere trin efterlod stumme — pakken blev ved med at virke, den
gav bare noget andet end den lovede:

| Symptom | Årsag | Hvad v9 gør |
|---------|-------|-------------|
| Pakken gav aldrig magi | chancen forsvandt da magi fik sin egen gren | henter standardchancen tilbage, hvis der ikke står en på hverken pakke eller tier |
| Weapons delte ringe ud | typelåsen forsvandt samme vej | sætter låsen igen (`kun Weapon`, `kun Armor`, `kun Potion og Scroll`) |
| Consumables gav ren gift | union-filteret `Gift eller Consumable` mistede sin tag-halvdel da tags røg ud | sætter filteret til forbrugsvarer igen |

Kortenes egne tal røres ikke i nogen af tilfældene — de vinder stadig over pakke og tier.

## Filer

```
index.html                     markup og faner
assets/css/app.css             styling, inkl. print-layout
assets/js/core.js              datamodel, prisparsing, import, trækning
assets/js/ui.js                UI og hændelser
assets/data/items.js           items fra regnearket
assets/data/class-cards.js     Class-pakkens indhold (genereret)
assets/data/magic-items.js     magic items
scripts/import_xlsx.py         regneark → items.js
scripts/import_magic.py        magic_items.txt → magic-items.js
scripts/import_class_cards.py  feats.txt + systematiske kort → class-cards.js
data/dnd_items.xlsx            kilderegnearket
data/magic_items.txt           kildeliste over magic items
data/feats.txt                 kildeliste over feats
```
