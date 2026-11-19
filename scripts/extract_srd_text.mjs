/* SRD-PDF'en til tekst, med skriften i behold.
 *
 * `pdftotext` giver ren tekst, og det er nok til monsters.js og traps.js. Det
 * er ikke nok til statblocks.js: dér skal man kunne se hvad der er sat med
 * fed, for en handlings navn er fed — og uden det greb bliver en kort sætning
 * taget for et navn.
 *
 * Hvert tekststykke skrives som \x01<side>:<skrift>\x02<tekst>. Skrift-id'erne
 * er per side og ikke per dokument, så de må kun sammenlignes inden for den
 * samme side; sidetallet står med, netop for at det kan ses. Slutter stykket
 * en linje, kommer der et linjeskift med, så et ord der er delt over to linjer
 * kan samles igen uden at gætte.
 *
 *     npm install pdfjs-dist
 *     node scripts/extract_srd_text.mjs docs/SRD_CC_v5.2.1.pdf srd-rich.txt
 *     python3 scripts/import_statblocks.py srd-rich.txt
 */
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import fs from 'fs';

const [, , src, dst] = process.argv;
if (!src || !dst) {
  console.error('brug: node scripts/extract_srd_text.mjs <pdf> <ud.txt>');
  process.exit(1);
}

const doc = await getDocument({
  data: new Uint8Array(fs.readFileSync(src)),
  useSystemFonts: true
}).promise;

const out = [];
for (let i = 1; i <= doc.numPages; i++) {
  const page = await doc.getPage(i);
  for (const item of (await page.getTextContent()).items) {
    if (!item.str) continue;
    out.push('\x01' + i + ':' + item.fontName + '\x02' + item.str
      + (item.hasEOL ? '\n' : ''));
  }
}

fs.writeFileSync(dst, out.join(''), 'utf8');
console.log('Skrev %d tekststykker fra %d sider til %s',
  out.length, doc.numPages, dst);
