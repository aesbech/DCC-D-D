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
 * Fælderne kommer fra to steder: SRD'ens otte i assets/data/traps.js og vores
 * egne 28 i assets/data/traps-dcc.js. De sidste er vores, fordi otte er for få
 * til tyve etager, og fordi en dør skal kunne have en fælde der passer til en
 * dør.
 */
(function (global) {
  'use strict';

  /* Et rum er ét sted, hvor nogen bor. Derfor er alt i rummet af samme slags:
     goblins og worgs, ikke goblins og en pegasus. Temaet står på hver skabning
     i monsters.js — det er en redaktionel inddeling, ikke SRD'ens type, for
     «Beast» rummer både en rotte og en tyrannosaurus.

     Reglen er enkel: træk det første monster, og fyld så resten af rummet med
     skabninger fra dens tema. Den første trækning afgør altså rummet.

     Etagen vælger en håndfuld temaer, som rummene trækker deres første
     monster fra. Uden det ville etagen blive et zoologisk udsnit — goblins i
     ét rum, engle i det næste, slim i det tredje. */
  var THEME_MIN = 4;
  var FLOOR_THEMES = 3;

  function pick(rand, list) { return list[Math.floor(rand() * list.length)]; }

  function topXp(list) {
    var top = 0;
    for (var i = 0; i < list.length; i++) if (list[i].xp > top) top = list[i].xp;
    return top;
  }

  function bestiary(rand, monsters, cap, want, maxN) {
    var usable = monsters.filter(function (m) { return m.xp > 0 && m.xp <= cap; });
    if (!usable.length) return null;

    var byTheme = {};
    usable.forEach(function (m) {
      var t = m.theme || m.type;
      (byTheme[t] || (byTheme[t] = [])).push(m);
    });
    var themes = Object.keys(byTheme).filter(function (t) {
      return byTheme[t].length >= THEME_MIN;
    });
    if (!themes.length) return { pool: usable, names: [] };

    /* Mindst ét af etagens temaer skal kunne bære bossen. Et tema som
       goblinoiderne topper ved 700 XP, men otte goblin bosses er 5.600 — så
       det er ikke den største skabning der afgør det, men den største gange
       hvor mange der må være i rummet. */
    var heavy = themes.filter(function (t) {
      return topXp(byTheme[t]) * Math.max(1, maxN) >= (want || 0);
    });
    var chosen = [pick(rand, heavy.length ? heavy : themes)];

    var rest = themes.filter(function (t) { return chosen.indexOf(t) < 0; });
    while (chosen.length < FLOOR_THEMES && rest.length) {
      chosen.push(rest.splice(Math.floor(rand() * rest.length), 1)[0]);
    }

    var pool = [];
    chosen.forEach(function (t) { pool = pool.concat(byTheme[t]); });
    return { pool: pool, names: chosen, byTheme: byTheme };
  }

  function best(rand, pool, budget, maxN, boss, theme, avoid) {
    var list = theme ? onlyTheme(pool, theme) : pool.pool;
    if (!list.length) list = pool.pool;
    return boss ? composeBoss(rand, list, budget, maxN, avoid)
                : compose(rand, list, budget, maxN);
  }

  function onlyTheme(pool, theme) {
    if (pool.byTheme && pool.byTheme[theme]) return pool.byTheme[theme];
    return pool.pool.filter(function (m) { return themeOf(m) === theme; });
  }

  function themeOf(m) { return m.theme || m.type; }

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
    var parts = [], left = budget, count = 0, theme = null, k;

    for (k = 0; k < 2 && count < maxN; k++) {
      /* Første træk er frit. Derefter er rummets tema afgjort, og anden slags
         skal være fra det samme — det er dét, der gør rummet til ét sted. */
      var fits = pool.filter(function (m) {
        return m.xp <= left && (theme === null || themeOf(m) === theme);
      });
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
      theme = themeOf(m);
      left -= n * m.xp;
      count += n;
    }
    return { parts: merge(parts), spent: budget - left, left: left,
             count: count, theme: theme };
  }

  /* Bossen er én kamp, og den læses bedst som én skabning. Derfor vælges den
     største der kan være der, og først derefter fyldes resten ud. */
  /* Hvor meget mindre end den største bossen må være, og hvor mange der
     vælges imellem. XP-værdierne ligger tyndt i toppen — 2.900, 3.900, 5.000 —
     så et snævert bånd rummer tit kun én skabning, og så bliver to bosser på
     samme etage tvillinger. Målt over 300 etager med flere bosser: et bånd på
     en halv gav 36 % tvillinger, en fjerdedel giver 7 %, og bossen er stadig
     over halvdelen af rummets budget i snit. */
  var BOSS_BAND = 0.25;
  var BOSS_PICKS = 4;

  function composeBoss(rand, pool, budget, maxN, avoid) {
    var fits = pool.filter(function (m) { return m.xp <= budget; });
    if (!fits.length) return compose(rand, pool, budget, maxN);

    /* Den største der kan være der — men ikke altid præcis den største. To
       bosser på samme etage med det samme budget blev ellers tvillinger, helt
       ned til følget. Så der vælges blandt de få største, og dem der allerede
       står i et andet bossrum på etagen springes over. */
    var heavy = fits.slice().sort(function (a, b) { return b.xp - a.xp; });
    var ceiling = heavy[0].xp;
    heavy = heavy.filter(function (m) { return m.xp >= ceiling * BOSS_BAND; })
                 .slice(0, BOSS_PICKS);
    if (avoid) {
      var fresh = heavy.filter(function (m) { return !avoid[m.name]; });
      if (fresh.length) heavy = fresh;
    }
    var top = pick(rand, heavy);

    /* Bossen er den første trækning, og dermed den der afgør temaet. Følget
       skal være hendes eget folk — en frostjætte med to andre frostjætter,
       ikke en frostjætte med to flagermus. */
    var parts = [{ name: top.name, cr: top.cr, n: 1, xp: top.xp }];
    var kin = pool.filter(function (m) { return themeOf(m) === themeOf(top); });
    var rest = compose(rand, kin, budget - top.xp, maxN - 1);
    return {
      parts: merge(parts.concat(rest.parts)),
      spent: top.xp + rest.spent,
      left: rest.left,
      count: 1 + rest.count,
      theme: themeOf(top)
    };
  }

  /* Bossen og følget kan være den samme slags — en trold med to trolde — og
     så stod der «1 × Treant, 1 × Treant» på arket. Det er to linjer om det
     samme bord. */
  function merge(parts) {
    var seen = {}, out = [];
    parts.forEach(function (p) {
      if (seen[p.name]) { seen[p.name].n += p.n; return; }
      seen[p.name] = { name: p.name, cr: p.cr, n: p.n, xp: p.xp };
      out.push(seen[p.name]);
    });
    return out;
  }

  /* Fælderne. To slags ligger i posen: SRD'ens otte, som har et niveauspænd og
     en skaleringstabel i bogen, og vores egne fra traps-dcc.js, som har DC og
     skade for hvert af de fire trin og derfor kan bruges hele vejen op.

     En fælde skal passe til stedet. En nål i en lås hører på en dør, en
     rullende sten hører i et rum, og en snubletråd kan begge steder — det er
     `where` der siger hvad der er hvad. Der slækkes aldrig på det: en
     faldgrube i en dørkarm er ikke en svær fælde, det er en der ikke giver
     mening. Niveauet slækkes der til gengæld på, hvis båndet er tomt — SRD'en
     har en tabel for hvordan dens egne skaleres opad. */
  var BANDS = [[1, 4], [5, 10], [11, 16], [17, 20]];

  function bandOf(level) {
    for (var i = 0; i < BANDS.length; i++)
      if (level <= BANDS[i][1]) return i;
    return BANDS.length - 1;
  }

  function placeable(t, where) {
    var w = t.where || 'room';
    return w === where || w === 'both';
  }

  /* Et kort over de fælder der faktisk er lagt ud, så den samme ikke kommer
     igen, før hele posen er brugt. Med fem fælder i rummene og fem på dørene
     var det ellers oftere end man tror: fødselsdagsparadokset gælder også
     for faldgruber. */
  function trapFor(rand, traps, level, where, used, grade, mayBlock) {
    if (!traps || !traps.length) return null;
    var here = traps.filter(function (t) {
      if (!placeable(t, where)) return false;
      /* Loftet over graden. SRD'en har to, og en Deadly fælde kan vælte en
         karakter på level 1 med ét rul — derfor kan man sætte den fra. */
      if (grade === 'nuisance' && t.severity !== 'Nuisance') return false;
      /* En fælde der efterlader døren ubrugelig kan kun sidde, hvor der er
         en anden vej ind. Ellers spærrer etagen sig selv. */
      if (t.blocks && !mayBlock) return false;
      return true;
    });
    if (!here.length) return null;

    var band = here.filter(function (t) {
      if (t.dc) return true;                   /* vores egne skalerer selv */
      return level >= t.min && level <= t.max;
    });
    if (!band.length) band = here;

    var fresh = band.filter(function (t) { return !used[t.name]; });
    /* Er posen tom, vendes den om og tælles forfra. Det kan ske: med fuld
       mætning og tre fjerdedele fælder er der flere fælder på etagen end der
       findes i alt. Så gentager de sig — men jævnt, og ikke tre gange i træk
       fordi terningen var i humør til det. */
    if (!fresh.length) {
      band.forEach(function (t) { delete used[t.name]; });
      fresh = band;
    }
    var t = pick(rand, fresh);
    used[t.name] = 1;
    return scale(t, level);
  }

  /* Vores egne fælder står med {dc} og {dmg} i teksten og en liste med et tal
     for hvert trin. Her bliver de til én fælde med tallene skrevet ind, så
     arket ikke skal kende til trin. SRD'ens går uberørt igennem: deres
     skalering står i bogen, og den er ikke min at skrive om. */
  function scale(t, level) {
    if (!t.dc) return t;
    var i = bandOf(level);
    var dc = t.dc[Math.min(i, t.dc.length - 1)];
    var dmg = t.dmg ? t.dmg[Math.min(i, t.dmg.length - 1)] : '';
    var out = { band: BANDS[i][0] + '-' + BANDS[i][1] };
    Object.keys(t).forEach(function (k) {
      out[k] = (typeof t[k] === 'string')
        ? t[k].replace(/\{dc\}/g, dc).replace(/\{dmg\}/g, dmg)
        : t[k];
    });
    return out;
  }

  /* Læg et forslag i hvert rum der har noget i sig. Rummene røres ikke ud over
     det — etagen er den samme, uanset om den er stokket eller ej. */
  function stock(d, monsters, traps) {
    if (!d || !monsters || !monsters.length) return d;
    var rand = rng(d.seed ^ 0x5f3759df);
    var maxN = Math.max(2, 2 * (d.xp ? d.xp.size : 4));
    var pool = bestiary(rand, monsters, d.xp ? d.xp.cap : 1e9,
                        d.xp ? d.xp.boss : 0, maxN);
    if (!pool) return d;
    var level = d.xp ? d.xp.level : 1;
    var grade = (d.trap_grade === 'nuisance') ? 'nuisance' : 'all';
    var used = {};

    /* Bosserne først. Forkammeret er bossens eget forværelse, så det skal
       befolkes af hendes folk — og det kan det kun, hvis hun er trukket. */
    var anteTheme = {}, leads = {};
    (d.bosses || []).forEach(function (b) {
      var room = d.room[b.id];
      if (!room || !(room.xp > 0)) return;
      var got = best(rand, pool, room.xp, maxN, true, null, leads);
      if (got.parts.length) leads[got.parts[0].name] = 1;
      room.encounter = got;
      if (b.ante && got.theme) anteTheme[b.ante] = got.theme;
    });

    for (var id = 1; id <= d.n_rooms; id++) {
      var room = d.room[id];
      if (!room || room.encounter) continue;
      if (room.trap) {
        var t = trapFor(rand, traps, level, 'room', used, grade, false);
        if (t) room.encounter = { trap: t, parts: [], spent: 0, left: 0, count: 0 };
        continue;
      }
      if (!(room.xp > 0)) continue;
      room.encounter = best(rand, pool, room.xp, maxN, false, anteTheme[id]);
    }

    /* Fældedørene. Generatoren siger at døren har en fælde; her bliver den til
       en bestemt fælde. Dørobjekterne deles af begge rum — fixDoors lagde den
       samme reference i to lister — så det er nok at sætte den ét sted. */
    var doors = 0, blocked = 0;
    (d.door || []).forEach(function (door) {
      if (door.key !== 'trap' || door.trap) return;
      var t = trapFor(rand, traps, level, 'door', used, grade, !door.vital);
      if (!t) return;
      door.trap = t; doors++;
      if (t.blocks) blocked++;
    });

    d.stocked = { themes: pool.names || [], max: maxN,
                  traps: traps ? traps.length : 0,
                  srd_traps: (traps || []).filter(function (t) {
                    return t.srd;
                  }).length,
                  door_traps: doors, blocked_doors: blocked,
                  grade: grade };
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
    if (!enc) return '';
    if (enc.trap) return enc.trap.name + ' (' + enc.trap.severity + ')';
    if (!enc.parts.length) return '';
    return enc.parts.map(function (p) {
      return p.n + ' × ' + p.name;
    }).join(', ');
  }

  global.ENCOUNTERS = { stock: stock, text: text, compose: compose };
}(window));
