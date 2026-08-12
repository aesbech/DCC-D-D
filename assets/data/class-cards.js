/* Indhold til Classes-pakken: det der mekanisk sker med spilleren.
   Rarity er sat manuelt (ingen pris) — se README for begrundelsen bag fordelingen.
   Det er et FORSLAG, tænkt til at blive tunet i Items-fanen. */
(function () {
  var out = [];

  function add(names, subcategory, rarity, note) {
    names.forEach(function (n) {
      out.push({
        name: n, category: 'Class', subcategory: subcategory,
        price: null, rarity: rarity, rarityLocked: true,
        scale: 'none', source: "Player's Handbook 2024",
        tags: ['Class'], desc: note || ''
      });
    });
  }

  /* --- Attributter --- */
  add(['Styrke +1', 'Dexterity +1', 'Constitution +1', 'Intelligence +1', 'Wisdom +1', 'Charisma +1'],
      'Attribute', 'common', 'Hæv den pågældende evne med 1 (maks. 20).');
  add(['Styrke +2', 'Dexterity +2', 'Constitution +2', 'Intelligence +2', 'Wisdom +2', 'Charisma +2'],
      'Attribute', 'very_rare', 'Hæv den pågældende evne med 2 (maks. 20).');

  /* --- Origin feats (niveau 1) --- */
  add(['Alert', 'Crafter', 'Healer', 'Lucky', 'Magic Initiate (Cleric)', 'Magic Initiate (Druid)',
       'Magic Initiate (Wizard)', 'Musician', 'Savage Attacker', 'Skilled', 'Tavern Brawler', 'Tough'],
      'Origin Feat', 'common');

  /* --- Fighting Style feats --- */
  add(['Fighting Style: Archery', 'Fighting Style: Blind Fighting', 'Fighting Style: Defense',
       'Fighting Style: Dueling', 'Fighting Style: Great Weapon Fighting', 'Fighting Style: Interception',
       'Fighting Style: Protection', 'Fighting Style: Thrown Weapon Fighting',
       'Fighting Style: Two-Weapon Fighting', 'Fighting Style: Unarmed Fighting'],
      'Fighting Style', 'uncommon');

  /* --- General feats (niveau 4+) --- */
  add(['Ability Score Improvement', 'Actor', 'Athlete', 'Charger', 'Chef', 'Crossbow Expert',
       'Crusher', 'Defensive Duelist', 'Dual Wielder', 'Durable', 'Elemental Adept', 'Fey-Touched',
       'Grappler', 'Great Weapon Master', 'Heavily Armored', 'Heavy Armor Master', 'Inspiring Leader',
       'Keen Mind', 'Lightly Armored', 'Mage Slayer', 'Medium Armor Master', 'Moderately Armored',
       'Mounted Combatant', 'Observant', 'Piercer', 'Poisoner', 'Polearm Master', 'Resilient',
       'Ritual Caster', 'Sentinel', 'Shadow-Touched', 'Sharpshooter', 'Shield Master', 'Skill Expert',
       'Skulker', 'Slasher', 'Speedy', 'Spell Sniper', 'Telekinetic', 'Telepathic', 'War Caster',
       'Weapon Master'],
      'General Feat', 'rare');

  /* --- Class levels --- */
  add(['Class Level: Barbarian', 'Class Level: Bard', 'Class Level: Cleric', 'Class Level: Druid',
       'Class Level: Fighter', 'Class Level: Monk', 'Class Level: Paladin', 'Class Level: Ranger',
       'Class Level: Rogue', 'Class Level: Sorcerer', 'Class Level: Warlock', 'Class Level: Wizard'],
      'Class Level', 'very_rare', 'Kræver at spilleren har et level up til rådighed.');

  /* --- Epic Boons (niveau 19) --- */
  add(['Boon of Combat Prowess', 'Boon of Dimensional Travel', 'Boon of Fate',
       'Boon of Irresistible Offense', 'Boon of Recovery', 'Boon of Skill', 'Boon of Speed',
       'Boon of the Night Spirit', 'Boon of Truesight'],
      'Epic Boon', 'legendary');

  /* --- Perks (homebrew — udskift med dine egne) --- */
  add(['Ekstra Hit Die', 'Ny Skill Proficiency', 'Ny Tool Proficiency', 'Nyt Sprog',
       'Weapon Mastery-plads'],
      'Perk', 'uncommon', 'Homebrew — tilpas eller erstat med dine egne perks.');
  add(['Ekstra Attunement-plads', 'Permanent +5 Hit Points'],
      'Perk', 'rare', 'Homebrew — tilpas eller erstat med dine egne perks.');

  window.CLASS_CARDS = out;
})();
