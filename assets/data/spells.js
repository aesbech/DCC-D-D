/* Auto-genereret fra spells.txt. Kør scripts/import_spells.py igen efter ændringer. */
window.SPELLS_VERSION = "2a629f9c3f64";
window.SPELLS = [
 {
  "name": "Acid Splash",
  "level": 0,
  "castingTime": "1 Action",
  "range": "60 ft. (5 ft. )",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "DEX Save",
  "effect": "Acid",
  "classes": [
   "Artificer",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You create an acidic bubble at a point within range, where it explodes in a 5-foot-radius Sphere. Each creature in that Sphere must succeed on a Dexterity saving throw or take 1d6 Acid damage. Cantrip Upgrade. The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6)."
 },
 {
  "name": "Chill Touch",
  "level": 0,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "Melee",
  "effect": "Necrotic",
  "classes": [
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "Channeling the chill of the grave, make a melee spell attack against a target within reach. On a hit, the target takes 1d10 Necrotic damage, and it can't regain Hit Points until the end of your next turn. Cantrip Upgrade. The damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10)."
 },
 {
  "name": "Druidcraft",
  "level": 0,
  "castingTime": "1 Action",
  "range": "30 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Transmutation",
  "save": "None",
  "effect": "Utility",
  "classes": [
   "Cleric",
   "Druid",
   "Sorcerer"
  ],
  "desc": "Whispering to the spirits of nature, you create one of the following effects within range. Weather Sensor. You create a Tiny, harmless sensory effect that predicts what the weather will be at your location for the next 24 hours. The effect might manifest as a golden orb for clear skies, a cloud for rain, falling snowflakes for snow, and so on. This effect persists for 1 round. Bloom. You instantly make a flower blossom, a seed pod open, or a leaf bud bloom. Sensory Effect. You create a harmless sensory effect, such as falling leaves, spectral dancing fairies, a gentle breeze, the sound of an animal, or the faint odor of skunk. The effect must fit in a 5-foot Cube. Fire Play. You light or snuff out a candle, a torch, or a campfire."
 },
 {
  "name": "Eldritch Blast",
  "level": 0,
  "castingTime": "1 Action",
  "range": "120 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "Ranged",
  "effect": "Force",
  "classes": [
   "Artificer",
   "Druid",
   "Paladin",
   "Ranger",
   "Warlock"
  ],
  "desc": "You hurl a beam of crackling energy. Make a ranged spell attack against one creature or object in range. On a hit, the target takes 1d10 Force damage. Cantrip Upgrade. The spell creates two beams at level 5, three beams at level 11, and four beams at level 17. You can direct the beams at the same target or at different ones. Make a separate attack roll for each beam."
 },
 {
  "name": "Elementalism",
  "level": 0,
  "castingTime": "1 Action",
  "range": "30 ft. (5 ft. *)",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Transmutation",
  "save": "None",
  "effect": "You exert control over the elements, creating one of the following effects within range.",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Ranger",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "Beckon Air. You create a breeze strong enough to ripple cloth, stir dust, rustle leaves, and close open doors and shutters, all in a 5-foot Cube. Doors and shutters being held open by someone or something aren't affected. Beckon Earth. You create a thin shroud of dust or sand that covers surfaces in a 5-foot-square area, or you cause a single word to appear in your handwriting in a patch of dirt or sand. Beckon Fire. You create a thin cloud of harmless embers and colored, scented smoke in a 5-foot Cube. You choose the color and scent, and the embers can light candles, torches, or lamps in that area. The smoke's scent lingers for 1 minute. Beckon Water. You create a spray of cool mist that lightly dampens creatures and objects in a 5-foot Cube. Alternatively, you create 1 cup of clean water either in an open container or on a surface, and the water evaporates in 1 minute. Sculpt Element. You cause dirt, sand, fire, smoke, mist, or water that can fit in a 1-foot Cube to assume a crude shape (such as that of a creature) for 1 hour."
 },
 {
  "name": "Fire Bolt",
  "level": 0,
  "castingTime": "1 Action",
  "range": "120 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "Ranged",
  "effect": "Fire",
  "classes": [
   "Artificer",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You hurl a mote of fire at a creature or an object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Fire damage. A flammable object hit by this spell starts burning if it isn't being worn or carried. Cantrip Upgrade. The damage increases by 1d10 when you reach levels 5 (2d10), 11 (3d10), and 17 (4d10)."
 },
 {
  "name": "Light",
  "level": 0,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, M *",
  "duration": "1 Hour",
  "school": "Evocation",
  "save": "None",
  "effect": "Creation (...)",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You touch one Large or smaller object that isn't being worn or carried by someone else. Until the spell ends, the object sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. The light can be colored as you like. Covering the object with something opaque blocks the light. The spell ends if you cast it again. * - (a firefly or phosphorescent moss)"
 },
 {
  "name": "Mage Hand",
  "level": 0,
  "castingTime": "1 Action",
  "range": "30 ft.",
  "components": "V, S",
  "duration": "1 Minute",
  "school": "Conjuration",
  "save": "None",
  "effect": "Utility",
  "classes": [
   "Artificer",
   "Bard",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "A spectral, floating hand appears at a point you choose within range. The hand lasts for the duration. The hand vanishes if it is ever more than 30 feet away from you or if you cast this spell again. When you cast the spell, you can use the hand to manipulate an object, open an unlocked door or container, stow or retrieve an item from an open container, or pour the contents out of a vial. As a Magic action on your later turns, you can control the hand thus again. As part of that action, you can move the hand up to 30 feet. The hand can't attack, activate magic items, or carry more than 10 pounds."
 },
 {
  "name": "Mending",
  "level": 0,
  "castingTime": "1 Minute",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Transmutation",
  "save": "None",
  "effect": "Utility",
  "classes": [
   "Bard",
   "Cleric",
   "Druid",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "This spell repairs a single break or tear in an object you touch, such as a broken chain link, two halves of a broken key, a torn cloak, or a leaking wineskin. As long as the break or tear is no larger than 1 foot in any dimension, you mend it, leaving no trace of the former damage. This spell can physically repair a magic item, but it can't restore magic to such an object. * - (two lodestones)"
 },
 {
  "name": "Message",
  "level": 0,
  "castingTime": "1 Action",
  "range": "120 ft.",
  "components": "S, M *",
  "duration": "1 Round",
  "school": "Transmutation",
  "save": "None",
  "effect": "Communication (...)",
  "classes": [
   "Artificer",
   "Bard",
   "Druid",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You point toward a creature within range and whisper a message. The target (and only the target) hears the message and can reply in a whisper that only you can hear. You can cast this spell through solid objects if you are familiar with the target and know it is beyond the barrier. Magical silence; 1 foot of stone, metal, or wood; or a thin sheet of lead blocks the spell. * - (a copper wire)"
 },
 {
  "name": "Mind Sliver",
  "level": 0,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V",
  "duration": "1 Round",
  "school": "Enchantment",
  "save": "INT Save",
  "effect": "Psychic",
  "classes": [
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You try to temporarily sliver the mind of one creature you can see within range. The target must succeed on an Intelligence saving throw or take 1d6 Psychic damage and subtract 1d4 from the next saving throw it makes before the end of your next turn. Cantrip Upgrade. The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6)."
 },
 {
  "name": "Minor Illusion",
  "level": 0,
  "castingTime": "1 Action",
  "range": "30 ft. (5 ft. *)",
  "components": "S, M *",
  "duration": "1 Minute",
  "school": "Illusion",
  "save": "None",
  "effect": "Control",
  "classes": [
   "Bard",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You create a sound or an image of an object within range that lasts for the duration. See the descriptions below for the effects of each. The illusion ends if you cast this spell again. If a creature takes a Study action to examine the sound or image, the creature can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the illusion becomes faint to the creature. Sound. If you create a sound, its volume can range from a whisper to a scream. It can be your voice, someone else's voice, a lion's roar, a beating of drums, or any other sound you choose. The sound continues unabated throughout the duration, or you can make discrete sounds at different times before the spell ends. Image. If you create an image of an object—such as a chair, muddy footprints, or a small chest—it must be no larger than a 5-foot Cube. The image can't create sound, light, smell, or any other sensory effect. Physical interaction with the image reveals it to be an illusion, since things can pass through it. * - (a bit of fleece)"
 },
 {
  "name": "Poison Spray",
  "level": 0,
  "castingTime": "1 Action",
  "range": "30 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "Ranged",
  "effect": "Poison",
  "classes": [
   "Artificer",
   "Bard",
   "Druid",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You spray toxic mist at a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d12 Poison damage. Cantrip Upgrade. The damage increases by 1d12 when you reach levels 5 (2d12), 11 (3d12), and 17 (4d12)."
 },
 {
  "name": "Prestidigitation",
  "level": 0,
  "castingTime": "1 Action",
  "range": "10 ft.",
  "components": "V, S",
  "duration": "1 Hour",
  "school": "Transmutation",
  "save": "None",
  "effect": "Utility",
  "classes": [
   "Artificer",
   "Bard",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You create a magical effect within range. Choose the effect from the options below. If you cast this spell multiple times, you can have up to three of its non-instantaneous effects active at a time. Sensory Effect. You create an instantaneous, harmless sensory effect, such as a shower of sparks, a puff of wind, faint musical notes, or an odd odor. Fire Play. You instantaneously light or snuff out a candle, a torch, or a small campfire. Clean or Soil. You instantaneously clean or soil an object no larger than 1 cubic foot. Minor Sensation. You chill, warm, or flavor up to 1 cubic foot of nonliving material for 1 hour. Magic Mark. You make a color, a small mark, or a symbol appear on an object or a surface for 1 hour. Minor Creation. You create a nonmagical trinket or an illusory image that can fit in your hand. It lasts until the end of your next turn. A trinket can deal no damage and has no monetary worth."
 },
 {
  "name": "Produce Flame",
  "level": 0,
  "castingTime": "1 Bonus Action",
  "range": "Self",
  "components": "V, S",
  "duration": "10 Minutes",
  "school": "Conjuration",
  "save": "Ranged",
  "effect": "Fire",
  "classes": [
   "Druid"
  ],
  "desc": "A flickering flame appears in your hand and remains there for the duration. While there, the flame emits no heat and ignites nothing, and it sheds Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. The spell ends if you cast it again. Until the spell ends, you can take a Magic action to hurl fire at a creature or an object within 60 feet of you. Make a ranged spell attack. On a hit, the target takes 1d8 Fire damage. Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
 },
 {
  "name": "Ray of Frost",
  "level": 0,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "Ranged",
  "effect": "Cold",
  "classes": [
   "Artificer",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "A frigid beam of blue-white light streaks toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 1d8 Cold damage, and its Speed is reduced by 10 feet until the start of your next turn. Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
 },
 {
  "name": "Sacred Flame",
  "level": 0,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "DEX Save",
  "effect": "Radiant",
  "classes": [
   "Cleric"
  ],
  "desc": "Flame-like radiance descends on a creature that you can see within range. The target must succeed on a Dexterity saving throw or take 1d8 Radiant damage. The target gains no benefit from Half Cover or Three-Quarters Cover for this save. Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
 },
 {
  "name": "Shillelagh",
  "level": 0,
  "castingTime": "1 Bonus Action",
  "range": "Self",
  "components": "V, S, M *",
  "duration": "1 Minute",
  "school": "Transmutation",
  "save": "Melee",
  "effect": "Bludgeoning (...)",
  "classes": [
   "Druid",
   "Paladin"
  ],
  "desc": "A Club or Quarterstaff you are holding is imbued with nature's power. For the duration, you can use your spellcasting ability instead of Strength for the attack and damage rolls of melee attacks using that weapon, and the weapon's damage die becomes a d8. If the attack deals damage, it can be Force damage or the weapon's normal damage type (your choice). The spell ends early if you cast it again or if you let go of the weapon. Cantrip Upgrade. The damage die changes when you reach levels 5 (d10), 11 (d12), and 17 (2d6). * - (mistletoe)"
 },
 {
  "name": "Shocking Grasp",
  "level": 0,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "Melee",
  "effect": "Lightning",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Ranger",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "Lightning springs from you to a creature that you try to touch. Make a melee spell attack against the target. On a hit, the target takes 1d8 Lightning damage, and it can't make Opportunity Attacks until the start of its next turn. Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
 },
 {
  "name": "Sorcerous Burst",
  "level": 0,
  "castingTime": "1 Action",
  "range": "120 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "Ranged",
  "effect": "Acid (...)",
  "classes": [
   "Sorcerer"
  ],
  "desc": "You cast sorcerous energy at one creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d8 damage of a type you choose: Acid, Cold, Fire, Lightning, Poison, Psychic, or Thunder. If you roll an 8 on a d8 for this spell, you can roll another d8, and add it to the damage. When you cast this spell, the maximum number of these d8s you can add to the spell's damage equals your spellcasting ability modifier. Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
 },
 {
  "name": "Spare the Dying",
  "level": 0,
  "castingTime": "1 Action",
  "range": "15 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "None",
  "effect": "Healing",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Ranger",
   "Warlock"
  ],
  "desc": "Choose a creature within range that has 0 Hit Points and isn't dead. The creature becomes Stable. Cantrip Upgrade. The range doubles when you reach levels 5 (30 feet), 11 (60 feet), and 17 (120 feet)."
 },
 {
  "name": "Starry Wisp",
  "level": 0,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "Ranged",
  "effect": "Radiant",
  "classes": [
   "Bard",
   "Druid"
  ],
  "desc": "You launch a mote of light at one creature or object within range. Make a ranged spell attack against the target. On a hit, the target takes 1d8 Radiant damage, and until the end of your next turn, it emits Dim Light in a 10-foot radius and can't benefit from the Invisible condition. Cantrip Upgrade. The damage increases by 1d8 when you reach levels 5 (2d8), 11 (3d8), and 17 (4d8)."
 },
 {
  "name": "Thaumaturgy",
  "level": 0,
  "castingTime": "1 Action",
  "range": "30 ft.",
  "components": "V",
  "duration": "1 Minute",
  "school": "Transmutation",
  "save": "None",
  "effect": "Control",
  "classes": [
   "Cleric"
  ],
  "desc": "You manifest a minor wonder within range. You create one of the effects below within range. If you cast this spell multiple times, you can have up to three of its 1-minute effects active at a time. Altered Eyes. You alter the appearance of your eyes for 1 minute. Booming Voice. Your voice booms up to three times as loud as normal for 1 minute. For the duration, you have Advantage on Charisma (Intimidation) checks. Fire Play. You cause flames to flicker, brighten, dim, or change color for 1 minute. Invisible Hand. You instantaneously cause an unlocked door or window to fly open or slam shut. Phantom Sound. You create an instantaneous sound that originates from a point of your choice within range, such as a rumble of thunder, the cry of a raven, or ominous whispers. Tremors. You cause harmless tremors in the ground for 1 minute."
 },
 {
  "name": "Thorn Whip",
  "level": 0,
  "castingTime": "1 Action",
  "range": "30 ft.",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Transmutation",
  "save": "Melee",
  "effect": "Piercing",
  "classes": [
   "Artificer",
   "Druid"
  ],
  "desc": "You create a vine-like whip covered in thorns that lashes out at your command toward a creature in range. Make a melee spell attack against the target. On a hit, the target takes 1d6 Piercing damage, and if it is Large or smaller, you can pull it up to 10 feet closer to you. Cantrip Upgrade. The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6). * - (the stem of a plant with thorns)"
 },
 {
  "name": "Thunderclap",
  "level": 0,
  "castingTime": "1 Action",
  "range": "Self (5 ft. )",
  "components": "S",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "CON Save",
  "effect": "Thunder",
  "classes": [
   "Artificer",
   "Bard",
   "Druid",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "Each creature in a 5-foot Emanation originating from you must succeed on a Constitution saving throw or take 1d6 Thunder damage. The spell's thunderous sound can be heard up to 100 feet away. Cantrip Upgrade. The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6)."
 },
 {
  "name": "Toll the Dead",
  "level": 0,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "WIS Save",
  "effect": "Necrotic",
  "classes": [
   "Cleric",
   "Warlock",
   "Wizard"
  ],
  "desc": "You point at one creature you can see within range, and the single chime of a dolorous bell is audible within 10 feet of the target. The target must succeed on a Wisdom saving throw or take 1d8 Necrotic damage. If the target is missing any of its Hit Points, it instead takes 1d12 Necrotic damage. Cantrip Upgrade. The damage increases by one die when you reach levels 5 (2d8 or 2d12), 11 (3d8 or 3d12), and 17 (4d8 or 4d12)."
 },
 {
  "name": "True Strike",
  "level": 0,
  "castingTime": "1 Action",
  "range": "Self",
  "components": "S, M *",
  "duration": "Instantaneous",
  "school": "Divination",
  "save": "Melee",
  "effect": "Radiant",
  "classes": [
   "Artificer",
   "Bard",
   "Druid",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "Guided by a flash of magical insight, you make one attack with the weapon used in the spell's casting. The attack uses your spellcasting ability for the attack and damage rolls instead of using Strength or Dexterity. If the attack deals damage, it can be Radiant damage or the weapon's normal damage type (your choice). Cantrip Upgrade. Whether you deal Radiant damage or the weapon's normal damage type, the attack deals extra Radiant damage when you reach levels 5 (1d6), 11 (2d6), and 17 (3d6). * - (a weapon with which you have proficiency and that is worth 1+ CP)"
 },
 {
  "name": "Vicious Mockery",
  "level": 0,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Enchantment",
  "save": "WIS Save",
  "effect": "Psychic",
  "classes": [
   "Bard"
  ],
  "desc": "You unleash a string of insults laced with subtle enchantments at one creature you can see or hear within range. The target must succeed on a Wisdom saving throw or take 1d6 Psychic damage and have Disadvantage on the next attack roll it makes before the end of its next turn. Cantrip Upgrade. The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6)."
 },
 {
  "name": "Word of Radiance",
  "level": 0,
  "castingTime": "1 Action",
  "range": "Self (5 ft. )",
  "components": "V, M *",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "CON Save",
  "effect": "Radiant",
  "classes": [
   "Cleric"
  ],
  "desc": "Burning radiance erupts from you in a 5-foot Emanation. Each creature of your choice that you can see in it must succeed on a Constitution saving throw or take 1d6 Radiant damage. Cantrip Upgrade. The damage increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6). * - (a sunburst token)"
 },
 {
  "name": "Animal Friendship",
  "level": 1,
  "castingTime": "1 Action",
  "range": "30 ft.",
  "components": "V, S, M *",
  "duration": "24 Hours",
  "school": "Enchantment",
  "save": "WIS Save",
  "effect": "Charmed",
  "classes": [
   "Bard",
   "Druid",
   "Ranger"
  ],
  "desc": "Target a Beast that you can see within range. The target must succeed on a Wisdom saving throw or have the Charmed condition for the duration. If you or one of your allies deals damage to the target, the spell ends. Using a Higher-Level Spell Slot. You can target one additional Beast for each spell slot level above 1. * - (a morsel of food)"
 },
 {
  "name": "Armor of Agathys",
  "level": 1,
  "castingTime": "1 Bonus Action",
  "range": "Self",
  "components": "V, S, M *",
  "duration": "1 Hour",
  "school": "Abjuration",
  "save": "None",
  "effect": "Cold",
  "classes": [
   "Warlock"
  ],
  "desc": "Protective magical frost surrounds you. You gain 5 Temporary Hit Points. If a creature hits you with a melee attack roll before the spell ends, the creature takes 5 Cold damage. The spell ends early if you have no Temporary Hit Points. Using a Higher-Level Spell Slot. The Temporary Hit Points and the Cold damage both increase by 5 for each spell slot level above 1. * - (a shard of blue glass)"
 },
 {
  "name": "Arms of Hadar",
  "level": 1,
  "castingTime": "1 Action",
  "range": "Self (10 ft. )",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Conjuration",
  "save": "STR Save",
  "effect": "Necrotic",
  "classes": [
   "Warlock"
  ],
  "desc": "Invoking Hadar, you cause tendrils to erupt from yourself. Each creature in a 10-foot Emanation originating from you makes a Strength saving throw. On a failed save, a target takes 2d6 Necrotic damage and can't take Reactions until the start of its next turn. On a successful save, a target takes half as much damage only. Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1."
 },
 {
  "name": "Burning Hands",
  "level": 1,
  "castingTime": "1 Action",
  "range": "Self (15 ft. )",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "DEX Save",
  "effect": "Fire",
  "classes": [
   "Bard",
   "Cleric",
   "Druid",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "A thin sheet of flames shoots forth from you. Each creature in a 15-foot Cone makes a Dexterity saving throw, taking 3d6 Fire damage on a failed save or half as much damage on a successful one. Flammable objects in the Cone that aren't being worn or carried start burning. Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1."
 },
 {
  "name": "Charm Person",
  "level": 1,
  "castingTime": "1 Action",
  "range": "30 ft.",
  "components": "V, S",
  "duration": "1 Hour",
  "school": "Enchantment",
  "save": "WIS Save",
  "effect": "Charmed",
  "classes": [
   "Bard",
   "Druid",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "One Humanoid you can see within range makes a Wisdom saving throw. It does so with Advantage if you or your allies are fighting it. On a failed save, the target has the Charmed condition until the spell ends or until you or your allies damage it. The Charmed creature is Friendly to you. When the spell ends, the target knows it was Charmed by you. Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1."
 },
 {
  "name": "Chromatic Orb",
  "level": 1,
  "castingTime": "1 Action",
  "range": "90 ft.",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "Ranged",
  "effect": "Acid (...)",
  "classes": [
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You hurl an orb of energy at a target within range. Choose Acid, Cold, Fire, Lightning, Poison, or Thunder for the type of orb you create, and then make a ranged spell attack against the target. On a hit, the target takes 3d8 damage of the chosen type. If you roll the same number on two or more of the d8s, the orb leaps to a different target of your choice within 30 feet of the target. Make an attack roll against the new target, and make a new damage roll. The orb can't leap again unless you cast the spell with a level 2+ spell slot. Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 1. The orb can leap a maximum number of times equal to the level of the slot expended, and a creature can be targeted only once by each casting of this spell. * - (a diamond worth 50+ GP)"
 },
 {
  "name": "Color Spray",
  "level": 1,
  "castingTime": "1 Action",
  "range": "Self (15 ft. )",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Illusion",
  "save": "CON Save",
  "effect": "Blinded",
  "classes": [
   "Bard",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You launch a dazzling array of flashing, colorful light. Each creature in a 15-foot Cone originating from you must succeed on a Constitution saving throw or have the Blinded condition until the end of your next turn. * - (a pinch of colorful sand)"
 },
 {
  "name": "Command",
  "level": 1,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Enchantment",
  "save": "WIS Save",
  "effect": "Prone",
  "classes": [
   "Bard",
   "Cleric",
   "Druid",
   "Paladin",
   "Ranger",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You speak a one-word command to a creature you can see within range. The target must succeed on a Wisdom saving throw or follow the command on its next turn. Choose the command from these options: Approach. The target moves toward you by the shortest and most direct route, ending its turn if it moves within 5 feet of you. Drop. The target drops whatever it is holding and then ends its turn. Flee. The target spends its turn moving away from you by the fastest available means. Grovel. The target has the Prone condition and then ends its turn. Halt. On its turn, the target doesn't move and takes no action or Bonus Action. Using a Higher-Level Spell Slot. You can affect one additional creature for each spell slot level above 1."
 },
 {
  "name": "Create or Destroy Water",
  "level": 1,
  "castingTime": "1 Action",
  "range": "30 ft. (30 ft. )",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Transmutation",
  "save": "None",
  "effect": "Creation",
  "classes": [
   "Cleric",
   "Druid"
  ],
  "desc": "You do one of the following: Create Water. You create up to 10 gallons of clean water within range in an open container. Alternatively, the water falls as rain in a 30-foot Cube within range, extinguishing exposed flames there. Destroy Water. You destroy up to 10 gallons of water in an open container within range. Alternatively, you destroy fog in a 30-foot Cube within range. Using a Higher-Level Spell Slot. You create or destroy 10 additional gallons of water, or the size of the Cube increases by 5 feet, for each spell slot level above 1. * - (a mix of water and sand)"
 },
 {
  "name": "Cure Wounds",
  "level": 1,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Abjuration",
  "save": "None",
  "effect": "Healing",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Paladin",
   "Ranger",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "A creature you touch regains a number of Hit Points equal to 2d8 plus your spellcasting ability modifier. Using a Higher-Level Spell Slot. The healing increases by 2d8 for each spell slot level above 1."
 },
 {
  "name": "Disguise Self",
  "level": 1,
  "castingTime": "1 Action",
  "range": "Self",
  "components": "V, S",
  "duration": "1 Hour",
  "school": "Illusion",
  "save": "None",
  "effect": "Shapechanging",
  "classes": [
   "Artificer",
   "Bard",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You make yourself—including your clothing, armor, weapons, and other belongings on your person—look different until the spell ends. You can seem 1 foot shorter or taller and can appear heavier or lighter. You must adopt a form that has the same basic arrangement of limbs as you have. Otherwise, the extent of the illusion is up to you. The changes wrought by this spell fail to hold up to physical inspection. For example, if you use this spell to add a hat to your outfit, objects pass through the hat, and anyone who touches it would feel nothing. To discern that you are disguised, a creature must take the Study action to inspect your appearance and succeed on an Intelligence (Investigation) check against your spell save DC."
 },
 {
  "name": "Dissonant Whispers",
  "level": 1,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Enchantment",
  "save": "WIS Save",
  "effect": "Psychic",
  "classes": [
   "Bard",
   "Cleric",
   "Druid",
   "Wizard"
  ],
  "desc": "One creature of your choice that you can see within range hears a discordant melody in its mind. The target makes a Wisdom saving throw. On a failed save, it takes 3d6 Psychic damage and must immediately use its Reaction, if available, to move as far away from you as it can, using the safest route. On a successful save, the target takes half as much damage only. Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1."
 },
 {
  "name": "Divine Favor",
  "level": 1,
  "castingTime": "1 Bonus Action",
  "range": "Self",
  "components": "V, S",
  "duration": "1 Minute",
  "school": "Transmutation",
  "save": "None",
  "effect": "Radiant",
  "classes": [
   "Paladin"
  ],
  "desc": "Until the spell ends, your attacks with weapons deal an extra 1d4 Radiant damage on a hit."
 },
 {
  "name": "Divine Smite",
  "level": 1,
  "castingTime": "1 Bonus Action *",
  "range": "Self",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "None",
  "effect": "Radiant",
  "classes": [
   "Paladin"
  ],
  "desc": "The target takes an extra 2d8 Radiant damage from the attack. The damage increases by 1d8 if the target is a Fiend or an Undead. Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 1. * - Which you take immediately after hitting a target with a Melee weapon or an Unarmed Strike"
 },
 {
  "name": "False Life",
  "level": 1,
  "castingTime": "1 Action",
  "range": "Self",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "None",
  "effect": "Buff",
  "classes": [
   "Artificer",
   "Bard",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You gain 2d4 + 4 Temporary Hit Points. Using a Higher-Level Spell Slot. You gain 5 additional Temporary Hit Points for each spell slot level above 1. * - (a drop of alcohol)"
 },
 {
  "name": "Feather Fall",
  "level": 1,
  "castingTime": "1 Reaction *",
  "range": "60 ft.",
  "components": "V, M **",
  "duration": "1 Minute",
  "school": "Transmutation",
  "save": "None",
  "effect": "Exploration (...)",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "Choose up to five falling creatures within range. A falling creature's rate of descent slows to 60 feet per round until the spell ends. If a creature lands before the spell ends, the creature takes no damage from the fall, and the spell ends for that creature. * - which you take when you or a creature you can see within 60 feet of you falls ** - (a small feather or piece of down)"
 },
 {
  "name": "Goodberry",
  "level": 1,
  "castingTime": "1 Action",
  "range": "Self",
  "components": "V, S, M *",
  "duration": "24 Hours",
  "school": "Conjuration",
  "save": "None",
  "effect": "Healing",
  "classes": [
   "Druid",
   "Ranger"
  ],
  "desc": "Ten berries appear in your hand and are infused with magic for the duration. A creature can take a Bonus Action to eat one berry. Eating a berry restores 1 Hit Point, and the berry provides enough nourishment to sustain a creature for one day. Uneaten berries disappear when the spell ends. * - (a sprig of mistletoe)"
 },
 {
  "name": "Grease",
  "level": 1,
  "castingTime": "1 Action",
  "range": "60 ft. (10 ft. )",
  "components": "V, S, M *",
  "duration": "1 Minute",
  "school": "Conjuration",
  "save": "DEX Save",
  "effect": "Prone",
  "classes": [
   "Artificer",
   "Bard",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "Nonflammable grease covers the ground in a 10-foot square centered on a point within range and turns it into Difficult Terrain for the duration. When the grease appears, each creature standing in its area must succeed on a Dexterity saving throw or have the Prone condition. A creature that enters the area or ends its turn there must also succeed on that save or fall Prone. * - (a bit of pork rind or butter)"
 },
 {
  "name": "Guiding Bolt",
  "level": 1,
  "castingTime": "1 Action",
  "range": "120 ft.",
  "components": "V, S",
  "duration": "1 Round",
  "school": "Evocation",
  "save": "Ranged",
  "effect": "Radiant",
  "classes": [
   "Cleric",
   "Druid",
   "Ranger",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You hurl a bolt of light toward a creature within range. Make a ranged spell attack against the target. On a hit, it takes 4d6 Radiant damage, and the next attack roll made against it before the end of your next turn has Advantage. Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1."
 },
 {
  "name": "Hail of Thorns",
  "level": 1,
  "castingTime": "1 Bonus Action *",
  "range": "Self",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Conjuration",
  "save": "DEX Save",
  "effect": "Piercing",
  "classes": [
   "Ranger"
  ],
  "desc": "As you hit the creature, this spell creates a rain of thorns that sprouts from your Ranged weapon or ammunition. The target of the attack and each creature within 5 feet of it make a Dexterity saving throw, taking 1d10 Piercing damage on a failed save or half as much damage on a successful one. Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 1. * - which you take immediately after hitting a creature with a Ranged weapon"
 },
 {
  "name": "Healing Word",
  "level": 1,
  "castingTime": "1 Bonus Action",
  "range": "60 ft.",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Abjuration",
  "save": "None",
  "effect": "Healing",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid"
  ],
  "desc": "A creature of your choice that you can see within range regains Hit Points equal to 2d4 plus your spellcasting ability modifier. Using a Higher-Level Spell Slot. The healing increases by 2d4 for each spell slot level above 1."
 },
 {
  "name": "Hellish Rebuke",
  "level": 1,
  "castingTime": "1 Reaction *",
  "range": "60 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "DEX Save",
  "effect": "Fire",
  "classes": [
   "Warlock"
  ],
  "desc": "The creature that damaged you is momentarily surrounded by green flames. It makes a Dexterity saving throw, taking 2d10 Fire damage on a failed save or half as much damage on a successful one. Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 1. * - which you take in response to taking damage from a creature that you can see within 60 feet of yourself"
 },
 {
  "name": "Ice Knife",
  "level": 1,
  "castingTime": "1 Action",
  "range": "60 ft. (5 ft. *)",
  "components": "S, M *",
  "duration": "Instantaneous",
  "school": "Conjuration",
  "save": "DEX Save",
  "effect": "Piercing (...)",
  "classes": [
   "Druid",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You create a shard of ice and fling it at one creature within range. Make a ranged spell attack against the target. On a hit, the target takes 1d10 Piercing damage. Hit or miss, the shard then explodes. The target and each creature within 5 feet of it must succeed on a Dexterity saving throw or take 2d6 Cold damage. Using a Higher-Level Spell Slot. The Cold damage increases by 1d6 for each spell slot level above 1. * - (a drop of water or a piece of ice)"
 },
 {
  "name": "Inflict Wounds",
  "level": 1,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "CON Save",
  "effect": "Necrotic",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "A creature you touch makes a Constitution saving throw, taking 2d10 Necrotic damage on a failed save or half as much damage on a successful one. Using a Higher-Level Spell Slot. The damage increases by 1d10 for each spell slot level above 1."
 },
 {
  "name": "Jump",
  "level": 1,
  "castingTime": "1 Bonus Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "1 Minute",
  "school": "Transmutation",
  "save": "None",
  "effect": "Movement",
  "classes": [
   "Artificer",
   "Druid",
   "Ranger",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You touch a willing creature. Once on each of its turns until the spell ends, that creature can jump up to 30 feet by spending 10 feet of movement. Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1. * - (a grasshopper's hind leg)"
 },
 {
  "name": "Longstrider",
  "level": 1,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "1 Hour",
  "school": "Transmutation",
  "save": "None",
  "effect": "Buff (...)",
  "classes": [
   "Artificer",
   "Bard",
   "Druid",
   "Ranger",
   "Wizard"
  ],
  "desc": "You touch a creature. The target's Speed increases by 10 feet until the spell ends. Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 1. * - (a pinch of dirt)"
 },
 {
  "name": "Mage Armor",
  "level": 1,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "8 Hours",
  "school": "Abjuration",
  "save": "None",
  "effect": "Buff (...)",
  "classes": [
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You touch a willing creature who isn't wearing armor. Until the spell ends, the target's base AC becomes 13 plus its Dexterity modifier. The spell ends early if the target dons armor. * - (a piece of cured leather)"
 },
 {
  "name": "Magic Missile",
  "level": 1,
  "castingTime": "1 Action",
  "range": "120 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "None",
  "effect": "Force",
  "classes": [
   "Artificer",
   "Bard",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You create three glowing darts of magical force. Each dart strikes a creature of your choice that you can see within range. A dart deals 1d4 + 1 Force damage to its target. The darts all strike simultaneously, and you can direct them to hit one creature or several. Using a Higher-Level Spell Slot. The spell creates one more dart for each spell slot level above 1."
 },
 {
  "name": "Ray of Sickness",
  "level": 1,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "Ranged",
  "effect": "Poison",
  "classes": [
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You shoot a greenish ray at a creature within range. Make a ranged spell attack against the target. On a hit, the target takes 2d8 Poison damage and has the Poisoned condition until the end of your next turn. Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 1."
 },
 {
  "name": "Sanctuary",
  "level": 1,
  "castingTime": "1 Bonus Action",
  "range": "30 ft.",
  "components": "V, S, M *",
  "duration": "1 Minute",
  "school": "Abjuration",
  "save": "WIS Save",
  "effect": "Buff (...)",
  "classes": [
   "Artificer",
   "Cleric"
  ],
  "desc": "You ward a creature within range. Until the spell ends, any creature who targets the warded creature with an attack roll or a damaging spell must succeed on a Wisdom saving throw or either choose a new target or lose the attack or spell. This spell doesn't protect the warded creature from areas of effect. The spell ends if the warded creature makes an attack roll, casts a spell, or deals damage. * - (a shard of glass from a mirror)"
 },
 {
  "name": "Searing Smite",
  "level": 1,
  "castingTime": "1 Bonus Action *",
  "range": "Self",
  "components": "V",
  "duration": "1 Minute",
  "school": "Evocation",
  "save": "CON Save",
  "effect": "Fire (...)",
  "classes": [
   "Paladin"
  ],
  "desc": "As you hit the target, it takes an extra 1d6 Fire damage from the attack. At the start of each of its turns until the spell ends, the target takes 1d6 Fire damage and then makes a Constitution saving throw. On a failed save, the spell continues. On a successful save, the spell ends. Using a Higher-Level Spell Slot. All the damage increases by 1d6 for each spell slot level above 1. * - which you take immediately after hitting a target with a Melee weapon or an Unarmed Strike"
 },
 {
  "name": "Shield",
  "level": 1,
  "castingTime": "1 Reaction *",
  "range": "Self",
  "components": "V, S",
  "duration": "1 Round",
  "school": "Abjuration",
  "save": "None",
  "effect": "Warding",
  "classes": [
   "Cleric",
   "Paladin",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "An imperceptible barrier of magical force protects you. Until the start of your next turn, you have a +5 bonus to AC, including against the triggering attack, and you take no damage from Magic Missile. * - which you take when you are hit by an attack roll or targeted by the Magic Missile spell"
 },
 {
  "name": "Thunderous Smite",
  "level": 1,
  "castingTime": "1 Bonus Action *",
  "range": "Self",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "STR Save",
  "effect": "Thunder",
  "classes": [
   "Paladin"
  ],
  "desc": "Your strike rings with thunder that is audible within 300 feet of you, and the target takes an extra 2d6 Thunder damage from the attack. Additionally, if the target is a creature, it must succeed on a Strength saving throw or be pushed 10 feet away from you and have the Prone condition. Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1. * - which you take immediately after hitting a target with a Melee weapon or an Unarmed Strike"
 },
 {
  "name": "Thunderwave",
  "level": 1,
  "castingTime": "1 Action",
  "range": "Self (15 ft. )",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "CON Save",
  "effect": "Thunder",
  "classes": [
   "Bard",
   "Druid",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You unleash a wave of thunderous energy. Each creature in a 15-foot Cube originating from you makes a Constitution saving throw. On a failed save, a creature takes 2d8 Thunder damage and is pushed 10 feet away from you. On a successful save, a creature takes half as much damage only. In addition, unsecured objects that are entirely within the Cube are pushed 10 feet away from you, and a thunderous boom is audible within 300 feet. Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 1."
 },
 {
  "name": "Wrathful Smite",
  "level": 1,
  "castingTime": "1 Bonus Action *",
  "range": "Self",
  "components": "V",
  "duration": "1 Minute",
  "school": "Necromancy",
  "save": "WIS Save",
  "effect": "Necrotic",
  "classes": [
   "Bard",
   "Paladin",
   "Wizard"
  ],
  "desc": "The target takes an extra 1d6 Necrotic damage from the attack, and it must succeed on a Wisdom saving throw or have the Frightened condition until the spell ends. At the end of each of its turns, the Frightened target repeats the save, ending the spell on itself on a success. Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 1. * - which you take immediately after hitting a creature with a Melee weapon or an Unarmed Strike"
 },
 {
  "name": "Aid",
  "level": 2,
  "castingTime": "1 Action",
  "range": "30 ft.",
  "components": "V, S, M *",
  "duration": "8 Hours",
  "school": "Abjuration",
  "save": "None",
  "effect": "Buff",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Paladin",
   "Ranger",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "Choose up to three creatures within range. Each target's Hit Point maximum and current Hit Points increase by 5 for the duration. Using a Higher-Level Spell Slot. Each target's Hit Points increase by 5 for each spell slot level above 2. * - (a strip of white cloth)"
 },
 {
  "name": "Arcane Lock",
  "level": 2,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Until Dispelled",
  "school": "Abjuration",
  "save": "None",
  "effect": "Utility (...)",
  "classes": [
   "Artificer",
   "Wizard"
  ],
  "desc": "You touch a closed door, window, gate, container, or hatch and magically lock it for the duration. This lock can't be unlocked by any nonmagical means. You and any creatures you designate when you cast the spell can open and close the object despite the lock. You can also set a password that, when spoken within 5 feet of the object, unlocks it for 1 minute. * - (gold dust worth 25+ GP, which the spell consumes)"
 },
 {
  "name": "Arcane Vigor",
  "level": 2,
  "castingTime": "1 Bonus Action",
  "range": "Self",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Abjuration",
  "save": "None",
  "effect": "You tap into your life force to heal yourself. Roll one or two of your unexpended Hit Point Dice, and regain a number of Hit Points equal to the roll's total plus your spellcasting ability modifier. Those dice are then expended.",
  "classes": [
   "Artificer",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "Using a Higher-Level Spell Slot. The number of unexpended Hit Dice you can roll increases by one for each spell slot level above 2."
 },
 {
  "name": "Barkskin",
  "level": 2,
  "castingTime": "1 Bonus Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "1 Hour",
  "school": "Transmutation",
  "save": "None",
  "effect": "Buff (...)",
  "classes": [
   "Cleric",
   "Druid",
   "Ranger"
  ],
  "desc": "You touch a willing creature. Until the spell ends, the target's skin assumes a bark-like appearance, and the target has an Armor Class of 17 if its AC is lower than that. * - (a handful of oak bark)"
 },
 {
  "name": "Blindness/Deafness",
  "level": 2,
  "castingTime": "1 Action",
  "range": "120 ft.",
  "components": "V",
  "duration": "1 Minute",
  "school": "Transmutation",
  "save": "CON Save",
  "effect": "Blinded (...)",
  "classes": [
   "Bard",
   "Cleric",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "One creature that you can see within range must succeed on a Constitution saving throw, or it has the Blinded or Deafened condition (your choice) for the duration. At the end of each of its turns, the target repeats the save, ending the spell on itself on a success. Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 2."
 },
 {
  "name": "Continual Flame",
  "level": 2,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Until Dispelled",
  "school": "Evocation",
  "save": "None",
  "effect": "Creation",
  "classes": [
   "Artificer",
   "Cleric",
   "Druid",
   "Wizard"
  ],
  "desc": "A flame springs from an object that you touch. The effect casts Bright Light in a 20-foot radius and Dim Light for an additional 20 feet. It looks like a regular flame, but it creates no heat and consumes no fuel. The flame can be covered or hidden but not smothered or quenched. * - (ruby dust worth 50+ GP, which the spell consumes)"
 },
 {
  "name": "Cordon of Arrows",
  "level": 2,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "8 Hours",
  "school": "Transmutation",
  "save": "DEX Save",
  "effect": "Piercing",
  "classes": [
   "Ranger"
  ],
  "desc": "You touch up to four nonmagical Arrows or Bolts and plant them in the ground in your space. Until the spell ends, the ammunition can't be physically uprooted, and whenever a creature other than you enters a space within 30 feet of the ammunition for the first time on a turn or ends its turn there, one piece of ammunition flies up to strike it. The creature must succeed on a Dexterity saving throw or take 2d4 Piercing damage. The piece of ammunition is then destroyed. The spell ends when none of the ammunition remains planted in the ground. When you cast this spell, you can designate any creatures you choose, and the spell ignores them. Using a Higher-Level Spell Slot. The amount of ammunition that can be affected increases by two for each spell slot level above 2. * - (four or more arrows or bolts)"
 },
 {
  "name": "Darkvision",
  "level": 2,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "8 Hours",
  "school": "Transmutation",
  "save": "None",
  "effect": "Buff",
  "classes": [
   "Artificer",
   "Druid",
   "Ranger",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "For the duration, a willing creature you touch has Darkvision with a range of 150 feet. * - (a dried carrot)"
 },
 {
  "name": "Find Steed",
  "level": 2,
  "castingTime": "1 Action",
  "range": "30 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Conjuration",
  "save": "None",
  "effect": "Summoning",
  "classes": [
   "Bard",
   "Cleric",
   "Druid",
   "Paladin"
  ],
  "desc": "You summon an otherworldly being that appears as a loyal steed in an unoccupied space of your choice within range. This creature uses the Otherworldly Steed stat block. If you already have a steed from this spell, the steed is replaced by the new one. The steed resembles a Large, rideable animal of your choice, such as a horse, a camel, a dire wolf, or an elk. Whenever you cast the spell, choose the steed's creature type—Celestial, Fey, or Fiend—which determines certain traits in the stat block. Combat. The steed is an ally to you and your allies. In combat, it shares your Initiative count, and it functions as a controlled mount while you ride it (as defined in the rules on mounted combat). If you have the Incapacitated condition, the steed takes its turn immediately after yours and acts independently, focusing on protecting you. Disappearance of the Steed. The steed disappears if it drops to 0 Hit Points or if you die. When it disappears, it leaves behind anything it was wearing or carrying. If you cast this spell again, you decide whether you summon the steed that disappeared or a different one. Using a Higher-Level Spell Slot. Use the spell slot's level for the spell's level in the stat block. Otherworldly Steed Large Celestial, Fey, or Fiend (Your Choice), Neutral AC 10 + 1 per spell level HP 5 + 10 per spell level (the steed has a number of Hit Dice [d10s] equal to the spell's level) Speed 60 ft., Fly 60 ft. (requires level 4+ spell) Mod Save STR 18 +4 +4 DEX 12 +1 +1 CON 14 +2 +2 Mod Save INT 6 −2 −2 WIS 12 +1 +1 CHA 8 −1 −1 Senses Passive Perception 11 Languages Telepathy 1 mile (works only with you) CR None (XP 0; PB equals your Proficiency Bonus) Traits Life Bond. When you regain Hit Points from a level 1+ spell, the steed regains the same number of Hit Points if you're within 5 feet of it. Actions Otherworldly Slam. Melee Attack Roll: Bonus equals your spell attack modifier, reach 5 ft. Hit: 1d8 plus the spell's level of Radiant (Celestial), Psychic (Fey), or Necrotic (Fiend) damage. Bonus Actions Fell Glare (Fiend Only; Recharges after a Long Rest). Wisdom Saving Throw: DC equals your spell save DC, one creature within 60 feet the steed can see. Failure: The target has the Frightened condition until the end of your next turn. Fey Step (Fey Only; Recharges after a Long Rest). The steed teleports, along with its rider, to an unoccupied space of your choice up to 60 feet away from itself. Healing Touch (Celestial Only; Recharges after a Long Rest). One creature within 5 feet of the steed regains a number of Hit Points equal to 2d8 plus the spell's level."
 },
 {
  "name": "Find Traps",
  "level": 2,
  "castingTime": "1 Action",
  "range": "120 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Divination",
  "save": "None",
  "effect": "Detection",
  "classes": [
   "Cleric",
   "Druid",
   "Ranger"
  ],
  "desc": "You sense any trap within range that is within line of sight. A trap, for the purpose of this spell, includes any object or mechanism that was created to cause damage or other danger. Thus, the spell would sense the Alarm or Glyph of Warding spell or a mechanical pit trap, but it wouldn't reveal a natural weakness in the floor, an unstable ceiling, or a hidden sinkhole. This spell reveals that a trap is present but not its location. You do learn the general nature of the danger posed by a trap you sense."
 },
 {
  "name": "Knock",
  "level": 2,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Transmutation",
  "save": "None",
  "effect": "Utility",
  "classes": [
   "Bard",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "Choose an object that you can see within range. The object can be a door, a box, a chest, a set of manacles, a padlock, or another object that contains a mundane or magical means that prevents access. A target that is held shut by a mundane lock or that is stuck or barred becomes unlocked, unstuck, or unbarred. If the object has multiple locks, only one of them is unlocked. If the target is held shut by Arcane Lock, that spell is suppressed for 10 minutes, during which time the target can be opened and closed. When you cast the spell, a loud knock, audible up to 300 feet away, emanates from the target."
 },
 {
  "name": "Lesser Restoration",
  "level": 2,
  "castingTime": "1 Bonus Action",
  "range": "Touch",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Abjuration",
  "save": "None",
  "effect": "Healing",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Paladin",
   "Ranger",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You touch a creature and end one condition on it: Blinded, Deafened, Paralyzed, or Poisoned."
 },
 {
  "name": "Magic Weapon",
  "level": 2,
  "castingTime": "1 Bonus Action",
  "range": "Touch",
  "components": "V, S",
  "duration": "1 Hour",
  "school": "Transmutation",
  "save": "None",
  "effect": "Buff",
  "classes": [
   "Artificer",
   "Bard",
   "Paladin",
   "Ranger",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You touch a nonmagical weapon. Until the spell ends, that weapon becomes a magic weapon with a +1 bonus to attack rolls and damage rolls. The spell ends early if you cast it again. Using a Higher-Level Spell Slot. The bonus increases to +2 with a level 3–5 spell slot. The bonus increases to +3 with a level 6+ spell slot."
 },
 {
  "name": "Melf's Acid Arrow",
  "level": 2,
  "castingTime": "1 Action",
  "range": "90 ft.",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "Ranged",
  "effect": "Acid (...)",
  "classes": [
   "Wizard"
  ],
  "desc": "A shimmering green arrow streaks toward a target within range and bursts in a spray of acid. Make a ranged spell attack against the target. On a hit, the target takes 4d4 Acid damage and 2d4 Acid damage at the end of its next turn. On a miss, the arrow splashes the target with acid for half as much of the initial damage only. Using a Higher-Level Spell Slot. The damage (both initial and later) increases by 1d4 for each spell slot level above 2. * - (powdered rhubarb leaf)"
 },
 {
  "name": "Mirror Image",
  "level": 2,
  "castingTime": "1 Action",
  "range": "Self",
  "components": "V, S",
  "duration": "1 Minute",
  "school": "Illusion",
  "save": "None",
  "effect": "Deception (...)",
  "classes": [
   "Bard",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "Three illusory duplicates of yourself appear in your space. Until the spell ends, the duplicates move with you and mimic your actions, shifting position so it's impossible to track which image is real. Each time a creature hits you with an attack roll during the spell's duration, roll a d6 for each of your remaining duplicates. If any of the d6s rolls a 3 or higher, one of the duplicates is hit instead of you, and the duplicate is destroyed. The duplicates otherwise ignore all other damage and effects. The spell ends when all three duplicates are destroyed. A creature is unaffected by this spell if it has the Blinded condition, Blindsight, or Truesight."
 },
 {
  "name": "Misty Step",
  "level": 2,
  "castingTime": "1 Bonus Action",
  "range": "Self",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Conjuration",
  "save": "None",
  "effect": "Teleportation",
  "classes": [
   "Bard",
   "Druid",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "Briefly surrounded by silvery mist, you teleport up to 30 feet to an unoccupied space you can see."
 },
 {
  "name": "Nystul's Magic Aura",
  "level": 2,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "24 Hours",
  "school": "Illusion",
  "save": "None",
  "effect": "Deception",
  "classes": [
   "Wizard"
  ],
  "desc": "With a touch, you place an illusion on a willing creature or an object that isn't being worn or carried. A creature gains the Mask effect below, and an object gains the False Aura effect below. The effect lasts for the duration. If you cast the spell on the same target every day for 30 days, the illusion lasts until dispelled. Mask (Creature). Choose a creature type other than the target's actual type. Spells and other magical effects treat the target as if it were a creature of the chosen type. False Aura (Object). You change the way the target appears to spells and magical effects that detect magical auras, such as Detect Magic. You can make a nonmagical object appear magical, make a magic item appear nonmagical, or change the object's aura so that it appears to belong to a school of magic you choose. * - (a small square of silk)"
 },
 {
  "name": "Prayer of Healing",
  "level": 2,
  "castingTime": "10 Minutes",
  "range": "30 ft.",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Abjuration",
  "save": "None",
  "effect": "Healing",
  "classes": [
   "Cleric",
   "Paladin"
  ],
  "desc": "Up to five creatures of your choice who remain within range for the spell's entire casting gain the benefits of a Short Rest and also regain 2d8 Hit Points. A creature can't be affected by this spell again until that creature finishes a Long Rest. Using a Higher-Level Spell Slot. The healing increases by 1d8 for each spell slot level above 2."
 },
 {
  "name": "Protection from Poison",
  "level": 2,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S",
  "duration": "1 Hour",
  "school": "Abjuration",
  "save": "None",
  "effect": "Buff (...)",
  "classes": [
   "Artificer",
   "Cleric",
   "Druid",
   "Paladin",
   "Ranger"
  ],
  "desc": "You touch a creature and end the Poisoned condition on it. For the duration, the target has Advantage on saving throws to avoid or end the Poisoned condition, and it has Resistance to Poison damage."
 },
 {
  "name": "Rope Trick",
  "level": 2,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "1 Hour",
  "school": "Transmutation",
  "save": "None",
  "effect": "Utility",
  "classes": [
   "Artificer",
   "Wizard"
  ],
  "desc": "You touch a rope. One end of it hovers upward until the rope hangs perpendicular to the ground or the rope reaches a ceiling. At the rope's upper end, an Invisible 3-foot-by-5-foot portal opens to an extradimensional space that lasts until the spell ends. That space can be reached by climbing the rope, which can be pulled into or dropped out of it. The space can hold up to eight Medium or smaller creatures. Attacks, spells, and other effects can't pass into or out of the space, but creatures inside it can see through the portal. Anything inside the space drops out when the spell ends. * - (a segment of rope)"
 },
 {
  "name": "Scorching Ray",
  "level": 2,
  "castingTime": "1 Action",
  "range": "120 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "Ranged",
  "effect": "Fire",
  "classes": [
   "Bard",
   "Cleric",
   "Druid",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You hurl three fiery rays. You can hurl them at one target within range or at several. Make a ranged spell attack for each ray. On a hit, the target takes 2d6 Fire damage. Using a Higher-Level Spell Slot. You create one additional ray for each spell slot level above 2."
 },
 {
  "name": "See Invisibility",
  "level": 2,
  "castingTime": "1 Action",
  "range": "Self",
  "components": "V, S, M *",
  "duration": "1 Hour",
  "school": "Divination",
  "save": "None",
  "effect": "Detection",
  "classes": [
   "Artificer",
   "Bard",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "For the duration, you see creatures and objects that have the Invisible condition as if they were visible, and you can see into the Ethereal Plane. Creatures and objects there appear ghostly. * - (a pinch of talc)"
 },
 {
  "name": "Shatter",
  "level": 2,
  "castingTime": "1 Action",
  "range": "60 ft. (10 ft. )",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "CON Save",
  "effect": "Thunder",
  "classes": [
   "Bard",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "A loud noise erupts from a point of your choice within range. Each creature in a 10-foot-radius Sphere centered there makes a Constitution saving throw, taking 3d8 Thunder damage on a failed save or half as much damage on a successful one. A Construct has Disadvantage on the save. A nonmagical object that isn't being worn or carried also takes the damage if it's in the spell's area. Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 2. * - (a chip of mica)"
 },
 {
  "name": "Warding Bond",
  "level": 2,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "1 Hour",
  "school": "Abjuration",
  "save": "None",
  "effect": "Buff (...)",
  "classes": [
   "Artificer",
   "Cleric",
   "Druid",
   "Paladin",
   "Ranger",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You touch another creature that is willing and create a mystic connection between you and the target until the spell ends. While the target is within 60 feet of you, it gains a +1 bonus to AC and saving throws, and it has Resistance to all damage. Also, each time it takes damage, you take the same amount of damage. The spell ends if you drop to 0 Hit Points or if you and the target become separated by more than 60 feet. It also ends if the spell is cast again on either of the connected creatures. * - (a pair of platinum rings worth 50+ GP each, which you and the target must wear for the duration)"
 },
 {
  "name": "Zone of Truth",
  "level": 2,
  "castingTime": "1 Action",
  "range": "60 ft. (15 ft. )",
  "components": "V, S",
  "duration": "10 Minutes",
  "school": "Enchantment",
  "save": "CHA Save",
  "effect": "Control",
  "classes": [
   "Bard",
   "Cleric",
   "Paladin"
  ],
  "desc": "You create a magical zone that guards against deception in a 15-foot-radius Sphere centered on a point within range. Until the spell ends, a creature that enters the spell's area for the first time on a turn or starts its turn there makes a Charisma saving throw. On a failed save, a creature can't speak a deliberate lie while in the radius. You know whether a creature succeeds or fails on this save. An affected creature is aware of the spell and can avoid answering questions to which it would normally respond with a lie. Such a creature can be evasive yet must be truthful."
 },
 {
  "name": "Animate Dead",
  "level": 3,
  "castingTime": "1 Minute",
  "range": "10 ft.",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "None",
  "effect": "Creation",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "Choose a pile of bones or a corpse of a Medium or Small Humanoid within range. The target becomes an Undead creature: a Skeleton if you chose bones or a Zombie if you chose a corpse. On each of your turns, you can take a Bonus Action to mentally command any creature you made with this spell if the creature is within 60 feet of you (if you control multiple creatures, you can command any of them at the same time, issuing the same command to each one). You decide what action the creature will take and where it will move on its next turn, or you can issue a general command, such as to guard a chamber or corridor. If you issue no commands, the creature takes the Dodge action and moves only to avoid harm. Once given an order, the creature continues to follow it until its task is complete. The creature is under your control for 24 hours, after which it stops obeying any command you've given it. To maintain control of the creature for another 24 hours, you must cast this spell on the creature again before the current 24-hour period ends. This use of the spell reasserts your control over up to four creatures you have animated with this spell rather than animating a new creature. Using a Higher-Level Spell Slot. You animate or reassert control over two additional Undead creatures for each spell slot level above 3. Each of the creatures must come from a different corpse or pile of bones. * - (a drop of blood, a piece of flesh, and a pinch of bone dust)"
 },
 {
  "name": "Blinding Smite",
  "level": 3,
  "castingTime": "1 Bonus Action *",
  "range": "Self",
  "components": "V",
  "duration": "1 Minute",
  "school": "Evocation",
  "save": "CON Save",
  "effect": "Radiant",
  "classes": [
   "Paladin"
  ],
  "desc": "The target hit by the strike takes an extra 3d8 Radiant damage from the attack, and the target has the Blinded condition until the spell ends. At the end of each of its turns, the Blinded target makes a Constitution saving throw, ending the spell on itself on a success. Using a Higher-Level Spell Slot. The extra damage increases by 1d8 for each spell slot level above 3. * - which you take immediately after hitting a creature with a Melee weapon or an Unarmed Strike"
 },
 {
  "name": "Blink",
  "level": 3,
  "castingTime": "1 Action",
  "range": "Self",
  "components": "V, S",
  "duration": "1 Minute",
  "school": "Transmutation",
  "save": "None",
  "effect": "Utility",
  "classes": [
   "Artificer",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "Roll 1d6 at the end of each of your turns for the duration. On a roll of 4–6, you vanish from your current plane of existence and appear in the Ethereal Plane (the spell ends instantly if you are already on that plane). While on the Ethereal Plane, you can perceive the plane you left, which is cast in shades of gray, but you can't see anything there more than 60 feet away. You can affect and be affected only by other creatures on the Ethereal Plane, and creatures on the other plane can't perceive you unless they have a special ability that lets them perceive things on the Ethereal Plane. You return to the other plane at the start of your next turn and when the spell ends if you are on the Ethereal Plane. You return to an unoccupied space of your choice that you can see within 10 feet of the space you left. If no unoccupied space is available within that range, you appear in the nearest unoccupied space."
 },
 {
  "name": "Conjure Barrage",
  "level": 3,
  "castingTime": "1 Action",
  "range": "Self (60 ft. )",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Conjuration",
  "save": "DEX Save",
  "effect": "Force",
  "classes": [
   "Cleric",
   "Druid",
   "Ranger",
   "Wizard"
  ],
  "desc": "You brandish the weapon used to cast the spell and conjure similar spectral weapons (or ammunition appropriate to the weapon) that launch forward and then disappear. Each creature of your choice that you can see in a 60-foot Cone makes a Dexterity saving throw, taking 5d8 Force damage on a failed save or half as much damage on a successful one. Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 3. * - (a Melee or Ranged weapon worth at least 1 CP)"
 },
 {
  "name": "Counterspell",
  "level": 3,
  "castingTime": "1 Reaction *",
  "range": "60 ft.",
  "components": "S",
  "duration": "Instantaneous",
  "school": "Abjuration",
  "save": "CON Save",
  "effect": "Negation",
  "classes": [
   "Artificer",
   "Cleric",
   "Paladin",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You attempt to interrupt a creature in the process of casting a spell. The creature makes a Constitution saving throw. On a failed save, the spell dissipates with no effect, and the action, Bonus Action, or Reaction used to cast it is wasted. If that spell was cast with a spell slot, the slot isn't expended. * - which you take when you see a creature within 60 feet of yourself casting a spell with Verbal, Somatic, or Material components"
 },
 {
  "name": "Daylight",
  "level": 3,
  "castingTime": "1 Action",
  "range": "60 ft. (60 ft. )",
  "components": "V, S",
  "duration": "1 Hour",
  "school": "Evocation",
  "save": "None",
  "effect": "Control",
  "classes": [
   "Cleric",
   "Druid",
   "Paladin",
   "Ranger",
   "Sorcerer"
  ],
  "desc": "For the duration, sunlight spreads from a point within range and fills a 60-foot-radius Sphere. The sunlight's area is Bright Light and sheds Dim Light for an additional 60 feet. Alternatively, you cast the spell on an object that isn't being worn or carried, causing the sunlight to fill a 60-foot Emanation originating from that object. Covering that object with something opaque, such as a bowl or helm, blocks the sunlight. If any of this spell's area overlaps with an area of Darkness created by a spell of level 3 or lower, that other spell is dispelled."
 },
 {
  "name": "Dispel Magic",
  "level": 3,
  "castingTime": "1 Action",
  "range": "120 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Abjuration",
  "save": "None",
  "effect": "Control",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Paladin",
   "Ranger",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "Choose one creature, object, or magical effect within range. Any ongoing spell of level 3 or lower on the target ends. For each ongoing spell of level 4 or higher on the target, make an ability check using your spellcasting ability (DC 10 plus that spell's level). On a successful check, the spell ends. Using a Higher-Level Spell Slot. You automatically end a spell on the target if the spell's level is equal to or less than the level of the spell slot you use."
 },
 {
  "name": "Fireball",
  "level": 3,
  "castingTime": "1 Action",
  "range": "150 ft. (20 ft. )",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "DEX Save",
  "effect": "Fire",
  "classes": [
   "Druid",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "A bright streak flashes from you to a point you choose within range and then blossoms with a low roar into a fiery explosion. Each creature in a 20-foot-radius Sphere centered on that point makes a Dexterity saving throw, taking 8d6 Fire damage on a failed save or half as much damage on a successful one. Flammable objects in the area that aren't being worn or carried start burning. Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 3. * - (a ball of bat guano and sulfur)"
 },
 {
  "name": "Glyph of Warding",
  "level": 3,
  "castingTime": "1 Hour",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Until Dispelled or Triggered",
  "school": "Abjuration",
  "save": "DEX Save",
  "effect": "Acid (...)",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Wizard"
  ],
  "desc": "You inscribe a glyph that later unleashes a magical effect. You inscribe it either on a surface (such as a table or a section of floor) or within an object that can be closed (such as a book or chest) to conceal the glyph. The glyph can cover an area no larger than 10 feet in diameter. If the surface or object is moved more than 10 feet from where you cast this spell, the glyph is broken, and the spell ends without being triggered. The glyph is nearly imperceptible and requires a successful Wisdom (Perception) check against your spell save DC to notice. When you inscribe the glyph, you set its trigger and choose whether it's an explosive rune or a spell glyph, as explained below. Set the Trigger. You decide what triggers the glyph when you cast the spell. For glyphs inscribed on a surface, common triggers include touching or stepping on the glyph, removing another object covering it, or approaching within a certain distance of it. For glyphs inscribed within an object, common triggers include opening that object or seeing the glyph. Once a glyph is triggered, this spell ends. You can refine the trigger so that only creatures of certain types activate it (for example, the glyph could be set to affect Aberrations). You can also set conditions for creatures that don't trigger the glyph, such as those who say a certain password. Explosive Rune. When triggered, the glyph erupts with magical energy in a 20-foot-radius Sphere centered on the glyph. Each creature in the area makes a Dexterity saving throw. A creature takes 5d8 Acid, Cold, Fire, Lightning, or Thunder damage (your choice when you create the glyph) on a failed save or half as much damage on a successful one. Spell Glyph. You can store a prepared spell of level 3 or lower in the glyph by casting it as part of creating the glyph. The spell must target a single creature or an area. The spell being stored has no immediate effect when cast in this way. When the glyph is triggered, the stored spell takes effect. If the spell has a target, it targets the creature that triggered the glyph. If the spell affects an area, the area is centered on that creature. If the spell summons Hostile creatures or creates harmful objects or traps, they appear as close as possible to the intruder and attack it. If the spell requires Concentration, it lasts until the end of its full duration. Using a Higher-Level Spell Slot. The damage of an explosive rune increases by 1d8 for each spell slot level above 3. If you create a spell glyph, you can store any spell of up to the same level as the spell slot you use for the Glyph of Warding. * - (powdered diamond worth 200+ GP, which the spell consumes)"
 },
 {
  "name": "Lightning Arrow",
  "level": 3,
  "castingTime": "1 Bonus Action *",
  "range": "Self",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Transmutation",
  "save": "DEX Save",
  "effect": "Lightning (...)",
  "classes": [
   "Ranger"
  ],
  "desc": "As your attack hits or misses the target, the weapon or ammunition you're using transforms into a lightning bolt. Instead of taking any damage or other effects from the attack, the target takes 4d8 Lightning damage on a hit or half as much damage on a miss. Each creature within 10 feet of the target then makes a Dexterity saving throw, taking 2d8 Lightning damage on a failed save or half as much damage on a successful one. The weapon or ammunition then returns to its normal form. Using a Higher-Level Spell Slot. The damage for both effects of the spell increases by 1d8 for each spell slot level above 3. * - which you take immediately after hitting or missing a target with a ranged attack using a weapon"
 },
 {
  "name": "Lightning Bolt",
  "level": 3,
  "castingTime": "1 Action",
  "range": "Self (100 ft. )",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "DEX Save",
  "effect": "Lightning",
  "classes": [
   "Bard",
   "Cleric",
   "Druid",
   "Paladin",
   "Ranger",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "A stroke of lightning forming a 100-foot-long, 5-foot-wide Line blasts out from you in a direction you choose. Each creature in the Line makes a Dexterity saving throw, taking 8d6 Lightning damage on a failed save or half as much damage on a successful one. Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 3. * - (a bit of fur and a crystal rod)"
 },
 {
  "name": "Magic Circle",
  "level": 3,
  "castingTime": "1 Minute",
  "range": "10 ft. (10 ft. *)",
  "components": "V, S, M *",
  "duration": "1 Hour",
  "school": "Abjuration",
  "save": "CHA Save",
  "effect": "You create a 10-foot-radius, 20-foot-tall Cylinder of magical energy centered on a point on the ground that you can see within range. Glowing runes appear wherever the Cylinder intersects with the floor or other surface.",
  "classes": [
   "Cleric",
   "Paladin",
   "Warlock",
   "Wizard"
  ],
  "desc": "Choose one or more of the following types of creatures: Celestials, Elementals, Fey, Fiends, or Undead. The circle affects a creature of the chosen type in the following ways: The creature can't willingly enter the Cylinder by nonmagical means. If the creature tries to use teleportation or interplanar travel to do so, it must first succeed on a Charisma saving throw. The creature has Disadvantage on attack rolls against targets within the Cylinder. Targets within the Cylinder can't be possessed by or gain the Charmed or Frightened condition from the creature. Each time you cast this spell, you can cause its magic to operate in the reverse direction, preventing a creature of the specified type from leaving the Cylinder and protecting targets outside it. Using a Higher-Level Spell Slot. The duration increases by 1 hour for each spell slot level above 3. * - (salt and powdered silver worth 100+ GP, which the spell consumes)"
 },
 {
  "name": "Mass Healing Word",
  "level": 3,
  "castingTime": "1 Bonus Action",
  "range": "60 ft.",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Abjuration",
  "save": "None",
  "effect": "Healing",
  "classes": [
   "Bard",
   "Cleric"
  ],
  "desc": "Up to six creatures of your choice that you can see within range regain Hit Points equal to 2d4 plus your spellcasting ability modifier. Using a Higher-Level Spell Slot. The healing increases by 1d4 for each spell slot level above 3."
 },
 {
  "name": "Nondetection",
  "level": 3,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "8 Hours",
  "school": "Abjuration",
  "save": "None",
  "effect": "Deception",
  "classes": [
   "Bard",
   "Ranger",
   "Wizard"
  ],
  "desc": "For the duration, you hide a target that you touch from Divination spells. The target can be a willing creature, or it can be a place or an object no larger than 10 feet in any dimension. The target can't be targeted by any Divination spell or perceived through magical scrying sensors. * - (a pinch of diamond dust worth 25+ GP, which the spell consumes)"
 },
 {
  "name": "Plant Growth",
  "level": 3,
  "castingTime": "Special *",
  "range": "150 ft. (100 ft. )",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Transmutation",
  "save": "None",
  "effect": "Control",
  "classes": [
   "Bard",
   "Druid",
   "Ranger"
  ],
  "desc": "This spell channels vitality into plants. The casting time you use determines whether the spell has the Overgrowth or the Enrichment effect below. Overgrowth. Choose a point within range. All normal plants in a 100-foot-radius Sphere centered on that point become thick and overgrown. A creature moving through that area must spend 4 feet of movement for every 1 foot it moves. You can exclude one or more areas of any size within the spell's area from being affected. Enrichment. All plants in a half-mile radius centered on a point within range become enriched for 365 days. The plants yield twice the normal amount of food when harvested. They can benefit from only one Plant Growth per year. * - Action (Overgrowth) or 8 hours (Enrichment)"
 },
 {
  "name": "Remove Curse",
  "level": 3,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Abjuration",
  "save": "None",
  "effect": "Buff",
  "classes": [
   "Artificer",
   "Cleric",
   "Druid",
   "Paladin",
   "Warlock",
   "Wizard"
  ],
  "desc": "At your touch, all curses affecting one creature or object end. If the object is a cursed magic item, its curse remains, but the spell breaks its owner's Attunement to the object so it can be removed or discarded."
 },
 {
  "name": "Revivify",
  "level": 3,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "None",
  "effect": "Healing",
  "classes": [
   "Artificer",
   "Cleric",
   "Druid",
   "Paladin",
   "Ranger"
  ],
  "desc": "You touch a creature that has died within the last minute. That creature revives with 1 Hit Point. This spell can't revive a creature that has died of old age, nor does it restore any missing body parts. * - (a diamond worth 300+ GP, which the spell consumes)"
 },
 {
  "name": "Sending",
  "level": 3,
  "castingTime": "1 Action",
  "range": "Unlimited",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Divination",
  "save": "None",
  "effect": "Communication",
  "classes": [
   "Bard",
   "Cleric",
   "Wizard"
  ],
  "desc": "You send a short message of 25 words or fewer to a creature you have met or a creature described to you by someone who has met it. The target hears the message in its mind, recognizes you as the sender if it knows you, and can answer in a like manner immediately. The spell enables targets to understand the meaning of your message. You can send the message across any distance and even to other planes of existence, but if the target is on a different plane than you, there is a 5 percent chance that the message doesn't arrive. You know if the delivery fails. Upon receiving your message, a creature can block your ability to reach it again with this spell for 8 hours. If you try to send another message during that time, you learn that you are blocked, and the spell fails. * - (a copper wire)"
 },
 {
  "name": "Speak with Dead",
  "level": 3,
  "castingTime": "1 Action",
  "range": "10 ft.",
  "components": "V, S, M *",
  "duration": "10 Minutes",
  "school": "Necromancy",
  "save": "None",
  "effect": "Communication (...)",
  "classes": [
   "Bard",
   "Cleric",
   "Wizard"
  ],
  "desc": "You grant the semblance of life to a corpse of your choice within range, allowing it to answer questions you pose. The corpse must have a mouth, and this spell fails if the deceased creature was Undead when it died. The spell also fails if the corpse was the target of this spell within the past 10 days. Until the spell ends, you can ask the corpse up to five questions. The corpse knows only what it knew in life, including the languages it knew. Answers are usually brief, cryptic, or repetitive, and the corpse is under no compulsion to offer a truthful answer if you are antagonistic toward it or it recognizes you as an enemy. This spell doesn't return the creature's soul to its body, only its animating spirit. Thus, the corpse can't learn new information, doesn't comprehend anything that has happened since it died, and can't speculate about future events. * - (burning incense)"
 },
 {
  "name": "Speak with Plants",
  "level": 3,
  "castingTime": "1 Action",
  "range": "Self",
  "components": "V, S",
  "duration": "10 Minutes",
  "school": "Transmutation",
  "save": "None",
  "effect": "Communication (...)",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Ranger",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You imbue plants in an immobile 30-foot Emanation with limited sentience and animation, giving them the ability to communicate with you and follow your simple commands. You can question plants about events in the spell's area within the past day, gaining information about creatures that have passed, weather, and other circumstances. You can also turn Difficult Terrain caused by plant growth (such as thickets and undergrowth) into ordinary terrain that lasts for the duration. Or you can turn ordinary terrain where plants are present into Difficult Terrain that lasts for the duration. The spell doesn't enable plants to uproot themselves and move about, but they can move their branches, tendrils, and stalks for you. If a Plant creature is in the area, you can communicate with it as if you shared a common language."
 },
 {
  "name": "Tongues",
  "level": 3,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, M *",
  "duration": "1 Hour",
  "school": "Divination",
  "save": "None",
  "effect": "Communication (...)",
  "classes": [
   "Bard",
   "Cleric",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "This spell grants the creature you touch the ability to understand any spoken or signed language that it hears or sees. Moreover, when the target communicates by speaking or signing, any creature that knows at least one language can understand it if that creature can hear the speech or see the signing. * - (a miniature ziggurat)"
 },
 {
  "name": "Blight",
  "level": 4,
  "castingTime": "1 Action",
  "range": "30 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "CON Save",
  "effect": "Necrotic",
  "classes": [
   "Druid",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "A creature that you can see within range makes a Constitution saving throw, taking 8d8 Necrotic damage on a failed save or half as much damage on a successful one. A Plant creature automatically fails the save. Alternatively, target a nonmagical plant that isn't a creature, such as a tree or shrub. It doesn't make a save; it simply withers and dies. Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 4."
 },
 {
  "name": "Charm Monster",
  "level": 4,
  "castingTime": "1 Action",
  "range": "30 ft.",
  "components": "V, S",
  "duration": "1 Hour",
  "school": "Enchantment",
  "save": "WIS Save",
  "effect": "Charmed",
  "classes": [
   "Bard",
   "Druid",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "One creature you can see within range makes a Wisdom saving throw. It does so with Advantage if you or your allies are fighting it. On a failed save, the target has the Charmed condition until the spell ends or until you or your allies damage it. The Charmed creature is Friendly to you. When the spell ends, the target knows it was Charmed by you. Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 4."
 },
 {
  "name": "Death Ward",
  "level": 4,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S",
  "duration": "8 Hours",
  "school": "Abjuration",
  "save": "None",
  "effect": "Buff (...)",
  "classes": [
   "Cleric",
   "Paladin",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You touch a creature and grant it a measure of protection from death. The first time the target would drop to 0 Hit Points before the spell ends, the target instead drops to 1 Hit Point, and the spell ends. If the spell is still in effect when the target is subjected to an effect that would kill it instantly without dealing damage, that effect is negated against the target, and the spell ends."
 },
 {
  "name": "Dimension Door",
  "level": 4,
  "castingTime": "1 Action",
  "range": "500 ft.",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Conjuration",
  "save": "None",
  "effect": "Teleportation",
  "classes": [
   "Bard",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You teleport to a location within range. You arrive at exactly the spot desired. It can be a place you can see, one you can visualize, or one you can describe by stating distance and direction, such as “200 feet straight downward” or “300 feet upward to the northwest at a 45-degree angle.” You can also teleport one willing creature. The creature must be within 5 feet of you when you teleport, and it teleports to a space within 5 feet of your destination space. If you, the other creature, or both would arrive in a space occupied by a creature or completely filled by one or more objects, you and any creature traveling with you each take 4d6 Force damage, and the teleportation fails."
 },
 {
  "name": "Fabricate",
  "level": 4,
  "castingTime": "10 Minutes",
  "range": "120 ft. ()",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Transmutation",
  "save": "None",
  "effect": "Creation",
  "classes": [
   "Artificer",
   "Bard",
   "Druid",
   "Wizard"
  ],
  "desc": "You convert raw materials into products of the same material. For example, you can fabricate a wooden bridge from a clump of trees, a rope from a patch of hemp, or clothes from flax or wool. Choose raw materials that you can see within range. You can fabricate a Large or smaller object (contained within a 10-foot Cube or eight connected 5-foot Cubes) given a sufficient quantity of material. If you're working with metal, stone, or another mineral substance, however, the fabricated object can be no larger than Medium (contained within a 5-foot Cube). The quality of any fabricated objects is based on the quality of the raw materials. Creatures and magic items can't be created by this spell. You also can't use it to create items that require a high degree of skill—such as weapons and armor—unless you have proficiency with the type of Artisan's Tools used to craft such objects."
 },
 {
  "name": "Fire Shield",
  "level": 4,
  "castingTime": "1 Action",
  "range": "Self",
  "components": "V, S, M *",
  "duration": "10 Minutes",
  "school": "Evocation",
  "save": "None",
  "effect": "Fire (...)",
  "classes": [
   "Druid",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "Wispy flames wreathe your body for the duration, shedding Bright Light in a 10-foot radius and Dim Light for an additional 10 feet. The flames provide you with a warm shield or a chill shield, as you choose. The warm shield grants you Resistance to Cold damage, and the chill shield grants you Resistance to Fire damage. In addition, whenever a creature within 5 feet of you hits you with a melee attack roll, the shield erupts with flame. The attacker takes 2d8 Fire damage from a warm shield or 2d8 Cold damage from a chill shield. * - (a bit of phosphorus or a firefly)"
 },
 {
  "name": "Freedom of Movement",
  "level": 4,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "1 Hour",
  "school": "Abjuration",
  "save": "None",
  "effect": "Buff (...)",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Ranger",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You touch a willing creature. For the duration, the target's movement is unaffected by Difficult Terrain, and spells and other magical effects can neither reduce the target's Speed nor cause the target to have the Paralyzed or Restrained conditions. The target also has a Swim Speed equal to its Speed. In addition, the target can spend 5 feet of movement to automatically escape from nonmagical restraints, such as manacles or a creature imposing the Grappled condition on it. Using a Higher-Level Spell Slot. You can target one additional creature for each spell slot level above 4. * - (a leather strap)"
 },
 {
  "name": "Guardian of Faith",
  "level": 4,
  "castingTime": "1 Action",
  "range": "30 ft.",
  "components": "V",
  "duration": "8 Hours",
  "school": "Conjuration",
  "save": "DEX Save",
  "effect": "Radiant",
  "classes": [
   "Cleric"
  ],
  "desc": "A Large spectral guardian appears and hovers for the duration in an unoccupied space that you can see within range. The guardian occupies that space and is invulnerable, and it appears in a form appropriate for your deity or pantheon. Any enemy that moves to a space within 10 feet of the guardian for the first time on a turn or starts its turn there makes a Dexterity saving throw, taking 20 Radiant damage on a failed save or half as much damage on a successful one. The guardian vanishes when it has dealt a total of 60 damage."
 },
 {
  "name": "Hallucinatory Terrain",
  "level": 4,
  "castingTime": "10 Minutes",
  "range": "300 ft. (150 ft. )",
  "components": "V, S, M *",
  "duration": "24 Hours",
  "school": "Illusion",
  "save": "None",
  "effect": "Control",
  "classes": [
   "Bard",
   "Druid",
   "Warlock",
   "Wizard"
  ],
  "desc": "You make natural terrain in a 150-foot Cube in range look, sound, and smell like another sort of natural terrain. Thus, open fields or a road can be made to resemble a swamp, hill, crevasse, or some other difficult or impassable terrain. A pond can be made to seem like a grassy meadow, a precipice like a gentle slope, or a rock-strewn gully like a wide and smooth road. Manufactured structures, equipment, and creatures within the area aren't changed. The tactile characteristics of the terrain are unchanged, so creatures entering the area are likely to notice the illusion. If the difference isn't obvious by touch, a creature examining the illusion can take the Study action to make an Intelligence (Investigation) check against your spell save DC to disbelieve it. If a creature discerns that the terrain is illusory, the creature sees a vague image superimposed on the real terrain. * - (a mushroom)"
 },
 {
  "name": "Ice Storm",
  "level": 4,
  "castingTime": "1 Action",
  "range": "300 ft. (20 ft. *)",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "DEX Save",
  "effect": "Bludgeoning (...)",
  "classes": [
   "Artificer",
   "Bard",
   "Druid",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "Hail falls in a 20-foot-radius, 40-foot-high Cylinder centered on a point within range. Each creature in the Cylinder makes a Dexterity saving throw. A creature takes 2d10 Bludgeoning damage and 4d6 Cold damage on a failed save or half as much damage on a successful one. Hailstones turn ground in the Cylinder into Difficult Terrain until the end of your next turn. Using a Higher-Level Spell Slot. The Bludgeoning damage increases by 1d10 for each spell slot level above 4. * - (a mitten)"
 },
 {
  "name": "Leomund's Secret Chest",
  "level": 4,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Until Dispelled",
  "school": "Conjuration",
  "save": "None",
  "effect": "Utility",
  "classes": [
   "Artificer",
   "Bard",
   "Wizard"
  ],
  "desc": "You hide a chest and all its contents on the Ethereal Plane. You must touch the chest and the miniature replica that serve as Material components for the spell. The chest can contain up to 12 cubic feet of nonliving material (3 feet by 2 feet by 2 feet). While the chest remains on the Ethereal Plane, you can take a Magic action and touch the replica to recall the chest. It appears in an unoccupied space on the ground within 5 feet of you. You can send the chest back to the Ethereal Plane by taking a Magic action to touch the chest and the replica. After 60 days, there is a cumulative 5 percent chance at the end of each day that the spell ends. The spell also ends if you cast this spell again or if the Tiny replica chest is destroyed. If the spell ends and the larger chest is on the Ethereal Plane, the chest remains there for you or someone else to find. * - (a chest, 3 feet by 2 feet by 2 feet, constructed from rare materials worth 5,000+ GP, and a Tiny replica of the chest made from the same materials worth 50+ GP)"
 },
 {
  "name": "Mordenkainen's Faithful Hound",
  "level": 4,
  "castingTime": "1 Action",
  "range": "30 ft.",
  "components": "V, S, M *",
  "duration": "8 Hours",
  "school": "Conjuration",
  "save": "DEX Save",
  "effect": "Force",
  "classes": [
   "Artificer",
   "Wizard"
  ],
  "desc": "You conjure a phantom watchdog in an unoccupied space that you can see within range. The hound remains for the duration or until the two of you are more than 300 feet apart from each other. No one but you can see the hound, and it is intangible and invulnerable. When a Small or larger creature comes within 30 feet of it without first speaking the password that you specify when you cast this spell, the hound starts barking loudly. The hound has Truesight with a range of 30 feet. At the start of each of your turns, the hound attempts to bite one enemy within 5 feet of it. That enemy must succeed on a Dexterity saving throw or take 4d8 Force damage. On your later turns, you can take a Magic action to move the hound up to 30 feet. * - (a silver whistle)"
 },
 {
  "name": "Mordenkainen's Private Sanctum",
  "level": 4,
  "castingTime": "10 Minutes",
  "range": "120 ft. (*)",
  "components": "V, S, M *",
  "duration": "24 Hours",
  "school": "Abjuration",
  "save": "None",
  "effect": "Control (...)",
  "classes": [
   "Artificer",
   "Bard",
   "Druid",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You make an area within range magically secure. The area is a Cube that can be as small as 5 feet to as large as 100 feet on each side. The spell lasts for the duration. When you cast the spell, you decide what sort of security the spell provides, choosing any of the following properties: Sound can't pass through the barrier at the edge of the warded area. The barrier of the warded area appears dark and foggy, preventing vision (including Darkvision) through it. Sensors created by Divination spells can't appear inside the protected area or pass through the barrier at its perimeter. Creatures in the area can't be targeted by Divination spells. Nothing can teleport into or out of the warded area. Planar travel is blocked within the warded area. Casting this spell on the same spot every day for 365 days makes the spell last until dispelled. Using a Higher-Level Spell Slot. You can increase the size of the Cube by 100 feet for each spell slot level above 4. * - (a thin sheet of lead)"
 },
 {
  "name": "Staggering Smite",
  "level": 4,
  "castingTime": "1 Bonus Action *",
  "range": "Self",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Enchantment",
  "save": "WIS Save",
  "effect": "Psychic",
  "classes": [
   "Paladin"
  ],
  "desc": "The target takes an extra 4d6 Psychic damage from the attack, and the target must succeed on a Wisdom saving throw or have the Stunned condition until the end of your next turn. Using a Higher-Level Spell Slot. The extra damage increases by 1d6 for each spell slot level above 4. * - which you take immediately after hitting a creature with a Melee weapon or an Unarmed Strike"
 },
 {
  "name": "Stone Shape",
  "level": 4,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Transmutation",
  "save": "None",
  "effect": "Control",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Paladin",
   "Ranger",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You touch a stone object of Medium size or smaller or a section of stone no more than 5 feet in any dimension and form it into any shape you like. For example, you could shape a large rock into a weapon, statue, or coffer, or you could make a small passage through a wall that is 5 feet thick. You could also shape a stone door or its frame to seal the door shut. The object you create can have up to two hinges and a latch, but finer mechanical detail isn't possible. * - (soft clay)"
 },
 {
  "name": "Vitriolic Sphere",
  "level": 4,
  "castingTime": "1 Action",
  "range": "150 ft. (20 ft. )",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "DEX Save",
  "effect": "Acid (...)",
  "classes": [
   "Artificer",
   "Druid",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You point at a location within range, and a glowing, 1-foot-diameter ball of acid streaks there and explodes in a 20-foot-radius Sphere. Each creature in that area makes a Dexterity saving throw. On a failed save, a creature takes 10d4 Acid damage and another 5d4 Acid damage at the end of its next turn. On a successful save, a creature takes half the initial damage only. Using a Higher-Level Spell Slot. The initial damage increases by 2d4 for each spell slot level above 4. * - (a drop of bile)"
 },
 {
  "name": "Awaken",
  "level": 5,
  "castingTime": "8 Hours",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Transmutation",
  "save": "None",
  "effect": "Charmed",
  "classes": [
   "Bard",
   "Cleric",
   "Druid",
   "Paladin",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You spend the casting time tracing magical pathways within a precious gemstone, and then touch the target. The target must be either a Beast or Plant creature with an Intelligence of 3 or less or a natural plant that isn't a creature. The target gains an Intelligence of 10 and the ability to speak one language you know. If the target is a natural plant, it becomes a Plant creature and gains the ability to move its limbs, roots, vines, creepers, and so forth, and it gains senses similar to a human's. The DM chooses statistics appropriate for the awakened Plant, such as the statistics for the Awakened Shrub or Awakened Tree in the Monster Manual. The awakened target has the Charmed condition for 30 days or until you or your allies deal damage to it. When that condition ends, the awakened creature chooses its attitude toward you. * - (an agate worth 1,000+ GP, which the spell consumes)"
 },
 {
  "name": "Cone of Cold",
  "level": 5,
  "castingTime": "1 Action",
  "range": "Self (60 ft. )",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "CON Save",
  "effect": "Cold",
  "classes": [
   "Bard",
   "Druid",
   "Ranger",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You unleash a blast of cold air. Each creature in a 60-foot Cone originating from you makes a Constitution saving throw, taking 8d8 Cold damage on a failed save or half as much damage on a successful one. A creature killed by this spell becomes a frozen statue until it thaws. Using a Higher-Level Spell Slot. The damage increases by 1d8 for each spell slot level above 5. * - (a small crystal or glass cone)"
 },
 {
  "name": "Conjure Volley",
  "level": 5,
  "castingTime": "1 Action",
  "range": "150 ft. (40 ft. *)",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Conjuration",
  "save": "DEX Save",
  "effect": "Force",
  "classes": [
   "Druid",
   "Ranger",
   "Warlock",
   "Wizard"
  ],
  "desc": "You brandish the weapon used to cast the spell and choose a point within range. Hundreds of similar spectral weapons (or ammunition appropriate to the weapon) fall in a volley and then disappear. Each creature of your choice that you can see in a 40-foot-radius, 20-foot-high Cylinder centered on that point makes a Dexterity saving throw. A creature takes 8d8 Force damage on a failed save or half as much damage on a successful one. * - (a Melee or Ranged weapon worth at least 1 CP)"
 },
 {
  "name": "Contagion",
  "level": 5,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S",
  "duration": "7 Days",
  "school": "Necromancy",
  "save": "CON Save",
  "effect": "Necrotic",
  "classes": [
   "Cleric",
   "Druid"
  ],
  "desc": "Your touch inflicts a magical contagion. The target must succeed on a Constitution saving throw or take 11d8 Necrotic damage and have the Poisoned condition. Also, choose one ability when you cast the spell. While Poisoned, the target has Disadvantage on saving throws made with the chosen ability. The target must repeat the saving throw at the end of each of its turns until it gets three successes or failures. If the target succeeds on three of these saves, the spell ends on the target. If the target fails three of the saves, the spell lasts for 7 days on it. Whenever the Poisoned target receives an effect that would end the Poisoned condition, the target must succeed on a Constitution saving throw, or the Poisoned condition doesn't end on it."
 },
 {
  "name": "Creation",
  "level": 5,
  "castingTime": "1 Minute",
  "range": "30 ft. (5 ft. )",
  "components": "V, S, M *",
  "duration": "Special",
  "school": "Illusion",
  "save": "None",
  "effect": "Creation",
  "classes": [
   "Artificer",
   "Bard",
   "Paladin",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You pull wisps of shadow material from the Shadowfell to create an object within range. It is either an object of vegetable matter (soft goods, rope, wood, and the like) or mineral matter (stone, crystal, metal, and the like). The object must be no larger than a 5-foot Cube, and the object must be of a form and material that you have seen. The spell's duration depends on the object's material, as shown in the Materials table. If the object is composed of multiple materials, use the shortest duration. Using any object created by this spell as another spell's Material component causes the other spell to fail. Materials Material Duration Vegetable matter 24 hours Stone or crystal 12 hours Precious metals 1 hour Gems 10 minutes Adamantine or mithral 1 minute Using a Higher-Level Spell Slot. The Cube increases by 5 feet for each spell slot level above 5. * - (a paintbrush)"
 },
 {
  "name": "Destructive Wave",
  "level": 5,
  "castingTime": "1 Action",
  "range": "Self (30 ft. )",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "CON Save",
  "effect": "Thunder (...)",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Paladin",
   "Ranger",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "Destructive energy ripples outward from you in a 30-foot Emanation. Each creature you choose in the Emanation makes a Constitution saving throw. On a failed save, a target takes 5d6 Thunder damage and 5d6 Radiant or Necrotic damage (your choice) and has the Prone condition. On a successful save, a target takes half as much damage only."
 },
 {
  "name": "Dream",
  "level": 5,
  "castingTime": "1 Minute",
  "range": "10 ft.",
  "components": "V, S, M *",
  "duration": "Special",
  "school": "Illusion",
  "save": "WIS Save",
  "effect": "Communication (...)",
  "classes": [
   "Bard",
   "Warlock",
   "Wizard"
  ],
  "desc": "You target a creature you know on the same plane of existence. You or a willing creature you touch enters a trance state to act as a dream messenger. While in the trance, the messenger is Incapacitated and has a Speed of 0. If the target is asleep, the messenger appears in the target's dreams and can converse with the target as long as it remains asleep, through the spell's duration. The messenger can also shape the dream's environment, creating landscapes, objects, and other images. The messenger can emerge from the trance at any time, ending the spell. The target recalls the dream perfectly upon waking. If the target is awake when you cast the spell, the messenger knows it and can either end the trance (and the spell) or wait for the target to sleep, at which point the messenger enters its dreams. You can make the messenger terrifying to the target. If you do so, the messenger can deliver a message of no more than ten words, and then the target makes a Wisdom saving throw. On a failed save, the target gains no benefit from its rest, and it takes 3d6 Psychic damage when it wakes up. * - (a handful of sand)"
 },
 {
  "name": "Flame Strike",
  "level": 5,
  "castingTime": "1 Action",
  "range": "60 ft. (10 ft. *)",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "DEX Save",
  "effect": "Fire (...)",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Ranger",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "A vertical column of brilliant fire roars down from above. Each creature in a 10-foot-radius, 40-foot-high Cylinder centered on a point within range makes a Dexterity saving throw, taking 5d6 Fire damage and 5d6 Radiant damage on a failed save or half as much damage on a successful one. Using a Higher-Level Spell Slot. The Fire damage and the Radiant damage increase by 1d6 for each spell slot level above 5. * - (a pinch of sulfur)"
 },
 {
  "name": "Geas",
  "level": 5,
  "castingTime": "1 Minute",
  "range": "60 ft.",
  "components": "V",
  "duration": "30 Days",
  "school": "Enchantment",
  "save": "WIS Save",
  "effect": "Psychic",
  "classes": [
   "Bard",
   "Cleric",
   "Druid",
   "Paladin",
   "Wizard"
  ],
  "desc": "You give a verbal command to a creature that you can see within range, ordering it to carry out some service or refrain from an action or a course of activity as you decide. The target must succeed on a Wisdom saving throw or have the Charmed condition for the duration. The target automatically succeeds if it can't understand your command. While Charmed, the creature takes 5d10 Psychic damage if it acts in a manner directly counter to your command. It takes this damage no more than once each day. You can issue any command you choose, short of an activity that would result in certain death. Should you issue a suicidal command, the spell ends. A Remove Curse,Greater Restoration, or Wish spell ends this spell. Using a Higher-Level Spell Slot. If you use a level 7 or 8 spell slot, the duration is 365 days. If you use a level 9 spell slot, the spell lasts until it is ended by one of the spells mentioned above."
 },
 {
  "name": "Greater Restoration",
  "level": 5,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Abjuration",
  "save": "None",
  "effect": "Exhaustion",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Paladin",
   "Ranger"
  ],
  "desc": "You touch a creature and magically remove one of the following effects from it: 1 Exhaustion level The Charmed or Petrified condition A curse, including the target's Attunement to a cursed magic item Any reduction to one of the target's ability scores Any reduction to the target's Hit Point maximum * - (diamond dust worth 100+ GP, which the spell consumes)"
 },
 {
  "name": "Hallow",
  "level": 5,
  "castingTime": "24 Hours",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Until Dispelled",
  "school": "Abjuration",
  "save": "None",
  "effect": "Buff (...)",
  "classes": [
   "Cleric"
  ],
  "desc": "You touch a point and infuse an area around it with holy or unholy power. The area can have a radius up to 60 feet, and the spell fails if the radius includes an area already under the effect of Hallow. The affected area has the following effects. Hallowed Ward. Choose any of these creature types: Aberration, Celestial, Elemental, Fey, Fiend, or Undead. Creatures of the chosen types can't willingly enter the area, and any creature that is possessed by or that has the Charmed or Frightened condition from such creatures isn't possessed, Charmed, or Frightened by them while in the area. Extra Effect. You bind an extra effect to the area from the list below: Courage. Creatures of any types you choose can't gain the Frightened condition while in the area. Darkness. Darkness fills the area. Normal light, as well as magical light created by spells of a level lower than this spell, can't illuminate the area. Daylight. Bright light fills the area. Magical Darkness created by spells of a level lower than this spell can't extinguish the light. Peaceful Rest. Dead bodies interred in the area can't be turned into Undead. Extradimensional Interference. Creatures of any types you choose can't enter or exit the area using teleportation or interplanar travel. Fear. Creatures of any types you choose have the Frightened condition while in the area. Resistance. Creatures of any types you choose have Resistance to one damage type of your choice while in the area. Silence. No sound can emanate from within the area, and no sound can reach into it. Tongues. Creatures of any types you choose can communicate with any other creature in the area even if they don't share a common language. Vulnerability. Creatures of any types you choose have Vulnerability to one damage type of your choice while in the area. * - (incense worth 1,000+ GP, which the spell consumes)"
 },
 {
  "name": "Legend Lore",
  "level": 5,
  "castingTime": "10 Minutes",
  "range": "Self",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Divination",
  "save": "None",
  "effect": "Utility",
  "classes": [
   "Bard",
   "Cleric",
   "Wizard"
  ],
  "desc": "Name or describe a famous person, place, or object. The spell brings to your mind a brief summary of the significant lore about that famous thing, as described by the DM. The lore might consist of important details, amusing revelations, or even secret lore that has never been widely known. The more information you already know about the thing, the more precise and detailed the information you receive is. That information is accurate but might be couched in figurative language or poetry, as determined by the DM. If the famous thing you chose isn't actually famous, you hear sad musical notes played on a trombone, and the spell fails. * - (incense worth 250+ GP, which the spell consumes, and four ivory strips worth 50+ GP each)"
 },
 {
  "name": "Mass Cure Wounds",
  "level": 5,
  "castingTime": "1 Action",
  "range": "60 ft. (30 ft. )",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Abjuration",
  "save": "None",
  "effect": "Healing",
  "classes": [
   "Bard",
   "Cleric",
   "Druid"
  ],
  "desc": "A wave of healing energy washes out from a point you can see within range. Choose up to six creatures in a 30-foot-radius Sphere centered on that point. Each target regains Hit Points equal to 5d8 plus your spellcasting ability modifier. Using a Higher-Level Spell Slot. The healing increases by 1d8 for each spell slot level above 5."
 },
 {
  "name": "Passwall",
  "level": 5,
  "castingTime": "1 Action",
  "range": "30 ft.",
  "components": "V, S, M *",
  "duration": "1 Hour",
  "school": "Transmutation",
  "save": "None",
  "effect": "Control",
  "classes": [
   "Bard",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "A passage appears at a point that you can see on a wooden, plaster, or stone surface (such as a wall, ceiling, or floor) within range and lasts for the duration. You choose the opening's dimensions: up to 5 feet wide, 8 feet tall, and 20 feet deep. The passage creates no instability in a structure surrounding it. When the opening disappears, any creatures or objects still in the passage created by the spell are safely ejected to an unoccupied space nearest to the surface on which you cast the spell. * - (a pinch of sesame seeds)"
 },
 {
  "name": "Planar Binding",
  "level": 5,
  "castingTime": "1 Hour",
  "range": "60 ft.",
  "components": "V, S, M *",
  "duration": "24 Hours",
  "school": "Abjuration",
  "save": "CHA Save",
  "effect": "Control",
  "classes": [
   "Bard",
   "Cleric",
   "Druid",
   "Warlock",
   "Wizard"
  ],
  "desc": "You attempt to bind a Celestial, an Elemental, a Fey, or a Fiend to your service. The creature must be within range for the entire casting of the spell. (Typically, the creature is first summoned into the center of the inverted version of the Magic Circle spell to trap it while this spell is cast.) At the completion of the casting, the target must succeed on a Charisma saving throw or be bound to serve you for the duration. If the creature was summoned or created by another spell, that spell's duration is extended to match the duration of this spell. A bound creature must follow your commands to the best of its ability. You might command the creature to accompany you on an adventure, to guard a location, or to deliver a message. If the creature is Hostile, it strives to twist your commands to achieve its own objectives. If the creature carries out your commands completely before the spell ends, it travels to you to report this fact if you are on the same plane of existence. If you are on a different plane, it returns to the place where you bound it and remains there until the spell ends. Using a Higher-Level Spell Slot. The duration increases with a spell slot of level 6 (10 days), 7 (30 days), 8 (180 days), and 9 (366 days). * - (a jewel worth 1,000+ GP, which the spell consumes)"
 },
 {
  "name": "Raise Dead",
  "level": 5,
  "castingTime": "1 Hour",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "None",
  "effect": "Healing",
  "classes": [
   "Bard",
   "Cleric",
   "Paladin",
   "Warlock",
   "Wizard"
  ],
  "desc": "With a touch, you revive a dead creature if it has been dead no longer than 10 days and it wasn't Undead when it died. The creature returns to life with 1 Hit Point. This spell also neutralizes any poisons that affected the creature at the time of death. This spell closes all mortal wounds, but it doesn't restore missing body parts. If the creature is lacking body parts or organs integral for its survival—its head, for instance—the spell automatically fails. Coming back from the dead is an ordeal. The target takes a −4 penalty to D20 Tests. Every time the target finishes a Long Rest, the penalty is reduced by 1 until it becomes 0. * - (a diamond worth 500+ GP, which the spell consumes)"
 },
 {
  "name": "Reincarnate",
  "level": 5,
  "castingTime": "1 Hour",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "None",
  "effect": "Healing",
  "classes": [
   "Druid"
  ],
  "desc": "You touch a dead Humanoid or a piece of one. If the creature has been dead no longer than 10 days, the spell forms a new body for it and calls the soul to enter that body. Roll 1d10 and consult the table below to determine the body's species, or the DM chooses another playable species. 1d10 Species 1 Aasimar 2 Dragonborn 3 Dwarf 4 Elf 5 Gnome 6 Goliath 7 Halfling 8 Human 9 Orc 10 Tiefling The reincarnated creature makes any choices that a species' description offers, and the creature recalls its former life. It retains the capabilities it had in its original form, except it loses the traits of its previous species and gains the traits of its new one. * - (rare oils worth 1,000+ GP, which the spell consumes)"
 },
 {
  "name": "Seeming",
  "level": 5,
  "castingTime": "1 Action",
  "range": "30 ft.",
  "components": "V, S",
  "duration": "8 Hours",
  "school": "Illusion",
  "save": "CHA Save",
  "effect": "Control",
  "classes": [
   "Bard",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You give an illusory appearance to each creature of your choice that you can see within range. An unwilling target can make a Charisma saving throw, and if it succeeds, it is unaffected by this spell. You can give the same appearance or different ones to the targets. The spell can change the appearance of the targets' bodies and equipment. You can make each creature seem 1 foot shorter or taller and appear heavier or lighter. A target's new appearance must have the same basic arrangement of limbs as the target, but the extent of the illusion is otherwise up to you. The spell lasts for the duration. The changes wrought by this spell fail to hold up to physical inspection. For example, if you use this spell to add a hat to a creature's outfit, objects pass through the hat. A creature that takes the Study action to examine a target can make an Intelligence (Investigation) check against your spell save DC. If it succeeds, it becomes aware that the target is disguised."
 },
 {
  "name": "Steel Wind Strike",
  "level": 5,
  "castingTime": "1 Action",
  "range": "30 ft.",
  "components": "S, M *",
  "duration": "Instantaneous",
  "school": "Conjuration",
  "save": "Melee",
  "effect": "Force",
  "classes": [
   "Bard",
   "Ranger",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You flourish the weapon used in the casting and then vanish to strike like the wind. Choose up to five creatures you can see within range. Make a melee spell attack against each target. On a hit, a target takes 6d10 Force damage. You then teleport to an unoccupied space you can see within 5 feet of one of the targets. * - (a Melee weapon worth 1+ SP)"
 },
 {
  "name": "Synaptic Static",
  "level": 5,
  "castingTime": "1 Action",
  "range": "120 ft. (20 ft. )",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Enchantment",
  "save": "INT Save",
  "effect": "Psychic",
  "classes": [
   "Bard",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You cause psychic energy to erupt at a point within range. Each creature in a 20-foot-radius Sphere centered on that point makes an Intelligence saving throw, taking 8d6 Psychic damage on a failed save or half as much damage on a successful one. On a failed save, a target also has muddled thoughts for 1 minute. During that time, it subtracts 1d6 from all its attack rolls and ability checks, as well as any Constitution saving throws to maintain Concentration. The target makes an Intelligence saving throw at the end of each of its turns, ending the effect on itself on a success."
 },
 {
  "name": "Teleportation Circle",
  "level": 5,
  "castingTime": "1 Minute",
  "range": "10 ft.",
  "components": "V, M *",
  "duration": "1 Round",
  "school": "Conjuration",
  "save": "None",
  "effect": "Teleportation",
  "classes": [
   "Bard",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "As you cast the spell, you draw a 5-foot-radius circle on the ground inscribed with sigils that link your location to a permanent teleportation circle of your choice whose sigil sequence you know and that is on the same plane of existence as you. A shimmering portal opens within the circle you drew and remains open until the end of your next turn. Any creature that enters the portal instantly appears within 5 feet of the destination circle or in the nearest unoccupied space if that space is occupied. Many major temples, guildhalls, and other important places have permanent teleportation circles. Each circle includes a unique sigil sequence—a string of runes arranged in a particular pattern. When you first gain the ability to cast this spell, you learn the sigil sequences for two destinations on the Material Plane, determined by the DM. You might learn additional sigil sequences during your adventures. You can commit a new sigil sequence to memory after studying it for 1 minute. You can create a permanent teleportation circle by casting this spell in the same location every day for 365 days. * - (rare inks worth 50+ GP, which the spell consumes)"
 },
 {
  "name": "Chain Lightning",
  "level": 6,
  "castingTime": "1 Action",
  "range": "150 ft.",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "DEX Save",
  "effect": "Lightning",
  "classes": [
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You launch a lightning bolt toward a target you can see within range. Three bolts then leap from that target to as many as three other targets of your choice, each of which must be within 30 feet of the first target. A target can be a creature or an object and can be targeted by only one of the bolts. Each target makes a Dexterity saving throw, taking 10d8 Lightning damage on a failed save or half as much damage on a successful one. Using a Higher-Level Spell Slot. One additional bolt leaps from the first target to another target for each spell slot level above 6. * - (three silver pins)"
 },
 {
  "name": "Circle of Death",
  "level": 6,
  "castingTime": "1 Action",
  "range": "150 ft. (60 ft. )",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "CON Save",
  "effect": "Necrotic",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Paladin",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "Negative energy ripples out in a 60-foot-radius Sphere from a point you choose within range. Each creature in that area makes a Constitution saving throw, taking 8d8 Necrotic damage on a failed save or half as much damage on a successful one. Using a Higher-Level Spell Slot. The damage increases by 2d8 for each spell slot level above 6. * - (the powder of a crushed black pearl worth 500+ GP)"
 },
 {
  "name": "Contingency",
  "level": 6,
  "castingTime": "10 Minutes",
  "range": "Self",
  "components": "V, S, M *",
  "duration": "10 Days",
  "school": "Abjuration",
  "save": "None",
  "effect": "Utility",
  "classes": [
   "Wizard"
  ],
  "desc": "Choose a spell of level 5 or lower that you can cast, that has a casting time of an action, and that can target you. You cast that spell—called the contingent spell—as part of casting Contingency, expending spell slots for both, but the contingent spell doesn't come into effect. Instead, it takes effect when a certain trigger occurs. You describe that trigger when you cast the two spells. For example, a Contingency cast with Water Breathing might stipulate that Water Breathing comes into effect when you are engulfed in water or a similar liquid. The contingent spell takes effect immediately after the trigger occurs for the first time, whether or not you want it to, and then Contingency ends. The contingent spell takes effect only on you, even if it can normally target others. You can use only one Contingency spell at a time. If you cast this spell again, the effect of another Contingency spell on you ends. Also, Contingency ends on you if its material component is ever not on your person. * - (a gem-encrusted statuette of yourself worth 1,500+ GP)"
 },
 {
  "name": "Create Undead",
  "level": 6,
  "castingTime": "1 Minute",
  "range": "10 ft.",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "None",
  "effect": "Control (...)",
  "classes": [
   "Cleric",
   "Warlock",
   "Wizard"
  ],
  "desc": "You can cast this spell only at night. Choose up to three corpses of Medium or Small Humanoids within range. Each one becomes a Ghoul under your control (see the Monster Manual for its stat block). As a Bonus Action on each of your turns, you can mentally command any creature you animated with this spell if the creature is within 120 feet of you (if you control multiple creatures, you can command any of them at the same time, issuing the same command to them). You decide what action the creature will take and where it will move on its next turn, or you can issue a general command, such as to guard a particular place. If you issue no commands, the creature takes the Dodge action and moves only to avoid harm. Once given an order, the creature continues to follow the order until its task is complete. The creature is under your control for 24 hours, after which it stops obeying any command you've given it. To maintain control of the creature for another 24 hours, you must cast this spell on the creature before the current 24-hour period ends. This use of the spell reasserts your control over up to three creatures you have animated with this spell rather than animating new ones. Using a Higher-Level Spell Slot. If you use a level 7 spell slot, you can animate or reassert control over four Ghouls. If you use a level 8 spell slot, you can animate or reassert control over five Ghouls or two Ghasts or Wights. If you use a level 9 spell slot, you can animate or reassert control over six Ghouls, three Ghasts or Wights, or two Mummies. See the Monster Manual for these stat blocks. * - (one 150+ GP black onyx stone for each corpse)"
 },
 {
  "name": "Disintegrate",
  "level": 6,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Transmutation",
  "save": "DEX Save",
  "effect": "Force",
  "classes": [
   "Cleric",
   "Paladin",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You launch a green ray at a target you can see within range. The target can be a creature, a nonmagical object, or a creation of magical force, such as the wall created by Wall of Force. A creature targeted by this spell makes a Dexterity saving throw. On a failed save, the target takes 10d6 + 40 Force damage. If this damage reduces it to 0 Hit Points, it and everything nonmagical it is wearing and carrying are disintegrated into gray dust. The target can be revived only by a True Resurrection or a Wish spell. This spell automatically disintegrates a Large or smaller nonmagical object or a creation of magical force. If such a target is Huge or larger, this spell disintegrates a 10-foot-Cube portion of it. Using a Higher-Level Spell Slot. The damage increases by 3d6 for each spell slot level above 6. * - (a lodestone and dust)"
 },
 {
  "name": "Guards and Wards",
  "level": 6,
  "castingTime": "1 Hour",
  "range": "Touch (2,500 ft.2)",
  "components": "V, S, M *",
  "duration": "24 Hours",
  "school": "Abjuration",
  "save": "None",
  "effect": "Control (...)",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Wizard"
  ],
  "desc": "You create a ward that protects up to 2,500 square feet of floor space. The warded area can be up to 20 feet tall, and you shape it as one 50-foot square, one hundred 5-foot squares that are contiguous, or twenty-five 10-foot squares that are contiguous. When you cast this spell, you can specify individuals that are unaffected by the spell's effects. You can also specify a password that, when spoken aloud within 5 feet of the warded area, makes the speaker immune to its effects. The spell creates the effects below within the warded area. Dispel Magic has no effect on Guards and Wards itself, but each of the following effects can be dispelled. If all four are dispelled, Guards and Wards ends. If you cast the spell every day for 365 days on the same area, the spell thereafter lasts until all its effects are dispelled. Corridors. Fog fills all the warded corridors, making them Heavily Obscured. In addition, at each intersection or branching passage offering a choice of direction, there is a 50 percent chance that a creature other than you believes it is going in the opposite direction from the one it chooses. Doors. All doors in the warded area are magically locked, as if sealed by the Arcane Lock spell. In addition, you can cover up to ten doors with an illusion to make them appear as plain sections of wall. Stairs. Webs fill all stairs in the warded area from top to bottom, as in the Web spell. These strands regrow in 10 minutes if they are destroyed while Guards and Wards lasts. Other Spell Effect. Place one of the following magical effects within the warded area: Dancing Lights in four corridors, with a simple program that the lights repeat as long as Guards and Wards lasts Magic Mouth in two locations Stinking Cloud in two locations (the vapors return within 10 minutes if dispersed while Guards and Wards lasts) Gust of Wind in one corridor or room (the wind blows continuously while the spell lasts) Suggestion in one 5-foot square; any creature that enters that square receives the suggestion mentally * - (a silver rod worth 10+ GP)"
 },
 {
  "name": "Harm",
  "level": 6,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "CON Save",
  "effect": "Necrotic",
  "classes": [
   "Artificer",
   "Cleric",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You unleash virulent magic on a creature you can see within range. The target makes a Constitution saving throw. On a failed save, it takes 14d6 Necrotic damage, and its Hit Point maximum is reduced by an amount equal to the Necrotic damage it took. On a successful save, it takes half as much damage only. This spell can't reduce a target's Hit Point maximum below 1."
 },
 {
  "name": "Heal",
  "level": 6,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Abjuration",
  "save": "None",
  "effect": "Blinded (...)",
  "classes": [
   "Cleric",
   "Druid"
  ],
  "desc": "Choose a creature that you can see within range. Positive energy washes through the target, restoring 70 Hit Points. This spell also ends the Blinded, Deafened, and Poisoned conditions on the target. Using a Higher-Level Spell Slot. The healing increases by 10 for each spell slot level above 6."
 },
 {
  "name": "Heroes' Feast",
  "level": 6,
  "castingTime": "10 Minutes",
  "range": "Self (10 ft. )",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Conjuration",
  "save": "None",
  "effect": "Poisoned (...)",
  "classes": [
   "Bard",
   "Cleric",
   "Druid",
   "Paladin",
   "Ranger",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You conjure a feast that appears on a surface in an unoccupied 10-foot Cube next to you. The feast takes 1 hour to consume and disappears at the end of that time, and the beneficial effects don't set in until this hour is over. Up to twelve creatures can partake of the feast. A creature that partakes gains several benefits, which last for 24 hours. The creature has Resistance to Poison damage, and it has Immunity to the Frightened and Poisoned conditions. Its Hit Point maximum also increases by 2d10, and it gains the same number of Hit Points. * - (a gem-encrusted bowl worth 1,000+ GP, which the spell consumes)"
 },
 {
  "name": "Magic Jar",
  "level": 6,
  "castingTime": "1 Minute",
  "range": "Self",
  "components": "V, S, M *",
  "duration": "Until Dispelled",
  "school": "Necromancy",
  "save": "CHA Save",
  "effect": "Control",
  "classes": [
   "Wizard"
  ],
  "desc": "Your body falls into a catatonic state as your soul leaves it and enters the container you used for the spell's Material component. While your soul inhabits the container, you are aware of your surroundings as if you were in the container's space. You can't move or take Reactions. The only action you can take is to project your soul up to 100 feet out of the container, either returning to your living body (and ending the spell) or attempting to possess a Humanoid's body. You can attempt to possess any Humanoid within 100 feet of you that you can see (creatures warded by a Protection from Evil and Good or Magic Circle spell can't be possessed). The target makes a Charisma saving throw. On a failed save, your soul enters the target's body, and the target's soul becomes trapped in the container. On a successful save, the target resists your efforts to possess it, and you can't attempt to possess it again for 24 hours. Once you possess a creature's body, you control it. Your Hit Points, Hit Point Dice, Strength, Dexterity, Constitution, Speed, and senses are replaced by the creature's. You otherwise keep your game statistics. Meanwhile, the possessed creature's soul can perceive from the container using its own senses, but it can't move and it is Incapacitated. While possessing a body, you can take a Magic action to return from the host body to the container if it is within 100 feet of you, returning the host creature's soul to its body. If the host body dies while you're in it, the creature dies, and you make a Charisma saving throw against your own spellcasting DC. On a success, you return to the container if it is within 100 feet of you. Otherwise, you die. If the container is destroyed or the spell ends, your soul returns to your body. If your body is more than 100 feet away from you or if your body is dead, you die. If another creature's soul is in the container when it is destroyed, the creature's soul returns to its body if the body is alive and within 100 feet. Otherwise, that creature dies. When the spell ends, the container is destroyed. * - (a gem, crystal, or reliquary worth 500+ GP)"
 },
 {
  "name": "Mass Suggestion",
  "level": 6,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V, M *",
  "duration": "24 Hours",
  "school": "Enchantment",
  "save": "WIS Save",
  "effect": "Control (...)",
  "classes": [
   "Bard",
   "Cleric",
   "Druid",
   "Ranger",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You suggest a course of activity—described in no more than 25 words—to twelve or fewer creatures you can see within range that can hear and understand you. The suggestion must sound achievable and not involve anything that would obviously deal damage to any of the targets or their allies. For example, you could say, “Walk to the village down that road, and help the villagers there harvest crops until sunset.” Or you could say, “Now is not the time for violence. Drop your weapons, and dance! Stop in an hour.” Each target must succeed on a Wisdom saving throw or have the Charmed condition for the duration or until you or your allies deal damage to the target. Each Charmed target pursues the suggestion to the best of its ability. The suggested activity can continue for the entire duration, but if the suggested activity can be completed in a shorter time, the spell ends for a target upon completing it. Using a Higher-Level Spell Slot. The duration is longer with a spell slot of level 7 (10 days), 8 (30 days), or 9 (366 days). * - (a snake's tongue)"
 },
 {
  "name": "Otiluke's Freezing Sphere",
  "level": 6,
  "castingTime": "1 Action",
  "range": "300 ft. (60 ft. )",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "CON Save",
  "effect": "Cold",
  "classes": [
   "Artificer",
   "Bard",
   "Druid",
   "Ranger",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "A frigid globe streaks from you to a point of your choice within range, where it explodes in a 60-foot-radius Sphere. Each creature in that area makes a Constitution saving throw, taking 10d6 Cold damage on a failed save or half as much damage on a successful one. If the globe strikes a body of water, it freezes the water to a depth of 6 inches over an area 30 feet square. This ice lasts for 1 minute. Creatures that were swimming on the surface of frozen water are trapped in the ice and have the Restrained condition. A trapped creature can take an action to make a Strength (Athletics) check against your spell save DC to break free. You can refrain from firing the globe after completing the spell's casting. If you do so, a globe about the size of a sling bullet, cool to the touch, appears in your hand. At any time, you or a creature you give the globe to can throw the globe (to a range of 40 feet) or hurl it with a sling (to the sling's normal range). It shatters on impact, with the same effect as a normal casting of the spell. You can also set the globe down without shattering it. After 1 minute, if the globe hasn't already shattered, it explodes. Using a Higher-Level Spell Slot. The damage increases by 1d6 for each spell slot level above 6. * - (a miniature crystal sphere)"
 },
 {
  "name": "Planar Ally",
  "level": 6,
  "castingTime": "10 Minutes",
  "range": "60 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Conjuration",
  "save": "None",
  "effect": "Summoning",
  "classes": [
   "Cleric"
  ],
  "desc": "You beseech an otherworldly entity for aid. The being must be known to you: a god, a demon prince, or some other being of cosmic power. That entity sends a Celestial, an Elemental, or a Fiend loyal to it to aid you, making the creature appear in an unoccupied space within range. If you know a specific creature's name, you can speak that name when you cast this spell to request that creature, though you might get a different creature anyway (DM's choice). When the creature appears, it is under no compulsion to behave a particular way. You can ask it to perform a service in exchange for payment, but it isn't obliged to do so. The requested task could range from simple (fly us across the chasm, or help us fight a battle) to complex (spy on our enemies, or protect us during our foray into the dungeon). You must be able to communicate with the creature to bargain for its services. Payment can take a variety of forms. A Celestial might require a sizable donation of gold or magic items to an allied temple, while a Fiend might demand a living sacrifice or a gift of treasure. Some creatures might exchange their service for a quest undertaken by you. A task that can be measured in minutes requires a payment worth 100 GP per minute. A task measured in hours requires 1,000 GP per hour. And a task measured in days (up to 10 days) requires 10,000 GP per day. The DM can adjust these payments based on the circumstances under which you cast the spell. If the task is aligned with the creature's ethos, the payment might be halved or even waived. Nonhazardous tasks typically require only half the suggested payment, while especially dangerous tasks might require a greater gift. Creatures rarely accept tasks that seem suicidal. After the creature completes the task, or when the agreed-upon duration of service expires, the creature returns to its home plane after reporting back to you if possible. If you are unable to agree on a price for the creature's service, the creature immediately returns to its home plane."
 },
 {
  "name": "Programmed Illusion",
  "level": 6,
  "castingTime": "1 Action",
  "range": "120 ft. (30 ft. *)",
  "components": "V, S, M *",
  "duration": "Until Dispelled",
  "school": "Illusion",
  "save": "None",
  "effect": "Control",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Paladin",
   "Ranger",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You create an illusion of an object, a creature, or some other visible phenomenon within range that activates when a specific trigger occurs. The illusion is imperceptible until then. It must be no larger than a 30-foot Cube, and you decide when you cast the spell how the illusion behaves and what sounds it makes. This scripted performance can last up to 5 minutes. When the trigger you specify occurs, the illusion springs into existence and performs in the manner you described. Once the illusion finishes performing, it disappears and remains dormant for 10 minutes, after which the illusion can be activated again. The trigger can be as general or as detailed as you like, though it must be based on visual or audible phenomena that occur within 30 feet of the area. For example, you could create an illusion of yourself to appear and warn off others who attempt to open a trapped door. Physical interaction with the image reveals it to be illusory, since things can pass through it. A creature that takes the Study action to examine the image can determine that it is an illusion with a successful Intelligence (Investigation) check against your spell save DC. If a creature discerns the illusion for what it is, the creature can see through the image, and any noise it makes sounds hollow to the creature. * - (jade dust worth 25+ GP)"
 },
 {
  "name": "Tasha's Bubbling Cauldron",
  "level": 6,
  "castingTime": "1 Action",
  "range": "5 ft.",
  "components": "V, S, M *",
  "duration": "10 Minutes",
  "school": "Conjuration",
  "save": "None",
  "effect": "You conjure a claw-footed cauldron filled with bubbling liquid. The cauldron appears in an unoccupied space on the ground within 5 feet of you and lasts for the duration. The cauldron can't be moved and disappears when the spell ends, along with the bubbling liquid inside it.",
  "classes": [
   "Bard",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "The liquid in the cauldron duplicates the properties of a Common or an Uncommon potion of your choice (such as a Potion of Healing). As a Bonus Action, you or an ally can reach into the cauldron and withdraw one potion of that kind. The potion is contained in a vial that disappears when the potion is consumed. The cauldron can produce a number of these potions equal to your spellcasting ability modifier (minimum 1). When the last of these potions is withdrawn from the cauldron, the cauldron disappears, and the spell ends. Potions obtained from the cauldron that aren't consumed disappear when you cast this spell again. * - (a gilded ladle worth 500 + GP)"
 },
 {
  "name": "Transport via Plants",
  "level": 6,
  "castingTime": "1 Action",
  "range": "10 ft.",
  "components": "V, S",
  "duration": "1 Minute",
  "school": "Conjuration",
  "save": "None",
  "effect": "Teleportation",
  "classes": [
   "Bard",
   "Druid",
   "Ranger",
   "Warlock",
   "Wizard"
  ],
  "desc": "This spell creates a magical link between a Large or larger inanimate plant within range and another plant, at any distance, on the same plane of existence. You must have seen or touched the destination plant at least once before. For the duration, any creature can step into the target plant and exit from the destination plant by using 5 feet of movement."
 },
 {
  "name": "True Seeing",
  "level": 6,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "1 Hour",
  "school": "Divination",
  "save": "None",
  "effect": "Detection",
  "classes": [
   "Bard",
   "Cleric",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "For the duration, the willing creature you touch has Truesight with a range of 120 feet. * - (mushroom powder worth 25+ GP, which the spell consumes)"
 },
 {
  "name": "Wind Walk",
  "level": 6,
  "castingTime": "1 Minute",
  "range": "30 ft.",
  "components": "V, S, M *",
  "duration": "8 Hours",
  "school": "Transmutation",
  "save": "None",
  "effect": "Buff (...)",
  "classes": [
   "Druid",
   "Ranger"
  ],
  "desc": "You and up to ten willing creatures of your choice within range assume gaseous forms for the duration, appearing as wisps of cloud. While in this cloud form, a target has a Fly Speed of 300 feet and can hover; it has Immunity to the Prone condition; and it has Resistance to Bludgeoning, Piercing, and Slashing damage. The only actions a target can take in this form are the Dash action or a Magic action to begin reverting to its normal form. Reverting takes 1 minute, during which the target has the Stunned condition. Until the spell ends, the target can revert to cloud form, which also requires a Magic action followed by a 1-minute transformation. If a target is in cloud form and flying when the effect ends, the target descends 60 feet per round for 1 minute until it lands, which it does safely. If it can't land after 1 minute, it falls the remaining distance. * - (a candle)"
 },
 {
  "name": "Word of Recall",
  "level": 6,
  "castingTime": "1 Action",
  "range": "5 ft.",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Conjuration",
  "save": "None",
  "effect": "Teleportation",
  "classes": [
   "Cleric"
  ],
  "desc": "You and up to five willing creatures within 5 feet of you instantly teleport to a previously designated sanctuary. You and any creatures that teleport with you appear in the nearest unoccupied space to the spot you designated when you prepared your sanctuary (see below). If you cast this spell without first preparing a sanctuary, the spell has no effect. You must designate a location, such as a temple, as a sanctuary by casting this spell there."
 },
 {
  "name": "Divine Word",
  "level": 7,
  "castingTime": "1 Bonus Action",
  "range": "30 ft.",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "CHA Save",
  "effect": "Deafened (...)",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Ranger",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You utter a word imbued with power from the Upper Planes. Each creature of your choice in range makes a Charisma saving throw. On a failed save, a target that has 50 Hit Points or fewer suffers an effect based on its current Hit Points, as shown in the Divine Word Effects table. Regardless of its Hit Points, a Celestial, an Elemental, a Fey, or a Fiend target that fails its save is forced back to its plane of origin (if it isn't there already) and can't return to the current plane for 24 hours by any means short of a Wish spell. Divine Word Effects Hit Points Effect 0–20 The target dies. 21–30 The target has the Blinded, Deafened, and Stunned conditions for 1 hour. 31–40 The target has the Blinded and Deafened conditions for 10 minutes. 41–50 The target has the Deafened condition for 1 minute."
 },
 {
  "name": "Etherealness",
  "level": 7,
  "castingTime": "1 Action",
  "range": "Self",
  "components": "V, S",
  "duration": "8 Hours",
  "school": "Conjuration",
  "save": "None",
  "effect": "Buff (...)",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You step into the border regions of the Ethereal Plane, where it overlaps with your current plane. You remain in the Border Ethereal for the duration. During this time, you can move in any direction. If you move up or down, every foot of movement costs an extra foot. You can perceive the plane you left, which looks gray, and you can't see anything there more than 60 feet away. While on the Ethereal Plane, you can affect and be affected only by creatures, objects, and effects on that plane. Creatures that aren't on the Ethereal Plane can't perceive or interact with you unless a feature gives them the ability to do so. When the spell ends, you return to the plane you left in the spot that corresponds to your space in the Border Ethereal. If you appear in an occupied space, you are shunted to the nearest unoccupied space and take Force damage equal to twice the number of feet you are moved. This spell ends instantly if you cast it while you are on the Ethereal Plane or a plane that doesn't border it, such as one of the Outer Planes. Using a Higher-Level Spell Slot. You can target up to three willing creatures (including yourself) for each spell slot level above 7. The creatures must be within 10 feet of you when you cast the spell."
 },
 {
  "name": "Finger of Death",
  "level": 7,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "CON Save",
  "effect": "Necrotic",
  "classes": [
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You unleash negative energy toward a creature you can see within range. The target makes a Constitution saving throw, taking 7d8 + 30 Necrotic damage on a failed save or half as much damage on a successful one. A Humanoid killed by this spell rises at the start of your next turn as a Zombie that follows your verbal orders."
 },
 {
  "name": "Fire Storm",
  "level": 7,
  "castingTime": "1 Action",
  "range": "150 ft. (10 ft. )",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "DEX Save",
  "effect": "Fire",
  "classes": [
   "Cleric",
   "Druid",
   "Sorcerer"
  ],
  "desc": "A storm of fire appears within range. The area of the storm consists of up to ten 10-foot Cubes, which you arrange as you like. Each Cube must be contiguous with at least one other Cube. Each creature in the area makes a Dexterity saving throw, taking 7d10 Fire damage on a failed save or half as much damage on a successful one. Flammable objects in the area that aren't being worn or carried start burning."
 },
 {
  "name": "Mirage Arcane",
  "level": 7,
  "castingTime": "10 Minutes",
  "range": "Sight (1 mile )",
  "components": "V, S",
  "duration": "10 Days",
  "school": "Illusion",
  "save": "None",
  "effect": "Control",
  "classes": [
   "Bard",
   "Druid",
   "Wizard"
  ],
  "desc": "You make terrain in an area up to 1 mile square look, sound, smell, and even feel like some other sort of terrain. Open fields or a road could be made to resemble a swamp, hill, crevasse, or some other rough or impassable terrain. A pond can be made to seem like a grassy meadow, a precipice like a gentle slope, or a rock-strewn gully like a wide and smooth road. Similarly, you can alter the appearance of structures or add them where none are present. The spell doesn't disguise, conceal, or add creatures. The illusion includes audible, visual, tactile, and olfactory elements, so it can turn clear ground into Difficult Terrain (or vice versa) or otherwise impede movement through the area. Any piece of the illusory terrain (such as a rock or stick) that is removed from the spell's area disappears immediately. Creatures with Truesight can see through the illusion to the terrain's true form; however, all other elements of the illusion remain, so while the creature is aware of the illusion's presence, the creature can still physically interact with the illusion."
 },
 {
  "name": "Mordenkainen's Magnificent Mansion",
  "level": 7,
  "castingTime": "1 Minute",
  "range": "300 ft.",
  "components": "V, S, M *",
  "duration": "24 Hours",
  "school": "Conjuration",
  "save": "None",
  "effect": "Exploration (...)",
  "classes": [
   "Bard",
   "Wizard"
  ],
  "desc": "You conjure a shimmering door in range that lasts for the duration. The door leads to an extradimensional dwelling and is 5 feet wide and 10 feet tall. You and any creature you designate when you cast the spell can enter the extradimensional dwelling as long as the door remains open. You can open or close it (no action required) if you are within 30 feet of it. While closed, the door is imperceptible. Beyond the door is a magnificent foyer with numerous chambers beyond. The dwelling's atmosphere is clean, fresh, and warm. You can create any floor plan you like for the dwelling, but it can't exceed 50 contiguous 10-foot Cubes. The place is furnished and decorated as you choose. It contains sufficient food to serve a nine-course banquet for up to 100 people. Furnishings and other objects created by this spell dissipate into smoke if removed from it. A staff of 100 near-transparent servants attends all who enter. You determine the appearance of these servants and their attire. They are invulnerable and obey your commands. Each servant can perform tasks that a human could perform, but they can't attack or take any action that would directly harm another creature. Thus the servants can fetch things, clean, mend, fold clothes, light fires, serve food, pour wine, and so on. The servants can't leave the dwelling. When the spell ends, any creatures or objects left inside the extradimensional space are expelled into the unoccupied spaces nearest to the entrance. * - (a miniature door worth 15+ GP)"
 },
 {
  "name": "Plane Shift",
  "level": 7,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Conjuration",
  "save": "None",
  "effect": "Banishment (...)",
  "classes": [
   "Cleric",
   "Druid",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You and up to eight willing creatures who link hands in a circle are transported to a different plane of existence. You can specify a target destination in general terms, such as the City of Brass on the Elemental Plane of Fire or the palace of Dispater on the second level of the Nine Hells, and you appear in or near that destination, as determined by the DM. Alternatively, if you know the sigil sequence of a teleportation circle on another plane of existence, this spell can take you to that circle. If the teleportation circle is too small to hold all the creatures you transported, they appear in the closest unoccupied spaces next to the circle. * - (a forked, metal rod worth 250+ GP and attuned to a plane of existence)"
 },
 {
  "name": "Power Word Fortify",
  "level": 7,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Enchantment",
  "save": "None",
  "effect": "Buff",
  "classes": [
   "Bard",
   "Cleric"
  ],
  "desc": "You fortify up to six creatures you can see within range. The spell bestows 120 Temporary Hit Points, which you divide among the spell's recipients."
 },
 {
  "name": "Prismatic Spray",
  "level": 7,
  "castingTime": "1 Action",
  "range": "Self (60 ft. )",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "DEX Save",
  "effect": "Fire (...)",
  "classes": [
   "Bard",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "Eight rays of light flash from you in a 60-foot Cone. Each creature in the Cone makes a Dexterity saving throw. For each target, roll 1d8 to determine which color ray affects it, consulting the Prismatic Rays table. Prismatic Rays 1d8 Ray 1 Red. Failed Save: 12d6 Fire damage. Successful Save: Half as much damage. 2 Orange. Failed Save: 12d6 Acid damage. Successful Save: Half as much damage. 3 Yellow. Failed Save: 12d6 Lightning damage. Successful Save: Half as much damage. 4 Green. Failed Save: 12d6 Poison damage. Successful Save: Half as much damage. 5 Blue. Failed Save: 12d6 Cold damage. Successful Save: Half as much damage. 6 Indigo. Failed Save: The target has the Restrained condition and makes a Constitution saving throw at the end of each of its turns. If it successfully saves three times, the condition ends. If it fails three times, it has the Petrified condition until it is freed by an effect like the Greater Restoration spell. The successes and failures needn't be consecutive; keep track of both until the target collects three of a kind. 7 Violet. Failed Save: The target has the Blinded condition and makes a Wisdom saving throw at the start of your next turn. On a successful save, the condition ends. On a failed save, the condition ends, and the creature teleports to another plane of existence (DM's choice). 8 Special. The target is struck by two rays. Roll twice, rerolling any 8."
 },
 {
  "name": "Regenerate",
  "level": 7,
  "castingTime": "1 Minute",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "1 Hour",
  "school": "Transmutation",
  "save": "None",
  "effect": "Healing",
  "classes": [
   "Bard",
   "Cleric",
   "Druid"
  ],
  "desc": "A creature you touch regains 4d8 + 15 Hit Points. For the duration, the target regains 1 Hit Point at the start of each of its turns, and any severed body parts regrow after 2 minutes. * - (a prayer wheel)"
 },
 {
  "name": "Resurrection",
  "level": 7,
  "castingTime": "1 Hour",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "None",
  "effect": "Healing",
  "classes": [
   "Bard",
   "Cleric",
   "Druid",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "With a touch, you revive a dead creature that has been dead for no more than a century, didn't die of old age, and wasn't Undead when it died. The creature returns to life with all its Hit Points. This spell also neutralizes any poisons that affected the creature at the time of death. This spell closes all mortal wounds and restores any missing body parts. Coming back from the dead is an ordeal. The target takes a −4 penalty to D20 Tests. Every time the target finishes a Long Rest, the penalty is reduced by 1 until it becomes 0. Casting this spell to revive a creature that has been dead for 365 days or longer taxes you. Until you finish a Long Rest, you can't cast spells again, and you have Disadvantage on D20 Tests. * - (a diamond worth 1,000+ GP, which the spell consumes)"
 },
 {
  "name": "Sequester",
  "level": 7,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Until Dispelled",
  "school": "Transmutation",
  "save": "None",
  "effect": "Invisible",
  "classes": [
   "Druid",
   "Wizard"
  ],
  "desc": "With a touch, you magically sequester an object or a willing creature. For the duration, the target has the Invisible condition and can't be targeted by Divination spells, detected by magic, or viewed remotely with magic. If the target is a creature, it enters a state of suspended animation; it has the Unconscious condition, doesn't age, and doesn't need food, water, or air. You can set a condition for the spell to end early. The condition can be anything you choose, but it must occur or be visible within 1 mile of the target. Examples include “after 1,000 years” or “when the tarrasque awakens.” This spell also ends if the target takes any damage. * - (gem dust worth 5,000+ GP, which the spell consumes)"
 },
 {
  "name": "Simulacrum",
  "level": 7,
  "castingTime": "12 Hours",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Until Dispelled",
  "school": "Illusion",
  "save": "None",
  "effect": "Deception (...)",
  "classes": [
   "Bard",
   "Druid",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You create a simulacrum of one Beast or Humanoid that is within 10 feet of you for the entire casting of the spell. You finish the casting by touching both the creature and a pile of ice or snow that is the same size as that creature, and the pile turns into the simulacrum, which is a creature. It uses the game statistics of the original creature at the time of casting, except it is a Construct, its Hit Point maximum is half as much, and it can't cast this spell. The simulacrum is Friendly to you and creatures you designate. It obeys your commands and acts on your turn in combat. The simulacrum can't gain levels, and it can't take Short or Long Rests. If the simulacrum takes damage, the only way to restore its Hit Points is to repair it as you take a Long Rest, during which you expend components worth 100 GP per Hit Point restored. The simulacrum must stay within 5 feet of you for the repair. The simulacrum lasts until it drops to 0 Hit Points, at which point it reverts to snow and melts away. If you cast this spell again, any simulacrum you created with this spell is instantly destroyed. * - (powdered ruby worth 1,500+ GP, which the spell consumes)"
 },
 {
  "name": "Symbol",
  "level": 7,
  "castingTime": "1 Minute",
  "range": "Touch (60 ft. )",
  "components": "V, S, M *",
  "duration": "Until Dispelled or Triggered",
  "school": "Abjuration",
  "save": "None",
  "effect": "Necrotic",
  "classes": [
   "Bard",
   "Cleric",
   "Druid",
   "Wizard"
  ],
  "desc": "You inscribe a harmful glyph either on a surface (such as a section of floor or wall) or within an object that can be closed (such as a book or chest). The glyph can cover an area no larger than 10 feet in diameter. If you choose an object, it must remain in place; if it is moved more than 10 feet from where you cast this spell, the glyph is broken, and the spell ends without being triggered. The glyph is nearly imperceptible and requires a successful Wisdom (Perception) check against your spell save DC to notice. When you inscribe the glyph, you set its trigger and choose which effect the symbol bears: Death, Discord, Fear, Pain, Sleep, or Stunning. Each one is explained below. Set the Trigger. You decide what triggers the glyph when you cast the spell. For glyphs inscribed on a surface, common triggers include touching or stepping on the glyph, removing another object covering it, or approaching within a certain distance of it. For glyphs inscribed within an object, common triggers include opening that object or seeing the glyph. You can refine the trigger so that only creatures of certain types activate it (for example, the glyph could be set to affect Aberrations). You can also set conditions for creatures that don't trigger the glyph, such as those who say a certain password. Once triggered, the glyph glows, filling a 60-foot-radius Sphere with Dim Light for 10 minutes, after which time the spell ends. Each creature in the Sphere when the glyph activates is targeted by its effect, as is a creature that enters the Sphere for the first time on a turn or ends its turn there. A creature is targeted only once per turn. Death. Each target makes a Constitution saving throw, taking 10d10 Necrotic damage on a failed save or half as much damage on a successful save. Discord. Each target makes a Wisdom saving throw. On a failed save, a target argues with other creatures for 1 minute. During this time, it is incapable of meaningful communication and has Disadvantage on attack rolls and ability checks. Fear. Each target must succeed on a Wisdom saving throw or have the Frightened condition for 1 minute. While Frightened, the target must move at least 30 feet away from the glyph on each of its turns, if able. Pain. Each target must succeed on a Constitution saving throw or have the Incapacitated condition for 1 minute. Sleep. Each target must succeed on a Wisdom saving throw or have the Unconscious condition for 10 minutes. A creature awakens if it takes damage or if someone takes an action to shake it awake. Stunning. Each target must succeed on a Wisdom saving throw or have the Stunned condition for 1 minute. * - (powdered diamond worth 1,000+ GP, which the spell consumes)"
 },
 {
  "name": "Teleport",
  "level": 7,
  "castingTime": "1 Action",
  "range": "10 ft.",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Conjuration",
  "save": "None",
  "effect": "Teleportation",
  "classes": [
   "Bard",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "This spell instantly transports you and up to eight willing creatures that you can see within range, or a single object that you can see within range, to a destination you select. If you target an object, it must be Large or smaller, and it can't be held or carried by an unwilling creature. The destination you choose must be known to you, and it must be on the same plane of existence as you. Your familiarity with the destination determines whether you arrive there successfully. The DM rolls 1d100 and consults the Teleportation Outcome table and the explanations after it. Teleportation Outcome Familiarity Mishap Similar Area Off Target On Target Permanent circle — — — 01–00 Linked object — — — 01–00 Very familiar 01–05 06–13 14–24 25–00 Seen casually 01–33 34–43 44–53 54–00 Viewed once or described 01–43 44–53 54–73 74–00 False destination 01–50 51–00 — — Familiarity. Here are the meanings of the terms in the table's Familiarity column: “Permanent circle” means a permanent teleportation circle whose sigil sequence you know. “Linked object” means you possess an object taken from the desired destination within the last six months, such as a book from a wizard's library. “Very familiar” is a place you have visited often, a place you have carefully studied, or a place you can see when you cast the spell. “Seen casually” is a place you have seen more than once but with which you aren't very familiar. “Viewed once or described” is a place you have seen once, possibly using magic, or a place you know through someone else's description, perhaps from a map. “False destination” is a place that doesn't exist. Perhaps you tried to scry an enemy's sanctum but instead viewed an illusion, or you are attempting to teleport to a location that no longer exists. Mishap. The spell's unpredictable magic results in a difficult journey. Each teleporting creature (or the target object) takes 3d10 Force damage, and the DM rerolls on the table to see where you wind up (multiple mishaps can occur, dealing damage each time). Similar Area. You and your group (or the target object) appear in a different area that's visually or thematically similar to the target area. You appear in the closest similar place. If you are heading for your home laboratory, for example, you might appear in another person's laboratory in the same city. Off Target. You and your group (or the target object) appear 2d12 miles away from the destination in a random direction. Roll 1d8 for the direction: 1, east; 2, southeast; 3, south; 4, southwest; 5, west; 6, northwest; 7, north; or 8, northeast. On Target. You and your group (or the target object) appear where you intended."
 },
 {
  "name": "Animal Shapes",
  "level": 8,
  "castingTime": "1 Action",
  "range": "30 ft.",
  "components": "V, S",
  "duration": "24 Hours",
  "school": "Transmutation",
  "save": "None",
  "effect": "Shapechanging",
  "classes": [
   "Druid"
  ],
  "desc": "Choose any number of willing creatures that you can see within range. Each target shape-shifts into a Large or smaller Beast of your choice that has a Challenge Rating of 4 or lower. You can choose a different form for each target. On later turns, you can take a Magic action to transform the targets again. A target's game statistics are replaced by the chosen Beast's statistics, but the target retains its creature type; Hit Points; Hit Point Dice; alignment; ability to communicate; and Intelligence, Wisdom, and Charisma scores. The target's actions are limited by the Beast form's anatomy, and it can't cast spells. The target's equipment melds into the new form, and the target can't use any of that equipment while in that form. The target gains a number of Temporary Hit Points equal to the Hit Points of the first form into which it shape-shifts. These Temporary Hit Points vanish if any remain when the spell ends. The transformation lasts for the duration or until the target ends it as a Bonus Action."
 },
 {
  "name": "Antipathy/Sympathy",
  "level": 8,
  "castingTime": "1 Hour",
  "range": "60 ft.",
  "components": "V, S, M *",
  "duration": "10 Days",
  "school": "Enchantment",
  "save": "WIS Save",
  "effect": "Frightened",
  "classes": [
   "Artificer",
   "Bard",
   "Druid",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "As you cast the spell, choose whether it creates antipathy or sympathy, and target one creature or object that is Huge or smaller. Then specify a kind of creature, such as red dragons, goblins, or vampires. A creature of the chosen kind makes a Wisdom saving throw when it comes within 120 feet of the target. Your choice of antipathy or sympathy determines what happens to a creature when it fails that save: Antipathy. The creature has the Frightened condition. The Frightened creature must use its movement on its turns to get as far away as possible from the target, moving by the safest route. Sympathy. The creature has the Charmed condition. The Charmed creature must use its movement on its turns to get as close as possible to the target, moving by the safest route. If the creature is within 5 feet of the target, the creature can't willingly move away. If the target damages the Charmed creature, that creature can make a Wisdom saving throw to end the effect, as described below. Ending the Effect. If the Frightened or Charmed creature ends its turn more than 120 feet away from the target, the creature makes a Wisdom saving throw. On a successful save, the creature is no longer affected by the target. A creature that successfully saves against this effect is immune to it for 1 minute, after which it can be affected again. * - (a mix of vinegar and honey)"
 },
 {
  "name": "Befuddlement",
  "level": 8,
  "castingTime": "1 Action",
  "range": "150 ft.",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Enchantment",
  "save": "INT Save",
  "effect": "Psychic",
  "classes": [
   "Artificer",
   "Bard",
   "Cleric",
   "Druid",
   "Paladin",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You blast the mind of a creature that you can see within range. The target makes an Intelligence saving throw. On a failed save, the target takes 10d12 Psychic damage and can't cast spells or take the Magic action. At the end of every 30 days, the target repeats the save, ending the effect on a success. The effect can also be ended by the Greater Restoration, Heal, or Wish spell. On a successful save, the target takes half as much damage only. * - (a key ring with no keys)"
 },
 {
  "name": "Clone",
  "level": 8,
  "castingTime": "1 Hour",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "None",
  "effect": "Utility",
  "classes": [
   "Bard",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You touch a creature or at least 1 cubic inch of its flesh. An inert duplicate of that creature forms inside the vessel used in the spell's casting and finishes growing after 120 days; you choose whether the finished clone is the same age as the creature or younger. The clone remains inert and endures indefinitely while its vessel remains undisturbed. If the original creature dies after the clone finishes forming, the creature's soul transfers to the clone if the soul is free and willing to return. The clone is physically identical to the original and has the same personality, memories, and abilities, but none of the original's equipment. The creature's original remains, if any, become inert and can't be revived, since the creature's soul is elsewhere. * - (a diamond worth 1,000+ GP, which the spell consumes, and a sealable vessel worth 2,000+ GP that is large enough to hold the creature being cloned)"
 },
 {
  "name": "Demiplane",
  "level": 8,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "S",
  "duration": "1 Hour",
  "school": "Conjuration",
  "save": "None",
  "effect": "Utility",
  "classes": [
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You create a shadowy Medium door on a flat solid surface that you can see within range. This door can be opened and closed, and it leads to a demiplane that is an empty room 30 feet in each dimension, made of wood or stone (your choice). When the spell ends, the door vanishes, and any objects inside the demiplane remain there. Any creatures inside also remain unless they opt to be shunted through the door as it vanishes, landing with the Prone condition in the unoccupied spaces closest to the door's former space. Each time you cast this spell, you can create a new demiplane or connect the shadowy door to a demiplane you created with a previous casting of this spell. Additionally, if you know the nature and contents of a demiplane created by a casting of this spell by another creature, you can connect the shadowy door to that demiplane instead."
 },
 {
  "name": "Glibness",
  "level": 8,
  "castingTime": "1 Action",
  "range": "Self",
  "components": "V",
  "duration": "1 Hour",
  "school": "Enchantment",
  "save": "None",
  "effect": "Social",
  "classes": [
   "Bard",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "Until the spell ends, when you make a Charisma check, you can replace the number you roll with a 15. Additionally, no matter what you say, magic that would determine if you are telling the truth indicates that you are being truthful."
 },
 {
  "name": "Mind Blank",
  "level": 8,
  "castingTime": "1 Action",
  "range": "Touch",
  "components": "V, S",
  "duration": "24 Hours",
  "school": "Abjuration",
  "save": "None",
  "effect": "Charmed",
  "classes": [
   "Bard",
   "Wizard"
  ],
  "desc": "Until the spell ends, one willing creature you touch has Immunity to Psychic damage and the Charmed condition. The target is also unaffected by anything that would sense its emotions or alignment, read its thoughts, or magically detect its location, and no spell—not even Wish—can gather information about the target, observe it remotely, or control its mind."
 },
 {
  "name": "Power Word Stun",
  "level": 8,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Enchantment",
  "save": "None",
  "effect": "Stunned",
  "classes": [
   "Bard",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You overwhelm the mind of one creature you can see within range. If the target has 150 Hit Points or fewer, it has the Stunned condition. Otherwise, its Speed is 0 until the start of your next turn. The Stunned target makes a Constitution saving throw at the end of each of its turns, ending the condition on itself on a success."
 },
 {
  "name": "Sunburst",
  "level": 8,
  "castingTime": "1 Action",
  "range": "150 ft. (60 ft. )",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "CON Save",
  "effect": "Radiant",
  "classes": [
   "Cleric",
   "Druid",
   "Ranger",
   "Sorcerer",
   "Wizard"
  ],
  "desc": "Brilliant sunlight flashes in a 60-foot-radius Sphere centered on a point you choose within range. Each creature in the Sphere makes a Constitution saving throw. On a failed save, a creature takes 12d6 Radiant damage and has the Blinded condition for 1 minute. On a successful save, it takes half as much damage only. A creature Blinded by this spell makes another Constitution saving throw at the end of each of its turns, ending the effect on itself on a success. This spell dispels Darkness in its area that was created by any spell. * - (a piece of sunstone)"
 },
 {
  "name": "Telepathy",
  "level": 8,
  "castingTime": "1 Action",
  "range": "Unlimited",
  "components": "V, S, M *",
  "duration": "24 Hours",
  "school": "Divination",
  "save": "None",
  "effect": "Communication",
  "classes": [
   "Wizard"
  ],
  "desc": "You create a telepathic link between yourself and a willing creature with which you are familiar. The creature can be anywhere on the same plane of existence as you. The spell ends if you or the target are no longer on the same plane. Until the spell ends, you and the target can instantly share words, images, sounds, and other sensory messages with each other through the link, and the target recognizes you as the creature it is communicating with. The spell enables a creature to understand the meaning of your words and any sensory messages you send to it. * - (a pair of linked silver rings)"
 },
 {
  "name": "Astral Projection",
  "level": 9,
  "castingTime": "1 Hour",
  "range": "10 ft.",
  "components": "V, S, M *",
  "duration": "Until Dispelled",
  "school": "Necromancy",
  "save": "None",
  "effect": "Teleportation",
  "classes": [
   "Cleric",
   "Druid",
   "Paladin",
   "Warlock",
   "Wizard"
  ],
  "desc": "You and up to eight willing creatures within range project your astral bodies into the Astral Plane (the spell ends instantly if you are already on that plane). Each target's body is left behind in a state of suspended animation; it has the Unconscious condition, doesn't need food or air, and doesn't age. A target's astral form resembles its body in almost every way, replicating its game statistics and possessions. The principal difference is the addition of a silvery cord that trails from between the shoulder blades of the astral form. The cord fades from view after 1 foot. If the cord is cut—which happens only when an effect states that it does so—the target's body and astral form both die. A target's astral form can travel through the Astral Plane. The moment an astral form leaves that plane, the target's body and possessions travel along the silver cord, causing the target to re-enter its body on the new plane. Any damage or other effects that apply to an astral form have no effect on the target's body and vice versa. If a target's body or astral form drops to 0 Hit Points, the spell ends for that target. The spell ends for all the targets if you take a Magic action to dismiss it. When the spell ends for a target who isn't dead, the target reappears in its body and exits the state of suspended animation. * - (for each of the spell's targets, one jacinth worth 1,000+ GP and one silver bar worth 100+ GP, all of which the spell consumes)"
 },
 {
  "name": "Foresight",
  "level": 9,
  "castingTime": "1 Minute",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "8 Hours",
  "school": "Divination",
  "save": "None",
  "effect": "Buff (...)",
  "classes": [
   "Bard",
   "Druid",
   "Warlock",
   "Wizard"
  ],
  "desc": "You touch a willing creature and bestow a limited ability to see into the immediate future. For the duration, the target has Advantage on D20 Tests, and other creatures have Disadvantage on attack rolls against it. The spell ends early if you cast it again. * - (a hummingbird feather)"
 },
 {
  "name": "Imprisonment",
  "level": 9,
  "castingTime": "1 Minute",
  "range": "30 ft.",
  "components": "V, S, M *",
  "duration": "Until Dispelled",
  "school": "Abjuration",
  "save": "WIS Save",
  "effect": "Restrained (...)",
  "classes": [
   "Druid",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You create a magical restraint to hold a creature that you can see within range. The target must make a Wisdom saving throw. On a successful save, the target is unaffected, and it is immune to this spell for the next 24 hours. On a failed save, the target is imprisoned. While imprisoned, the target doesn't need to breathe, eat, or drink, and it doesn't age. Divination spells can't locate or perceive the imprisoned target, and the target can't teleport. Until the spell ends, the target is also affected by one of the following effects of your choice: Burial. The target is entombed beneath the earth in a hollow globe of magical force that is just large enough to contain the target. Nothing can pass into or out of the globe. Chaining. Chains firmly rooted in the ground hold the target in place. The target has the Restrained condition and can't be moved by any means. Hedged Prison. The target is trapped in a demiplane that is warded against teleportation and planar travel. The demiplane is your choice of a labyrinth, a cage, a tower, or the like. Minimus Containment. The target becomes 1 inch tall and is trapped inside an indestructible gemstone or a similar object. Light can pass through the gemstone (allowing the target to see out and other creatures to see in), but nothing else can pass through by any means. Slumber. The target has the Unconscious condition and can't be awoken. Ending the Spell. When you cast the spell, specify a trigger that will end it. The trigger can be as simple or as elaborate as you choose, but the DM must agree that it has a high likelihood of happening within the next decade. The trigger must be an observable action, such as someone making a particular offering at the temple of your god, saving your true love, or defeating a specific monster. A Dispel Magic spell can end the spell only if it is cast with a level 9 spell slot, targeting either the prison or the component used to create it. * - (a statuette of the target worth 5,000+ GP)"
 },
 {
  "name": "Mass Heal",
  "level": 9,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Abjuration",
  "save": "None",
  "effect": "Blinded (...)",
  "classes": [
   "Cleric"
  ],
  "desc": "A flood of healing energy flows from you into creatures around you. You restore up to 700 Hit Points, divided as you choose among any number of creatures that you can see within range. Creatures healed by this spell also have the Blinded, Deafened, and Poisoned conditions removed from them."
 },
 {
  "name": "Meteor Swarm",
  "level": 9,
  "castingTime": "1 Action",
  "range": "1 mile (40 ft. *)",
  "components": "V, S",
  "duration": "Instantaneous",
  "school": "Evocation",
  "save": "DEX Save",
  "effect": "Fire (...)",
  "classes": [
   "Sorcerer",
   "Wizard"
  ],
  "desc": "Blazing orbs of fire plummet to the ground at four different points you can see within range. Each creature in a 40-foot-radius Sphere centered on each of those points makes a Dexterity saving throw. A creature takes 20d6 Fire damage and 20d6 Bludgeoning damage on a failed save or half as much damage on a successful one. A creature in the area of more than one fiery Sphere is affected only once. A nonmagical object that isn't being worn or carried also takes the damage if it's in the spell's area, and the object starts burning if it's flammable."
 },
 {
  "name": "Power Word Heal",
  "level": 9,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Enchantment",
  "save": "None",
  "effect": "Prone",
  "classes": [
   "Bard",
   "Cleric"
  ],
  "desc": "A wave of healing energy washes over one creature you can see within range. The target regains all its Hit Points. If the creature has the Charmed, Frightened, Paralyzed, Poisoned, or Stunned condition, the condition ends. If the creature has the Prone condition, it can use its Reaction to stand up."
 },
 {
  "name": "Power Word Kill",
  "level": 9,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Enchantment",
  "save": "None",
  "effect": "Psychic",
  "classes": [
   "Bard",
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "You compel one creature you can see within range to die. If the target has 100 Hit Points or fewer, it dies. Otherwise, it takes 12d12 Psychic damage."
 },
 {
  "name": "Prismatic Wall",
  "level": 9,
  "castingTime": "1 Action",
  "range": "60 ft.",
  "components": "V, S",
  "duration": "10 Minutes",
  "school": "Abjuration",
  "save": "CON Save",
  "effect": "Fire (...)",
  "classes": [
   "Bard",
   "Wizard"
  ],
  "desc": "A shimmering, multicolored plane of light forms a vertical opaque wall—up to 90 feet long, 30 feet high, and 1 inch thick—centered on a point within range. Alternatively, you shape the wall into a globe up to 30 feet in diameter centered on a point within range. The wall lasts for the duration. If you position the wall in a space occupied by a creature, the spell ends instantly without effect. The wall sheds Bright Light within 100 feet and Dim Light for an additional 100 feet. You and creatures you designate when you cast the spell can pass through and be near the wall without harm. If another creature that can see the wall moves within 20 feet of it or starts its turn there, the creature must succeed on a Constitution saving throw or have the Blinded condition for 1 minute. The wall consists of seven layers, each with a different color. When a creature reaches into or passes through the wall, it does so one layer at a time through all the layers. Each layer forces the creature to make a Dexterity saving throw or be affected by that layer's properties as described in the Prismatic Layers table. The wall, which has AC 10, can be destroyed one layer at a time, in order from red to violet, by means specific to each layer. If a layer is destroyed, it is gone for the duration. Antimagic Field has no effect on the wall, and Dispel Magic can affect only the violet layer. Prismatic Layers Order Effects 1 Red. Failed Save: 12d6 Fire damage. Successful Save: Half as much damage. Additional Effects: Nonmagical ranged attacks can't pass through this layer, which is destroyed if it takes at least 25 Cold damage. 2 Orange. Failed Save: 12d6 Acid damage. Successful Save: Half as much damage. Additional Effects: Magical ranged attacks can't pass through this layer, which is destroyed by a strong wind (such as the one created by Gust of Wind). 3 Yellow. Failed Save: 12d6 Lightning damage. Successful Save: Half as much damage. Additional Effects: The layer is destroyed if it takes at least 60 Force damage. 4 Green. Failed Save: 12d6 Poison damage. Successful Save: Half as much damage. Additional Effects: A Passwall spell, or another spell of equal or greater level that can open a portal on a solid surface, destroys this layer. 5 Blue. Failed Save: 12d6 Cold damage. Successful Save: Half as much damage. Additional Effects: The layer is destroyed if it takes at least 25 Fire damage. 6 Indigo. Failed Save: The target has the Restrained condition and makes a Constitution saving throw at the end of each of its turns. If it successfully saves three times, the condition ends. If it fails three times, it has the Petrified condition until it is freed by an effect like the Greater Restoration spell. The successes and failures needn't be consecutive; keep track of both until the target collects three of a kind. Additional Effects: Spells can't be cast through this layer, which is destroyed by Bright Light shed by the Daylight spell. 7 Violet. Failed Save: The target has the Blinded condition and makes a Wisdom saving throw at the start of your next turn. On a successful save, the condition ends. On a failed save, the condition ends, and the creature teleports to another plane of existence (DM's choice). Additional Effects: This layer is destroyed by Dispel Magic."
 },
 {
  "name": "Time Stop",
  "level": 9,
  "castingTime": "1 Action",
  "range": "Self",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Transmutation",
  "save": "None",
  "effect": "Control",
  "classes": [
   "Sorcerer",
   "Wizard"
  ],
  "desc": "You briefly stop the flow of time for everyone but yourself. No time passes for other creatures, while you take 1d4 + 1 turns in a row, during which you can use actions and move as normal. This spell ends if one of the actions you use during this period, or any effects that you create during it, affects a creature other than you or an object being worn or carried by someone other than you. In addition, the spell ends if you move to a place more than 1,000 feet from the location where you cast it."
 },
 {
  "name": "True Resurrection",
  "level": 9,
  "castingTime": "1 Hour",
  "range": "Touch",
  "components": "V, S, M *",
  "duration": "Instantaneous",
  "school": "Necromancy",
  "save": "None",
  "effect": "Healing",
  "classes": [
   "Cleric",
   "Druid"
  ],
  "desc": "You touch a creature that has been dead for no longer than 200 years and that died for any reason except old age. The creature is revived with all its Hit Points. This spell closes all wounds, neutralizes any poison, cures all magical contagions, and lifts any curses affecting the creature when it died. The spell replaces damaged or missing organs and limbs. If the creature was Undead, it is restored to its non-Undead form. The spell can provide a new body if the original no longer exists, in which case you must speak the creature's name. The creature then appears in an unoccupied space you choose within 10 feet of you. * - (diamonds worth 25,000+ GP, which the spell consumes)"
 },
 {
  "name": "Wish",
  "level": 9,
  "castingTime": "1 Action",
  "range": "Self",
  "components": "V",
  "duration": "Instantaneous",
  "school": "Conjuration",
  "save": "None",
  "effect": "Buff (...)",
  "classes": [
   "Sorcerer",
   "Warlock",
   "Wizard"
  ],
  "desc": "Wish is the mightiest spell a mortal can cast. By simply speaking aloud, you can alter reality itself. The basic use of this spell is to duplicate any other spell of level 8 or lower. If you use it this way, you don't need to meet any requirements to cast that spell, including costly components. The spell simply takes effect. Alternatively, you can create one of the following effects of your choice: Object Creation. You create one object of up to 25,000 GP in value that isn't a magic item. The object can be no more than 300 feet in any dimension, and it appears in an unoccupied space that you can see on the ground. Instant Health. You allow yourself and up to twenty creatures that you can see to regain all Hit Points, and you end all effects on them listed in the Greater Restoration spell. Resistance. You grant up to ten creatures that you can see Resistance to one damage type that you choose. This Resistance is permanent. Spell Immunity. You grant up to ten creatures you can see immunity to a single spell or other magical effect for 8 hours. Sudden Learning. You replace one of your feats with another feat for which you are eligible. You lose all the benefits of the old feat and gain the benefits of the new one. You can't replace a feat that is a prerequisite for any of your other feats or features. Roll Redo. You undo a single recent event by forcing a reroll of any die roll made within the last round (including your last turn). Reality reshapes itself to accommodate the new result. For example, a Wish spell could undo an ally's failed saving throw or a foe's Critical Hit. You can force the reroll to be made with Advantage or Disadvantage, and you choose whether to use the reroll or the original roll. Reshape Reality. You may wish for something not included in any of the other effects. To do so, state your wish to the DM as precisely as possible. The DM has great latitude in ruling what occurs in such an instance; the greater the wish, the greater the likelihood that something goes wrong. This spell might simply fail, the effect you desire might be achieved only in part, or you might suffer an unforeseen consequence as a result of how you worded the wish. For example, wishing that a villain were dead might propel you forward in time to a period when that villain is no longer alive, effectively removing you from the game. Similarly, wishing for a Legendary magic item or an Artifact might instantly transport you to the presence of the item's current owner. If your wish is granted and its effects have consequences for a whole community, region, or world, you are likely to attract powerful foes. If your wish would affect a god, the god's divine servants might instantly intervene to prevent it or to encourage you to craft the wish in a particular way. If your wish would undo the multiverse itself, threaten the City of Sigil, or affect the Lady of Pain in any way, you see an image of her in your mind for a moment; she shakes her head, and your wish fails. The stress of casting Wish to produce any effect other than duplicating another spell weakens you. After enduring that stress, each time you cast a spell until you finish a Long Rest, you take 1d10 Necrotic damage per level of that spell. This damage can't be reduced or prevented in any way. In addition, your Strength score becomes 3 for 2d4 days. For each of those days that you spend resting and doing nothing more than light activity, your remaining recovery time decreases by 2 days. Finally, there is a 33 percent chance that you are unable to cast Wish ever again if you suffer this stress."
 }
];
