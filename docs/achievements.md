# Bedrifter

**Ingen bedrift kræver at du tæller noget.** Hver eneste udløses i ét øjeblik, og det
øjeblik kan afgøres af det der ligger på bordet. Ingen løbende tællere, ingen målere der
nulstilles, ingen streaks du skal huske ikke er brudt. Ser du det ske, er den opnået.

Er der brug for en *størrelse* — hvor stor en pakke — så kommer den fra **CR-trappen**
længere nede. CR står i statblokken foran dig. Det er ikke en sammentælling, det er et
opslag.

Se [`ideen.md`](ideen.md) for hvordan de tildeles ved bordet.

Der er et printbart ark i [`checklist.html`](checklist.html) — seks A4-sider med **én
række pr. bedrift: navn, udløser og præmie, og fire felter til spillerne.** Skriv navnene
øverst på hver side, og sæt kryds når pakken er givet. Siderne er delt efter pakketype, så
har du en Weapons Sølv i hånden, står alt hvad der kan betale for den på den samme side.
Forsiden samler CR-trappen og Class Box, som står uden for de fem farver.

Arket bygges af `scripts/build_checklist.py` ud fra denne fil, så de to ikke kan komme ud
af trit. Ret her, kør scriptet, print igen.

**Tegnforklaring**

| Tegn | Betyder |
|------|---------|
| ★ | **Skjult** — læses ikke op før den udløses |
| ↻ | **Gentagelig** — højst én gang pr. session |
| ⚑ | **Holdbedrift** — alle får belønningen |

---

## Beholdningen er reglen

Der er **22 Bronze, 12 Sølv og 6 Guld af hver pakketype**. Det er ikke et budget nogen har
sat — det er hvad der ligger i kassen. Når guldet er væk, er det væk.

Derfor er de tre niveauer tildelt på tre forskellige måder, og det er dét der får listen
til at passe:

| Niveau | Hvem får den | Bedrifter pr. type | Pakker det bliver til |
|--------|--------------|-------------------:|----------------------:|
| **Bronze** | hver spiller, første gang *hun* gør det | 11 | ~22 |
| **Sølv** | hver spiller, første gang *hun* gør det | 6 | ~12 |
| **Guld** | **den første i hele kampagnen der gør det** | 3 | 3 |

Bronze og Sølv er personlige. Fangede alle fire spillere alle 55 bronzebedrifter, ville
listen koste **220 bronzepakker** — dobbelt så meget som der ligger. Det er ikke en fejl i
regnestykket, det er hvad ordet *beholdning* betyder: **listen er et menukort, ikke en
tjekliste.** Regn med at cirka halvdelen af holdet når hver enkelt, og forbruget lander på
de 110 der er.

**Guld er et kapløb.** Den går til den første der gør det, og så er den brugt for hele
holdet. Det er derfor der kun skal tre af dem til at dække seks pakker: de sidste tre er
sat af til CR-trappen og til bosser, som ikke har en fast pris.

Class Box står uden for regnestykket. Den er ikke gradueret, og der er ikke sat et loft.

---

## CR-trappen

Nogle bedrifter handler om at fælde noget. Hvor stor pakken bliver, afgøres ikke af hvor
mange du har fældet — det afgøres af **hvad** du fældede. Sammenlign monsterets CR med
holdets level:

| CR i forhold til holdets level | Pakke |
|--------------------------------|-------|
| **under** holdets level | Bronze |
| **holdets level til +2** | Sølv |
| **mere end +2 over** | Guld |

Et hold på level 3 får altså Bronze for CR ½–2, Sølv for CR 3–5 og Guld for CR 6 og
opefter. Ét fratrækningsstykke, og statblokken ligger allerede fremme.

Fire bedrifter bruger trappen. De er motoren i listen, fordi de bliver ved med at kunne
udløses når førstegangene er brugt op:

| Bedrift | Udløses af | Type |
|---------|-----------|------|
| **Punching Up** ↻ | Du giver dødsstødet til noget alene | Weapons |
| **Giant Slayer** ↻ | Du fælder noget mindst tre gange din størrelse | Weapons |
| **Boss Down** ⚑ | Holdet fælder etagens boss | Efter eget valg |
| **Floor Cleared** ⚑ ↻ | Etagen er ryddet — trappen læses på etagens hårdeste fjende | Adventurer |

**Punching Up er den vigtigste.** Den giver en pakke hver gang nogen tager livet af noget
alene, og størrelsen følger med opad hele kampagnen. Det er den der gør at loot ikke tørrer
ud i session fem.

---

## Sådan deler du mange ud hurtigt

**Atten af de femoghalvtreds bronzebedrifter er førstegange** — første dør, første træf,
første potion, første gang du tager skade. De er skrevet så de udløses af sig selv, uden at
nogen går efter dem.

Og de fleste af dem er personlige på den dyre måde: `First Blood`, `First Kill` og `Ouch`
udløses af **hver eneste spiller**. Ét rum med en dør, et lig og en fjende betaler derfor
typisk:

| Bedrift | Hvem får den | Pakker |
|---------|--------------|-------:|
| Welcome to the Dungeon ⚑ | alle | 4 + 4 + 4 Class |
| Try the Handle | den der åbnede | 1 |
| Loot Goblin | den der søgte | 1 |
| First Blood | alle der rammer | op til 4 |
| First Kill | alle der fælder noget | 2–4 |
| Ouch | alle der tager skade | 2–4 |

Det er **tolv til seksten pakker i det første rum**. Det er meningen. Regn med at den
første session koster en tredjedel af bronzen, og lad den gøre det — bronze er
hverdagskost. Det er de tolv sølv og de seks guld der skal holde kampagnen ud.

---

# Adventurer

*Orange papir. At kigge, at snakke, og at tage ting der ikke er dine.*

## Bronze — 11

| Bedrift | Udløses af |
|---------|-----------|
| **Try the Handle** | Den første dør du åbner |
| **Loot Goblin** | Det første lig eller den første kiste du gennemsøger |
| **Read the Room** | Dit første færdighedstjek uden for kamp der lykkes |
| **I Know a Guy** | Første gang du taler med noget der ikke prøver at dræbe dig |
| **Picked** | Den første lås du dirker op |
| **Trapfinder** | Den første fælde du finder før den udløses |
| **Down the Hatch** | Du kravler frivilligt ned i noget mørkt og smalt |
| **Light Fingers** | Du stjæler noget uden at blive opdaget |
| **Inside Job** | Du åbner en dør for holdet fra den forkerte side |
| **Wave to the Camera** ★ | Du taler direkte til dem der ser med |
| **Wrong Way** ★ | Du går tilbage til et rum I har ryddet, og finder noget alligevel |

## Sølv — 6

| Bedrift | Udløses af |
|---------|-----------|
| **Diplomatic Immunity** | Du afværger en kamp helt med snak |
| **Silver Tongue** | Du overbeviser nogen om noget åbenlyst usandt |
| **Secret Handshake** | Du finder et hemmeligt rum |
| **Wearing His Face** ★ | Du kommer forbi noget ved at udgive dig for en anden |
| **Caught Red-Handed** ★ | Du bliver taget i at stjæle og slipper afsted med det alligevel |
| **Style Points** | Du løser et problem på den mest omstændelige måde der findes |

## Guld — 3 · *første i kampagnen*

| Bedrift | Udløses af |
|---------|-----------|
| **Basement Level** | Du går en etage dybere end holdet var nødt til |
| **Speedrun** ⚑ | Etagen er ryddet inden pausen |
| **Broke the Dungeon** ★ ⚑ | Holdet løser noget på en måde DM'en ikke havde forudset |

---

# Weapons

*Rødt papir. Det du gør ved andre.*

## Bronze — 11

| Bedrift | Udløses af |
|---------|-----------|
| **First Blood** | Dit første angreb der rammer |
| **First Kill** | Din første nedlagte fjende |
| **Double Digits** | Ét angreb der gør 10 eller mere i skade |
| **Critical Thinker** | Din første naturlige 20 i kamp |
| **Setup Man** | Du gør en anden spillers angreb muligt |
| **Fully Loaded** | Du står med ammunition til hvert af dine ranged våben |
| **Upgrade** | Du lægger dit startvåben fra dig til fordel for noget bedre |
| **Intimidation Tactics** | Du får noget til at flygte uden at slå |
| **One-Liner** | Du siger noget godt lige før eller efter et drab |
| **Held Item** ★ | Du taber dit våben midt i kamp |
| **The Hard Way** ★ | Du løser et problem ved at ødelægge det |

## Sølv — 6

| Bedrift | Udløses af |
|---------|-----------|
| **Cleanup Crew** | Du nedlægger to fjender i samme tur |
| **Improvised** ★ | Du dræber noget med en genstand der ikke er et våben |
| **Return to Sender** | Du dræber en fjende med dens eget våben eller dens egen effekt |
| **Environmental Hazard** | Du får omgivelserne til at dræbe noget — fald, ild, sten, vand |
| **Sniper** | Et dræbende træf på over tredive meters afstand |
| **Crowd Pleaser** | Du gør noget tydeligt mere spektakulært end nødvendigt |

## Guld — 3 · *første i kampagnen*

| Bedrift | Udløses af |
|---------|-----------|
| **Sweep the Leg** | Du nedlægger tre eller flere fjender i samme tur |
| **Last One Standing** | Alle andre er nede, og du vinder kampen |
| **Speedrun Any%** ⚑ | En boss nedlagt i første runde |

## Efter vægtklasse — CR-trappen

| Bedrift | Udløses af |
|---------|-----------|
| **Punching Up** ↻ | Du giver dødsstødet til noget alene |
| **Giant Slayer** ↻ | Du fælder noget mindst tre gange din størrelse |

---

# Armor

*Blåt papir. Det andre gør ved dig.*

## Bronze — 11

| Bedrift | Udløses af |
|---------|-----------|
| **Ouch** | Første gang du tager skade |
| **Suit Up** | Første gang du tager rustning på |
| **Fully Equipped** | Du står med våben, rustning og skjold på samtidig |
| **Better You Than Me** | Du tager skade der var rettet mod en anden spiller |
| **Down but Not Out** | Din første death save der lykkes |
| **Nine Lives** ↻ | Du ender på præcis 1 HP |
| **Shield Wall** | Du spærrer en vej med din egen krop, og noget bliver stoppet |
| **Human Ladder** | Holdet løser noget fysisk ved at bruge hinanden |
| **Naked and Afraid** ★ | Du står uden rustning midt i en kamp |
| **Trust Fall** ★ | Du gør noget dumt fordi en anden spiller bad dig om det |
| **The Floor Is Also a Weapon** ★ | Du tager faldskade fra noget du selv satte i gang |

## Sølv — 6

| Bedrift | Udløses af |
|---------|-----------|
| **Tank** | Ét angreb tager mere end halvdelen af dit maksimale HP, og du bliver stående |
| **Not Today** | Du overlever en tur hvor du burde være død |
| **Back from the Brink** | Du rejser dig fra 0 HP og nedlægger en fjende i samme tur |
| **Got Your Back** | Du redder en anden spiller fra 0 HP |
| **Designated Driver** | Du bærer eller trækker en bevidstløs kammerat i sikkerhed |
| **Hold the Line** | Du er den eneste der står mellem fjenden og resten af holdet, og de kommer ikke forbi |

## Guld — 3 · *første i kampagnen*

| Bedrift | Udløses af |
|---------|-----------|
| **Immovable** | En hel runde hvor fjenden kun gik efter dig, og intet ramte |
| **Prime Time** ⚑ | Holdet fælder en boss, og ingen er nede når den falder |
| **Not Even Close** ★ | Du overlever et angreb der var beregnet til at tage hele holdet |

---

# Consumables

*Mørkegrønt papir. Uheld, gift, og ting du puttede i munden.*

Halvdelen af dem er ting der gik galt. Det er med vilje: en pakke for at fejle gør det
sjovere at prøve.

## Bronze — 11

| Bedrift | Udløses af |
|---------|-----------|
| **Shopping Spree** | Din første handel i dungeon'et |
| **Sommelier** | Du drikker en potion uden at vide hvad den gør |
| **Nat One** ★ | Din første naturlige 1 på noget der betød noget |
| **Friendly Fire** ★ | Du rammer en kammerat |
| **Trapfinder, Eventually** ★ | Din første fælde fundet **efter** den er udløst |
| **Locked Out** ★ | Du låser dig selv inde eller ude |
| **Loud** ★ | Din listeplan bliver afsløret af noget du selv gjorde |
| **Junk Collector** ★ | Du står med tre kort af det samme værdiløse grej |
| **Trapped by a Trap You Found** ★ | Du udløser en fælde du selv havde opdaget |
| **Zero Percent** ★ | Du prøver noget med nul chance for at lykkes, og prøver alligevel |
| **Ate It** ★ | Du spiser noget du ikke burde spise |

## Sølv — 6

| Bedrift | Udløses af |
|---------|-----------|
| **Down the Wrong Pipe** ★ | Du drikker den forkerte potion |
| **Chemist** ★ | Du kombinerer to consumables til én effekt |
| **Poisoned, Cursed, and Late for Dinner** ★ | Tre forskellige tilstande på dig samtidig |
| **Well, That Was Expensive** ★ | Du ødelægger noget værdifuldt ved et uheld |
| **Waste Not** | Du bruger et forbrugskort i det sidste øjeblik hvor det stadig nåede at virke |
| **Made an Enemy** ★ | Noget i dungeon'et beslutter at det hader dig personligt |

## Guld — 3 · *første i kampagnen*

| Bedrift | Udløses af |
|---------|-----------|
| **Big Spender** | Du bruger alt hvad du ejer på ét køb |
| **Terms and Conditions** ★ | Du indgår en aftale du ikke har læst helt |
| **Full Party Wipe Avoided** ★ ⚑ | Holdet var ét slag fra at dø, og kom hjem |

---

# Magic

*Lavendel papir. Spells og magic items.*

## Bronze — 11

| Bedrift | Udløses af |
|---------|-----------|
| **Abracadabra** | Din første spell castet |
| **Scroll Reader** | Din første spell scroll brugt |
| **Enchanted** | Dit første magic item |
| **Upcast** | Du caster en spell i et højere slot end nødvendigt, og det virker |
| **Ritualist** | Du bruger en spell som ritual for at spare et slot |
| **Utility Belt** | Du løser et problem uden for kamp med en spell der ikke gør skade |
| **Attunement Issues** ★ | Du står med tre attunede magic items samtidig |
| **Read the Label** ★ | Du bruger et magic item forkert |
| **Look Up** ★ | Du opdager noget vigtigt ved at kigge opad |
| **Don't Read That** ★ | Du læser noget du ikke burde læse |
| **Sponsored Content** ★ | Du bruger et produkt der blev navngivet i en af systemets beskeder |

## Sølv — 6

| Bedrift | Udløses af |
|---------|-----------|
| **Bookworm** | Din første tome læst — en spell lært permanent |
| **Counterspell** | Du afbryder en fjendes magi |
| **Save or Suck** | Tre fjender fejler den samme save mod din spell |
| **Overkill, Arcane Edition** | En spell rammer fem eller flere fjender på én gang |
| **Out of Slots** ★ | Du bruger dit sidste spell slot, og vinder kampen alligevel |
| **Sharing Is Caring** | Du giver et magic item væk til en anden spiller |

## Guld — 3 · *første i kampagnen*

| Bedrift | Udløses af |
|---------|-----------|
| **Legendary Bearer** | Dit første Legendary magic item |
| **Wild Magic** ★ | Magi går galt på en måde der ender med at hjælpe |
| **Patron** ★ | Noget dernede tilbyder dig en aftale, og du siger ja |

---

# Class Box

*Guldgult papir, sort voks. Ikke gradueret, så den står uden for beholdningen.*

| Bedrift | Udløses af |
|---------|-----------|
| **Welcome to the Dungeon** ⚑ | Første skridt ned. Alle får den samtidig |
| **Level Up** ↻ | Hver gang du stiger et level |
| **Unarmed and Dangerous** | Du dræber noget med de bare næver |
| **New Friend** | Du får en fjende til at skifte side |
| **Kingmaker** ★ | Du får noget dernede til at adlyde dig permanent |
| **The Long Game** ★ | En plan du lagde flere sessioner tidligere går op |
| **Solo** ★ | Du vinder en kamp helt alene mens resten af holdet er ude af spil |
| **Ascended** | Du forlader dungeon'et i live |

`Welcome to the Dungeon` er den eneste der uddeles uden at nogen har gjort noget. Den skal
læses op inden første tur, sammen med en Adventurer- og en Weapons-pakke i Bronze — så har
alle kort på bordet fra minut ét.

---

## Hvad der blev skrottet, og hvorfor

Den forrige liste havde 150 bedrifter, hvoraf 34 krævede bogføring: løbende tællere,
målere der skulle nulstilles, og streaks man skulle huske ikke var brudt. De er væk, og de
er ikke erstattet én til én.

| Skrottet | Hvorfor | Hvad der kom i stedet |
|----------|---------|-----------------------|
| Butcher's Bill · Hundred Club | 25 og 100 nedlagte fjender — den tungeste tæller på arket | **Punching Up** på CR-trappen |
| Tank · Meat Shield · Walk It Off | skade taget i én kamp, målt løbende | **Tank** måler nu ét angreb mod dit halve maksimum |
| Locksmith · Disarming Personality | ti låse, tre fælder | den første lås og den første fælde er nok |
| Full Caster | fem forskellige magiskoler over en kampagne | — |
| Perfect Round · Untouchable · Ghost · Untouched | streaks over en kamp eller en etage | **Immovable**, som afgøres på én runde |
| Minimalist · Nobody Left Behind · Pacifist Run · Deathless · Survivor | streaks over en etage eller hele kampagnen | — |
| Fan Favourite · Trending · Dead Air | bedrifter talt op pr. session | — |
| Specialist · Well-Rounded · Collector · Completionist | bedrifter talt op over kampagnen | — |
| One Week In · The Regular | dage og sessioner talt op | — |

Der er ikke noget tælleark længere, fordi der ikke er noget at tælle. Det printbare ark er
nu en ren afkrydsningsliste: kryds af hvad spilleren har fået, så den ikke bliver givet to
gange.

---

## Idéer der ikke er skrevet ind endnu

- **Etagespecifikke bedrifter.** En bedrift der kun findes på etage 3 gør etage 3 til et
  sted, ikke et rum. Kræver at etagerne er tegnet først.
- **Team quests som belønning.** I stedet for en pakke: en opgave holdet får stillet, med
  en større pakke i den anden ende. `Sponsored Content` og `Patron` peger allerede den vej.
- **Negative bedrifter.** En bedrift der giver en *forbandelse* i stedet for en pakke. Kan
  være meget sjovt og meget surt — prøv én og se.
- **Guld som kapløb, sagt højt.** Guldbedrifterne går til den første der gør det. Læses det
  op ved kampagnens start, bliver de til mål. Holdes det skjult, bliver de til overraskelser.
  Begge dele virker; de virker ikke samtidig.
