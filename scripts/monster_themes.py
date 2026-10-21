"""Hvilket tema hører hver af SRD'ens skabninger til?

Det her er ikke trukket ud af SRD'en — det står der ikke. SRD'en har en
*type*: Beast, Fiend, Monstrosity. Den er god til regler og ubrugelig til et
rum. «Beast» rummer både en rotte og en tyrannosaurus, «Fey» både en dryade og
en hobgoblin-kaptajn, og et rum sat sammen efter type bliver et zoologisk
udsnit frem for et sted nogen bor.

Temaet er derfor en redaktionel inddeling: hvem holder til sammen. Den er
skrevet i hånden, og det er den eneste måde — et goblinkammer med en worg
hænger sammen, et goblinkammer med en pegasus gør ikke, og det kan ingen regel
i databladene regne ud.

Et tema behøver ikke kunne fylde et stort rum. Nogle af dem — småkravlet,
skovfolket — topper lavt, og så bliver rummet lettere end budgettet tillader.
Det er med vilje: hellere et let rum der hænger sammen end et dyrt rum der
ikke gør.

Listerne skal tilsammen dække alle skabninger i monsters.js præcis én gang;
import_monsters.py siger fra, hvis der mangler et navn eller står et der ikke
findes.
"""

THEMES = {
    "Goblinoider": [
        "Goblin Minion", "Goblin Warrior", "Goblin Boss",
        "Hobgoblin Warrior", "Hobgoblin Captain",
        "Bugbear Warrior", "Bugbear Stalker",
        "Worg", "Winter Wolf",
    ],
    "Drager": [
        "Kobold Warrior", "Pseudodragon", "Half-Dragon", "Wyvern",
        "Brass Dragon Wyrmling", "Copper Dragon Wyrmling",
        "Black Dragon Wyrmling", "Bronze Dragon Wyrmling",
        "Green Dragon Wyrmling", "Blue Dragon Wyrmling",
        "Red Dragon Wyrmling", "Silver Dragon Wyrmling",
        "Gold Dragon Wyrmling", "White Dragon Wyrmling",
        "Young Brass Dragon", "Young Black Dragon", "Young Copper Dragon",
        "Young Bronze Dragon", "Young Green Dragon", "Young Blue Dragon",
        "Young Silver Dragon", "Young Gold Dragon", "Young Red Dragon",
        "Young White Dragon",
        "Adult Brass Dragon", "Adult White Dragon", "Adult Black Dragon",
        "Adult Copper Dragon", "Adult Bronze Dragon", "Adult Green Dragon",
        "Adult Blue Dragon", "Adult Silver Dragon", "Adult Gold Dragon",
        "Adult Red Dragon",
        "Ancient Brass Dragon", "Ancient White Dragon", "Ancient Black Dragon",
        "Ancient Copper Dragon", "Ancient Bronze Dragon",
        "Ancient Green Dragon", "Ancient Blue Dragon", "Ancient Silver Dragon",
        "Ancient Gold Dragon", "Ancient Red Dragon",
    ],
    "Udøde": [
        "Skeleton", "Zombie", "Shadow", "Warhorse Skeleton", "Ghoul",
        "Specter", "Ghast", "Minotaur Skeleton", "Ogre Zombie",
        "Will-o’-Wisp", "Wight", "Ghost", "Lich", "Swarm of Crawling Claws",
    ],
    "Dæmoner": [
        "Dretch", "Quasit", "Vrock", "Hezrou", "Glabrezu", "Nalfeshnee",
        "Marilith", "Balor",
    ],
    "Djævle": [
        "Lemure", "Imp", "Bearded Devil", "Barbed Devil", "Chain Devil",
        "Bone Devil", "Horned Devil", "Erinyes", "Ice Devil", "Pit Fiend",
        "Hell Hound", "Nightmare",
    ],
    "Hekse og bedragere": [
        "Sea Hag", "Green Hag", "Night Hag", "Incubus", "Succubus",
        "Rakshasa", "Lamia", "Doppelganger", "Medusa",
    ],
    "Jætter og trolde": [
        "Troll Limb", "Ogre", "Ettin", "Troll", "Oni",
        "Hill Giant", "Stone Giant", "Frost Giant", "Cloud Giant",
        "Fire Giant", "Storm Giant",
    ],
    "Gnoller og hyæner": [
        "Gnoll Warrior", "Hyena", "Giant Hyena", "Jackal", "Death Dog",
        "Minotaur of Baphomet",
    ],
    "Havet": [
        "Crab", "Octopus", "Piranha", "Giant Crab", "Giant Seahorse",
        "Reef Shark", "Giant Octopus", "Hunter Shark", "Killer Whale",
        "Giant Shark", "Swarm of Piranhas",
        "Merfolk Skirmisher", "Sahuagin Warrior", "Merrow",
        "Dragon Turtle", "Kraken",
    ],
    "Elementarer": [
        "Steam Mephit", "Dust Mephit", "Ice Mephit", "Magma Mephit",
        "Magmin", "Azer Sentinel", "Gargoyle", "Xorn", "Salamander",
        "Air Elemental", "Earth Elemental", "Fire Elemental",
        "Water Elemental", "Invisible Stalker", "Djinni", "Efreeti",
    ],
    "Konstrukter": [
        "Homunculus", "Animated Flying Sword", "Animated Armor",
        "Animated Rug of Smothering", "Flesh Golem", "Gorgon",
        "Shield Guardian", "Clay Golem", "Stone Golem", "Iron Golem",
    ],
    "Slim og ådsler": [
        "Gray Ooze", "Gelatinous Cube", "Ochre Jelly", "Black Pudding",
        "Mimic", "Otyugh",
    ],
    "Underdybet": [
        "Grimlock", "Darkmantle", "Gibbering Mouther", "Grick", "Chuul",
        "Roper", "Cloaker",
    ],
    "Edderkopper og kryb": [
        "Spider", "Scorpion", "Giant Fire Beetle", "Giant Centipede",
        "Giant Wolf Spider", "Giant Wasp", "Giant Spider", "Giant Scorpion",
        "Swarm of Insects", "Stirge", "Ankheg", "Ettercap", "Phase Spider",
        "Drider", "Remorhaz", "Purple Worm", "Rust Monster",
    ],
    "Slanger og øgler": [
        "Lizard", "Venomous Snake", "Constrictor Snake", "Giant Lizard",
        "Giant Venomous Snake", "Giant Constrictor Snake",
        "Swarm of Venomous Snakes", "Flying Snake",
        "Crocodile", "Giant Crocodile", "Cockatrice", "Basilisk",
        "Behir", "Hydra", "Spirit Naga",
    ],
    "Urtidsdyr": [
        "Allosaurus", "Ankylosaurus", "Triceratops", "Tyrannosaurus Rex",
        "Pteranodon", "Plesiosaurus", "Archelon", "Mammoth",
        "Saber-Toothed Tiger", "Tarrasque",
    ],
    "Rovdyr": [
        "Boar", "Giant Boar", "Elk", "Panther", "Wolf", "Dire Wolf", "Ape",
        "Giant Ape", "Black Bear", "Brown Bear", "Polar Bear", "Lion",
        "Tiger", "Rhinoceros", "Elephant", "Hippopotamus", "Owlbear",
        "Bulette",
    ],
    "Himmelske": [
        "Giant Owl", "Giant Eagle", "Giant Elk", "Sphinx of Wonder",
        "Pegasus", "Couatl", "Unicorn", "Deva", "Guardian Naga",
        "Sphinx of Lore", "Planetar", "Sphinx of Valor", "Solar",
    ],
    "Skovfolk og planter": [
        "Blink Dog", "Sprite", "Satyr", "Dryad", "Centaur Trooper",
        "Awakened Shrub", "Violet Fungus", "Awakened Tree",
        "Shambling Mound", "Treant",
    ],
    "Vinger og kløer": [
        "Eagle", "Hawk", "Owl", "Raven", "Vulture", "Blood Hawk",
        "Swarm of Ravens", "Axe Beak", "Giant Vulture", "Harpy",
        "Hippogriff", "Griffon", "Manticore", "Chimera", "Roc",
    ],
    "Småkravl og kreaturer": [
        "Baboon", "Badger", "Bat", "Cat", "Frog", "Goat", "Rat", "Weasel",
        "Deer", "Camel", "Mule", "Pony", "Mastiff", "Draft Horse",
        "Riding Horse", "Warhorse", "Giant Rat", "Giant Weasel",
        "Giant Badger", "Giant Bat", "Giant Frog", "Giant Toad",
        "Giant Goat", "Swarm of Bats", "Swarm of Rats",
    ],
}


def by_name():
    """Temaet slået op på navn. Siger fra, hvis et navn står to steder."""
    out = {}
    for theme, names in THEMES.items():
        for name in names:
            if name in out:
                raise SystemExit("%s står i både %s og %s"
                                 % (name, out[name], theme))
            out[name] = theme
    return out
