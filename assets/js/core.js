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

  /* To slags rarity, som er nemme at forveksle:

       korttrin    — hvad en kortplads i en pakke slår. Styres af fordelingen
                     på kortet. Common … Legendary.
       magi-rarity — magic itemets egen rarity fra D&D. Common … Artifact.

     Et korttrin kan blive til et magic item-kort; derefter afgør tabellen i
     cfg.magic.mapping hvilken magi-rarity der trækkes på det trin.        */

  var MAGIC_RARITIES = RARITIES.concat([{ key: 'artifact', label: 'Artifact' }]);
  var MKEYS = MAGIC_RARITIES.map(function (r) { return r.key; });

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
          { r: 'uncommon',  max: 9.99 },
          { r: 'rare',      max: 39.99 },
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

  function card(label, d, filter) {
    return { label: label || '', dist: dist(d), filter: filter || null };
  }

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

  function defaultPacks() {
    return [
      {
        id: 'adventurer', name: 'Adventurer',
        filter: filt(['Ammunition', 'Gift', 'Rustning', 'Udstyr', 'Våben', 'Værktøj'], []),
        note: 'Den almindelige pakke — udstyr, våben, rustning, værktøj, gift og ammunition. ' +
              'Fokus, køretøjer, ridedyr og udstyrspakker er valgt fra. Magic item-kort kan ' +
              'være både permanente og forbrugsvarer, så healing potions og spell scrolls ' +
              'kan falde her.',
        // Både permanente og forbrugsvarer: en healing potion eller et spell
        // scroll er fin loot i en adventurer-pakke. Hvilket trin de lander på
        // følger af magi-rarity — de mindste er Common og kan derfor komme
        // allerede på et Rare-kort, mens Supreme Healing kræver et højere trin.
        magic: packMagic({ rare: 10, very_rare: 20, legendary: 30 }, [], 'all'),
        // Udstyr er den største gruppe og ville ellers fylde over halvdelen af
        // pakken. Våben og rustning vægtes op, så de falder oftere.
        weights: { 'Våben': 2, 'Rustning': 6, 'Ammunition': 2 },
        tiers: gradedTiers(
          [card('Kort 1', { common: 100 }),
           card('Kort 2', { common: 50, uncommon: 50 }),
           card('Kort 3', { uncommon: 96, rare: 3.7, very_rare: 0.2, legendary: 0.1 })],
          [card('Kort 1', { common: 20, uncommon: 80 }),
           card('Kort 2', { uncommon: 80, rare: 20 }),
           card('Kort 3', { uncommon: 60, rare: 35, very_rare: 4, legendary: 1 })],
          [card('Kort 1', { common: 25, uncommon: 50, rare: 25 }),
           card('Kort 2', { uncommon: 75, rare: 25 }),
           card('Kort 3', { uncommon: 40, rare: 45, very_rare: 12, legendary: 3 })],
          // Bronze er uden rustning: den eneste Uncommon-rustning er Padded, så
          // den ville bare gå igen. Sølv og Guld vægter rustning tungere i stedet.
          {
            bronze: { 'Våben': 2, 'Rustning': 0, 'Ammunition': 2 },
            gold: { 'Våben': 2, 'Rustning': 8, 'Ammunition': 2 }
          }
        )
      },
      { id: 'weapons', name: 'Weapons', filter: filt(['Våben', 'Ammunition'], []),
        note: 'Magic item-kort er begrænset til permanente våben — potions hører til i Consumables.',
        magic: packMagic({ rare: 15, very_rare: 25, legendary: 40 }, ['Weapon'], 'exclude'),
        tiers: standardTiers() },
      {
        id: 'armor', name: 'Armor', filter: filt(['Rustning'], []),
        note: 'Rustning ligger højt på udstyrs-skalaen — billigste er Padded til 5 gp, så der findes ' +
              'ingen Common. Fordelingerne starter derfor ved Uncommon. Kun 14 items i alt, så ' +
              'gentagelser er uundgåelige.',
        magic: packMagic({ rare: 15, very_rare: 25, legendary: 40 }, ['Armor'], 'exclude'),
        tiers: gradedTiers(
          // Kun ét Uncommon-item (Padded), så kun kort 1 sigter efter det —
          // ellers slås dubletfiltret og fordelingen indbyrdes.
          [card('Kort 1', { uncommon: 100 }),
           card('Kort 2', { rare: 100 }),
           card('Kort 3', { rare: 80, very_rare: 20 })],
          [card('Kort 1', { uncommon: 50, rare: 50 }),
           card('Kort 2', { rare: 90, very_rare: 10 }),
           card('Kort 3', { rare: 40, very_rare: 55, legendary: 5 })],
          [card('Kort 1', { rare: 100 }),
           card('Kort 2', { rare: 30, very_rare: 70 }),
           card('Kort 3', { very_rare: 60, legendary: 40 })]
        )
      },
      {
        id: 'consumables', name: 'Consumables', filter: filt([], [], 'and', 'only'),
        note: 'Alt der bruges op: gift, fakler, rationer, olie, vievand — og på magisiden ' +
              'potions, scrolls, dust og lignende. Kun 24 almindelige forbrugsvarer, og de ' +
              'ni dyreste er alle gift, så de høje trin læner sig på magic item-kortene.',
        magic: packMagic({ rare: 25, very_rare: 40, legendary: 55 }, [], 'only'),
        tiers: gradedTiers(
          [card('Kort 1', { common: 100 }),
           card('Kort 2', { common: 90, uncommon: 10 }),
           card('Kort 3', { common: 50, uncommon: 30, rare: 20 })],
          [card('Kort 1', { common: 70, uncommon: 30 }),
           card('Kort 2', { common: 40, uncommon: 30, rare: 30 }),
           card('Kort 3', { rare: 60, very_rare: 40 })],
          [card('Kort 1', { common: 40, uncommon: 30, rare: 30 }),
           card('Kort 2', { rare: 50, very_rare: 50 }),
           card('Kort 3', { very_rare: 50, legendary: 50 })]
        )
      },
      {
        id: 'magic', name: 'Magic', filter: filt([], []),
        note: 'Hvert kort er et magic item. Korttrinnet afgør hvilken magi-rarity der trækkes ' +
              '— se tabellen under fanen Magic. Trinnene ligger højt, fordi hele pakken er magi.',
        magic: packMagic({ common: 100, uncommon: 100, rare: 100, very_rare: 100, legendary: 100 }, [], 'all'),
        tiers: gradedTiers(
          [card('Kort 1', { rare: 100 }),
           card('Kort 2', { rare: 100 }),
           card('Kort 3', { rare: 70, very_rare: 30 })],
          [card('Kort 1', { rare: 100 }),
           card('Kort 2', { rare: 50, very_rare: 50 }),
           card('Kort 3', { very_rare: 80, legendary: 20 })],
          [card('Kort 1', { rare: 50, very_rare: 50 }),
           card('Kort 2', { very_rare: 100 }),
           card('Kort 3', { very_rare: 40, legendary: 60 })]
        )
      },
      {
        id: 'classes', name: 'Classes', filter: filt(['Class'], []),
        note: 'Ikke gradueret — ét tier. Hver kortplads beder om sin egen korttype via ' +
              'tags: Class, Perk, Stat, Feat og Skill. Feat- og Skill-kortene findes, men ' +
              'har ingen plads endnu — tilføj et kort, hvis de skal med.',
        magic: packMagic({}, []),
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

  /* Fordeling over magi-rarity for hvert korttrin. Tallene er sat så et
     Rare-kort overvejende giver et Common magic item, mens et Legendary-kort
     har sit tyngdepunkt på Rare. Artifacts er slået fra som standard. */
  function magicDist(o) {
    var d = {};
    MKEYS.forEach(function (k) { d[k] = (o && o[k]) || 0; });
    return d;
  }

  function defaultMagic() {
    return {
      enabled: true,
      // Chance i procent for at et scroll bærer en lavere spell, castet på
      // scrollets eget niveau.
      upcastChance: 30,
      mapping: {
        common:    magicDist({ common: 100 }),
        uncommon:  magicDist({ common: 90, uncommon: 10 }),
        rare:      magicDist({ common: 70, uncommon: 25, rare: 5 }),
        very_rare: magicDist({ common: 40, uncommon: 40, rare: 18, very_rare: 2 }),
        legendary: magicDist({ common: 10, uncommon: 30, rare: 40, very_rare: 17, legendary: 3 })
      }
    };
  }

  /* Chance i procent for at et korttrin bliver et magic item-kort i stedet
     for et almindeligt item. Nøglen er korttrinnet, ikke magi-rarity. */
  function magicChanceObj(chance) {
    var d = {};
    RKEYS.forEach(function (k) { d[k] = (chance && chance[k]) || 0; });
    return d;
  }

  function packMagic(chance, types, consumables) {
    // types tomt = alle typer magic items kan trækkes i pakken.
    return {
      chance: magicChanceObj(chance),
      types: types || [],
      consumables: consumables || 'all'
    };
  }

  function defaultConfig() {
    return {
      version: 4,
      scales: defaultScales(),
      noDuplicates: true,
      fallback: 'nearest',
      excludeFromAll: ['Class'],
      magic: defaultMagic(),
      packs: defaultPacks()
    };
  }

  /* ---------------- lagring ---------------- */

  var K_CFG = 'dccdd.config.v1';
  var K_ITEMS = 'dccdd.items.v1';
  var K_SEEDED = 'dccdd.seeded.v1';
  var K_MAGIC = 'dccdd.magic.v1';

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
    RKEYS.forEach(function (k) {
      cfg.magic.mapping[k] = magicDist(cfg.magic.mapping[k]);
    });

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
      var dp = null;
      def.packs.forEach(function (x) { if (x.id === p.id) dp = x; });
      if (!p.magic || typeof p.magic !== 'object')
        p.magic = dp ? dp.magic : packMagic({}, []);
      p.magic.chance = magicChanceObj(p.magic.chance);
      if (!Array.isArray(p.magic.types)) p.magic.types = [];
      if (['all', 'exclude', 'only'].indexOf(p.magic.consumables) < 0)
        p.magic.consumables = dp ? dp.magic.consumables : 'all';
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

    cfg.version = 4;
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
  var STAT_FIELDS = ['damage', 'damageType', 'properties', 'mastery',
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

     Tre rul i kæde:
       1. Korttrinnet er allerede slået. Chancen i pack.magic.chance afgør om
          kortet bliver et magic item-kort i stedet for et almindeligt item.
       2. cfg.magic.mapping[korttrin] afgør hvilken magi-rarity der trækkes.
       3. Er magic itemet generisk ("Weapon, +1"), rulles der til sidst hvilket
          basisitem det sidder på.                                          */

  /* consumables: 'all' = både forbrugsvarer og permanente magic items,
                  'exclude' = kun permanente, 'only' = kun forbrugsvarer. */
  function magicPool(magicItems, types, consumables) {
    var mode = consumables || 'all';
    return magicItems.filter(function (m) {
      if (m.enabled === false) return false;
      if (!m.rarity) return false;
      if (types && types.length && types.indexOf(m.type) < 0) return false;
      if (mode === 'exclude' && m.consumable) return false;
      if (mode === 'only' && !m.consumable) return false;
      return true;
    });
  }

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

  /* Tredje rul: hvilket basisvåben eller -rustning sidder magien på. */
  function rollBaseItem(magicItem, items) {
    var bf = magicItem.baseFilter;
    if (!bf || !bf.subcategories || !bf.subcategories.length) return null;
    var cands = items.filter(function (i) {
      // Samme krav som ved en almindelig trækning: items uden rarity er
      // taget ud af spillet og må heller ikke dukke op som basisitem.
      if (!i.rarity) return false;
      if (bf.subcategories.indexOf(i.subcategory) < 0 &&
          bf.subcategories.indexOf(i.category) < 0) return false;
      for (var e = 0; e < (bf.excludeNames || []).length; e++)
        if (i.name.toLowerCase().indexOf(bf.excludeNames[e].toLowerCase()) >= 0) return false;
      return true;
    });
    return cands.length ? cands[Math.floor(Math.random() * cands.length)] : null;
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

    var cands = spells.filter(function (sp) { return sp.level === want; });
    if (!cands.length) return null;
    return {
      spell: cands[Math.floor(Math.random() * cands.length)],
      castLevel: lvl,
      upcast: upcast
    };
  }

  function drawMagic(pool, tierKey, used, cfg, items, spells) {
    var mapping = (cfg.magic && cfg.magic.mapping && cfg.magic.mapping[tierKey]) || null;
    if (!mapping) return null;
    var wanted = pickMagicWeighted(mapping);
    if (!wanted) return null;

    function pick(r, allowUsed) {
      var c = pool.filter(function (m) {
        return m.rarity === r && (allowUsed || !used['magic:' + m.id]);
      });
      return c.length ? c[Math.floor(Math.random() * c.length)] : null;
    }

    var hit = pick(wanted, false), actual = wanted;
    if (!hit) {
      var order = fallbackOrder(wanted, cfg.fallback === 'none' ? 'nearest' : cfg.fallback);
      for (var i = 0; i < order.length && !hit; i++) {
        hit = pick(order[i], false);
        if (hit) actual = order[i];
      }
    }
    if (!hit) { hit = pick(wanted, true); actual = wanted; }
    if (!hit) return null;

    return {
      item: hit,
      magicRolled: wanted,
      magicRarity: actual,
      base: rollBaseItem(hit, items),
      spell: rollSpell(hit, spells, cfg)
    };
  }

  function generate(pack, tierObj, items, cfg, magicItems, spells) {
    var used = {};
    var pm = pack.magic || { chance: {}, types: [] };
    var mPool = (cfg.magic && cfg.magic.enabled && magicItems)
      ? magicPool(magicItems, pm.types, pm.consumables) : [];

    var cards = tierObj.cards.map(function (c, idx) {
      var f = (c.filter && (c.filter.categories.length || c.filter.tags.length)) ? c.filter : pack.filter;
      var pool = poolFor(items, f, cfg);
      var rarity = weightedPick(c.dist);
      var slot = c.label || ('Kort ' + (idx + 1));
      if (!rarity) return { slot: slot, item: null, rolled: null, actual: null, poolSize: pool.length };

      // Rul 1: bliver kortet et magic item?
      var chance = (pm.chance && pm.chance[rarity]) || 0;
      if (mPool.length && chance > 0 && Math.random() * 100 < chance) {
        var mag = drawMagic(mPool, rarity, used, cfg, items, spells);
        if (mag) {
          if (cfg.noDuplicates) used['magic:' + mag.item.id] = true;
          return {
            slot: slot, item: null, magic: mag, rolled: rarity, actual: rarity,
            poolSize: mPool.length
          };
        }
      }

      var res = drawOne(pool, rarity, used, cfg, tierObj.weights || pack.weights);
      if (res.item && cfg.noDuplicates) used[res.item.id] = true;
      return {
        slot: slot, item: res.item, rolled: res.rolled, actual: res.actual,
        duplicate: !!res.duplicate, poolSize: pool.length
      };
    });
    return { pack: pack.name, tier: tierObj.name, cards: cards };
  }

  var muid = 0;
  function magicFromJSON(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(function (o) {
      muid++;
      return {
        id: makeId(o.name).replace(/-(\d+)$/, '-m$1') + '-' + muid,
        name: String(o.name || '').trim(),
        type: String(o.type || '').trim(),
        rarity: normalizeRarity(o.rarity),
        attunement: !!o.attunement,
        consumable: !!o.consumable,
        spellLevel: (typeof o.spellLevel === 'number') ? o.spellLevel : null,
        spellName: o.spellName || '',
        spellKind: o.spellKind || '',
        upcastable: !!o.upcastable,
        typeLine: o.typeLine || '',
        tags: Array.isArray(o.tags) ? o.tags : [],
        desc: o.desc || '',
        source: o.source || '',
        baseFilter: o.baseFilter || null,
        variantOf: o.variantOf || null,
        enabled: o.enabled !== false
      };
    });
  }

  function magicTypesOf(magicItems) {
    var seen = {};
    magicItems.forEach(function (m) { if (m.type) seen[m.type] = true; });
    return Object.keys(seen).sort();
  }

  return {
    RARITIES: RARITIES, RKEYS: RKEYS,
    MAGIC_RARITIES: MAGIC_RARITIES, MKEYS: MKEYS,
    magicRarityLabel: magicRarityLabel, magicFromJSON: magicFromJSON,
    magicTypesOf: magicTypesOf, magicPool: magicPool, rollSpell: rollSpell, emptyMagicDist: function () { return magicDist({}); },
    rarityLabel: rarityLabel, normalizeRarity: normalizeRarity,
    defaultConfig: defaultConfig, defaultScales: defaultScales, findScale: findScale,
    migrateConfig: migrateConfig, emptyDist: function () { return dist({}); },
    emptyFilter: function () { return filt([], []); },
    parsePrice: parsePrice, priceToRarity: priceToRarity, recalcRarities: recalcRarities,
    parseCSV: parseCSV, guessMapping: guessMapping,
    itemsFromRows: itemsFromRows, itemsFromJSON: itemsFromJSON,
    categoriesOf: categoriesOf, tagsOf: tagsOf, poolFor: poolFor, generate: generate,
    storage: {
      available: available, load: load, save: save,
      K_CFG: K_CFG, K_ITEMS: K_ITEMS, K_SEEDED: K_SEEDED, K_MAGIC: K_MAGIC
    }
  };
})();
