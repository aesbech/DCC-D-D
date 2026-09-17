# Bedrifter

**Ingen bedrift kræver at du tæller noget.** Hver eneste udløses i ét øjeblik, og det
øjeblik kan afgøres af det der ligger på bordet. Ingen løbende tællere, ingen målere der
nulstilles, ingen streaks du skal huske ikke er brudt. Ser du det ske, er den opnået.

Se [`ideen.md`](ideen.md) for hvordan de tildeles ved bordet.

Der er et printbart ark i [`checklist.html`](checklist.html) med **én række pr. bedrift:
navn, udløser og fire felter til spillerne.** Skriv navnene øverst på hver side, og sæt
kryds når pakken er givet. Siderne er delt efter pakketype og niveau, så præmien står i
overskriften og ikke på hver eneste række — papiret siger alligevel hvad det er.

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
sat — det er hvad der ligger i kassen.

Listen er skåret til at passe præcis på den beholdning:

| Niveau | Bedrifter pr. type | Pakker i kassen |
|--------|-------------------:|----------------:|
| **Bronze** | 22 | 22 |
| **Sølv** | 12 | 12 |
| **Guld** | 6 | 6 |

**Én bedrift, én pakke.** Blev hver eneste bedrift udløst nøjagtig én gang, ville kassen
være tom og listen krydset af på samme tid. Sådan går det selvfølgelig ikke: nogle
bedrifter udløses af tre spillere, og andre bliver aldrig til noget. Men det er det
forhold du kan regne i hovedet, og det er derfor der er fire felter pr. række og ikke ét
— du kan give den samme bedrift til flere, du skal bare vide at det koster fra den samme
bunke.

**Guld er et kapløb.** De seks guldbedrifter pr. type går til **den første i hele
kampagnen** der gør det. Der bliver altså kun ét kryds pr. guldrække, og det er dét der
holder seks bedrifter inden for seks pakker.

Class Box står uden for regnestykket. Den er ikke gradueret, og der er ikke sat et loft.

---

## Sådan deler du mange ud hurtigt

**Atten af bronzebedrifterne er førstegange** — første dør, første træf, første potion,
første gang du tager skade. De er skrevet så de udløses af sig selv, uden at nogen går
efter dem.

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

**Motoren bagefter er de gentagelige.** Når førstegangene er brugt, er det `Punching Up`,
`Nine Lives`, `Boss Down`, `Floor Cleared` og `Level Up` der bliver ved med at betale —
højst én gang pr. session hver, men hver session.

---

# Adventurer

*Orange papir. At kigge, at snakke, og at tage ting der ikke er dine.*

## Bronze — 22

| Bedrift | Udløses af |
|---------|-----------|
| **Try the Handle** | Den første dør du åbner |
| **Loot Goblin** | Det første lig eller den første kiste du gennemsøger |
| **Read the Room** | Dit første færdighedstjek uden for kamp der lykkes |
| **I Know a Guy** | Første gang du taler med noget der ikke prøver at dræbe dig |
| **Picked** | Den første lås du dirker op |
| **Trapfinder** | Den første fælde du finder før den udløses |
| **Torchbearer** | Du er den der bærer lyset ind i det første mørke rum |
| **Down the Hatch** | Du kravler frivilligt ned i noget mørkt og smalt |
| **Light Fingers** | Du stjæler noget uden at blive opdaget |
| **Inside Job** | Du åbner en dør for holdet fra den forkerte side |
| **Ten Foot Pole** | Du rører ved noget mistænkeligt med noget andet end hånden |
| **Rope Solves It** | Du løser et problem med et stykke reb |
| **Map Maker** | Du tegner det første kort over et rum |
| **Eavesdropper** | Du hører noget nyttigt gennem en lukket dør |
| **Local Knowledge** | Du får en brugbar retningsanvisning ud af nogen dernede |
| **Shortcut** | Du finder en vej rundt om noget holdet troede de skulle igennem |
| **Bagman** | Du bærer holdets loot ud af et rum |
| **Wave to the Camera** ★ | Du taler direkte til dem der ser med |
| **Wrong Way** ★ | Du går tilbage til et rum I har ryddet, og finder noget alligevel |
| **Housekeeping** ★ | Du rydder op efter jer, og det viser sig at betale sig |
| **Tourist** ★ | Du stopper op for at kigge på noget mens de andre skynder sig |
| **Name Taken** ★ | Du giver noget dernede et navn, og det hænger ved |

## Sølv — 12

| Bedrift | Udløses af |
|---------|-----------|
| **Floor Cleared** ⚑ ↻ | Etagen er ryddet |
| **Diplomatic Immunity** | Du afværger en kamp helt med snak |
| **Silver Tongue** | Du overbeviser nogen om noget åbenlyst usandt |
| **Secret Handshake** | Du finder et hemmeligt rum |
| **Cat Burglar** | Du kommer ind et sted uden at bruge en dør |
| **The Long Way Round** | Du kommer uden om en forhindring uden at løse den |
| **Bilingual** | Du kommunikerer med noget I ikke deler sprog med |
| **Style Points** | Du løser et problem på den mest omstændelige måde der findes |
| **Wearing His Face** ★ | Du kommer forbi noget ved at udgive dig for en anden |
| **Caught Red-Handed** ★ | Du bliver taget i at stjæle og slipper afsted med det alligevel |
| **The Old Switcheroo** ★ | Du erstatter det du stjæler med noget værdiløst |
| **Insider Trading** ★ | Du sælger noget tilbage til den du tog det fra |

## Guld — 6 · *første i kampagnen*

| Bedrift | Udløses af |
|---------|-----------|
| **Basement Level** | Du går en etage dybere end holdet var nødt til |
| **Speedrun** ⚑ | Etagen er ryddet inden pausen |
| **No Stone Unturned** ⚑ | Hver kiste, hvert lig og hver skuffe er gennemsøgt når I går ned |
| **Cartographer** ⚑ | Holdet har tegnet en hel etage færdig |
| **Front Door** ★ | Du går ind ad hovedindgangen et sted alle andre ville liste sig ind |
| **Broke the Dungeon** ★ ⚑ | Holdet løser noget på en måde DM'en ikke havde forudset |

---

# Weapons

*Rødt papir. Det du gør ved andre.*

## Bronze — 22

| Bedrift | Udløses af |
|---------|-----------|
| **First Blood** | Dit første angreb der rammer |
| **First Kill** | Din første nedlagte fjende |
| **Punching Up** ↻ | Du giver dødsstødet til noget alene |
| **Double Digits** | Ét angreb der gør 10 eller mere i skade |
| **Critical Thinker** | Din første naturlige 20 i kamp |
| **Opening Act** | Du fælder den første fjende i en kamp |
| **Finisher** | Du fælder den sidste fjende i en kamp |
| **Setup Man** | Du gør en anden spillers angreb muligt |
| **Cover Fire** | Du holder noget tilbage uden at gøre skade på det |
| **Fully Loaded** | Du står med ammunition til hvert af dine ranged våben |
| **Upgrade** | Du lægger dit startvåben fra dig til fordel for noget bedre |
| **Two Handed** | Du skifter våben midt i en kamp og rammer med det nye |
| **Off Hand** | Du rammer med dit sekundære våben |
| **Thrown** | Du fælder noget med et kastet våben |
| **Point Blank** | Du skyder noget der står lige op ad dig, og rammer |
| **Reach Out** | Du rammer noget der troede det stod uden for rækkevidde |
| **Intimidation Tactics** | Du får noget til at flygte uden at slå |
| **One-Liner** | Du siger noget godt lige før eller efter et drab |
| **Held Item** ★ | Du taber dit våben midt i kamp |
| **Broken** ★ | Dit våben går i stykker midt i et slag |
| **Out of Ammo** ★ | Du løber tør midt i en kamp |
| **The Hard Way** ★ | Du løser et problem ved at ødelægge det |

## Sølv — 12

| Bedrift | Udløses af |
|---------|-----------|
| **Boss Down** ⚑ ↻ | Holdet fælder etagens boss |
| **Cleanup Crew** | Du nedlægger to fjender i samme tur |
| **Overkill** | Fjenden dør med mindst det dobbelte af sine resterende HP i overskud |
| **Return to Sender** | Du fælder en fjende med dens eget våben eller dens egen effekt |
| **Environmental Hazard** | Du får omgivelserne til at dræbe noget — fald, ild, sten, vand |
| **Sniper** | Et dræbende træf på over tredive meters afstand |
| **Silent but Deadly** | Du fælder noget uden at nogen anden fjende opdager det |
| **Disarmed** | Du tager en fjendes våben fra den |
| **Combo** | Du og en anden spiller kombinerer to effekter til noget større |
| **Crowd Pleaser** | Du gør noget tydeligt mere spektakulært end nødvendigt |
| **Improvised** ★ | Du dræber noget med en genstand der ikke er et våben |
| **Executioner** ★ | Du gør det af med noget der havde overgivet sig |

## Guld — 6 · *første i kampagnen*

| Bedrift | Udløses af |
|---------|-----------|
| **Giant Slayer** | Du fælder noget mindst tre gange din størrelse |
| **Sweep the Leg** | Du nedlægger tre eller flere fjender i samme tur |
| **Last One Standing** | Alle andre er nede, og du vinder kampen |
| **Duelist** | Du vinder en kamp en mod en, uden at nogen blander sig |
| **Speedrun Any%** ⚑ | En boss nedlagt i første runde |
| **Called Shot** ★ | Du siger hvor du rammer, inden du slår — og det gør du |

---

# Armor

*Blåt papir. Det andre gør ved dig.*

## Bronze — 22

| Bedrift | Udløses af |
|---------|-----------|
| **Ouch** | Første gang du tager skade |
| **Suit Up** | Første gang du tager rustning på |
| **Fully Equipped** | Du står med våben, rustning og skjold på samtidig |
| **Helmet On** | Du tager noget på der ser fjollet ud, fordi det virker |
| **Better You Than Me** | Du tager skade der var rettet mod en anden spiller |
| **Bodyguard** | Du stiller dig mellem en fjende og en anden spiller |
| **Shield Wall** | Du spærrer en vej med din egen krop, og noget bliver stoppet |
| **Braced** | Du står imod noget der skulle have flyttet dig |
| **Dug In** | Du bruger en tur på at gøre dig klar, og det betaler sig |
| **Bounced** | Et angreb rammer forbi din rustning med præcis ét point |
| **Cushioned** | Du falder og tager ingen skade |
| **Down but Not Out** | Din første death save der lykkes |
| **Nine Lives** ↻ | Du ender på præcis 1 HP |
| **Sacrificial** | Et af dine kort ødelægges i stedet for dig |
| **Human Ladder** | Holdet løser noget fysisk ved at bruge hinanden |
| **Second Skin** | Du sover i din rustning |
| **Naked and Afraid** ★ | Du står uden rustning midt i en kamp |
| **Trust Fall** ★ | Du gør noget dumt fordi en anden spiller bad dig om det |
| **The Floor Is Also a Weapon** ★ | Du tager faldskade fra noget du selv satte i gang |
| **Face First** ★ | Du fejler en save og lander på noget hårdt |
| **Slippery** ★ | Du undslipper noget der havde fat i dig |
| **Scarred** ★ | Du får et mærke du beholder resten af kampagnen |

## Sølv — 12

| Bedrift | Udløses af |
|---------|-----------|
| **Tank** | Ét angreb tager mere end halvdelen af dit maksimale HP, og du bliver stående |
| **Not Today** | Du overlever en tur hvor du burde være død |
| **Hard to Kill** | Du kommer gennem en hel kamp på encifret HP |
| **Back from the Brink** | Du rejser dig fra 0 HP og nedlægger en fjende i samme tur |
| **Still Here** | Du rejser dig efter at have været nede |
| **Got Your Back** | Du redder en anden spiller fra 0 HP |
| **Designated Driver** | Du bærer eller trækker en bevidstløs kammerat i sikkerhed |
| **Hold the Line** | Du er den eneste mellem fjenden og resten af holdet, og de kommer ikke forbi |
| **Anchor** | Du holder den samme position hele kampen igennem |
| **Two for One** | Et angreb rettet mod dig rammer noget andet i stedet |
| **Adrenaline** ★ | Du gør noget du ikke burde kunne, fordi du er ved at dø |
| **Carried** ★ | Du bliver reddet af den du selv havde reddet |

## Guld — 6 · *første i kampagnen*

| Bedrift | Udløses af |
|---------|-----------|
| **Immovable** | En hel runde hvor fjenden kun gik efter dig, og intet ramte |
| **Unbreakable** | Du bliver stående gennem noget der lagde alle andre ned |
| **Prime Time** ⚑ | Holdet fælder en boss, og ingen er nede når den falder |
| **The Wall** ⚑ | Holdet kommer helskindet gennem en kamp de ikke burde |
| **Not Even Close** ★ | Du overlever et angreb der var beregnet til at tage hele holdet |
| **Death's Door** ★ | Du fejler to death saves og kommer tilbage alligevel |

---

# Consumables

*Mørkegrønt papir. Uheld, gift, og ting du puttede i munden.*

Halvdelen af dem er ting der gik galt. Det er med vilje: en pakke for at fejle gør det
sjovere at prøve.

## Bronze — 22

| Bedrift | Udløses af |
|---------|-----------|
| **Shopping Spree** | Din første handel i dungeon'et |
| **First Aid** | Din første helbredende genstand brugt |
| **Sommelier** | Du drikker en potion uden at vide hvad den gør |
| **Sniff Test** | Du undersøger noget grundigt før du bruger det |
| **Bottoms Up** | Du drikker to potions i samme kamp |
| **Emergency Only** | Du bruger noget du havde gemt til senere |
| **Shared Supply** | Du giver en consumable væk til en anden spiller |
| **Rations** | Du deler din mad med nogen |
| **Nat One** ★ | Din første naturlige 1 på noget der betød noget |
| **Friendly Fire** ★ | Du rammer en kammerat |
| **Trapfinder, Eventually** ★ | Din første fælde fundet **efter** den er udløst |
| **Trapped by a Trap You Found** ★ | Du udløser en fælde du selv havde opdaget |
| **Locked Out** ★ | Du låser dig selv inde eller ude |
| **Loud** ★ | Din listeplan bliver afsløret af noget du selv gjorde |
| **Butterfingers** ★ | Du taber noget skrøbeligt |
| **Wrong Order** ★ | Du gør tingene i den forkerte rækkefølge, og det koster |
| **Overpriced** ★ | Du betaler alt for meget for noget |
| **Junk Collector** ★ | Du står med tre kort af det samme værdiløse grej |
| **Hoarder** ★ | Du står med fem consumables du ikke har brugt |
| **Waste of Good Rope** ★ | Du efterlader noget brugbart bag dig |
| **Zero Percent** ★ | Du prøver noget med nul chance for at lykkes, og prøver alligevel |
| **Ate It** ★ | Du spiser noget du ikke burde spise |

## Sølv — 12

| Bedrift | Udløses af |
|---------|-----------|
| **Field Medic** | Du bringer en anden spiller tilbage med en consumable |
| **Better Living Through Chemistry** | En consumable afgør en kamp |
| **Waste Not** | Du bruger et forbrugskort i det sidste øjeblik hvor det stadig nåede at virke |
| **Cut It Close** | Du bruger noget i den allersidste tur af en kamp |
| **Chemist** ★ | Du kombinerer to consumables til én effekt |
| **Weaponised** ★ | Du bruger noget beregnet til at hjælpe som et våben |
| **Down the Wrong Pipe** ★ | Du drikker den forkerte potion |
| **Allergic** ★ | En consumable virker modsat på dig |
| **Regret** ★ | Du fortryder noget du drak, højlydt |
| **Poisoned, Cursed, and Late for Dinner** ★ | Tre forskellige tilstande på dig samtidig |
| **Well, That Was Expensive** ★ | Du ødelægger noget værdifuldt ved et uheld |
| **Made an Enemy** ★ | Noget i dungeon'et beslutter at det hader dig personligt |

## Guld — 6 · *første i kampagnen*

| Bedrift | Udløses af |
|---------|-----------|
| **Big Spender** | Du bruger alt hvad du ejer på ét køb |
| **The Last Potion** ⚑ | Holdets sidste helbredende genstand bliver brugt, og det rækker |
| **Full Party Wipe Avoided** ★ ⚑ | Holdet var ét slag fra at dø, og kom hjem |
| **Better Than Nothing** ★ | Du redder holdet med noget der burde være værdiløst |
| **Iron Stomach** ★ | Du overlever noget der skulle have slået dig ihjel at spise |
| **Terms and Conditions** ★ | Du indgår en aftale du ikke har læst helt |

---

# Magic

*Lavendel papir. Spells og magic items.*

## Bronze — 22

| Bedrift | Udløses af |
|---------|-----------|
| **Abracadabra** | Din første spell castet |
| **Cantrip Kid** | Du løser noget uden for kamp med en cantrip |
| **Light Source** | Du laver lys med magi for første gang |
| **Scroll Reader** | Din første spell scroll brugt |
| **Enchanted** | Dit første magic item |
| **Upcast** | Du caster en spell i et højere slot end nødvendigt, og det virker |
| **Ritualist** | Du bruger en spell som ritual for at spare et slot |
| **Utility Belt** | Du løser et problem uden for kamp med en spell der ikke gør skade |
| **Detected** | Du finder noget skjult med en spell |
| **Concentration** | Du holder koncentrationen gennem et angreb |
| **Dispelled** | Du fjerner en magisk effekt |
| **Identified** | Du finder ud af hvad et magic item gør, før du bruger det |
| **Borrowed Power** | Du bruger et magic item der ikke er dit |
| **Second Opinion** | Du caster den samme spell to gange i træk, fordi den virkede |
| **Attunement Issues** ★ | Du står med tre attunede magic items samtidig |
| **Read the Label** ★ | Du bruger et magic item forkert |
| **Backfire** ★ | En spell rammer dig selv |
| **Fizzled** ★ | Du bruger et slot på ingenting |
| **Cursed** ★ | Du finder ud af at noget er forbandet ved at bære det |
| **Look Up** ★ | Du opdager noget vigtigt ved at kigge opad |
| **Don't Read That** ★ | Du læser noget du ikke burde læse |
| **Sponsored Content** ★ | Du bruger et produkt der blev navngivet i en af systemets beskeder |

## Sølv — 12

| Bedrift | Udløses af |
|---------|-----------|
| **Bookworm** | Din første tome læst — en spell lært permanent |
| **Attuned** | Dit første attunement fuldført |
| **Counterspell** | Du afbryder en fjendes magi |
| **Save or Suck** | Tre fjender fejler den samme save mod din spell |
| **Overkill, Arcane Edition** | En spell rammer fem eller flere fjender på én gang |
| **Nowhere to Run** | En spell fanger noget der var på vej væk |
| **Turned** | Du får noget til at kæmpe for dig med magi |
| **Through the Wall** | Du kommer igennem noget fast ved hjælp af magi |
| **Sharing Is Caring** | Du giver et magic item væk til en anden spiller |
| **Out of Slots** ★ | Du bruger dit sidste spell slot, og vinder kampen alligevel |
| **Overcharged** ★ | Du presser et magic item længere end det burde kunne |
| **Deal with It** ★ | Du løser et problem med en spell der slet ikke var beregnet til det |

## Guld — 6 · *første i kampagnen*

| Bedrift | Udløses af |
|---------|-----------|
| **Archmage** | Din første spell på level 6 eller højere |
| **Legendary Bearer** | Dit første Legendary magic item |
| **Artifact** ★ | Du får fat i noget der har sit eget navn og sin egen vilje |
| **Wild Magic** ★ | Magi går galt på en måde der ender med at hjælpe |
| **Rewritten** ★ | Magi ændrer noget permanent ved dungeon'et |
| **Patron** ★ | Noget dernede tilbyder dig en aftale, og du siger ja |

---

# Class Box

*Guldgult papir, sort voks. Ikke gradueret, så den står uden for beholdningen.*

| Bedrift | Udløses af |
|---------|-----------|
| **Welcome to the Dungeon** ⚑ | Første skridt ned. Alle får den samtidig |
| **Level Up** ↻ | Hver gang du stiger et level |
| **Subclass** | Du vælger din subclass |
| **Unarmed and Dangerous** | Du fælder noget med de bare næver |
| **Backstory** | Noget fra dit rigtige liv viser sig at være nyttigt dernede |
| **Mentor** | Du lærer en anden spiller noget din karakter kan |
| **New Friend** | Du får en fjende til at skifte side |
| **Signature Move** | Du gør noget så karakteristisk at bordet giver det et navn |
| **Multiclass** ★ | Du tager et level i noget andet end det du startede med |
| **Rival** ★ | En anden spiller og du kappes om det samme, og du vinder |
| **Reputation** ★ | Noget dernede har hørt om dig før I mødes |
| **Sacrifice** ★ | Du giver afkald på noget du havde, for holdets skyld |
| **Kingmaker** ★ | Du får noget dernede til at adlyde dig permanent |
| **The Long Game** ★ | En plan du lagde flere sessioner tidligere går op |
| **Solo** ★ | Du vinder en kamp helt alene mens resten af holdet er ude af spil |
| **Ascended** | Du forlader dungeon'et i live |

`Welcome to the Dungeon` er den eneste der uddeles uden at nogen har gjort noget. Den skal
læses op inden første tur, sammen med en Adventurer- og en Weapons-pakke i Bronze — så har
alle kort på bordet fra minut ét.

---

## Hvad der blev skrottet, og hvorfor

Den oprindelige liste havde 34 bedrifter der krævede bogføring: løbende tællere, målere
der skulle nulstilles, og streaks man skulle huske ikke var brudt. De er væk, og de er
ikke erstattet én til én.

| Skrottet | Hvorfor | Hvad der kom i stedet |
|----------|---------|-----------------------|
| Butcher's Bill · Hundred Club | 25 og 100 nedlagte fjender — den tungeste tæller på arket | **Punching Up**, som er gentagelig i stedet for kumulativ |
| Tank · Meat Shield · Walk It Off | skade taget i én kamp, målt løbende | **Tank** måler nu ét angreb mod dit halve maksimum |
| Locksmith · Disarming Personality | ti låse, tre fælder | den første lås og den første fælde er nok |
| Full Caster | fem forskellige magiskoler over en kampagne | **Archmage**, som er ét enkelt højt slot |
| Perfect Round · Untouchable · Ghost · Untouched | streaks over en kamp eller en etage | **Immovable**, som afgøres på én runde |
| Minimalist · Nobody Left Behind · Pacifist Run · Deathless · Survivor | streaks over en etage eller hele kampagnen | — |
| Fan Favourite · Trending · Dead Air | bedrifter talt op pr. session | — |
| Specialist · Well-Rounded · Collector · Completionist | bedrifter talt op over kampagnen | — |
| One Week In · The Regular | dage og sessioner talt op | — |

**CR-trappen er også væk.** Et mellemtrin hvor fire bedrifter fik deres størrelse slået op
i en tabel over monsterets CR. Det var ét system for meget: de fire ligger nu i de
almindelige sektioner med en fast præmie som alle andre — `Punching Up` i Weapons Bronze,
`Giant Slayer` i Weapons Guld, `Boss Down` i Weapons Sølv og `Floor Cleared` i Adventurer
Sølv.

---

## Idéer der ikke er skrevet ind endnu

- **Etagespecifikke bedrifter.** En bedrift der kun findes på etage 3 gør etage 3 til et
  sted, ikke et rum. Kræver at etagerne er tegnet først.
- **Team quests som belønning.** I stedet for en pakke: en opgave holdet får stillet, med
  en større pakke i den anden ende. `Sponsored Content` og `Patron` peger allerede den vej.
- **Negative bedrifter.** En bedrift der giver en *forbandelse* i stedet for en pakke. Kan
  være meget sjovt og meget surt — prøv én og se.
- **Guld som kapløb, sagt højt.** Guldbedrifterne går til den første der gør det. Læses de
  op ved kampagnens start, bliver de til mål. Holdes de skjult, bliver de til overraskelser.
  Begge dele virker; de virker ikke samtidig.
