/* Loot Box Generator — kerne: datamodel, lagring, import og trækning. */
window.LB = (function () {
  'use strict';

  /* ---------------- rarities ---------------- */

  var RARITIES = [
    { key: 'common',    label: 'Common' },
    { key: 'uncommon',  label: 'Uncommon' },
    { key: 'rare',      label: 'Rare' },
    { key: 'very_rare', label: 'Very Rare' },
    { key: 'legendary', label: 'Legendary' }
  ];
  var RKEYS = RARITIES.map(function (r) { return r.key; });

  /* To akser, som er nemme at forveksle:

       korttrin    — hvad en kortplads slår. Styres af fordelingen på kortet.
                     Common … Legendary.
       magi-rarity — magic itemets egen rarity fra D&D. Common … Artifact.

     De er bevidst adskilt. Et Rare kort er et godt kort på udstyrssiden — 20
     til 50 gp — men et Rare magic item er en Flame Tongue. Slog man dem
     sammen, ville et pænt kort dele artefakter ud.

     Derfor oversættes korttrinnet til en magi-rarity, når kortet lander på et
     magic item. Oversættelsen findes på fire niveauer, hvor det mest specifikke
     vinder: kort → tier → pakke → den fælles tabel under fanen Magic.      */

  var MAGIC_RARITIES = RARITIES.concat([{ key: 'artifact', label: 'Artifact' }]);
  var MKEYS = MAGIC_RARITIES.map(function (r) { return r.key; });

  /* Magic items er items som alt andet — de ligger i samme liste, med denne
     kategori og deres D&D-type som tag. Navnet står ét sted, så et filter,
     en vægt og en kortplads alle taler om det samme. */
  var MAGIC_CAT = 'Magic';

  function magicRarityLabel(key) {
    for (var i = 0; i < MAGIC_RARITIES.length; i++)
      if (MAGIC_RARITIES[i].key === key) return MAGIC_RARITIES[i].label;
    return key || '—';
  }

  function rarityLabel(key) {
    for (var i = 0; i < RARITIES.length; i++) if (RARITIES[i].key === key) return RARITIES[i].label;
    return key || '—';
  }

  /* Normaliserer fritekst ("very rare", "Very-Rare", "vr") til en rarity-nøgle. */
  function normalizeRarity(raw) {
    if (!raw) return null;
    var s = String(raw).toLowerCase().replace(/[\s_-]+/g, '');
    if (s === 'common' || s === 'c') return 'common';
    if (s === 'uncommon' || s === 'u') return 'uncommon';
    if (s === 'veryrare' || s === 'vr') return 'very_rare';
    if (s === 'rare' || s === 'r') return 'rare';
    if (s === 'legendary' || s === 'l') return 'legendary';
    if (s === 'artifact') return 'artifact';
    return null;
  }

  /* ---------------- rarity-skalaer ----------------
     To prisskalaer fra regnearket. "gear" bruger øvre grænser i gp fra
     Oversigt-arket; "magic" bruger DMG-priserne. "none" = ingen pris,
     rarity sættes manuelt (fx Class-kort).                            */

  function defaultScales() {
    return [
      {
        id: 'gear', name: 'Udstyr',
        // max = øvre grænse (inklusiv). Et item får første rarity hvor pris <= max.
        steps: [
          { r: 'common',    max: 1.99 },
          { r: 'uncommon',  max: 19.99 },
          { r: 'rare',      max: 49.99 },
          { r: 'very_rare', max: 249.99 },
          { r: 'legendary', max: null }
        ]
      },
      {
        id: 'magic', name: 'Magic Items',
        steps: [
          { r: 'common',    max: 100 },
          { r: 'uncommon',  max: 400 },
          { r: 'rare',      max: 4000 },
          { r: 'very_rare', max: 40000 },
          { r: 'legendary', max: null }
        ]
      }
    ];
  }

  function findScale(cfg, id) {
    for (var i = 0; i < cfg.scales.length; i++) if (cfg.scales[i].id === id) return cfg.scales[i];
    return cfg.scales[0];
  }

  /* Understøtter "150 gp", "1.500", "2,5 gp", "50 SP", "10 CP" -> gp. */
  function parsePrice(raw) {
    if (raw === null || raw === undefined || raw === '') return null;
    if (typeof raw === 'number') return isFinite(raw) ? raw : null;
    var s = String(raw).toLowerCase().trim();
    var unit = /\bsp\b/.test(s) ? 0.1 : /\bcp\b/.test(s) ? 0.01 : /\bpp\b/.test(s) ? 10 : 1;
    var num = s.replace(/[^0-9.,]/g, '');
    if (!num) return null;
    // Tusindtalsseparator vs decimal: sidste separator med 1-2 cifre efter = decimal.
    var m = num.match(/[.,](\d{1,2})$/);
    if (m) num = num.slice(0, num.length - m[0].length).replace(/[.,]/g, '') + '.' + m[1];
    else num = num.replace(/[.,]/g, '');
    var v = parseFloat(num);
    return isFinite(v) ? v * unit : null;
  }

  function priceToRarity(price, scale) {
    if (price === null || price === undefined || !isFinite(price)) return null;
    if (!scale || !scale.steps) return null;
    for (var i = 0; i < scale.steps.length; i++) {
      var st = scale.steps[i];
      if (st.max === null || st.max === undefined || price <= st.max) return st.r;
    }
    return scale.steps[scale.steps.length - 1].r;
  }

  /* ---------------- standardopsætning ---------------- */

  function dist(o) {
    var d = {};
    RKEYS.forEach(function (k) { d[k] = (o && o[k]) || 0; });
    return d;
  }

  /* Filteret bestemmer udstyrspuljen: hvilke kategorier der må trækkes, og om
     forbrugsvarer er med. Typen ligger i kategorien for alt indhold — også
     Class-kort — så der er ikke brug for en tag-akse ved siden af.

     consumables: 'all' | 'exclude' | 'only'. */
  function filt(categories, consumables) {
    return {
      categories: categories || [],
      consumables: consumables || 'all'
    };
  }

  /* weights gælder kun sammen med et eget filter — uden det trækker kortet fra
     pakkens pulje, og så er det pakkens (eller tierets) vægte der er de rigtige.

     magicDist er kortets egen fordeling over magi-rarity: "lander dette kort på
     magi, hvor godt er det så". Den gælder uanset korttrin og er den nemme knap
     at skrue på pr. kort. Uden den følger kortet tieret, pakken eller den
     fælles korttrin-tabel. */
  function card(label, d, filter, weights, magic) {
    return {
      label: label || '', dist: dist(d),
      filter: filter || null, weights: weights || null,
      magicChance: (magic && typeof magic.chance === 'number') ? magic.chance : null,
      magicDist: (magic && magic.dist) ? magicDist(magic.dist) : null,
      magicTypes: (magic && magic.types) ? magic.types : null
    };
  }




  /* Alle fem indstillinger findes på tre niveauer — pakke, tier, kort — og det
     mest specifikke vinder, felt for felt:

       magicChance   chancen for at kortet bliver et magic item
       magicDist     rarity-fordeling for magic items
       magicTypes    typevægte for magic items
       dist          rarity-fordeling for almindelige items
       weights       kategorivægte for almindelige items

     De to sider af ja/nej-spørgsmålet har altså samme to knapper. Kun puljen
     og navnet på "type" er forskelligt: magic items har deres D&D-type,
     almindelige items har deres kategori. */
  function tier(id, name, cards, weights, dist_) {
    return {
      id: id, name: name, cards: cards,
      weights: weights || null,
      dist: dist_ ? dist(dist_) : null
    };
  }

  /* Er en fordeling tom, betyder den "ikke sat" — så arves der. Et kort med
     lutter nuller ville ellers give et tomt kort i stedet for at følge tieret. */
  function hasDist(d) {
    if (!d) return false;
    for (var i = 0; i < RKEYS.length; i++) if ((Number(d[RKEYS[i]]) || 0) > 0) return true;
    return false;
  }

  /* Alle fem indstillinger arver efter samme regel: kort slår tier, tier slår
     pakke. Den står ét sted, så de fem felter ikke kan komme til at opføre sig
     forskelligt — og UI'et bruger den samme, så det viser det trækningen gør.

     Returnerer også hvilket niveau der bestemte, fordi UI'et skal kunne sige
     "arver 32 % fra tier". */
  function settingFor(pack, tierObj, c, field) {
    var levels = [['kort', c], ['tier', tierObj], ['pakke', pack]];
    for (var i = 0; i < levels.length; i++) {
      var owner = levels[i][1];
      if (!owner) continue;
      var v = owner[field];
      if (v === null || v === undefined) continue;
      // En fordeling med lutter nuller er ikke et valg, det er et urørt felt.
      if (field === 'dist' && !hasDist(v)) continue;
      return { level: levels[i][0], value: v };
    }
    return { level: null, value: null };
  }

  function distFor(pack, tierObj, c) {
    return settingFor(pack, tierObj, c, 'dist').value || (c ? c.dist : null);
  }

  /* Class-kort bærer deres type som tag, så en kortplads kan bede om præcis
     én af dem: Class, Perk, Stat, Feat eller Skill. */
  function classFilter(type) {
    return filt([type]);
  }

  /* Standardprogression for de graduerede pakker. Tallene for Adventurer Bronze
     er specificeret; resten er startgæt der kan tunes i UI'et. */
  function gradedTiers(bronze, silver, gold, weights) {
    weights = weights || {};
    return [
      tier('bronze', 'Bronze', bronze, weights.bronze),
      tier('silver', 'Sølv', silver, weights.silver),
      tier('gold', 'Guld', gold, weights.gold)
    ];
  }

  /* Et tier arver pakkens vægte, men kan overstyre dem. Magi er den eneste
     vægt der reelt skal gradbøjes gennem Bronze/Sølv/Guld, og et helt vægtsæt
     pr. tier ville skulle gentage de andre kategorier. Denne bygger sættet. */
  function gradeMagic(pack) {
    var tm = pack.tierMagic;
    delete pack.tierMagic;
    if (!tm) return pack;
    pack.tiers.forEach(function (t, i) {
      // Er tierets tal det samme som pakkens, skal det arve — ellers ville
      // pakkens felt stå uden virkning og se dødt ud.
      if (tm.chance && tm.chance[i] !== undefined && tm.chance[i] !== pack.magicChance)
        t.magicChance = tm.chance[i];
      if (tm.dist && tm.dist[i]) t.magicDist = magicDist(tm.dist[i]);
      if (tm.types && tm.types[i]) t.magicTypes = tm.types[i];
    });
    return pack;
  }

  /* Den brede udstyrspulje. Magic er ikke en kategori man filtrerer på —
     magi har sin egen pulje og sin egen chance. Filteret er udstyrssiden. */
  var GEAR = ['Ammunition', 'Gift', 'Rustning', 'Udstyr', 'Våben', 'Værktøj'];

  /* Kun én type magi må falde: alle andre sættes til 0. */
  function onlyTypes() {
    var allow = Array.prototype.slice.call(arguments);
    var out = {};
    ['Armor', 'Potion', 'Ring', 'Rod', 'Scroll', 'Staff', 'Wand', 'Weapon', 'Wondrous Item']
      .forEach(function (t) { if (allow.indexOf(t) < 0) out[t] = 0; });
    return out;
  }

  /* Pakkerne har en fysisk farvekode ved bordet: papiret siger hvilken pakke,
     voksseglet siger hvilket tier. Den står i pakkens beskrivelse, så den er
     ved hånden når man printer og pakker. */
  var WAX = 'Forsegles med voks i tierets farve — bronze, sølv eller guld. ';

  function defaultPacks() {
    return packs().map(gradeMagic);
  }

  function packs() {
    return [
      {
        id: 'adventurer', name: 'Adventurer',
        filter: filt(GEAR),
        note: 'Pakkes i orange papir. ' + WAX +
              'Den almindelige pakke — udstyr, våben, rustning, værktøj, gift og ammunition. ' +
              'Fokus, køretøjer, ridedyr og udstyrspakker er valgt fra. Hvert kort har en ' +
              'chance for at blive et magic item i stedet; hvor godt det er, følger den ' +
              'fælles korttrin-tabel under fanen Magic.',
        // Lodder pr. kategori: elleve i alt, så tallene er andelen direkte.
        // Udstyr og våben deler hovedparten; rustning holdes nede, fordi der
        // kun er fjorten af dem og en hel pakke findes til dem.
        weights: { 'Udstyr': 3, 'Våben': 3, 'Værktøj': 2, 'Rustning': 1, 'Ammunition': 1, 'Gift': 1 },
        magicChance: 6,
        tierMagic: { chance: [6, 12, 18] },
        tiers: gradedTiers(
          [card('Kort 1', { common: 100 }),
           card('Kort 2', { common: 50, uncommon: 50 }),
           card('Kort 3', { uncommon: 96, rare: 3.7, very_rare: 0.2, legendary: 0.1 })],
          [card('Kort 1', { common: 20, uncommon: 80 }),
           card('Kort 2', { uncommon: 80, rare: 20 }),
           card('Kort 3', { uncommon: 60, rare: 35, very_rare: 4, legendary: 1 })],
          [card('Kort 1', { common: 25, uncommon: 50, rare: 25 }),
           card('Kort 2', { uncommon: 75, rare: 25 }),
           card('Kort 3', { uncommon: 40, rare: 45, very_rare: 12, legendary: 3 })]
        )
      },
      {
        id: 'weapons', name: 'Weapons', filter: filt(['Våben', 'Ammunition', 'Udstyr']),
        note: 'Pakkes i rødt papir. ' + WAX +
              'Kort 3 er garanteret et våben. De to første trækker bredere, så der også ' +
              'falder udstyr og ammunition. Magisiden er låst til typen Weapon, så pakken ' +
              'ikke deler ringe ud — bliver et kort magisk, er det et magisk våben.',
        magicChance: 8,
        magicTypes: onlyTypes('Weapon'),
        tierMagic: { chance: [8, 18, 32] },
        tiers: gradedTiers(
          [card('Kort 1', { common: 100 }),
           card('Kort 2', { common: 85, uncommon: 15 }),
           card('Kort 3', { common: 10, uncommon: 80, rare: 9, very_rare: 1 }, filt(['Våben']))],
          [card('Kort 1', { common: 70, uncommon: 30 }),
           card('Kort 2', { common: 50, uncommon: 50 }),
           card('Kort 3', { uncommon: 65, rare: 30, very_rare: 5 }, filt(['Våben']))],
          [card('Kort 1', { common: 40, uncommon: 60 }),
           card('Kort 2', { uncommon: 80, rare: 20 }),
           card('Kort 3', { uncommon: 30, rare: 50, very_rare: 17, legendary: 3 }, filt(['Våben']))]
        )
      },
      {
        id: 'armor', name: 'Armor', filter: filt(['Rustning', 'Udstyr']),
        note: 'Pakkes i blåt papir. ' + WAX +
              'Kort 3 er garanteret en rustning; de to første trækker også udstyr. Magisiden ' +
              'er låst til typen Armor. Rustning ligger højt på udstyrs-skalaen — billigste ' +
              'er Padded Armor til 5 gp — så de lave trin lander på udstyr, og Padded Armor ' +
              'er pakkens skraldeitem. Kun 14 rustninger i alt, så gentagelser er uundgåelige.',
        // Kort 3 er allerede garanteret en rustning, så de to første må gerne
        // læne mod udstyr — ellers bliver en fjorten-items-hylde slidt tynd.
        weights: { 'Udstyr': 3, 'Rustning': 1 },
        magicChance: 8,
        magicTypes: onlyTypes('Armor'),
        tierMagic: { chance: [8, 18, 32] },
        tiers: gradedTiers(
          [card('Kort 1', { common: 80, uncommon: 20 }),
           card('Kort 2', { common: 50, uncommon: 50 }),
           card('Kort 3', { uncommon: 80, rare: 15, very_rare: 4, legendary: 1 }, filt(['Rustning']))],
          [card('Kort 1', { common: 50, uncommon: 30, rare: 20 }),
           card('Kort 2', { common: 10, uncommon: 40, rare: 40, very_rare: 10 }),
           card('Kort 3', { uncommon: 40, rare: 40, very_rare: 15, legendary: 5 }, filt(['Rustning']))],
          [card('Kort 1', { uncommon: 50, rare: 50 }),
           card('Kort 2', { rare: 50, very_rare: 50 }),
           card('Kort 3', { rare: 50, very_rare: 40, legendary: 10 }, filt(['Rustning']))]
        )
      },
      {
        id: 'consumables', name: 'Consumables',
        // Healing-tagget rammer kun Healer's Kit og Herbalism Kit på udstyrssiden
        // — grej, ikke forbrugsvarer. Magiske potions og scrolls kommer ind via
        // magisiden, ikke via filteret.
        filter: filt([], 'only'),
        note: 'Pakkes i mørkegrønt papir. ' + WAX +
              'Union-filter på udstyrssiden: hele Gift-gruppen plus alt med tagget Consumable. ' +
              'Magisiden er låst til Potion og Scroll, og kort 3 er 100 % magisk, så pakken ' +
              'altid giver mindst én potion eller ét scroll.',
        magicChance: 40,
        magicTypes: onlyTypes('Potion', 'Scroll'),
        tierMagic: { chance: [40, 55, 70] },
        tiers: gradedTiers(
          [card('Kort 1', { common: 100 }),
           card('Kort 2', { common: 85, uncommon: 15 }),
           card('Kort 3', { common: 60, uncommon: 35, rare: 5 }, null, null, { chance: 100 })],
          [card('Kort 1', { common: 70, uncommon: 30 }),
           card('Kort 2', { common: 50, uncommon: 50 }),
           card('Kort 3', { common: 20, uncommon: 60, rare: 20 }, null, null, { chance: 100 })],
          [card('Kort 1', { common: 40, uncommon: 60 }),
           card('Kort 2', { uncommon: 80, rare: 20 }),
           card('Kort 3', { uncommon: 30, rare: 50, very_rare: 17, legendary: 3 }, null, null, { chance: 100 })]
        )
      },
      {
        id: 'magic', name: 'Magic', filter: filt(GEAR),
        note: 'Pakkes i lavendel papir. ' + WAX +
              'Kort 3 er 100 % magisk. De to første har en chance, som stiger med tieret — ' +
              'i Bronze er de mest udstyr, i Sølv omtrent fifty-fifty, og i Guld er de også ' +
              'altid magi. Hvert kort sætter selv hvor godt magic itemet er, i stedet for at ' +
              'gå gennem den fælles tabel.',
        weights: { 'Udstyr': 3, 'Våben': 3, 'Værktøj': 2, 'Rustning': 1, 'Ammunition': 1, 'Gift': 1 },
        magicChance: 10,
        tierMagic: { chance: [10, 45, 100] },
        tiers: gradedTiers(
          [card('Kort 1', { common: 78.5, uncommon: 12, rare: 7, very_rare: 2, legendary: 0.5 },
                null, null, { dist: { common: 85, uncommon: 12, rare: 3 } }),
           card('Kort 2', { common: 78.5, uncommon: 12, rare: 7, very_rare: 2, legendary: 0.5 },
                null, null, { dist: { common: 85, uncommon: 12, rare: 3 } }),
           card('Kort 3', { common: 78.5, uncommon: 12, rare: 7, very_rare: 2, legendary: 0.5 },
                null, null,
                { chance: 100, dist: { common: 78.5, uncommon: 12, rare: 7, very_rare: 2, legendary: 0.5 } })],
          [card('Kort 1', { common: 10, uncommon: 66, rare: 15, very_rare: 8, legendary: 1 },
                null, null, { dist: { common: 25, uncommon: 60, rare: 12, very_rare: 3 } }),
           card('Kort 2', { common: 10, uncommon: 66, rare: 15, very_rare: 8, legendary: 1 },
                null, null, { dist: { common: 25, uncommon: 60, rare: 12, very_rare: 3 } }),
           card('Kort 3', { common: 10, uncommon: 66, rare: 15, very_rare: 8, legendary: 1 },
                null, null,
                { chance: 100, dist: { common: 10, uncommon: 66, rare: 15, very_rare: 8, legendary: 1 } })],
          // Guld: alle tre kort er magi. De to første er tungt vægtet mod
          // Common, så pakkens tyngde ligger på kort 3.
          [card('Kort 1', { common: 100 }, null, null,
                { chance: 100, dist: { common: 60, uncommon: 30, rare: 8, very_rare: 2 } }),
           card('Kort 2', { common: 100 }, null, null,
                { chance: 100, dist: { common: 60, uncommon: 30, rare: 8, very_rare: 2 } }),
           card('Kort 3', { common: 100 }, null, null,
                { chance: 100, dist: { uncommon: 5, rare: 45, very_rare: 35, legendary: 15 } })]
        )
      },
      {
        id: 'classes', name: 'Classes', filter: filt(['Class', 'Stat', 'Feat', 'Skill', 'Perk']),
        note: 'Pakkes i guldgult papir, forseglet med sort voks — Classes står uden for ' +
              'bronze/sølv/guld. Ikke gradueret — ét tier. Hver kortplads beder om sin egen ' +
              'korttype som kategori: Class, Stat, Feat, Skill og Perk. Rarity styrer ' +
              'trækningen, men trykkes ikke på kortene — loftet står i navnet på et ' +
              'attributkort, og alle class levels er lige sandsynlige. Feat- og ' +
              'Skill-kortene findes, men har ingen plads endnu — tilføj et kort.',
        tiers: [tier('standard', 'Standard', [
          // Fordelingerne matcher hver types faktiske rarities, så der hverken
          // bliver fallback eller tomme kort.
          // Alle tolv class levels deler rarity — de er lige sandsynlige, og
          // hvilken klasse man trækker er hele pointen.
          card('Class', { common: 100 }, classFilter('Class')),
          card('Perk', { uncommon: 60, rare: 40 }, classFilter('Perk')),
          // Attributkortene er graduerede: rarityen er loftet. Et Common-kort
          // hæver kun til 13 og er derfor hverdagskost; kortet der når 20 er
          // sjældent. Fordelingen skal derfor spænde over alle fem trin.
          card('Stat', { common: 45, uncommon: 28, rare: 16, very_rare: 8, legendary: 3 },
               classFilter('Stat'))
        ])]
      }
    ];
  }

  /* Fordeling over magi-rarity. Seks nøgler — artifacts kan tildeles vægt,
     men står på 0 som standard. */
  function magicDist(o) {
    var d = {};
    MKEYS.forEach(function (k) { d[k] = (o && o[k]) || 0; });
    return d;
  }

  /* Den fælles tabel: hvert korttrin peger på en fordeling over magi-rarity.
     Tallene er sat så et Rare-kort overvejende giver et Common magic item —
     det at få magi overhovedet er gevinsten. */
  function magicMapping(rows) {
    var out = {};
    RKEYS.forEach(function (k) { out[k] = magicDist(rows && rows[k]); });
    return out;
  }

  function defaultMagic() {
    return {
      enabled: true,
      // Chance i procent for at et scroll bærer en lavere spell, castet på
      // scrollets eget niveau.
      upcastChance: 30,
      mapping: magicMapping({
        common:    { common: 100 },
        uncommon:  { common: 90, uncommon: 10 },
        rare:      { common: 70, uncommon: 25, rare: 5 },
        very_rare: { common: 40, uncommon: 40, rare: 18, very_rare: 2 },
        legendary: { common: 10, uncommon: 30, rare: 40, very_rare: 17, legendary: 3 }
      })
    };
  }

  function defaultConfig() {
    // Kun de pakker der faktisk vægter noget skriver weights ud. UI'et
    // redigerer objektet direkte, så det skal findes på dem alle.
    var packs = defaultPacks();
    packs.forEach(function (p) { if (!p.weights) p.weights = {}; });

    return {
      version: 8,
      scales: defaultScales(),
      noDuplicates: true,
      fallback: 'nearest',
      excludeFromAll: ['Class', 'Stat', 'Feat', 'Skill', 'Perk'],
      magic: defaultMagic(),
      packs: packs
    };
  }

  /* ---------------- lagring ---------------- */

  var K_CFG = 'dccdd.config.v1';
  var K_ITEMS = 'dccdd.items.v1';
  var K_SEEDED = 'dccdd.seeded.v1';
  var K_MAGIC = 'dccdd.magic.v1';
  // Kopi af items og magic items fra før en automatisk dataopdatering, så
  // opdateringen kan fortrydes uden at man mister sine egne rettelser.
  var K_BACKUP = 'dccdd.backup.v1';

  function available() {
    try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); return true; }
    catch (e) { return false; }
  }

  function load(key, fallbackValue) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallbackValue;
    } catch (e) { return fallbackValue; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  /* Fjerner alt appen har gemt. Kun vores egne nøgler — andre sider på samme
     domæne (GitHub Pages deler origin) skal ikke rammes af en oprydning her. */
  function clearAll() {
    [K_CFG, K_ITEMS, K_SEEDED, K_MAGIC, K_BACKUP].forEach(function (k) {
      try { localStorage.removeItem(k); } catch (e) { /* ingen adgang, intet at rydde */ }
    });
  }

  function hasOwnFilter(c) {
    return !!(c.filter && c.filter.categories.length);
  }

  /* Chancen er ét tal nu. En v5-opsætning havde en pr. korttrin; gennemsnittet
     af de trin der faktisk kunne rulles rammer nogenlunde det samme. */
  function normalizeChance(v) {
    if (typeof v === 'number' && isFinite(v)) return Math.max(0, Math.min(100, v));
    if (v && typeof v === 'object') {
      var sum = 0, n = 0;
      RKEYS.forEach(function (k) {
        if (typeof v[k] === 'number') { sum += v[k]; n++; }
      });
      return n ? Math.round(sum / n * 10) / 10 : null;
    }
    return null;
  }

  /* Typer var en liste over hvad der måtte falde; nu er det vægte hvor 0 slår
     typen fra. En tom liste betød "alle", og bliver til ingen begrænsning. */
  function normalizeTypes(v) {
    if (Array.isArray(v)) return v.length ? onlyTypes.apply(null, v) : null;
    if (v && typeof v === 'object') {
      var out = {}, any = false;
      for (var k in v) {
        var w = Number(v[k]);
        if (isFinite(w) && w >= 0 && w !== 1) { out[k] = w; any = true; }
      }
      return any ? out : null;
    }
    return null;
  }

  /* En v5-pakke gav magi via pack.magic.chance og pack.magic.types. Begge har
     en direkte oversættelse i det nye sprog. */
  function adoptMagic(p, pm) {
    if (p.magicChance === null || p.magicChance === undefined)
      p.magicChance = normalizeChance(pm.chance);
    if (!p.magicTypes && Array.isArray(pm.types) && pm.types.length)
      p.magicTypes = onlyTypes.apply(null, pm.types);
    // Forbrugsvare-valget lå på magisiden for sig; nu læses det af filteret.
    if (pm.consumables && pm.consumables !== 'all' && p.filter.consumables === 'all')
      p.filter.consumables = pm.consumables;
  }

  /* Fylder manglende felter ud, så gammelt gemt data ikke crasher nye versioner. */
  function migrateConfig(cfg) {
    var def = defaultConfig();
    if (!cfg || typeof cfg !== 'object') return def;

    // v1 -> v2: flad thresholds-liste blev til navngivne skalaer, og
    // pack.categories blev til pack.filter {categories, tags}.
    if (!Array.isArray(cfg.scales)) cfg.scales = def.scales;
    if (!Array.isArray(cfg.packs)) cfg.packs = def.packs;
    if (typeof cfg.noDuplicates !== 'boolean') cfg.noDuplicates = def.noDuplicates;
    if (['down', 'nearest', 'none'].indexOf(cfg.fallback) < 0) cfg.fallback = def.fallback;
    if (!Array.isArray(cfg.excludeFromAll)) cfg.excludeFromAll = def.excludeFromAll;
    delete cfg.thresholds;

    // v2 -> v3: magic item-kort med eget korttrin -> magi-rarity-opslag.
    if (!cfg.magic || typeof cfg.magic !== 'object') cfg.magic = def.magic;
    if (typeof cfg.magic.enabled !== 'boolean') cfg.magic.enabled = true;
    if (typeof cfg.magic.upcastChance !== 'number')
      cfg.magic.upcastChance = def.magic.upcastChance;
    if (!cfg.magic.mapping || typeof cfg.magic.mapping !== 'object')
      cfg.magic.mapping = def.magic.mapping;
    cfg.magic.mapping = magicMapping(cfg.magic.mapping);

    cfg.packs.forEach(function (p) {
      if (!p.filter) p.filter = filt(Array.isArray(p.categories) ? p.categories : []);
      if (!Array.isArray(p.filter.categories)) p.filter.categories = [];
      // v7: tag-aksen er væk. Typen ligger i kategorien for alt indhold, så et
      // tag-filter havde intet at gøre som det ikke allerede kunne.
      delete p.filter.tags;
      delete p.filter.mode;
      if (['all', 'exclude', 'only'].indexOf(p.filter.consumables) < 0)
        p.filter.consumables = 'all';
      delete p.categories;
      if (typeof p.note !== 'string') p.note = '';
      if (!p.weights || typeof p.weights !== 'object') {
        var dw = null;
        def.packs.forEach(function (x) { if (x.id === p.id) dw = x.weights; });
        p.weights = dw ? JSON.parse(JSON.stringify(dw)) : {};
      }
      // v5 -> v6: magic items blev almindelige items, så pakkens eget
      // magi-maskineri er væk. Kunne pakken give magi, får kategorien Magic
      // en plads i filteret og en vægt, så den bliver ved med at kunne det.
      if (p.magic && typeof p.magic === 'object') {
        var couldMagic = RKEYS.some(function (k) {
          return (Number(p.magic.chance && p.magic.chance[k]) || 0) > 0;
        });
        if (couldMagic) adoptMagic(p, p.magic);
        // Pakkens egen korttrin -> magi-rarity-tabel hedder bare noget andet nu.
        if (p.magic.mapping && !p.magicMapping) p.magicMapping = p.magic.mapping;
        delete p.magic;
      }
      if (!Array.isArray(p.tiers)) p.tiers = [];
      p.dist = hasDist(p.dist) ? dist(p.dist) : null;
      p.magicChance = normalizeChance(p.magicChance);
      p.magicTypes = normalizeTypes(p.magicTypes);
      p.magicDist = p.magicDist ? magicDist(p.magicDist) : null;
      if (p.magicMapping) p.magicMapping = magicMapping(p.magicMapping);
      // Kategorien Magic i et filter betyder ingenting længere — magi har sin
      // egen pulje. Fjern den, så filteret kun handler om udstyr.
      p.filter.categories = p.filter.categories.filter(function (x) { return x !== MAGIC_CAT; });
      if (p.weights) delete p.weights[MAGIC_CAT];
      p.tiers.forEach(function (t) {
        if (t.weights !== null && (!t.weights || typeof t.weights !== 'object')) t.weights = null;
        if (t.weights) delete t.weights[MAGIC_CAT];
        t.dist = hasDist(t.dist) ? dist(t.dist) : null;
        t.magicChance = normalizeChance(t.magicChance);
        t.magicTypes = normalizeTypes(t.magicTypes);
        t.magicDist = t.magicDist ? magicDist(t.magicDist) : null;
        if (t.magicMapping) t.magicMapping = magicMapping(t.magicMapping);
        if (!Array.isArray(t.cards)) t.cards = [];
        t.cards.forEach(function (c) {
          c.dist = dist(c.dist);
          if (!c.filter && Array.isArray(c.categories) && c.categories.length)
            c.filter = filt(c.categories);
          delete c.categories;
          if (c.filter) {
            if (!Array.isArray(c.filter.categories)) c.filter.categories = [];
            delete c.filter.tags;
            delete c.filter.mode;
            if (['all', 'exclude', 'only'].indexOf(c.filter.consumables) < 0)
              c.filter.consumables = 'all';
          }
          // v5 havde en chance pr. korttrin. Nu er det ét tal — gennemsnittet
          // rammer nogenlunde det samme og kan justeres bagefter.
          c.magicChance = normalizeChance(c.magicChance);
          // v4/v5 havde en liste over tilladte typer; nu er det vægte, hvor 0
          // slår typen fra. En liste bliver til "kun disse".
          c.magicTypes = normalizeTypes(c.magicTypes);
          // Kortets egen magi-fordeling. null = følg tier, pakke eller den
          // fælles tabel.
          c.magicDist = c.magicDist ? magicDist(c.magicDist) : null;
          if (c.magicMapping) c.magicMapping = magicMapping(c.magicMapping);
          // Et kort der filtrerede på kategorien Magic mente "altid magi".
          // Magi har sin egen pulje nu, så det skrives om til en chance.
          if (c.filter && c.filter.categories.length === 1 &&
              c.filter.categories[0] === MAGIC_CAT) {
            if (c.magicChance === null) c.magicChance = 100;
            c.filter = null;
            c.weights = null;
          }
          if (c.weights && typeof c.weights !== 'object') c.weights = null;
        });
      });
    });
    // Classes-pakken fik typede kortpladser i v4. Opgradér kun hvis pakken
    // står urørt — dvs. ingen af dens kort har fået sit eget filter — så
    // egne tilpasninger ikke bliver overskrevet.
    // v7: Class-kortenes type flyttede fra tag til kategori, så gamle
    // kortfiltre peger på kategorien Class og et tag der ikke findes mere.
    if ((cfg.version || 0) < 7) {
      var CLASS_TYPES = ['Class', 'Stat', 'Feat', 'Skill', 'Perk'];
      cfg.packs.forEach(function (p) {
        if (p.id !== 'classes') return;
        p.filter.categories = CLASS_TYPES.slice();
        (p.tiers || []).forEach(function (t) {
          (t.cards || []).forEach(function (c) {
            if (!c.filter) return;
            // Kortets label bar typen; ellers gættes den ud fra det gamle filter.
            var want = CLASS_TYPES.filter(function (x) { return c.label === x; })[0];
            if (want) c.filter = filt([want]);
          });
        });
      });
      if (Array.isArray(cfg.excludeFromAll) && cfg.excludeFromAll.indexOf('Class') >= 0)
        cfg.excludeFromAll = CLASS_TYPES.slice();
    }

    cfg.packs.forEach(function (p) {
      if (p.id !== 'classes' || !p.tiers.length) return;
      var untouched = p.tiers.every(function (t) {
        return t.cards.every(function (c) { return !c.filter; });
      });
      if (!untouched) return;
      var dp = null;
      def.packs.forEach(function (x) { if (x.id === 'classes') dp = x; });
      if (dp) { p.tiers = dp.tiers; p.note = dp.note; }
    });

    // Pakkerne fik hver et garanteret kort i deres egen kategori i v6.
    // Opgradér kun de indbyggede pakker, og kun hvis kortet ikke allerede har
    // sit eget filter — så egne tilpasninger bliver stående.
    if ((cfg.version || 0) < 6) {
      cfg.packs.forEach(function (p) {
        var dp = null;
        def.packs.forEach(function (x) { if (x.id === p.id) dp = x; });
        if (!dp || !p.tiers.length) return;
        // Et tomt filter betød "alt" og var Magic-pakkens måde at sige "al
        // magi" på. Nu hvor magi er en kategori, ville det slippe ridedyr og
        // køretøjer ind — så den arver standardpakkens filter og vægte.
        if (!p.filter.categories.length && dp.filter.categories.length) {
          p.filter = JSON.parse(JSON.stringify(dp.filter));
          p.weights = JSON.parse(JSON.stringify(dp.weights || {}));
          p.tiers.forEach(function (t, ti) {
            if (dp.tiers[ti]) t.weights = dp.tiers[ti].weights
              ? JSON.parse(JSON.stringify(dp.tiers[ti].weights)) : null;
          });
        }
        p.tiers.forEach(function (t, ti) {
          var dt = dp.tiers[ti];
          if (!dt) return;
          t.cards.forEach(function (c, ci) {
            var dc = dt.cards[ci];
            if (dc && dc.filter && !hasOwnFilter(c)) c.filter = JSON.parse(JSON.stringify(dc.filter));
          });
        });
        if (!p.note || (dp.note && p.note.indexOf('magic item-kort') >= 0)) p.note = dp.note;
      });
    }

    // v8: den fysiske farvekode kom med i pakkebeskrivelserne. Sætningen sættes
    // kun foran hvis noten ikke allerede nævner papir — så en note man selv har
    // skrevet bliver stående.
    if ((cfg.version || 0) < 8) {
      cfg.packs.forEach(function (p) {
        if (!p.note || p.note.indexOf('papir') >= 0) return;
        var dp = null;
        def.packs.forEach(function (x) { if (x.id === p.id) dp = x; });
        if (!dp) return;
        var head = dp.note.split('. ').slice(0, p.id === 'classes' ? 2 : 2).join('. ') + '. ';
        p.note = head + p.note;
      });
    }

    cfg.version = 8;
    return cfg;
  }

  /* ---------------- items ---------------- */

  var uid = 0;
  function makeId(name) {
    uid++;
    return String(name || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) + '-' + uid;
  }

  /* CSV-parser med understøttelse af citerede felter og "" som escapet citationstegn. */
  function parseCSV(text) {
    text = String(text).replace(/^﻿/, '').replace(/\r\n?/g, '\n');
    var firstLine = text.split('\n')[0] || '';
    var counts = { ',': 0, ';': 0, '\t': 0 };
    var inQ0 = false;
    for (var x = 0; x < firstLine.length; x++) {
      var ch0 = firstLine[x];
      if (ch0 === '"') inQ0 = !inQ0;
      else if (!inQ0 && counts.hasOwnProperty(ch0)) counts[ch0]++;
    }
    var delim = ',';
    if (counts[';'] > counts[',']) delim = ';';
    if (counts['\t'] > counts[delim]) delim = '\t';

    var rows = [], row = [], field = '', inQ = false;
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (inQ) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else inQ = false;
        } else field += ch;
      } else if (ch === '"') {
        inQ = true;
      } else if (ch === delim) {
        row.push(field); field = '';
      } else if (ch === '\n') {
        row.push(field); rows.push(row); row = []; field = '';
      } else {
        field += ch;
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (c) { return String(c).trim() !== ''; }); });
  }

  /* Gætter hvilken kolonne der er hvad, ud fra overskriften. */
  var FIELD_HINTS = {
    name:        ['navn', 'name', 'item', 'title', 'titel'],
    category:    ['gruppe', 'group', 'kategori', 'category', 'type'],
    subcategory: ['kategori', 'category', 'underkategori', 'subcategory'],
    price:       ['pris (gp)', 'price (gp)', 'pris', 'price', 'cost', 'værdi', 'vaerdi', 'gp'],
    rarity:      ['rarity', 'sjældenhed', 'sjaeldenhed'],
    source:      ['kilde', 'source', 'book', 'bog'],
    tags:        ['tags', 'tag', 'mærker'],
    consumable:  ['forbrugsvare', 'consumable', 'forbrug'],
    desc:        ['beskrivelse', 'description', 'noter', 'notes', 'note', 'desc', 'text']
  };

  function guessMapping(headers) {
    var map = {};
    var used = {};
    var lower = headers.map(function (h) { return String(h).toLowerCase().trim(); });

    function claim(field, idx) { map[field] = idx; used[idx] = true; }

    Object.keys(FIELD_HINTS).forEach(function (field) {
      var hints = FIELD_HINTS[field];
      for (var h = 0; h < hints.length; h++) {
        var idx = lower.indexOf(hints[h]);
        if (idx >= 0 && !used[idx]) { claim(field, idx); return; }
      }
      for (var h2 = 0; h2 < hints.length; h2++) {
        for (var j = 0; j < lower.length; j++) {
          if (!used[j] && lower[j].indexOf(hints[h2]) >= 0) { claim(field, j); return; }
        }
      }
    });
    return map;
  }

  function splitTags(raw) {
    if (Array.isArray(raw)) return raw.map(function (t) { return String(t).trim(); }).filter(Boolean);
    if (!raw) return [];
    return String(raw).split(/[,;|]/).map(function (t) { return t.trim(); }).filter(Boolean);
  }

  /* Felter fra regnearket som hører til på selve kortet: skade, egenskaber,
     AC og den slags. De skal med hele vejen fra items.js til kortvisningen. */
  var STAT_FIELDS = ['damage', 'damageType', 'properties', 'mastery', 'masteryText',
                     'ac', 'strength', 'stealth', 'weight',
                     // Class-kort: kravet man skal opfylde, og kildens egen
                     // stikordsliste over hvad kortet gør.
                     'prerequisite', 'summary'];

  function copyStats(from, to) {
    STAT_FIELDS.forEach(function (f) {
      if (from[f] !== undefined && from[f] !== null && from[f] !== '') to[f] = from[f];
    });
    return to;
  }

  function buildItem(raw, cfg, defaultScaleId) {
    var price = parsePrice(raw.price);
    var explicit = normalizeRarity(raw.rarity);
    var scaleId = raw.scale || defaultScaleId || 'gear';
    var rarity = explicit;
    if (!rarity && scaleId !== 'none') rarity = priceToRarity(price, findScale(cfg, scaleId));
    return copyStats(raw, {
      id: makeId(raw.name),
      name: String(raw.name || '').trim() || '(uden navn)',
      category: String(raw.category || '').trim() || 'Ukategoriseret',
      subcategory: String(raw.subcategory || '').trim(),
      price: price,
      priceText: String(raw.priceText || '').trim(),
      rarity: rarity || null,
      rarityLocked: raw.rarityLocked !== undefined ? !!raw.rarityLocked : !!explicit,
      scale: scaleId,
      consumable: typeof raw.consumable === 'string'
        ? /^(1|true|ja|yes|x)$/i.test(raw.consumable.trim())
        : !!raw.consumable,
      // Rarity styrer trækningen, men den siger ikke altid noget brugbart på
      // selve kortet — et class level er lige så sandsynligt som alle andre.
      hideRarity: !!raw.hideRarity,
      source: String(raw.source || '').trim(),
      tags: splitTags(raw.tags),
      desc: String(raw.desc || '').trim()
    });
  }

  function itemsFromRows(rows, mapping, cfg, hasHeader, defaultScaleId) {
    var body = hasHeader ? rows.slice(1) : rows;
    return body.map(function (r) {
      var raw = {};
      Object.keys(mapping).forEach(function (f) {
        var idx = mapping[f];
        if (idx !== null && idx !== undefined && idx >= 0) raw[f] = r[idx];
      });
      return buildItem(raw, cfg, defaultScaleId);
    }).filter(function (it) { return it.name !== '(uden navn)'; });
  }

  function itemsFromJSON(data, cfg, defaultScaleId) {
    var arr = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : null);
    if (!arr) throw new Error('JSON skal være en liste af items, eller et objekt med "items".');
    return arr.map(function (o) {
      return buildItem(copyStats(o, {
        name: o.name || o.navn || o.title,
        category: o.category || o.kategori || o.gruppe,
        subcategory: o.subcategory || o.underkategori,
        price: o.price !== undefined ? o.price : (o.pris !== undefined ? o.pris : o.cost),
        priceText: o.priceText,
        rarity: o.rarity || o.sjaeldenhed,
        rarityLocked: o.rarityLocked,
        scale: o.scale,
        consumable: o.consumable,
        hideRarity: o.hideRarity,
        source: o.source || o.kilde,
        tags: o.tags,
        desc: o.desc || o.description || o.beskrivelse || o.notes
      }), cfg, defaultScaleId);
    });
  }

  function recalcRarities(items, cfg) {
    items.forEach(function (it) {
      if (it.rarityLocked || it.scale === 'none') return;
      it.rarity = priceToRarity(it.price, findScale(cfg, it.scale));
    });
    return items;
  }

  function categoriesOf(items) {
    var seen = {};
    items.forEach(function (i) { seen[i.category] = true; });
    return Object.keys(seen).sort();
  }

  /* ---------------- trækning ---------------- */

  function weightedPick(d) {
    var total = 0, k;
    for (k in d) if (d[k] > 0) total += d[k];
    if (total <= 0) return null;
    var roll = Math.random() * total;
    for (var i = 0; i < RKEYS.length; i++) {
      var w = d[RKEYS[i]] || 0;
      if (w <= 0) continue;
      roll -= w;
      if (roll < 0) return RKEYS[i];
    }
    return RKEYS[RKEYS.length - 1];
  }

  function fallbackOrder(rarity, mode) {
    var idx = RKEYS.indexOf(rarity);
    var order = [];
    if (mode === 'none') return order;
    if (mode === 'down') {
      for (var i = idx - 1; i >= 0; i--) order.push(RKEYS[i]);
      return order;
    }
    for (var d = 1; d < RKEYS.length; d++) {
      if (idx - d >= 0) order.push(RKEYS[idx - d]);
      if (idx + d < RKEYS.length) order.push(RKEYS[idx + d]);
    }
    return order;
  }

  /* Et tomt filter betyder "alt" — bortset fra kategorier på excludeFromAll,
     så Class-kort ikke lækker ind i Adventurer-pakken. */
  function poolFor(items, filter, cfg) {
    // Magi kan slås fra i ét greb under Indstillinger. Det er nemmere end at
    // gå seks pakkefiltre igennem, og pakkerne kan blive stående som de er.
    var noMagic = !!(cfg && cfg.magic && cfg.magic.enabled === false);
    var cats = (filter && filter.categories) || [];
    var cons = (filter && filter.consumables) || 'all';
    var empty = !cats.length;
    var exclude = empty ? (cfg.excludeFromAll || []) : [];

    return items.filter(function (i) {
      if (!i.rarity) return false;
      // Et item kan tages ud af spillet uden at blive slettet.
      if (i.enabled === false) return false;
      if (noMagic && i.category === MAGIC_CAT) return false;
      if (exclude.indexOf(i.category) >= 0) return false;
      if (cons === 'exclude' && i.consumable) return false;
      if (cons === 'only' && !i.consumable) return false;
      if (empty) return true;
      return cats.indexOf(i.category) >= 0;
    });
  }

  /* En manglende vægt betyder 1 lod. En vægt på 0 betyder nul — den må ikke
     forveksles med "ikke sat", hvilket `weights[cat] || 1` ellers gør. */
  function pickMagicWeighted(d) {
    var total = 0, k;
    for (k in d) if (d[k] > 0) total += d[k];
    if (total <= 0) return null;
    var roll = Math.random() * total;
    for (var i = 0; i < MKEYS.length; i++) {
      var w = d[MKEYS[i]] || 0;
      if (w <= 0) continue;
      roll -= w;
      if (roll < 0) return MKEYS[i];
    }
    return MKEYS[MKEYS.length - 1];
  }

  function weightOf(weights, category) {
    var w = weights ? weights[category] : undefined;
    return (typeof w === 'number' && isFinite(w) && w >= 0) ? w : 1;
  }

  /* Vægten er antal lodder i hatten, ikke en faktor pr. kort.

     Rustning 2, Våben 1, Udstyr 1 giver fire lodder: to på rustning og ét på
     hver af de andre. Altså 50 % rustning og 25 % til hver af de to — uanset
     at der er 67 udstyrsting og kun 14 rustninger. Tallet man taster ind er
     andelen, og det er dét man mener når man skriver det.

     Derfor trækkes der i to trin: først en gruppe efter vægt, så et item
     inden i gruppen. Kun grupper der faktisk har et brugbart item er med i
     hatten, så lodder ikke går til spilde på en tom hylde. */
  function pickGrouped(cands, keyOf, weightAt) {
    if (!cands.length) return null;
    var groups = {}, order = [], i, k;
    for (i = 0; i < cands.length; i++) {
      k = keyOf(cands[i]);
      if (!groups[k]) { groups[k] = []; order.push(k); }
      groups[k].push(cands[i]);
    }
    var total = 0;
    for (i = 0; i < order.length; i++) total += weightAt(order[i]);
    // Alt der er tilbage er vægtet til nul: behandl det som tomt, så
    // trækningen falder videre til en anden rarity.
    if (total <= 0) return null;
    var roll = Math.random() * total;
    for (i = 0; i < order.length; i++) {
      roll -= weightAt(order[i]);
      if (roll < 0) break;
    }
    var g = groups[order[Math.min(i, order.length - 1)]];
    return g[Math.floor(Math.random() * g.length)];
  }

  function pickWeighted(cands, weights) {
    if (!cands.length) return null;
    if (!weights) return cands[Math.floor(Math.random() * cands.length)];
    return pickGrouped(cands,
      function (it) { return it.category; },
      function (cat) { return weightOf(weights, cat); });
  }

  function drawOne(pool, rarity, used, cfg, weights) {
    function pick(r, allowUsed) {
      var c = pool.filter(function (i) { return i.rarity === r && (allowUsed || !used[i.id]); });
      return pickWeighted(c, weights);
    }

    var hit = pick(rarity, false);
    if (hit) return { item: hit, rolled: rarity, actual: rarity };

    var order = fallbackOrder(rarity, cfg.fallback);
    for (var i = 0; i < order.length; i++) {
      var alt = pick(order[i], false);
      if (alt) return { item: alt, rolled: rarity, actual: order[i] };
    }

    // Poolen er tom for alle brugbare rarities — tillad dublet frem for tomt kort.
    if (cfg.noDuplicates) {
      var dup = pick(rarity, true);
      if (dup) return { item: dup, rolled: rarity, actual: rarity, duplicate: true };
      for (var j = 0; j < order.length; j++) {
        var dup2 = pick(order[j], true);
        if (dup2) return { item: dup2, rolled: rarity, actual: order[j], duplicate: true };
      }
    }
    return { item: null, rolled: rarity, actual: null };
  }

  /* ---------------- magic items ----------------

     Magic items ligger i den samme itemliste som alt andet, med kategorien
     Magic og deres D&D-type som tag. En kortplads trækker dem med et helt
     almindeligt filter, og vægten på kategorien afgør hvor tit det sker.

     To rul er tilbage, og de sker efter trækningen:
       1. Er magic itemet generisk ("Weapon, +1"), rulles hvilket basisitem
          det sidder på.
       2. Bærer det en spell, rulles den blandt spells på kortets niveau.  */

  /* Et magic item hedder typisk "Armor, +1" eller "Weapon, +2". Tallet er den
     bonus basisitemet får, og det er dét man skal kunne læse på kortet. */
  function magicBonus(magicItem) {
    var m = /\+(\d+)\b/.exec(magicItem.name || '');
    return m ? Number(m[1]) : 0;
  }

  /* Basisitemet beholder sine egne regler — et Padded Armor +1 er stadig et
     Padded Armor med samme stealth og styrkekrav, bare med bonussen lagt til
     AC. Tallet står forrest i "11 + Dex modifier", så kun det flyttes. */
  function applyBonus(item, bonus) {
    if (!item || !bonus) return item;
    var out = {};
    for (var k in item) if (Object.prototype.hasOwnProperty.call(item, k)) out[k] = item[k];
    if (out.ac) {
      out.ac = String(out.ac).replace(/^\s*(\d+)/, function (_, n) {
        return String(Number(n) + bonus);
      });
    }
    if (out.damage && /\d/.test(String(out.damage)))
      out.damage = String(out.damage) + ' + ' + bonus;
    out.bonus = bonus;
    return out;
  }

  /* Tredje rul: hvilket basisvåben eller -rustning sidder magien på. Filteret
     peger enten på en gruppe undertekster eller på bestemte items ved navn. */
  function rollBaseItem(magicItem, items) {
    var bf = magicItem.baseFilter;
    if (!bf) return null;
    var subs = bf.subcategories || [];
    var names = bf.names || [];
    if (!subs.length && !names.length) return null;

    var cands = items.filter(function (i) {
      // Samme krav som ved en almindelig trækning: items uden rarity er
      // taget ud af spillet og må heller ikke dukke op som basisitem.
      if (!i.rarity) return false;
      // Basisitemet er et almindeligt våben eller en almindelig rustning.
      // Nu hvor magic items ligger i samme liste, skal de holdes ude.
      if (i.category === MAGIC_CAT) return false;
      if (names.length) return names.indexOf(i.name) >= 0;
      if (subs.indexOf(i.subcategory) < 0 && subs.indexOf(i.category) < 0) return false;
      for (var e = 0; e < (bf.excludeNames || []).length; e++)
        if (i.name.toLowerCase().indexOf(bf.excludeNames[e].toLowerCase()) >= 0) return false;
      return true;
    });
    if (!cands.length) return null;
    return applyBonus(cands[Math.floor(Math.random() * cands.length)], magicBonus(magicItem));
  }

  /* Fjerde rul: spell scrolls og tomes bærer ikke en bestemt spell, men et
     niveau. Der rulles en spell af netop det niveau. */
  function rollSpell(magicItem, spells, cfg) {
    var lvl = magicItem.spellLevel;
    if (!spells || lvl === null || lvl === undefined) return null;

    // Et scroll har sit eget niveau, og spellen på det må være lavere —
    // det er upcasting. Cantrips skalerer med karakterniveau og upcastes
    // ikke, og et 1.-niveau scroll har intet lavere trin at hente fra.
    var want = lvl, upcast = false;
    var chance = (cfg && cfg.magic && typeof cfg.magic.upcastChance === 'number')
      ? cfg.magic.upcastChance : 0;
    if (magicItem.upcastable && lvl >= 2 && Math.random() * 100 < chance) {
      want = 1 + Math.floor(Math.random() * (lvl - 1));
      upcast = true;
    }

    // Enspelled-items binder kun spells fra bestemte skoler. Findes der ingen
    // på niveauet, slækkes kravet frem for at give et kort uden spell.
    var schools = magicItem.spellSchools;
    function ofLevel(strict) {
      return spells.filter(function (sp) {
        if (sp.level !== want) return false;
        if (strict && schools && schools.length && schools.indexOf(sp.school) < 0) return false;
        return true;
      });
    }

    var cands = ofLevel(true);
    if (!cands.length) cands = ofLevel(false);
    if (!cands.length) return null;
    return {
      spell: cands[Math.floor(Math.random() * cands.length)],
      castLevel: lvl,
      upcast: upcast
    };
  }

  /* ---------------- magi-kæden ----------------

     Et kort går gennem fire spørgsmål, i denne rækkefølge:

       1. Bliver kortet et magic item?   chance i procent, ét tal
       2. Hvor godt er det?              fordeling over magi-rarity
       3. Hvilken slags?                 vægt pr. type (Potion, Scroll, …)
       4. Hvilket konkret item?          basis- og spellrul, som før

     Alle tre indstillinger findes på tre niveauer — kort, tier, pakke — og det
     mest specifikke vinder, ligesom for vægte. Er intet sat nogen steder,
     bruges den fælles korttrin-tabel under fanen Magic til trin 2.

     Bliver kortet ikke magisk, trækker det et almindeligt item af sit korttrin.
     De to sider er adskilte puljer: magi konkurrerer ikke med udstyret om
     pladsen, chancen afgør det.                                            */

  /* Trin 1. Uden en chance nogen steder bliver kortet aldrig magisk. */
  function magicChanceFor(pack, tierObj, c) {
    var v = settingFor(pack, tierObj, c, 'magicChance').value;
    return (typeof v === 'number' && isFinite(v)) ? Math.max(0, Math.min(100, v)) : 0;
  }

  /* Trin 2. Egen fordeling vinder; ellers oversættes korttrinnet af tabellen. */
  function magicRarityFor(pack, tierObj, c, korttrin, cfg) {
    var own = settingFor(pack, tierObj, c, 'magicDist').value;
    if (own) return pickMagicWeighted(own);
    var map = settingFor(pack, tierObj, c, 'magicMapping').value ||
              (cfg.magic && cfg.magic.mapping) || null;
    var row = map && map[korttrin];
    return row ? pickMagicWeighted(row) : null;
  }

  /* Trin 3. Vægt pr. type: antal lodder, ikke en faktor pr. kort. To typer med
     vægt 1 og 2 deler hatten en tredjedel/to tredjedele, uanset hvor mange
     items hver type rummer. 0 slår typen fra. */
  function magicTypeWeight(weights, type) {
    var w = weights ? weights[type] : undefined;
    return (typeof w === 'number' && isFinite(w) && w >= 0) ? w : 1;
  }

  function pickMagicItem(pool, rarity, used, typeWeights, allowUsed) {
    var cands = pool.filter(function (i) {
      return i.rarity === rarity && (allowUsed || !used[i.id]);
    });
    // Samme lodmodel som på udstyrssiden — her er gruppen magic itemets type.
    return pickGrouped(cands,
      function (it) { return it.subcategory; },
      function (ty) { return magicTypeWeight(typeWeights, ty); });
  }

  /* Magipuljen for et kort: alle magic items der matcher filterets krav om
     forbrugsvarer. Kategorier og tags i filteret gælder udstyrssiden — hvilke
     typer magi der må falde, styres af vægtene i trin 3. */
  function magicPoolFor(items, filter) {
    var cons = (filter && filter.consumables) || 'all';
    return items.filter(function (i) {
      if (i.category !== MAGIC_CAT) return false;
      if (!i.rarity || i.enabled === false) return false;
      if (cons === 'exclude' && i.consumable) return false;
      if (cons === 'only' && !i.consumable) return false;
      return true;
    });
  }

  /* Trin 1-3 samlet. Rammer den valgte magi-rarity ingen items, glider den
     til nabotrinnene, så et kort aldrig står tomt. */
  function drawMagicItem(pool, wanted, used, cfg, typeWeights) {
    if (!wanted) return null;
    var hit = pickMagicItem(pool, wanted, used, typeWeights, false), actual = wanted;
    if (!hit) {
      var order = fallbackOrder(wanted, cfg.fallback === 'none' ? 'nearest' : cfg.fallback);
      for (var i = 0; i < order.length && !hit; i++) {
        hit = pickMagicItem(pool, order[i], used, typeWeights, false);
        if (hit) actual = order[i];
      }
    }
    var dup = false;
    if (!hit) { hit = pickMagicItem(pool, wanted, used, typeWeights, true); actual = wanted; dup = !!hit; }
    if (!hit) return null;
    return { item: hit, rolled: wanted, actual: actual, duplicate: dup };
  }

  function generate(pack, tierObj, items, cfg, spells) {
    var used = {};
    var magicOn = !(cfg.magic && cfg.magic.enabled === false);

    var cards = tierObj.cards.map(function (c, idx) {
      var own = !!(c.filter && c.filter.categories.length);
      var f = own ? c.filter : pack.filter;
      // Udstyrssiden: filteret som altid, minus magi. Magi har sin egen pulje,
      // så de to ikke konkurrerer om den samme plads.
      var pool = poolFor(items, f, cfg).filter(function (i) { return i.category !== MAGIC_CAT; });
      var weights = settingFor(pack, tierObj, c, 'weights').value;
      var rarity = weightedPick(distFor(pack, tierObj, c));
      var slot = c.label || ('Kort ' + (idx + 1));
      if (!rarity) return { slot: slot, item: null, rolled: null, actual: null, poolSize: pool.length };

      // Trin 1: bliver kortet magisk?
      var chance = magicOn ? magicChanceFor(pack, tierObj, c) : 0;
      var mPool = chance > 0 ? magicPoolFor(items, f) : [];
      var wantMagic = mPool.length && Math.random() * 100 < chance;
      // Et kort uden udstyr at trække — fx en plads der kun skal give magi —
      // bliver magisk uanset chancen, frem for at stå tomt.
      if (!wantMagic && !pool.length && mPool.length && chance > 0) wantMagic = true;

      if (wantMagic) {
        // Trin 2 og 3.
        var wanted = magicRarityFor(pack, tierObj, c, rarity, cfg);
        var types = settingFor(pack, tierObj, c, 'magicTypes').value;
        var mag = drawMagicItem(mPool, wanted, used, cfg, types);
        if (mag) {
          if (cfg.noDuplicates) used[mag.item.id] = true;
          return {
            slot: slot, item: mag.item, rolled: rarity, actual: rarity,
            magicRolled: mag.rolled, magicActual: mag.actual,
            base: rollBaseItem(mag.item, items),
            spell: rollSpell(mag.item, spells, cfg),
            duplicate: mag.duplicate, poolSize: mPool.length
          };
        }
      }

      var res = drawOne(pool, rarity, used, cfg, weights);
      if (res.item && cfg.noDuplicates) used[res.item.id] = true;
      return {
        slot: slot, item: res.item, rolled: res.rolled, actual: res.actual,
        base: null, spell: null,
        duplicate: !!res.duplicate, poolSize: pool.length
      };
    });
    return { pack: pack.name, tier: tierObj.name, cards: cards };
  }

  /* Magic items kommer ind som items. Kategorien er Magic, typen bliver et
     tag, og rarityen står i kilden — der er ingen pris at regne den ud fra,
     så skalaen er 'none', ligesom for Class-kort.

     De magi-specifikke felter følger med på itemet: basisfilteret, spell-
     felterne og typelinjen. De bruges kun når kortet skal tegnes, men de hører
     til på itemet, ikke i en sideliste. */
  var muid = 0;
  function magicToItems(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(function (o) {
      muid++;
      var type = String(o.type || '').trim();
      var tags = Array.isArray(o.tags) ? o.tags.slice() : [];
      // Typen forrest, så den er nem at få øje på i chip-listen. Attunement
      // er værd at kunne filtrere på: en pakke til en spiller der ikke har
      // flere attunement-pladser tilbage kan vælge det fra.
      if (type && tags.indexOf(type) < 0) tags.unshift(type);
      if (o.attunement && tags.indexOf('Attunement') < 0) tags.push('Attunement');
      return {
        id: makeId(o.name).replace(/-(\d+)$/, '-m$1') + '-' + muid,
        name: String(o.name || '').trim(),
        category: MAGIC_CAT,
        subcategory: type,
        price: null,
        priceText: '',
        rarity: normalizeRarity(o.rarity),
        rarityLocked: true,
        scale: 'none',
        consumable: !!o.consumable,
        source: o.source || '',
        tags: tags,
        desc: o.desc || '',
        // magi-specifikt
        attunement: !!o.attunement,
        typeLine: o.typeLine || '',
        baseFilter: o.baseFilter || null,
        variantOf: o.variantOf || null,
        spellLevel: (typeof o.spellLevel === 'number') ? o.spellLevel : null,
        spellName: o.spellName || '',
        spellKind: o.spellKind || '',
        spellSchools: Array.isArray(o.spellSchools) ? o.spellSchools : null,
        spellSaveDC: o.spellSaveDC || '',
        spellAttack: o.spellAttack || '',
        upcastable: !!o.upcastable,
        enabled: o.enabled !== false
      };
    }).filter(function (i) { return i.name && i.rarity; });
  }

  /* Typerne som de findes i puljen — Potion, Scroll, Wand … De er tags nu, så
     de kommer fra tag-listen, men det er praktisk at kunne spørge om netop
     dem, fx til en typevælger. */
  function magicTypesOf(items) {
    var seen = {};
    items.forEach(function (i) {
      if (i.category === MAGIC_CAT && i.subcategory) seen[i.subcategory] = true;
    });
    return Object.keys(seen).sort();
  }

  return {
    RARITIES: RARITIES, RKEYS: RKEYS,
    MAGIC_RARITIES: MAGIC_RARITIES, MKEYS: MKEYS,
    magicRarityLabel: magicRarityLabel, magicToItems: magicToItems,
    emptyMagicDist: function () { return magicDist({}); },
    magicTypesOf: magicTypesOf, MAGIC_CAT: MAGIC_CAT,
    magicPoolFor: magicPoolFor, settingFor: settingFor,
    rarityLabel: rarityLabel,
    defaultConfig: defaultConfig,
    migrateConfig: migrateConfig, emptyDist: function () { return dist({}); },
    emptyFilter: function () { return filt([]); }, recalcRarities: recalcRarities,
    parseCSV: parseCSV, guessMapping: guessMapping,
    itemsFromRows: itemsFromRows, itemsFromJSON: itemsFromJSON,
    categoriesOf: categoriesOf, poolFor: poolFor, generate: generate,
    storage: {
      available: available, load: load, save: save, clearAll: clearAll,
      K_CFG: K_CFG, K_ITEMS: K_ITEMS, K_SEEDED: K_SEEDED, K_MAGIC: K_MAGIC,
      K_BACKUP: K_BACKUP
    }
  };
})();
