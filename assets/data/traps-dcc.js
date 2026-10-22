/* DCC-D-D's egne fælder — vores eget materiale.
 *
 * SRD 5.2.1 har otte fælder. Det er for få til en etage med fem, og det er
 * alt for få til tyve etager: den samme faldgrube kommer igen og igen. Så er
 * de her skrevet til formålet. De er vores, ikke Wizards', og de må derfor
 * ligge på en offentlig side uanset hvad SRD-knappen står på.
 *
 * Formen er SRD'ens, fordi arket skal læses i ét stræk: en grad — Nuisance
 * eller Deadly, der er ikke andre — en udløser, en virkning, og hvordan den
 * findes og uskadeliggøres. Reglerne er spillets egne begreber (saving
 * throws, tilstande, skadestyper); de står på engelsk, fordi det er dem man
 * slår op i.
 *
 * Til forskel fra SRD'ens har disse ikke et niveauspænd, men fire trin: DC og
 * skade står som en liste for level 1-4, 5-10, 11-16 og 17-20, i samme
 * inddeling som SRD'ens egne skaleringstabeller. Derfor kan hver fælde bruges
 * hele vejen op, og alle 28 er i spil på hver etage. {dc} og {dmg} i teksten
 * udfyldes af encounters.js med etagens eget trin.
 *
 * `where` siger hvor fælden kan sidde: 'door' på en dør eller en lås, 'room'
 * i et rum, 'both' begge steder. En snubletråd virker i en døråbning; en
 * roterende gulvskive gør ikke.
 *
 * `blocks` siger, at fælden efterlader døren ubrugelig. Den slags lægges kun
 * på en dør, der ikke er etagens eneste vej til rummet bagved — ellers ville
 * etagen spærre sig selv. Generatoren måler det (se dccDoorRisk) og springer
 * de døre over.
 *
 * `severity` er den samme skala som SRD'ens: Nuisance eller Deadly, og den
 * siger hvad fælden koster holdet *på dens eget niveau* — ikke hvor mange
 * terninger der står i teksten. SRD'en viser det selv: Rolling Stone er
 * Deadly på level 11-16 og Nuisance på 17-20. Det er den samme sten.
 */
window.TRAPS_DCC_VERSION = "1";
window.TRAPS_DCC = [

  /* ---------- døre og låse ---------- */

  {
    "name": "Klæbelås",
    "severity": "Nuisance",
    "where": "door",
    "trigger": "Nogen rører dørens håndtag",
    "effect": "Håndtaget er smurt i kogt harpiks, og hånden sidder fast. Den klæbede har Grappled-tilstanden med døren som griber og kan gøre ét forsøg pr. tur: DC {dc} Strength (Athletics). En anden kan skære hud og handske fri med en action, hvilket koster {dmg} Slashing damage.",
    "detect": "DC {dc} Wisdom (Perception) — harpiksen glinser og lugter sødt.",
    "dc": [12, 14, 16, 18],
    "dmg": ["2 (1d4)", "3 (1d6)", "4 (1d8)", "5 (1d10)"]
  },
  {
    "name": "Larmklokke",
    "severity": "Nuisance",
    "where": "both",
    "trigger": "Døren åbnes uden at knebelen holdes fast",
    "effect": "En klokke bag karmen slår tre gange. Alt levende inden for 120 fod ved nu hvor holdet er: de kan ikke overraskes de næste 10 minutter, og det nærmeste rums beboere er fremme om 1d4 runder. Ingen skade — dungeonen gør opmærksom på sig selv, den slår ikke selv.",
    "detect": "DC {dc} Wisdom (Perception) — knebelen kan ses gennem sprækken over døren og bindes op med en snor.",
    "dc": [12, 14, 15, 16]
  },
  {
    "name": "Spændbolt",
    "severity": "Deadly",
    "where": "door",
    "trigger": "Låsen drejes af andet end den rette nøgle",
    "effect": "En armbrøst bag karmen affyrer en bolt på klos hold. Den der drejer, gør et DC {dc} Dexterity saving throw og tager {dmg} Piercing damage ved fejl, halvt så meget ved held.",
    "detect": "DC {dc} Wisdom (Perception) — en tynd stribe olie løber fra nøglehullet. Senen kan klippes med en action og et DC 13 Dexterity (Sleight of Hand) check.",
    "dc": [13, 15, 16, 18],
    "dmg": ["7 (2d6)", "14 (4d6)", "28 (8d6)", "49 (14d6)"]
  },
  {
    "name": "Rustpust",
    "severity": "Nuisance",
    "where": "door",
    "trigger": "Døren åbnes",
    "effect": "Et hulrum i dørbladet puster en sky af rust og knust glas ud. Hver skabning inden for 5 fod gør et DC {dc} Constitution saving throw og tager ved fejl {dmg} Acid damage og har Blinded-tilstanden indtil slutningen af sin næste tur.",
    "detect": "DC {dc} Wisdom (Perception) — dørbladet lyder hult, og der ligger rødt støv langs tærskelen.",
    "dc": [12, 14, 16, 17],
    "dmg": ["3 (1d6)", "7 (2d6)", "14 (4d6)", "24 (7d6)"]
  },
  {
    "name": "Gnistkarm",
    "severity": "Deadly",
    "where": "door",
    "trigger": "Metal rører dørens karm",
    "effect": "Karmen er viklet i kobbertråd. Den der rører den med metal, gør et DC {dc} Dexterity saving throw og tager {dmg} Lightning damage ved fejl, halvt så meget ved held. Bærer man rustning af metal, gøres kastet med disadvantage.",
    "detect": "DC {dc} Intelligence (Investigation) — tråden ligger i en rille langs karmen og kan kortsluttes med en våd klud.",
    "dc": [13, 15, 16, 18],
    "dmg": ["9 (2d8)", "18 (4d8)", "36 (8d8)", "55 (10d10)"]
  },
  {
    "name": "Hvæsende hængsel",
    "severity": "Deadly",
    "where": "door",
    "trigger": "Døren åbnes mere end en håndsbred",
    "effect": "Det nederste hængsel er en beholder med gas under tryk. Hver skabning inden for 10 fod gør et DC {dc} Constitution saving throw og tager ved fejl {dmg} Poison damage og har Poisoned-tilstanden i 1 time. Ved held er skaden halv, og tilstanden udebliver.",
    "detect": "DC {dc} Wisdom (Perception) — hængslet er nyere end døren og svejset til.",
    "dc": [13, 15, 16, 18],
    "dmg": ["7 (2d6)", "14 (4d6)", "28 (8d6)", "45 (13d6)"]
  },
  {
    "name": "Svøbekæde",
    "severity": "Deadly",
    "where": "door",
    "trigger": "Døren svinger mere end halvt op",
    "effect": "To kæder med kroge svinger ud fra karmen. Den der åbner, gør et DC {dc} Dexterity saving throw og tager ved fejl {dmg} Bludgeoning damage og har Restrained-tilstanden. Man kommer fri med en action og et DC {dc} Strength (Athletics) check.",
    "detect": "DC {dc} Wisdom (Perception) — to lodrette ridser i gulvet foran døren, en alen fra hinanden.",
    "dc": [13, 15, 16, 18],
    "dmg": ["9 (2d8)", "18 (4d8)", "33 (6d10)", "44 (8d10)"]
  },
  {
    "name": "Vægterøje",
    "severity": "Nuisance",
    "where": "door",
    "trigger": "Nogen står foran døren i mere end 6 sekunder uden at røre den",
    "effect": "Et øje skåret i dørbladet åbner sig og råber højt og tydeligt hvor mange der står udenfor, og hvad de bærer. Alt levende inden for 120 fod ved nu hvor holdet er. Ingen skade: dungeonen lever af publikum, ikke af lig.",
    "detect": "DC {dc} Wisdom (Perception) — udskæringen har en pupil af poleret obsidian. Et klæde over øjet gør det blindt.",
    "dc": [13, 14, 15, 16]
  },
  {
    "name": "Pralende lås",
    "severity": "Nuisance",
    "where": "door",
    "trigger": "Låsen dirkes",
    "effect": "Låsen taler, mens den bliver dirket, og den er en dårlig taber. Den opremser højt hvor mange der har prøvet før, og hvor de ligger nu. Dirkningen tager 1 minut i stedet for en action, og alt levende inden for 60 fod ved at nogen er ved døren. Ingen skade.",
    "detect": "DC {dc} Wisdom (Perception) — der sidder en lille messingmund under nøglehullet.",
    "dc": [12, 13, 14, 15]
  },
  {
    "name": "Smeltelås",
    "severity": "Nuisance",
    "where": "door",
    "blocks": true,
    "trigger": "Låsen dirkes, eller der drejes med den forkerte nøgle",
    "effect": "Låsen løber ud i hvidglødende metal og størkner i karmen. Den der holder i den, gør et DC {dc} Dexterity saving throw og tager ved fejl {dmg} Fire damage. Værre er, at døren ikke kan åbnes igen — lås, hængsler og karm er ét stykke jern. Den skal brydes ned — AC 17, 60 hit points, Immunity over for Poison og Psychic — eller man går uden om.",
    "detect": "DC {dc} Wisdom (Perception) — karmen er sod-sort omkring nøglehullet, og metallet er varmt.",
    "dc": [12, 14, 15, 16],
    "dmg": ["2 (1d4)", "3 (1d6)", "5 (1d10)", "7 (2d6)"]
  },
  {
    "name": "Faldbom",
    "severity": "Nuisance",
    "where": "door",
    "blocks": true,
    "trigger": "Døren åbnes og slippes igen",
    "effect": "En jernbom falder ned bag døren og kiler sig fast i gulvet. Ingen skade — men døren er lukket for altid fra begge sider, og bommen kan ikke nås. Den skal brydes ned (AC 15, 40 hit points), eller holdet må finde den anden vej rundt.",
    "detect": "DC {dc} Intelligence (Investigation) — der er en lodret fals i karmen og et hul i gulvet under den.",
    "dc": [12, 14, 15, 16]
  },
  {
    "name": "Styrtet dørkarm",
    "severity": "Deadly",
    "where": "door",
    "blocks": true,
    "trigger": "Døren åbnes helt",
    "effect": "Overliggeren er savet over, og loftet over døråbningen styrter ned. Den der åbner, gør et DC {dc} Dexterity saving throw og tager ved fejl {dmg} Bludgeoning damage og har Prone-tilstanden; ved held er skaden halv, og den springer tilbage. Døråbningen er derefter fyldt med sten og skal graves fri — en time pr. person der graver — eller man går uden om.",
    "detect": "DC {dc} Wisdom (Perception) — der drysser støv fra sprækken over døren.",
    "dc": [13, 15, 16, 18],
    "dmg": ["10 (3d6)", "21 (6d6)", "35 (10d6)", "52 (15d6)"]
  },
  {
    "name": "Sjælelås",
    "severity": "Deadly",
    "where": "door",
    "trigger": "Håndtaget drejes af nogen uden dørens nøgle",
    "effect": "Låsen er bundet til den der lavede den. Den der drejer, gør et DC {dc} Constitution saving throw og tager ved fejl {dmg} Necrotic damage, og dens maksimale hit points falder med det samme tal indtil den har gennemført et long rest. Ved held er skaden halv, og maksimum rører sig ikke.",
    "detect": "DC {dc} Intelligence (Arcana) — nøglehullet er varmt.",
    "dc": [13, 15, 16, 18],
    "dmg": ["5 (1d10)", "11 (2d10)", "22 (4d10)", "55 (10d10)"]
  },
  {
    "name": "Spejldør",
    "severity": "Deadly",
    "where": "door",
    "trigger": "Døren åbnes",
    "effect": "Dørbladet er poleret, og det man ser i det, er sig selv ti år senere. Den der åbner, gør et DC {dc} Wisdom saving throw og tager ved fejl {dmg} Psychic damage og har Frightened-tilstanden i 1 minut med sit eget spejlbillede som kilde. Den kan gentage kastet i slutningen af hver af sine ture.",
    "detect": "DC {dc} Intelligence (Arcana) — spejlbilledet blinker et øjeblik efter man selv gør.",
    "dc": [13, 15, 16, 18],
    "dmg": ["9 (2d8)", "18 (4d8)", "36 (8d8)", "45 (10d8)"]
  },
  {
    "name": "Dørvogteren",
    "severity": "Deadly",
    "where": "door",
    "trigger": "Døren åbnes af nogen der ikke bærer vogterens mærke",
    "effect": "En stenarm svinger ud af væggen ved siden af døren. Den der åbner, gør et DC {dc} Dexterity saving throw og tager ved fejl {dmg} Bludgeoning damage og skubbes 15 fod tilbage ned ad gangen. Ved held er skaden halv, og den står fast.",
    "detect": "DC {dc} Wisdom (Perception) — en lodret sprække i væggen, en armslængde fra karmen.",
    "dc": [13, 15, 16, 18],
    "dmg": ["10 (3d6)", "21 (6d6)", "35 (10d6)", "52 (15d6)"]
  },
  {
    "name": "Tærende karm",
    "severity": "Deadly",
    "where": "door",
    "trigger": "Karmen berøres med bar hud",
    "effect": "Karmen er overtrukket med en levende lak. Hver skabning der rører den, gør et DC {dc} Constitution saving throw og tager ved fejl {dmg} Acid damage, halvt så meget ved held. Metal der rører karmen i mere end en runde, tager et blivende −1 til angrebsrul eller AC, indtil det bliver sat i stand.",
    "detect": "DC {dc} Wisdom (Perception) — lakken bobler, hvor den har rørt noget.",
    "dc": [13, 15, 16, 18],
    "dmg": ["7 (2d6)", "14 (4d6)", "28 (8d6)", "49 (14d6)"]
  },
  {
    "name": "Omvendt dør",
    "severity": "Deadly",
    "where": "door",
    "trigger": "Døren åbnes og lukkes igen med nogen imellem",
    "effect": "Døren fører ikke derhen hvor den sidder. Den der går igennem, lander i et tilfældigt andet rum på etagen — DM'en slår — og gør et DC {dc} Dexterity saving throw mod {dmg} Force damage for landingen. Resten af holdet står tilbage ved en dør, der nu er låst fra den anden side.",
    "detect": "DC {dc} Intelligence (Arcana) — luften i dørhullet er koldere end rummet bag.",
    "dc": [13, 15, 16, 18],
    "dmg": ["7 (2d6)", "14 (4d6)", "24 (7d6)", "42 (12d6)"]
  },

  /* ---------- rum ---------- */

  {
    "name": "Smuldergulv",
    "severity": "Nuisance",
    "where": "room",
    "trigger": "Nogen går over rummets midterste tredjedel",
    "effect": "Gulvet er en skal af puds over et hulrum ti fod nede. Den der træder på det, gør et DC {dc} Dexterity saving throw; ved fejl falder den ned, tager {dmg} Bludgeoning damage og har Prone-tilstanden. Hullet bliver liggende og kan klatres op af med et DC 10 Strength (Athletics) check.",
    "detect": "DC {dc} Wisdom (Perception) — gulvet lyder forkert, og der er ingen slidspor hen over det.",
    "dc": [12, 14, 15, 16],
    "dmg": ["3 (1d6)", "7 (2d6)", "14 (4d6)", "24 (7d6)"]
  },
  {
    "name": "Klokkegulv",
    "severity": "Nuisance",
    "where": "room",
    "trigger": "Nogen træder på en af rummets løse fliser",
    "effect": "Under hver tredje flise hænger en klokke. Ingen skade, men alt levende inden for 90 fod ved nu hvor holdet er, og beboerne i det nærmeste rum er fremme om 1d4 runder. Går man på fliserne med vilje, kan man slå en melodi an; hvad den gør, bestemmer DM'en.",
    "detect": "DC {dc} Wisdom (Perception) — fliserne vipper en smule.",
    "dc": [12, 13, 14, 15]
  },
  {
    "name": "Sæbegulv",
    "severity": "Nuisance",
    "where": "room",
    "trigger": "Nogen går ind i rummet i mere end gåtempo",
    "effect": "Gulvet er smurt i fedt under et lag støv. Enhver skabning der bevæger sig mere end halv Speed i rummet, gør et DC {dc} Dexterity (Acrobatics) check og har ved fejl Prone-tilstanden og glider 10 fod videre i samme retning. Ingen skade — men en kamp i rummet er noget andet, og det er rummet bygget til.",
    "detect": "DC {dc} Wisdom (Perception) — støvet ligger for jævnt, og der er en ren stribe langs væggen hvor beboerne går.",
    "dc": [12, 13, 14, 15]
  },
  {
    "name": "Sodsky",
    "severity": "Nuisance",
    "where": "room",
    "trigger": "Nogen bærer åben ild ind i rummet",
    "effect": "Loftet er dækket af fint sod, og varmen løsner det. Rummet fyldes med en sky der slukker al åben ild og gør området Heavily Obscured i 1 minut. Hver skabning i rummet gør et DC {dc} Constitution saving throw og har ved fejl Blinded-tilstanden indtil slutningen af sin næste tur. {dmg} Fire damage til den der bar flammen.",
    "detect": "DC {dc} Wisdom (Perception) — loftet er sort, og gulvet er det ikke.",
    "dc": [12, 13, 15, 16],
    "dmg": ["2 (1d4)", "3 (1d6)", "7 (2d6)", "10 (3d6)"]
  },
  {
    "name": "Tornenet",
    "severity": "Deadly",
    "where": "both",
    "trigger": "Nogen krydser en snor spændt tre tommer over gulvet",
    "effect": "Et net af jerntorne falder ned fra loftet over et felt på 10 × 10 fod. Hver skabning under det gør et DC {dc} Dexterity saving throw og tager ved fejl {dmg} Piercing damage og har Restrained-tilstanden. Nettet kan skæres væk med en action og et DC {dc} Strength (Athletics) check, eller tages ned med 15 skade (AC 12).",
    "detect": "DC {dc} Wisdom (Perception) — snoren er støvet, nettet over den er ikke.",
    "dc": [13, 15, 16, 18],
    "dmg": ["7 (2d6)", "14 (4d6)", "28 (8d6)", "42 (12d6)"]
  },
  {
    "name": "Vægspyd",
    "severity": "Deadly",
    "where": "room",
    "trigger": "Nogen flytter rummets eneste løse genstand",
    "effect": "Tre spyd skyder ud af den modsatte væg i brysthøjde. Hver skabning i en linje på 30 fod frem fra væggen gør et DC {dc} Dexterity saving throw og tager ved fejl {dmg} Piercing damage, halvt så meget ved held.",
    "detect": "DC {dc} Intelligence (Investigation) — tre huller i væggen, malet i stenens egen farve.",
    "dc": [13, 15, 16, 18],
    "dmg": ["9 (2d8)", "18 (4d8)", "36 (8d8)", "55 (10d10)"]
  },
  {
    "name": "Syretåge",
    "severity": "Deadly",
    "where": "room",
    "trigger": "Nogen går mere end 10 fod ind i rummet",
    "effect": "Rummet fyldes med en lysegrøn tåge fra riller i gulvet. Hver skabning i rummet gør et DC {dc} Constitution saving throw ved slutningen af hver af sine ture og tager ved fejl {dmg} Acid damage, halvt så meget ved held. Tågen bliver i 1 minut, eller indtil den blæses væk.",
    "detect": "DC {dc} Wisdom (Perception) — rillerne i gulvet er ætset rene.",
    "dc": [13, 15, 16, 18],
    "dmg": ["5 (2d4)", "10 (4d4)", "18 (4d8)", "27 (6d8)"]
  },
  {
    "name": "Knusevægge",
    "severity": "Deadly",
    "where": "room",
    "trigger": "Den sidste dør i rummet falder i",
    "effect": "Dørene smækker, og to vægge begynder at gå mod hinanden. I tre runder tager hver skabning i rummet {dmg} Bludgeoning damage pr. runde. En skabning kan bruge sin action på et DC {dc} Strength (Athletics) check for at holde væggene stille i en runde, eller på at dirke en dør op med DC {dc} Dexterity (Sleight of Hand). Efter tredje runde går væggene tilbage.",
    "detect": "DC {dc} Intelligence (Investigation) — gulvet har to rene striber, hvor væggene har kørt før.",
    "dc": [13, 15, 16, 18],
    "dmg": ["7 (2d6)", "10 (3d6)", "17 (5d6)", "24 (7d6)"]
  },
  {
    "name": "Hvirvelgulv",
    "severity": "Nuisance",
    "where": "room",
    "trigger": "Nogen går over rummets midte",
    "effect": "Gulvet er en skive, der drejer en halv omgang i ét ryk. Hver skabning i rummet gør et DC {dc} Dexterity saving throw eller har Prone-tilstanden, og DM'en bytter om på hvor alle står. Ingen skade — men den der stod bagerst, står nu forrest.",
    "detect": "DC {dc} Wisdom (Perception) — en rund fuge i gulvet, en fod fra væggene.",
    "dc": [12, 14, 15, 16]
  },
  {
    "name": "Frostgitter",
    "severity": "Deadly",
    "where": "room",
    "trigger": "Nogen træder på gitteret i gulvet",
    "effect": "Kold damp står op gennem et gitter. Hver skabning inden for 10 fod gør et DC {dc} Constitution saving throw og tager ved fejl {dmg} Cold damage, og dens Speed er halveret indtil slutningen af dens næste tur. Ved held er skaden halv.",
    "detect": "DC {dc} Wisdom (Perception) — rim på gitterets kanter.",
    "dc": [13, 15, 16, 18],
    "dmg": ["7 (2d6)", "14 (4d6)", "28 (8d6)", "45 (13d6)"]
  },
  {
    "name": "Lynnet",
    "severity": "Deadly",
    "where": "room",
    "trigger": "To skabninger er i rummet samtidig",
    "effect": "Der løber en bue mellem alt levende i rummet. Hver skabning gør et DC {dc} Dexterity saving throw og tager ved fejl {dmg} Lightning damage, halvt så meget ved held. Er der tre eller flere i rummet, gøres kastet med disadvantage.",
    "detect": "DC {dc} Intelligence (Arcana) — håret rejser sig, inden man er helt inde.",
    "dc": [13, 15, 16, 18],
    "dmg": ["9 (2d8)", "18 (4d8)", "33 (6d10)", "55 (10d10)"]
  },
  {
    "name": "Tyngdebrønd",
    "severity": "Deadly",
    "where": "room",
    "trigger": "Nogen går over rummets midterste felt",
    "effect": "Rummets tyngde peger pludselig mod midten. Hver skabning gør et DC {dc} Strength saving throw; ved fejl trækkes den 20 fod mod midten og tager {dmg} Force damage. Alt der ikke er bundet, flyver med. Det holder i 1 minut, og i den tid koster hvert skridt væk fra midten det dobbelte af Speed.",
    "detect": "DC {dc} Intelligence (Arcana) — støvet på gulvet ligger i ringe.",
    "dc": [13, 15, 16, 18],
    "dmg": ["7 (2d6)", "14 (4d6)", "28 (8d6)", "42 (12d6)"]
  },
  {
    "name": "Glemselsrøgelse",
    "severity": "Nuisance",
    "where": "room",
    "trigger": "Den første dør til rummet åbnes",
    "effect": "Tre skåle med røgelse tænder af sig selv. Hver skabning der trækker luften i rummet, gør et DC {dc} Wisdom saving throw. Ved fejl har den Incapacitated-tilstanden indtil slutningen af sin næste tur og husker ikke de sidste 10 minutter — hvilket på en etage som denne vil sige, at den ikke kan sige hvor den kom fra.",
    "detect": "DC {dc} Wisdom (Perception) — skålene er rene indvendigt og brugte udvendigt.",
    "dc": [13, 14, 15, 16]
  },
  {
    "name": "Dobbeltgængere",
    "severity": "Deadly",
    "where": "room",
    "trigger": "Nogen træder ind i rummet",
    "effect": "Rummets vægge viser holdet selv, et øjeblik bagud. Hver skabning gør et DC {dc} Wisdom saving throw og tager ved fejl {dmg} Psychic damage; den der fejler med 5 eller mere, bruger desuden sin reaction på ét våbenangreb mod den nærmeste allierede, som den tager for sit eget spejlbillede.",
    "detect": "DC {dc} Intelligence (Investigation) — væggene er glatte som vand og kolde at røre.",
    "dc": [13, 15, 16, 18],
    "dmg": ["9 (2d8)", "18 (4d8)", "36 (8d8)", "45 (10d8)"]
  },
  {
    "name": "Soludbrud",
    "severity": "Deadly",
    "where": "room",
    "trigger": "Nogen rører rummets midterste felt",
    "effect": "En plade i loftet åbner sig, og rummet står i hvidt lys. Hver skabning gør et DC {dc} Dexterity saving throw og tager ved fejl {dmg} Radiant damage og har Blinded-tilstanden i 1 minut; ved held er skaden halv, og den er Blinded indtil slutningen af sin næste tur. En Blinded skabning kan gentage kastet i slutningen af hver af sine ture.",
    "detect": "DC {dc} Wisdom (Perception) — gulvet er brændt blegt i en cirkel under pladen.",
    "dc": [14, 15, 17, 18],
    "dmg": ["10 (3d6)", "21 (6d6)", "35 (10d6)", "52 (15d6)"]
  },
  {
    "name": "Sjæleknuser",
    "severity": "Deadly",
    "where": "room",
    "trigger": "Noget bæres ud af rummet",
    "effect": "Rummet beholder sit. Den der bærer noget over tærskelen, gør et DC {dc} Constitution saving throw og tager ved fejl {dmg} Necrotic damage, og dens maksimale hit points falder med det samme tal indtil et long rest. Lægger man genstanden tilbage, holder det op — men skaden står.",
    "detect": "DC {dc} Intelligence (Arcana) — der står navne i gulvet ved døren, og der er plads til flere.",
    "dc": [13, 15, 16, 18],
    "dmg": ["5 (1d10)", "11 (2d10)", "22 (4d10)", "55 (10d10)"]
  }
];
