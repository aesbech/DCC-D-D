#!/usr/bin/env python3
"""Bygger assets/data/class-cards.js — Classes-pakkens indhold.

Fem korttyper, som hver er kortets kategori:

    Class   et class level
    Stat    en attributforhøjelse, gradueret efter hvor højt den må hæve
    Feat    origin feats, fighting styles, general feats og epic boons
    Skill   proficiency og expertise i en færdighed
    Perk    mekaniske fordele uden for de fire ovenstående (homebrew)

Feats læses fra data/feats.txt, som er klippet fra D&D Beyond. Resten er
formuleret her, fordi de er systematiske og ikke findes som liste.

    python3 scripts/import_class_cards.py
"""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "feats.txt"
OUT = ROOT / "assets" / "data" / "class-cards.js"

SOURCE = "Player's Handbook 2024"

# Feats er delt i fire slags, og de er reelt forskellige i værdi: et origin
# feat har man fra starten, et epic boon kræver level 19. Rarityen følger det.
FEAT_KIND = {
    "Origin": ("Origin Feat", "common"),
    "General": ("General Feat", "rare"),
    "Fighting Style": ("Fighting Style Feat", "uncommon"),
    "Epic Boon": ("Epic Boon Feat", "legendary"),
}

# Et Origin feat får man ved level 1, og man må kun have ét. Det står ikke i
# kildens prerequisite-felt, men det er den begrænsning der betyder noget når
# kortene ligger på bordet.
ORIGIN_LIMIT = "None — but you may have only one Origin feat."


def read_blocks(text: str) -> list[list[str]]:
    """Deler kildeteksten op i ét afsnit pr. feat.

    Hvert feat slutter med "View Details Page", derefter "Tags:" og et par
    linjer der ender på kildenavnet. Næste linje er næste feats navn.
    """
    lines = [ln.rstrip() for ln in text.splitlines()]
    blocks, cur, i = [], [], 0
    while i < len(lines):
        line = lines[i]
        if line.strip() == "View Details Page":
            blocks.append(cur)
            cur = []
            i += 1
            # Spring tag-halen over: "Tags:" og linjer frem til kildelinjen.
            if i < len(lines) and lines[i].strip() == "Tags:":
                i += 1
                while i < len(lines) and "Player" not in lines[i]:
                    i += 1
                i += 1  # selve kildelinjen
            continue
        cur.append(line)
        i += 1
    if any(x.strip() for x in cur):
        blocks.append(cur)
    return blocks


PREREQ = re.compile(r"^(.+?) Feat(?:\s*\(Prerequisite:\s*(.+?)\))?\s*$")


def parse_feat(block: list[str]) -> dict | None:
    rows = [ln for ln in block if ln.strip()]
    if len(rows) < 4:
        return None
    name = rows[0].strip()
    # rows[1] er kilden, rows[2] er den korte opsummering, rows[3] er
    # tag-linjen, og et sted derefter står typelinjen med prerequisite.
    summary = rows[2].strip()

    kind = prereq = None
    body_at = None
    for idx in range(3, min(len(rows), 7)):
        m = PREREQ.match(rows[idx].strip())
        if m and m.group(1).split(",")[-1].strip() in FEAT_KIND:
            kind = m.group(1).split(",")[-1].strip()
            prereq = (m.group(2) or "").strip()
            body_at = idx + 1
            break
    if not kind:
        return None

    body = " ".join(r.strip() for r in rows[body_at:]).strip()
    # Crafter har en tabel med i teksten; den hører ikke på et kort.
    body = re.sub(r"\s*Fast Crafting Artisan's Tools.*$", "", body)
    body = re.sub(r"\s{2,}", " ", body)

    subcategory, rarity = FEAT_KIND[kind]
    # Kilden skriver ingen prerequisite på origin feats, men begrænsningen er
    # der: man har ét. Det er dét der skal stå på kortet.
    krav = prereq
    if kind == "Origin":
        krav = ORIGIN_LIMIT if not krav else krav + ". " + ORIGIN_LIMIT

    return {
        "name": name,
        "category": "Feat",
        "subcategory": subcategory,
        "price": None,
        "rarity": rarity,
        "rarityLocked": True,
        "hideRarity": True,
        "scale": "none",
        "source": SOURCE,
        "tags": ["Class-kort", "Feat", kind],
        "prerequisite": krav,
        # Opsummeringen er kildens egen stikordsliste. Den står for sig på
        # kortet, så man kan se hvad feat'et gør uden at læse hele reglen.
        "summary": summary,
        "desc": body,
    }


# Magic Initiate vælger sin spelliste når man tager det, og kan tages flere
# gange med forskellige lister. Som fysisk kort er hver liste sit eget kort.
MAGIC_INITIATE_LISTS = ["Cleric", "Druid", "Wizard"]


def split_magic_initiate(feats: list[dict]) -> list[dict]:
    out = []
    for f in feats:
        if f["name"] != "Magic Initiate":
            out.append(f)
            continue
        for lst in MAGIC_INITIATE_LISTS:
            v = dict(f)
            v["name"] = "Magic Initiate (%s)" % lst
            v["desc"] = f["desc"].replace(
                "from the Cleric, Druid, or Wizard spell list", "from the %s spell list" % lst)
            v["summary"] = f["summary"]
            out.append(v)
    return out


CLASSES = [
    "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk",
    "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard",
]

ABILITIES = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"]

# Et attributkort hæver altid med 1 — men hvor højt det må hæve, er selve
# graduereringen. Et Common-kort er værdiløst for en der allerede står på 13,
# og et Legendary-kort er det eneste der når 20.
STAT_CAPS = [("common", 13), ("uncommon", 15), ("rare", 17), ("very_rare", 19), ("legendary", 20)]

SKILLS = [
    "Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History",
    "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception",
    "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival",
]

# Perks er husets egne. De ligger uden for D&D's fem kategorier og er det
# sted hvor dungeon'et kan give noget der ikke findes i regelbogen — derfor
# står de her og ikke i en kildefil. Byt frit ud.
# Værktøjs- og sprogperks er væk: en baggrunds tool proficiency ligger nu som
# en regel på selve værktøjskortet, hvor man kan slå for at lære det.
PERKS = [
    # The body: small, concrete additions you can write on the sheet at once.
    ("Extra Hit Die", "common",
     "You gain one extra Hit Die of your class's type. It is regained like the others.",
     "+1 Hit Die"),
    ("Hardy", "common",
     "You have advantage on saving throws against Exhaustion.",
     "Advantage vs. Exhaustion"),
    ("Permanent +3 Hit Points", "common",
     "Your Hit Point maximum increases by 3.", "+3 HP"),

    # The body: noticeable, but still bounded.
    ("Weapon Mastery Slot", "uncommon",
     "You gain one extra Weapon Mastery slot. Choose a weapon type as normal.",
     "+1 mastery slot"),
    ("Permanent +5 Hit Points", "uncommon",
     "Your Hit Point maximum increases by 5.", "+5 HP"),
    ("Fleet of Foot", "uncommon",
     "Your Speed increases permanently by 5 feet.", "+5 ft. Speed"),
    ("Tenacious", "uncommon",
     "You have advantage on Death Saving Throws.", "Advantage on death saves"),
    ("Dungeon Eye", "uncommon",
     "You have advantage on Wisdom (Perception) checks to find hidden doors, "
     "traps and cavities in stone.", "Advantage to find the hidden"),
    ("Dark-Adapted", "uncommon",
     "You gain Darkvision out to 30 feet. If you already have it, its range "
     "increases by 30 feet.", "Darkvision 30 ft."),

    # The strong ones.
    ("Extra Attunement Slot", "rare",
     "You can be attuned to one more magic item than normal.", "+1 attunement"),
    ("Saving Throw Proficiency", "rare",
     "Choose one ability you lack saving throw proficiency in. You gain it.",
     "One saving throw"),
    ("Second Wind", "rare",
     "Once per Long Rest you can take a Bonus Action to regain 1d10 plus your "
     "character level in Hit Points.", "Healing once per day"),
    ("Quick Off the Mark", "rare",
     "You have advantage on Initiative.", "Advantage on Initiative"),

    ("Resilient", "very_rare",
     "Choose one damage type among Acid, Cold, Fire, Lightning, Poison or "
     "Thunder. You have Resistance to it.", "Resistance to one damage type"),
    ("Watchful Soul", "very_rare",
     "You gain +1 to all saving throws.", "+1 to all saves"),
    ("Extra Reaction", "very_rare",
     "You can take one extra Reaction per round. You cannot spend both on the "
     "same trigger.", "+1 Reaction per round"),

    ("Indomitable Will", "legendary",
     "Choose one condition among Charmed, Frightened, Paralyzed or Poisoned. "
     "You are immune to it.", "Immune to one condition"),
    ("Extra Attack", "legendary",
     "Once per Long Rest you can make one extra attack as part of the Attack "
     "action.", "+1 attack per day"),
    ("Armoured Hide", "legendary",
     "Your Armor Class increases permanently by 1.", "+1 AC"),
]

# Dungeon'et er befolket, og det husker hvem man er. To familier af perks
# knytter sig til et bestemt væsen: den ene køber fred, den anden køber vold.
#
# Fred er billigere end vold, fordi et bane-kort virker i hver eneste kamp
# mod den slags, mens en våbenhvile kun tæller til det første møde.
# Bestemt flertal, så navnet bliver til korrekt genitiv: "goblinerne" ->
# "Goblinernes ven".
CREATURES = ["Goblins", "Kobolds", "Orcs", "Gnolls", "Skeletons", "Spiders"]


def creature_perks():
    out = []
    for name in CREATURES:
        low = name.lower()
        out.append((
            "Friend of the %s" % name, "uncommon",
            "%s do not attack you on sight. The first meeting starts neutral — what "
            "happens after that is up to you. Strike first and the truce is broken "
            "for the rest of the floor." % name,
            "Peace with %s" % low,
        ))
        out.append((
            "Bane of the %s" % name, "rare",
            "You deal 2 extra damage with weapon attacks against %s, and you have "
            "advantage on Wisdom (Survival) checks to track them." % low,
            "+2 damage vs. %s" % low,
        ))
    return out


def card(name, category, subcategory, rarity, desc, prerequisite="", summary="",
         hide_rarity=True):
    return {
        "name": name,
        "category": category,
        "subcategory": subcategory,
        "price": None,
        "rarity": rarity,
        "rarityLocked": True,
        # Rarity styrer trækningen, men den siger ikke noget brugbart på et
        # class-kort: alle class levels er lige sandsynlige, og et attributkorts
        # loft står i navnet. Derfor trykkes den ikke.
        "hideRarity": hide_rarity,
        "scale": "none",
        "source": SOURCE,
        "tags": ["Class-kort", category],
        "prerequisite": prerequisite,
        "summary": summary,
        "desc": desc,
    }


def build() -> list[dict]:
    out = []

    # Class levels — alle lige sandsynlige, så de deler rarity.
    for c in CLASSES:
        out.append(card(
            "Class Level: " + c, "Class", "Class Level", "common",
            "Take a level in " + c + ". Requires that you have a level up available.",
            "A level up available",
        ))

    for ability in ABILITIES:
        for rarity, cap in STAT_CAPS:
            out.append(card(
                # Loftet står som krav og i beskrivelsen — titlen skal bare
                # sige hvad kortet er.
                "%s +1" % ability, "Stat", "Attribute", rarity,
                "Increase your %s by 1. This card cannot raise the score above %d." % (ability, cap),
                "%s below %d" % (ability, cap), "",
                # Her siger rarityen noget: loftet ér graduereringen, så den
                # trykkes i modsætning til de andre class-kort.
                False,
            ))

    for s in SKILLS:
        out.append(card(
            "Proficiency: " + s, "Skill", "Skill Proficiency", "uncommon",
            "Add your proficiency bonus to " + s + " checks.",
        ))
        out.append(card(
            "Expertise: " + s, "Skill", "Skill Expertise", "rare",
            "Double your proficiency bonus for " + s + " checks.",
            "Proficiency in " + s,
        ))

    for name, rarity, desc, summary in PERKS + creature_perks():
        out.append(card(name, "Perk", "Perk", rarity, desc, "", summary))

    feats = []
    for block in read_blocks(SRC.read_text(encoding="utf-8")):
        f = parse_feat(block)
        if f:
            feats.append(f)
    feats = split_magic_initiate(feats)
    out.extend(feats)
    return out, feats


def main() -> None:
    items, feats = build()
    payload = json.dumps(items, ensure_ascii=False, indent=1)
    version = hashlib.sha1(payload.encode("utf-8")).hexdigest()[:12]
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        "/* Auto-genereret. Feats kommer fra data/feats.txt; resten er formuleret i\n"
        "   scripts/import_class_cards.py. Kør scriptet igen efter ændringer.\n\n"
        "   Fem korttyper, som hver er kortets kategori: Class, Stat, Feat, Skill,\n"
        "   Perk. Rarity styrer trækningen, men trykkes ikke på kortene. */\n"
        'window.CLASS_CARDS_VERSION = "%s";\n'
        "window.CLASS_CARDS = %s;\n" % (version, payload),
        encoding="utf-8",
    )

    by_cat: dict[str, int] = {}
    for i in items:
        by_cat[i["category"]] = by_cat.get(i["category"], 0) + 1
    by_kind: dict[str, int] = {}
    for f in feats:
        by_kind[f["subcategory"]] = by_kind.get(f["subcategory"], 0) + 1
    print("Skrev %d class-kort til %s (version %s)" % (len(items), OUT.relative_to(ROOT), version))
    print("  pr. kategori:", by_cat)
    print("  feats:", by_kind)
    print("  feats med prerequisite:", sum(1 for f in feats if f["prerequisite"]))


if __name__ == "__main__":
    main()
