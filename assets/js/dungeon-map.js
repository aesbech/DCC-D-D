/* DCC-D-D — kortet og rapporten som printbart papir.
 *
 * Tegneren hører ikke til donjons kode. Perl-udgaven skriver en GIF; her
 * bliver det en SVG, fordi en SVG er skarp uanset hvor stort du printer den,
 * og fordi den kan lægges direkte ind i en HTML-fil der virker uden net.
 *
 *   DUNGEON.svg(d)     kortet som en <svg>-streng
 *   DUNGEON.report(d)  rapporten som HTML
 *   DUNGEON.page(d)    hele arket som ét selvstændigt HTML-dokument
 */
(function (global) {
  'use strict';

  var D = global.DUNGEON;
  if (!D) return;
  var B = D.bits;

  var CELL = 18;          /* px pr. felt på kortet — ét felt er 5 fod */
  var WALL = '#14161c';
  var GRID = '#d9dce3';

  function n(x) { return Number(x).toLocaleString('da-DK'); }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function open(d, r, c) {
    if (r < 0 || r > d.n_rows || c < 0 || c > d.n_cols) return false;
    return !!(d.cell[r][c] & B.OPENSPACE);
  }

  /* ---------- kortet ---------- */

  function svg(d) {
    var W = (d.n_cols + 1) * CELL;
    var H = (d.n_rows + 1) * CELL;
    var P = 16;             /* luft udenom, så trappemærkatet ikke bliver klippet */
    var r, c, out = [];

    out.push('<svg xmlns="http://www.w3.org/2000/svg" class="dmap" '
      + 'viewBox="' + (-P) + ' ' + (-P) + ' ' + (W + P * 2) + ' ' + (H + P * 2)
      + '" width="' + (W + P * 2) + '" height="' + (H + P * 2) + '">');
    out.push('<rect x="' + (-P) + '" y="' + (-P) + '" width="' + (W + P * 2)
      + '" height="' + (H + P * 2) + '" fill="#fff"/>');

    /* Bossrum og safe room får en tone, så de kan ses på et skridt. */
    out.push(tint(d, d.boss && d.boss.id, '#e6eaf4'));
    out.push(tint(d, d.safe && d.safe.id, '#e7f0e7'));

    /* Gittret — ét felt er fem fod, så man kan tælle bevægelse på papiret. */
    var grid = [];
    for (r = 0; r <= d.n_rows; r++)
      for (c = 0; c <= d.n_cols; c++) {
        if (!open(d, r, c)) continue;
        var x = c * CELL, y = r * CELL;
        grid.push('M' + x + ' ' + y + 'h' + CELL + 'M' + x + ' ' + y + 'v' + CELL);
      }
    out.push('<path d="' + grid.join('') + '" fill="none" stroke="' + GRID
      + '" stroke-width="1"/>');

    /* Væggene: en streg hver gang et åbent felt støder op til noget lukket. */
    var walls = [];
    for (r = 0; r <= d.n_rows; r++)
      for (c = 0; c <= d.n_cols; c++) {
        if (!open(d, r, c)) continue;
        var x0 = c * CELL, y0 = r * CELL, x1 = x0 + CELL, y1 = y0 + CELL;
        if (!open(d, r - 1, c)) walls.push('M' + x0 + ' ' + y0 + 'H' + x1);
        if (!open(d, r + 1, c)) walls.push('M' + x0 + ' ' + y1 + 'H' + x1);
        if (!open(d, r, c - 1)) walls.push('M' + x0 + ' ' + y0 + 'V' + y1);
        if (!open(d, r, c + 1)) walls.push('M' + x1 + ' ' + y0 + 'V' + y1);
      }
    out.push('<path d="' + walls.join('') + '" fill="none" stroke="' + WALL
      + '" stroke-width="2.4" stroke-linecap="square"/>');

    d.door.forEach(function (door) { out.push(doorMark(d, door)); });
    d.stair.forEach(function (st) { out.push(stairMark(d, st)); });

    for (var id = 1; id <= d.n_rooms; id++) out.push(roomLabel(d, id));

    out.push('</svg>');
    return out.join('');
  }

  function tint(d, id, fill) {
    if (!id || !d.room[id]) return '';
    var room = d.room[id];
    return '<rect x="' + (room.west * CELL) + '" y="' + (room.north * CELL)
      + '" width="' + (room.width * CELL) + '" height="' + (room.height * CELL)
      + '" fill="' + fill + '"/>';
  }

  /* Dørene tegnes oven på hullet i væggen. Retningen læses af naboerne:
     er der åbent til venstre og højre, går gangen øst-vest. */
  function doorMark(d, door) {
    var r = door.row, c = door.col;
    if (!open(d, r, c)) return '';                 /* tilmuret — det er væg nu */
    var horiz = open(d, r, c - 1) && open(d, r, c + 1);
    var x = c * CELL, y = r * CELL, m = CELL / 2;
    var g = [];

    /* Karmene: to korte stykker væg i hver side af åbningen. */
    if (horiz) {
      g.push(seg(x, y, x + CELL, y), seg(x, y + CELL, x + CELL, y + CELL));
    } else {
      g.push(seg(x, y, x, y + CELL), seg(x + CELL, y, x + CELL, y + CELL));
    }

    var a = 3, b = CELL - 3;                        /* dørbladets længde */
    var t = 4.5;                                    /* dørbladets tykkelse */
    var leaf = horiz
      ? { x: x + m - t / 2, y: y + a, w: t, h: b - a }
      : { x: x + a, y: y + m - t / 2, w: b - a, h: t };

    switch (door.key) {
      case 'arch':
        break;                                      /* bare hullet */
      case 'open':
        g.push(rect(leaf, '#fff'));
        break;
      case 'lock':
        g.push(rect(leaf, WALL));
        break;
      case 'trap':
        g.push(rect(leaf, '#fff'));
        g.push(glyph(x + m, y + m, 'T'));
        break;
      case 'secret':
        g.push(horiz ? seg(x + m, y, x + m, y + CELL) : seg(x, y + m, x + CELL, y + m));
        g.push(glyph(x + m, y + m, 'S'));
        break;
      case 'portc':
        for (var i = 1; i <= 3; i++) {
          var p = a + (b - a) * i / 4;
          g.push(horiz ? seg(x + m - 4, y + p, x + m + 4, y + p)
                       : seg(x + p, y + m - 4, x + p, y + m + 4));
        }
        break;
    }
    return g.join('');
  }

  function seg(x1, y1, x2, y2) {
    return '<path d="M' + x1 + ' ' + y1 + 'L' + x2 + ' ' + y2 + '" stroke="'
      + WALL + '" stroke-width="2.4" stroke-linecap="square" fill="none"/>';
  }
  function rect(o, fill) {
    return '<rect x="' + o.x + '" y="' + o.y + '" width="' + o.w + '" height="'
      + o.h + '" fill="' + fill + '" stroke="' + WALL + '" stroke-width="1.4"/>';
  }
  function glyph(cx, cy, ch) {
    return '<text x="' + cx + '" y="' + (cy + 3.4) + '" text-anchor="middle" '
      + 'font-family="Georgia,serif" font-size="9" font-weight="bold" fill="'
      + WALL + '" paint-order="stroke" stroke="#fff" stroke-width="2.5">'
      + ch + '</text>';
  }

  /* Trappen: ribber på tværs af den retning man går, bredest hvor trinnene er
     nærmest. Ribberne alene ligner en gang på et print, så der står NED eller OP
     ved siden af — kort, for mærkatet lander oven i et rumnummer hvis det bliver
     langt. Hvad de betyder står i nøglen. */
  function stairGlyph(x, y, dr, dc) {
    var m = CELL / 2, g = [], i, p, len;
    for (i = 0; i < 5; i++) {
      p = 2 + (CELL - 4) * i / 4;
      len = 3 + 4.5 * i;
      if (dr !== 0) {
        var yy = (dr > 0) ? y + p : y + CELL - p;
        g.push('<path d="M' + (x + m - len / 2) + ' ' + yy + 'h' + len
          + '" stroke="' + WALL + '" stroke-width="1.6"/>');
      } else {
        var xx = (dc > 0) ? x + p : x + CELL - p;
        g.push('<path d="M' + xx + ' ' + (y + m - len / 2) + 'v' + len
          + '" stroke="' + WALL + '" stroke-width="1.6"/>');
      }
    }
    return g.join('');
  }

  function stairMark(d, st) {
    var x = st.col * CELL, y = st.row * CELL;
    var dr = (st.next_row === undefined ? st.row : st.next_row) - st.row;
    var dc = (st.next_col === undefined ? st.col : st.next_col) - st.col;
    var label = (st.key === 'down') ? 'NED' : 'OP';
    var ly = (st.row < d.n_rows / 2) ? y - 4 : y + CELL + 11;

    return stairGlyph(x, y, dr, dc)
      + '<text x="' + (x + CELL / 2) + '" y="' + ly + '" text-anchor="middle" '
      + 'font-family="Helvetica,Arial,sans-serif" font-size="9" '
      + 'font-weight="bold" letter-spacing="0.5" fill="' + WALL + '" '
      + 'paint-order="stroke" stroke="#fff" stroke-width="3.5">' + label + '</text>';
  }

  function roomLabel(d, id) {
    var room = d.room[id];
    if (!room) return '';
    var cx = (room.west + room.width / 2) * CELL;
    var cy = (room.north + room.height / 2) * CELL;
    var tall = room.height >= 3;
    var tag = (d.boss && d.boss.id === id) ? 'BOSS'
            : (d.safe && d.safe.id === id) ? 'SAFE' : '';
    var g = [];

    g.push('<text x="' + cx + '" y="' + (cy + (tall ? 0 : 5)) + '" '
      + 'text-anchor="middle" font-family="Georgia,serif" font-size="17" '
      + 'font-weight="bold" fill="#5a6070" paint-order="stroke" stroke="#fff" '
      + 'stroke-width="4">' + id + '</text>');

    /* Underteksten må ikke være bredere end rummet — den ville lægge sig hen over
       væggene. Er der ikke plads til det hele, ryger XP-tallet først; det står
       alligevel i tabellen. Bogstavbredden er et skøn på 4,8 px ved 8,5 px skrift. */
    if (tall) {
      var xpText = n(room.xp) + ' XP';
      var tries = tag ? [tag + ' · ' + xpText, tag] : [xpText, ''];
      var room_w = room.width * CELL - 2;
      var sub = '';
      for (var i = 0; i < tries.length; i++) {
        if (tries[i].length * 4.8 <= room_w) { sub = tries[i]; break; }
      }
      if (sub) {
        g.push('<text x="' + cx + '" y="' + (cy + 13) + '" text-anchor="middle" '
          + 'font-family="Helvetica,Arial,sans-serif" font-size="8.5" '
          + 'letter-spacing="0.4" fill="#5a6070" paint-order="stroke" stroke="#fff" '
          + 'stroke-width="3">' + sub + '</text>');
      }
    }
    return g.join('');
  }

  /* ---------- rapporten ---------- */

  var TIER_DA = { low: 'Low', moderate: 'Moderate', high: 'High' };

  function report(d) {
    var xp = d.xp, out = [];

    out.push('<table class="drep">');
    out.push(row('Seed', '<b>' + d.seed + '</b> — samme seed giver samme etage'));
    out.push(row('Etagen', d.n_rooms + ' rum · gitter ' + d.n_rows + ' × ' + d.n_cols
      + fitNote(d)));
    out.push(row('Indgang', d.entrance
      ? 'trappe op i en blindgang' : 'ingen — etagen har ingen blindgyder'));
    out.push(row('Bossrum', d.boss
      ? 'rum ' + d.boss.id + ', ' + d.boss.doors + ' døre ud' : 'ingen'));
    out.push(row('Trappen ned', d.boss
      ? 'inde i rum ' + d.boss.id + ', i den ende der ligger længst fra indgangen'
      : 'ingen'));
    out.push(row('Safe room', d.safe
      ? 'rum ' + d.safe.id + ', én dør ind og ud'
        + (d.safe.sealed ? ' (' + d.safe.sealed + ' dør'
            + (d.safe.sealed > 1 ? 'e' : '') + ' muret til)' : '')
      : '<b>ingen</b> — intet rum kunne lukkes ned til én dør'));

    out.push(gap());
    out.push(row('XP-budget', xp.size + ' spillere på level ' + xp.level
      + ' skal bruge ' + n(xp.need_each) + ' XP hver'));
    out.push(row('', '= ' + n(xp.need_party) + ' XP for holdet, × ' + d.xp_slack
      + ' slack = <b>' + n(xp.floor) + ' XP på etagen</b>'));
    out.push(row('Kampbudget', 'Low ' + n(xp.low) + ' · Moderate ' + n(xp.moderate)
      + ' · High ' + n(xp.high) + ' (for hele holdet)'));
    out.push(row('Bossen', n(xp.boss) + ' XP — én '
      + (TIER_DA[d.boss_fight] || d.boss_fight) + '-kamp'));
    out.push(row('Maks pr. rum', n(xp.cap) + ' XP'));
    out.push(row('Lagt ud', n(xp.placed) + ' XP'
      + (xp.short ? ' — <b>' + n(xp.short) + ' XP kunne ikke ligge i rummene '
          + 'uden at bryde loftet.</b> Læg dem i gangene, eller sænk slack.' : '')));
    out.push('</table>');

    out.push('<table class="drooms"><thead><tr><th>Rum</th><th>Mål</th>'
      + '<th>Døre</th><th>XP</th><th>Noter</th></tr></thead><tbody>');
    for (var id = 1; id <= d.n_rooms; id++) {
      var room = d.room[id];
      if (!room) continue;
      var note = [];
      if (d.boss && d.boss.id === id) note.push('BOSS + trappen ned');
      if (d.safe && d.safe.id === id) note.push('SAFE ROOM — står tomt');
      if (d.entrance && inRoom(room, d.entrance.row, d.entrance.col))
        note.push('indgang');
      out.push('<tr><td>' + id + '</td><td>' + room.width + ' × ' + room.height
        + '</td><td>' + doorsOf(d, room) + '</td><td>' + n(room.xp)
        + '</td><td>' + note.join(', ') + '</td></tr>');
    }
    out.push('</tbody></table>');
    return out.join('');
  }

  /* Etagen kan være lavet om undervejs for at få XP-budgettet til at ligge i
     rummene. Det skal stå på arket — ellers undrer man sig over, hvorfor det
     gitter man bad om ikke er det, man fik. */
  function fitNote(d) {
    var f = d.fit;
    if (!f || f.passes < 2) return '';
    if (f.grew) {
      return '<br><i>gjort større fra ' + f.asked_rows + ' × ' + f.asked_rows
        + ' — budgettet kunne ikke ligge i færre rum</i>';
    }
    return '<br><i>flere rum end sædvanligt, så budgettet kunne ligge der</i>';
  }

  function row(k, v) { return '<tr><th>' + k + '</th><td>' + v + '</td></tr>'; }
  function gap() { return '<tr class="gap"><th></th><td></td></tr>'; }

  function inRoom(room, r, c) {
    return r >= room.north && r <= room.south && c >= room.west && c <= room.east;
  }

  function doorsOf(d, room) {
    var seen = {}, count = 0;
    Object.keys(room.door || {}).forEach(function (dir) {
      room.door[dir].forEach(function (x) {
        var k = x.row + ',' + x.col;
        if (seen[k]) return;
        seen[k] = 1;
        if (open(d, x.row, x.col)) count++;
      });
    });
    return count;
  }

  /* Nøglen. Dørene i den tegnes af den samme kode som kortet — et lille
     kunstigt dungeon med én dør i — så de to aldrig kan komme til at vise
     forskellige ting. Og der kommer kun de dørtyper med, der faktisk står på
     etagen; en nøgle med seks slags døre hjælper ikke, hvis kun tre er i brug. */
  function doorSwatch(key) {
    var fake = {
      n_rows: 0, n_cols: 2,
      cell: [[B.CORRIDOR, B.CORRIDOR | B.DOOR, B.CORRIDOR]]
    };
    var mark = doorMark(fake, { row: 0, col: 1, key: key });
    return '<svg class="lg" viewBox="' + CELL + ' -2 ' + CELL + ' ' + (CELL + 4)
      + '" width="' + CELL + '" height="' + (CELL + 4) + '">' + mark + '</svg>';
  }

  function stairSwatch(dr) {
    return '<svg class="lg" viewBox="0 0 ' + CELL + ' ' + CELL + '" width="' + CELL
      + '" height="' + CELL + '">' + stairGlyph(0, 0, dr, 0) + '</svg>';
  }

  function legend(d) {
    var kinds = {}, out = [];
    d.door.forEach(function (x) { if (open(d, x.row, x.col)) kinds[x.key] = x.type; });

    if (d.boss) out.push('<li><span class="lg sw sw-boss"></span>Bossrum</li>');
    if (d.safe) out.push('<li><span class="lg sw sw-safe"></span>Safe room</li>');
    out.push('<li>' + stairSwatch(1) + 'Trappe — <b>OP</b> ind på etagen, '
      + '<b>NED</b> til den næste</li>');
    Object.keys(kinds).sort().forEach(function (k) {
      out.push('<li>' + doorSwatch(k) + esc(kinds[k]) + '</li>');
    });
    return '<ul class="dlegend">' + out.join('') + '</ul>';
  }

  /* ---------- arket ---------- */

  /* Alt er hængt op på .dsheet, så det samme stylesheet kan bruges to steder:
     lagt ind på Dungeon-siden ved siden af sidens egen CSS, og skrevet ind i
     den fil man henter. Ellers ville det man ser på skærmen og det man har på
     papiret være to stykker kode, der stille gled fra hinanden. */
  var SHEET_CSS = [
    '.dsheet,.dsheet *{box-sizing:border-box}',
    '.dsheet{padding:14mm;background:#fff;color:#14161c;',
    'font:13px/1.55 Helvetica,Arial,sans-serif}',
    '.dsheet h1{font:bold 21px Georgia,serif;margin:0 0 2px;color:#14161c;',
    'border:0;padding:0;letter-spacing:0}',
    '.dsheet .sub{color:#60656f;margin:0 0 14px;font-size:13px}',
    '.dsheet .dmap{width:100%;height:auto;display:block;margin:0 auto}',
    '.dsheet .dlegend{list-style:none;display:flex;flex-wrap:wrap;gap:6px 18px;',
    'margin:10px 0 0;padding:0;font-size:11.5px;color:#3a3f4a}',
    '.dsheet .dlegend li{display:flex;align-items:center;gap:6px}',
    '.dsheet .lg{flex:none;display:inline-block;vertical-align:middle}',
    '.dsheet .sw{width:16px;height:12px;border:1.4px solid #14161c}',
    '.dsheet .sw-boss{background:#e6eaf4;border-color:#9aa6c2}',
    '.dsheet .sw-safe{background:#e7f0e7;border-color:#9ac29a}',
    '.dsheet table{border-collapse:collapse;width:100%;margin:14px 0 0;',
    'font-size:12.5px;background:none}',
    '.dsheet th,.dsheet td{text-align:left;padding:3px 10px 3px 0;',
    'vertical-align:top;border:0;color:#14161c;background:none;',
    'font-size:12.5px;text-transform:none;letter-spacing:0}',
    '.dsheet .drep th{width:118px;color:#60656f;font-weight:600}',
    '.dsheet .drep tr.gap th,.dsheet .drep tr.gap td{padding:5px 0}',
    '.dsheet .drooms{margin-top:16px}',
    '.dsheet .drooms th{border-bottom:1.5px solid #14161c;padding-bottom:4px}',
    '.dsheet .drooms td{border-bottom:1px solid #e2e4ea}',
    '.dsheet .drooms td:nth-child(4),.dsheet .drooms th:nth-child(4){',
    'text-align:right;padding-right:22px}',
    '.dsheet footer{margin-top:16px;font-size:10.5px;color:#7a7f88}',
    '.dsheet footer a{color:inherit}',
    '@media print{.dsheet{padding:10mm}',
    /* Kortet får sin egen side, rapporten sin. Ellers deler rapporten sig
       midt over, og så kan man hverken lægge den ved siden af kortet eller
       læse den færdig. */
    '.dsheet .drep{page-break-before:always}',
    '.dsheet .drooms{page-break-inside:avoid}}'
  ].join('');

  var CREDIT = 'Kortet er lavet med DCC-D-D’s etagegenerator, bygget på '
    + '<b>Random Dungeon Generator af drow</b>, donjon.bin.sh, brugt og ændret '
    + 'under Creative Commons Attribution-NonCommercial 3.0 Unported. '
    + 'Ikke til kommerciel brug.';

  /* Selve arket — det samme indhold på skærmen og i filen. */
  function sheet(d) {
    return '<h1>Etage — seed ' + d.seed + '</h1>\n'
      + '<p class="sub">' + d.n_rooms + ' rum · ' + d.xp.size + ' spillere på level '
      + d.xp.level + ' · ' + n(d.xp.floor) + ' XP på etagen · ét felt er 5 fod</p>\n'
      + svg(d) + '\n' + legend(d) + '\n' + report(d) + '\n'
      + '<footer>' + CREDIT + '</footer>';
  }

  /* Filen man henter: ét dokument uden hverken net eller JavaScript, så den
     kan lægges på en USB-nøgle eller åbnes på en telefon uden dækning. */
  function page(d) {
    return '<!DOCTYPE html>\n<html lang="da">\n<head>\n<meta charset="utf-8">\n'
      + '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
      + '<title>Etage — seed ' + d.seed + '</title>\n<style>\n'
      + 'html,body{margin:0;background:#fff}\n'
      + '@page{size:A4 portrait;margin:0}\n'
      + SHEET_CSS + '\n</style>\n</head>\n<body class="dsheet">\n'
      + sheet(d) + '\n</body>\n</html>\n';
  }

  D.svg = svg;
  D.report = report;
  D.legend = legend;
  D.sheet = sheet;
  D.page = page;
  D.css = SHEET_CSS;
  D.CREDIT = CREDIT;
}(window));
