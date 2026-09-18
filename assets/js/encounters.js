/* DCC-D-D — fyld rummene med noget.
 *
 * Etagen giver hvert rum et XP-budget. Det siger hvor meget, ikke hvad. Her
 * bliver det til et forslag: navne og antal, som DM'en kan bruge direkte eller
 * bytte ud.
 *
 * Reglerne er SRD 5.2.1's egne, «Combat Encounters», trin 3: hver skabning har
 * en XP-værdi, og man bruger så meget af budgettet som man kan uden at gå over.
 * Et par XP til overs gør ikke noget. Dertil SRD'ens ene advarsel: er der mere
 * end to skabninger pr. karakter, skal de være skrøbelige — så det er loftet.
 *
 * Skabningerne kommer fra assets/data/monsters.js, trukket ud af SRD'en.
 */
(function (global) {
  'use strict';

  /* Etagen får en slags at bygge på, så rummene hænger sammen: goblins og
     worgs, ikke goblins og en isdjævel. Er der for få af den slags i det
     rigtige XP-spænd, tages resten hvor som helst. */
  var THEME_MIN = 4;

  function pick(rand, list) { return list[Math.floor(rand() * list.length)]; }

  function bestiary(rand, monsters, cap) {
    var usable = monsters.filter(function (m) { return m.xp > 0 && m.xp <= cap; });
    if (!usable.length) return null;

    var byType = {};
    usable.forEach(function (m) { (byType[m.type] || (byType[m.type] = [])).push(m); });
    var themes = Object.keys(byType).filter(function (t) {
      return byType[t].length >= THEME_MIN;
    });
    if (!themes.length) return { theme: usable, all: usable };

    var theme = pick(rand, themes);
    var out = byType[theme].slice();
    /* Lidt fra resten, så to etager med samme tema ikke bliver ens, og så der
       er noget at fylde de sidste XP ud med. */
    for (var i = 0; i < 4; i++) out.push(pick(rand, usable));
    return { theme: out, all: usable, name: theme };
  }

  /* Temaet er til for sammenhængens skyld, ikke for enhver pris. Er der ikke
     noget i den valgte slags der er stort nok til rummets budget, ender man
     med syv flagermus i et rum der skulle have haft en trold. Så vinder
     budgettet over temaet. */
  var THEME_FLOOR = 0.6;

  function best(rand, pool, budget, maxN, boss) {
    var fn = boss ? composeBoss : compose;
    var got = fn(rand, pool.theme, budget, maxN);
    if (budget > 0 && got.spent / budget < THEME_FLOOR && pool.all !== pool.theme) {
      var wide = fn(rand, pool.all, budget, maxN);
      if (wide.spent > got.spent) return wide;
    }
    return got;
  }

  /* Brug så meget af budgettet som muligt uden at gå over, og med højst
     `maxN` skabninger i alt. Op til to slags: én slags er et rum med fem
     goblins, to slags er et rum med fire goblins og en worg, og mere end det
     bliver en liste ingen kan overskue ved bordet. */
  /* Ét greb i posen er ikke nok. Et rum med 779 XP og otte pladser kan sagtens
     ende som otte pseudodragon til 50 — det er 400 XP brugt og 379 spildt, og
     reglen siger «så meget du kan». Så der prøves en håndfuld gange, og den
     der bruger mest vinder. Rammer én af dem budgettet præcist, er der ikke
     mere at hente, og så stopper den. */
  var TRIES = 12;

  function compose(rand, pool, budget, maxN) {
    var best = null;
    for (var t = 0; t < TRIES; t++) {
      var got = composeOnce(rand, pool, budget, maxN);
      if (!best || got.spent > best.spent) best = got;
      if (best.left === 0) break;
    }
    return best;
  }

  function composeOnce(rand, pool, budget, maxN) {
    var parts = [], left = budget, count = 0, k;

    for (k = 0; k < 2 && count < maxN; k++) {
      var fits = pool.filter(function (m) { return m.xp <= left; });
      if (!fits.length) break;

      /* En skabning til 10 XP kan ikke bruge et budget på 400, når der højst
         må være otte af dem. Så vælges der blandt dem der kan fylde det meste
         af det der er tilbage — findes der ingen, tages hvad der er. */
      var room = maxN - count;
      var big = fits.filter(function (m) { return m.xp * room >= left * 0.8; });
      var m = pick(rand, big.length ? big : fits);

      /* Den første slags må ikke tage alle pladserne, hvis den ikke kan bruge
         budgettet alene — ellers er der ingen plads til at fylde resten ud. */
      var n = Math.min(Math.floor(left / m.xp), room);
      if (k === 0 && n === room && n * m.xp < left) n = Math.max(1, n - 1);
      if (n < 1) break;
      parts.push({ name: m.name, cr: m.cr, n: n, xp: m.xp });
      left -= n * m.xp;
      count += n;
    }
    return { parts: parts, spent: budget - left, left: left, count: count };
  }

  /* Bossen er én kamp, og den læses bedst som én skabning. Derfor vælges den
     største der kan være der, og først derefter fyldes resten ud. */
  function composeBoss(rand, pool, budget, maxN) {
    var fits = pool.filter(function (m) { return m.xp <= budget; });
    if (!fits.length) return compose(rand, pool, budget, maxN);

    var top = fits[0];
    fits.forEach(function (m) { if (m.xp > top.xp) top = m; });

    var parts = [{ name: top.name, cr: top.cr, n: 1, xp: top.xp }];
    var rest = compose(rand, pool, budget - top.xp, maxN - 1);
    return {
      parts: parts.concat(rest.parts),
      spent: top.xp + rest.spent,
      left: rest.left,
      count: 1 + rest.count
    };
  }

  /* Læg et forslag i hvert rum der har XP. Rummene røres ikke ud over det —
     etagen er den samme, uanset om den er stokket eller ej. */
  function stock(d, monsters) {
    if (!d || !monsters || !monsters.length) return d;
    var rand = rng(d.seed ^ 0x5f3759df);
    var maxN = Math.max(2, 2 * (d.xp ? d.xp.size : 4));
    var pool = bestiary(rand, monsters, d.xp ? d.xp.cap : 1e9);
    if (!pool) return d;

    var bossId = d.boss ? d.boss.id : 0;
    for (var id = 1; id <= d.n_rooms; id++) {
      var room = d.room[id];
      if (!room || !(room.xp > 0)) continue;
      room.encounter = best(rand, pool, room.xp, maxN, room.id === bossId);
    }
    d.stocked = { theme: pool.name || null, max: maxN };
    return d;
  }

  /* Egen terning, så et rum kan stokkes uden at flytte kortet. Samme mulberry32
     som generatoren, men med sit eget seed afledt af etagens. */
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function text(enc) {
    if (!enc || !enc.parts.length) return '';
    return enc.parts.map(function (p) {
      return p.n + ' × ' + p.name;
    }).join(', ');
  }

  global.ENCOUNTERS = { stock: stock, text: text, compose: compose };
}(window));
