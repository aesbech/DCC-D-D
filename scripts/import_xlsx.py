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
    ("Vægt (lbs)", "weight"),
]


def clean(value):
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


# Forbrugsvarer i udstyrslisten. Hele Gift-gruppen tæller med — en dosis gift
# bruges op — og desuden alt med regnearkets Consumable-tag samt de oplagte
# navne. Kan rettes i appen bagefter.
CONSUMABLE_NAME = re.compile(
    r"^(torch|oil|acid|alchemist|antitoxin|holy water|rations|candle|paper|"
    r"parchment|ink|perfume|feed|healer's kit|basic poison|poison)\b",
    re.I,
)
# Fanget af mønsteret ovenfor, men er værktøj der kan bruges igen.
NOT_CONSUMABLE = {"Ink Pen", "Poisoner's Kit"}


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
        if not name:
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
            "name": name,
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

        items.append(item)

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
    missing = [i["name"] for i in items if not i["rarity"]]
    print(f"Skrev {len(items)} items til {OUT.relative_to(ROOT)} (version {version})")
    if missing:
        print(f"Uden rarity ({len(missing)}): {', '.join(missing)}")


if __name__ == "__main__":
    main()
