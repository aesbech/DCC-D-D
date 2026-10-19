#!/usr/bin/env python3
"""Træk SRD 5.2.1's fælder ud til assets/data/traps.js.

En fælde er indhold i et rum, men den er ikke en kamp. SRD'en giver fælder en
grad — Nuisance eller Deadly — og et niveauspænd, ikke en XP-værdi, så en
fælde trækker ikke på etagens XP-budget. Det er med vilje: en fælde koster
ressourcer og tid, ikke erfaring.

Der er kun otte af dem i SRD'en. Det er for få til en etage med flere fælder,
så vores egne ligger i assets/data/traps-dcc.js og lægges oveni — de to lister
har samme felter, og `srd` siger hvilken der er hvilken.

    python3 scripts/import_traps.py docs/SRD_CC_v5.2.1.pdf.txt

Tekstfilen laves som beskrevet i scripts/check_srd.py.
"""

import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "data" / "traps.js"

# «Spiked Pit Deadly Trap (Levels 1–4) Trigger: … Duration: …». Rolling Stone
# har to grader — «… (Levels 11–16) or Nuisance Trap (Levels 17–20)» — så den
# anden halvdel skal kunne springes over.
TRAP = re.compile(
    r"([A-Z][A-Za-z'’\- ]{2,40}?)\s+(Nuisance|Deadly)\s+Trap\s+"
    r"\(Levels?\s+(\d+)\s*[–-]\s*(\d+)\)"
    r"(?:\s+or\s+\w+\s+Trap\s+\(Levels?\s+\d+\s*[–-]\s*(\d+)\))?\s+"
    r"Trigger:\s*(.+?)\s+Duration:")

# Sidehovedet står midt i teksten, fordi en PDF ikke ved hvad en side er.
HEADER = re.compile(r"\s*System Reference Document [\d.]+\s*\d*\s*")

# Hvor fælden kan sidde. Det står ikke i SRD'en — den beskriver fælder, ikke
# hvor en generator må lægge dem — så det er læst af udløseren i hånden. En
# nål i en lås hører til på en dør; en rullende sten gør ikke. 'both' er de to
# der udløses af en snubletråd: den kan spændes over en døråbning.
WHERE = {
    "Collapsing Roof": "both",
    "Falling Net": "both",
    "Fire-Casting Statue": "room",
    "Hidden Pit": "room",
    "Poisoned Darts": "room",
    "Poisoned Needle": "door",
    "Rolling Stone": "room",
    "Spiked Pit": "room",
}


def clean_name(raw):
    """Alle syv fælder i SRD'en hedder noget på præcis to ord.

    Det er en regel om de data der er, ikke om fælder i al almindelighed —
    men uden den bliver «Hidden Pit» til «Cone Hidden Pit», fordi halen af
    en tabel over skaleringer står lige foran navnet.
    """
    return " ".join(raw.split()[-2:])


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    text = HEADER.sub(" ", re.sub(r"\s+", " ", Path(sys.argv[1]).read_text(encoding="utf-8")))

    out, seen = [], {}
    for m in TRAP.finditer(text):
        name = clean_name(m.group(1))
        if name in seen:
            continue
        seen[name] = 1
        out.append({
            "name": name,
            "severity": m.group(2),
            "where": WHERE.get(name, "room"),
            "srd": True,
            "min": int(m.group(3)),
            "max": int(m.group(5) or m.group(4)),
            "trigger": re.sub(r"\s+", " ", m.group(6)).strip().rstrip("."),
        })

    out.sort(key=lambda x: (x["severity"], x["name"]))
    payload = json.dumps(out, ensure_ascii=False, indent=1)
    version = hashlib.sha1(payload.encode("utf-8")).hexdigest()[:12]
    OUT.write_text(
        "/* Auto-genereret fra SRD 5.2.1 af scripts/import_traps.py.\n"
        "   System Reference Document 5.2.1 af Wizards of the Coast LLC,\n"
        "   CC BY 4.0 — den fulde kredit står i kolofonen og i LICENSE.md.\n"
        "   Fælder har ingen XP-værdi; de trækker ikke på etagens budget.\n"
        "   Vores egne fælder ligger i traps-dcc.js og lægges oveni. */\n"
        'window.TRAPS_VERSION = "%s";\n'
        "window.TRAPS = %s;\n" % (version, payload),
        encoding="utf-8")

    print("Skrev %d fælder til %s (version %s)"
          % (len(out), OUT.relative_to(ROOT), version))
    for x in out:
        print("  %-22s %-9s level %d-%d  %s"
              % (x["name"], x["severity"], x["min"], x["max"], x["trigger"][:48]))


if __name__ == "__main__":
    main()
