/* Loot Box Generator — UI-lag. */
(function () {
  'use strict';

  var C = window.LB;

  var state = {
    cfg: C.migrateConfig(C.storage.load(C.storage.K_CFG, null)),
    items: C.storage.load(C.storage.K_ITEMS, null),
    magic: C.storage.load(C.storage.K_MAGIC, null),
    magicPage: 0,
    packId: null,
    results: [],
    pending: null,   // midlertidigt parsed import-data
    page: 0
  };

  var PAGE_SIZE = 100;

  /* ---------------- småhjælpere ---------------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'text') n.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') n.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c) n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return n;
  }

  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2800);
  }

  var saveTimer;
  function persist() {
    var ok = C.storage.save(C.storage.K_CFG, state.cfg) &&
             C.storage.save(C.storage.K_ITEMS, state.items) &&
             C.storage.save(C.storage.K_MAGIC, state.magic);
    var s = $('#saveState');
    if (!ok) {
      s.textContent = 'Kunne ikke gemme (lagerplads fuld?)';
      s.classList.remove('flash');
      return;
    }
    s.textContent = 'Gemt';
    s.classList.add('flash');
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      s.textContent = 'Gemt lokalt';
      s.classList.remove('flash');
    }, 1200);
  }

  function download(filename, text, mime) {
    var blob = new Blob([text], { type: mime || 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = el('a', { href: url, download: filename });
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function findPack(id) {
    for (var i = 0; i < state.cfg.packs.length; i++)
      if (state.cfg.packs[i].id === id) return state.cfg.packs[i];
    return null;
  }

  function currentTier(pack, tierId) {
    for (var i = 0; i < pack.tiers.length; i++) if (pack.tiers[i].id === tierId) return pack.tiers[i];
    return null;
  }

  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x';
  }

  function uniqueId(base, taken) {
    var id = base, n = 2;
    while (taken.indexOf(id) >= 0) { id = base + '-' + n; n++; }
    return id;
  }

  function priceLabel(it) {
    if (it.priceText) return it.priceText;
    if (it.price === null || it.price === undefined) return '—';
    return it.price + ' gp';
  }

  /* ---------------- første besøg: indlæs data ---------------- */

  function seedItems() {
    var seeded = [];
    if (window.DND_ITEMS) seeded = seeded.concat(C.itemsFromJSON(window.DND_ITEMS, state.cfg, 'gear'));
    if (window.CLASS_CARDS) seeded = seeded.concat(C.itemsFromJSON(window.CLASS_CARDS, state.cfg, 'none'));
    return seeded;
  }

  function bundledVersion() {
    return 'dnd:' + (window.DND_ITEMS_VERSION || '?') +
           '|class:' + (window.CLASS_CARDS_VERSION || '?') +
           '|magic:' + (window.MAGIC_ITEMS_VERSION || '?');
  }

  if (!Array.isArray(state.items)) {
    state.items = seedItems();
    C.storage.save(C.storage.K_SEEDED, bundledVersion());
  }
  if (!Array.isArray(state.magic)) state.magic = C.magicFromJSON(window.MAGIC_ITEMS || []);
  if (state.cfg.packs.length) state.packId = state.cfg.packs[0].id;

  /* Datafilerne i repoet kan være nyere end det, browseren har gemt — fx efter
     at regnearket er blevet rettet. Tilbyd en genindlæsning frem for at
     overskrive brugerens egne rettelser i det stille. */
  function renderDataNotice() {
    var host = $('#dataNotice');
    var stored = C.storage.load(C.storage.K_SEEDED, null);
    host.innerHTML = '';
    if (typeof stored !== 'string' || stored === bundledVersion()) {
      host.className = 'hidden';
      return;
    }
    host.className = 'notice';
    host.appendChild(el('span', {
      text: 'Datafilerne i appen er opdateret siden du hentede dem. ' +
            'Dine egne rettelser til de medfølgende items går tabt ved en genindlæsning.'
    }));
    host.appendChild(el('button', {
      class: 'btn btn-sm btn-primary', text: 'Genindlæs data',
      onclick: function () {
        if (!confirm('Erstat alle ' + state.items.length + ' items med de opdaterede datafiler?')) return;
        state.items = seedItems();
        state.magic = C.magicFromJSON(window.MAGIC_ITEMS || []);
        state.page = 0;
        state.magicPage = 0;
        C.storage.save(C.storage.K_SEEDED, bundledVersion());
        renderAll(); persist();
        toast('Data genindlæst');
      }
    }));
    host.appendChild(el('button', {
      class: 'btn btn-sm', text: 'Behold mine',
      onclick: function () {
        C.storage.save(C.storage.K_SEEDED, bundledVersion());
        renderDataNotice();
      }
    }));
  }

  /* ---------------- faneblade ---------------- */

  $('#tabs').addEventListener('click', function (e) {
    var btn = e.target.closest('.tab');
    if (!btn) return;
    $$('.tab').forEach(function (t) { t.classList.toggle('is-active', t === btn); });
    $$('.view').forEach(function (v) {
      v.classList.toggle('is-active', v.id === 'view-' + btn.dataset.tab);
    });
  });

  /* ================= GENERATOR ================= */

  function renderGenControls() {
    var sel = $('#genPack');
    var prev = state.packId;
    sel.innerHTML = '';
    state.cfg.packs.forEach(function (p) {
      sel.appendChild(el('option', { value: p.id, text: p.name }));
    });
    if (prev && findPack(prev)) sel.value = prev;
    renderTierOptions();
  }

  function renderTierOptions() {
    var pack = findPack($('#genPack').value);
    var sel = $('#genTier');
    var prev = sel.value;
    sel.innerHTML = '';
    if (!pack) return;
    pack.tiers.forEach(function (t) {
      sel.appendChild(el('option', { value: t.id, text: t.name }));
    });
    if (prev && pack.tiers.some(function (t) { return t.id === prev; })) sel.value = prev;
    sel.disabled = pack.tiers.length < 2;
    updateGenHint();
  }

  function updateGenHint() {
    var pack = findPack($('#genPack').value);
    var hint = $('#genHint');
    hint.innerHTML = '';
    if (!pack) return;
    if (!state.items.length) {
      hint.textContent = 'Ingen items indlæst — gå til fanen Items.';
      return;
    }
    var pool = C.poolFor(state.items, pack.filter, state.cfg);
    var tierObj = currentTier(pack, $('#genTier').value);
    var parts = [pool.length + ' item(s) i puljen'];
    if (tierObj) parts.push(tierObj.cards.length + ' kort pr. pakke');
    var f = pack.filter;
    if (f.categories.length) parts.push('kategorier: ' + f.categories.join(', '));
    if (f.tags.length) parts.push('tags: ' + f.tags.join(', '));
    if (!f.categories.length && !f.tags.length) parts.push('alle kategorier');
    if (f.consumables === 'only') parts.push('kun forbrugsvarer');
    else if (f.consumables === 'exclude') parts.push('uden forbrugsvarer');
    hint.appendChild(document.createTextNode(parts.join(' · ')));

    // Advar hvis en trukket rarity ikke findes i puljen.
    if (tierObj) {
      var have = {};
      pool.forEach(function (i) { have[i.rarity] = true; });
      var missing = [];
      tierObj.cards.forEach(function (c) {
        C.RKEYS.forEach(function (k) {
          if ((c.dist[k] || 0) > 0 && !have[k] && missing.indexOf(k) < 0) missing.push(k);
        });
      });
      if (missing.length) {
        hint.appendChild(el('br'));
        hint.appendChild(el('span', {
          class: 'warn-text',
          text: 'Puljen har ingen ' + missing.map(C.rarityLabel).join(' / ') +
                ' — de trækninger falder tilbage på en anden rarity.'
        }));
      }
    }
    var pm = pack.magic;
    if (state.cfg.magic.enabled && pm) {
      var on = C.RKEYS.filter(function (k) { return (pm.chance[k] || 0) > 0; });
      if (on.length) {
        hint.appendChild(el('br'));
        hint.appendChild(el('span', {
          text: 'Magic item-chance: ' + on.map(function (k) {
            return C.rarityLabel(k) + ' ' + pm.chance[k] + '%';
          }).join(', ') +
          ' · ' + C.magicPool(state.magic, pm.types, pm.consumables).length + ' magic items i puljen' +
          (pm.consumables === 'only' ? ' (kun forbrugsvarer)'
            : pm.consumables === 'exclude' ? ' (kun permanente)' : '')
        }));
      }
    }
    if (pack.note) {
      hint.appendChild(el('br'));
      hint.appendChild(el('span', { text: pack.note }));
    }
  }

  $('#genPack').addEventListener('change', function () {
    state.packId = this.value;
    renderTierOptions();
  });
  $('#genTier').addEventListener('change', updateGenHint);

  $('#btnGenerate').addEventListener('click', function () {
    var pack = findPack($('#genPack').value);
    if (!pack) return;
    var tierObj = currentTier(pack, $('#genTier').value);
    if (!tierObj) { toast('Vælg et tier'); return; }
    if (!state.items.length) { toast('Importér items først'); return; }

    var count = Math.max(1, Math.min(50, parseInt($('#genCount').value, 10) || 1));
    var out = [];
    for (var i = 0; i < count; i++) out.push(C.generate(pack, tierObj, state.items, state.cfg, state.magic));
    state.results = out;
    renderResults();
  });

  $('#btnClearResults').addEventListener('click', function () {
    state.results = [];
    renderResults();
  });

  $('#btnPrint').addEventListener('click', function () {
    if (!state.results.length) { toast('Generér nogle pakker først'); return; }
    window.print();
  });

  $('#btnCopy').addEventListener('click', function () {
    if (!state.results.length) { toast('Generér nogle pakker først'); return; }
    var lines = [];
    state.results.forEach(function (box, i) {
      lines.push('=== ' + box.pack + ' — ' + box.tier + ' #' + (i + 1) + ' ===');
      box.cards.forEach(function (c) {
        if (c.magic) {
          lines.push('  ' + c.slot + ': [MAGIC] ' + c.magic.item.name +
            (c.magic.base ? ' (' + c.magic.base.name + ')' : '') +
            ' [' + C.magicRarityLabel(c.magic.magicRarity) + ' magic item, ' +
            C.rarityLabel(c.rolled) + '-kort]');
          return;
        }
        lines.push('  ' + c.slot + ': ' + (c.item ? c.item.name : '(intet item)') +
          (c.actual ? ' [' + C.rarityLabel(c.actual) + ']' : ''));
      });
      lines.push('');
    });
    var text = lines.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { toast('Kopieret'); },
                                              function () { fallbackCopy(text); });
    } else fallbackCopy(text);
  });

  function fallbackCopy(text) {
    var ta = el('textarea', { style: 'position:fixed;opacity:0' });
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); toast('Kopieret'); }
    catch (e) { toast('Kunne ikke kopiere'); }
    document.body.removeChild(ta);
  }

  function renderResults() {
    var wrap = $('#results');
    wrap.innerHTML = '';
    state.results.forEach(function (box, idx) {
      var cards = el('div', { class: 'cards' });
      // Vises kun ved print, hvor pakkeoverskrifterne er væk.
      var origin = box.pack + ' · ' + box.tier + ' · pakke ' + (idx + 1);
      box.cards.forEach(function (c) {
        // Magic item-kort: viser magic itemet, dets magi-rarity og et
        // eventuelt udrullet basisitem. Kortets eget trin står nederst.
        if (c.magic) {
          var m = c.magic.item;
          var mk = [
            el('div', { class: 'card-slot', text: c.slot + ' · Magic item' }),
            el('div', { class: 'card-name', text: m.name })
          ];
          if (c.magic.base)
            mk.push(el('div', { class: 'card-base', text: 'Basis: ' + c.magic.base.name }));
          mk.push(el('div', { class: 'card-sub', text: m.type + (m.attunement ? ' · attunement' : '') }));
          if (m.desc) mk.push(el('div', { class: 'card-desc', text: m.desc }));
          if (c.magic.magicRolled !== c.magic.magicRarity)
            mk.push(el('div', { class: 'fallback-note',
              text: 'Slog ' + C.magicRarityLabel(c.magic.magicRolled) + ' — puljen var tom' }));
          mk.push(el('div', { class: 'card-meta' }, [
            el('span', { class: 'rarity r-' + c.magic.magicRarity,
                         text: C.magicRarityLabel(c.magic.magicRarity) }),
            el('span', { text: C.rarityLabel(c.rolled) + '-kort' })
          ]));
          mk.push(el('div', { class: 'card-origin', text: origin }));
          cards.appendChild(el('div', { class: 'card is-magic r-' + c.magic.magicRarity }, mk));
          return;
        }

        var it = c.item;
        var kids = [
          el('div', { class: 'card-slot', text: c.slot }),
          el('div', { class: 'card-name', text: it ? it.name : 'Intet item matcher' })
        ];
        if (it && (it.subcategory || it.category))
          kids.push(el('div', { class: 'card-sub', text: it.subcategory || it.category }));
        if (it && it.desc)
          kids.push(el('div', { class: 'card-desc', text: it.desc }));
        if (c.actual && c.rolled && c.actual !== c.rolled)
          kids.push(el('div', { class: 'fallback-note', text: 'Trak ' + C.rarityLabel(c.rolled) + ' — puljen var tom' }));
        if (c.duplicate)
          kids.push(el('div', { class: 'fallback-note', text: 'Dublet (puljen er for lille)' }));
        if (!it && c.rolled)
          kids.push(el('div', { class: 'fallback-note', text: 'Trak ' + C.rarityLabel(c.rolled) + ' — ingen items i puljen' }));
        kids.push(el('div', { class: 'card-meta' }, [
          el('span', {
            class: 'rarity ' + (c.actual ? 'r-' + c.actual : ''),
            text: c.actual ? C.rarityLabel(c.actual) : '—'
          }),
          el('span', { text: it ? priceLabel(it) : '' })
        ]));
        kids.push(el('div', { class: 'card-origin', text: origin }));
        cards.appendChild(el('div', { class: 'card' + (it ? ' r-' + c.actual : ' is-empty') }, kids));
      });

      wrap.appendChild(el('div', { class: 'box' }, [
        el('div', { class: 'box-head' }, [
          el('span', { class: 'box-title', text: box.pack + ' — ' + box.tier }),
          el('span', { class: 'box-sub', text: '#' + (idx + 1) })
        ]),
        cards
      ]));
    });
  }

  /* ================= PAKKE-EDITOR ================= */

  function renderPackList() {
    var ul = $('#packList');
    ul.innerHTML = '';
    state.cfg.packs.forEach(function (p) {
      ul.appendChild(el('li', {}, [
        el('button', {
          class: p.id === state.packId ? 'is-active' : '',
          text: p.name,
          onclick: function () { state.packId = p.id; renderPackList(); renderPackDetail(); }
        })
      ]));
    });
  }

  function distBar(d) {
    var total = 0;
    C.RKEYS.forEach(function (k) { total += (d[k] || 0); });
    var bar = el('div', { class: 'bar' });
    if (total <= 0) return bar;
    C.RKEYS.forEach(function (k) {
      var w = (d[k] || 0) / total * 100;
      if (w > 0) bar.appendChild(el('span', { style: 'width:' + w + '%;background:var(--r-' + k + ')' }));
    });
    return bar;
  }

  /* Chip-vælger for kategorier og tags i ét filter-objekt. */
  function filterEditor(filter, onChange) {
    var wrap = el('div');
    var cats = C.categoriesOf(state.items);
    var tags = C.tagsOf(state.items);

    function group(title, all, selected, note) {
      var chips = el('div', { class: 'cats' });
      if (!all.length) {
        chips.appendChild(el('span', { class: 'hint', text: 'Ingen fundet — importér items først.' }));
      } else {
        all.forEach(function (v) {
          var on = selected.indexOf(v) >= 0;
          chips.appendChild(el('button', {
            class: 'chip' + (on ? ' on' : ''),
            text: v,
            onclick: function () {
              var i = selected.indexOf(v);
              if (i >= 0) selected.splice(i, 1); else selected.push(v);
              onChange();
            }
          }));
        });
      }
      return el('div', { class: 'filter-group' }, [
        el('h3', { text: title }),
        note ? el('p', { class: 'hint', text: note }) : null,
        chips
      ]);
    }

    wrap.appendChild(group('Kategorier', cats, filter.categories,
      'Ingen valgt = alle kategorier (undtagen de udelukkede under Indstillinger).'));
    wrap.appendChild(group('Tags', tags, filter.tags,
      'Ingen valgt = ingen tag-begrænsning. Vælges flere, tæller et item med hvis det har mindst ét af dem.'));

    wrap.appendChild(el('label', { class: 'field cons-mode' }, [
      el('span', { text: 'Forbrugsvarer (gift, fakler, rationer, olie …)' }),
      el('select', {
        onchange: function () { filter.consumables = this.value; onChange(); }
      }, [
        el('option', { value: 'all', text: 'Både forbrugsvarer og varigt udstyr' }),
        el('option', { value: 'exclude', text: 'Kun varigt udstyr' }),
        el('option', { value: 'only', text: 'Kun forbrugsvarer' })
      ])
    ]));
    wrap.querySelector('.cons-mode select').value = filter.consumables || 'all';

    if (cats.length || tags.length) {
      wrap.appendChild(el('label', { class: 'field filter-mode' }, [
        el('span', { text: 'Sådan kombineres kategorier og tags' }),
        el('select', {
          onchange: function () { filter.mode = this.value; onChange(); }
        }, [
          el('option', { value: 'and', text: 'Begge skal passe (snævrere)' }),
          el('option', { value: 'or', text: 'Én af delene er nok (bredere)' })
        ])
      ]));
      wrap.querySelector('.filter-mode select').value = filter.mode === 'or' ? 'or' : 'and';
    }
    return wrap;
  }

  /* Chancen for at et korttrin bliver et magic item-kort, plus hvilke typer
     magic items pakken må trække. Selve korttrin -> magi-rarity-tabellen er
     fælles for alle pakker og ligger under fanen Magic. */
  function magicPanel(pack) {
    var pm = pack.magic;
    var pool = C.magicPool(state.magic, pm.types, pm.consumables);

    var chances = el('div', { class: 'dist' });
    C.RARITIES.forEach(function (r) {
      chances.appendChild(el('label', { class: 'field' }, [
        el('span', {}, [
          el('i', { class: 'dot', style: 'background:var(--r-' + r.key + ')' }),
          document.createTextNode(r.label)
        ]),
        el('input', {
          type: 'number', min: '0', max: '100', step: '0.1', value: pm.chance[r.key] || 0,
          oninput: function () {
            pm.chance[r.key] = Math.max(0, Math.min(100, Number(this.value) || 0));
            updateGenHint(); persist();
          }
        })
      ]));
    });

    var types = el('div', { class: 'cats' });
    C.magicTypesOf(state.magic).forEach(function (t) {
      var on = pm.types.indexOf(t) >= 0;
      types.appendChild(el('button', {
        class: 'chip' + (on ? ' on' : ''), text: t,
        onclick: function () {
          var i = pm.types.indexOf(t);
          if (i >= 0) pm.types.splice(i, 1); else pm.types.push(t);
          renderPackDetail(); updateGenHint(); persist();
        }
      }));
    });

    var panel = el('div', { class: 'panel' }, [
      el('h3', { text: 'Magic item-kort' }),
      el('p', { class: 'hint',
        text: 'Chance i procent for at et kort med det pågældende korttrin bliver et magic item ' +
              'i stedet for et almindeligt item. Hvilken magi-rarity man så får, styres af ' +
              'tabellen under fanen Magic.' }),
      chances,
      el('h3', { text: 'Forbrugsvarer', style: 'margin-top:14px' }),
      el('p', { class: 'hint',
        text: 'Potions, scrolls, dust, oil og andet der bruges op, kan holdes adskilt fra ' +
              'de permanente magic items.' }),
      el('label', { class: 'field cons-mode' }, [
        el('select', {
          onchange: function () {
            pm.consumables = this.value;
            renderPackDetail(); updateGenHint(); persist();
          }
        }, [
          el('option', { value: 'all', text: 'Både permanente og forbrugsvarer' }),
          el('option', { value: 'exclude', text: 'Kun permanente magic items' }),
          el('option', { value: 'only', text: 'Kun forbrugsvarer' })
        ])
      ]),
      el('h3', { text: 'Tilladte typer', style: 'margin-top:14px' }),
      el('p', { class: 'hint', text: 'Ingen valgt = alle typer. ' + pool.length + ' magic items i puljen.' }),
      types
    ]);
    panel.querySelector('.cons-mode select').value = pm.consumables || 'all';
    return panel;
  }

  function renderPackDetail() {
    var host = $('#packDetail');
    host.innerHTML = '';
    var pack = findPack(state.packId);
    if (!pack) {
      host.appendChild(el('div', { class: 'panel' }, [
        el('p', { class: 'hint', text: 'Vælg eller opret en pakketype.' })
      ]));
      return;
    }

    var poolCount = C.poolFor(state.items, pack.filter, state.cfg).length;

    host.appendChild(el('div', { class: 'panel' }, [
      el('div', { class: 'row' }, [
        el('label', { class: 'field' }, [
          el('span', { text: 'Navn' }),
          el('input', {
            type: 'text', value: pack.name,
            oninput: function () { pack.name = this.value; renderPackList(); renderGenControls(); persist(); }
          })
        ]),
        el('label', { class: 'field field-grow' }, [
          el('span', { text: 'Note (vises i generatoren)' }),
          el('input', {
            type: 'text', value: pack.note || '', placeholder: 'valgfri',
            oninput: function () { pack.note = this.value; updateGenHint(); persist(); }
          })
        ]),
        el('button', {
          class: 'btn btn-danger btn-sm', text: 'Slet pakketype',
          onclick: function () {
            if (!confirm('Slet pakketypen "' + pack.name + '"?')) return;
            state.cfg.packs = state.cfg.packs.filter(function (p) { return p !== pack; });
            state.packId = state.cfg.packs.length ? state.cfg.packs[0].id : null;
            renderPackList(); renderPackDetail(); renderGenControls(); persist();
          }
        })
      ]),
      el('p', { class: 'hint', text: poolCount + ' item(s) matcher pakkens filter.' }),
      filterEditor(pack.filter, function () {
        renderPackDetail(); updateGenHint(); persist();
      })
    ]));

    host.appendChild(magicPanel(pack));

    pack.tiers.forEach(function (t, ti) { host.appendChild(renderTier(pack, t, ti)); });

    host.appendChild(el('div', { class: 'row' }, [
      el('button', {
        class: 'btn', text: '+ Tilføj tier',
        onclick: function () {
          var taken = pack.tiers.map(function (x) { return x.id; });
          pack.tiers.push({
            id: uniqueId('tier-' + (pack.tiers.length + 1), taken),
            name: 'Nyt tier',
            cards: [{ label: 'Kort 1', dist: C.emptyDist(), filter: null }]
          });
          renderPackDetail(); renderTierOptions(); persist();
        }
      })
    ]));
  }

  function renderTier(pack, t, ti) {
    var body = el('div', { class: 'tier-body' });
    t.cards.forEach(function (c, ci) { body.appendChild(renderCard(pack, t, c, ci)); });

    body.appendChild(el('div', { class: 'row' }, [
      el('button', {
        class: 'btn btn-sm', text: '+ Tilføj kort',
        onclick: function () {
          t.cards.push({ label: 'Kort ' + (t.cards.length + 1), dist: C.emptyDist(), filter: null });
          renderPackDetail(); updateGenHint(); persist();
        }
      }),
      el('button', {
        class: 'btn btn-sm', text: 'Kopiér tier',
        onclick: function () {
          var copy = JSON.parse(JSON.stringify(t));
          copy.id = uniqueId(slug(t.name) + '-kopi', pack.tiers.map(function (x) { return x.id; }));
          copy.name = t.name + ' (kopi)';
          pack.tiers.splice(ti + 1, 0, copy);
          renderPackDetail(); renderTierOptions(); persist();
        }
      })
    ]));

    return el('div', { class: 'tier' }, [
      el('div', { class: 'tier-head' }, [
        el('input', {
          type: 'text', value: t.name,
          oninput: function () { t.name = this.value; renderTierOptions(); persist(); }
        }),
        el('span', { class: 'box-sub', text: t.cards.length + ' kort' }),
        el('span', { class: 'spacer' }),
        el('button', {
          class: 'btn btn-sm btn-danger', text: 'Slet tier',
          onclick: function () {
            if (!confirm('Slet tier "' + t.name + '"?')) return;
            pack.tiers.splice(ti, 1);
            renderPackDetail(); renderTierOptions(); persist();
          }
        })
      ]),
      body
    ]);
  }

  function renderCard(pack, t, c, ci) {
    var sumEl = el('span', { class: 'sum' });
    var barHost = el('div');

    function refreshSum() {
      var total = 0;
      C.RKEYS.forEach(function (k) { total += (Number(c.dist[k]) || 0); });
      sumEl.textContent = 'Sum: ' + (Math.round(total * 100) / 100) + '%';
      sumEl.className = 'sum ' + (Math.abs(total - 100) < 0.01 ? 'good' : 'bad');
      barHost.innerHTML = '';
      barHost.appendChild(distBar(c.dist));
    }

    var distWrap = el('div', { class: 'dist' });
    C.RARITIES.forEach(function (r) {
      distWrap.appendChild(el('label', { class: 'field' }, [
        el('span', {}, [
          el('i', { class: 'dot', style: 'background:var(--r-' + r.key + ')' }),
          document.createTextNode(r.label)
        ]),
        el('input', {
          type: 'number', min: '0', max: '100', step: '0.1', value: c.dist[r.key] || 0,
          oninput: function () {
            c.dist[r.key] = Math.max(0, Number(this.value) || 0);
            refreshSum(); persist();
          }
        })
      ]));
    });
    distWrap.appendChild(sumEl);

    var catHost = el('div');
    function renderOverride() {
      catHost.innerHTML = '';
      var on = !!c.filter;
      catHost.appendChild(el('label', { class: 'check' }, [
        el('input', {
          type: 'checkbox', checked: on ? 'checked' : null,
          onchange: function () {
            c.filter = this.checked ? C.emptyFilter() : null;
            renderOverride(); updateGenHint(); persist();
          }
        }),
        document.createTextNode('Eget filter for dette kort (overstyrer pakkens)')
      ]));
      if (on) {
        catHost.appendChild(filterEditor(c.filter, function () {
          renderOverride(); updateGenHint(); persist();
        }));
      }
    }
    renderOverride();

    var node = el('div', { class: 'card-row' }, [
      el('div', { class: 'card-row-head' }, [
        el('span', { class: 'card-no', text: '#' + (ci + 1) }),
        el('input', {
          type: 'text', value: c.label, placeholder: 'Kortnavn',
          oninput: function () { c.label = this.value; persist(); }
        }),
        el('span', { class: 'spacer' }),
        el('button', {
          class: 'btn btn-sm btn-danger', text: 'Fjern',
          onclick: function () {
            t.cards.splice(ci, 1);
            renderPackDetail(); updateGenHint(); persist();
          }
        })
      ]),
      distWrap, barHost, catHost
    ]);

    refreshSum();
    return node;
  }

  $('#btnAddPack').addEventListener('click', function () {
    var pack = {
      id: uniqueId('pakke-' + (state.cfg.packs.length + 1), state.cfg.packs.map(function (p) { return p.id; })),
      name: 'Ny pakketype', filter: C.emptyFilter(), note: '',
      tiers: [{ id: 'bronze', name: 'Bronze', cards: [{ label: 'Kort 1', dist: C.emptyDist(), filter: null }] }]
    };
    state.cfg.packs.push(pack);
    state.packId = pack.id;
    renderPackList(); renderPackDetail(); renderGenControls(); persist();
  });

  /* ================= ITEMS ================= */

  function renderImportScale() {
    var sel = $('#importScale');
    sel.innerHTML = '';
    state.cfg.scales.forEach(function (s) {
      sel.appendChild(el('option', { value: s.id, text: s.name }));
    });
    sel.appendChild(el('option', { value: 'none', text: 'Ingen (rarity sættes manuelt)' }));
  }

  $('#btnPasteToggle').addEventListener('click', function () {
    $('#pasteBox').classList.toggle('hidden');
  });

  $('#btnParsePaste').addEventListener('click', function () {
    var text = $('#pasteArea').value.trim();
    if (!text) { toast('Indsæt noget data først'); return; }
    handleText(text);
  });

  $('#fileInput').addEventListener('change', function () {
    var f = this.files && this.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () { handleText(String(reader.result)); };
    reader.onerror = function () { toast('Kunne ikke læse filen'); };
    reader.readAsText(f);
    this.value = '';
  });

  function handleText(text) {
    var scaleId = $('#importScale').value;
    var trimmed = text.trim();
    if (trimmed[0] === '[' || trimmed[0] === '{') {
      try { commitItems(C.itemsFromJSON(JSON.parse(trimmed), state.cfg, scaleId)); }
      catch (e) { toast('Kunne ikke læse JSON: ' + e.message); }
      return;
    }
    var rows = C.parseCSV(text);
    if (!rows.length) { toast('Fandt ingen rækker'); return; }
    state.pending = { rows: rows, mapping: C.guessMapping(rows[0]), hasHeader: true };
    renderMapper();
  }

  function renderMapper() {
    var host = $('#mapBox');
    host.className = '';
    host.innerHTML = '';
    var p = state.pending;
    var headers = p.rows[0].map(function (h, i) {
      return (p.hasHeader ? String(h) : 'Kolonne ' + (i + 1)) || 'Kolonne ' + (i + 1);
    });

    var fields = [
      ['name', 'Navn *'], ['category', 'Kategori (gruppe)'], ['subcategory', 'Underkategori'],
      ['price', 'Pris'], ['rarity', 'Rarity'], ['source', 'Kilde'],
      ['tags', 'Tags'], ['desc', 'Beskrivelse']
    ];

    var grid = el('div', { class: 'map-grid' });
    fields.forEach(function (f) {
      var sel = el('select', {
        onchange: function () {
          if (this.value === '') delete p.mapping[f[0]];
          else p.mapping[f[0]] = parseInt(this.value, 10);
        }
      });
      sel.appendChild(el('option', { value: '', text: '— ikke i data —' }));
      headers.forEach(function (h, i) { sel.appendChild(el('option', { value: String(i), text: h })); });
      if (p.mapping[f[0]] !== undefined) sel.value = String(p.mapping[f[0]]);
      grid.appendChild(el('label', { class: 'field' }, [el('span', { text: f[1] }), sel]));
    });

    host.appendChild(el('h3', { text: 'Sæt kolonner på plads' }));
    host.appendChild(el('label', { class: 'check' }, [
      el('input', {
        type: 'checkbox', checked: p.hasHeader ? 'checked' : null,
        onchange: function () {
          p.hasHeader = this.checked;
          p.mapping = p.hasHeader ? C.guessMapping(p.rows[0]) : {};
          renderMapper();
        }
      }),
      document.createTextNode('Første række er overskrifter')
    ]));
    host.appendChild(grid);
    host.appendChild(el('p', { class: 'hint',
      text: (p.rows.length - (p.hasHeader ? 1 : 0)) + ' rækker klar til import.' }));
    host.appendChild(el('div', { class: 'row' }, [
      el('button', {
        class: 'btn btn-primary', text: 'Importér',
        onclick: function () {
          if (p.mapping.name === undefined) { toast('Vælg hvilken kolonne der er navnet'); return; }
          var items = C.itemsFromRows(p.rows, p.mapping, state.cfg, p.hasHeader, $('#importScale').value);
          if (!items.length) { toast('Ingen brugbare rækker fundet'); return; }
          commitItems(items);
          host.className = 'hidden'; host.innerHTML = ''; state.pending = null;
        }
      }),
      el('button', {
        class: 'btn', text: 'Annullér',
        onclick: function () { host.className = 'hidden'; host.innerHTML = ''; state.pending = null; }
      })
    ]));
  }

  function commitItems(items) {
    var replace = true;
    if (state.items.length) {
      replace = confirm('Du har allerede ' + state.items.length + ' items.\n\n' +
        'OK = erstat dem med de ' + items.length + ' nye\n' +
        'Annullér = læg de nye oveni');
    }
    state.items = replace ? items : state.items.concat(items);
    state.page = 0;
    renderItems(); renderPackDetail(); updateGenHint(); renderExcludeChips(); persist();
    toast(items.length + ' items importeret');
    $('#pasteArea').value = '';
    $('#pasteBox').classList.add('hidden');
  }

  $('#btnLoadDnd').addEventListener('click', function () {
    if (!window.DND_ITEMS) { toast('Datafilen mangler'); return; }
    commitItems(C.itemsFromJSON(window.DND_ITEMS, state.cfg, 'gear'));
  });

  $('#btnLoadClass').addEventListener('click', function () {
    if (!window.CLASS_CARDS) { toast('Datafilen mangler'); return; }
    commitItems(C.itemsFromJSON(window.CLASS_CARDS, state.cfg, 'none'));
  });

  $('#btnClearItems').addEventListener('click', function () {
    if (!state.items.length) return;
    if (!confirm('Slet alle ' + state.items.length + ' items?')) return;
    state.items = [];
    state.page = 0;
    renderItems(); renderPackDetail(); updateGenHint(); renderExcludeChips(); persist();
  });

  $('#btnExportItems').addEventListener('click', function () {
    download('dnd-items.json', JSON.stringify(state.items, null, 2));
  });

  $('#btnExportCsv').addEventListener('click', function () {
    var cols = ['name', 'category', 'subcategory', 'price', 'rarity', 'scale',
                'consumable', 'source', 'tags', 'desc'];
    function cell(v) {
      if (v === null || v === undefined) return '';
      var s = Array.isArray(v) ? v.join(', ') : String(v);
      return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }
    var lines = [cols.join(';')];
    state.items.forEach(function (it) {
      lines.push(cols.map(function (c) { return cell(it[c]); }).join(';'));
    });
    download('dnd-items.csv', '﻿' + lines.join('\n'), 'text/csv');
  });

  function filteredItems() {
    var q = $('#itemSearch').value.trim().toLowerCase();
    var cat = $('#itemCatFilter').value;
    var tag = $('#itemTagFilter').value;
    var rar = $('#itemRarFilter').value;
    return state.items.filter(function (i) {
      if (q && i.name.toLowerCase().indexOf(q) < 0) return false;
      if (cat && i.category !== cat) return false;
      if (tag && (i.tags || []).indexOf(tag) < 0) return false;
      if (rar === '__none' ? !!i.rarity : (rar && i.rarity !== rar)) return false;
      var cons = $('#itemConsFilter').value;
      if (cons === 'only' && !i.consumable) return false;
      if (cons === 'exclude' && i.consumable) return false;
      return true;
    });
  }

  function fillSelect(sel, values, allLabel, extra) {
    var prev = sel.value;
    sel.innerHTML = '';
    sel.appendChild(el('option', { value: '', text: allLabel }));
    values.forEach(function (v) { sel.appendChild(el('option', { value: v.value || v, text: v.text || v })); });
    (extra || []).forEach(function (o) { sel.appendChild(el('option', { value: o.value, text: o.text })); });
    sel.value = prev;
    if (sel.value !== prev) sel.value = '';
  }

  function renderItemFilters() {
    fillSelect($('#itemCatFilter'), C.categoriesOf(state.items), 'Alle kategorier');
    fillSelect($('#itemTagFilter'), C.tagsOf(state.items), 'Alle tags');
    fillSelect($('#itemRarFilter'),
      C.RARITIES.map(function (r) { return { value: r.key, text: r.label }; }),
      'Alle rarities', [{ value: '__none', text: 'Uden rarity' }]);
  }

  function renderStats() {
    var host = $('#itemStats');
    host.innerHTML = '';
    var counts = {}, missing = 0;
    C.RKEYS.forEach(function (k) { counts[k] = 0; });
    state.items.forEach(function (i) {
      if (!i.rarity) missing++;
      else if (counts[i.rarity] !== undefined) counts[i.rarity]++;
    });
    C.RARITIES.forEach(function (r) {
      host.appendChild(el('div', {
        class: 'stat' + (state.items.length && counts[r.key] === 0 ? ' warn' : '')
      }, [
        el('b', { text: String(counts[r.key]), style: 'color:var(--r-' + r.key + ')' }),
        el('span', { text: r.label })
      ]));
    });
    if (missing) {
      host.appendChild(el('div', { class: 'stat warn' }, [
        el('b', { text: String(missing) }),
        el('span', { text: 'uden rarity — trækkes aldrig' })
      ]));
    }
    var nCons = state.items.filter(function (i) { return i.consumable; }).length;
    host.appendChild(el('div', { class: 'stat' }, [
      el('b', { text: String(nCons) }), el('span', { text: 'forbrugsvarer' })
    ]));
  }

  /* Sæt rarity på alt der matcher det aktive filter — bruges bl.a. til at rydde
     op i items uden pris, som ellers aldrig bliver trukket. */
  function renderBulkBar(list) {
    var host = $('#bulkBar');
    host.innerHTML = '';
    if (!list.length) return;

    var sel = el('select', {});
    sel.appendChild(el('option', { value: '', text: 'Ingen rarity (trækkes aldrig)' }));
    C.RARITIES.forEach(function (r) { sel.appendChild(el('option', { value: r.key, text: r.label })); });

    host.appendChild(el('span', { class: 'hint', text: 'For alle ' + list.length + ' viste:' }));
    host.appendChild(sel);
    host.appendChild(el('button', {
      class: 'btn btn-sm', text: 'Sæt rarity',
      onclick: function () {
        var v = sel.value || null;
        if (!confirm('Sæt rarity til "' + (v ? C.rarityLabel(v) : 'ingen') +
                     '" på ' + list.length + ' items?')) return;
        list.forEach(function (it) { it.rarity = v; it.rarityLocked = !!v; });
        renderItems(); updateGenHint(); persist();
        toast(list.length + ' items opdateret');
      }
    }));
    [['Marker som forbrugsvare', true], ['Marker som varigt', false]].forEach(function (opt) {
      host.appendChild(el('button', {
        class: 'btn btn-sm', text: opt[0],
        onclick: function () {
          list.forEach(function (it) { it.consumable = opt[1]; });
          renderItems(); updateGenHint(); persist();
          toast(list.length + ' items opdateret');
        }
      }));
    });
  }

  function renderItems() {
    renderItemFilters();
    renderStats();

    var list = filteredItems();
    renderBulkBar(list);
    var pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (state.page >= pages) state.page = pages - 1;
    var slice = list.slice(state.page * PAGE_SIZE, (state.page + 1) * PAGE_SIZE);

    $('#itemCount').textContent = list.length + ' af ' + state.items.length + ' items';

    var tbody = $('#itemTable tbody');
    tbody.innerHTML = '';
    slice.forEach(function (it) {
      var rarSel = el('select', {
        onchange: function () {
          it.rarity = this.value || null;
          it.rarityLocked = !!this.value;
          rarSel.className = 'rarity r-' + (it.rarity || '');
          renderStats(); updateGenHint(); persist();
        }
      });
      rarSel.appendChild(el('option', { value: '', text: '—' }));
      C.RARITIES.forEach(function (r) { rarSel.appendChild(el('option', { value: r.key, text: r.label })); });
      rarSel.value = it.rarity || '';
      rarSel.className = 'rarity r-' + (it.rarity || '');

      var scaleSel = el('select', {
        onchange: function () {
          it.scale = this.value;
          if (!it.rarityLocked) C.recalcRarities([it], state.cfg);
          renderItems(); persist();
        }
      });
      state.cfg.scales.forEach(function (s) {
        scaleSel.appendChild(el('option', { value: s.id, text: s.name }));
      });
      scaleSel.appendChild(el('option', { value: 'none', text: 'Ingen' }));
      scaleSel.value = it.scale || 'gear';

      var nameCell = el('td', {}, [
        el('div', { text: it.name }),
        it.subcategory ? el('div', { class: 'cell-sub', text: it.subcategory }) : null
      ]);

      tbody.appendChild(el('tr', {}, [
        nameCell,
        el('td', { text: it.category }),
        el('td', {}, [
          el('input', {
            type: 'checkbox', checked: it.consumable ? 'checked' : null,
            onchange: function () { it.consumable = this.checked; renderItems(); updateGenHint(); persist(); }
          })
        ]),
        el('td', { text: priceLabel(it) }),
        el('td', {}, [rarSel]),
        el('td', {}, [scaleSel]),
        el('td', { text: it.source || '' }),
        el('td', {}, [
          el('button', {
            class: 'btn btn-sm btn-danger', text: '×', title: 'Slet item',
            onclick: function () {
              state.items = state.items.filter(function (x) { return x !== it; });
              renderItems(); updateGenHint(); persist();
            }
          })
        ])
      ]));
    });

    var pager = $('#itemPager');
    pager.innerHTML = '';
    if (pages > 1) {
      pager.appendChild(el('button', {
        class: 'btn btn-sm', text: '‹ Forrige',
        onclick: function () { if (state.page > 0) { state.page--; renderItems(); } }
      }));
      pager.appendChild(el('span', { class: 'hint', text: 'Side ' + (state.page + 1) + ' af ' + pages }));
      pager.appendChild(el('button', {
        class: 'btn btn-sm', text: 'Næste ›',
        onclick: function () { if (state.page < pages - 1) { state.page++; renderItems(); } }
      }));
    }
  }

  ['#itemSearch', '#itemCatFilter', '#itemTagFilter', '#itemRarFilter', '#itemConsFilter'].forEach(function (sel) {
    $(sel).addEventListener(sel === '#itemSearch' ? 'input' : 'change', function () {
      state.page = 0; renderItems();
    });
  });

  /* ================= MAGIC ================= */

  function renderMagicSettings() {
    $('#magicEnabled').checked = !!state.cfg.magic.enabled;

    var host = $('#magicMapping');
    host.innerHTML = '';

    var head = el('div', { class: 'map-row map-head' }, [el('span', { text: 'Korttrin' })]);
    C.MAGIC_RARITIES.forEach(function (r) {
      head.appendChild(el('span', {}, [
        el('i', { class: 'dot', style: 'background:var(--r-' + r.key + ')' }),
        document.createTextNode(' ' + r.label)
      ]));
    });
    head.appendChild(el('span', { text: 'Sum' }));
    host.appendChild(head);

    C.RARITIES.forEach(function (tierR) {
      var d = state.cfg.magic.mapping[tierR.key];
      var sumEl = el('span', { class: 'sum' });
      function refresh() {
        var total = 0;
        C.MKEYS.forEach(function (k) { total += (Number(d[k]) || 0); });
        sumEl.textContent = (Math.round(total * 100) / 100) + '%';
        sumEl.className = 'sum ' + (Math.abs(total - 100) < 0.01 ? 'good' : 'bad');
      }
      var row = el('div', { class: 'map-row' }, [
        el('span', { class: 'rarity r-' + tierR.key, text: tierR.label })
      ]);
      C.MAGIC_RARITIES.forEach(function (mr) {
        row.appendChild(el('input', {
          type: 'number', min: '0', max: '100', step: '0.1', value: d[mr.key] || 0,
          oninput: function () {
            d[mr.key] = Math.max(0, Number(this.value) || 0);
            refresh(); persist();
          }
        }));
      });
      row.appendChild(sumEl);
      refresh();
      host.appendChild(row);
    });
  }

  $('#magicEnabled').addEventListener('change', function () {
    state.cfg.magic.enabled = this.checked;
    updateGenHint(); persist();
  });

  function filteredMagic() {
    var q = $('#magicSearch').value.trim().toLowerCase();
    var type = $('#magicTypeFilter').value;
    var rar = $('#magicRarFilter').value;
    return state.magic.filter(function (m) {
      if (q && m.name.toLowerCase().indexOf(q) < 0) return false;
      if (type && m.type !== type) return false;
      if (rar && m.rarity !== rar) return false;
      var cons = $('#magicConsFilter').value;
      if (cons === 'only' && !m.consumable) return false;
      if (cons === 'exclude' && m.consumable) return false;
      return true;
    });
  }

  function renderMagicItems() {
    fillSelect($('#magicTypeFilter'), C.magicTypesOf(state.magic), 'Alle typer');
    fillSelect($('#magicRarFilter'),
      C.MAGIC_RARITIES.map(function (r) { return { value: r.key, text: r.label }; }),
      'Alle magi-rarities');

    var stats = $('#magicStats');
    stats.innerHTML = '';
    var counts = {};
    C.MKEYS.forEach(function (k) { counts[k] = 0; });
    state.magic.forEach(function (m) {
      if (m.enabled !== false && counts[m.rarity] !== undefined) counts[m.rarity]++;
    });
    C.MAGIC_RARITIES.forEach(function (r) {
      stats.appendChild(el('div', { class: 'stat' }, [
        el('b', { text: String(counts[r.key]), style: 'color:var(--r-' + r.key + ')' }),
        el('span', { text: r.label })
      ]));
    });
    var nCons = state.magic.filter(function (m) { return m.enabled !== false && m.consumable; }).length;
    var nPerm = state.magic.filter(function (m) { return m.enabled !== false && !m.consumable; }).length;
    stats.appendChild(el('div', { class: 'stat' }, [
      el('b', { text: String(nPerm) }), el('span', { text: 'permanente' })
    ]));
    stats.appendChild(el('div', { class: 'stat' }, [
      el('b', { text: String(nCons) }), el('span', { text: 'forbrugsvarer' })
    ]));

    var list = filteredMagic();
    $('#magicCount').textContent = list.length + ' af ' + state.magic.length + ' magic items';

    var bulk = $('#magicBulk');
    bulk.innerHTML = '';
    if (list.length) {
      bulk.appendChild(el('span', { class: 'hint', text: 'For alle ' + list.length + ' viste:' }));
      [['Med i puljen', 'enabled', true], ['Ude af puljen', 'enabled', false],
       ['Marker som forbrugsvare', 'consumable', true], ['Marker som permanent', 'consumable', false]
      ].forEach(function (opt) {
        bulk.appendChild(el('button', {
          class: 'btn btn-sm', text: opt[0],
          onclick: function () {
            list.forEach(function (m) { m[opt[1]] = opt[2]; });
            renderMagicItems(); persist();
            toast(list.length + ' magic items opdateret');
          }
        }));
      });
    }

    var pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (state.magicPage >= pages) state.magicPage = pages - 1;
    var slice = list.slice(state.magicPage * PAGE_SIZE, (state.magicPage + 1) * PAGE_SIZE);

    var tbody = $('#magicTable tbody');
    tbody.innerHTML = '';
    slice.forEach(function (m) {
      var rarSel = el('select', {
        onchange: function () {
          m.rarity = this.value || null;
          this.className = 'rarity r-' + (m.rarity || '');
          renderMagicItems(); persist();
        }
      });
      C.MAGIC_RARITIES.forEach(function (r) {
        rarSel.appendChild(el('option', { value: r.key, text: r.label }));
      });
      rarSel.value = m.rarity || '';
      rarSel.className = 'rarity r-' + (m.rarity || '');

      var base = m.baseFilter && m.baseFilter.subcategories.length
        ? m.baseFilter.subcategories.join(', ') : '—';

      tbody.appendChild(el('tr', {}, [
        el('td', {}, [
          el('div', { text: m.name }),
          m.attunement ? el('div', { class: 'cell-sub', text: 'kræver attunement' }) : null
        ]),
        el('td', { text: m.type }),
        el('td', {}, [
          el('input', {
            type: 'checkbox', checked: m.consumable ? 'checked' : null,
            onchange: function () { m.consumable = this.checked; renderMagicItems(); persist(); }
          })
        ]),
        el('td', {}, [rarSel]),
        el('td', { class: 'cell-sub', text: base }),
        el('td', {}, [
          el('input', {
            type: 'checkbox', checked: m.enabled !== false ? 'checked' : null,
            onchange: function () { m.enabled = this.checked; renderMagicItems(); persist(); }
          })
        ])
      ]));
    });

    var pager = $('#magicPager');
    pager.innerHTML = '';
    if (pages > 1) {
      pager.appendChild(el('button', {
        class: 'btn btn-sm', text: '‹ Forrige',
        onclick: function () { if (state.magicPage > 0) { state.magicPage--; renderMagicItems(); } }
      }));
      pager.appendChild(el('span', { class: 'hint', text: 'Side ' + (state.magicPage + 1) + ' af ' + pages }));
      pager.appendChild(el('button', {
        class: 'btn btn-sm', text: 'Næste ›',
        onclick: function () { if (state.magicPage < pages - 1) { state.magicPage++; renderMagicItems(); } }
      }));
    }
  }

  ['#magicSearch', '#magicTypeFilter', '#magicRarFilter', '#magicConsFilter'].forEach(function (sel) {
    $(sel).addEventListener(sel === '#magicSearch' ? 'input' : 'change', function () {
      state.magicPage = 0; renderMagicItems();
    });
  });

  /* ================= INDSTILLINGER ================= */

  function renderScales() {
    var host = $('#scales');
    host.innerHTML = '';
    state.cfg.scales.forEach(function (sc) {
      var rows = el('div');
      C.RARITIES.forEach(function (r, i) {
        var step = null;
        sc.steps.forEach(function (s) { if (s.r === r.key) step = s; });
        if (!step) { step = { r: r.key, max: null }; sc.steps.push(step); }
        var last = i === C.RARITIES.length - 1;
        rows.appendChild(el('div', { class: 'thresh-row' }, [
          el('label', {}, [
            el('i', { class: 'dot', style: 'background:var(--r-' + r.key + ')' }),
            document.createTextNode(' ' + r.label)
          ]),
          el('span', { class: 'hint', text: last ? 'alt derover' : 'til og med' }),
          last ? el('span', { class: 'hint', text: '∞' }) : el('input', {
            type: 'number', min: '0', step: 'any', value: step.max === null ? '' : step.max,
            oninput: function () {
              step.max = this.value === '' ? null : Number(this.value);
              persist();
            }
          }),
          el('span', { class: 'hint', text: last ? '' : 'gp' })
        ]));
      });
      host.appendChild(el('div', { class: 'scale-box' }, [
        el('h3', { text: sc.name }),
        rows
      ]));
    });
  }

  function renderExcludeChips() {
    var host = $('#excludeChips');
    host.innerHTML = '';
    var cats = C.categoriesOf(state.items);
    if (!cats.length) {
      host.appendChild(el('span', { class: 'hint', text: 'Ingen kategorier endnu.' }));
      return;
    }
    cats.forEach(function (cat) {
      var on = state.cfg.excludeFromAll.indexOf(cat) >= 0;
      host.appendChild(el('button', {
        class: 'chip' + (on ? ' on' : ''), text: cat,
        onclick: function () {
          var i = state.cfg.excludeFromAll.indexOf(cat);
          if (i >= 0) state.cfg.excludeFromAll.splice(i, 1);
          else state.cfg.excludeFromAll.push(cat);
          renderExcludeChips(); updateGenHint(); renderPackDetail(); persist();
        }
      }));
    });
  }

  $('#btnRecalc').addEventListener('click', function () {
    C.recalcRarities(state.items, state.cfg);
    renderItems(); updateGenHint(); persist();
    toast('Rarities genberegnet (manuelt satte items er urørt)');
  });

  $('#optNoDupes').addEventListener('change', function () {
    state.cfg.noDuplicates = this.checked; persist();
  });
  $('#optFallback').addEventListener('change', function () {
    state.cfg.fallback = this.value; updateGenHint(); persist();
  });

  $('#btnExportConfig').addEventListener('click', function () {
    download('lootbox-config.json', JSON.stringify(state.cfg, null, 2));
  });

  $('#importConfig').addEventListener('change', function () {
    var f = this.files && this.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        state.cfg = C.migrateConfig(JSON.parse(String(reader.result)));
        state.packId = state.cfg.packs.length ? state.cfg.packs[0].id : null;
        renderAll(); persist();
        toast('Opsætning importeret');
      } catch (e) { toast('Kunne ikke læse filen: ' + e.message); }
    };
    reader.readAsText(f);
    this.value = '';
  });

  $('#btnResetConfig').addEventListener('click', function () {
    if (!confirm('Nulstil alle pakker og indstillinger til standard? Dine items bevares.')) return;
    state.cfg = C.defaultConfig();
    state.packId = state.cfg.packs[0].id;
    renderAll(); persist();
    toast('Nulstillet');
  });

  /* ================= opstart ================= */

  function renderAll() {
    $('#optNoDupes').checked = state.cfg.noDuplicates;
    $('#optFallback').value = state.cfg.fallback;
    renderScales();
    renderExcludeChips();
    renderImportScale();
    renderPackList();
    renderPackDetail();
    renderGenControls();
    renderItems();
    renderMagicSettings();
    renderMagicItems();
    renderResults();
    renderDataNotice();
  }

  renderAll();
  persist();

  if (!C.storage.available()) {
    $('#saveState').textContent = 'Kan ikke gemme i denne browser';
    toast('Browseren tillader ikke lokal lagring — brug eksport/import i stedet.');
  }
})();
