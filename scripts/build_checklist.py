#!/usr/bin/env python3
"""Bygger docs/checklist.html ud fra docs/achievements.md.

Arket er en afkrydsningsliste, ikke et regnskab. Der er intet at tælle — man
krydser af når en bedrift er givet, så den ikke bliver givet to gange.

To sider:

    Spillerark   Bronze og Sølv for alle fem pakketyper, plus Class Box.
                 Én pr. spiller, følger kampagnen.
    Bordark      Guldbedrifterne, som er et kapløb og derfor fælles, plus
                 CR-trappen. Én pr. kampagne.

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

# Pakketyperne i den rækkefølge de står i dokumentet, med papirfarven.
PAPER = {
    "Adventurer": "orange",
    "Weapons": "rødt",
    "Armor": "blåt",
    "Consumables": "mørkegrønt",
    "Magic": "lavendel",
    "Class Box": "guldgult",
}

ROW = re.compile(r"^\| \*\*(.+?)\*\*(.*?)\|(.+)\|$")


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
    rows = []
    for line in block.splitlines():
        m = re.match(r"^\| (\*\*.+?\*\*.*?) \| (Bronze|Sølv|Guld) \|$", line)
        if m:
            rows.append((re.sub(r"\*\*", "", m.group(1)), m.group(2)))
        if len(rows) == 3:
            break
    return rows


def items(rows: list[tuple[str, str, str]]) -> str:
    out = []
    for name, marks, trigger in rows:
        marks = html.escape(marks.replace("|", "").strip())
        out.append(
            '<label class="item"><b></b><span>%s%s</span></label>'
            % (
                html.escape(name),
                ' <i class="mk">%s</i>' % marks if marks else "",
            )
        )
    return "\n".join(out)


def block(kind: str, tier: str, rows: list[tuple[str, str, str]]) -> str:
    label = kind if tier == "Class" else "%s · %s" % (kind, tier)
    return (
        '<section class="grp t-%s">\n<h3>%s</h3>\n<div class="items">\n%s\n</div>\n</section>'
        % (kind.split()[0].lower(), html.escape(label), items(rows))
    )


CSS = """
*{box-sizing:border-box}
html,body{margin:0;padding:0}
body{
  background:#3a3d47;
  font:13px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  color:#000;padding:10mm 0;
}
.sheet{
  width:198mm;min-height:285mm;margin:0 auto 10mm;padding:0;
  background:#fff;box-shadow:0 2px 12px rgba(0,0,0,.4);
}
.no-print{width:198mm;margin:0 auto 8mm;color:#e6e8f0;font-size:13px}
.no-print a{color:#e0b93c}

h1{font-size:15pt;margin:0 0 1mm;letter-spacing:.02em}
.sub{font-size:8pt;color:#555;margin:0 0 4mm}
h2{
  font-size:9pt;margin:4mm 0 1.5mm;text-transform:uppercase;letter-spacing:.08em;
  border-bottom:.4mm solid #000;padding-bottom:1mm;
}
h2:first-of-type{margin-top:3mm}
h3{
  font-size:8pt;margin:0 0 1.6mm;text-transform:uppercase;letter-spacing:.06em;
  border-bottom:.25mm solid #999;padding-bottom:.6mm;
}

.fields{display:flex;gap:6mm;margin-bottom:3mm}
.field{flex:1;font-size:8pt;color:#555}
.field span{display:block;border-bottom:.3mm solid #000;height:6mm}

/* Bedrifterne står i spalter, så de 93 felter kan være på ét ark. */
.cols{column-count:3;column-gap:5mm}
.grp{break-inside:avoid;page-break-inside:avoid;margin:0 0 4.5mm}
.items{display:flex;flex-direction:column;gap:1.1mm}
.item{display:flex;align-items:flex-start;gap:1.6mm;font-size:8.5pt;line-height:1.2}
.item b{
  flex:0 0 auto;display:block;width:3.8mm;height:3.8mm;margin-top:.2mm;
  border:.3mm solid #666;border-radius:.5mm;
}
.mk{font-style:normal;color:#666}

/* Papirfarven som en streg i marginen, så man kan finde typen med øjet. */
.t-adventurer h3{border-bottom-color:#d98324}
.t-weapons h3{border-bottom-color:#b23a35}
.t-armor h3{border-bottom-color:#3a5fa0}
.t-consumables h3{border-bottom-color:#2f6b40}
.t-magic h3{border-bottom-color:#7b62a8}
.t-class h3{border-bottom-color:#000}

table{width:100%;border-collapse:collapse;font-size:8pt}
th,td{border:.3mm solid #666;padding:1.1mm 1.6mm;text-align:left;vertical-align:top}
th{background:#eee;font-size:7.5pt;text-transform:uppercase;letter-spacing:.05em}
td.tick{width:7mm;text-align:center}
td.tick b{display:inline-block;width:4mm;height:4mm;border:.3mm solid #666;border-radius:.5mm}
.ladder td:first-child{font-weight:700}
.big td{font-size:9.5pt;padding:1.8mm 2mm}
.note{font-size:7.5pt;color:#555;margin:2mm 0 0}
.two{display:grid;grid-template-columns:1fr 1fr;gap:6mm}

@media print{
  @page{size:A4 portrait;margin:6mm}
  body{background:#fff;padding:0}
  .no-print{display:none}
  .sheet{width:auto;min-height:0;margin:0;box-shadow:none;
         break-after:page;page-break-after:always}
  .sheet:last-of-type{break-after:auto;page-break-after:auto}
  table,.grp{break-inside:avoid;page-break-inside:avoid}
  -webkit-print-color-adjust:exact;print-color-adjust:exact;
}
"""


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    data = parse(text)
    steps = ladder(text)

    order = [k for k in PAPER if k != "Class Box"]
    player = [block(k, t, data[(k, t)]) for t in ("Bronze", "Sølv")
              for k in order if (k, t) in data]
    player.append(block("Class Box", "Class", data[("Class Box", "Class")]))

    gold = "\n".join(
        '<tr><td class="tick"><b></b></td><td><b>%s</b> %s</td><td>%s</td>'
        '<td class="tick"></td></tr>'
        % (html.escape(n), html.escape(m.replace("|", "").strip()), html.escape(d))
        for k in order for n, m, d in data.get((k, "Guld"), [])
    )
    cr = "\n".join(
        '<tr><td>%s</td><td>%s</td></tr>' % (html.escape(a), html.escape(b))
        for a, b in steps
    )
    weight = "\n".join(
        '<tr><td><b>%s</b> %s</td><td>%s</td></tr>'
        % (html.escape(n), html.escape(m.replace("|", "").strip()), html.escape(d))
        for k in order for n, m, d in data.get((k, "Efter vægtklasse"), [])
    )

    n_player = sum(len(v) for (k, t), v in data.items() if t in ("Bronze", "Sølv", "Class"))
    n_gold = sum(len(v) for (k, t), v in data.items() if t == "Guld")

    OUT.write_text(f"""<!DOCTYPE html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>DCC-D-D — Afkrydsningsliste</title>
<style>{CSS}</style>
</head>
<body>

<div class="no-print">
  <b>Afkrydsningsliste til DCC-D-D.</b> Der er intet at tælle — du krydser af når en
  bedrift er givet, så den ikke bliver givet to gange. Tryk print: A4, to sider.
  Print <i>spillerarket</i> én gang pr. spiller og <i>bordarket</i> én gang.
  Se <a href="achievements.md">achievements.md</a> for hvad de udløses af.
  Sæt skalering til 100 %.
</div>

<!-- ============ SPILLERARK ============ -->
<section class="sheet">
  <div style="padding:8mm 8mm 6mm">
    <h1>Spillerark</h1>
    <p class="sub">{n_player} personlige bedrifter. Kryds af når du har fået pakken.
      Bronze og Sølv kan hver spiller få sin egen gang — Guld står på bordarket,
      fordi den kun gives én gang i hele kampagnen.</p>

    <div class="fields">
      <label class="field">Spiller<span></span></label>
      <label class="field">Kampagne<span></span></label>
      <label class="field">Startet<span></span></label>
    </div>

    <h2>Bronze og Sølv</h2>
    <div class="cols">
{chr(10).join(player)}
    </div>

    <p class="note">★ skjult · ↻ gentagelig, højst én gang pr. session ·
      ⚑ holdbedrift, alle får den</p>
  </div>
</section>

<!-- ============ BORDARK ============ -->
<section class="sheet">
  <div style="padding:8mm 8mm 6mm">
    <h1>Bordark</h1>
    <p class="sub">Ét pr. kampagne. Guld er et kapløb: den går til den første der gør
      det, og så er den brugt for hele holdet.</p>

    <h2>CR-trappen</h2>
    <p class="sub">Handler bedriften om at fælde noget, kommer størrelsen herfra.
      Sammenlign monsterets CR med holdets level. Ét fratrækningsstykke — statblokken
      ligger allerede fremme.</p>
    <table class="ladder big">
      <tr><th>CR i forhold til holdets level</th><th>Pakke</th></tr>
{cr}
    </table>

    <h2>Efter vægtklasse</h2>
    <table>
      <tr><th>Bedrift</th><th>Udløses af</th></tr>
{weight}
      <tr><td><b>Boss Down</b> ⚑</td><td>Holdet fælder etagens boss</td></tr>
      <tr><td><b>Floor Cleared</b> ⚑ ↻</td>
          <td>Etagen er ryddet — trappen læses på etagens hårdeste fjende</td></tr>
    </table>

    <h2>Guld — {n_gold} stk., første i kampagnen</h2>
    <table>
      <tr><th>Givet</th><th>Bedrift</th><th>Udløses af</th><th>Til hvem</th></tr>
{gold}
    </table>

    <p class="note">Beholdningen er 22 Bronze, 12 Sølv og 6 Guld af hver pakketype.
      Der er intet felt til at tælle dem ned i: kassen er tælleren.</p>
  </div>
</section>

</body>
</html>
""", encoding="utf-8")
    print("Skrev %s" % OUT.relative_to(ROOT))
    print("  spillerark: %d bedrifter · bordark: %d guld + %d efter vægtklasse"
          % (n_player, n_gold, len(weight.splitlines()) + 2))


if __name__ == "__main__":
    main()
