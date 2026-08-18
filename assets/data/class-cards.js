/* Indhold til Classes-pakken: det der mekanisk sker med spilleren.

   Kortene er delt i fem typer, som er kortets kategori, så en kortplads kan
   bede om præcis én type. Typen ligger også som tag, til søgning:

     Class  — et class level (kræver et level up til rådighed)
     Stat   — en attributforhøjelse
     Feat   — origin feats, fighting styles, general feats og epic boons
     Skill  — proficiency og expertise i en færdighed
     Perk   — mekaniske fordele uden for de fire ovenstående (homebrew)

   Rarity er sat manuelt, da kortene ikke har en pris. Tallene er et FORSLAG
   og kan tunes i Items-fanen. */
(function () {
  // Hæv denne når indholdet ændres, så appen tilbyder at genindlæse.
  window.CLASS_CARDS_VERSION = '4';

  var out = [];

  function add(names, type, subcategory, rarity, note) {
    names.forEach(function (n) {
      out.push({
        // Typen er kategorien. Det er den akse alt andet indhold bruger til
        // "hvilken slags", så en kortplads beder om den på samme måde.
        name: n, category: type, subcategory: subcategory,
        price: null, rarity: rarity, rarityLocked: true,
        scale: 'none', source: "Player's Handbook 2024",
        tags: ['Class-kort', type], desc: note || ''
      });
    });
  }

  /* ---------------- Class ---------------- */

  add(['Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk', 'Paladin',
       'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard']
        .map(function (c) { return 'Class Level: ' + c; }),
      'Class', 'Class Level', 'very_rare',
      'Kræver at spilleren har et level up til rådighed.');

  /* ---------------- Stat ---------------- */

  var ABILITIES = ['Styrke', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];

  add(ABILITIES.map(function (a) { return a + ' +1'; }),
      'Stat', 'Attribute', 'common', 'Hæv den pågældende evne med 1 (maks. 20).');
  add(ABILITIES.map(function (a) { return a + ' +2'; }),
      'Stat', 'Attribute', 'very_rare', 'Hæv den pågældende evne med 2 (maks. 20).');

  /* ---------------- Feat ---------------- */

  add(['Alert', 'Crafter', 'Healer', 'Lucky', 'Magic Initiate (Cleric)', 'Magic Initiate (Druid)',
       'Magic Initiate (Wizard)', 'Musician', 'Savage Attacker', 'Skilled', 'Tavern Brawler', 'Tough'],
      'Feat', 'Origin Feat', 'common');

  add(['Archery', 'Blind Fighting', 'Defense', 'Dueling', 'Great Weapon Fighting', 'Interception',
       'Protection', 'Thrown Weapon Fighting', 'Two-Weapon Fighting', 'Unarmed Fighting']
        .map(function (f) { return 'Fighting Style: ' + f; }),
      'Feat', 'Fighting Style', 'uncommon');

  add(['Ability Score Improvement', 'Actor', 'Athlete', 'Charger', 'Chef', 'Crossbow Expert',
       'Crusher', 'Defensive Duelist', 'Dual Wielder', 'Durable', 'Elemental Adept', 'Fey-Touched',
       'Grappler', 'Great Weapon Master', 'Heavily Armored', 'Heavy Armor Master', 'Inspiring Leader',
       'Keen Mind', 'Lightly Armored', 'Mage Slayer', 'Medium Armor Master', 'Moderately Armored',
       'Mounted Combatant', 'Observant', 'Piercer', 'Poisoner', 'Polearm Master', 'Resilient',
       'Ritual Caster', 'Sentinel', 'Shadow-Touched', 'Sharpshooter', 'Shield Master', 'Skill Expert',
       'Skulker', 'Slasher', 'Speedy', 'Spell Sniper', 'Telekinetic', 'Telepathic', 'War Caster',
       'Weapon Master'],
      'Feat', 'General Feat', 'rare');

  add(['Boon of Combat Prowess', 'Boon of Dimensional Travel', 'Boon of Fate',
       'Boon of Irresistible Offense', 'Boon of Recovery', 'Boon of Skill', 'Boon of Speed',
       'Boon of the Night Spirit', 'Boon of Truesight'],
      'Feat', 'Epic Boon', 'legendary');

  /* ---------------- Skill ---------------- */

  var SKILLS = ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History',
                'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception',
                'Performance', 'Persuasion', 'Religion', 'Sleight of Hand', 'Stealth', 'Survival'];

  add(SKILLS.map(function (s) { return 'Proficiency: ' + s; }),
      'Skill', 'Skill Proficiency', 'uncommon',
      'Tilføj din proficiency bonus til tjek med denne færdighed.');
  add(SKILLS.map(function (s) { return 'Expertise: ' + s; }),
      'Skill', 'Skill Expertise', 'rare',
      'Fordobl din proficiency bonus med denne færdighed. Kræver proficiency i forvejen.');

  /* ---------------- Perk (homebrew — udskift med dine egne) ---------------- */

  add(['Ny Tool Proficiency', 'Nyt Sprog', 'Weapon Mastery-plads', 'Ekstra Hit Die'],
      'Perk', 'Perk', 'uncommon', 'Homebrew — tilpas eller erstat med dine egne perks.');
  add(['Ekstra Attunement-plads', 'Permanent +5 Hit Points', 'Ekstra Bevægelse (+5 ft.)'],
      'Perk', 'Perk', 'rare', 'Homebrew — tilpas eller erstat med dine egne perks.');

  window.CLASS_CARDS = out;
})();
