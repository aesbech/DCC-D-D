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

  /* Der er én rarity-akse. Et item får sin plads på den fra en prisskala
     (udstyr) eller direkte fra kilden (magic items og Class-kort, som ikke
     har en pris). Et kort slår et trin på samme akse og trækker et item der.

     Artifact ligger uden for de fem trin et kort kan slå. De 11 artifacts
     ligger derfor i listen uden nogensinde at blive trukket, indtil man selv
     giver dem en af de fem rarities under Items.                          */

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

  /* mode: 'and' = skal matche både kategori- og tag-listen (tomme lister ignoreres).
           'or'  = tæller med hvis den matcher enten kategori- eller tag-listen.
     consumables: 'all' | 'exclude' | 'only' — samme tre valg som for magic items,
     så forbrugsvarer kan holdes ude af eller alene i en pakke. */
  function filt(categories, tags, mode, consumables) {
    return {
      categories: categories || [],
      tags: tags || [],
      mode: mode === 'or' ? 'or' : 'and',
      consumables: consumables || 'all'
    };
  }

  /* weights gælder kun sammen med et eget filter — uden det trækker kortet fra
     pakkens pulje, og så er det pakkens (eller tierets) vægte der er de rigtige. */
  function card(label, d, filter, weights) {
    return {
      label: label || '', dist: dist(d),
      filter: filter || null, weights: weights || null
    };
  }

  /* Magic items er items som alt andet: kategori Magic, med typen som tag.
     Et filter der skal ramme "rigtige våben eller magiske våben" skriver
     derfor kategorien Våben og tagget Weapon med mode 'or'. */
  function magicFilter(tags, mode) { return filt(['Magic'], tags || [], mode); }

  /* weights kan overstyres pr. tier. Uden overstyring bruges pakkens egne. */
  function tier(id, name, cards, weights) {
    return { id: id, name: name, cards: cards, weights: weights || null };
  }

  /* Class-kort bærer deres type som tag, så en kortplads kan bede om præcis
     én af dem: Class, Perk, Stat, Feat eller Skill. */
  function classFilter(type) {
    return filt(['Class'], [type], 'and');
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
    var steps = pack.tierWeights && pack.tierWeights.magic;
    delete pack.tierWeights;
    if (!steps) return pack;
    pack.tiers.forEach(function (t, i) {
      if (steps[i] === undefined || steps[i] === null) return;
      // Er trinnet det samme som pakkens, skal tieret arve. Ellers ville
      // pakkens vægtpanel stå tomt, fordi intet kort længere lyttede til det.
      if (steps[i] === pack.weights[MAGIC_CAT]) return;
      var w = {};
      for (var k in pack.weights) w[k] = pack.weights[k];
      w[MAGIC_CAT] = steps[i];
      t.weights = w;
    });
    return pack;
  }

  function standardTiers() {
    return gradedTiers(
      [card('Kort 1', { common: 100 }),
       card('Kort 2', { common: 85, uncommon: 15 }),
       card('Kort 3', { uncommon: 90, rare: 9, very_rare: 1 })],
      [card('Kort 1', { common: 70, uncommon: 30 }),
       card('Kort 2', { common: 50, uncommon: 50 }),
       card('Kort 3', { uncommon: 65, rare: 30, very_rare: 5 })],
      [card('Kort 1', { common: 40, uncommon: 60 }),
       card('Kort 2', { uncommon: 80, rare: 20 }),
       card('Kort 3', { uncommon: 30, rare: 50, very_rare: 17, legendary: 3 })]
    );
  }

  /* Den brede udstyrspulje, som de fleste pakker falder tilbage på. Magic er
     med som kategori, så et kort kan lande på et magic item uden at der skal
     et særligt maskineri til — hvor tit det sker styres af vægten. */
  var GEAR = ['Ammunition', 'Gift', 'Rustning', 'Udstyr', 'Våben', 'Værktøj'];

  function defaultPacks() {
    return packs().map(gradeMagic);
  }

  function packs() {
    return [
      {
        id: 'adventurer', name: 'Adventurer',
        filter: filt(GEAR.concat(['Magic']), []),
        note: 'Den almindelige pakke — udstyr, våben, rustning, værktøj, gift og ammunition, ' +
              'plus magic items. Fokus, køretøjer, ridedyr og udstyrspakker er valgt fra. ' +
              'Den har ingen garanteret kategori; det er den blandede pakke.',
        // Udstyr er den største gruppe og ville ellers fylde over halvdelen af
        // pakken. Våben og rustning vægtes op, så de falder oftere. Magic
        // vægtes langt ned: 450 magic items mod 178 udstyrsting ville ellers
        // gøre hver pakke magisk.
        weights: { 'Våben': 2, 'Rustning': 4, 'Ammunition': 2, 'Magic': 0.03 },
        // Magi-vægten stiger med tieret. Den er relativ, ikke en procentsats:
        // en Guld-pakke har flere magic items at vælge mellem på de høje trin,
        // så den samme vægt ville give vidt forskellige andele. Tallene er
        // regnet baglæns fra hvor tit magi skal falde på det sidste kort.
        tierWeights: { magic: [0.03, 0.06, 0.11] },
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
        id: 'weapons', name: 'Weapons',
        // 'or': kategorierne ELLER tagget Weapon. Magic items bærer deres type
        // som tag, så det slipper magiske våben ind uden at åbne for ringe.
        filter: filt(['Våben', 'Ammunition', 'Udstyr'], ['Weapon'], 'or'),
        note: 'Kort 3 er garanteret et våben — magisk eller ej. De to første trækker ' +
              'bredere, så der også falder udstyr og ammunition. Magic items er begrænset ' +
              'til typen Weapon; potions hører til i Consumables.',
        weights: { 'Magic': 0.09 },
        tierWeights: { magic: [0.09, 0.19, 0.33] },
        tiers: gradedTiers(
          [card('Kort 1', { common: 100 }),
           card('Kort 2', { common: 85, uncommon: 15 }),
           card('Kort 3', { common: 10, uncommon: 80, rare: 9, very_rare: 1 }, filt(['Våben'], ['Weapon'], 'or'))],
          [card('Kort 1', { common: 70, uncommon: 30 }),
           card('Kort 2', { common: 50, uncommon: 50 }),
           card('Kort 3', { uncommon: 65, rare: 30, very_rare: 5 }, filt(['Våben'], ['Weapon'], 'or'))],
          [card('Kort 1', { common: 40, uncommon: 60 }),
           card('Kort 2', { uncommon: 80, rare: 20 }),
           card('Kort 3', { uncommon: 30, rare: 50, very_rare: 17, legendary: 3 }, filt(['Våben'], ['Weapon'], 'or'))]
        )
      },
      {
        id: 'armor', name: 'Armor',
        filter: filt(['Rustning', 'Udstyr'], ['Armor'], 'or'),
        note: 'Kort 3 er garanteret en rustning — magisk eller ej; de to første trækker også ' +
              'udstyr. Rustning ligger højt på udstyrs-skalaen — billigste er Padded Armor til ' +
              '5 gp — så de lave trin lander på udstyr, og Padded Armor er pakkens skraldeitem. ' +
              'Kun 14 rustninger i alt, så gentagelser er uundgåelige.',
        weights: { 'Magic': 0.02 },
        tierWeights: { magic: [0.02, 0.06, 0.25] },
        tiers: gradedTiers(
          [card('Kort 1', { common: 80, uncommon: 20 }),
           card('Kort 2', { common: 50, uncommon: 50 }),
           card('Kort 3', { uncommon: 80, rare: 15, very_rare: 4, legendary: 1 }, filt(['Rustning'], ['Armor'], 'or'))],
          [card('Kort 1', { common: 50, uncommon: 30, rare: 20 }),
           card('Kort 2', { common: 10, uncommon: 40, rare: 40, very_rare: 10 }),
           card('Kort 3', { uncommon: 40, rare: 40, very_rare: 15, legendary: 5 }, filt(['Rustning'], ['Armor'], 'or'))],
          [card('Kort 1', { uncommon: 50, rare: 50 }),
           card('Kort 2', { rare: 50, very_rare: 50 }),
           card('Kort 3', { rare: 50, very_rare: 40, legendary: 10 }, filt(['Rustning'], ['Armor'], 'or'))]
        )
      },
      {
        id: 'consumables', name: 'Consumables',
        // Magiske potions og scrolls bærer også tagget Consumable, så de
        // kommer ind af sig selv. Healing-tagget hører ikke til her: det
        // rammer Healer's Kit og Herbalism Kit, som er grej.
        filter: filt(['Gift'], ['Consumable'], 'or'),
        note: 'Union-filter: hele Gift-gruppen plus alt med tagget Consumable — både udstyr ' +
              'og magiske potions og scrolls. Kort 3 er garanteret en magisk forbrugsvare. ' +
              'De ni dyreste ikke-magiske forbrugsvarer er alle gift, så de høje trin læner ' +
              'sig på magisiden.',
        weights: { 'Magic': 0.39 },
        tierWeights: { magic: [0.39, 0.35, 0.26] },
        tiers: gradedTiers(
          [card('Kort 1', { common: 100 }),
           card('Kort 2', { common: 85, uncommon: 15 }),
           card('Kort 3', { common: 60, uncommon: 35, rare: 5 }, magicFilter(['Consumable']))],
          [card('Kort 1', { common: 70, uncommon: 30 }),
           card('Kort 2', { common: 50, uncommon: 50 }),
           card('Kort 3', { common: 20, uncommon: 60, rare: 20 }, magicFilter(['Consumable']))],
          [card('Kort 1', { common: 40, uncommon: 60 }),
           card('Kort 2', { uncommon: 80, rare: 20 }),
           card('Kort 3', { uncommon: 30, rare: 50, very_rare: 17, legendary: 3 }, magicFilter(['Consumable']))]
        )
      },
      {
        id: 'magic', name: 'Magic',
        // Kort 1 og 2 kan falde tilbage på udstyr, så pakken har den brede
        // pulje. Kort 3 filtrerer på kategorien Magic og er dermed garanteret
        // magisk — samme greb som våbenkortet i Weapons.
        filter: filt(GEAR.concat(['Magic']), []),
        note: 'Kort 3 er garanteret et magic item — samme greb som det garanterede våben i ' +
              'Weapons, bare på kategorien Magic. De to første trækker bredere: i Bronze ' +
              'mest udstyr, i Sølv omtrent fifty-fifty, og i Guld er de også låst til magi, ' +
              'men tungt vægtet mod de lave trin.',
        weights: { 'Våben': 2, 'Rustning': 4, 'Ammunition': 2, 'Magic': 0.1 },
        // Bronze: en lille chance for mere magi end det garanterede kort.
        // Sølv: omtrent fifty-fifty. Guld er låst med filter og bruger ikke vægten.
        tierWeights: { magic: [0.1, 0.4, 0.4] },
        tiers: gradedTiers(
          [card('Kort 1', { common: 78.5, uncommon: 12, rare: 7, very_rare: 2, legendary: 0.5 }),
           card('Kort 2', { common: 78.5, uncommon: 12, rare: 7, very_rare: 2, legendary: 0.5 }),
           card('Kort 3', { common: 78.5, uncommon: 12, rare: 7, very_rare: 2, legendary: 0.5 }, magicFilter())],
          [card('Kort 1', { common: 10, uncommon: 66, rare: 15, very_rare: 8, legendary: 1 }),
           card('Kort 2', { common: 10, uncommon: 66, rare: 15, very_rare: 8, legendary: 1 }),
           card('Kort 3', { common: 10, uncommon: 66, rare: 15, very_rare: 8, legendary: 1 }, magicFilter())],
          // Guld: alle tre kort er magi. De to første er tungt vægtet mod
          // Common, så pakkens tyngde ligger på kort 3.
          [card('Kort 1', { common: 60, uncommon: 30, rare: 8, very_rare: 2 }, magicFilter()),
           card('Kort 2', { common: 60, uncommon: 30, rare: 8, very_rare: 2 }, magicFilter()),
           card('Kort 3', { uncommon: 5, rare: 45, very_rare: 35, legendary: 15 }, magicFilter())]
        )
      },
      {
        id: 'classes', name: 'Classes', filter: filt(['Class'], []),
        note: 'Ikke gradueret — ét tier. Hver kortplads beder om sin egen korttype via ' +
              'tags: Class, Perk, Stat, Feat og Skill. Feat- og Skill-kortene findes, men ' +
              'har ingen plads endnu — tilføj et kort, hvis de skal med.',
        tiers: [tier('standard', 'Standard', [
          // Fordelingerne matcher hver types faktiske rarities, så der hverken
          // bliver fallback eller tomme kort.
          card('Class', { very_rare: 100 }, classFilter('Class')),
          card('Perk', { uncommon: 60, rare: 40 }, classFilter('Perk')),
          card('Stat', { common: 85, very_rare: 15 }, classFilter('Stat'))
        ])]
      }
    ];
  }

  function defaultMagic() {
    return {
      enabled: true,
      // Chance i procent for at et scroll bærer en lavere spell, castet på
      // scrollets eget niveau.
      upcastChance: 30
    };
  }

  function defaultConfig() {
    // Kun de pakker der faktisk vægter noget skriver weights ud. UI'et
    // redigerer objektet direkte, så det skal findes på dem alle.
    var packs = defaultPacks();
    packs.forEach(function (p) { if (!p.weights) p.weights = {}; });

    return {
      version: 6,
      scales: defaultScales(),
      noDuplicates: true,
      fallback: 'nearest',
      excludeFromAll: ['Class'],
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
    return !!(c.filter && (c.filter.categories.length || c.filter.tags.length));
  }

  /* En v5-pakke kunne give magi via pack.magic.chance. Det oversættes til det
     nye sprog: kategorien Magic i filteret, typerne som tags, og en vægt der
     rammer nogenlunde samme hyppighed. Chancen var en procentsats pr. trin;
     vægten er relativ, så den kan ikke rammes præcist — gennemsnittet bruges
     som pejling, og resten tunes i UI'et. */
  function adoptMagic(p, pm) {
    var types = Array.isArray(pm.types) ? pm.types : [];
    if (!p.filter.categories.length && !p.filter.tags.length) return; // tomt filter = alt, magi er med
    if (types.length) {
      // Typebegrænsning bliver til tags med 'or', så magiske våben slipper ind
      // i en våbenpakke uden at ringene gør det.
      types.forEach(function (t) { if (p.filter.tags.indexOf(t) < 0) p.filter.tags.push(t); });
      p.filter.mode = 'or';
    } else if (p.filter.categories.indexOf(MAGIC_CAT) < 0) {
      p.filter.categories.push(MAGIC_CAT);
    }
    var sum = 0, n = 0;
    RKEYS.forEach(function (k) { sum += Number(pm.chance && pm.chance[k]) || 0; n++; });
    var avg = n ? sum / n : 0;
    if (!p.weights) p.weights = {};
    if (p.weights[MAGIC_CAT] === undefined)
      p.weights[MAGIC_CAT] = avg >= 100 ? 1 : Math.max(0.02, Math.round(avg / 100 * 50) / 100);
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
    // v5 -> v6: den fælles korttrin -> magi-rarity-tabel er væk. Der er én
    // rarity-akse nu, så trinnet er magic itemets rarity direkte.
    delete cfg.magic.mapping;

    cfg.packs.forEach(function (p) {
      if (!p.filter) p.filter = filt(Array.isArray(p.categories) ? p.categories : [], []);
      if (!Array.isArray(p.filter.categories)) p.filter.categories = [];
      if (!Array.isArray(p.filter.tags)) p.filter.tags = [];
      if (p.filter.mode !== 'or') p.filter.mode = 'and';
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
        delete p.magic;
      }
      if (!Array.isArray(p.tiers)) p.tiers = [];
      p.tiers.forEach(function (t) {
        if (t.weights !== null && (!t.weights || typeof t.weights !== 'object')) t.weights = null;
        if (!Array.isArray(t.cards)) t.cards = [];
        t.cards.forEach(function (c) {
          c.dist = dist(c.dist);
          if (!c.filter && Array.isArray(c.categories) && c.categories.length)
            c.filter = filt(c.categories, []);
          delete c.categories;
          if (c.filter) {
            if (!Array.isArray(c.filter.categories)) c.filter.categories = [];
            if (!Array.isArray(c.filter.tags)) c.filter.tags = [];
            if (c.filter.mode !== 'or') c.filter.mode = 'and';
            if (['all', 'exclude', 'only'].indexOf(c.filter.consumables) < 0)
              c.filter.consumables = 'all';
          }
          // Kortets eget magi-maskineri fra v4/v5 er erstattet af filteret:
          // et kort der altid skulle være magisk filtrerer nu på kategorien.
          if (c.magicChance || c.magicTypes) {
            var always = c.magicChance && RKEYS.every(function (k) {
              return Number(c.magicChance[k]) >= 100;
            });
            if (always && !hasOwnFilter(c))
              c.filter = filt([MAGIC_CAT], Array.isArray(c.magicTypes) ? c.magicTypes : []);
            delete c.magicChance;
            delete c.magicTypes;
          }
          // Vægte uden eget filter ville aldrig blive brugt — smid dem væk,
          // så en gammel opsætning ikke bærer rundt på død konfiguration.
          if (!c.filter || !c.weights || typeof c.weights !== 'object') c.weights = null;
        });
      });
    });
    // Classes-pakken fik typede kortpladser i v4. Opgradér kun hvis pakken
    // står urørt — dvs. ingen af dens kort har fået sit eget filter — så
    // egne tilpasninger ikke bliver overskrevet.
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
        if (!p.filter.categories.length && !p.filter.tags.length &&
            (dp.filter.categories.length || dp.filter.tags.length)) {
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

    cfg.version = 6;
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
                     'ac', 'strength', 'stealth', 'weight'];

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

  function tagsOf(items) {
    var seen = {};
    items.forEach(function (i) { (i.tags || []).forEach(function (t) { seen[t] = true; }); });
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
    var tags = (filter && filter.tags) || [];
    var or = filter && filter.mode === 'or';
    var cons = (filter && filter.consumables) || 'all';
    var empty = !cats.length && !tags.length;
    var exclude = empty ? (cfg.excludeFromAll || []) : [];

    function hasTag(i) {
      var t = i.tags || [];
      for (var k = 0; k < tags.length; k++) if (t.indexOf(tags[k]) >= 0) return true;
      return false;
    }

    return items.filter(function (i) {
      if (!i.rarity) return false;
      // Et item kan tages ud af spillet uden at blive slettet.
      if (i.enabled === false) return false;
      if (noMagic && i.category === MAGIC_CAT) return false;
      if (exclude.indexOf(i.category) >= 0) return false;
      if (cons === 'exclude' && i.consumable) return false;
      if (cons === 'only' && !i.consumable) return false;
      if (empty) return true;
      if (or) return (cats.length && cats.indexOf(i.category) >= 0) || (tags.length && hasTag(i));
      if (cats.length && cats.indexOf(i.category) < 0) return false;
      if (tags.length && !hasTag(i)) return false;
      return true;
    });
  }

  /* Vægtning pr. kategori. Uden vægte er alle items i en rarity lige
     sandsynlige, hvilket lader den største kategori dominere. En vægt på 3
     gør hvert item i kategorien tre gange så sandsynligt som et uvægtet. */
  /* En manglende vægt betyder 1. En vægt på 0 betyder nul — den må ikke
     forveksles med "ikke sat", hvilket `weights[cat] || 1` ellers gør. */
  function weightOf(weights, category) {
    var w = weights ? weights[category] : undefined;
    return (typeof w === 'number' && isFinite(w) && w >= 0) ? w : 1;
  }

  function pickWeighted(cands, weights) {
    if (!cands.length) return null;
    if (!weights) return cands[Math.floor(Math.random() * cands.length)];
    var total = 0, i;
    for (i = 0; i < cands.length; i++) total += weightOf(weights, cands[i].category);
    // Alt i denne rarity er vægtet til nul: behandl den som tom, så
    // trækningen falder videre til en anden rarity.
    if (total <= 0) return null;
    var roll = Math.random() * total;
    for (i = 0; i < cands.length; i++) {
      roll -= weightOf(weights, cands[i].category);
      if (roll < 0) return cands[i];
    }
    return cands[cands.length - 1];
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

  /* Rullene der hører til et magic item, efter det er trukket. De ligger her
     frem for i drawOne, fordi drawOne også bruges til alt andet. */
  function magicRolls(item, items, spells, cfg) {
    if (!item || item.category !== MAGIC_CAT) return null;
    return { base: rollBaseItem(item, items), spell: rollSpell(item, spells, cfg) };
  }

  function generate(pack, tierObj, items, cfg, spells) {
    var used = {};

    var cards = tierObj.cards.map(function (c, idx) {
      var own = !!(c.filter && (c.filter.categories.length || c.filter.tags.length));
      var f = own ? c.filter : pack.filter;
      var pool = poolFor(items, f, cfg);
      // Egne vægte hører til et eget filter: kortet trækker fra sin egen pulje,
      // så det er også dér kategorierne skal kunne vejes mod hinanden.
      var weights = (own && c.weights) ? c.weights : (tierObj.weights || pack.weights);
      var rarity = weightedPick(c.dist);
      var slot = c.label || ('Kort ' + (idx + 1));
      if (!rarity) return { slot: slot, item: null, rolled: null, actual: null, poolSize: pool.length };

      var res = drawOne(pool, rarity, used, cfg, weights);
      if (res.item && cfg.noDuplicates) used[res.item.id] = true;
      var m = magicRolls(res.item, items, spells, cfg);
      return {
        slot: slot, item: res.item, rolled: res.rolled, actual: res.actual,
        base: m ? m.base : null, spell: m ? m.spell : null,
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
    magicTypesOf: magicTypesOf, rollSpell: rollSpell, MAGIC_CAT: MAGIC_CAT,
    rarityLabel: rarityLabel, normalizeRarity: normalizeRarity,
    defaultConfig: defaultConfig, defaultScales: defaultScales, findScale: findScale,
    migrateConfig: migrateConfig, emptyDist: function () { return dist({}); },
    emptyFilter: function () { return filt([], []); },
    parsePrice: parsePrice, priceToRarity: priceToRarity, recalcRarities: recalcRarities,
    parseCSV: parseCSV, guessMapping: guessMapping,
    itemsFromRows: itemsFromRows, itemsFromJSON: itemsFromJSON,
    categoriesOf: categoriesOf, tagsOf: tagsOf, poolFor: poolFor, generate: generate,
    rollBaseItem: rollBaseItem,
    storage: {
      available: available, load: load, save: save, clearAll: clearAll,
      K_CFG: K_CFG, K_ITEMS: K_ITEMS, K_SEEDED: K_SEEDED, K_MAGIC: K_MAGIC,
      K_BACKUP: K_BACKUP
    }
  };
})();
