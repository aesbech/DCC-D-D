/* DCC-D-D — etagegenerator i browseren.
 *
 * Porteret fra tools/dungeon.pl, som er donjons Random Dungeon Generator af
 * drow (donjon.bin.sh), brugt under Creative Commons BY-NC 3.0. Geometrien —
 * rum, gange, døre, blindgyder — er drows; tilføjelserne om indgang, bossrum,
 * safe room og XP er DCC-D-D's og er markeret som sådan.
 *
 * To forskelle fra Perl-udgaven, som er værd at kende:
 *
 *   Kortet tegnes som SVG i stedet for en GIF, så det er skarpt på papir og
 *   kan printes direkte fra siden.
 *
 *   Terningen er en anden. Perl og JavaScript har hver sin rand(), så det
 *   samme seed giver ikke det samme kort de to steder. Inden for hver af dem
 *   er et seed til gengæld fuldstændig gentageligt.
 */
(function (global) {
  'use strict';

  /* ---------- terning ---------- */

  /* mulberry32: lille, hurtig, og god nok til et dungeon. Det vigtige er at
     den er deterministisk, så et seed kan skrives på printet og bruges igen. */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ---------- feltets bits ---------- */

  var NOTHING   = 0x00000000;
  var BLOCKED   = 0x00000001;
  var ROOM      = 0x00000002;
  var CORRIDOR  = 0x00000004;
  var PERIMETER = 0x00000010;
  var ENTRANCE  = 0x00000020;
  var ROOM_ID   = 0x0000FFC0;

  var ARCH      = 0x00010000;
  var DOOR      = 0x00020000;
  var LOCKED    = 0x00040000;
  var TRAPPED   = 0x00080000;
  var SECRET    = 0x00100000;
  var PORTC     = 0x00200000;
  var STAIR_DN  = 0x00400000;
  var STAIR_UP  = 0x00800000;

  var OPENSPACE = ROOM | CORRIDOR;
  var DOORSPACE = ARCH | DOOR | LOCKED | TRAPPED | SECRET | PORTC;
  var ESPACE    = ENTRANCE | DOORSPACE;
  var STAIRS    = STAIR_DN | STAIR_UP;
  var BLOCK_CORR = BLOCKED | PERIMETER | CORRIDOR;
  var BLOCK_DOOR = BLOCKED | DOORSPACE;

  /* ---------- retninger ---------- */

  var di = { north: -1, south: 1, west: 0, east: 0 };
  var dj = { north: 0, south: 0, west: -1, east: 1 };
  var DIRS = ['east', 'north', 'south', 'west'];
  var opposite = { north: 'south', south: 'north', west: 'east', east: 'west' };

  var stairEnd = {
    north: { walled: [[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1]],
             corridor: [[0,0],[1,0],[2,0]], next: [1,0] },
    south: { walled: [[-1,-1],[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1]],
             corridor: [[0,0],[-1,0],[-2,0]], next: [-1,0] },
    west:  { walled: [[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1],[1,0],[1,1]],
             corridor: [[0,0],[0,1],[0,2]], next: [0,1] },
    east:  { walled: [[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1]],
             corridor: [[0,0],[0,-1],[0,-2]], next: [0,-1] }
  };

  var closeEnd = {
    north: { walled: [[0,-1],[1,-1],[1,0],[1,1],[0,1]], close: [[0,0]], recurse: [-1,0] },
    south: { walled: [[0,-1],[-1,-1],[-1,0],[-1,1],[0,1]], close: [[0,0]], recurse: [1,0] },
    west:  { walled: [[-1,0],[-1,1],[0,1],[1,1],[1,0]], close: [[0,0]], recurse: [0,-1] },
    east:  { walled: [[-1,0],[-1,-1],[0,-1],[1,-1],[1,0]], close: [[0,0]], recurse: [0,1] }
  };

  var CORRIDOR_LAYOUT = { Labyrinth: 0, Bent: 50, Straight: 100 };
  var DUNGEON_LAYOUT = {
    Box:   [[1,1,1],[1,0,1],[1,1,1]],
    Cross: [[0,1,0],[1,1,1],[0,1,0]]
  };

  /* ---------- D&D-tabeller ---------- */

  /* XP der skal til for at stige ét level, pr. karakter. */
  var XP_TO_NEXT = {
    1: 300, 2: 600, 3: 1800, 4: 3800, 5: 7500, 6: 9000, 7: 11000, 8: 14000,
    9: 16000, 10: 21000, 11: 15000, 12: 20000, 13: 20000, 14: 25000,
    15: 30000, 16: 30000, 17: 40000, 18: 40000, 19: 50000
  };

  /* Budget for én kamp, pr. karakter. D&D 2024. */
  var ENCOUNTER = {
    1: [50,75,100], 2: [100,150,200], 3: [150,225,400], 4: [250,375,500],
    5: [500,750,1100], 6: [600,1000,1400], 7: [750,1300,1700],
    8: [1000,1700,2100], 9: [1300,2000,2600], 10: [1600,2300,3100],
    11: [1900,2900,4100], 12: [2200,3700,4700], 13: [2600,4200,5400],
    14: [2900,4900,6200], 15: [3300,5400,7800], 16: [3800,6100,9800],
    17: [4500,7200,11700], 18: [5000,8700,14200], 19: [5500,10700,17200],
    20: [6400,13200,22000]
  };
  var TIER = { low: 0, moderate: 1, high: 2 };

  /* ---------- generering ---------- */

  function defaults() {
    return {
      seed: Math.floor(Math.random() * 1e9),
      /* donjons standard er 39 × 39, spredte rum og halvdelen af blindgyderne
         tilbage. Det giver en etage hvor 59 % af det åbne areal er gang, og
         hvor holdet bruger aftenen på at gå. Her ligger rummene tæt og alle
         blindgyder er væk: 13 % gang, og tre gange så mange rum. */
      n_rows: 31, n_cols: 31,
      dungeon_layout: 'None',
      room_min: 3, room_max: 9,
      room_layout: 'Packed',
      corridor_layout: 'Bent',
      remove_deadends: 100,
      party_size: 4, party_level: 1,
      xp_slack: 1.5,
      boss_fight: 'high', room_cap: 'high',
      /* Hvor stor en del af rummene der har noget i sig, og hvor mange af dem
         der er fælder frem for monstre. En fælde koster ikke XP, så en høj
         fældeandel presser budgettet sammen i færre kamprum. */
      saturation: 45, trap_share: 25,
      boss_rooms: 1, safe_rooms: 1
    };
  }

  /* Kan budgettet ikke ligge i rummene uden at bryde loftet, mangler der rum.
     Så laves etagen om med flere rumforsøg. Hjælper det ikke — fordi de nye
     forsøg lander oven i de rum der allerede står — bliver gitteret større.
     Loftet er der, fordi et krav kan være umuligt: beder man om ét level pr.
     etage på level 4, skal der over ti High-kampe til, og på et tidspunkt er
     svaret at sænke slack og ikke at blive ved med at vokse. */
  var MAX_PASSES = 24;
  var GRID_STEP = 6;
  var GRID_MIN = 15;
  var GRID_MAX = 61;

  /* Rum pr. felt i anden. Målt over 40 etager pr. punkt, på gitre fra 14 til
     60 felter: forholdet er stabilt, fordi rummene fylder arealet ud, så
     antallet vokser med kvadratet på gitterets side. Tallene er målte, ikke
     udledte — donjons rumplacering har ingen formel man kan vende om. */
  var ROOM_DENSITY = {
    Packed:    { 5: 0.0360, 7: 0.0275, 9: 0.0213 },
    Scattered: { 5: 0.0160, 7: 0.0093, 9: 0.0060 }
  };

  /* Hvor mange rum etagen skal have, regnet baglæns fra det den skal rumme.
     Etagens størrelse er ikke et valg man træffer; den følger af alt det
     andet. Vil man have en stor etage, skal man bede om lav mætning eller
     mange fælder — ikke om flere felter. */
  function planRooms(o) {
    var level = Math.max(1, Math.min(20, +o.party_level));
    var size = Math.max(1, +o.party_size);
    var need = XP_TO_NEXT[level < 20 ? level : 19];
    var floorXp = Math.round(need * size * o.xp_slack);
    var cap = ENCOUNTER[level][TIER[o.room_cap]] * size;
    var minXp = ENCOUNTER[level][0] * size;

    var nBoss = Math.max(1, Math.min(8, Math.round(+o.boss_rooms || 1)));
    var nSafe = Math.max(0, Math.min(8, Math.round(
      o.safe_rooms === undefined ? 1 : +o.safe_rooms)));

    var bossXp = Math.min(ENCOUNTER[level][TIER[o.boss_fight]] * size, floorXp);
    var rest = Math.max(0, floorXp - Math.min(nBoss * bossXp, floorXp));

    /* Kamprum nok til at hver kamp er lidt over en Low — ellers bliver de alle
       ens — og nok til at budgettet kan ligge under loftet. */
    var fights = rest > 0
      ? Math.max(Math.max(1, Math.floor(rest / (minXp * 1.25))), Math.ceil(rest / cap))
      : 0;

    var sat = clampPct(o.saturation, 45) / 100;
    var trapPct = clampPct(o.trap_share, 25) / 100;

    /* Fælderne koster ikke XP, så de lægges oveni kamprummene. Og mætningen
       siger hvor stor en del af rummene der overhovedet har noget i sig, så
       resten er tomme rum der skal være der for at procenten passer. */
    var content = (trapPct >= 0.95) ? fights + 1
      : Math.ceil(fights / (1 - trapPct));
    var eligible = sat > 0 ? Math.ceil(content / sat) : content;

    return {
      rooms: Math.max(nBoss + nSafe + 1, eligible + nBoss + nSafe),
      fights: fights, content: content
    };
  }

  function gridFor(target, o) {
    var table = ROOM_DENSITY[o.room_layout] || ROOM_DENSITY.Packed;
    var rm = null;
    Object.keys(table).forEach(function (key) {
      if (rm === null || Math.abs(key - o.room_max) < Math.abs(rm - o.room_max)) rm = +key;
    });
    var g = Math.round(Math.sqrt(target / table[rm])) | 1;   // ulige
    return Math.max(GRID_MIN, Math.min(GRID_MAX, g));
  }

  function create(opts) {
    var base = {}, k;
    var def = defaults();
    for (k in def) base[k] = def[k];
    for (k in (opts || {})) if (opts[k] !== undefined && opts[k] !== '') base[k] = opts[k];

    /* Gitteret regnes ud, medmindre nogen beder om et bestemt. Perl-udgaven og
       testene sætter det; siden gør ikke. */
    var asked = !!(opts && opts.n_rows);
    var plan = planRooms(base);
    var rows = asked ? base.n_rows : gridFor(plan.rooms, base);
    var cols = rows;
    var tries = 0;                     // 0 = donjons egen brøk
    var d, best = null, pass, grew = 0;

    for (pass = 0; pass < MAX_PASSES; pass++) {
      d = build(base, rows, cols, tries);
      if (!best || score(d) > score(best)) best = d;
      if (good(d)) break;

      /* Mangler der plads til budgettet, og er det rummene der holder igen,
         vokser etagen. Er det mætningen, hjælper flere rum ikke — der ville
         bare komme flere tomme — men de andre krav kan stadig nås med en
         anden etage, så der rulles om. */
      if (d.xp.short && d.xp.room_bound && rows < GRID_MAX) {
        rows = cols = Math.min(GRID_MAX, rows + GRID_STEP);
        grew++;
        tries = 0;
      }
      tries = tries
        ? tries + Math.max(4, Math.ceil(tries * 0.5))
        : roomTries(rows, cols, base.room_max) + 4;
    }

    best.fit = {
      passes: Math.min(pass + 1, MAX_PASSES),
      grew: grew,
      rows: best.n_rows, cols: best.n_cols,
      auto: !asked,
      planned: plan.rooms,
      rooms: best.n_rooms
    };
    return best;
  }

  /* En etage duer, når man kan komme igennem den, der er et hvilested nær
     indgangen, og budgettet ligger i rummene. */
  function good(d) {
    return d.reachable && d.near_entrance && !d.xp.short;
  }

  /* Et hvilested ved selve trappen er et ønske, ikke en lov. Om det kan lade
     sig gøre afhænger af hvad der ligger for enden af gangen fra trappen: er
     det eneste rum dér porten til resten af etagen, kan det ikke lukkes ned
     til én dør uden at spærre alt. Derfor tæller det i score() og får løkken
     til at prøve igen — men det stopper ikke en etage der ellers er god. */

  function roomTries(rows, cols, roomMax) {
    return Math.floor((rows * cols) / (roomMax * roomMax));
  }

  /* En etage man kan komme igennem slår alt andet; derefter tæller det hvor
     meget af budgettet der mangler. */
  /* Rangordnet efter hvad der betyder mest: en etage man kan komme igennem,
     så et hvilested nær indgangen, og til sidst hvor meget af budgettet der
     mangler. Den bedste af forsøgene vinder, hvis ingen af dem er perfekt. */
  function score(d) {
    return (d.reachable ? 4e9 : 0) + (d.near_entrance ? 2e9 : 0) - d.xp.short;
  }

  function build(base, rows, cols, tries) {
    var d = {}, k;
    for (k in base) d[k] = base[k];
    d.n_rows = rows;
    d.n_cols = cols;
    d.room_tries = tries;

    d.rand = rng(d.seed);
    d.n_i = Math.floor(d.n_rows / 2);
    d.n_j = Math.floor(d.n_cols / 2);
    d.n_rows = d.n_i * 2;
    d.n_cols = d.n_j * 2;
    d.max_row = d.n_rows - 1;
    d.max_col = d.n_cols - 1;
    d.n_rooms = 0;
    d.room = [null];
    d.door = [];
    d.stair = [];
    d.room_base = Math.floor((d.room_min + 1) / 2);
    d.room_radix = Math.floor((d.room_max - d.room_min) / 2) + 1;

    initCells(d);
    emplaceRooms(d);
    openRooms(d);
    corridors(d);
    dccEntrance(d);
    cleanDungeon(d);
    dccPrune(d);
    dccBossExit(d);
    dccSafeRoom(d);
    /* Efter safe roomet: tilmuringen dér kan fjerne en af bossens døre, og så
       skulle den alligevel rulles om. */
    dccBossDoors(d);
    dccDistances(d);
    dccXp(d);
    return d;
  }

  function initCells(d) {
    var r, c;
    d.cell = [];
    for (r = 0; r <= d.n_rows; r++) {
      d.cell[r] = [];
      for (c = 0; c <= d.n_cols; c++) d.cell[r][c] = NOTHING;
    }
    var mask = DUNGEON_LAYOUT[d.dungeon_layout];
    if (mask) {
      var rx = mask.length / (d.n_rows + 1);
      var cx = mask[0].length / (d.n_cols + 1);
      for (r = 0; r <= d.n_rows; r++)
        for (c = 0; c <= d.n_cols; c++)
          if (!mask[Math.floor(r * rx)][Math.floor(c * cx)]) d.cell[r][c] = BLOCKED;
    } else if (d.dungeon_layout === 'Round') {
      var cr = Math.floor(d.n_rows / 2), cc = Math.floor(d.n_cols / 2);
      for (r = 0; r <= d.n_rows; r++)
        for (c = 0; c <= d.n_cols; c++)
          if (Math.sqrt(Math.pow(r - cr, 2) + Math.pow(c - cc, 2)) > cc)
            d.cell[r][c] = BLOCKED;
    }
  }

  function emplaceRooms(d) {
    var i, j;
    if (d.room_layout === 'Packed') {
      for (i = 0; i < d.n_i; i++) {
        for (j = 0; j < d.n_j; j++) {
          if (d.cell[i * 2 + 1][j * 2 + 1] & ROOM) continue;
          if ((i === 0 || j === 0) && Math.floor(d.rand() * 2)) continue;
          emplaceRoom(d, { i: i, j: j });
        }
      }
    } else {
      /* Antallet er forsøg, ikke rum: et rum der kolliderer med et andet
         bliver droppet. Derfor kan create() skrue op uden at det er sikkert
         at der kommer flere ud af det — og det er netop det, den måler på. */
      var n = d.room_tries || roomTries(d.n_rows, d.n_cols, d.room_max);
      for (i = 0; i < n; i++) emplaceRoom(d, null);
    }
  }

  function setRoom(d, p) {
    p = p || {};
    var base = d.room_base, radix = d.room_radix, a, r;
    if (p.height === undefined) {
      if (p.i !== undefined) {
        a = d.n_i - base - p.i; if (a < 0) a = 0;
        r = (a < radix) ? a : radix;
        p.height = Math.floor(d.rand() * r) + base;
      } else p.height = Math.floor(d.rand() * radix) + base;
    }
    if (p.width === undefined) {
      if (p.j !== undefined) {
        a = d.n_j - base - p.j; if (a < 0) a = 0;
        r = (a < radix) ? a : radix;
        p.width = Math.floor(d.rand() * r) + base;
      } else p.width = Math.floor(d.rand() * radix) + base;
    }
    if (p.i === undefined) p.i = Math.floor(d.rand() * (d.n_i - p.height));
    if (p.j === undefined) p.j = Math.floor(d.rand() * (d.n_j - p.width));
    return p;
  }

  function soundRoom(d, r1, c1, r2, c2) {
    var hit = {}, r, c;
    for (r = r1; r <= r2; r++) {
      for (c = c1; c <= c2; c++) {
        if (d.cell[r][c] & BLOCKED) return { blocked: 1 };
        if (d.cell[r][c] & ROOM) {
          var id = (d.cell[r][c] & ROOM_ID) >> 6;
          hit[id] = (hit[id] || 0) + 1;
        }
      }
    }
    return hit;
  }

  function emplaceRoom(d, proto) {
    if (d.n_rooms === 999) return;
    proto = setRoom(d, proto);
    var r1 = proto.i * 2 + 1, c1 = proto.j * 2 + 1;
    var r2 = (proto.i + proto.height) * 2 - 1;
    var c2 = (proto.j + proto.width) * 2 - 1;
    if (r1 < 1 || r2 > d.max_row) return;
    if (c1 < 1 || c2 > d.max_col) return;

    var hit = soundRoom(d, r1, c1, r2, c2);
    if (hit.blocked) return;
    if (Object.keys(hit).length !== 0) return;

    var id = ++d.n_rooms, r, c;
    for (r = r1; r <= r2; r++) {
      for (c = c1; c <= c2; c++) {
        if (d.cell[r][c] & ENTRANCE) d.cell[r][c] &= ~ESPACE;
        else if (d.cell[r][c] & PERIMETER) d.cell[r][c] &= ~PERIMETER;
        d.cell[r][c] |= ROOM | (id << 6);
      }
    }
    d.room[id] = {
      id: id, row: r1, col: c1,
      north: r1, south: r2, west: c1, east: c2,
      height: (r2 - r1 + 1), width: (c2 - c1 + 1),
      area: (r2 - r1 + 1) * (c2 - c1 + 1),
      door: {}
    };
    for (r = r1 - 1; r <= r2 + 1; r++) {
      if (!(d.cell[r][c1 - 1] & (ROOM | ENTRANCE))) d.cell[r][c1 - 1] |= PERIMETER;
      if (!(d.cell[r][c2 + 1] & (ROOM | ENTRANCE))) d.cell[r][c2 + 1] |= PERIMETER;
    }
    for (c = c1 - 1; c <= c2 + 1; c++) {
      if (!(d.cell[r1 - 1][c] & (ROOM | ENTRANCE))) d.cell[r1 - 1][c] |= PERIMETER;
      if (!(d.cell[r2 + 1][c] & (ROOM | ENTRANCE))) d.cell[r2 + 1][c] |= PERIMETER;
    }
  }

  function shuffle(d, list) {
    var i, j, t;
    for (i = list.length - 1; i > 0; i--) {
      j = Math.floor(d.rand() * (i + 1));
      t = list[i]; list[i] = list[j]; list[j] = t;
    }
    return list;
  }

  function checkSill(d, room, sr, sc, dir) {
    var dr = sr + di[dir], dc = sc + dj[dir];
    var cell = d.cell[dr][dc];
    if (!(cell & PERIMETER)) return null;
    if (cell & BLOCK_DOOR) return null;
    var or_ = dr + di[dir], oc = dc + dj[dir];
    var out = d.cell[or_][oc];
    if (out & BLOCKED) return null;
    var outId = null;
    if (out & ROOM) {
      outId = (out & ROOM_ID) >> 6;
      if (outId === room.id) return null;
    }
    return { sill_r: sr, sill_c: sc, dir: dir, door_r: dr, door_c: dc, out_id: outId };
  }

  function doorSills(d, room) {
    var list = [], r, c, s;
    if (room.north >= 3)
      for (c = room.west; c <= room.east; c += 2) {
        s = checkSill(d, room, room.north, c, 'north'); if (s) list.push(s);
      }
    if (room.south <= d.n_rows - 3)
      for (c = room.west; c <= room.east; c += 2) {
        s = checkSill(d, room, room.south, c, 'south'); if (s) list.push(s);
      }
    if (room.west >= 3)
      for (r = room.north; r <= room.south; r += 2) {
        s = checkSill(d, room, r, room.west, 'west'); if (s) list.push(s);
      }
    if (room.east <= d.n_cols - 3)
      for (r = room.north; r <= room.south; r += 2) {
        s = checkSill(d, room, r, room.east, 'east'); if (s) list.push(s);
      }
    return shuffle(d, list);
  }

  function doorType(d) {
    var i = Math.floor(d.rand() * 110);
    if (i < 15) return ARCH;
    if (i < 60) return DOOR;
    if (i < 75) return LOCKED;
    if (i < 90) return TRAPPED;
    if (i < 100) return SECRET;
    return PORTC;
  }

  var DOOR_KIND = {};
  DOOR_KIND[ARCH]    = { key: 'arch',   type: 'Åben portal' };
  DOOR_KIND[DOOR]    = { key: 'open',   type: 'Ulåst dør' };
  DOOR_KIND[LOCKED]  = { key: 'lock',   type: 'Låst dør' };
  DOOR_KIND[TRAPPED] = { key: 'trap',   type: 'Fældedør' };
  DOOR_KIND[SECRET]  = { key: 'secret', type: 'Hemmelig dør' };
  DOOR_KIND[PORTC]   = { key: 'portc',  type: 'Faldgitter' };

  function openRoom(d, room) {
    var list = doorSills(d, room);
    if (!list.length) return;
    var h = room.height, w = room.width;
    var flumph = Math.floor(Math.sqrt(((w + 1) / 2) * ((h + 1) / 2)));
    var nOpens = flumph + Math.floor(d.rand() * Math.max(1, flumph));
    var connect = d.connect || (d.connect = {});

    for (var i = 0; i < nOpens; i++) {
      if (!list.length) break;
      var sill = list.splice(Math.floor(d.rand() * list.length), 1)[0];
      if (!sill) break;
      var dr = sill.door_r, dc = sill.door_c;
      if (d.cell[dr][dc] & DOORSPACE) continue;
      if (sill.out_id) {
        var key = [room.id, sill.out_id].sort(function (a, b) { return a - b; }).join(',');
        if (connect[key]) continue;
        connect[key] = 1;
      }
      for (var x = 0; x < 3; x++) {
        var rr = sill.sill_r + di[sill.dir] * x;
        var cc = sill.sill_c + dj[sill.dir] * x;
        d.cell[rr][cc] &= ~PERIMETER;
        d.cell[rr][cc] |= ENTRANCE;
      }
      var t = doorType(d);
      d.cell[dr][dc] |= t;
      var door = { row: dr, col: dc, key: DOOR_KIND[t].key, type: DOOR_KIND[t].type };
      if (sill.out_id) door.out_id = sill.out_id;
      (room.door[sill.dir] || (room.door[sill.dir] = [])).push(door);
    }
  }

  function openRooms(d) {
    for (var id = 1; id <= d.n_rooms; id++) openRoom(d, d.room[id]);
    delete d.connect;
  }

  function soundTunnel(d, mr, mc, nr, nc) {
    if (nr < 0 || nr > d.n_rows) return false;
    if (nc < 0 || nc > d.n_cols) return false;
    var r1 = Math.min(mr, nr), r2 = Math.max(mr, nr);
    var c1 = Math.min(mc, nc), c2 = Math.max(mc, nc);
    for (var r = r1; r <= r2; r++)
      for (var c = c1; c <= c2; c++)
        if (d.cell[r][c] & BLOCK_CORR) return false;
    return true;
  }

  function delveTunnel(d, tr, tc, nr, nc) {
    var r1 = Math.min(tr, nr), r2 = Math.max(tr, nr);
    var c1 = Math.min(tc, nc), c2 = Math.max(tc, nc);
    for (var r = r1; r <= r2; r++)
      for (var c = c1; c <= c2; c++) {
        d.cell[r][c] &= ~ENTRANCE;
        d.cell[r][c] |= CORRIDOR;
      }
    return true;
  }

  function openTunnel(d, i, j, dir) {
    var tr = i * 2 + 1, tc = j * 2 + 1;
    var nr = (i + di[dir]) * 2 + 1, nc = (j + dj[dir]) * 2 + 1;
    var mr = (tr + nr) / 2, mc = (tc + nc) / 2;
    if (soundTunnel(d, mr, mc, nr, nc)) return delveTunnel(d, tr, tc, nr, nc);
    return false;
  }

  function tunnelDirs(d, last) {
    var p = CORRIDOR_LAYOUT[d.corridor_layout];
    var dirs = shuffle(d, DIRS.slice());
    if (last && p && Math.floor(d.rand() * 100) < p) dirs.unshift(last);
    return dirs;
  }

  /* Iterativ i stedet for rekursiv: en 38x38-etage kan nå dybt nok til at
     sprænge stakken i nogle browsere. */
  function tunnel(d, i0, j0) {
    var stack = [[i0, j0, null]];
    while (stack.length) {
      var node = stack.pop();
      var dirs = tunnelDirs(d, node[2]);
      for (var k = 0; k < dirs.length; k++) {
        if (openTunnel(d, node[0], node[1], dirs[k])) {
          stack.push([node[0] + di[dirs[k]], node[1] + dj[dirs[k]], dirs[k]]);
        }
      }
    }
  }

  function corridors(d) {
    for (var i = 1; i < d.n_i; i++)
      for (var j = 1; j < d.n_j; j++) {
        if (d.cell[i * 2 + 1][j * 2 + 1] & CORRIDOR) continue;
        tunnel(d, i, j);
      }
  }

  function checkTunnel(d, r, c, chk) {
    var p, i;
    if (chk.corridor)
      for (i = 0; i < chk.corridor.length; i++) {
        p = chk.corridor[i];
        if (d.cell[r + p[0]][c + p[1]] !== CORRIDOR) return false;
      }
    if (chk.walled)
      for (i = 0; i < chk.walled.length; i++) {
        p = chk.walled[i];
        var row = d.cell[r + p[0]];
        if (row && (row[c + p[1]] & OPENSPACE)) return false;
      }
    return true;
  }

  function stairEnds(d) {
    var list = [];
    for (var i = 0; i < d.n_i; i++) {
      var r = i * 2 + 1;
      for (var j = 0; j < d.n_j; j++) {
        var c = j * 2 + 1;
        if (d.cell[r][c] !== CORRIDOR) continue;
        for (var k = 0; k < DIRS.length; k++) {
          var dir = DIRS[k];
          if (checkTunnel(d, r, c, stairEnd[dir])) {
            var n = stairEnd[dir].next;
            list.push({ row: r, col: c, next_row: r + n[0], next_col: c + n[1] });
            break;
          }
        }
      }
    }
    return list;
  }

  function collapse(d, r, c) {
    if (!(d.cell[r][c] & OPENSPACE)) return;
    for (var k = 0; k < DIRS.length; k++) {
      var xc = closeEnd[DIRS[k]];
      if (!checkTunnel(d, r, c, xc)) continue;

      /* En trappe må ikke mures inde. cleanDungeon springer selv over felter
         med trapper, men collapse spiser videre ind i naboerne, og indgangen
         ligger netop for enden af en blindgyde — den sad tilbage som et felt
         uden vej til, og alt derefter så etagen som uopnåelig. */
      var i, p, keep = false;
      for (i = 0; i < xc.close.length && !keep; i++) {
        p = xc.close[i];
        if (d.cell[r + p[0]][c + p[1]] & STAIRS) keep = true;
      }
      if (keep) continue;

      for (i = 0; i < xc.close.length; i++) {
        p = xc.close[i];
        d.cell[r + p[0]][c + p[1]] = NOTHING;
      }
      if (xc.recurse) collapse(d, r + xc.recurse[0], c + xc.recurse[1]);
    }
  }

  function cleanDungeon(d) {
    var p = d.remove_deadends, all = (p === 100), i, j;
    if (p) {
      for (i = 0; i < d.n_i; i++) {
        var r = i * 2 + 1;
        for (j = 0; j < d.n_j; j++) {
          var c = j * 2 + 1;
          if (!(d.cell[r][c] & OPENSPACE)) continue;
          if (d.cell[r][c] & STAIRS) continue;
          if (!(all || Math.floor(d.rand() * 100) < p)) continue;
          collapse(d, r, c);
        }
      }
    }
    fixDoors(d);
    for (var rr = 0; rr <= d.n_rows; rr++)
      for (var cc = 0; cc <= d.n_cols; cc++)
        if (d.cell[rr][cc] & BLOCKED) d.cell[rr][cc] = NOTHING;
  }

  function fixDoors(d) {
    var fixed = {};
    d.door = [];
    for (var id = 1; id <= d.n_rooms; id++) {
      var room = d.room[id];
      if (!room) continue;
      Object.keys(room.door).forEach(function (dir) {
        var shiny = [];
        room.door[dir].forEach(function (door) {
          if (!(d.cell[door.row][door.col] & OPENSPACE)) return;
          var key = door.row + ',' + door.col;
          if (!fixed[key]) {
            if (door.out_id && d.room[door.out_id]) {
              var out = d.room[door.out_id].door;
              var od = opposite[dir];
              (out[od] || (out[od] = [])).push(door);
            }
            fixed[key] = 1;
          }
          shiny.push(door);
        });
        if (shiny.length) { room.door[dir] = shiny; d.door = d.door.concat(shiny); }
        else delete room.door[dir];
      });
    }
    /* d.door kan nu rumme den samme dør to gange, én pr. rum. Tegn hver én gang. */
    var seen = {};
    d.door = d.door.filter(function (x) {
      var k = x.row + ',' + x.col;
      if (seen[k]) return false;
      seen[k] = 1; return true;
    });
  }

  /* ---------- DCC-D-D ---------- */

  function dccEntrance(d) {
    var list = stairEnds(d);
    /* Normalt står indgangen for enden af en blindgyde. Skal den flyttes,
       fordi den lå i en lomme der blev skåret væk, er blindgyderne som regel
       allerede ryddet — så tages det mest lukkede felt der er tilbage. En
       trappe midt i en gang er ikke så pæn, men den virker. */
    if (!list.length) list = enclosedCells(d);
    if (!list.length) return;
    var s = pickEntrance(d, list);
    d.cell[s.row][s.col] |= STAIR_UP;
    s.key = 'up';
    d.stair.push(s);
    d.entrance = s;
  }

  /* Skridt gennem åbne felter. `avoid` er et rum eller en liste af rum man
     ikke må gå igennem — bruges til at finde ud af, hvad der kun kan nås ved
     at gå gennem bosserne. */
  /* donjon lover ikke at hele etagen hænger sammen. Der kan ligge lommer uden
     vej til — rum og gange man aldrig kan nå. Før blev etagen kasseret og
     lavet om, men det er at smide en god etage væk på grund af et hjørne.
     Lommerne skæres i stedet bort: de bliver til klippe, og de rum der lå i
     dem findes ikke længere. Bagefter er alt på kortet noget man kan gå hen
     til, og bosser, safe rooms og XP ser kun det der er tilbage. */
  function dccPrune(d) {
    var seen = {}, comps = [], r, c;

    for (r = 0; r <= d.n_rows; r++)
      for (c = 0; c <= d.n_cols; c++) {
        if (!(d.cell[r][c] & OPENSPACE)) continue;
        if (seen[r + ',' + c]) continue;
        var dist = dccBfs(d, r, c), cells = Object.keys(dist);
        cells.forEach(function (k) { seen[k] = 1; });
        comps.push(cells);
      }
    if (comps.length < 2) return;

    /* Den største del er etagen; resten er lommer. Det er ikke nok at beholde
       den del indgangen ligger i — indgangen kan selv ligge i en lille lomme,
       og så ville alt det rigtige blive skåret væk. */
    var keep = comps[0];
    comps.forEach(function (x) { if (x.length > keep.length) keep = x; });
    var keepSet = {};
    keep.forEach(function (k) { keepSet[k] = 1; });

    var cut = 0;
    for (r = 0; r <= d.n_rows; r++)
      for (c = 0; c <= d.n_cols; c++) {
        if (!(d.cell[r][c] & OPENSPACE)) continue;
        if (keepSet[r + ',' + c]) continue;
        if (d.cell[r][c] & DOORSPACE) forgetDoor(d, r, c);
        d.cell[r][c] = NOTHING;
        cut++;
      }
    if (!cut) return;
    d.pruned = cut;

    for (var id = 1; id <= d.n_rooms; id++) {
      var room = d.room[id];
      if (!room) continue;
      var alive = false;
      for (r = room.north; r <= room.south && !alive; r++)
        for (c = room.west; c <= room.east && !alive; c++)
          if (d.cell[r][c] & OPENSPACE) alive = true;
      if (!alive) d.room[id] = null;
    }

    /* Lå indgangen i en af lommerne, er den væk nu, og der skal findes en ny
       blandt det der er tilbage. */
    if (d.entrance && !keepSet[d.entrance.row + ',' + d.entrance.col]) {
      var gone = d.entrance;
      d.stair = d.stair.filter(function (s) { return s !== gone; });
      d.entrance = null;
      dccEntrance(d);
    }
  }

  /* Hvilken blindgyde trappen står i, er ikke ligegyldigt. Safe roomet skal
     ligge for enden af en gang fra den — uden et rum imellem — og det rum skal
     kunne skæres ned til 3 × 3 med én dør uden at lukke etagen af. Et rum med
     mange døre er porten til resten af etagen og kan ikke lukkes.

     Så vælges trappen blandt de blindgyder der vender ud mod et rum med få
     døre. Det koster ingenting i spil hvilken blindgyde man kommer op ad, og
     det er forskellen på et hvilested ved indgangen og ingen. */
  var ENTRANCE_TRIES = 10;

  function pickEntrance(d, list) {
    var pool = shuffle(d, list.slice()).slice(0, ENTRANCE_TRIES);
    var best = null, bestScore = 1e9;

    for (var i = 0; i < pool.length; i++) {
      var touch = roomsOffCorridors(d, pool[i]).rooms;
      var low = 1e9;
      Object.keys(touch).forEach(function (id) {
        var room = d.room[+id];
        if (!room) return;
        if (room.width < 3 || room.height < 3) return;   // kan ikke rumme 3 × 3
        /* Dørantallet er ikke det der afgør det. Det der afgør det, er om
           etagen hænger sammen uden rummet: er det gennemgangen, kan det
           aldrig blive et safe room, uanset hvor få døre det har. */
        var n = standsAlone(d, room) ? 0 : 2;
        if (n < low) low = n;
      });
      if (low < bestScore) { bestScore = low; best = pool[i]; }
      if (bestScore === 0) break;
    }
    return best || pool[0];
  }

  /* Hænger etagen sammen, hvis rummet skæres ud af den? Er svaret nej, er
     rummet den eneste vej mellem to dele, og så kan det ikke lukkes ned til
     én dør. Det måles uden om indgangen, for det er netop indgangen vi er i
     gang med at vælge. */
  function standsAlone(d, room) {
    var start = null, total = 0, r, c;
    for (r = 0; r <= d.n_rows && !start; r++)
      for (c = 0; c <= d.n_cols && !start; c++) {
        if (!(d.cell[r][c] & OPENSPACE)) continue;
        if (r >= room.north && r <= room.south && c >= room.west && c <= room.east) continue;
        start = [r, c];
      }
    if (!start) return true;

    var dist = dccBfs(d, start[0], start[1], room);
    for (r = 0; r <= d.n_rows; r++)
      for (c = 0; c <= d.n_cols; c++) {
        if (!(d.cell[r][c] & OPENSPACE)) continue;
        if (r >= room.north && r <= room.south && c >= room.west && c <= room.east) continue;
        total++;
        if (dist[r + ',' + c] === undefined) return false;
      }
    return total > 0;
  }

  /* De felter med færrest åbne naboer, som noget man kan komme op ad. */
  function enclosedCells(d) {
    var best = 5, out = [];
    for (var r = 1; r < d.n_rows; r++)
      for (var c = 1; c < d.n_cols; c++) {
        if (!(d.cell[r][c] & OPENSPACE)) continue;
        if (d.cell[r][c] & DOORSPACE) continue;
        var n = 0, k, nr, nc;
        for (k = 0; k < DIRS.length; k++) {
          nr = r + di[DIRS[k]]; nc = c + dj[DIRS[k]];
          if (d.cell[nr] && (d.cell[nr][nc] & OPENSPACE)) n++;
        }
        if (!n) continue;
        if (n < best) { best = n; out = []; }
        if (n === best) {
          var dir = null;
          for (k = 0; k < DIRS.length && !dir; k++) {
            nr = r + di[DIRS[k]]; nc = c + dj[DIRS[k]];
            if (d.cell[nr] && (d.cell[nr][nc] & OPENSPACE)) dir = DIRS[k];
          }
          out.push({ row: r, col: c,
                     next_row: r + di[dir], next_col: c + dj[dir] });
        }
      }
    return out;
  }

  function dccBfs(d, r0, c0, avoid) {
    var dist = {}, queue = [[r0, c0]], head = 0;
    var box = !avoid ? [] : (avoid.length === undefined ? [avoid] : avoid);
    function blocked(r, c) {
      for (var i = 0; i < box.length; i++) {
        var a = box[i];
        if (a && r >= a.north && r <= a.south && c >= a.west && c <= a.east) return true;
      }
      return false;
    }
    if (blocked(r0, c0)) return dist;
    dist[r0 + ',' + c0] = 0;
    while (head < queue.length) {
      var node = queue[head++];
      var r = node[0], c = node[1];
      for (var k = 0; k < DIRS.length; k++) {
        var nr = r + di[DIRS[k]], nc = c + dj[DIRS[k]];
        if (nr < 0 || nr > d.n_rows || nc < 0 || nc > d.n_cols) continue;
        if (!(d.cell[nr][nc] & OPENSPACE)) continue;
        if (blocked(nr, nc)) continue;
        var key = nr + ',' + nc;
        if (dist[key] !== undefined) continue;
        dist[key] = dist[r + ',' + c] + 1;
        queue.push([nr, nc]);
      }
    }
    return dist;
  }

  function doorCells(room) {
    var out = [], seen = {};
    Object.keys(room.door).forEach(function (dir) {
      room.door[dir].forEach(function (x) {
        var k = x.row + ',' + x.col;
        if (seen[k]) return;
        seen[k] = 1; out.push([x.row, x.col]);
      });
    });
    return out;
  }

  /* Tæl kun døre hvis felt stadig er åbent, og hvert felt én gang. */
  function doorCount(d, room) {
    return doorCells(room).filter(function (p) {
      return d.cell[p[0]][p[1]] & OPENSPACE;
    }).length;
  }

  function roomDist(room, dist) {
    if (!dist) return 0;
    var r = Math.floor((room.north + room.south) / 2);
    var c = Math.floor((room.west + room.east) / 2);
    var v = dist[r + ',' + c];
    return (v === undefined) ? 0 : v;
  }

  /* Bossrummene: de rum der ligger længst fra indgangen, blandt dem med to
     døre. Skal der flere end ét, vælges de spredt — det næste er det der
     ligger længst fra dem der allerede er valgt, så to bosser ikke ender som
     naboer. Trappen ned står i det første, altså det fjerneste. */
  function dccBossExit(d) {
    /* Sættes først, så d.bosses altid er en liste. Optionen hedder
       boss_rooms og ikke bosses netop derfor: et tal og en liste under samme
       navn gav en etage hvor d.bosses stadig var tallet 1, hvis bossvalget
       faldt igennem. */
    d.bosses = [];
    var dist = d.entrance ? dccBfs(d, d.entrance.row, d.entrance.col) : null;
    var want = Math.max(1, Math.min(8, Math.round(+d.boss_rooms || 1)));
    var cand = [], fallback = null, id;

    /* Et bossrum må gerne være en blindgyde — det er faktisk det, det helst
       skal være. Før skulle det have mindst to døre, og så lå bossen midt i
       en gennemgang og spærrede for resten af etagen, hvis holdet ikke kunne
       klare den. Nu deles rummet i et forkammer og selve bossrummet, og det
       er forkammeret der har de mange døre. */
    for (id = 1; id <= d.n_rooms; id++) {
      var room = d.room[id];
      if (!room) continue;
      var doors = doorCount(d, room);
      if (!fallback || doors > doorCount(d, fallback)) fallback = room;
      if (!doors) continue;                     // helt afskåret
      cand.push({ room: room, dist: roomDist(room, dist),
                  split: Math.max(room.width, room.height) >= 5 });
    }
    if (!cand.length && fallback) cand.push({ room: fallback, dist: 0 });
    if (!cand.length) return;

    cand.sort(function (a, b) { return b.dist - a.dist || a.room.id - b.room.id; });

    /* Alle bosser skal ligge dybt. Spreder man dem ud over hele etagen, bliver
       nummer to det rum der ligger længst fra nummer ét — og det er tit lige
       inden for døren. Så vælges de blandt dem der ligger mindst to tredjedele
       så dybt som den dybeste, og spredningen sker inden for dem. */
    var deepest = cand[0].dist;
    var pool = cand.filter(function (c) { return c.dist >= deepest * 0.66; });
    while (pool.length < want && pool.length < cand.length) pool.push(cand[pool.length]);

    /* De rum der kan deles i et forkammer og et bossrum kommer forrest. Et
       bossrum skal helst være todelt, og det kræver at rummet er mindst fem
       felter langt den ene vej. */
    var wide = pool.filter(function (c) { return c.split; });
    if (wide.length) {
      pool = wide.concat(pool.filter(function (c) { return !c.split; }));
    }
    /* Hvert bossrum deles i to: et forkammer, holdet kommer ind i, og selve
       bossrummet bagved med én dør imellem. Så er bossen en blindgyde, og det
       er forkammeret der bærer de andre veje videre.

       Delingen afgør valget og ikke omvendt. Kan et rum ikke deles — det er
       for lille, eller det er selv etagens gennemgang, så dets øvrige døre
       ikke kan mures til uden at skære etagen over — lægges det til side, og
       det næste prøves. Netop det rum, der ikke kan lukkes ned til én dør, er
       jo det rum hvor en boss ville spærre for resten.

       Rækker de delelige ikke til, tages de henlagte alligevel: hellere et
       udelt bossrum end et bossrum for lidt. Arket siger hvilke der er delt. */
    var chosen = [], spare = [], tries = 0;

    while (chosen.length < want && pool.length && tries < BOSS_TRIES) {
      var bestI = 0;
      if (chosen.length) {
        var bestGap = -1;
        for (var i = 0; i < pool.length; i++) {
          var gap = 1e9;
          chosen.forEach(function (c) {
            var g = boxGap(pool[i].room, c.room);
            if (g < gap) gap = g;
          });
          if (gap > bestGap) { bestGap = gap; bestI = i; }
        }
      }
      var take = pool.splice(bestI, 1)[0];
      var got = splitBoss(d, take.room, dist);
      if (got) {
        take.id = got.boss; take.ante = got.ante;
        chosen.push(take);
      } else {
        spare.push(take);
        tries++;
      }
    }

    while (chosen.length < want && spare.length) {
      var rest = spare.shift();
      rest.id = rest.room.id; rest.ante = null;
      chosen.push(rest);
    }
    while (chosen.length < want && pool.length) {
      var last = pool.shift();
      last.id = last.room.id; last.ante = null;
      chosen.push(last);
    }
    if (!chosen.length) return;

    /* Delingen murede døre til, så afstandene skal måles igen, inden trapperne
       lægges i den ende der ligger længst inde. */
    dist = d.entrance ? dccBfs(d, d.entrance.row, d.entrance.col) : null;

    d.bosses = chosen.map(function (c) {
      var boss = d.room[c.id];
      return { id: c.id, ante: c.ante, doors: doorCount(d, boss),
               dist: Math.max(0, roomDist(boss, dist)), stairs: true };
    });
    d.boss = d.bosses[0];                 // den dybeste

    /* Hvert bossrum har sin egen trappe ned. Flere veje videre betyder at
       holdet kan vælge hvilken boss de vil slås med for at komme ned — og at
       en boss de ikke kan klare ikke spærrer hele etagen.

       Trappen står i den ende af rummet der ligger længst fra indgangen, så
       man skal tværs gennem bossrummet for at nå den. */
    d.bosses.forEach(function (entry) {
      var boss = d.room[entry.id];
      var sr = boss.north, sc = boss.west, best = -1;
      for (var r = boss.north; r <= boss.south; r++) {
        for (var c = boss.west; c <= boss.east; c++) {
          if (d.cell[r][c] & STAIRS) continue;
          var v = dist ? dist[r + ',' + c] : 0;
          v = (v === undefined) ? 0 : v;
          if (v > best) { sr = r; sc = c; best = v; }
        }
      }
      d.cell[sr][sc] |= STAIR_DN;
      d.stair.push({
        row: sr, col: sc,
        next_row: (sr > boss.north) ? sr - 1 : sr + 1, next_col: sc,
        key: 'down'
      });
      entry.exit = { row: sr, col: sc };
    });
    d.exit = d.bosses[0].exit;
  }

  /* ---------- bossrummets forkammer ----------
   *
   * Et bossrum skal være todelt: et forkammer man kommer ind i, og selve
   * bossrummet bagved med én dør imellem. Forkammeret må gerne have flere ind-
   * og udgange — det er meningen. Bossrummet har kun den ene, og er dermed en
   * blindgyde, så en boss holdet ikke kan klare aldrig spærrer for resten af
   * etagen.
   *
   * Rummet deles på langs med en væg, præcis som safe roomet kan deles. Væggen
   * skal ligge på et lige felt, for at begge dele bliver firkanter med ulige
   * sider — det er sådan donjons rum er skruet sammen — og den del der ligger
   * længst fra indgangen bliver bossens.
   */
  /* Hvor mange rum der må prøves forgæves, før et udelt bossrum er godt nok.
     Hvert forsøg koster en gennemgang af etagen pr. mulig væg, så det er ikke
     gratis — men over 700 etager er det tolvte forsøg aldrig blevet brugt. */
  var BOSS_TRIES = 12;

  function splitBoss(d, room, dist) {
    var plans = bossPlans(d, room, dist);
    for (var i = 0; i < plans.length; i++) {
      var got = tryBossSplit(d, room, plans[i]);
      if (got) return got;
    }
    return null;
  }

  function sliceBox(room, vertical, from, to) {
    return vertical
      ? { north: from, south: to, west: room.west, east: room.east }
      : { north: room.north, south: room.south, west: from, east: to };
  }

  /* Hvor langt er der ind til kassens nærmeste felt? Den af de to dele der
     ligger nærmest indgangen bliver forkammer. */
  function boxDist(box, dist) {
    if (!dist) return 0;
    var best = 1e9;
    for (var r = box.north; r <= box.south; r++)
      for (var c = box.west; c <= box.east; c++) {
        var v = dist[r + ',' + c];
        if (v !== undefined && v < best) best = v;
      }
    return best;
  }

  function bossPlans(d, room, dist) {
    var out = [];
    [true, false].forEach(function (vertical) {
      var len = vertical ? room.height : room.width;
      var lo = vertical ? room.north : room.west;
      if (len < 5) return;                      // der er ikke to dele i det

      for (var w = lo + 1; w <= lo + len - 2; w += 2) {
        var a = sliceBox(room, vertical, lo, w - 1);
        var b = sliceBox(room, vertical, w + 1, lo + len - 1);
        var first = boxDist(a, dist) <= boxDist(b, dist);
        var ante = first ? a : b, boss = first ? b : a;
        var anteLen = first ? w - lo : lo + len - 1 - w;
        var bossLen = len - 1 - anteLen;
        if (bossLen < 3) continue;              // der skal være plads til en boss

        /* Et forkammer på tre felter er et rum; på ét felt er det en sluse.
           Begge dele dur, men rummet er pænest, og bossen må gerne være den
           største af de to. */
        out.push({ vertical: vertical, ante: ante, boss: boss,
                   wall: sliceBox(room, vertical, w, w),
                   rank: (anteLen === 3 ? 0 : anteLen === 1 ? 1 : 2) * 10
                         + Math.max(0, anteLen - bossLen) });
      }
    });
    out.sort(function (x, y) { return x.rank - y.rank; });
    return out;
  }

  /* Felterne i væggen, midten først: en dør midt for en væg læses bedst på et
     kort, og ligger den i hjørnet, ser det ud som om den mangler. */
  function wallSlots(wall) {
    var cells = [];
    for (var r = wall.north; r <= wall.south; r++)
      for (var c = wall.west; c <= wall.east; c++) cells.push([r, c]);
    var mid = (cells.length - 1) / 2;
    return cells
      .map(function (p, i) { return { p: p, off: Math.abs(i - mid) }; })
      .sort(function (a, b) { return a.off - b.off; })
      .map(function (x) { return x.p; });
  }

  function tryBossSplit(d, room, plan) {
    var save = [], r, c;
    function set(rr, cc, v) { save.push([rr, cc, d.cell[rr][cc]]); d.cell[rr][cc] = v; }
    function rollback(to) {
      for (var i = save.length - 1; i >= to; i--)
        d.cell[save[i][0]][save[i][1]] = save[i][2];
      save.length = to;
    }
    function inBox(b, rr, cc) {
      return rr >= b.north && rr <= b.south && cc >= b.west && cc <= b.east;
    }

    for (r = plan.wall.north; r <= plan.wall.south; r++)
      for (c = plan.wall.west; c <= plan.wall.east; c++) set(r, c, NOTHING);

    /* Bossrummets egne døre mures til: den eneste vej ind skal være gennem
       forkammeret. Forkammeret beholder sine, og det må gerne have flere. */
    var kept = [], sealed = [];
    doorCells(room).forEach(function (p) {
      if (!(d.cell[p[0]][p[1]] & OPENSPACE)) return;
      var toAnte = false;
      for (var k = 0; k < DIRS.length; k++) {
        if (inBox(plan.ante, p[0] + di[DIRS[k]], p[1] + dj[DIRS[k]])) toAnte = true;
      }
      (toAnte ? kept : sealed).push(p);
    });
    if (!kept.length) { rollback(0); return null; }
    sealed.forEach(function (p) { set(p[0], p[1], NOTHING); });

    var slots = wallSlots(plan.wall);
    for (var s = 0; s < slots.length; s++) {
      var mark = save.length;
      set(slots[s][0], slots[s][1], CORRIDOR | DOOR);
      if (allReachable(d)) return commitBossSplit(d, room, plan, slots[s], sealed);
      rollback(mark);
    }
    rollback(0);
    return null;
  }

  function commitBossSplit(d, room, plan, cell, sealed) {
    sealed.forEach(function (p) { forgetDoor(d, p[0], p[1]); });

    var id = d.n_rooms + 1, r, c;
    for (r = plan.boss.north; r <= plan.boss.south; r++)
      for (c = plan.boss.west; c <= plan.boss.east; c++)
        d.cell[r][c] = (d.cell[r][c] & ~ROOM_ID) | (id << 6);

    d.n_rooms = id;
    d.room[id] = {
      id: id, row: plan.boss.north, col: plan.boss.west,
      north: plan.boss.north, south: plan.boss.south,
      west: plan.boss.west, east: plan.boss.east,
      height: plan.boss.south - plan.boss.north + 1,
      width: plan.boss.east - plan.boss.west + 1,
      area: (plan.boss.south - plan.boss.north + 1)
          * (plan.boss.east - plan.boss.west + 1),
      door: {}, xp: 0
    };

    /* Det gamle rum er nu forkammeret, og det er skrumpet. */
    room.north = plan.ante.north; room.south = plan.ante.south;
    room.west = plan.ante.west; room.east = plan.ante.east;
    room.row = room.north; room.col = room.west;
    room.height = room.south - room.north + 1;
    room.width = room.east - room.west + 1;
    room.area = room.width * room.height;

    linkDoor(d, room, d.room[id], cell, DOOR);
    return { boss: id, ante: room.id, sealed: sealed.length };
  }

  /* En dør der hører til to rum. Objektet deles, som fixDoors ville have gjort
     det, så en rettelse ét sted slår igennem begge steder. */
  function linkDoor(d, a, b, cell, type) {
    var door = { row: cell[0], col: cell[1],
                 key: DOOR_KIND[type].key, type: DOOR_KIND[type].type };
    d.door.push(door);
    [a, b].forEach(function (room) {
      var dir = (cell[0] < room.north) ? 'north'
              : (cell[0] > room.south) ? 'south'
              : (cell[1] < room.west) ? 'west' : 'east';
      (room.door[dir] || (room.door[dir] = [])).push(door);
    });
  }

  /* Afstanden mellem to rum i felter, målt mellem kasserne og ikke mellem
     midterne — to lange rum side om side er naboer, uanset hvor midten er. */
  function boxGap(a, b) {
    var dr = Math.max(0, Math.max(a.north - b.south, b.north - a.south));
    var dc = Math.max(0, Math.max(a.west - b.east, b.west - a.east));
    return dr + dc;
  }

  function isBoss(d, id) {
    if (!d.bosses) return false;
    for (var i = 0; i < d.bosses.length; i++) if (d.bosses[i].id === id) return true;
    return false;
  }

  function isSafe(d, id) {
    if (!d.safes) return false;
    for (var i = 0; i < d.safes.length; i++) if (d.safes[i].id === id) return true;
    return false;
  }

  function isAnte(d, id) {
    if (!d.bosses) return false;
    for (var i = 0; i < d.bosses.length; i++) if (d.bosses[i].ante === id) return true;
    return false;
  }

  /* Hvor langt er der fra rummet til det nærmeste safe room der allerede
     ligger der? Målt mellem kasserne, som bosserne spredes med. */
  function safeGap(d, room) {
    var list = (d.safes || []), gap = 1e9;
    for (var i = 0; i < list.length; i++) {
      var other = d.room[list[i].id];
      if (!other) continue;
      var g = boxGap(room, other);
      if (g < gap) gap = g;
    }
    return (gap === 1e9) ? 0 : gap;
  }

  function allReachable(d) {
    if (!d.entrance) return false;
    if (!(d.cell[d.entrance.row][d.entrance.col] & OPENSPACE)) return false;
    var dist = dccBfs(d, d.entrance.row, d.entrance.col);
    for (var r = 0; r <= d.n_rows; r++)
      for (var c = 0; c <= d.n_cols; c++) {
        if (!(d.cell[r][c] & OPENSPACE)) continue;
        if (dist[r + ',' + c] === undefined) return false;
      }
    return true;
  }

  function sealOk(d, extra) {
    if (!allReachable(d)) return false;
    if (extra && !extra()) return false;
    if (!d.bosses) return true;
    for (var i = 0; i < d.bosses.length; i++) {
      var b = d.room[d.bosses[i].id];
      if (b && doorCount(d, b) < 2) return false;
    }
    return true;
  }

  /* Kan man nå rummet uden at gå gennem et bossrum? Et safe room bag bossen
     er ikke et safe room — så skal man slå bossen for at få lov at hvile.
     Med flere bosser gælder det dem alle: hvilestedet må ikke ligge bag nogen
     af dem. */
  function roomCell(room) {
    return Math.floor((room.north + room.south) / 2) + ','
         + Math.floor((room.west + room.east) / 2);
  }

  function bossRooms(d) {
    if (!d.bosses) return [];
    return d.bosses.map(function (b) { return d.room[b.id]; })
                   .filter(function (x) { return !!x; });
  }

  function reachableWithoutBoss(d, room) {
    if (!d.entrance) return false;
    if (isBoss(d, room.id)) return false;
    var dist = dccBfs(d, d.entrance.row, d.entrance.col, bossRooms(d));
    return dist[roomCell(room)] !== undefined;
  }

  function forgetDoor(d, r, c) {
    for (var id = 1; id <= d.n_rooms; id++) {
      var room = d.room[id];
      if (!room) continue;
      Object.keys(room.door).forEach(function (dir) {
        var keep = room.door[dir].filter(function (x) {
          return x.row !== r || x.col !== c;
        });
        if (keep.length) room.door[dir] = keep; else delete room.door[dir];
      });
    }
    d.door = d.door.filter(function (x) { return x.row !== r || x.col !== c; });
  }

  /* Mur til én ad gangen indtil der er én dør tilbage. Dørlisterne røres først
     når det er lykkedes, så fortrydelse blot er at lægge felterne tilbage. */
  function sealDoor(d, room, extra) {
    var doors = doorCells(room);
    if (doors.length < 2) return 0;
    var sealed = [], i;

    for (i = 0; i < doors.length; i++) {
      if (doors.length - sealed.length <= 1) break;
      var r = doors[i][0], c = doors[i][1];
      var save = d.cell[r][c];
      d.cell[r][c] = NOTHING;
      if (sealOk(d, extra)) sealed.push([r, c, save]);
      else d.cell[r][c] = save;
    }
    if (doors.length - sealed.length === 1) {
      sealed.forEach(function (s) { forgetDoor(d, s[0], s[1]); });
      return sealed.length;
    }
    sealed.forEach(function (s) { d.cell[s[0]][s[1]] = s[2]; });
    return 0;
  }

  /* Safe roomet skal ligge tæt på indgangen, ikke tæt på bossen. Man har brug
     for et sted at samle sig på vej ind, og et rum man først når efter at have
     kæmpet sig gennem hele etagen er et hvilested man aldrig bruger.

     Og vejen derhen må aldrig gå gennem bossrummet. Et safe room bag bossen er
     ikke et safe room; så skal man slå bossen for at få lov at hvile. Det er
     derfor kandidaterne måles med en BFS der ikke må gå gennem bossen —
     kan den ikke nå rummet, ligger rummet bagved. */
  /* Ét eller flere safe rooms, nærmest indgangen først. Hvert rum skæres ned
     til 3 × 3 med præcis én dør. Tre gange tre er stort nok til at et hold på
     fire kan stå i det og lille nok til at være et hul at trække sig ind i —
     og ved at skære til i stedet for at lede efter et rum der allerede har den
     form, får man et safe room tæt på indgangen i stedet for et tilfældigt
     sted langt ude.

     Det skal stadig holde bagefter: hele etagen skal kunne nås, bosserne skal
     beholde deres to udveje, og rummet må ikke ende bag en boss — den væg man
     lukker, kan være netop den, der gjorde vejen udenom mulig.

     Skal der flere, tages de et ad gangen. Hvert rum der lykkes, ændrer
     etagen, så listen regnes forfra hver gang. */
  function dccSafeRoom(d) {
    if (!d.entrance) return;
    var want = Math.max(0, Math.min(8, Math.round(
      d.safe_rooms === undefined ? 1 : +d.safe_rooms)));
    d.safes = [];
    if (!want) return;

    /* Det første skal støde op til starttrappen: man skal kunne gå tilbage og
       tage en long rest uden at skulle igennem et rum undervejs. Kun gange
       imellem, og gangen må gerne være lang. Lykkes det ikke, tages det
       nærmeste i stedet, og arket siger at det ikke er lige ved trappen.

       Reglen gælder kun det første. De næste skal tværtimod ligge langt væk —
       ellers lå de alle sammen inden for døren, og et hvilested inde på
       etagen er netop det man har flere af dem til. */
    for (var k = 0; k < want; k++) {
      var got = (k === 0) ? oneSafeRoom(d, true, false) : null;
      if (!got) got = oneSafeRoom(d, false, k > 0);
      if (!got) break;
      d.safes.push(got);
    }
    d.safe = d.safes[0] || null;
  }

  /* Hvilke rum ligger for enden af en gang fra indgangen — altså uden et
     andet rum imellem? Der gås kun på gangfelter; rammer man et rumfelt, er
     det rum noteret, og dér stopper den vej. */
  function roomsOffCorridors(d, from) {
    var touch = {}, seen = {};
    var start = from || d.entrance;
    if (!start) return { rooms: touch, cells: seen };
    var q = [[start.row, start.col]], h = 0;
    seen[start.row + ',' + start.col] = 1;

    while (h < q.length) {
      var n = q[h++];
      for (var i = 0; i < DIRS.length; i++) {
        var r = n[0] + di[DIRS[i]], c = n[1] + dj[DIRS[i]];
        if (r < 0 || r > d.n_rows || c < 0 || c > d.n_cols) continue;
        var cell = d.cell[r][c];
        if (!(cell & OPENSPACE)) continue;
        if (cell & ROOM) { touch[(cell & ROOM_ID) >> 6] = 1; continue; }
        var key = r + ',' + c;
        if (seen[key]) continue;
        seen[key] = 1;
        q.push([r, c]);
      }
    }
    return { rooms: touch, cells: seen };
  }

  function oneSafeRoom(d, adjacent, spread) {
    var fromDoor = dccBfs(d, d.entrance.row, d.entrance.col, bossRooms(d));
    var near = adjacent ? roomsOffCorridors(d) : null;
    var cand = [];
    for (var id = 1; id <= d.n_rooms; id++) {
      var room = d.room[id];
      if (!room || isBoss(d, room.id) || isSafe(d, room.id)) continue;
      if (isAnte(d, room.id)) continue;         // forkammeret hører til bossen
      if (near && !near.rooms[room.id]) continue;
      var v = fromDoor[roomCell(room)];
      if (v === undefined) continue;            // kun nåeligt gennem en boss
      cand.push({ room: room, dist: v, gap: spread ? safeGap(d, room) : 0 });
    }
    /* Det første safe room tages så tæt på trappen som muligt. De næste tages
       så langt fra dem der allerede ligger der som muligt — samme greb som
       bosserne spredes med — og dybt inde, hvis der er flere lige gode. */
    cand.sort(spread
      ? function (a, b) { return b.gap - a.gap || b.dist - a.dist || a.room.id - b.room.id; }
      : function (a, b) { return a.dist - b.dist || a.room.id - b.room.id; });

    for (var i = 0; i < cand.length; i++) {
      /* Udskæringen flytter døren, så det skal tjekkes bagefter: den dør der
         bliver tilbage, skal stadig vende ud mod en gang der går til trappen. */
      var check = adjacent
        ? (function (room) {
            return function () { return !!roomsOffCorridors(d).rooms[room.id]; };
          }(cand[i].room))
        : null;
      var prefer = adjacent ? near.cells : null;

      var n = carveSafe(d, cand[i].room, check, prefer);
      if (n) {
        return { id: cand[i].room.id, sealed: n.sealed, dist: cand[i].dist,
                 door: n.door, adjacent: !!adjacent };
      }

      /* Kan rummet ikke skæres ned, fordi det er porten til resten af etagen,
         kan det måske deles i stedet: et 3 × 3 i den ene ende bliver safe
         room, en væg imellem, og resten bliver ved med at være det rum det
         var — med sine døre i behold. Det virker kun på rum der er tre felter
         brede eller høje, for ellers bliver resten ikke en firkant. */
      if (adjacent) {
        var sp = splitSafe(d, cand[i].room, prefer);
        if (sp) {
          return { id: sp.id, sealed: sp.sealed, dist: cand[i].dist,
                   door: sp.door, adjacent: true, split: true };
        }
      }
    }
    return null;
  }

  /* Del et aflangt rum i to: et 3 × 3 i den ene ende, en væg, og resten.
     Begge dele bliver firkanter, og det er derfor kun rum der er præcis tre
     felter i den ene retning og mindst fem i den anden der kan deles — ellers
     ville resten blive et L, og rummodellen kender kun kasser. */
  function splitSafe(d, room, prefer) {
    var short = Math.min(room.width, room.height);
    var long = Math.max(room.width, room.height);
    if (short !== 3 || long < 5) return null;
    var vertical = (room.width === 3);        // deles langs rækkerne

    for (var end = 0; end < 2; end++) {
      var got = trySplit(d, room, vertical, end, prefer);
      if (got) return got;
    }
    return null;
  }

  function trySplit(d, room, vertical, end, prefer) {
    var box, wall;
    if (vertical) {
      var r0 = end ? room.south - 2 : room.north;
      box = { north: r0, south: r0 + 2, west: room.west, east: room.east };
      wall = { north: end ? r0 - 1 : r0 + 3, south: end ? r0 - 1 : r0 + 3,
               west: room.west, east: room.east };
    } else {
      var c0 = end ? room.east - 2 : room.west;
      box = { north: room.north, south: room.south, west: c0, east: c0 + 2 };
      wall = { north: room.north, south: room.south,
               west: end ? c0 - 1 : c0 + 3, east: end ? c0 - 1 : c0 + 3 };
    }

    var save = [], r, c;
    function set(rr, cc, v) { save.push([rr, cc, d.cell[rr][cc]]); d.cell[rr][cc] = v; }
    function undo() {
      for (var i = save.length - 1; i >= 0; i--) d.cell[save[i][0]][save[i][1]] = save[i][2];
    }
    function inBox(b, rr, cc) {
      return rr >= b.north && rr <= b.south && cc >= b.west && cc <= b.east;
    }

    for (r = wall.north; r <= wall.south; r++)
      for (c = wall.west; c <= wall.east; c++) set(r, c, NOTHING);

    /* Dørene fordeles efter hvilken side de ligger op ad. En dør der kun
       rører væggen imellem, fører ingen steder hen og mures til. */
    var cells = doorCells(room), mine = [], theirs = [], dead = [];
    cells.forEach(function (p) {
      if (!(d.cell[p[0]][p[1]] & OPENSPACE)) return;
      var touchBox = false, touchRest = false;
      for (var k = 0; k < DIRS.length; k++) {
        var nr = p[0] + di[DIRS[k]], nc = p[1] + dj[DIRS[k]];
        if (inBox(box, nr, nc)) touchBox = true;
        else if (inBox(room, nr, nc) && !inBox(wall, nr, nc)) touchRest = true;
      }
      if (touchBox) mine.push(p);
      else if (touchRest) theirs.push(p);
      else dead.push(p);
    });
    if (!mine.length) { undo(); return null; }

    if (prefer) {
      mine.sort(function (a, b) {
        return (prefer[a[0] + ',' + a[1]] ? 0 : 1) - (prefer[b[0] + ',' + b[1]] ? 0 : 1);
      });
    }
    var keep = mine[0];
    var sealed = mine.slice(1).concat(dead);
    sealed.forEach(function (p) { set(p[0], p[1], NOTHING); });

    var tp = safeDoorType(d);
    set(keep[0], keep[1], (d.cell[keep[0]][keep[1]] & OPENSPACE) | tp);

    if (!allReachable(d) || !bossesStillOpen(d) || !safesStillFree(d)
        || !reachableWithoutBoss(d, box)) { undo(); return null; }

    /* Det nye rum skal findes, før naboskabet kan måles — men hvis målingen
       falder ud, skal alt kunne lægges tilbage. Derfor sættes id'et først, og
       rulles tilbage sammen med felterne. */
    var id = d.n_rooms + 1;
    for (r = box.north; r <= box.south; r++)
      for (c = box.west; c <= box.east; c++)
        set(r, c, (d.cell[r][c] & ~ROOM_ID) | (id << 6));

    d.n_rooms = id;
    d.room[id] = {
      id: id, row: box.north, col: box.west,
      north: box.north, south: box.south, west: box.west, east: box.east,
      height: 3, width: 3, area: 9, door: {}, xp: 0
    };
    if (!roomsOffCorridors(d).rooms[id]) {
      d.room[id] = null; d.n_rooms = id - 1; undo(); return null;
    }

    // Det holdt. Papirerne rettes til.
    sealed.forEach(function (p) { forgetDoor(d, p[0], p[1]); });
    moveDoor(d, room, d.room[id], keep, box, tp);
    if (vertical) {
      room.north = (box.north === room.north) ? wall.south + 1 : room.north;
      room.south = (box.south === room.south) ? wall.north - 1 : room.south;
      room.height = room.south - room.north + 1;
    } else {
      room.west = (box.west === room.west) ? wall.east + 1 : room.west;
      room.east = (box.east === room.east) ? wall.west - 1 : room.east;
      room.width = room.east - room.west + 1;
    }
    room.row = room.north; room.col = room.west;
    room.area = room.width * room.height;

    return { id: id, sealed: sealed.length, door: DOOR_KIND[tp].type };
  }

  /* Flyt dørobjektet fra det gamle rum til det nye, og ret dens type. */
  function moveDoor(d, from, to, cell, box, type) {
    Object.keys(from.door).forEach(function (dir) {
      from.door[dir] = from.door[dir].filter(function (x) {
        return x.row !== cell[0] || x.col !== cell[1];
      });
      if (!from.door[dir].length) delete from.door[dir];
    });
    var dir = (cell[0] < box.north) ? 'north'
            : (cell[0] > box.south) ? 'south'
            : (cell[1] < box.west) ? 'west' : 'east';
    var door = null;
    d.door.forEach(function (x) {
      if (x.row === cell[0] && x.col === cell[1]) door = x;
    });
    if (!door) {
      door = { row: cell[0], col: cell[1] };
      d.door.push(door);
    }
    door.key = DOOR_KIND[type].key;
    door.type = DOOR_KIND[type].type;
    (to.door[dir] || (to.door[dir] = [])).push(door);
  }

  /* Døren ind til safe roomet: enten låst eller ulåst, aldrig en fælde og
     aldrig et faldgitter. Et hvilested skal man kunne lukke efter sig, ikke
     blive fanget i eller såret af. */
  function safeDoorType(d) {
    return (d.rand() < 0.5) ? LOCKED : DOOR;
  }

  /* Skær rummet ned til et 3 × 3-hjørne med én dør. Prøver hvert muligt hjørne
     og lader det stå ved det første der holder. Alt gemmes før det ændres, så
     et mislykket forsøg kan lægges præcis tilbage. */
  function carveSafe(d, room, extra, prefer) {
    var keeps = [];
    for (var r = room.north; r + 2 <= room.south; r += 2)
      for (var c = room.west; c + 2 <= room.east; c += 2) keeps.push([r, c]);
    if (!keeps.length) return null;               // rummet er smallere end 3

    for (var k = 0; k < keeps.length; k++) {
      var got = tryCarve(d, room, keeps[k][0], keeps[k][1], extra, prefer);
      if (got) return got;
    }
    return null;
  }

  function tryCarve(d, room, r0, c0, extra, prefer) {
    var save = [], r, c;
    function set(rr, cc, v) { save.push([rr, cc, d.cell[rr][cc]]); d.cell[rr][cc] = v; }
    function undo() { for (var i = save.length - 1; i >= 0; i--) d.cell[save[i][0]][save[i][1]] = save[i][2]; }

    // Rummets celler uden for hjørnet bliver til klippe.
    for (r = room.north; r <= room.south; r++)
      for (c = room.west; c <= room.east; c++)
        if (r < r0 || r > r0 + 2 || c < c0 || c > c0 + 2) set(r, c, NOTHING);

    /* Dørene: kun dem der ligger op ad det, der bliver stående, kan overleve.
       Af dem beholdes én — den der ligger tættest på indgangen. */
    var cells = doorCells(room), live = [], dead = [];
    cells.forEach(function (p) {
      var rr = p[0], cc = p[1];
      var touches = (rr === r0 - 1 && cc >= c0 && cc <= c0 + 2)
                 || (rr === r0 + 3 && cc >= c0 && cc <= c0 + 2)
                 || (cc === c0 - 1 && rr >= r0 && rr <= r0 + 2)
                 || (cc === c0 + 3 && rr >= r0 && rr <= r0 + 2);
      (touches && (d.cell[rr][cc] & OPENSPACE) ? live : dead).push(p);
    });
    if (!live.length) { undo(); return null; }

    /* Hvilken dør der bliver tilbage, afgør om rummet stadig vender ud mod
       gangen fra trappen. Er der en liste over gangfelter, kommer de døre der
       ligger på den først; ellers er det bare den nærmeste. */
    var fromDoor = dccBfs(d, d.entrance.row, d.entrance.col);
    live.sort(function (a, b) {
      if (prefer) {
        var pa = prefer[a[0] + ',' + a[1]] ? 0 : 1;
        var pb = prefer[b[0] + ',' + b[1]] ? 0 : 1;
        if (pa !== pb) return pa - pb;
      }
      var x = fromDoor[a[0] + ',' + a[1]], y = fromDoor[b[0] + ',' + b[1]];
      return (x === undefined ? 1e9 : x) - (y === undefined ? 1e9 : y);
    });
    var keep = live[0];
    live.slice(1).concat(dead).forEach(function (p) { set(p[0], p[1], NOTHING); });

    // Døren skal være en dør: låst eller ulåst.
    var t = safeDoorType(d);
    set(keep[0], keep[1], (d.cell[keep[0]][keep[1]] & OPENSPACE) | t);

    var sealed = cells.length - 1;
    var box = { north: r0, south: r0 + 2, west: c0, east: c0 + 2, id: room.id };
    /* Også de safe rooms der allerede ligger der: den væg vi lukker nu, kan
       have været vejen udenom bossen til et af dem. */
    if (!allReachable(d) || !bossesStillOpen(d) || !reachableWithoutBoss(d, box)
        || !safesStillFree(d) || (extra && !extra())) {
      undo();
      return null;
    }

    // Det holdt. Nu rettes rummets papirer til.
    live.slice(1).concat(dead).forEach(function (p) { forgetDoor(d, p[0], p[1]); });
    d.door.forEach(function (door) {
      if (door.row !== keep[0] || door.col !== keep[1]) return;
      door.key = DOOR_KIND[t].key;
      door.type = DOOR_KIND[t].type;
    });
    room.north = r0; room.south = r0 + 2;
    room.west = c0; room.east = c0 + 2;
    room.row = r0; room.col = c0;
    room.height = 3; room.width = 3; room.area = 9;
    return { sealed: sealed, door: DOOR_KIND[t].type };
  }

  /* Bossrummet skal have døre, ikke huller i væggen. En åben portal er ikke en
     dør, man kan lytte ved, banke på eller finde låst — og bossen er etagens
     ene sted hvor det bør koste noget at komme ind.

     Hemmelige døre er med vilje ikke med: trappen ned står i bossrummet, så et
     rum man kun kan finde ved et heldigt tjek kan spærre for hele etagen.

     Ud af 110 lodder giver donjons egen tabel 15 låste. Her er det 55. */
  var BOSS_DOORS = [
    [55, LOCKED],
    [15, TRAPPED],
    [15, PORTC],
    [15, DOOR]
  ];

  function safesStillFree(d) {
    var list = d.safes || [];
    for (var i = 0; i < list.length; i++) {
      var r = d.room[list[i].id];
      if (r && !reachableWithoutBoss(d, r)) return false;
    }
    return true;
  }

  /* Et bossrum skal have en vej ind. Før var kravet to døre, fordi et bossrum
     med én var en blindgyde — nu er blindgyden meningen: bossen sidder bag sit
     forkammer med netop én dør imellem. Kravet er derfor kun, at den ene dør
     ikke må mures til. */
  function bossesStillOpen(d) {
    var list = bossRooms(d);
    for (var i = 0; i < list.length; i++) if (doorCount(d, list[i]) < 1) return false;
    return true;
  }

  function dccBossDoors(d) {
    if (!d.bosses) return;
    d.bosses.forEach(function (entry) {
      var boss = d.room[entry.id];
      if (!boss) return;
      var locked = 0, total = 0;

      doorCells(boss).forEach(function (p) {
        var r = p[0], c = p[1];
        if (!(d.cell[r][c] & OPENSPACE)) return;      // muret til
        total++;

        var roll = Math.floor(d.rand() * 100), acc = 0, t = LOCKED;
        for (var i = 0; i < BOSS_DOORS.length; i++) {
          acc += BOSS_DOORS[i][0];
          if (roll < acc) { t = BOSS_DOORS[i][1]; break; }
        }
        if (t === LOCKED) locked++;

        d.cell[r][c] &= ~DOORSPACE;
        d.cell[r][c] |= t;

        /* Dørobjektet deles af begge rum og af d.door, så det er nok at rette
           det ét sted — fixDoors lagde den samme reference i alle tre lister. */
        d.door.forEach(function (door) {
          if (door.row !== r || door.col !== c) return;
          door.key = DOOR_KIND[t].key;
          door.type = DOOR_KIND[t].type;
        });
      });

      entry.doors = total;
      entry.locked = locked;
    });
  }

  /* Afstandene måles til sidst. Bossrummene vælges før safe roomene skæres
     ud, og den udskæring lukker felter — så en afstand målt undervejs kan være
     et halvt dusin skridt forkert, når etagen står færdig. Det er tallet på
     arket, så det skal passe med kortet ved siden af. */
  function dccDistances(d) {
    d.reachable = false;
    if (!d.entrance) return;
    var dist = dccBfs(d, d.entrance.row, d.entrance.col);
    function set(entry) {
      var room = d.room[entry.id];
      entry.dist = room ? dist[roomCell(room)] : undefined;
      if (entry.dist === undefined) entry.dist = null;   // kan ikke nås
    }
    (d.bosses || []).forEach(set);
    (d.safes || []).forEach(set);

    /* donjon garanterer ikke at hele etagen hænger sammen; der kan ligge en
       lomme uden vej til. Ligger trappen ned i sådan en, er etagen ubrugelig —
       man kan ikke komme videre. Det måles her, og create() kasserer etagen
       og laver en ny. */
    /* Alle trapper ned skal kunne nås. Én ubrugelig udgang er én boss man
       aldrig møder, og ligger de alle bag en lukket lomme, er etagen blind. */
    var list = d.bosses || [];
    d.reachable = list.length > 0 && list.every(function (b) {
      return b.exit && dist[b.exit.row + ',' + b.exit.col] !== undefined;
    });

    /* Mindst ét safe room skal støde op til trappen man kommer ind ad: man
       skal kunne gå tilbage og tage en long rest uden at skulle igennem et rum
       undervejs. Kun gange imellem — gangen må gerne være lang. */
    d.near_entrance = !(d.safes || []).length || (d.safes || []).some(function (s) {
      return s.adjacent;
    });
  }

  function dccXp(d) {
    var level = Math.max(1, Math.min(20, +d.party_level));
    var size = Math.max(1, +d.party_size);
    var need = XP_TO_NEXT[level < 20 ? level : 19];
    var floorXp = Math.round(need * size * d.xp_slack);
    var cap = ENCOUNTER[level][TIER[d.room_cap]] * size;
    var bossXp = Math.min(ENCOUNTER[level][TIER[d.boss_fight]] * size, floorXp);

    var bossList = d.bosses || [];
    var rooms = [], id;

    for (id = 1; id <= d.n_rooms; id++) {
      var room = d.room[id];
      if (!room) continue;
      room.xp = 0;
      delete room.trap;
      if (isBoss(d, room.id) || isSafe(d, room.id)) continue;
      rooms.push(room);
    }

    /* Hver boss er én kamp af den valgte slags. Er der flere bosser, end
       budgettet rækker til, får de sidste det der er tilbage — og så siger
       arket det, i stedet for at lade som om etagen har råd. */
    var bossTotal = 0;
    bossList.forEach(function (b) {
      var give = Math.max(0, Math.min(bossXp, floorXp - bossTotal));
      if (d.room[b.id]) d.room[b.id].xp = give;
      b.xp = give;
      bossTotal += give;
    });

    /* Mætningen siger hvor mange af de øvrige rum der har noget i sig, og
       fældeandelen deler dem op. En fælde er indhold, men ikke en kamp: SRD'en
       giver fælder en grad og et niveauspænd, ikke en XP-værdi, så de trækker
       ikke på budgettet. Det betyder at et højt fældetal presser hele budgettet
       sammen i færre kamprum — og hjælper det ikke, vokser etagen.

       Budgettet fordeles ikke efter rummenes areal. Et stort rum er ikke en
       svær kamp; seks goblins i et kosteskab er værre end seks goblins i en
       hal. Det der betyder noget, er hvor langt inde på etagen man er: kampene
       vokser med afstanden fra indgangen, målt i skridt gennem åbne felter. */
    var rest = Math.max(0, floorXp - bossTotal);
    var minXp = ENCOUNTER[level][0] * size;        // Low — den mindste rigtige kamp

    var sat = clampPct(d.saturation, 45) / 100;
    var trapPct = clampPct(d.trap_share, 25) / 100;

    var content = Math.round(rooms.length * sat);
    if (rest > 0) content = Math.max(1, content);
    content = Math.min(content, rooms.length);

    var traps = Math.round(content * trapPct);
    var want = content - traps;
    if (rest > 0 && want < 1) { want = 1; traps = content - 1; }
    if (rest <= 0) { want = 0; }

    /* Kan de valgte kamprum ikke rumme budgettet under loftet, er der for få
       af dem. Så skæres der i fælderne først — de koster ikke XP, og et rum
       med en fælde kan lige så godt have monstre i. Rækker det ikke, melder
       etagen mangel, og så lægger create() rum til. */
    var needed = Math.ceil(rest / cap);
    if (want < needed) {
      var take = Math.min(traps, needed - want);
      want += take; traps -= take;
      want = Math.min(want, rooms.length);
    }
    /* Mangler der stadig plads, er det enten fordi etagen er for lille — og
       så hjælper det at lægge rum til — eller fordi mætningen er sat så lavt,
       at der ikke må være flere kamprum. Det sidste kan ingen etagestørrelse
       rette, så create() skal vide forskel og lade være med at vokse forgæves. */
    var roomBound = (want >= rooms.length);

    var fromDoor = d.entrance
      ? dccBfs(d, d.entrance.row, d.entrance.col) : {};
    var order = rooms.slice().sort(function (a, b) {
      var da = fromDoor[roomCell(a)], db = fromDoor[roomCell(b)];
      if (da === undefined) da = 1e9;
      if (db === undefined) db = 1e9;
      return da - db || a.id - b.id;
    });

    /* Indholdet spredes ud over dybden i stedet for at ligge i den fjerneste
       ende. Ellers er den halve etage tom, og så begynder den. */
    var chosen = [], i;
    var total = Math.min(want + traps, order.length);
    for (i = 0; i < total; i++) {
      var from = Math.floor(i * order.length / total);
      var to = Math.max(from + 1, Math.floor((i + 1) * order.length / total));
      /* Inden for hvert spring foretrækkes et bossrums forkammer. Et tomt
         forværelse til et bossrum er en skuffelse, og det koster ingenting:
         der lægges lige så meget ud, det ligger bare her i stedet for hos
         naboen i samme dybde. */
      var slot = order[from];
      for (var j = from; j < to && j < order.length; j++) {
        if (isAnte(d, order[j].id)) { slot = order[j]; break; }
      }
      chosen.push(slot);
    }

    /* Fælderne lægges forrest. En fælde er billigere at møde end en kamp, og
       den hører til dér hvor man endnu ikke ved hvad etagen er for en. */
    var fight = chosen.slice(traps);
    chosen.slice(0, traps).forEach(function (r) { r.trap = true; });

    /* Bunden først: hver kamp er en rigtig kamp. Den kan ikke sættes højere
       end budgettet rækker til — er loftet lavt nok til at tvinge flere rum
       frem end bunden kan betale for, er det budgettet der bestemmer. */
    var base = fight.length
      ? Math.max(0, Math.min(minXp, cap, Math.floor(rest / fight.length))) : 0;
    fight.forEach(function (r) { r.xp = base; });
    var left = Math.max(0, rest - base * fight.length), round = 0, full = {};
    fight.forEach(function (r, k) {
      r._ramp = k + 1;                            // dybderang: 1 er nærmest døren
      if (r.xp >= cap) full[r.id] = 1;
    });

    while (left >= 1 && round < 25) {
      round++;
      var w = 0;
      fight.forEach(function (r) { if (!full[r.id]) w += r._ramp; });
      if (!w) break;
      var moved = 0;
      fight.forEach(function (r) {
        if (full[r.id]) return;
        var add = left * r._ramp / w;
        if (r.xp + add >= cap) { add = cap - r.xp; full[r.id] = 1; }
        if (add <= 0) return;
        r.xp += add; moved += add;
      });
      if (moved < 1) break;
      left -= moved;
    }
    var placed = bossTotal;
    fight.forEach(function (r) {
      r.xp = Math.round(r.xp); placed += r.xp; delete r._ramp;
    });

    /* Afrundingen pr. rum kan lande et par XP ved siden af budgettet. Det er
       ligegyldigt i spil, men et budget på 1800 der står som 1801 ligner en
       fejl, så resten lægges på det største rum der har plads. */
    if (!(left >= 1) && placed !== floorXp) {
      var slop = floorXp - placed;
      var big = null;
      // Kun blandt de rum der allerede har en kamp — et tomt rum skal blive
      // tomt og ikke ende med syv XP, fordi et regnestykke gik ujævnt op.
      fight.forEach(function (r) {
        if (r.xp + slop < 0 || r.xp + slop > cap) return;
        if (!big || r.xp > big.xp) big = r;
      });
      if (big) { big.xp += slop; placed = floorXp; }
    }

    var real = fight.filter(function (r) { return r.xp > 0; }).length;
    var trapRooms = rooms.filter(function (r) { return r.trap; }).length;
    var smallest = 0;
    fight.forEach(function (r) {
      if (r.xp > 0 && (!smallest || r.xp < smallest)) smallest = r.xp;
    });

    d.xp = {
      level: level, size: size,
      need_each: need, need_party: need * size,
      floor: floorXp, placed: placed, boss: bossXp, cap: cap,
      low: ENCOUNTER[level][0] * size,
      moderate: ENCOUNTER[level][1] * size,
      high: ENCOUNTER[level][2] * size,
      bosses: bossList.length,
      boss_total: bossTotal,
      fights: real + bossList.length,
      traps: trapRooms,
      smallest: smallest,
      saturation: Math.round(sat * 100),
      empty: rooms.length - real - trapRooms,
      short: (left >= 1) ? Math.round(left) : 0,
      room_bound: roomBound
    };
  }

  function clampPct(v, fallback) {
    var n = (v === undefined || v === null || v === '') ? fallback : +v;
    if (!isFinite(n)) n = fallback;
    return Math.max(0, Math.min(100, n));
  }

  global.DUNGEON = { create: create, defaults: defaults, bits: {
    OPENSPACE: OPENSPACE, ROOM: ROOM, CORRIDOR: CORRIDOR, ROOM_ID: ROOM_ID,
    ARCH: ARCH, DOOR: DOOR, LOCKED: LOCKED, TRAPPED: TRAPPED,
    SECRET: SECRET, PORTC: PORTC, DOORSPACE: DOORSPACE,
    STAIR_DN: STAIR_DN, STAIR_UP: STAIR_UP
  } };
}(window));
