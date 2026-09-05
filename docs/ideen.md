# DCC-D-D — ideen bag spillet

## Præmis

Spillerne spiller **sig selv**. Ikke en karakter de har fundet på — dem, som de er, med det
de kan og det de har på sig. En aften bliver de trukket ned i et dungeon, og der er ingen
vej tilbage op.

Dungeon'et er ikke en hule. Det er et **show**. Nogen ser med. Systemet taler til dem
gennem beskeder de ikke har bedt om, med en tone der ligger et sted mellem en
kundeservicemedarbejder og en sportskommentator. Det roser dem for ting de ikke er stolte
af, og det uddeler præmier for at være underholdende.

Inspirationen kommer fra **Dungeon Crawler Carl**, men ikke som en kopi. Det vi låner er
den ene mekanik der bærer hele fornemmelsen:

> Du får ikke loot fordi du dræbte noget. Du får loot fordi du gjorde noget værd at se på.

## Hvorfor loot bokse

En almindelig skattekiste er en liste. En loot box er et **øjeblik**. Der er en pakke, den
skal åbnes, og indtil den er åbnet ved ingen hvad der er i.

Det ændrer to ting ved bordet:

1. **Belønningen bliver en begivenhed.** Man river en pakke op foran de andre. Det er
   fysisk, det tager tid, og alle kigger med.
2. **DM'en slipper for at bestemme.** Hvad der falder ud er ikke en beslutning nogen skal
   forsvare. Det er et rul. Bliver det elendigt, er det systemets skyld. Bliver det
   fantastisk, har man fortjent det.

Loot boksene er delt i typer — Adventurer, Weapons, Armor, Consumables, Magic og Classes —
og de fleste findes i **Bronze, Sølv og Guld**. Se `README.md` for hvordan fordelingerne er
skruet sammen.

## De fysiske kort

Alt indhold er **printede kort i 63 × 88 mm**, samme mål som Magic- og Pokémon-kort, så de
kan ligge i lommer og sleeves. Det er hele pointen med generatoren i dette repo: den ruller
pakkerne og sætter dem op til print, ni kort pr. A4-ark.

Pakkerne selv er **farvet papir lukket med et vokssegl**. Papiret siger hvilken slags
pakke det er — orange for Adventurer, rød for Weapons, blå for Armor, mørkegrøn for
Consumables, lavendel for Magic, guldgul for Classes — og voksen siger hvilket tier:
bronze, sølv eller guld. Classes får sort voks, fordi den ikke er gradueret.

Det er seglet der gør det til en loot box. En kuvert er en kuvert; et brudt segl er et
øjeblik. Der skal være noget fysisk at ødelægge foran de andre.

Et kort er en genstand man **har**. Det ligger på bordet foran spilleren. Bruger man en
potion, ryger kortet i kassen. Mister man sin rustning, giver man kortet fra sig. Der er
ingen karakterark der skal rettes — inventaret er en bunke kort.

Class-kortene er den samme idé anvendt på karakterudvikling: et level, en feat, en perk, en
stat-forøgelse. Man samler dem, og det man har samlet er den man er blevet.

## Bedrifter som valuta

Her er den centrale regel:

> **Loot bokse falder ikke tilfældigt. De tildeles for bedrifter.**

En bedrift er noget spillerne **gør**, ikke noget de finder. Systemet holder øje, og når
noget kvalificerer, kommer beskeden — og pakken.

Det giver spillet en motor som en almindelig loot-tabel ikke har:

- **Det belønner initiativ.** Den der prøver noget fjollet får oftere pakker end den der
  spiller sikkert.
- **Det gør fiaskoer værdifulde.** Flere bedrifter udløses af at tabe, tage skade eller
  gøre sig selv til grin. Det er tilgivet på forhånd, og det er sjovere.
- **Det giver DM'en et håndtag.** Skal holdet have bedre grej, findes der altid en bedrift
  de er tæt på.

Listen ligger i [`achievements.md`](achievements.md). **Ingen af dem kræver at du tæller
noget** — hver eneste udløses i ét øjeblik, og det øjeblik kan afgøres af det der ligger på
bordet. Skal en belønning have en størrelse, kommer den fra monsterets CR, ikke fra en
optælling. Det printbare ark i [`checklist.html`](checklist.html) er derfor en
afkrydsningsliste og ikke et regnskab: man krydser af, så den samme bedrift ikke bliver
givet to gange.

## Sådan kører det ved bordet

**Tildeling.** Når en bedrift opnås, læses den højt — gerne med systemets stemme, kort og
tørt:

> *Bedrift opnået: Loot Goblin.*
> *Du har gennemsøgt dit første lig. Belønning: Adventurer Box (Bronze).*

**Åbning.** Pakken genereres på siden og printes. Vil man have effekten med det samme, kan
man printe et bundt på forhånd og lade spilleren trække en tilfældig pakke af den rigtige
type — så er der en fysisk pakke at rive op i samme øjeblik.

**Frekvens.** Del mange ud, og del dem ud hurtigt. Atten af bedrifterne er førstegange —
første dør, første træf, første gang du tager skade — og de er skrevet så de udløses af sig
selv. Ét rum med en dør, et lig og en fjende betaler typisk **tolv til seksten pakker**.
Det er meningen: bronze er hverdagskost.

**Beholdningen er reglen.** Der ligger 22 Bronze, 12 Sølv og 6 Guld af hver pakketype. Det
er dét der sætter tempoet, ikke en regel om hvor tit man må dele ud. Bronze og Sølv er
personlige; **Guld går til den første i hele kampagnen der gør det**, og så er den brugt.

**Anti-grind.** En bedrift kan kun opnås én gang pr. spiller, medmindre den er mærket som
gentagelig. Og gør en spiller noget udelukkende for at udløse en bedrift, tæller det ikke —
systemet er kynisk, ikke dumt.

**Hemmelige bedrifter.** En del af listen er skjult og afsløres først når den udløses. Det
er dem der er sjovest, fordi ingen gik efter dem.

## Tonen

Systemet er ikke din ven. Det er begejstret på en måde der ikke er betryggende. Det bruger
ord som *seertal*, *sponsorat* og *præstation* om ting der lige har været livsfarlige. Det
kondolerer aldrig, men det kommenterer.

Når det virker, føles en bedrift som at blive grebet i noget — og så få betaling for det.

## Hvad der ligger i dette repo

| Fil | Indhold |
|-----|---------|
| `README.md` | Generatoren: pakker, fordelinger, kort, print |
| `docs/ideen.md` | Dette dokument |
| `docs/achievements.md` | Bedrifterne og deres belønninger |
| `docs/checklist.html` | Printbar afkrydsningsliste — spillerark og bordark |
