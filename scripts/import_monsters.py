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

    python3 scripts/import_monsters.py docs/SRD_CC_v5.2.1.pdf.txt

Tekstfilen laves som beskrevet i scripts/check_srd.py.
"""

import hashlib
import json
import re
import sys
from pathlib import Path

from monster_themes import by_name as themes_by_name

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "data" / "monsters.js"

SIZES = "Tiny|Small|Medium|Large|Huge|Gargantuan"

BLOCK = re.compile(
    r"([A-Z][A-Za-z'’\- ]{2,60}?)\s+(" + SIZES + r")\s+"
    r"([A-Z][a-zA-Z]+)[^,]{0,40},\s*[A-Za-z ]{3,30}?\s+AC\s+\d+")

CR = re.compile(r"\bCR\s+(\d+/\d+|\d+)\s*\(XP\s+([\d,]+)")

# Indholdsfortegnelsens linjer: «Goblin Warrior ......... 290»
INDEX = re.compile(r"([A-Z][A-Za-z'’\-, ]{2,40}?)\s*\.{4,}\s*\d{1,3}")


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    text = re.sub(r"\s+", " ", Path(sys.argv[1]).read_text(encoding="utf-8"))

    names = {m.group(1).strip() for m in INDEX.finditer(text)}
    names = {n for n in names if len(n) > 2}
    # Længste først, så «Goblin Warrior» vinder over «Goblin».
    by_len = sorted(names, key=len, reverse=True)

    seen, out = {}, []
    for m in BLOCK.finditer(text):
        cr = CR.search(text[m.end():m.end() + 4000])
        if not cr:
            continue
        raw = m.group(1).strip()
        name = next((n for n in by_len if raw.endswith(n)), None)
        if not name or name in seen:
            continue
        seen[name] = 1
        out.append({
            "name": name,
            "size": m.group(2),
            "type": m.group(3),
            "cr": cr.group(1),
            "xp": int(cr.group(2).replace(",", "")),
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
