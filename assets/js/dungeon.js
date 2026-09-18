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
      n_rows: 39, n_cols: 39,
      dungeon_layout: 'None',
      room_min: 3, room_max: 9,
      room_layout: 'Scattered',
      corridor_layout: 'Bent',
      remove_deadends: 50,
      party_size: 4, party_level: 1,
      xp_slack: 1.5,
      boss_fight: 'high', room_cap: 'high'
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
  var GRID_MAX = 61;

  function create(opts) {
    var base = {}, k;
    var def = defaults();
    for (k in def) base[k] = def[k];
    for (k in (opts || {})) if (opts[k] !== undefined && opts[k] !== '') base[k] = opts[k];

    var rows = base.n_rows, cols = base.n_cols;
    var tries = 0;                     // 0 = donjons egen brøk
    var d, best = null, prevRooms = -1, pass, grew = 0;

    for (pass = 0; pass < MAX_PASSES; pass++) {
      d = build(base, rows, cols, tries);
      if (!best || d.xp.short < best.xp.short) best = d;
      if (!d.xp.short) break;

      /* Gav flere forsøg ikke flere rum, er pladsen brugt op. Så nytter det
         ikke at prøve igen på det samme gitter. */
      var stuck = (d.n_rooms <= prevRooms);
      prevRooms = d.n_rooms;

      if (stuck || tries === 0) {
        if (stuck) {
          if (rows >= GRID_MAX) break;
          rows = Math.min(GRID_MAX, rows + GRID_STEP);
          cols = Math.min(GRID_MAX, cols + GRID_STEP);
          grew++;
          prevRooms = -1;
        }
        tries = roomTries(rows, cols, base.room_max);
      }
      tries += Math.max(4, Math.ceil(tries * 0.5));
    }

    best.fit = {
      passes: Math.min(pass + 1, MAX_PASSES),
      grew: grew,
      rows: best.n_rows, cols: best.n_cols,
      asked_rows: Math.floor(base.n_rows / 2) * 2,
      rooms: best.n_rooms
    };
    return best;
  }

  function roomTries(rows, cols, roomMax) {
    return Math.floor((rows * cols) / (roomMax * roomMax));
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
    dccBossExit(d);
    dccSafeRoom(d);
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
      if (checkTunnel(d, r, c, xc)) {
        for (var i = 0; i < xc.close.length; i++) {
          var p = xc.close[i];
          d.cell[r + p[0]][c + p[1]] = NOTHING;
        }
        if (xc.recurse) collapse(d, r + xc.recurse[0], c + xc.recurse[1]);
      }
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
    if (!list.length) return;
    var s = list[Math.floor(d.rand() * list.length)];
    d.cell[s.row][s.col] |= STAIR_UP;
    s.key = 'up';
    d.stair.push(s);
    d.entrance = s;
  }

  function dccBfs(d, r0, c0) {
    var dist = {}, queue = [[r0, c0]], head = 0;
    dist[r0 + ',' + c0] = 0;
    while (head < queue.length) {
      var node = queue[head++];
      var r = node[0], c = node[1];
      for (var k = 0; k < DIRS.length; k++) {
        var nr = r + di[DIRS[k]], nc = c + dj[DIRS[k]];
        if (nr < 0 || nr > d.n_rows || nc < 0 || nc > d.n_cols) continue;
        if (!(d.cell[nr][nc] & OPENSPACE)) continue;
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

  function dccBossExit(d) {
    var dist = d.entrance ? dccBfs(d, d.entrance.row, d.entrance.col) : null;
    var boss = null, bossDist = -1, fallback = null, id;

    for (id = 1; id <= d.n_rooms; id++) {
      var room = d.room[id];
      if (!room) continue;
      var doors = doorCount(d, room);
      if (!fallback || doors > doorCount(d, fallback)) fallback = room;
      if (doors < 2) continue;
      var dd = roomDist(room, dist);
      if (dd > bossDist) { boss = room; bossDist = dd; }
    }
    if (!boss) boss = fallback;
    if (!boss) return;

    d.boss = { id: boss.id, doors: doorCount(d, boss) };

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
    d.exit = { row: sr, col: sc };
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

  function sealOk(d) {
    if (!allReachable(d)) return false;
    if (!d.boss) return true;
    var boss = d.room[d.boss.id];
    if (!boss) return true;
    return doorCount(d, boss) >= 2;
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
  function sealDoor(d, room) {
    var doors = doorCells(room);
    if (doors.length < 2) return 0;
    var sealed = [], i;

    for (i = 0; i < doors.length; i++) {
      if (doors.length - sealed.length <= 1) break;
      var r = doors[i][0], c = doors[i][1];
      var save = d.cell[r][c];
      d.cell[r][c] = NOTHING;
      if (sealOk(d)) sealed.push([r, c, save]);
      else d.cell[r][c] = save;
    }
    if (doors.length - sealed.length === 1) {
      sealed.forEach(function (s) { forgetDoor(d, s[0], s[1]); });
      return sealed.length;
    }
    sealed.forEach(function (s) { d.cell[s[0]][s[1]] = s[2]; });
    return 0;
  }

  function dccSafeRoom(d) {
    if (!d.entrance) return;
    var bossId = d.boss ? d.boss.id : 0;
    var fromBoss = null;
    if (bossId && d.room[bossId]) {
      var b = d.room[bossId];
      fromBoss = dccBfs(d, Math.floor((b.north + b.south) / 2),
                           Math.floor((b.west + b.east) / 2));
    }
    var cand = [];
    for (var id = 1; id <= d.n_rooms; id++) {
      var room = d.room[id];
      if (!room || room.id === bossId) continue;
      cand.push(room);
    }
    cand.sort(function (a, b) {
      return roomDist(a, fromBoss) - roomDist(b, fromBoss);
    });

    var i;
    for (i = 0; i < cand.length; i++) {
      if (doorCount(d, cand[i]) === 1) {
        d.safe = { id: cand[i].id, sealed: 0 };
        return;
      }
    }
    cand.sort(function (a, b) { return doorCount(d, a) - doorCount(d, b); });
    for (i = 0; i < cand.length; i++) {
      var n = sealDoor(d, cand[i]);
      if (n) { d.safe = { id: cand[i].id, sealed: n }; return; }
    }
  }

  function dccXp(d) {
    var level = Math.max(1, Math.min(20, +d.party_level));
    var size = Math.max(1, +d.party_size);
    var need = XP_TO_NEXT[level < 20 ? level : 19];
    var floorXp = Math.round(need * size * d.xp_slack);
    var cap = ENCOUNTER[level][TIER[d.room_cap]] * size;
    var bossXp = Math.min(ENCOUNTER[level][TIER[d.boss_fight]] * size, floorXp);

    var bossId = d.boss ? d.boss.id : 0;
    var safeId = d.safe ? d.safe.id : 0;
    var rooms = [], id;

    for (id = 1; id <= d.n_rooms; id++) {
      var room = d.room[id];
      if (!room) continue;
      room.xp = 0;
      if (room.id === bossId || room.id === safeId) continue;
      rooms.push(room);
    }
    if (bossId && d.room[bossId]) d.room[bossId].xp = bossXp;

    var left = Math.max(0, floorXp - bossXp), round = 0, full = {};
    while (left >= 1 && round < 25) {
      round++;
      var area = 0;
      rooms.forEach(function (r) { if (!full[r.id]) area += r.area; });
      if (!area) break;
      var moved = 0;
      rooms.forEach(function (r) {
        if (full[r.id]) return;
        var add = left * r.area / area;
        if (r.xp + add >= cap) { add = cap - r.xp; full[r.id] = 1; }
        if (add <= 0) return;
        r.xp += add; moved += add;
      });
      if (moved < 1) break;
      left -= moved;
    }
    var placed = bossXp;
    rooms.forEach(function (r) { r.xp = Math.round(r.xp); placed += r.xp; });

    /* Afrundingen pr. rum kan lande et par XP ved siden af budgettet. Det er
       ligegyldigt i spil, men et budget på 1800 der står som 1801 ligner en
       fejl, så resten lægges på det største rum der har plads. */
    if (!(left >= 1) && placed !== floorXp) {
      var slop = floorXp - placed;
      var big = null;
      rooms.forEach(function (r) {
        if (r.xp + slop < 0 || r.xp + slop > cap) return;
        if (!big || r.area > big.area) big = r;
      });
      if (big) { big.xp += slop; placed = floorXp; }
    }

    d.xp = {
      level: level, size: size,
      need_each: need, need_party: need * size,
      floor: floorXp, placed: placed, boss: bossXp, cap: cap,
      low: ENCOUNTER[level][0] * size,
      moderate: ENCOUNTER[level][1] * size,
      high: ENCOUNTER[level][2] * size,
      short: (left >= 1) ? Math.round(left) : 0
    };
  }

  global.DUNGEON = { create: create, defaults: defaults, bits: {
    OPENSPACE: OPENSPACE, ROOM: ROOM, CORRIDOR: CORRIDOR, ROOM_ID: ROOM_ID,
    ARCH: ARCH, DOOR: DOOR, LOCKED: LOCKED, TRAPPED: TRAPPED,
    SECRET: SECRET, PORTC: PORTC, DOORSPACE: DOORSPACE,
    STAIR_DN: STAIR_DN, STAIR_UP: STAIR_UP
  } };
}(window));
