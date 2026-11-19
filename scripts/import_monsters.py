#!/usr/bin/env python3
"""Træk SRD 5.2.1's monstre ud til assets/data/monsters.js.

Etagearket siger hvor meget XP der må stå i et rum. For at kunne skrive et
forslag til hvad, skal der en liste over skabninger til med deres XP-værdi.
Den står i SRD'en, som er frigivet under CC BY 4.0 — se LICENSE.md.

PDF'en har ingen struktur at læse, kun tekst i læserækkefølge, så der er to
greb i spil:

  Navnene tages fra indholdsfortegnelsen bagerst i «Monsters A–Z», hvor de
  står rene med sidetal. Det er den eneste liste i dokumentet hvor et navn
  står for sig selv.

  Selve blokkene findes på formen «<navn> <størrelse> <type>, <alignment> AC».
  Den tekst der står før størrelsen indeholder tit også sidehovedet og
  afsnitsoverskriften — «Animated Objects Animated Armor» — så navnet er det
  længste navn fra indholdsfortegnelsen, som teksten ender på.

    node scripts/extract_srd_text.mjs docs/SRD_CC_v5.2.1.pdf srd-rich.txt
    python3 scripts/import_monsters.py srd-rich.txt

Udtrækket skal have skriften med, så blokkene kan findes på deres struktur.
Uden den må CR findes med en søgning i den flade tekst, og PDF'en har to
spalter: i læserækkefølgen kan den næste skabnings CR stå før denne skabnings
egen. Det gav fire drager en CR og en XP-værdi der hørte til naboen, og det
skjulte 36 skabninger helt — alle humanoiderne, lykantroperne og vampyrerne.
"""

import hashlib
import json
import re
import sys
from pathlib import Path

from monster_themes import by_name as themes_by_name
from import_statblocks import items, starts, scan, tidy, SIZELINE

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "data" / "monsters.js"

SIZES = "Tiny|Small|Medium|Large|Huge|Gargantuan"

# SRD'en skriver CR-linjen på to måder: «CR 1/4 (XP 50; PB +2)» og
# «CR 2 (450 XP; PB +2)». Begge skal læses, ellers falder netop de
# skabninger ud der bruger den anden form.
CR = re.compile(r"(\d+/\d+|\d+)\s*\((?:XP\s+([\d,]+)|([\d,]+)\s*XP)")
KIND = re.compile(r"^(" + SIZES + r")(?:\s+or\s+(?:" + SIZES + r"))?\s+([A-Z][a-zA-Z]+)")

# Indholdsfortegnelsens linjer: «Goblin Warrior ......... 290»
INDEX = re.compile(r"([A-Z][A-Za-z'’\-, ]{2,40}?)\s*\.{4,}\s*\d{1,3}")


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    all_items = items(sys.argv[1])
    flat = re.sub(r"\s+", " ", "".join(t for f, t in all_items))

    # Navnene står rene med sidetal i indholdsfortegnelsen. Det er den eneste
    # liste i dokumentet hvor et navn står for sig selv.
    names = {m.group(1).strip() for m in INDEX.finditer(flat)}
    names = {n for n in names if len(n) > 2}

    seen, out = {}, []
    marks = starts(all_items, names)
    for n, (i, name) in enumerate(marks):
        if name in seen:
            continue
        stop = marks[n + 1][0] if n + 1 < len(marks) else len(all_items)
        block = all_items[i:stop]

        j = scan(block, 1, lambda t: bool(SIZELINE.match(t)), 4)
        if j < 0:
            continue
        kind = KIND.match(tidy(block[j][1]))
        if not kind:
            continue

        # CR står i blokkens egen CR-etiket. Den må ikke findes med en søgning
        # i den flade tekst: PDF'en har to spalter, og i læserækkefølgen kan
        # den næste skabnings CR stå før denne skabnings egen.
        k = [x for x in range(len(block)) if block[x][1].strip() == "CR"]
        if not k:
            continue
        cr = CR.match(tidy("".join(t for f, t in block[k[0] + 1:k[0] + 8])))
        if not cr:
            continue

        seen[name] = 1
        out.append({
            "name": name,
            "size": kind.group(1),
            "type": kind.group(2),
            "cr": cr.group(1),
            "xp": int((cr.group(2) or cr.group(3)).replace(",", "")),
        })

    # XP 0-skabninger kan ikke bruges til et budget.
    out = [x for x in out if x["xp"] > 0]
    out.sort(key=lambda x: (x["xp"], x["name"]))

    # Temaet er redaktionelt og står i monster_themes.py. Her tjekkes kun, at
    # de to lister passer sammen: ingen skabning uden tema, intet tema uden
    # skabning. Sker der noget med udtrækket, siger det fra med det samme.
    themes = themes_by_name()
    missing = sorted(x["name"] for x in out if x["name"] not in themes)
    if missing:
        sys.exit("Uden tema i scripts/monster_themes.py: " + ", ".join(missing))
    extra = sorted(set(themes) - {x["name"] for x in out})
    if extra:
        sys.exit("Står i monster_themes.py, men findes ikke i SRD-udtrækket: "
                 + ", ".join(extra))
    for x in out:
        x["theme"] = themes[x["name"]]

    payload = json.dumps(out, ensure_ascii=False, indent=1)
    version = hashlib.sha1(payload.encode("utf-8")).hexdigest()[:12]
    OUT.write_text(
        "/* Auto-genereret fra SRD 5.2.1 af scripts/import_monsters.py.\n"
        "   System Reference Document 5.2.1 af Wizards of the Coast LLC,\n"
        "   CC BY 4.0 — den fulde kredit står i kolofonen og i LICENSE.md. */\n"
        'window.MONSTERS_VERSION = "%s";\n'
        "window.MONSTERS = %s;\n" % (version, payload),
        encoding="utf-8")

    print("Skrev %d skabninger til %s (version %s)"
          % (len(out), OUT.relative_to(ROOT), version))
    lo = [x for x in out if x["xp"] <= 100]
    print("  brugbare på level 1 (op til 100 XP): %d" % len(lo))
    print("  billigste:", ", ".join("%s %d" % (x["name"], x["xp"]) for x in out[:5]))
    print("  dyreste:  ", ", ".join("%s %d" % (x["name"], x["xp"]) for x in out[-3:]))

    print("\n  Temaer — antal, og hvor stort et rum de kan fylde:")
    seen = {}
    for x in out:
        seen.setdefault(x["theme"], []).append(x)
    for theme in sorted(seen, key=lambda t: -max(x["xp"] for x in seen[t])):
        bunch = seen[theme]
        print("    %-24s %2d skabninger  %6d-%s XP"
              % (theme, len(bunch), min(x["xp"] for x in bunch),
                 "{:,}".format(max(x["xp"] for x in bunch)).replace(",", ".")))


if __name__ == "__main__":
    main()
