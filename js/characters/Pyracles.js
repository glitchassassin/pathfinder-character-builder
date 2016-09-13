/*global csheetApp*/

csheetApp.factory("CurrentChar", function(Character, Attack, WeaponAbility, Data, Bonus, Feat, Ability) {
    function CurrentChar(loading) {
        var newChar = new Character(loading);
        
        newChar.onLoaded(function() {
            var cr = newChar.classrace;
            {
                cr.name         = "Pyracles";
                cr.alignment    = "LN";
                cr.player       = "Jon";
                cr.classes.list.push("Hexcrafter Magus");
                cr.levels.list.push("4");
                cr.race         = "Tiefling";
                cr.size         = "Medium";
                cr.gender       = "Male";
                cr.age          = "22";
                cr.height       = "6'0\"";
                cr.weight       = "155lbs";
                cr.hair         = "Black";
                cr.eyes         = "Red";
            }
            
            var st = newChar.stats;
            {
                st.str.score.inherent = 10;
                st.dex.score.inherent = 18;
                st.con.score.inherent = 15;
                st.int.score.inherent = 16;
                st.wis.score.inherent = 14;
                st.cha.score.inherent = 12;
                st.dex.score.racial = 2;
                st.int.score.racial = 2;
                st.cha.score.racial = -2;
                
                // 4th-level bonus
                st.con.score.inherent += 1
            }
            
            var hp = newChar.hitpoints;
            {
                // CON mod = +3/level
                // Favored class mod = +1/level
                // Levels = 4
                //  --: 16
                // Rolled HP =
                //   1: 8
                //   2: 2
                //   3: 5
                //   4: 5
                //  --: 20
                hp.total_hp = "36";
            }
            
            var sd = newChar.speeds;
            {
                sd.base.ft = "30";
                sd.armor.ft = "30";
            }
            
            var sk = newChar.skills.list;
            {
                // Class skills
                sk.climb.class_skill            = true;
                sk.craft1.class_skill           = true;
                sk.craft2.class_skill           = true;
                sk.craft3.class_skill           = true;
                sk.fly.class_skill              = true;
                sk.intimidate.class_skill       = true;
                sk.karcana.class_skill          = true;
                sk.kdungeoneering.class_skill   = true;
                sk.kplanes.class_skill          = true;
                sk.profession1.class_skill      = true;
                sk.profession2.class_skill      = true;
                sk.ride.class_skill             = true;
                sk.spellcraft.class_skill       = true;
                sk.swim.class_skill             = true;
                sk.usemagicdevice.class_skill   = true;
                // Ranks
                sk.climb.ranks          = "2";
                sk.disabledevice.ranks  = "1";
                sk.intimidate.ranks     = "1";
                sk.karcana.ranks        = "4";
                sk.kdungeoneering.ranks = "1";
                sk.kplanes.ranks        = "1";
                sk.perform1.ranks       = "2";
                sk.ride.ranks           = "1";
                sk.spellcraft.ranks     = "4";
                sk.stealth.ranks        = "2";
                sk.swim.ranks           = "1";
                sk.usemagicdevice.ranks = "4";
                // Subskills
                sk.perform1.subskill = "Dance";
                // Misc
                sk.bluff.misc   = "2";
                sk.stealth.misc = "2";
            }
            
            var aci = newChar.acitems;
            {
                aci.list.push({
                    item: "Mwk Studded Leather",
                    bonus: 3,
                    slot: "armor",
                    type: "Light",
                    check: "0",
                    spellfailure: "15%",
                    weight: "",
                    properties: "",
                    maxdex: 5
                });
                aci.totals.armor = 3;
                aci.totals.bonus = 3;
                aci.totals.type = "Light";
                aci.totals.check = 0;
                aci.totals.spellfailure = 0.15;
                aci.totals.maxdex = 5;
            }
            
            var ts = newChar.savingthrows;
            {
                ts.list.fortitude.base  = "+4";
                ts.list.reflex.base     = "+1";
                ts.list.will.base       = "+4";
                ts.mod = ["resist cold 5","resist elec 5","resist fire 5"];
            }
            
            var bab = newChar.baseattack;
            {
                bab.base = "+3";
            }
                
            var wl = newChar.rulesets.weapons.list;
            var wg = newChar.rulesets.weapons.groups;
            {
                wg["prof_simple"].depend("atk_bonuses", new Data({
                    "proficient": new Bonus({"proficiency": 0})
                }), "proficient");
                wg["prof_martial"].depend("atk_bonuses", new Data({
                    "proficient": new Bonus({"proficiency": 0})
                }), "proficient");
            }
            
            var ml = newChar.attacks.melee;
            var rn = newChar.attacks.ranged;
            {
                var ci_scimitar = new Attack({
                    weapon: newChar.rulesets.weapons.list.scimitar.clone(true).setup(newChar.rulesets.weapons.groups),
                    bab: newChar.baseattack
                });
                ci_scimitar.weapon.depend("prefix", new Data({type: "Cold Iron"}), "type");
                ci_scimitar.weapon.depend("prefix", new Data({type: "Copper"}), "type");
                ci_scimitar.weapon.masterwork = true;
                ml.push(ci_scimitar);
                
                var s_scimitar = new Attack({
                    weapon: newChar.rulesets.weapons.list.scimitar.clone(true).setup(newChar.rulesets.weapons.groups),
                    bab: newChar.baseattack
                });
                s_scimitar.weapon.depend("prefix", new Data({type: "Silver"}), "type");
                s_scimitar.weapon.depend("prefix", new Data({type: "Copper"}), "type");
                s_scimitar.weapon.masterwork = true;
                ml.push(s_scimitar);
                
                var longbow = new Attack({
                    weapon: newChar.rulesets.weapons.list.longbow.clone(true).setup(newChar.rulesets.weapons.groups), 
                    bab: newChar.baseattack
                });
                longbow.weapon.masterwork = true;
                ml.push(longbow);
            }
            
            var ln = newChar.languages;
            {
                ln.push("Common");
                ln.push("Infernal");
                ln.push("Elven");
                ln.push("Goblin");
                ln.push("Dwarven");
                ln.push("Orc");
            }
            
            var gr = newChar.gear;
            {
                gr.items.push({
                    "name": "Spellbook",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Backpack",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Longbow",
                    "weight": ""
                });
                gr.items.push({
                    "name": "3x Grappling arrow",
                    "weight": ""
                });
                gr.items.push({
                    "name": "2x Silk rope (50ft)",
                    "weight": ""
                });
                gr.items.push({
                    "name": "2x Alchemist's fire",
                    "weight": ""
                });
                gr.items.push({
                    "name": "2x Flask of acid",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Quickcatch manacles",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Mwk studded leather",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Mwk copper/cold iron scimitar",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Mwk copper/silver scimitar",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Horse (light, combat-trained)",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Ioun torch (50gp)",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Pearl of power I (1000gp)",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Traveler's Any-Tool (250gp)",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Campfire bead (720gp)",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Snapleaf necklace (750gp)",
                    "weight": ""
                });
                gr.money.gold = "230";
            }
            
            var ft = newChar.feats;
            {
                ft.push(new Feat({
                    "type": "Combat",
                    "name": "Weapon Finesse",
                    "prereqs": "",
                    "description": "With a light weapon, elven curve blade, rapier, whip, or spiked chain made for a creature of your size category, you may use your Dexterity modifier instead of your Strength modifier on attack rolls. If you carry a shield, its armor check penalty applies to your attack rolls.",
                    "rules": ["char.rulesets.weapons.groups.cat_light_melee.atk_bonuses dp char.stats.dex.ability_mod",
                              "char.rulesets.weapons.list.curve-blade-elven.atk_bonuses dp char.stats.dex.ability_mod",
                              "char.rulesets.weapons.list.rapier.atk_bonuses dp char.stats.dex.ability_mod",
                              "char.rulesets.weapons.list.whip.atk_bonuses dp char.stats.dex.ability_mod",
                              "char.rulesets.weapons.list.whip-scorpion.atk_bonuses dp char.stats.dex.ability_mod",
                              "char.rulesets.weapons.list.cat-o-nine-tails.atk_bonuses dp char.stats.dex.ability_mod",
                              "char.rulesets.weapons.list.chain-spiked.atk_bonuses dp char.stats.dex.ability_mod"]
                }));
                ft.push(new Feat({
                    "type": "Combat",
                    "name": "Dervish Dance",
                    "prereqs": "Dex 13, Weapon Finesse, Perform (dance) 2 ranks, proficient with scimitar",
                    "description": "When wielding a scimitar with one hand, you can use your Dexterity modifier instead of your Strength modifier on melee attack and damage rolls. You treat the scimitar as a one-handed piercing weapon for all feats and class abilities that require such a weapon (such as a duelist's precise strike ability). The scimitar must be for a creature of your size. You cannot use this feat if you are carrying a weapon or shield in your off hand.",
                    "rules": ["char.rulesets.weapons.list.scimitar.atk_bonuses dp char.stats.dex.ability_mod",
                              "char.rulesets.weapons.list.scimitar.dmg_bonuses dp char.stats.dex.ability_mod"]
                }));
            }
            
            var ab = newChar.abilities;
            {
                ab.push(new Ability({
                    "type": "Su",
                    "name": "Arcane Pool",
                    "uses": "6/day OOOOOO",
                    "description": "At 1st level, the magus gains a reservoir of mystical arcane energy that he can draw upon to fuel his powers and enhance his weapon. This arcane pool has a number of points equal to 1/2 his magus level (minimum 1) + his Intelligence modifier. The pool refreshes once per day when the magus prepares his spells.\n\n At 1st level, a magus can expend 1 point from his arcane pool as a swift action to grant any weapon he is holding a +1 enhancement bonus for 1 minute. For every four levels beyond 1st, the weapon gains another +1 enhancement bonus, to a maximum of +5 at 17th level. These bonuses can be added to the weapon, stacking with existing weapon enhancement to a maximum of +5. Multiple uses of this ability do not stack with themselves.\n\n At 5th level, these bonuses can be used to add any of the following weapon properties: dancing, flaming, flaming burst, frost, icy burst, keen, shock, shocking burst, speed, or vorpal.\n\n Adding these properties consumes an amount of bonus equal to the property's base price modifier. These properties are added to any the weapon already has, but duplicates do not stack. If the weapon is not magical, at least a +1 enhancement bonus must be added before any other properties can be added. These bonuses and properties are decided when the arcane pool point is spent and cannot be changed until the next time the magus uses this ability. These bonuses do not function if the weapon is wielded by anyone other than the magus.\n\n A magus can only enhance one weapon in this way at one time. If he uses this ability again, the first use immediately ends."
                }));
                ab.push(new Ability({
                    "type": "Sp",
                    "name": "Darkness",
                    "uses": "1/day O",
                    "description": "This spell causes an object to radiate darkness out to a 20-foot radius. This darkness causes the illumination level in the area to drop one step, from bright light to normal light, from normal light to dim light, or from dim light to darkness. This spell has no effect in an area that is already dark. Creatures with light vulnerability or sensitivity take no penalties in normal light. All creatures gain concealment (20% miss chance) in dim light. All creatures gain total concealment (50% miss chance) in darkness. Creatures with darkvision can see in an area of dim light or darkness without penalty. Nonmagical sources of light, such as torches and lanterns, do not increase the light level in an area of darkness. Magical light sources only increase the light level in an area if they are of a higher spell level than darkness.\n\nIf darkness is cast on a small object that is then placed inside or under a lightproof covering, the spell's effect is blocked until the covering is removed.\n\nThis spell does not stack with itself. Darkness can be used to counter or dispel any light spell of equal or lower spell level."
                }));
                ab.push(new Ability({
                    "type": "Ex",
                    "name": "Spell Combat",
                    "description": "At 1st level, a magus learns to cast spells and wield his weapons at the same time. This functions much like two-weapon fighting, but the off-hand weapon is a spell that is being cast."
                }));
                ab.push(new Ability({
                    "type": "Su",
                    "name": "Spellstrike",
                    "description": "At 2nd level, whenever a magus casts a spell with a range of \"touch\" from the magus spell list, he can deliver the spell through any weapon he is wielding as part of a melee attack."
                }));
                ab.push(new Ability({
                    "type": "Su",
                    "name": "Arcana: Close Range",
                    "description": "The magus can deliver ray spells that feature a ranged touch attack as melee touch spells."
                }));
                ab.push(new Ability({
                    "type": "Su",
                    "name": "Hex Magus",
                    "description": "At 4th level, the hexcrafter magus gains access to a small number of witch's hexes. The hexcrafter magus picks one hex from the witch's hex class feature. He gains the benefit of or uses that hex as if he were a witch of a level equal to his magus level. \n\n This feature replaces spell recall. \n\n Unless otherwise noted, using a hex is a standard action that does not provoke an attack of opportunity. The save to resist a hex is equal to 10 + 1/2 the witch's level + the witch's Intelligence modifier."
                }));
                ab.push(new Ability({
                    "type": "Su",
                    "name": "Evil Eye [DC 16]",
                    "description": "The target takes a -2 penalty on one of the following (witch's choice): AC, ability checks, attack rolls, saving throws, or skill checks. This hex lasts for a number of rounds equal to 3 + the witch's Intelligence modifier. A Will save reduces this to just 1 round. \n\n This is a mind-affecting effect. At 8th level the penalty increases to -4."
                }));
            }
            
            var xp = newChar.xp;
            {
                xp.total        = "9,000";
                xp.nextlevel    = "15,000";
            }
            
            var sp = newChar.spells;
            {
                sp.spellstats.zero.savedc = "14";
                sp.spellstats.zero.perday = "4";
                sp.spellstats.one.savedc = "15";
                sp.spellstats.one.perday = "3";
                sp.spellstats.one.bonus = "1";
                sp.spellstats.two.savedc = "16";
                sp.spellstats.two.perday = "1";
                sp.spellstats.two.bonus = "1";
                // Level 0
                sp.prepared.zero.push({"name": "Ray of Frost"});
                sp.prepared.zero.push({"name": "Prestidigitation"});
                sp.prepared.zero.push({"name": "Detect Magic"});
                sp.prepared.zero.push({"name": "Spark"});
                // Level 1
                sp.prepared.one.push({"name": "Shocking Grasp"});
                sp.prepared.one.push({"name": "Shocking Grasp"});
                sp.prepared.one.push({"name": "Frostbite"});
                sp.prepared.one.push({"name": "Mirror Strike"});
                // Level 2
                sp.prepared.two.push({"name": "Bladed Dash"});
                sp.prepared.two.push({"name": "Mirror Image"});
            }
        });
        
        return newChar;
    }
    return CurrentChar;
});