#!/usr/bin/env python3
"""Konverterer data/dnd_items.xlsx (arket 'Alle items') til assets/data/items.js.

Brug:
    pip install openpyxl
    python3 scripts/import_xlsx.py [sti/til/fil.xlsx]

Rarity tages fra regnearkets egen Rarity-kolonne. Rækker uden en gyldig rarity
får None, og bliver markeret i appen som "uden rarity" i stedet for at blive gættet.
"""

import hashlib
import json
import re
import sys
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_XLSX = ROOT / "data" / "dnd_items.xlsx"
OUT = ROOT / "assets" / "data" / "items.js"

RARITY = {
    "Common": "common",
    "Uncommon": "uncommon",
    "Rare": "rare",
    "Very Rare": "very_rare",
    "Legendary": "legendary",
}

EXTRA = [
    ("Skade", "damage"),
    ("Skadetype", "damageType"),
    ("Egenskaber", "properties"),
    ("Mastery", "mastery"),
    ("AC", "ac"),
    ("Styrkekrav", "strength"),
    ("Stealth", "stealth"),
    ("Vægt (lbs)", "weight"),
]


def clean(value):
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


# Våbenbeskrivelserne i arket er næsten kun kedeltekst: en sætning om
# proficiency, dernæst "This weapon has the following mastery property. To use
# this property …" og til allersidst selve mastery-reglen. Kortet skriver i
# forvejen "Mastery: Sap", så kedelteksten skæres væk og regelteksten flyttes
# over på sin egen linje, hvor den hører til.
PROFICIENCY = re.compile(
    r"^(?:Proficiency with .{0,40}?allows you to add your proficiency bonus to the "
    r"attack roll for any attack you make with it\."
    r"|It.s up to you to decide whether a character has proficiency with a firearm\."
    r".*?mastering their use\.)\s*"
)
MASTERY_MARK = re.compile(
    r"\s*This weapon has the following mastery property\..*?lets you use it\.\s*"
)
NOTES_TAIL = re.compile(r"\s*Notes:\s*(.+)$")


def split_mastery(desc, mastery):
    """Deler våbenteksten i (beskrivelse, mastery-regel)."""
    parts = MASTERY_MARK.split(desc, 1)
    before = PROFICIENCY.sub("", parts[0]).strip()
    if len(parts) < 2:
        return before, ""

    rule = parts[1].strip()
    # "Notes: Reload (6 shots)" siger noget om våbnet, ikke om mastery.
    note = NOTES_TAIL.search(rule)
    if note:
        before = (before + " " + note.group(1).strip()).strip()
        rule = rule[: note.start()].strip()
    # Reglen indledes med masterens eget navn: "Sap. If you hit …".
    if mastery:
        rule = re.sub(r"^%s\.\s*" % re.escape(str(mastery)), "", rule).strip()
    return before, rule


# Forbrugsvarer i udstyrslisten. Hele Gift-gruppen tæller med — en dosis gift
# bruges op — og desuden alt med regnearkets Consumable-tag samt de oplagte
# navne. Kan rettes i appen bagefter.
CONSUMABLE_NAME = re.compile(
    r"^(torch|oil|acid|alchemist|antitoxin|holy water|rations|candle|paper|"
    r"parchment|ink|perfume|feed|basic poison|poison)\b",
    re.I,
)
# Fanget af mønsteret ovenfor, men er værktøj der kan bruges igen. Healer's Kit
# og Herbalism Kit hører med her: de har ganske vist et antal brug, men er
# grej man bærer rundt på, ikke noget man trækker som forbrugsvare.
NOT_CONSUMABLE = {"Ink Pen", "Poisoner's Kit", "Healer's Kit", "Herbalism Kit"}


def is_consumable(name, group, tags):
    if name in NOT_CONSUMABLE:
        return False
    if group == "Gift":
        return True
    if any(t.lower() == "consumable" for t in tags):
        return True
    return bool(CONSUMABLE_NAME.match(name))


def parse_price(text):
    """Læser prisen fra tekstkolonnen, fx '3,000 GP', '5 SP', '1 CP' -> gp.

    Nogle rækker (bl.a. de store skibe) har en pris i tekstkolonnen, men
    en tom 'Pris (GP)'-formelkolonne, så den her er nødvendig som reserve.
    """
    if not text:
        return None
    lowered = text.lower()
    unit = 1.0
    if re.search(r"\bsp\b", lowered):
        unit = 0.1
    elif re.search(r"\bcp\b", lowered):
        unit = 0.01
    elif re.search(r"\bpp\b", lowered):
        unit = 10.0

    digits = re.sub(r"[^0-9.,]", "", lowered)
    if not digits:
        return None
    # Sidste separator med 1-2 cifre efter er en decimal; ellers tusindtalsseparator.
    decimal = re.search(r"[.,](\d{1,2})$", digits)
    if decimal:
        digits = digits[: -len(decimal.group(0))].replace(".", "").replace(",", "")
        digits = f"{digits or '0'}.{decimal.group(1)}"
    else:
        digits = digits.replace(".", "").replace(",", "")
    try:
        return float(digits) * unit
    except ValueError:
        return None


# Regnearket mangler to rækker fra Player's Handbooks ammunitionstabel. De
# tilføjes her frem for i arket, så arket kan blive som det er, og ændringen
# kan ses i git. Flytter du dem ind i regnearket, så slet dem herfra —
# navnene skal ikke stå to steder.
AMMO_DESC = (
    "{what} are used with a weapon that has the ammunition property to make a ranged "
    "attack. Each time you attack with the weapon, you expend one piece of ammunition. "
    "Drawing the ammunition from a quiver, case, or other container is part of the attack "
    "(you need a free hand to load a one-handed weapon). At the end of the battle, you can "
    "recover half your expended ammunition by taking a minute to search the battlefield. "
    "Sold in bundles of {count}."
)

MISSING_ROWS = [
    {
        "name": "Arrows", "category": "Ammunition", "subcategory": "Ammunition",
        "price": 1.0, "priceText": "1 GP", "rarity": "common", "scale": "gear",
        "consumable": False, "source": "Player's Handbook", "tags": ["Damage", "Combat"],
        "desc": AMMO_DESC.format(what="Arrows", count=20), "weight": 1,
    },
    {
        "name": "Crossbow Bolts", "category": "Ammunition", "subcategory": "Ammunition",
        "price": 1.0, "priceText": "1 GP", "rarity": "common", "scale": "gear",
        "consumable": False, "source": "Player's Handbook", "tags": ["Damage", "Combat"],
        "desc": AMMO_DESC.format(what="Crossbow bolts", count=20), "weight": 1.5,
    },
]


# Regnearket fører de fleste rustninger under materialet alene — "Padded",
# "Plate", "Hide". Alene på et kort ser det forkert ud, så de får det ord med
# som Player's Handbook selv sætter på dem. De øvrige (Chain Mail, Breastplate,
# Chain Shirt, Shield) hedder allerede noget der læses som en rustning.
ARMOR_SUFFIX = {"Padded", "Leather", "Studded Leather", "Hide",
                "Splint", "Plate", "Half Plate"}


# Rækker arket fører, men som ikke skal kunne trækkes. "(Legacy)" er den
# gamle udgave af en regel, der allerede findes i sin nye form.
DROP_ROWS = {"Net (Legacy)"}


def armor_name(name, group):
    if group == "Rustning" and name in ARMOR_SUFFIX:
        return name + " Armor"
    return name


def main():
    src = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_XLSX
    if not src.exists():
        sys.exit(f"Fandt ikke {src}")

    sheet = openpyxl.load_workbook(src, data_only=True)["Alle items"]
    rows = list(sheet.iter_rows(values_only=True))
    header = list(rows[0])
    col = {name: header.index(name) for name in header if name}

    items = []
    for row in rows[1:]:
        name = clean(row[col["Navn"]])
        if not name or name in DROP_ROWS:
            continue

        price_text = clean(row[col["Pris"]])
        price = row[col["Pris (GP)"]]
        if not isinstance(price, (int, float)):
            price = parse_price(price_text)

        # Regnearkets Rarity-formel er IF(pris < 2; "Common"; ...), og en tom
        # celle tæller som 0 — derfor står prisløst moderne udstyr som Common.
        # Uden en pris findes der ingen udledt rarity, så den lades tom og
        # markeres i appen i stedet for at blive gættet.
        rarity = RARITY.get(clean(row[col["Rarity"]])) if price is not None else None

        group = clean(row[col["Gruppe"]]) or "Ukategoriseret"
        tags = [t.strip() for t in clean(row[col["Tags"]]).split(",") if t.strip()]

        item = {
            "name": armor_name(name, group),
            "category": group,
            "subcategory": clean(row[col["Kategori"]]),
            "price": price,
            "priceText": price_text,
            "rarity": rarity,
            "scale": "gear",
            "consumable": is_consumable(name, group, tags),
            "source": clean(row[col["Kilde"]]),
            "tags": tags,
            "desc": clean(row[col["Beskrivelse"]]),
        }

        for sheet_col, key in EXTRA:
            if sheet_col not in col:
                continue
            value = row[col[sheet_col]]
            if value in (None, ""):
                continue
            item[key] = value if isinstance(value, (int, float)) else clean(value)

        if group == "Våben":
            item["desc"], rule = split_mastery(item["desc"], item.get("mastery"))
            if rule:
                item["masteryText"] = rule

        items.append(item)

    have = {i["name"] for i in items}
    added = [dict(row) for row in MISSING_ROWS if row["name"] not in have]
    items += added

    payload = json.dumps(items, ensure_ascii=False, indent=1)

    # Fingeraftryk af indholdet. Appen sammenligner det med hvad brugeren har
    # gemt lokalt, og tilbyder at genindlæse når regnearket har ændret sig.
    version = hashlib.sha1(payload.encode("utf-8")).hexdigest()[:12]

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "/* Auto-genereret fra %s. Redigér regnearket og kør scripts/import_xlsx.py igen. */\n"
        'window.DND_ITEMS_VERSION = "%s";\n'
        "window.DND_ITEMS = %s;\n" % (src.name, version, payload),
        encoding="utf-8",
    )

    print(f"  forbrugsvarer: {sum(1 for i in items if i['consumable'])}")
    if added:
        print(f"  tilføjet uden om arket: {', '.join(i['name'] for i in added)}")
    missing = [i["name"] for i in items if not i["rarity"]]
    print(f"Skrev {len(items)} items til {OUT.relative_to(ROOT)} (version {version})")
    if missing:
        print(f"Uden rarity ({len(missing)}): {', '.join(missing)}")


if __name__ == "__main__":
    main()
