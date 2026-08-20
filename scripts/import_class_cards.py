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
ORIGIN_LIMIT = "Ingen — men du må kun have ét Origin feat."


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
    # Kroppen: små, konkrete udvidelser man kan skrive på arket med det samme.
    ("Ekstra Hit Die", "common",
     "Du får ét ekstra Hit Die af din klasses type. Det genvindes som de andre.",
     "+1 Hit Die"),
    ("Hårdfør", "common",
     "Du har advantage på saving throws mod Exhaustion.", "Advantage mod Exhaustion"),
    ("Permanent +3 Hit Points", "common",
     "Dit Hit Point-maksimum stiger med 3.", "+3 HP"),

    # Kroppen: mærkbare, men stadig afgrænsede fordele.
    ("Weapon Mastery-plads", "uncommon",
     "Du får én ekstra Weapon Mastery-plads. Vælg våbentype som normalt.",
     "+1 mastery-plads"),
    ("Permanent +5 Hit Points", "uncommon",
     "Dit Hit Point-maksimum stiger med 5.", "+5 HP"),
    ("Ekstra bevægelse", "uncommon",
     "Din Speed stiger permanent med 5 fod.", "+5 ft. Speed"),
    ("Sejlivet", "uncommon",
     "Du har advantage på Death Saving Throws.", "Advantage på death saves"),
    ("Dungeon-øje", "uncommon",
     "Du har advantage på Wisdom (Perception)-tjek for at finde skjulte døre, "
     "fælder og hulrum i sten.", "Advantage på at finde skjult"),
    ("Mørketilvænnet", "uncommon",
     "Du får Darkvision med en rækkevidde på 30 fod. Har du den i forvejen, "
     "stiger rækkevidden med 30 fod.", "Darkvision 30 ft."),

    # De stærke.
    ("Ekstra Attunement-plads", "rare",
     "Du kan være attuned til ét magic item mere end normalt.", "+1 attunement"),
    ("Saving Throw-proficiency", "rare",
     "Vælg én ability du ikke har saving throw-proficiency i. Du får den.",
     "Ét saving throw"),
    ("Anden vind", "rare",
     "Én gang pr. Long Rest kan du som Bonus Action genvinde 1d10 plus dit "
     "karakterniveau i Hit Points.", "Heling én gang pr. dag"),
    ("Hurtig på aftrækkeren", "rare",
     "Du har advantage på Initiative.", "Advantage på Initiative"),

    ("Modstandsdygtig", "very_rare",
     "Vælg én skadetype blandt Acid, Cold, Fire, Lightning, Poison eller Thunder. "
     "Du har Resistance mod den.", "Resistance mod én skadetype"),
    ("Årvågen sjæl", "very_rare",
     "Du får +1 til alle saving throws.", "+1 til alle saves"),
    ("Ekstra Reaction", "very_rare",
     "Du kan tage én ekstra Reaction pr. runde. Du kan ikke bruge dem begge på "
     "den samme udløser.", "+1 Reaction pr. runde"),

    ("Uovervindelig vilje", "legendary",
     "Vælg én tilstand blandt Charmed, Frightened, Paralyzed eller Poisoned. "
     "Du er immun over for den.", "Immun mod én tilstand"),
    ("Ekstra angreb", "legendary",
     "Én gang pr. Long Rest kan du foretage ét ekstra angreb som del af "
     "Attack-handlingen.", "+1 angreb pr. dag"),
    ("Rustet hud", "legendary",
     "Din Armor Class stiger permanent med 1.", "+1 AC"),
]

# Dungeon'et er befolket, og det husker hvem man er. To familier af perks
# knytter sig til et bestemt væsen: den ene køber fred, den anden køber vold.
#
# Fred er billigere end vold, fordi et bane-kort virker i hver eneste kamp
# mod den slags, mens en våbenhvile kun tæller til det første møde.
# Bestemt flertal, så navnet bliver til korrekt genitiv: "goblinerne" ->
# "Goblinernes ven".
CREATURES = ["goblinerne", "kobolderne", "orkerne", "gnollerne",
             "skeletterne", "edderkopperne"]


def creature_perks():
    out = []
    for bestemt in CREATURES:
        stor = bestemt[0].upper() + bestemt[1:]
        out.append((
            "%ss ven" % stor, "uncommon",
            "%s angriber dig ikke på sigte. Det første møde starter neutralt — hvad "
            "der sker derefter er op til dig. Angriber du først, er aftalen brudt for "
            "resten af etagen." % stor,
            "Fred med %s" % bestemt,
        ))
        out.append((
            "%ss fjende" % stor, "rare",
            "Du gør 2 ekstra skade med våbenangreb mod %s, og du har advantage på "
            "Wisdom (Survival)-tjek for at spore dem." % bestemt,
            "+2 skade mod %s" % bestemt,
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
            "Tag et level i " + c + ". Kræver at du har et level up til rådighed.",
            "Level up til rådighed",
        ))

    for ability in ABILITIES:
        for rarity, cap in STAT_CAPS:
            out.append(card(
                "%s +1 (til maks. %d)" % (ability, cap), "Stat", "Attribute", rarity,
                "Hæv din %s med 1. Kortet kan ikke hæve scoren over %d." % (ability, cap),
                "%s under %d" % (ability, cap), "",
                # Her siger rarityen noget: loftet ér graduereringen, så den
                # trykkes i modsætning til de andre class-kort.
                False,
            ))

    for s in SKILLS:
        out.append(card(
            "Proficiency: " + s, "Skill", "Skill Proficiency", "uncommon",
            "Tilføj din proficiency bonus til tjek med " + s + ".",
        ))
        out.append(card(
            "Expertise: " + s, "Skill", "Skill Expertise", "rare",
            "Fordobl din proficiency bonus med " + s + ".",
            "Proficiency i " + s,
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
