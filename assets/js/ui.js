/* Loot Box Generator — UI-lag. */
(function () {
  'use strict';

  var C = window.LB;

  var state = {
    cfg: C.migrateConfig(C.storage.load(C.storage.K_CFG, null)),
    items: C.storage.load(C.storage.K_ITEMS, []) || [],
    packId: null,
    results: [],
    pending: null,   // midlertidigt parsed import-data
    page: 0
  };
  if (state.cfg.packs.length) state.packId = state.cfg.packs[0].id;

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
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  var saveTimer;
  function persist() {
    var okCfg = C.storage.save(C.storage.K_CFG, state.cfg);
    var okItems = C.storage.save(C.storage.K_ITEMS, state.items);
    var s = $('#saveState');
    if (!okCfg || !okItems) {
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

  function download(filename, text) {
    var blob = new Blob([text], { type: 'application/json' });
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

  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'x';
  }

  function uniqueId(base, taken) {
    var id = base, n = 2;
    while (taken.indexOf(id) >= 0) { id = base + '-' + n; n++; }
    return id;
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
    updateGenHint();
  }

  function updateGenHint() {
    var pack = findPack($('#genPack').value);
    var hint = $('#genHint');
    if (!pack) { hint.textContent = ''; return; }
    if (!state.items.length) {
      hint.textContent = 'Ingen items indlæst endnu — gå til fanen Items og importér din liste (eller indlæs eksempeldata).';
      return;
    }
    var pool = pack.categories.length
      ? state.items.filter(function (i) { return pack.categories.indexOf(i.category) >= 0; })
      : state.items;
    var tierObj = null;
    pack.tiers.forEach(function (t) { if (t.id === $('#genTier').value) tierObj = t; });
    hint.textContent = pool.length + ' item(s) i puljen for denne pakketype' +
      (tierObj ? ' · ' + tierObj.cards.length + ' kort pr. pakke' : '') +
      (pack.categories.length ? ' · kategorier: ' + pack.categories.join(', ') : ' · alle kategorier');
  }

  $('#genPack').addEventListener('change', function () {
    state.packId = this.value;
    renderTierOptions();
  });
  $('#genTier').addEventListener('change', updateGenHint);

  $('#btnGenerate').addEventListener('click', function () {
    var pack = findPack($('#genPack').value);
    if (!pack) return;
    var tierObj = null;
    pack.tiers.forEach(function (t) { if (t.id === $('#genTier').value) tierObj = t; });
    if (!tierObj) { toast('Vælg et tier'); return; }
    if (!state.items.length) { toast('Importér items først'); return; }

    var count = Math.max(1, Math.min(50, parseInt($('#genCount').value, 10) || 1));
    var out = [];
    for (var i = 0; i < count; i++) out.push(C.generate(pack, tierObj, state.items, state.cfg));
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
        lines.push('  ' + c.slot + ': ' + (c.item ? c.item.name : '(intet item)') +
          (c.actual ? ' [' + C.rarityLabel(c.actual) + ']' : ''));
      });
      lines.push('');
    });
    var text = lines.join('\n');
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { toast('Kopieret'); },
        function () { fallbackCopy(text); }
      );
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
      box.cards.forEach(function (c) {
        var cls = 'card' + (c.item ? ' r-' + c.actual : ' is-empty');
        var meta = el('div', { class: 'card-meta' }, [
          el('span', {
            class: 'rarity ' + (c.actual ? 'r-' + c.actual : ''),
            text: c.actual ? C.rarityLabel(c.actual) : '—'
          }),
          el('span', { text: c.item && c.item.price !== null ? c.item.price + ' gp' : '' })
        ]);
        var kids = [
          el('div', { class: 'card-slot', text: c.slot }),
          el('div', { class: 'card-name', text: c.item ? c.item.name : 'Intet item matcher' })
        ];
        if (c.item && c.item.category)
          kids.push(el('div', { class: 'card-slot', text: c.item.category }));
        if (c.actual && c.rolled && c.actual !== c.rolled)
          kids.push(el('div', { class: 'fallback-note', text: 'Trak ' + C.rarityLabel(c.rolled) + ' — puljen var tom' }));
        if (c.duplicate)
          kids.push(el('div', { class: 'fallback-note', text: 'Dublet (puljen er for lille)' }));
        if (!c.item && c.rolled)
          kids.push(el('div', { class: 'fallback-note', text: 'Trak ' + C.rarityLabel(c.rolled) + ' — ingen items i puljen' }));
        kids.push(meta);
        cards.appendChild(el('div', { class: cls }, kids));
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
      if (w > 0) bar.appendChild(el('span', {
        style: 'width:' + w + '%;background:var(--r-' + k + ')'
      }));
    });
    return bar;
  }

  function categoryChips(selected, onToggle) {
    var cats = C.categoriesOf(state.items);
    var wrap = el('div', { class: 'cats' });
    if (!cats.length) {
      wrap.appendChild(el('span', { class: 'hint', text: 'Ingen kategorier endnu — importér items først.' }));
      return wrap;
    }
    cats.forEach(function (cat) {
      var on = selected.indexOf(cat) >= 0;
      wrap.appendChild(el('button', {
        class: 'chip' + (on ? ' on' : ''),
        text: cat,
        onclick: function () { onToggle(cat); }
      }));
    });
    return wrap;
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

    /* --- hoved --- */
    var head = el('div', { class: 'panel' }, [
      el('div', { class: 'row' }, [
        el('label', { class: 'field' }, [
          el('span', { text: 'Navn' }),
          el('input', {
            type: 'text', value: pack.name,
            oninput: function () { pack.name = this.value; renderPackList(); renderGenControls(); persist(); }
          })
        ]),
        el('span', { class: 'spacer' }),
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
      el('h3', { text: 'Kategorier i denne pakke' }),
      el('p', { class: 'hint', text: 'Ingen valgt = alle items kan trækkes. Enkelte kort kan overstyre dette nedenfor.' }),
      categoryChips(pack.categories, function (cat) {
        var i = pack.categories.indexOf(cat);
        if (i >= 0) pack.categories.splice(i, 1); else pack.categories.push(cat);
        renderPackDetail(); updateGenHint(); persist();
      })
    ]);
    host.appendChild(head);

    /* --- tiers --- */
    pack.tiers.forEach(function (t, ti) {
      host.appendChild(renderTier(pack, t, ti));
    });

    host.appendChild(el('div', { class: 'row' }, [
      el('button', {
        class: 'btn', text: '+ Tilføj tier',
        onclick: function () {
          var taken = pack.tiers.map(function (x) { return x.id; });
          var base = 'tier-' + (pack.tiers.length + 1);
          pack.tiers.push({
            id: uniqueId(base, taken),
            name: 'Nyt tier',
            cards: [{ label: 'Kort 1', dist: C.emptyDist(), categories: null }]
          });
          renderPackDetail(); renderTierOptions(); persist();
        }
      })
    ]));
  }

  function renderTier(pack, t, ti) {
    var body = el('div', { class: 'tier-body' });

    t.cards.forEach(function (c, ci) {
      body.appendChild(renderCard(pack, t, c, ci));
    });

    body.appendChild(el('div', { class: 'row' }, [
      el('button', {
        class: 'btn btn-sm', text: '+ Tilføj kort',
        onclick: function () {
          t.cards.push({ label: 'Kort ' + (t.cards.length + 1), dist: C.emptyDist(), categories: null });
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
      var rounded = Math.round(total * 100) / 100;
      sumEl.textContent = 'Sum: ' + rounded + '%';
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
          type: 'number', min: '0', max: '100', step: '0.1',
          value: c.dist[r.key] || 0,
          oninput: function () {
            c.dist[r.key] = Math.max(0, Number(this.value) || 0);
            refreshSum(); persist();
          }
        })
      ]));
    });
    distWrap.appendChild(sumEl);

    var catHost = el('div');
    var overrideOn = !!(c.categories && c.categories.length);

    function renderCatOverride() {
      catHost.innerHTML = '';
      catHost.appendChild(el('label', { class: 'check' }, [
        el('input', {
          type: 'checkbox', checked: overrideOn ? 'checked' : null,
          onchange: function () {
            overrideOn = this.checked;
            c.categories = overrideOn ? (c.categories || []) : null;
            renderCatOverride(); persist();
          }
        }),
        document.createTextNode('Egne kategorier for dette kort')
      ]));
      if (overrideOn) {
        catHost.appendChild(categoryChips(c.categories || [], function (cat) {
          if (!c.categories) c.categories = [];
          var i = c.categories.indexOf(cat);
          if (i >= 0) c.categories.splice(i, 1); else c.categories.push(cat);
          renderCatOverride(); persist();
        }));
      }
    }
    renderCatOverride();

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
      distWrap,
      barHost,
      catHost
    ]);

    refreshSum();
    return node;
  }

  $('#btnAddPack').addEventListener('click', function () {
    var taken = state.cfg.packs.map(function (p) { return p.id; });
    var pack = {
      id: uniqueId('pakke-' + (state.cfg.packs.length + 1), taken),
      name: 'Ny pakketype',
      categories: [],
      tiers: [{
        id: 'bronze', name: 'Bronze',
        cards: [{ label: 'Kort 1', dist: C.emptyDist(), categories: null }]
      }]
    };
    state.cfg.packs.push(pack);
    state.packId = pack.id;
    renderPackList(); renderPackDetail(); renderGenControls(); persist();
  });

  /* ================= ITEMS ================= */

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
    var trimmed = text.trim();
    if (trimmed[0] === '[' || trimmed[0] === '{') {
      try {
        var items = C.itemsFromJSON(JSON.parse(trimmed), state.cfg.thresholds);
        commitItems(items);
      } catch (e) {
        toast('Kunne ikke læse JSON: ' + e.message);
      }
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
      ['name', 'Navn *'], ['category', 'Kategori'], ['price', 'Pris'],
      ['rarity', 'Rarity'], ['source', 'Kilde'], ['notes', 'Noter']
    ];

    var grid = el('div', { class: 'map-grid' });
    fields.forEach(function (f) {
      var sel = el('select', {
        onchange: function () {
          var v = this.value;
          if (v === '') delete p.mapping[f[0]];
          else p.mapping[f[0]] = parseInt(v, 10);
        }
      });
      sel.appendChild(el('option', { value: '', text: '— ikke i data —' }));
      headers.forEach(function (h, i) {
        sel.appendChild(el('option', { value: String(i), text: h }));
      });
      if (p.mapping[f[0]] !== undefined) sel.value = String(p.mapping[f[0]]);
      grid.appendChild(el('label', { class: 'field' }, [el('span', { text: f[1] }), sel]));
    });

    var preview = el('p', { class: 'hint' });
    function updatePreview() {
      var n = p.rows.length - (p.hasHeader ? 1 : 0);
      preview.textContent = n + ' rækker klar til import.';
    }
    updatePreview();

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
    host.appendChild(preview);
    host.appendChild(el('div', { class: 'row' }, [
      el('button', {
        class: 'btn btn-primary', text: 'Importér',
        onclick: function () {
          if (p.mapping.name === undefined) { toast('Vælg hvilken kolonne der er navnet'); return; }
          var items = C.itemsFromRows(p.rows, p.mapping, state.cfg.thresholds, p.hasHeader);
          if (!items.length) { toast('Ingen brugbare rækker fundet'); return; }
          commitItems(items);
          host.className = 'hidden';
          host.innerHTML = '';
          state.pending = null;
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
    renderItems();
    renderPackDetail();
    updateGenHint();
    persist();
    toast(items.length + ' items importeret');
    $('#pasteArea').value = '';
    $('#pasteBox').classList.add('hidden');
  }

  $('#btnLoadSample').addEventListener('click', function () {
    if (!window.SAMPLE_ITEMS) { toast('Eksempeldata mangler'); return; }
    commitItems(C.itemsFromJSON(window.SAMPLE_ITEMS, state.cfg.thresholds));
  });

  $('#btnClearItems').addEventListener('click', function () {
    if (!state.items.length) return;
    if (!confirm('Slet alle ' + state.items.length + ' items?')) return;
    state.items = [];
    state.page = 0;
    renderItems(); renderPackDetail(); updateGenHint(); persist();
  });

  $('#btnExportItems').addEventListener('click', function () {
    download('dnd-items.json', JSON.stringify(state.items, null, 2));
  });

  function filteredItems() {
    var q = $('#itemSearch').value.trim().toLowerCase();
    var cat = $('#itemCatFilter').value;
    var rar = $('#itemRarFilter').value;
    return state.items.filter(function (i) {
      if (q && i.name.toLowerCase().indexOf(q) < 0) return false;
      if (cat && i.category !== cat) return false;
      if (rar && i.rarity !== rar) return false;
      return true;
    });
  }

  function renderItemFilters() {
    var catSel = $('#itemCatFilter');
    var prev = catSel.value;
    catSel.innerHTML = '';
    catSel.appendChild(el('option', { value: '', text: 'Alle kategorier' }));
    C.categoriesOf(state.items).forEach(function (c) {
      catSel.appendChild(el('option', { value: c, text: c }));
    });
    catSel.value = prev;

    var rarSel = $('#itemRarFilter');
    if (rarSel.options.length <= 1) {
      C.RARITIES.forEach(function (r) {
        rarSel.appendChild(el('option', { value: r.key, text: r.label }));
      });
    }
  }

  function renderStats() {
    var host = $('#itemStats');
    host.innerHTML = '';
    var counts = {};
    C.RKEYS.forEach(function (k) { counts[k] = 0; });
    state.items.forEach(function (i) { if (counts[i.rarity] !== undefined) counts[i.rarity]++; });
    C.RARITIES.forEach(function (r) {
      host.appendChild(el('div', {
        class: 'stat' + (state.items.length && counts[r.key] === 0 ? ' warn' : '')
      }, [
        el('b', { text: String(counts[r.key]), style: 'color:var(--r-' + r.key + ')' }),
        el('span', { text: r.label })
      ]));
    });
  }

  function renderItems() {
    renderItemFilters();
    renderStats();

    var list = filteredItems();
    var pages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (state.page >= pages) state.page = pages - 1;
    var slice = list.slice(state.page * PAGE_SIZE, (state.page + 1) * PAGE_SIZE);

    $('#itemCount').textContent = list.length + ' af ' + state.items.length + ' items';

    var tbody = $('#itemTable tbody');
    tbody.innerHTML = '';
    slice.forEach(function (it) {
      var sel = el('select', {
        onchange: function () {
          it.rarity = this.value;
          it.rarityLocked = true;
          renderStats(); persist();
        }
      });
      C.RARITIES.forEach(function (r) {
        sel.appendChild(el('option', { value: r.key, text: r.label }));
      });
      sel.value = it.rarity;
      sel.className = 'rarity r-' + it.rarity;

      tbody.appendChild(el('tr', {}, [
        el('td', { text: it.name }),
        el('td', { text: it.category }),
        el('td', { text: it.price === null ? '—' : it.price + ' gp' }),
        el('td', {}, [sel]),
        el('td', { text: it.source || '' }),
        el('td', {}, [
          el('button', {
            class: 'btn btn-sm btn-danger', text: '×', title: 'Slet item',
            onclick: function () {
              state.items = state.items.filter(function (x) { return x !== it; });
              renderItems(); persist();
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

  $('#itemSearch').addEventListener('input', function () { state.page = 0; renderItems(); });
  $('#itemCatFilter').addEventListener('change', function () { state.page = 0; renderItems(); });
  $('#itemRarFilter').addEventListener('change', function () { state.page = 0; renderItems(); });

  /* ================= INDSTILLINGER ================= */

  function renderThresholds() {
    var host = $('#thresholds');
    host.innerHTML = '';
    C.RARITIES.forEach(function (r) {
      var row = null;
      state.cfg.thresholds.forEach(function (t) { if (t.r === r.key) row = t; });
      if (!row) { row = { r: r.key, min: 0 }; state.cfg.thresholds.push(row); }
      host.appendChild(el('div', { class: 'thresh-row' }, [
        el('label', {}, [
          el('i', { class: 'dot', style: 'background:var(--r-' + r.key + ')' }),
          document.createTextNode(' ' + r.label)
        ]),
        el('span', { class: 'hint', text: 'fra' }),
        el('input', {
          type: 'number', min: '0', step: '1', value: row.min,
          oninput: function () { row.min = Number(this.value) || 0; persist(); }
        }),
        el('span', { class: 'hint', text: 'gp' })
      ]));
    });
  }

  $('#btnRecalc').addEventListener('click', function () {
    C.recalcRarities(state.items, state.cfg.thresholds);
    renderItems(); persist();
    toast('Rarities genberegnet (manuelt satte items er urørt)');
  });

  $('#optNoDupes').addEventListener('change', function () {
    state.cfg.noDuplicates = this.checked; persist();
  });
  $('#optFallback').addEventListener('change', function () {
    state.cfg.fallback = this.value; persist();
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
      } catch (e) {
        toast('Kunne ikke læse filen: ' + e.message);
      }
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
    renderThresholds();
    renderPackList();
    renderPackDetail();
    renderGenControls();
    renderItems();
    renderResults();
  }

  renderAll();

  if (!C.storage.available()) {
    $('#saveState').textContent = 'Kan ikke gemme i denne browser';
    toast('Browseren tillader ikke lokal lagring — brug eksport/import i stedet.');
  }
})();
