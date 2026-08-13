#!/usr/bin/env python3
"""Konverterer data/spells.txt (skrabet fra D&D Beyond) til assets/data/spells.js.

Brug:
    python3 scripts/import_spells.py [sti/til/fil.txt]

Hver post starter med niveauet, så navnet, så en linje med "Skole • Komponenter".
Derefter følger en række mærkede felter ("Level", "Casting Time", "Range/Area",
"Components", "Duration", "School"), som er dem der læses — rækkefølgen af de
uformatterede linjer øverst varierer.

Listen bruges til spell scrolls og tomes: når et sådant kort trækkes, rulles
der en spell af det niveau kortet har.
"""

import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SRC = ROOT / "data" / "spells.txt"
OUT = ROOT / "assets" / "data" / "spells.js"

LEVELS = {"Cantrip": 0, "1st": 1, "2nd": 2, "3rd": 3, "4th": 4,
          "5th": 5, "6th": 6, "7th": 7, "8th": 8, "9th": 9}

FIELDS = [
    ("Casting Time", "castingTime"),
    ("Range/Area", "range"),
    ("Components", "components"),
    ("Duration", "duration"),
    ("School", "school"),
    ("Attack/Save", "save"),
    ("Damage/Effect", "effect"),
]

# Klasselister fra D&D Beyond rummer både 2024-klasser og "(Legacy)"-varianter
# samt underklasser. Kun grundklasserne er interessante på et kort.
CLASSES = {"Artificer", "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk",
           "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"}


def clean(value):
    return re.sub(r"\s+", " ", str(value or "")).strip()


def find_field(rec, label):
    """Mærkede felter står som label på én linje og værdien på den næste."""
    for i, line in enumerate(rec):
        if line == label and i + 1 < len(rec):
            return clean(rec[i + 1])
    return ""


def split_records(lines):
    starts = [
        i for i in range(len(lines) - 2)
        if lines[i] in LEVELS
        and lines[i + 1]
        and lines[i + 1] not in LEVELS
        and "•" in lines[i + 2]
    ]
    return [lines[s:(starts[n + 1] if n + 1 < len(starts) else len(lines))]
            for n, s in enumerate(starts)]


def description(rec):
    """Brødteksten ligger mellem det sidste mærkede felt og 'View Details Page'."""
    try:
        end = rec.index("View Details Page")
    except ValueError:
        end = len(rec)

    start = 0
    for label, _ in FIELDS:
        if label in rec[:end]:
            idx = rec.index(label)
            start = max(start, idx + 2)

    parts = [clean(l) for l in rec[start:end] if clean(l)]
    return " ".join(parts)


def classes_of(rec):
    if "Available For:" not in rec:
        return []
    out = []
    for line in rec[rec.index("Available For:") + 1:]:
        name = clean(line)
        if name in CLASSES and name not in out:
            out.append(name)
    return sorted(out)


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SRC
    if not src.exists():
        sys.exit(f"Fandt ikke {src}")

    lines = [l.rstrip() for l in src.read_text(encoding="utf-8").replace("’", "'").split("\n")]

    spells = []
    for rec in split_records(lines):
        level = LEVELS[rec[0]]
        name = clean(rec[1])
        if not name:
            continue

        spell = {"name": name, "level": level}
        for label, key in FIELDS:
            value = find_field(rec, label)
            if value:
                spell[key] = value

        # Skolen står også i "Skole • Komponenter"-linjen, som reserve.
        if "school" not in spell and "•" in rec[2]:
            spell["school"] = clean(rec[2].split("•")[0])

        cls = classes_of(rec)
        if cls:
            spell["classes"] = cls

        desc = description(rec)
        if desc:
            spell["desc"] = desc

        spells.append(spell)

    spells.sort(key=lambda s: (s["level"], s["name"]))
    payload = json.dumps(spells, ensure_ascii=False, indent=1)
    version = hashlib.sha1(payload.encode("utf-8")).hexdigest()[:12]

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "/* Auto-genereret fra %s. Kør scripts/import_spells.py igen efter ændringer. */\n"
        'window.SPELLS_VERSION = "%s";\n'
        "window.SPELLS = %s;\n" % (src.name, version, payload),
        encoding="utf-8",
    )

    per_level = {}
    for s in spells:
        per_level[s["level"]] = per_level.get(s["level"], 0) + 1
    print(f"Skrev {len(spells)} spells til {OUT.relative_to(ROOT)} (version {version})")
    print("  pr. niveau:", dict(sorted(per_level.items())))
    missing = [s["name"] for s in spells if not s.get("desc")]
    if missing:
        print(f"  uden beskrivelse ({len(missing)}): {', '.join(missing[:8])}")


if __name__ == "__main__":
    main()
