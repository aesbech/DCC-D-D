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

  function rarityLabel(key) {
    for (var i = 0; i < RARITIES.length; i++) if (RARITIES[i].key === key) return RARITIES[i].label;
    return key;
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
    return null;
  }

  /* ---------------- pris -> rarity ---------------- */

  function defaultThresholds() {
    return [
      { r: 'common',    min: 0 },
      { r: 'uncommon',  min: 101 },
      { r: 'rare',      min: 501 },
      { r: 'very_rare', min: 5001 },
      { r: 'legendary', min: 50001 }
    ];
  }

  /* Understøtter "150 gp", "1.500", "2,5 gp", "50 sp", "10 cp" -> gp. */
  function parsePrice(raw) {
    if (raw === null || raw === undefined || raw === '') return null;
    if (typeof raw === 'number') return isFinite(raw) ? raw : null;
    var s = String(raw).toLowerCase().trim();
    var unit = /\bsp\b/.test(s) ? 0.1 : /\bcp\b/.test(s) ? 0.01 : /\bpp\b/.test(s) ? 10 : 1;
    var num = s.replace(/[^0-9.,]/g, '');
    if (!num) return null;
    // Tusindtalsseparator vs decimal: sidste separator med 1-2 cifre efter = decimal.
    var m = num.match(/[.,](\d{1,2})$/);
    if (m) {
      num = num.slice(0, num.length - m[0].length).replace(/[.,]/g, '') + '.' + m[1];
    } else {
      num = num.replace(/[.,]/g, '');
    }
    var v = parseFloat(num);
    return isFinite(v) ? v * unit : null;
  }

  function priceToRarity(price, thresholds) {
    if (price === null || price === undefined || !isFinite(price)) return 'common';
    var sorted = thresholds.slice().sort(function (a, b) { return a.min - b.min; });
    var out = sorted.length ? sorted[0].r : 'common';
    for (var i = 0; i < sorted.length; i++) if (price >= sorted[i].min) out = sorted[i].r;
    return out;
  }

  /* ---------------- standardopsætning ---------------- */

  function dist(o) {
    var d = {};
    RKEYS.forEach(function (k) { d[k] = o[k] || 0; });
    return d;
  }

  function card(label, d, categories) {
    return { label: label || '', dist: dist(d), categories: categories || null };
  }

  function tier(id, name, cards) {
    return { id: id, name: name, cards: cards };
  }

  function defaultPacks() {
    return [
      {
        id: 'adventurer',
        name: 'Adventurer',
        categories: [],
        tiers: [
          tier('bronze', 'Bronze', [
            card('Kort 1', { common: 100 }),
            card('Kort 2', { common: 90, uncommon: 10 }),
            card('Kort 3', { uncommon: 95, rare: 4, very_rare: 1 })
          ]),
          tier('silver', 'Sølv', [
            card('Kort 1', { common: 80, uncommon: 20 }),
            card('Kort 2', { common: 60, uncommon: 40 }),
            card('Kort 3', { uncommon: 70, rare: 25, very_rare: 5 })
          ]),
          tier('gold', 'Guld', [
            card('Kort 1', { common: 50, uncommon: 50 }),
            card('Kort 2', { common: 30, uncommon: 70 }),
            card('Kort 3', { uncommon: 40, rare: 45, very_rare: 13, legendary: 2 })
          ])
        ]
      },
      themedPack('weapons', 'Weapons', ['Weapon']),
      themedPack('armor', 'Armor', ['Armor']),
      themedPack('consumables', 'Consumables', ['Consumable']),
      themedPack('magic', 'Magic', ['Magic Item']),
      themedPack('classes', 'Classes', ['Class'])
    ];
  }

  /* Placeholder-progression for de øvrige fem pakker — tænkt til at blive tunet i UI'et. */
  function themedPack(id, name, cats) {
    return {
      id: id, name: name, categories: cats,
      tiers: [
        tier('bronze', 'Bronze', [
          card('Kort 1', { common: 100 }),
          card('Kort 2', { common: 85, uncommon: 15 }),
          card('Kort 3', { uncommon: 90, rare: 9, very_rare: 1 })
        ]),
        tier('silver', 'Sølv', [
          card('Kort 1', { common: 70, uncommon: 30 }),
          card('Kort 2', { common: 50, uncommon: 50 }),
          card('Kort 3', { uncommon: 65, rare: 30, very_rare: 5 })
        ]),
        tier('gold', 'Guld', [
          card('Kort 1', { common: 40, uncommon: 60 }),
          card('Kort 2', { uncommon: 80, rare: 20 }),
          card('Kort 3', { uncommon: 30, rare: 50, very_rare: 17, legendary: 3 })
        ])
      ]
    };
  }

  function defaultConfig() {
    return {
      version: 1,
      thresholds: defaultThresholds(),
      noDuplicates: true,
      fallback: 'down',
      packs: defaultPacks()
    };
  }

  /* ---------------- lagring ---------------- */

  var K_CFG = 'dccdd.config.v1';
  var K_ITEMS = 'dccdd.items.v1';

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
    if (!Array.isArray(cfg.thresholds) || !cfg.thresholds.length) cfg.thresholds = def.thresholds;
    if (!Array.isArray(cfg.packs)) cfg.packs = def.packs;
    if (typeof cfg.noDuplicates !== 'boolean') cfg.noDuplicates = def.noDuplicates;
    if (['down', 'nearest', 'none'].indexOf(cfg.fallback) < 0) cfg.fallback = def.fallback;
    cfg.packs.forEach(function (p) {
      if (!Array.isArray(p.categories)) p.categories = [];
      if (!Array.isArray(p.tiers)) p.tiers = [];
      p.tiers.forEach(function (t) {
        if (!Array.isArray(t.cards)) t.cards = [];
        t.cards.forEach(function (c) { c.dist = dist(c.dist || {}); });
      });
    });
    cfg.version = 1;
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
    var delim = ',';
    var counts = { ',': 0, ';': 0, '\t': 0 };
    var inQ0 = false;
    for (var x = 0; x < firstLine.length; x++) {
      var ch0 = firstLine[x];
      if (ch0 === '"') inQ0 = !inQ0;
      else if (!inQ0 && counts.hasOwnProperty(ch0)) counts[ch0]++;
    }
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
    name:      ['name', 'navn', 'item', 'title', 'titel'],
    category:  ['category', 'kategori', 'type', 'gruppe', 'group'],
    price:     ['price', 'pris', 'cost', 'value', 'værdi', 'vaerdi', 'gp'],
    rarity:    ['rarity', 'sjældenhed', 'sjaeldenhed', 'sjaelden'],
    source:    ['source', 'kilde', 'book', 'bog'],
    notes:     ['notes', 'note', 'noter', 'description', 'beskrivelse', 'desc', 'text']
  };

  function guessMapping(headers) {
    var map = {};
    var lower = headers.map(function (h) { return String(h).toLowerCase().trim(); });
    Object.keys(FIELD_HINTS).forEach(function (field) {
      var hints = FIELD_HINTS[field];
      for (var h = 0; h < hints.length; h++) {
        var idx = lower.indexOf(hints[h]);
        if (idx >= 0 && Object.keys(map).every(function (k) { return map[k] !== idx; })) {
          map[field] = idx; return;
        }
      }
      for (var h2 = 0; h2 < hints.length; h2++) {
        for (var j = 0; j < lower.length; j++) {
          if (lower[j].indexOf(hints[h2]) >= 0 &&
              Object.keys(map).every(function (k) { return map[k] !== j; })) {
            map[field] = j; return;
          }
        }
      }
    });
    return map;
  }

  function buildItem(raw, thresholds) {
    var price = parsePrice(raw.price);
    var explicit = normalizeRarity(raw.rarity);
    return {
      id: makeId(raw.name),
      name: String(raw.name || '').trim() || '(uden navn)',
      category: String(raw.category || '').trim() || 'Ukategoriseret',
      price: price,
      rarity: explicit || priceToRarity(price, thresholds),
      rarityLocked: !!explicit,
      source: String(raw.source || '').trim(),
      notes: String(raw.notes || '').trim()
    };
  }

  function itemsFromRows(rows, mapping, thresholds, hasHeader) {
    var body = hasHeader ? rows.slice(1) : rows;
    return body.map(function (r) {
      var raw = {};
      Object.keys(mapping).forEach(function (f) {
        var idx = mapping[f];
        if (idx !== null && idx !== undefined && idx >= 0) raw[f] = r[idx];
      });
      return buildItem(raw, thresholds);
    }).filter(function (it) { return it.name !== '(uden navn)'; });
  }

  function itemsFromJSON(data, thresholds) {
    var arr = Array.isArray(data) ? data
      : (data && Array.isArray(data.items) ? data.items : null);
    if (!arr) throw new Error('JSON skal være en liste af items, eller et objekt med "items".');
    return arr.map(function (o) {
      return buildItem({
        name: o.name || o.navn || o.title,
        category: o.category || o.kategori || o.type,
        price: o.price !== undefined ? o.price : (o.pris !== undefined ? o.pris : o.cost),
        rarity: o.rarity || o.sjaeldenhed,
        source: o.source || o.kilde,
        notes: o.notes || o.note || o.description
      }, thresholds);
    });
  }

  function recalcRarities(items, thresholds) {
    items.forEach(function (it) {
      if (!it.rarityLocked) it.rarity = priceToRarity(it.price, thresholds);
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

  function poolFor(items, categories) {
    if (!categories || !categories.length) return items;
    return items.filter(function (i) { return categories.indexOf(i.category) >= 0; });
  }

  function drawOne(pool, rarity, used, cfg) {
    function pick(r, allowUsed) {
      var c = pool.filter(function (i) {
        return i.rarity === r && (allowUsed || !used[i.id]);
      });
      return c.length ? c[Math.floor(Math.random() * c.length)] : null;
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

  function generate(pack, tierObj, items, cfg) {
    var used = {};
    var cards = tierObj.cards.map(function (c, idx) {
      var cats = (c.categories && c.categories.length) ? c.categories : pack.categories;
      var pool = poolFor(items, cats);
      var rarity = weightedPick(c.dist);
      if (!rarity) return { slot: c.label || ('Kort ' + (idx + 1)), item: null, rolled: null, actual: null };
      var res = drawOne(pool, rarity, used, cfg);
      if (res.item && cfg.noDuplicates) used[res.item.id] = true;
      return {
        slot: c.label || ('Kort ' + (idx + 1)),
        item: res.item,
        rolled: res.rolled,
        actual: res.actual,
        duplicate: !!res.duplicate,
        poolSize: pool.length
      };
    });
    return { pack: pack.name, tier: tierObj.name, cards: cards };
  }

  return {
    RARITIES: RARITIES, RKEYS: RKEYS,
    rarityLabel: rarityLabel, normalizeRarity: normalizeRarity,
    defaultConfig: defaultConfig, defaultThresholds: defaultThresholds,
    migrateConfig: migrateConfig, emptyDist: function () { return dist({}); },
    parsePrice: parsePrice, priceToRarity: priceToRarity, recalcRarities: recalcRarities,
    parseCSV: parseCSV, guessMapping: guessMapping,
    itemsFromRows: itemsFromRows, itemsFromJSON: itemsFromJSON,
    categoriesOf: categoriesOf, generate: generate,
    storage: { available: available, load: load, save: save, K_CFG: K_CFG, K_ITEMS: K_ITEMS }
  };
})();
