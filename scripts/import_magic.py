#!/usr/bin/env python3
"""Konverterer data/magic_items.txt (skrabet fra D&D Beyond) til assets/data/magic-items.js.

Brug:
    python3 scripts/import_magic.py [sti/til/fil.txt]

Hver post i kildefilen ser sådan ud:

    Navn
    Rarity                      <- magic itemets egen rarity
    Type                        <- Armor, Weapon, Wondrous Item, Ring, ...
    Attunement                  <- "Required" eller "——"
    (noter/tags)
    Type (begrænsning), rarity  <- typelinjen, fx "Weapon (any), uncommon"
    Beskrivelse ...
    (evt. varianttabel)
    Notes: ...
    View Details Page
    Kilde

Poster med rarity "Varies" har en indlejret tabel med varianter og deres
rarity; de foldes ud til hver sin variant.
"""

import json
import hashlib
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_SRC = ROOT / "data" / "magic_items.txt"
OUT = ROOT / "assets" / "data" / "magic-items.js"

RARITIES = {
    "common": "common",
    "uncommon": "uncommon",
    "rare": "rare",
    "very rare": "very_rare",
    "legendary": "legendary",
    "artifact": "artifact",
}
RARITY_WORDS = {"Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact", "Varies"}

TYPES = ["Armor", "Weapon", "Wondrous Item", "Ring", "Rod", "Staff", "Wand",
         "Potion", "Scroll", "Ammunition"]

# Begrænsningen står i parentes og kan selv indeholde komma, fx
# "Armor (any medium or heavy, except hide armor), uncommon".
TYPE_LINE = re.compile(
    r"^(%s)\s*(\([^)]*\))?\s*,\s*(common|uncommon|rare|very rare|legendary|artifact|varies)\b(.*)$"
    % "|".join(TYPES),
    re.I,
)

# Undertekster fra udstyrsarket, som det tredje rul kan lande på.
MELEE = ["Simple Melee Weapon", "Martial Melee Weapon"]
RANGED = ["Simple Ranged Weapon", "Martial Ranged Weapon"]
ALL_WEAPONS = MELEE + RANGED
ARMOR_ALL = ["Light Armor", "Medium Armor", "Heavy Armor"]


def base_filter(kind, constraint):
    """Oversætter fx '(any medium or heavy, except hide armor)' til et filter
    over undertekster i udstyrslisten, så det tredje rul kan vælge et basisitem."""
    c = (constraint or "").strip(" ()").lower()
    if not c or "any" not in c and "shield" not in c:
        return None

    exclude = []
    m = re.search(r"except ([^)]+)", c)
    if m:
        exclude = [w.strip().replace(" armor", "").title() for w in re.split(r",| or ", m.group(1)) if w.strip()]
        c = c[: m.start()]

    subs = []
    if kind.lower() in ("weapon", "ammunition"):
        if "ammunition" in c:
            subs.append("Ammunition")
        if "melee" in c:
            subs += MELEE
        elif "simple or martial" in c or re.search(r"\bany\b\s*$", c) or c.strip() == "any":
            subs += ALL_WEAPONS
        if not subs:
            subs += ALL_WEAPONS
    elif kind.lower() == "armor":
        if "shield" in c:
            subs.append("Shield")
        for word, sub in (("light", "Light Armor"), ("medium", "Medium Armor"), ("heavy", "Heavy Armor")):
            if word in c:
                subs.append(sub)
        if not subs:
            subs += ARMOR_ALL
    else:
        return None

    seen, ordered = set(), []
    for s in subs:
        if s not in seen:
            seen.add(s)
            ordered.append(s)
    return {"subcategories": ordered, "excludeNames": exclude}


# Magiske forbrugsvarer. Kilden mærker kun 19 poster med tagget "Consumable",
# så typen og navnet må supplere. Alt herunder kan rettes i appen bagefter.
CONSUMABLE_NAME = re.compile(
    r"^(dust of|oil of|philter|potion|elemental gem|feather token|bead of force|"
    r"sovereign glue|universal solvent|keoghtom's ointment|nolzur's marvelous pigments|"
    r"necklace of fireballs|manual of|tome of|spell scroll|scroll of|"
    r"quaal's feather token|chime of opening|bag of beans)",
    re.I,
)
# Undtagelser: fanget af mønsteret ovenfor, men er permanente.
NOT_CONSUMABLE = {"Tome of the Stilled Tongue"}


def read_tags(rec):
    tags = []
    if "Tags:" in rec:
        for line in rec[rec.index("Tags:") + 1:]:
            if line.startswith("Notes:") or line.endswith(("Guide", "Handbook", "Rules")):
                break
            tags.append(line)
    note = next((l[len("Notes:"):] for l in rec if l.startswith("Notes:")), "")
    for t in (x.strip() for x in note.split(",")):
        if t and t not in tags:
            tags.append(t)
    return tags


def is_consumable(name, kind, tags):
    if name in NOT_CONSUMABLE:
        return False
    if kind in ("Potion", "Scroll"):
        return True
    if any(t.lower() == "consumable" for t in tags):
        return True
    return bool(CONSUMABLE_NAME.match(name))


def split_records(lines):
    starts = [
        i for i in range(len(lines) - 2)
        if lines[i + 1] in RARITY_WORDS
        and len(lines[i + 2]) < 40
        and not lines[i + 2].startswith(("Notes:", "Tags:", "View "))
    ]
    return [lines[s:(starts[n + 1] if n + 1 < len(starts) else len(lines))]
            for n, s in enumerate(starts)]


PROSE_VARIANT = re.compile(
    r"^([A-Z][A-Za-z' -]{2,40}?)\s*\((Common|Uncommon|Rare|Very Rare|Legendary|Artifact)\)\.",
    re.I,
)

# Samleposter hvis varianter allerede findes som selvstændige poster.
REDUNDANT = {"Ammunition, +1, +2, or +3"}


def compose_name(parent, label):
    """Varianttabellens første kolonne er enten et fuldt itemnavn eller kun en
    variantbetegnelse ('Cantrip', 'Absorption'). Del et ord med forælderen, og
    det regnes som et fuldt navn."""
    words = {w.lower().strip(",.") for w in parent.split() if len(w) > 3}
    if any(w.lower().strip(",.") in words for w in label.split() if len(w) > 3):
        return label
    return "%s (%s)" % (parent, label)


def variant_rows(rec, parent):
    """Finder varianter, enten som tabel med en Rarity-kolonne eller som
    prosalinjer på formen 'Absorption (Very Rare). ...'."""
    out, seen = [], set()

    rarity_col = name_col = width = None
    for line in rec:
        if "\t" not in line:
            continue
        cells = [c.strip() for c in line.split("\t")]
        if rarity_col is None:
            if not any(c.lower() == "rarity" for c in cells):
                continue
            rarity_col = next(i for i, c in enumerate(cells) if c.lower() == "rarity")
            width = len(cells)
            # Navnet står i første kolonne der hverken er terningkolonnen
            # (fx "1d100") eller rarity-kolonnen.
            name_col = next(
                (i for i, c in enumerate(cells)
                 if i != rarity_col and not re.match(r"^\d*d\d+$", c.strip(), re.I)),
                0,
            )
            continue
        if len(cells) != width or rarity_col >= len(cells):
            continue
        word = cells[rarity_col].lower()
        if word not in RARITIES or not cells[name_col]:
            continue
        name = compose_name(parent, cells[name_col])
        if name not in seen:
            seen.add(name)
            out.append({"name": name, "rarity": RARITIES[word]})

    if out:
        return out

    for line in rec:
        m = PROSE_VARIANT.match(line)
        if not m:
            continue
        name = compose_name(parent, m.group(1).strip())
        if name not in seen:
            seen.add(name)
            out.append({"name": name, "rarity": RARITIES[m.group(2).lower()]})
    return out


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_SRC
    if not src.exists():
        sys.exit(f"Fandt ikke {src}")

    raw = src.read_text(encoding="utf-8").replace("’", "'")
    lines = [l.rstrip() for l in raw.split("\n") if l.strip()]

    items, skipped = [], []
    for rec in split_records(lines):
        name, rarity_word, kind = rec[0], rec[1], rec[2]
        if name in REDUNDANT:
            continue

        type_line, constraint = None, None
        for line in rec[1:]:
            m = TYPE_LINE.match(line)
            if m:
                type_line = line
                constraint = m.group(2)
                break

        attunement = any(l.strip() == "Required" for l in rec[3:6]) or \
            bool(type_line and "attunement" in type_line.lower())

        desc = ""
        if type_line:
            idx = rec.index(type_line)
            for line in rec[idx + 1:]:
                if line.startswith(("Notes:", "View ", "Tags:")) or "\t" in line:
                    break
                if len(line) > len(desc):
                    desc = line

        source = rec[-1] if rec[-1] not in RARITY_WORDS else ""
        bf = base_filter(kind, constraint) if constraint else None
        variants = variant_rows(rec, name)
        tags = read_tags(rec)

        base = {
            "name": name,
            "type": kind,
            "attunement": attunement,
            "consumable": is_consumable(name, kind, tags),
            "typeLine": type_line or "",
            "tags": tags,
            "desc": desc,
            "source": source,
        }
        if bf:
            base["baseFilter"] = bf

        if rarity_word == "Varies":
            if not variants:
                skipped.append(name)
                continue
            for v in variants:
                item = dict(base)
                item["name"] = v["name"]
                item["rarity"] = v["rarity"]
                item["consumable"] = is_consumable(v["name"], kind, tags) or base["consumable"]
                item["variantOf"] = name
                items.append(item)
        else:
            base["rarity"] = RARITIES[rarity_word.lower()]
            items.append(base)

    items.sort(key=lambda i: i["name"])
    payload = json.dumps(items, ensure_ascii=False, indent=1)
    version = hashlib.sha1(payload.encode("utf-8")).hexdigest()[:12]

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "/* Auto-genereret fra %s. Kør scripts/import_magic.py igen efter ændringer. */\n"
        'window.MAGIC_ITEMS_VERSION = "%s";\n'
        "window.MAGIC_ITEMS = %s;\n" % (src.name, version, payload),
        encoding="utf-8",
    )

    by_rarity = {}
    for i in items:
        by_rarity[i["rarity"]] = by_rarity.get(i["rarity"], 0) + 1
    print(f"Skrev {len(items)} magic items til {OUT.relative_to(ROOT)} (version {version})")
    print("  pr. rarity:", by_rarity)
    print("  med basisitem-rul:", sum(1 for i in items if "baseFilter" in i))
    print("  forbrugsvarer:", sum(1 for i in items if i["consumable"]))
    if skipped:
        print(f"  sprunget over (Varies uden tabel): {', '.join(skipped)}")


if __name__ == "__main__":
    main()
