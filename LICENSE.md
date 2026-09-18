# Licenser

Repoet indeholder materiale fra tre steder med hver sine vilkår. Der er derfor
**ingen enkelt licens på det hele**, og der kan ikke lægges en på: donjons kode
forbyder kommerciel brug, og en licens som MIT ville give en ret videre, som vi
ikke selv har.

| Hvad | Hvem | Vilkår |
|---|---|---|
| Generatoren, siderne, korttyperne, bedrifterne, etagetilføjelserne | DCC-D-D | Vores eget. Ingen licens givet — skriv, hvis du vil bruge det |
| Kortgeometrien i `tools/dungeon.pl` og `assets/js/dungeon.js` | drow, donjon.bin.sh | CC BY-NC 3.0 — **ikke kommerciel brug** |
| Spells, magic items, udstyr og feats i `assets/data/` | Wizards of the Coast | CC BY 4.0, **men kun den del der står i SRD 5.2.1** |

## SRD 5.2.1 — den påkrævede kredit

SRD 5.2.1 kræver en bestemt sætning, ordret. Den står på siderne og gentages
her:

> This work includes material from the System Reference Document 5.2.1
> (“SRD 5.2.1”) by Wizards of the Coast LLC, available at
> https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative
> Commons Attribution 4.0 International License, available at
> https://creativecommons.org/licenses/by/4.0/legalcode.

SRD'en siger derudover: *«Please do not include any other attribution to
Wizards or its parent or affiliates other than that provided above.»* Så der må
**ikke** stå «© Wizards of the Coast» eller lignende noget sted. Man må gerne
skrive at noget er «compatible with fifth edition» eller «5E compatible».

Selve PDF'en ligger i `docs/SRD_CC_v5.2.1.pdf` og må gerne distribueres — CC BY
4.0 tillader det, når kreditten følger med.

## Det der ikke er SRD

**At eje bøgerne giver ret til at bruge dem ved sit eget bord. Det giver ikke
ret til at udgive teksten.** SRD 5.2.1 er en delmængde af D&D; Player's
Handbook, Dungeon Master's Guide og alt fra Xanathar's og fremefter er ikke
frigivet.

`assets/data/` indeholder **204 kort, hvis regeltekst hverken står i SRD'en
eller er vores egen** — 132 magic items, 43 feats, 21 spells og 8 stykker
udstyr.

De er ikke slettet, for ved dit eget bord er de fine. De er mærket med
`"srd": false`, og under Indstillinger står **«Kun kort fra SRD 5.2.1»**, som
holder dem ude af puljerne — også ude af de spells et scroll kan trække.
Knappen er **slået til** i en ny browser, så det man kommer til, når man følger
et link, er i orden fra starten. En opsætning der allerede lå i browseren får
den slået fra, så ingens eget bord ændrer sig af at koden bliver opdateret.

`docs/licens.md` har listen, navn for navn. Begge dele laves med:

```bash
python3 scripts/check_srd.py docs/SRD_CC_v5.2.1.pdf.txt --mark
```

**Slår man knappen fra og deler linket, er man tilbage i problemet.** Flaget er
en hjælp, ikke en garanti.

### Det knappen ikke gør

Knappen styrer, hvad generatoren trækker. Den styrer ikke, hvad serveren
udleverer. To ting ligger stadig åbent:

- **Repoet er offentligt.** `data/magic_items.txt`, `data/spells.txt` og
  `data/feats.txt` er 872 KB rå regeltekst, som hvem som helst kan hente uden
  login. De er kun input til importscriptene — siden indlæser dem aldrig — så de
  kan fjernes uden at noget går i stykker. Git-historikken holder dem dog stadig.
- **`pages.yml` uploader `path: .`**, altså hele repoet. Deployet udstiller
  derfor de samme filer, og `assets/data/*.js` indeholder de 204 korts tekst,
  uanset hvad knappen står på.

Det er et bevidst valg indtil videre: siden er til privat brug, og linket deles
ikke bredt. **Skal linket ud til flere, skal det her ryddes op først** — filerne
ud af repoet, og et trin i `pages.yml` der kun publicerer SRD-sikre datafiler.

## donjon — CC BY-NC 3.0

Kortgeometrien er **Random Dungeon Generator af drow**
([donjon.bin.sh](https://donjon.bin.sh/)), brugt og ændret under
[CC BY-NC 3.0 Unported](https://creativecommons.org/licenses/by-nc/3.0/).
Kreditlinjen står i headeren på begge filer og skal blive stående; ændringerne
står i blokke mærket `DCC-D-D`, så det fremgår hvad der er lavet om.

**NC betyder ikke-kommerciel.** En gratis side om ens eget spil er
ikke-kommerciel. Reklamer, betaling for adgang eller salg af de printede kort
ville være det modsatte.

---

*Det her er en oversigt lavet ved at læse licenserne, ikke juridisk rådgivning.
Skal siden være offentlig i længere tid, er de to ting der bør ses efter af et
menneske: listen i `docs/licens.md`, og om NC-vilkåret passer med det, siden
skal bruges til.*
