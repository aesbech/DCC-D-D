#!/usr/bin/env python3
"""Træk SRD 5.2.1's stat blocks ud til assets/data/statblocks.js.

monsters.js har navn, størrelse, type, CR og XP — nok til at vælge hvad der
står i et rum, og ikke nok til at køre kampen. Det her er resten: AC, hit
points, bevægelse, evner, færdigheder, sanser, sprog og alle de ting
skabningen kan gøre. Arket trykker dem for de skabninger etagen faktisk
bruger, så DM'en ikke skal bladre i en PDF på 364 sider midt i en kamp.

SRD 5.2.1 er CC BY 4.0, så teksten må godt trykkes — kreditten står i
kolofonen og i LICENSE.md.

PDF'en har ingen struktur, kun tekst i læserækkefølge. Tre greb bærer det:

  En blok begynder med navnet i sit eget stykke, derefter linjen med størrelse
  og type, derefter AC. Navnene kommer fra monsters.js. Der kigges et par
  stykker frem hver gang, for der ligger stumper imellem: navnet står to gange
  i træk over nogle blokke, det er delt i to over andre, og en alignment som
  «Neutral Evil» kan være delt midt over.

  En handlings navn er sat med fed. Det er den eneste sikre markering af hvor
  en handling begynder — afstande i teksten er for usikre, for en kort sætning
  ser ud som et navn. Derfor læses PDF'en med skriften i behold.

  Skrift-id'erne er per side og ikke per dokument, så de må kun sammenlignes
  inden for den samme blok. Det er nok: dér er brødteksten den hyppigste
  skrift, det første stykke efter en afsnitsoverskrift er altid et navn, og
  alt andet er overskrift eller kursiv etiket.

    node scripts/extract_srd_text.mjs docs/SRD_CC_v5.2.1.pdf srd-rich.txt
    python3 scripts/import_statblocks.py srd-rich.txt

Tekststykkerne står som \x01<side>:<skrift>\x02<tekst>.
"""

import hashlib
import json
import re
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "data" / "statblocks.js"
MONSTERS = ROOT / "assets" / "data" / "monsters.js"

SIZES = "Tiny|Small|Medium|Large|Huge|Gargantuan"
SIZELINE = re.compile(r"^(?:" + SIZES + r")(?:\s+or\s+(?:" + SIZES + r"))?\s+[A-Z]")

# Sidehovedet står som alle andre tekststykker, og sidetallet står lige efter
# det. Tallet må kun kastes væk dér: et tal på tre cifre er lige så tit en AC,
# en evneværdi eller et antal hit points.
HEADER = re.compile(r"^System Reference Document [\d.]+$")
PAGENO = re.compile(r"^\d{1,3}$")

# Etiketterne i hovedet, i SRD'ens egen rækkefølge. CR slutter hovedet.
LABELS = ["AC", "Initiative", "HP", "Speed", "Skills", "Gear", "Resistances",
          "Immunities", "Vulnerabilities", "Senses", "Languages", "CR"]

SECTIONS = ["Traits", "Actions", "Bonus Actions", "Reactions",
            "Legendary Actions"]

# De seks evner står i en tabel der falder fra hinanden i udtrækket:
# «S tr 18 +4 +4 D ex 10 +0 +6 …». Bogstaverne kan være delt hvor som helst.
SP = r"[\s]*"
ABILITY = {
    "str": "S" + SP + "t" + SP + "r", "dex": "D" + SP + "e" + SP + "x",
    "con": "C" + SP + "o" + SP + "n", "int": "I" + SP + "n" + SP + "t",
    "wis": "W" + SP + "I?" + SP + "[sS]", "cha": "C" + SP + "h" + SP + "a",
}
NUM = (r"(\d+)" + SP + r"([+−-]" + SP + r"\d+)" + SP + r"([+−-]?" + SP + r"\d+)")

# Udtrækket taber af og til minustegnet på et saving throw — «−2» bliver til
# «2». Tallene selv er rigtige, og uden proficiency er et saving throw lig
# modifikatoren, så fortegnet kan hentes derfra når cifrene er de samme.
REPAIRED = []


def items(path):
    """Tekststykkerne med deres skrift, uden sidehoveder."""
    out, after_header = [], False
    for piece in Path(path).read_text(encoding="utf-8").split("\x01")[1:]:
        font, _, text = piece.partition("\x02")
        bare = text.strip()
        if HEADER.match(bare):
            after_header = True
            continue
        if after_header and PAGENO.match(bare):
            after_header = False
            continue
        if bare:
            after_header = False
        out.append((font, text))
    return out


def tidy(t):
    """Ét mellemrum, og orddeling ved linjeskift samlet igen.

    PDF'en siger selv hvor linjerne slutter, saa et ord der er delt over to
    linjer staar som «move-\nment» og kan samles uden at gætte."""
    t = re.sub(r"(\w)-\n\s*([a-zæøå])", r"\1\2", t)
    return re.sub(r"\s+", " ", t).strip()


def sign(t):
    return tidy(t).replace("−", "-").replace(" ", "")


def nextFull(block, i):
    """Næste stykke med tekst i."""
    while i < len(block) and not block[i][1].strip():
        i += 1
    return i


def scan(all_items, i, test, limit):
    """Kig frem efter et stykke der passer, højst `limit` stykker med tekst i."""
    seen = 0
    while i < len(all_items) and seen < limit:
        t = all_items[i][1].strip()
        if t:
            if test(t):
                return i
            seen += 1
        i += 1
    return -1


def starts(all_items, names):
    """Hvor begynder hver skabnings blok?

    Navnet i sit eget stykke, derefter linjen med størrelse og type, derefter
    AC. Overskriften i indholdsfortegnelsen står også alene, men den har ikke
    de to linjer efter sig.

    Der kigges et par stykker frem hver gang, for der ligger stumper imellem:
    navnet står to gange i træk over «Nightmare», det er delt i «Gray» og
    «Ooze» over «Gray Ooze», og en alignment som «Neutral Evil» kan være delt
    midt over.
    """
    out = []
    for i, (font, text) in enumerate(all_items):
        name = text.strip()
        if name not in names:
            continue
        j = scan(all_items, i + 1, lambda t: bool(SIZELINE.match(t)), 4)
        if j < 0:
            continue
        k = scan(all_items, j + 1, lambda t: t == "AC", 4)
        if k < 0:
            continue
        out.append((i, name))

    # Navnet staar to gange i traek over nogle blokke — det er den sidste af
    # dem der er selve overskriften, og den foerste ville give en blok paa ét
    # stykke.
    tight = []
    for n, (i, name) in enumerate(out):
        if n + 1 < len(out) and out[n + 1][1] == name and out[n + 1][0] - i < 4:
            continue
        tight.append((i, name))
    return tight


def abilities(name, text):
    out = {}
    for key, pat in ABILITY.items():
        m = re.search(pat + SP + NUM, text)
        if not m:
            return None
        mod, save = sign(m.group(2)), sign(m.group(3))
        if save[0] not in "+-":
            if save == mod.lstrip("+-"):
                save = mod[0] + save if mod[0] in "+-" else save
                REPAIRED.append(name + " " + key)
            else:
                save = "+" + save
                REPAIRED.append(name + " " + key + " (gættet +)")
        out[key] = {"score": int(m.group(1)), "mod": mod, "save": save}
    return out


def parse(name, block, names):
    """Én blok: hoved, evner og afsnit."""
    full = [x for x in block if x[1].strip()]
    if len(full) < 12:
        return None
    body = Counter(f for f, t in full).most_common(1)[0][0]

    got = {"name": name}
    i = scan(block, 1, lambda t: bool(SIZELINE.match(t)), 4)
    if i < 0:
        return None
    got["kind"] = tidy(block[i][1])

    # Hovedet: etiket, så værdi, indtil CR er læst.
    head, label, buf = {}, None, []
    i = nextFull(block, i + 1)
    while i < len(block):
        t = block[i][1].strip()
        if t in ("MOD", "SAVE"):
            if label:
                head[label] = tidy(" ".join(buf))
            label, buf = None, []
        elif t in LABELS:
            if label:
                head[label] = tidy(" ".join(buf))
            label, buf = t, []
            if t == "CR":
                i += 1
                while i < len(block) and block[i][1].strip() not in SECTIONS:
                    buf.append(block[i][1])
                    i += 1
                head["CR"] = tidy(" ".join(buf))
                break
        elif label:
            buf.append(block[i][1])
        i += 1

    for key in ["AC", "Initiative", "HP", "Speed", "Skills", "Gear",
                "Resistances", "Immunities", "Vulnerabilities", "Senses",
                "Languages", "CR"]:
        got[key.lower()] = head.get(key, "")
    if not got["cr"]:
        return None

    # Evnetabellen ligger mellem Speed og den første af de øvrige etiketter.
    table = []
    seen_mod = False
    for f, t in block:
        s = t.strip()
        if s in ("MOD", "SAVE"):
            seen_mod = True
            continue
        if not seen_mod:
            continue
        if s in ("Skills", "Gear", "Resistances", "Immunities",
                 "Vulnerabilities", "Senses", "Languages", "CR"):
            break
        table.append(t)
    got["abilities"] = abilities(name, " ".join(table))
    if not got["abilities"]:
        return None

    got["sections"] = parse_sections(block, i, body, names)
    return got


def parse_sections(block, i, body, names):
    """Afsnittene.

    En handlings navn er sat med fed. Hvilken skrift det er, siger blokken
    selv: det første stykke efter en afsnitsoverskrift er altid et navn. Uden
    det greb bliver «+4, reach 5 ft.» også taget for et navn, for den står
    ogsaa med sin egen skrift og slutter paa punktum.
    """
    out, here, entry, nameFont = [], None, None, None

    # Hvert navn og hver forstavelse af et navn: sidehovedet kan være delt,
    # så «Merfolk Skirmisher» står som «Merfolk».
    heads = set()
    for n in names:
        parts = n.split(" ")
        for k in range(1, len(parts) + 1):
            heads.add(" ".join(parts[:k]))

    def shut():
        if here is not None and (entry is None or not entry["text"]):
            pass
        if here is not None and here["entries"]:
            out.append(here)

    while i < len(block):
        font, text = block[i]
        s = text.strip()
        if s in SECTIONS:
            shut()
            here = {"name": s, "entries": []}
            entry = None
            j = nextFull(block, i + 1)
            nameFont = block[j][0] if j < len(block) else None
        elif here is not None:
            # En blok kan gå over et sideskift, og så står næste skabnings
            # navn og sidetallet midt inde i teksten som løbende sidehoved.
            # De skal springes over — ikke afslutte blokken, for teksten
            # fortsætter på den anden side.
            if font != body and (s in heads or PAGENO.match(s)):
                i += 1
                continue
            name = s.rstrip()
            isName = (font == nameFont and name.endswith(".")
                      and len(name) <= 70 and not name.endswith(".."))
            if isName:
                entry = {"name": tidy(name).rstrip("."), "text": ""}
                here["entries"].append(entry)
            else:
                if entry is None:
                    entry = {"name": "", "text": ""}
                    here["entries"].append(entry)
                entry["text"] += text + " "
        i += 1
    shut()

    for sec in out:
        sec["entries"] = [{"name": e["name"], "text": tidy(e["text"])}
                          for e in sec["entries"]
                          if e["name"] or tidy(e["text"])]
    return [s for s in out if s["entries"]]


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    all_items = items(sys.argv[1])

    known = json.loads(re.search(r"window\.MONSTERS = (\[.*?\]);",
                                 MONSTERS.read_text(encoding="utf-8"), re.S).group(1))
    names = {m["name"] for m in known}

    marks = starts(all_items, names)
    seen, out = {}, []
    for n, (i, name) in enumerate(marks):
        if name in seen:
            continue
        stop = marks[n + 1][0] if n + 1 < len(marks) else len(all_items)
        got = parse(name, all_items[i:stop], names)
        if not got:
            continue
        seen[name] = 1
        out.append(got)

    out.sort(key=lambda x: x["name"])
    payload = json.dumps(out, ensure_ascii=False, separators=(",", ":"))
    version = hashlib.sha1(payload.encode("utf-8")).hexdigest()[:12]
    OUT.write_text(
        "/* Auto-genereret fra SRD 5.2.1 af scripts/import_statblocks.py.\n"
        "   System Reference Document 5.2.1 af Wizards of the Coast LLC,\n"
        "   CC BY 4.0 — den fulde kredit står i kolofonen og i LICENSE.md.\n"
        "   Teksten er Wizards', trykt under den licens og ikke redigeret. */\n"
        'window.STATBLOCKS_VERSION = "%s";\n'
        "window.STATBLOCKS = %s;\n" % (version, payload),
        encoding="utf-8")

    missing = sorted(names - set(seen))
    print("Skrev %d stat blocks til %s (version %s, %.0f KB)"
          % (len(out), OUT.relative_to(ROOT), version, OUT.stat().st_size / 1024))
    if missing:
        print("  UDEN stat block (%d): %s" % (len(missing), ", ".join(missing)))
    thin = [x["name"] for x in out if not x["sections"] or not x["hp"]]
    if thin:
        print("  tynde (%d): %s" % (len(thin), ", ".join(thin[:10])))
    if REPAIRED:
        print("  fortegn hentet fra modifikatoren (%d): %s"
              % (len(REPAIRED), ", ".join(REPAIRED)))


if __name__ == "__main__":
    main()
