#!/usr/bin/env python3
"""Bygger docs/checklist.html ud fra docs/achievements.md.

Arket er en afkrydsningsliste, ikke et regnskab. Der er intet at tælle — man
krydser af når en bedrift er givet, så den ikke bliver givet to gange.

Én række pr. bedrift: navn, hvad der udløser den, hvilken pakke den giver, og
fire felter — ét pr. spiller. Spillernavnene skrives øverst på hver side, så
kolonne 1 betyder det samme hele vejen igennem.

Siderne er delt efter pakketype, fordi det er sådan bordet er delt: én bunke
orange papir, én rød, én blå. Har du en Weapons Sølv i hånden, står alle de
bedrifter der kan betale for den på den samme side.

Forsiden samler det der står uden for de fem farver: CR-trappen, de fire
bedrifter der slår op i den, og Class Box.

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

TIERS = ("Bronze", "Sølv", "Guld", "Efter vægtklasse", "Class")

ROW = re.compile(r"^\| \*\*(.+?)\*\*(.*?)\|(.+)\|$")

# Hvad rækken giver. Præmien står ikke i kildens tabeller — den følger af
# hvilken sektion bedriften står i, og det er dét opslag der laves her.
PRIZE = {
    "Bronze": "%s · Bronze",
    "Sølv": "%s · Sølv",
    "Guld": "%s · Guld",
    "Efter vægtklasse": "CR-trappen",
    "Class": "Class Box",
}

TIER_NOTE = {
    "Bronze": "Personlig. Hver spiller kan få sin egen.",
    "Sølv": "Personlig. Hver spiller kan få sin egen.",
    "Guld": "Kapløb — går til den første i hele kampagnen der gør det.",
    "Efter vægtklasse": "Størrelsen læses af CR-trappen på forsiden. "
                        "Gentagelig, så felterne er til den første gang.",
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
        m = re.match(r"^## (Bronze|Sølv|Guld|Efter vægtklasse)", line)
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


def ladder(text: str) -> list[tuple[str, str]]:
    """CR-trappens tre trin, læst ud af tabellen i dokumentet."""
    block = text.split("## CR-trappen", 1)[1]
    rows: list[tuple[str, str]] = []
    for line in block.splitlines():
        m = re.match(r"^\| (\*\*.+?\*\*.*?) \| (Bronze|Sølv|Guld) \|$", line)
        if m:
            rows.append((re.sub(r"\*\*", "", m.group(1)), m.group(2)))
        if len(rows) == 3:
            break
    return rows


def esc(s: str) -> str:
    return html.escape(s.replace("|", "").strip())


def rows_html(kind: str, tier: str, rows: list[tuple[str, str, str]]) -> str:
    """Én tabelrække pr. bedrift, med fire afkrydsningsfelter til sidst."""
    prize = PRIZE[tier] % kind if "%s" in PRIZE[tier] else PRIZE[tier]
    out = []
    for name, marks, trigger in rows:
        mk = ' <i class="mk">%s</i>' % esc(marks) if marks.strip() else ""
        out.append(
            "<tr>"
            '<td class="name"><b>%s</b>%s</td>'
            '<td class="what">%s</td>'
            '<td class="prize">%s</td>'
            '<td class="p"></td><td class="p"></td><td class="p"></td><td class="p"></td>'
            "</tr>" % (esc(name), mk, esc(trigger), html.escape(prize))
        )
    return "\n".join(out)


def table(kind: str, tier: str, rows: list[tuple[str, str, str]]) -> str:
    label = kind if tier == "Class" else "%s — %s" % (kind, tier)
    return """<h2>%s <span class="cnt">%d</span></h2>
<p class="tiernote">%s</p>
<table>
  <thead><tr>
    <th class="name">Bedrift</th><th class="what">Udløses af</th>
    <th class="prize">Præmie</th>
    <th class="p">1</th><th class="p">2</th><th class="p">3</th><th class="p">4</th>
  </tr></thead>
  <tbody>
%s
  </tbody>
</table>""" % (html.escape(label), len(rows), TIER_NOTE[tier], rows_html(kind, tier, rows))


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
th,td{border:.25mm solid #9a9a9a;padding:1.4mm 1.8mm;text-align:left;vertical-align:top}
th{
  background:#eee;font-size:7pt;text-transform:uppercase;letter-spacing:.05em;
  padding:1.2mm 1.8mm;
}
td.name{width:42mm}
td.name b{font-weight:700}
td.prize{width:32mm;white-space:nowrap;font-size:8pt}
th.p,td.p{width:8mm;text-align:center;background:#fafafa}
th.p{background:#e4e4e4}
/* Feltet skal være stort nok til et kryds med kuglepen. */
td.p{height:7mm}
tbody tr:nth-child(even) td{background:#f7f7f7}
tbody tr:nth-child(even) td.p{background:#f2f2f2}
.mk{font-style:normal;color:#777;font-weight:400}

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

LEGEND = ('<p class="legend">★ skjult, læses ikke op før den udløses · '
          "↻ gentagelig, højst én gang pr. session · "
          "⚑ holdbedrift, alle får belønningen</p>")


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    data = parse(text)
    steps = ladder(text)

    order = list(PAPER)
    sheets = []

    # Forside: sådan bruges arket, og CR-trappen, som de fire
    # vægtklasse-bedrifter slår op i.
    cr = "\n".join(
        "<tr><td>%s</td><td>%s</td></tr>" % (esc(a), esc(b)) for a, b in steps
    )
    weight_rows = [(k, n, m, d) for k in order
                   for n, m, d in data.get((k, "Efter vægtklasse"), [])]
    weight = "\n".join(
        '<tr><td class="name"><b>%s</b>%s</td><td class="what">%s</td>'
        '<td class="prize">%s</td>'
        '<td class="p"></td><td class="p"></td><td class="p"></td><td class="p"></td></tr>'
        % (esc(n), ' <i class="mk">%s</i>' % esc(m) if m.strip() else "", esc(d),
           "CR-trappen")
        for _, n, m, d in weight_rows
    )
    total = sum(len(v) for v in data.values()) + 2  # + Boss Down og Floor Cleared

    sheets.append("""<section class="sheet">
  <h1>Bedrifter <span class="paper">— afkrydsningsark, %d bedrifter</span></h1>
  <p class="sub">Én række pr. bedrift: hvad den hedder, hvad der udløser den, og hvilken
    pakke den giver. De fire felter til højre er spillerne — skriv navnene øverst på
    hver side, og sæt kryds når pakken er givet. Der er intet at tælle.</p>

  %s

  <h2>CR-trappen</h2>
  <p class="tiernote">Handler bedriften om at fælde noget, kommer størrelsen herfra.
    Sammenlign monsterets CR med holdets level — ét fratrækningsstykke, og statblokken
    ligger allerede fremme.</p>
  <table class="ladder">
    <thead><tr><th>CR i forhold til holdets level</th><th>Pakke</th></tr></thead>
    <tbody>
%s
    </tbody>
  </table>

  <h2>Efter vægtklasse <span class="cnt">%d</span></h2>
  <p class="tiernote">%s</p>
  <table>
    <thead><tr>
      <th class="name">Bedrift</th><th class="what">Udløses af</th>
      <th class="prize">Præmie</th>
      <th class="p">1</th><th class="p">2</th><th class="p">3</th><th class="p">4</th>
    </tr></thead>
    <tbody>
%s
    <tr><td class="name"><b>Boss Down</b> <i class="mk">⚑</i></td>
        <td class="what">Holdet fælder etagens boss</td>
        <td class="prize">CR-trappen, eget valg</td>
        <td class="p"></td><td class="p"></td><td class="p"></td><td class="p"></td></tr>
    <tr><td class="name"><b>Floor Cleared</b> <i class="mk">⚑ ↻</i></td>
        <td class="what">Etagen er ryddet — trappen læses på etagens hårdeste fjende</td>
        <td class="prize">CR-trappen, Adventurer</td>
        <td class="p"></td><td class="p"></td><td class="p"></td><td class="p"></td></tr>
    </tbody>
  </table>

%s

  <p class="note"><b>Beholdningen er 22 Bronze, 12 Sølv og 6 Guld af hver pakketype.</b>
    Der er ikke et felt til at tælle dem ned i — kassen er tælleren. Bronze og Sølv er
    personlige, så alle fire felter kan krydses af. Guld går til den første i hele
    kampagnen der gør det, så der bliver kun ét kryds pr. række.</p>
  %s
</section>""" % (total, PLAYERS, cr, len(weight_rows) + 2,
                 TIER_NOTE["Efter vægtklasse"], weight,
                 table("Class Box", "Class", data[("Class Box", "Class")]), LEGEND))

    # Én side pr. pakketype, så bunken orange papir og siden om orange papir
    # hører sammen.
    for kind in [k for k in order if k != "Class Box"]:
        paper, ink = PAPER[kind]
        tiers = [t for t in TIERS if (kind, t) in data and t != "Efter vægtklasse"]
        if not tiers:
            continue
        body = "\n\n".join(table(kind, t, data[(kind, t)]) for t in tiers)
        n = sum(len(data[(kind, t)]) for t in tiers)
        sheets.append("""<section class="sheet" style="--ink:%s">
  <h1>%s <span class="paper">— %s · %d bedrifter</span></h1>

  %s

%s

  %s
</section>""" % (ink, html.escape(kind), html.escape(paper), n, PLAYERS, body, LEGEND))

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
  <b>Afkrydsningsark til DCC-D-D.</b> Én række pr. bedrift med navn, udløser og præmie,
  og fire felter til spillerne. Tryk print — A4, {len(sheets)} sider. Skriv spillernavnene
  øverst på hver side. Se <a href="achievements.md">achievements.md</a> for reglerne bag.
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
