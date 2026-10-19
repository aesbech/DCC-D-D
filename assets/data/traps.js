/* Auto-genereret fra SRD 5.2.1 af scripts/import_traps.py.
   System Reference Document 5.2.1 af Wizards of the Coast LLC,
   CC BY 4.0 — den fulde kredit står i kolofonen og i LICENSE.md.
   Fælder har ingen XP-værdi; de trækker ikke på etagens budget.
   Vores egne fælder ligger i traps-dcc.js og lægges oveni. */
window.TRAPS_VERSION = "32d5f113d746";
window.TRAPS = [
 {
  "name": "Collapsing Roof",
  "severity": "Deadly",
  "where": "both",
  "srd": true,
  "min": 1,
  "max": 4,
  "trigger": "A creature crosses a trip wire"
 },
 {
  "name": "Fire-Casting Statue",
  "severity": "Deadly",
  "where": "room",
  "srd": true,
  "min": 1,
  "max": 4,
  "trigger": "A creature moves onto a pressure plate"
 },
 {
  "name": "Poisoned Darts",
  "severity": "Deadly",
  "where": "room",
  "srd": true,
  "min": 1,
  "max": 4,
  "trigger": "A creature moves onto a pressure plate"
 },
 {
  "name": "Rolling Stone",
  "severity": "Deadly",
  "where": "room",
  "srd": true,
  "min": 11,
  "max": 20,
  "trigger": "A creature moves onto a pressure plate"
 },
 {
  "name": "Spiked Pit",
  "severity": "Deadly",
  "where": "room",
  "srd": true,
  "min": 1,
  "max": 4,
  "trigger": "A creature moves onto the pit’s lid"
 },
 {
  "name": "Falling Net",
  "severity": "Nuisance",
  "where": "both",
  "srd": true,
  "min": 1,
  "max": 4,
  "trigger": "A creature crosses a trip wire"
 },
 {
  "name": "Hidden Pit",
  "severity": "Nuisance",
  "where": "room",
  "srd": true,
  "min": 1,
  "max": 4,
  "trigger": "A creature moves onto the pit’s lid"
 },
 {
  "name": "Poisoned Needle",
  "severity": "Nuisance",
  "where": "door",
  "srd": true,
  "min": 1,
  "max": 4,
  "trigger": "A creature opens the trap’s lock improperly or fails to disarm the trap"
 }
];
