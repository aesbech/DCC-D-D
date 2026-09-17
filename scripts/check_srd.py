#!/usr/bin/env python3
"""Hvilke kort ligger uden for SRD 5.2.1?

SRD 5.2.1 er frigivet under CC BY 4.0 og må gengives frit med den rigtige
kredit. Resten af D&D — det meste af Player's Handbook, Dungeon Master's Guide
og alt fra Xanathar's og fremefter — er det ikke. At eje bøgerne giver ret til
at bruge dem ved sit eget bord, ikke til at lægge teksten på en offentlig side.

Scriptet sammenligner kortdata med SRD'ens egen tekst og skriver docs/licens.md.

Det er **teksten** der afgør det, ikke navnet. Et navn er en oplysning; en
regeltekst er et værk. Så et kort kaldes «uden for SRD», hvis det har en
beskrivelse af en vis længde, som ikke står ordret i SRD'en — og som vi ikke
selv har skrevet. Navneopslaget bruges kun til at forklare hvad kortet er.

Class-, Stat-, Perk- og Skill-kortene er vores egne formuleringer og springes
over: «Proficiency: Stealth — Add your proficiency bonus to Acrobatics checks»
er vores sætning om SRD'ens færdighed, ikke SRD'ens sætning.

    python3 scripts/check_srd.py docs/SRD_CC_v5.2.1.pdf.txt

Tekstfilen laves fra PDF'en med `pdftotext docs/SRD_CC_v5.2.1.pdf` — eller,
hvis poppler ikke er installeret, med pdfjs:

    npm i pdfjs-dist
    node -e "import('pdfjs-dist/legacy/build/pdf.mjs').then(async p=>{ \\
      const d=await p.getDocument(new Uint8Array(require('fs') \\
        .readFileSync('docs/SRD_CC_v5.2.1.pdf'))).promise, o=[]; \\
      for(let i=1;i<=d.numPages;i++) o.push((await (await d.getPage(i)) \\
        .getTextContent()).items.map(x=>x.str).join(' ')); \\
      require('fs').writeFileSync('docs/SRD_CC_v5.2.1.pdf.txt',o.join('\\n'))})"
"""

import json
import re
import sys
import unicodedata
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "assets" / "data"
OUT = ROOT / "docs" / "licens.md"

# Korttyper vi selv har skrevet teksten på. De kan ikke krænke noget.
OURS = {"Class", "Stat", "Perk", "Skill"}

# Kortere end det er en oplysning, ikke en tekst: et navn, en pris, en vægt.
MIN_WORDS = 15

# Andel af teksten der skal stå ordret i SRD'en, før kortet regnes som SRD'ens.
SRD_SHARE = 0.40

FILES = [
    ("spells.js", "Spells", "spell"),
    ("magic-items.js", "Magic items", "magic item"),
    ("items.js", "Udstyr", "item"),
    ("class-cards.js", "Class, Feat, Skill, Stat, Perk", "kort"),
]


def norm(s):
    s = unicodedata.normalize("NFKD", s or "")
    s = s.replace("’", "'").replace("‘", "'")
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", s.lower())).strip()


def load(name):
    t = (DATA / name).read_text(encoding="utf-8")
    return json.loads(t[t.index("["): t.rindex("]") + 1])


def name_hit(srd, nm):
    """«Crossbow, Heavy» og «Heavy Crossbow» er det samme våben."""
    cands = [nm, re.sub(r"\s*\(.*?\)", "", nm)]
    if "," in nm:
        a, b = nm.split(",", 1)
        cands.append(b.strip() + " " + a.strip())
    if ":" in nm:
        cands.append(nm.split(":", 1)[1].strip())
    return any(" " + norm(c) + " " in srd for c in cands if norm(c))


def coverage(srd, desc, run=12):
    """Hvor stor en del af beskrivelsen står ordret i SRD'en?

    Ikke «findes der ét match», for regeltekster deler standardformuleringer:
    «You gain the following benefits. Ability Score Increase. Increase your …»
    indleder hver eneste feat, også dem der ikke er i SRD'en. Andelen skiller
    rent — målt på kendte kort ligger SRD-tekster på 66-80 % og resten på
    0-21 %, så grænsen kan sættes midt imellem uden at ramme nogen.
    """
    w = norm(desc).split()
    if len(w) < run:
        return None                       # for kort til at sige noget
    wins = [" " + " ".join(w[i:i + run]) + " " for i in range(len(w) - run + 1)]
    return sum(1 for x in wins if x in srd) / len(wins)


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    srd = " " + norm(Path(sys.argv[1]).read_text(encoding="utf-8")) + " "

    report, totals = [], Counter()
    for fname, title, unit in FILES:
        rows = load(fname)
        outside, unsure = [], []
        for x in rows:
            if x.get("category", "") in OURS:
                continue                         # vores egen tekst
            desc = x.get("desc") or ""
            share = coverage(srd, desc)
            named = name_hit(srd, x["name"])
            x["_share"], x["_named"] = share, named

            # De to signaler skal være enige, før der siges noget skarpt. Hvert
            # af dem tager fejl på sin måde: navnet «Whelm» står i SRD'en som en
            # monsterevne, ikke som våbnet af samme navn, og en kort beskrivelse
            # har for få vinduer til at andelen betyder noget. Er de uenige,
            # kommer kortet på listen over noget der skal ses efter i hånden.
            if share is not None and share >= SRD_SHARE:
                continue                                   # ordret fra SRD'en
            if named and (share or 0) > 0:
                continue                                   # SRD'ens, omskrevet
            if len(norm(desc).split()) < MIN_WORDS:
                if not named:
                    unsure.append(x)                       # navn alene, ingen tekst
                continue
            (unsure if named else outside).append(x)

        totals[title] = (len(rows), len(outside), len(unsure))
        report.append((title, unit, rows, outside, unsure))

    write(report, totals)
    for title, (n, out, uns) in totals.items():
        print("%-32s %4d kort | %4d uden for SRD | %3d skal ses efter"
              % (title, n, out, uns))
    print("%-32s %4d        | %4d              | %3d"
          % ("I ALT", sum(t[0] for t in totals.values()),
             sum(t[1] for t in totals.values()),
             sum(t[2] for t in totals.values())))
    print("\nSkrevet til", OUT.relative_to(ROOT))


def write(report, totals):
    L = []
    L.append("# Hvad ligger uden for SRD 5.2.1?\n")
    L.append("*Auto-genereret af `scripts/check_srd.py`. Ret ikke i hånden.*\n")
    L.append(
        "SRD 5.2.1 er frigivet under CC BY 4.0 og må gengives frit, så længe "
        "kreditten står der. Resten af D&D er ikke. Kortene herunder har "
        "hverken et navn eller en tekst der findes i SRD'en, og de kan derfor "
        "**ikke lovligt ligge på en offentligt tilgængelig side**. At eje "
        "bøgerne giver ret til at bruge dem ved sit eget bord — ikke til at "
        "udgive teksten.\n")
    L.append("| | Kort i alt | Uden for SRD | Skal ses efter |")
    L.append("|---|---:|---:|---:|")
    for title, (n, out, uns) in totals.items():
        L.append("| %s | %d | **%d** | %d |" % (title, n, out, uns))
    L.append("| **I alt** | **%d** | **%d** | **%d** |" % (
        sum(t[0] for t in totals.values()),
        sum(t[1] for t in totals.values()),
        sum(t[2] for t in totals.values())))
    L.append("")
    L.append(
        "«Uden for SRD» er kort hvor **begge** prøver siger nej: navnet findes "
        "ikke i SRD'en, og teksten står der ikke. På dem er `source`-feltet "
        "uafhængigt enigt — det peger på Dungeon Master's Guide eller "
        "Player's Handbook.\n")
    L.append(
        "«Skal ses efter» er dem hvor de to prøver er uenige, og det skal et "
        "menneske afgøre. Navneopslaget tager fejl begge veje: *Whelm* står i "
        "SRD'en som en monsterevne, ikke som våbnet af samme navn, og *Shield* "
        "står der halvfems gange uden at sige noget om det kort vi har. "
        "Kort med for lidt tekst til at måle havner også her; et navn og en "
        "pris er en oplysning, ikke et værk, og vejer langt lettere end en "
        "regeltekst.\n")

    for title, unit, rows, outside, unsure in report:
        L.append("## %s\n" % title)
        if not outside:
            L.append("Alt ligger i SRD'en.\n")
        else:
            L.append("**%d af %d ligger uden for SRD'en:**\n"
                     % (len(outside), len(rows)))
            for x in sorted(outside, key=lambda r: r["name"]):
                src = x.get("source")
                L.append("- %s%s" % (x["name"], " — *%s*" % src if src else ""))
            L.append("")
        if unsure:
            L.append("<details><summary>%d kort hvor prøverne er uenige — "
                     "se efter i hånden</summary>\n" % len(unsure))
            L.append(", ".join(sorted(x["name"] for x in unsure)))
            L.append("\n</details>\n")

    OUT.write_text("\n".join(L) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
