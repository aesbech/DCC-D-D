#!/usr/bin/env python3
"""Konverterer data/dnd_items.xlsx (arket 'Alle items') til assets/data/items.js.

Brug:
    pip install openpyxl
    python3 scripts/import_xlsx.py [sti/til/fil.xlsx]

Rarity tages fra regnearkets egen Rarity-kolonne. Rækker uden en gyldig rarity
får None, og bliver markeret i appen som "uden rarity" i stedet for at blive gættet.
"""

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

        price = row[col["Pris (GP)"]]
        price = price if isinstance(price, (int, float)) else None

        item = {
            "name": name,
            "category": clean(row[col["Gruppe"]]) or "Ukategoriseret",
            "subcategory": clean(row[col["Kategori"]]),
            "price": price,
            "priceText": clean(row[col["Pris"]]),
            "rarity": RARITY.get(clean(row[col["Rarity"]])),
            "scale": "gear",
            "source": clean(row[col["Kilde"]]),
            "tags": [t.strip() for t in clean(row[col["Tags"]]).split(",") if t.strip()],
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

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "/* Auto-genereret fra %s. Redigér regnearket og kør scripts/import_xlsx.py igen. */\n"
        "window.DND_ITEMS = %s;\n" % (src.name, json.dumps(items, ensure_ascii=False, indent=1)),
        encoding="utf-8",
    )

    missing = [i["name"] for i in items if not i["rarity"]]
    print(f"Skrev {len(items)} items til {OUT.relative_to(ROOT)}")
    if missing:
        print(f"Uden rarity ({len(missing)}): {', '.join(missing)}")


if __name__ == "__main__":
    main()
