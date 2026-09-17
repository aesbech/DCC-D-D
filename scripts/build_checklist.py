#!/usr/bin/env python3
"""Bygger docs/checklist.html ud fra docs/achievements.md.

Arket er en afkrydsningsliste, ikke et regnskab. Der er intet at tælle — man
krydser af når en bedrift er givet, så den ikke bliver givet to gange.

Én række pr. bedrift: navn, hvad der udløser den, og fire felter — ét pr.
spiller. Spillernavnene skrives øverst på hver side, så kolonne 1 betyder det
samme hele vejen igennem.

Præmien står i overskriften og ikke på hver række. Papiret siger alligevel hvad
pakken er, og en kolonne der gentager «Armor · Sølv» toogtyve gange er plads der
kunne være gået til udløseren.

Siderne er delt efter pakketype, fordi det er sådan bordet er delt: én bunke
orange papir, én rød, én blå. Hver type fylder to sider — Bronze for sig, og
Sølv og Guld sammen. Forsiden holder Class Box, som står uden for de fem farver.

Listen læses ud af achievements.md, så de to filer ikke kan komme ud af trit.

    python3 scripts/build_checklist.py
"""

from __future__ import annotations

import html
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs" / "achievements.md"
OUT = ROOT / "docs" / "checklist.html"

# Pakketyperne i den rækkefølge de står i dokumentet, med papirfarven på
# indpakningen. Farven går igen som en streg i arket, så en side kan findes
# uden at læse overskriften.
PAPER = {
    "Adventurer": ("orange papir", "#d98324"),
    "Weapons": ("rødt papir", "#b23a35"),
    "Armor": ("blåt papir", "#3a5fa0"),
    "Consumables": ("mørkegrønt papir", "#2f6b40"),
    "Magic": ("lavendel papir", "#7b62a8"),
    "Class Box": ("guldgult papir, sort voks", "#8a6d1f"),
}

TIERS = ("Bronze", "Sølv", "Guld", "Class")

# Hver type fylder to sider: Bronze for sig, fordi der er toogtyve af dem, og
# Sølv og Guld sammen, fordi de to tilsammen fylder atten.
PAGES = (("Bronze",), ("Sølv", "Guld"))

ROW = re.compile(r"^\| \*\*(.+?)\*\*(.*?)\|(.+)\|$")

# Tomme rækker til bedrifter man finder på i kampens hede. De ligger i den
# tabel de hører til, så en hjemmelavet Weapons Sølv står blandt de andre
# Weapons Sølv — og koster fra den samme bunke.
#
# Antallet er sat af pladsen: Bronze-tabellen er den lange, så den får tre,
# og Sølv og Guld deler en side og får to hver. Mere end det, og den
# tætteste side (Consumables) ville løbe over A4.
BLANKS = {"Bronze": 3, "Sølv": 2, "Guld": 2, "Class": 3}

TIER_NOTE = {
    "Bronze": "Personlig — hver spiller kan få sin egen. 22 bedrifter, 22 pakker i kassen.",
    "Sølv": "Personlig — hver spiller kan få sin egen. 12 bedrifter, 12 pakker i kassen.",
    "Guld": "Kapløb — går til den første i hele kampagnen der gør det. Ét kryds pr. række.",
    "Class": "Ikke gradueret, og står uden for beholdningen.",
}


def parse(text: str) -> dict[tuple[str, str], list[tuple[str, str, str]]]:
    """Læser bedrifterne som (type, niveau) -> [(navn, tegn, udløser)]."""
    out: dict[tuple[str, str], list[tuple[str, str, str]]] = {}
    kind = tier = None
    for line in text.splitlines():
        m = re.match(r"^# (.+)$", line)
        if m:
            kind = m.group(1).strip()
            tier = "Class" if kind == "Class Box" else None
            continue
        m = re.match(r"^## (Bronze|Sølv|Guld)", line)
        if m:
            tier = m.group(1)
            continue
        if line.startswith("## "):
            tier = None
            continue
        m = ROW.match(line)
        if m and kind in PAPER and tier:
            out.setdefault((kind, tier), []).append(
                (m.group(1).strip(), m.group(2).strip(), m.group(3).strip())
            )
    return out


def esc(s: str) -> str:
    return html.escape(s.replace("|", "").strip())


TICKS = ('<td class="p"></td><td class="p"></td>'
         '<td class="p"></td><td class="p"></td>')


def rows_html(rows: list[tuple[str, str, str]], blanks: int = 0) -> str:
    """Én tabelrække pr. bedrift, med fire afkrydsningsfelter til sidst.

    Til sidst et par tomme rækker til dem man finder på undervejs.
    """
    out = []
    for name, marks, trigger in rows:
        mk = ' <i class="mk">%s</i>' % esc(marks) if marks.strip() else ""
        out.append(
            "<tr>"
            '<td class="name"><b>%s</b>%s</td>'
            '<td class="what">%s</td>'
            "%s</tr>" % (esc(name), mk, esc(trigger), TICKS)
        )
    for i in range(blanks):
        # Første tomme række bærer etiketten, så det er tydeligt at resten
        # også er til fri afbenyttelse.
        hint = '<span class="own">Din egen</span>' if i == 0 else ""
        out.append('<tr class="blank"><td class="name">%s</td>'
                   '<td class="what"></td>%s</tr>' % (hint, TICKS))
    return "\n".join(out)


def table(kind: str, tier: str, rows: list[tuple[str, str, str]]) -> str:
    label = kind if tier == "Class" else "%s — %s" % (kind, tier)
    return """<h2>%s <span class="cnt">%d</span></h2>
<p class="tiernote">%s</p>
<table>
  <thead><tr>
    <th class="name">Bedrift</th><th class="what">Udløses af</th>
    <th class="p">1</th><th class="p">2</th><th class="p">3</th><th class="p">4</th>
  </tr></thead>
  <tbody>
%s
  </tbody>
</table>""" % (html.escape(label), len(rows), TIER_NOTE[tier],
               rows_html(rows, BLANKS.get(tier, 0)))


CSS = """
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  background:#3a3d47;
  font:13px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  color:#000;padding:10mm 0;
}
.sheet{
  width:198mm;min-height:285mm;margin:0 auto 10mm;padding:9mm 8mm 7mm;
  background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.4);
}
.no-print{width:198mm;margin:0 auto 8mm;color:#e6e8f0;font-size:13px}
.no-print a{color:#e0b93c}

h1{font-size:16pt;margin:0 0 1mm;letter-spacing:.02em}
h1 .paper{font-size:9pt;font-weight:400;color:#555;letter-spacing:0}
.sub{font-size:8.5pt;color:#555;margin:0 0 4mm}
h2{
  font-size:9pt;margin:5mm 0 1mm;text-transform:uppercase;letter-spacing:.08em;
  border-bottom:.5mm solid var(--ink,#000);padding-bottom:1mm;
}
h2:first-of-type{margin-top:2mm}
h2 .cnt{float:right;font-weight:400;color:#666;letter-spacing:0}
.tiernote{font-size:7.5pt;color:#666;margin:1.2mm 0 1.6mm}

/* Spillernavnene skrives én gang pr. side, så kolonne 1 betyder det samme
   hele vejen ned. */
.players{
  display:flex;gap:3mm;margin:0 0 3mm;padding:2mm 2.5mm;
  border:.3mm solid #999;border-left:1.4mm solid var(--ink,#000);border-radius:.8mm;
}
.players .lbl{
  font-size:7.5pt;text-transform:uppercase;letter-spacing:.06em;color:#555;
  align-self:center;white-space:nowrap;
}
.players label{flex:1;font-size:7.5pt;color:#555;display:flex;gap:1.5mm;align-items:flex-end}
.players label i{font-style:normal;font-weight:700;color:#000}
.players label span{flex:1;display:block;border-bottom:.3mm solid #000;height:5mm}

table{width:100%;border-collapse:collapse;font-size:8.5pt;margin:0}
th,td{border:.25mm solid #9a9a9a;padding:2mm 1.8mm;text-align:left;vertical-align:top}
th{
  background:#eee;font-size:7pt;text-transform:uppercase;letter-spacing:.05em;
  padding:1.2mm 1.8mm;
}
td.name{width:46mm}
td.name b{font-weight:700}
th.p,td.p{width:9mm;text-align:center;background:#fafafa}
th.p{background:#e4e4e4}
/* Feltet skal være stort nok til et kryds med kuglepen. */
td.p{height:8mm}
tbody tr:nth-child(even) td{background:#f7f7f7}
tbody tr:nth-child(even) td.p{background:#f2f2f2}
.mk{font-style:normal;color:#777;font-weight:400}

/* Tomme rækker til egne bedrifter. Ingen zebrastribe — de skal se ud som
   noget der mangler, ikke som en række der allerede står der. */
tbody tr.blank td{background:#fff}
tbody tr.blank td.p{background:#fcfcfc}
tbody tr.blank td.name,tbody tr.blank td.what{
  border-top-style:dotted;border-bottom-style:dotted;
}
/* Tabellens yderkant skal stadig være hel, ellers ser den uafsluttet ud. */
tbody tr.blank:last-child td{border-bottom-style:solid}
.own{
  font-size:6.5pt;text-transform:uppercase;letter-spacing:.07em;color:#aaa;
}

.ladder td:first-child{font-weight:700}
.ladder td{font-size:10pt;padding:2.2mm 2mm}
.note{font-size:8pt;color:#555;margin:3mm 0 0}
.legend{font-size:7.5pt;color:#555;margin:3mm 0 0}
.two{display:grid;grid-template-columns:1fr 1fr;gap:6mm;align-items:start}

@media print{
  @page{size:A4 portrait;margin:0}
  body{background:#fff;padding:0}
  .no-print{display:none}
  .sheet{
    width:auto;min-height:0;margin:0;box-shadow:none;
    padding:8mm 7mm;
    break-after:page;page-break-after:always;
  }
  .sheet:last-of-type{break-after:auto;page-break-after:auto}
  table{break-inside:auto}
  tr{break-inside:avoid;page-break-inside:avoid}
  thead{display:table-header-group}
  h2{break-after:avoid;page-break-after:avoid}
  -webkit-print-color-adjust:exact;print-color-adjust:exact;
}
"""

PLAYERS = """<div class="players">
  <span class="lbl">Spillere</span>
  <label><i>1</i><span></span></label>
  <label><i>2</i><span></span></label>
  <label><i>3</i><span></span></label>
  <label><i>4</i><span></span></label>
</div>"""

LEGEND = ('<p class="legend">↻ gentagelig, højst én gang pr. session · '
          "⚑ holdbedrift, alle får belønningen<br>"
          "<b>Alle bedrifter er skjulte</b> — arket bliver bag skærmen. "
          "De stiplede rækker er til dem du finder på undervejs: skriv navn og "
          "udløser, og læs den op som om den havde stået der hele tiden. Pakken "
          "kommer fra den samme bunke som resten.</p>")


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    data = parse(text)
    total = sum(len(v) for v in data.values())
    sheets = []

    # Forsiden: sådan bruges arket, og Class Box, som hverken er gradueret
    # eller en del af beholdningen og derfor ikke har sin egen farveside.
    sheets.append("""<section class="sheet">
  <h1>Bedrifter <span class="paper">— afkrydsningsark, %d bedrifter</span></h1>
  <p class="sub"><b>DM-ark — bliver bag skærmen.</b> Alle bedrifter er skjulte; spillerne
    finder ud af at en fandtes i det øjeblik de udløser den. Én række pr. bedrift: hvad den
    hedder, og hvad der udløser den. De fire felter til højre er spillerne — skriv navnene
    øverst på hver side, og sæt kryds når pakken er givet. Præmien står i overskriften,
    ikke på hver række: papiret siger alligevel hvad pakken er.</p>

  %s

%s

  <p class="note"><b>Beholdningen er 22 Bronze, 12 Sølv og 6 Guld af hver pakketype — og
    der er præcis lige så mange bedrifter af hver slags.</b> Blev hver eneste udløst én
    gang, ville kassen være tom og arket krydset af på samme tid. Sådan går det ikke:
    nogle rammer tre spillere, andre bliver aldrig til noget. Det er forholdet du kan
    regne i hovedet. Der er ikke et felt til at tælle pakkerne ned i — kassen er
    tælleren.</p>
  %s
</section>""" % (total, PLAYERS,
                 table("Class Box", "Class", data[("Class Box", "Class")]), LEGEND))

    # To sider pr. pakketype: Bronze for sig, Sølv og Guld sammen. Bunken
    # orange papir og siderne om orange papir hører sammen.
    for kind in [k for k in PAPER if k != "Class Box"]:
        paper, ink = PAPER[kind]
        for page in PAGES:
            tiers = [t for t in page if (kind, t) in data]
            if not tiers:
                continue
            body = "\n\n".join(table(kind, t, data[(kind, t)]) for t in tiers)
            n = sum(len(data[(kind, t)]) for t in tiers)
            sheets.append("""<section class="sheet" style="--ink:%s">
  <h1>%s <span class="paper">— %s · %s · %d bedrifter</span></h1>

  %s

%s

  %s
</section>""" % (ink, html.escape(kind), html.escape(paper),
                 html.escape(" og ".join(tiers)), n, PLAYERS, body, LEGEND))

    OUT.write_text(f"""<!DOCTYPE html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DCC-D-D — Afkrydsningsark</title>
<style>{CSS}</style>
</head>
<body>

<div class="no-print">
  <b>Afkrydsningsark til DCC-D-D — DM-materiale.</b> Alle bedrifter er skjulte, så arket
  bliver bag skærmen. Én række pr. bedrift med navn og udløser, fire felter til spillerne,
  og stiplede rækker til dem du finder på undervejs. Tryk print — A4, {len(sheets)} sider.
  Se <a href="achievements.md">achievements.md</a> for reglerne bag.
  Sæt skalering til 100 % og slå «print baggrundsgrafik» til, så kolonnerne kan ses.
</div>

{chr(10).join(sheets)}

</body>
</html>
""", encoding="utf-8")
    print("Skrev %s — %d sider, %d bedrifter"
          % (OUT.relative_to(ROOT), len(sheets), total))


if __name__ == "__main__":
    main()
