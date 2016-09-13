/*global csheetApp*/
/*global angular*/

csheetApp.factory("CurrentChar", function(Character, Attack, WeaponAbility, Data, Bonus, Feat, Ability) {
    function CurrentChar(loading) {
        var newChar = new Character(loading);
        
        newChar.onLoaded(function() {
            var cr = newChar.classrace;
            {
                cr.name         = "Hiro";
                cr.alignment    = "";
                cr.player       = "David";
                cr.classes.list.push("Musket Master Gunslinger");
                cr.levels.list.push("4");
                cr.race         = "Human";
                cr.size         = "Medium";
                cr.gender       = "";
                cr.deity        = "";
            }
            
            var st = newChar.stats;
            {
                st.str.score.inherent = "13";
                st.dex.score.inherent = "16";
                st.con.score.inherent = "14";
                st.int.score.inherent = "13";
                st.wis.score.inherent = "15";
                st.cha.score.inherent = "13";
                st.dex.score.racial = "2";
            }
            
            var hp = newChar.hitpoints;
            {
                hp.total_hp = "45";
            }
            
            var sd = newChar.speeds;
            {
                sd.base.ft = "30";
            }
            
            var sk = newChar.skills.list;
            {
                // Class skills
                sk.acrobatics.class_skill       = true;
                sk.bluff.class_skill            = true;
                sk.climb.class_skill            = true;
                sk.craft1.class_skill           = true;
                sk.craft2.class_skill           = true;
                sk.craft3.class_skill           = true;
                sk.handleanimal.class_skill     = true;
                sk.heal.class_skill             = true;
                sk.intimidate.class_skill       = true;
                sk.kengineering.class_skill     = true;
                sk.klocal.class_skill           = true;
                sk.perception.class_skill       = true;
                sk.profession1.class_skill      = true;
                sk.profession2.class_skill      = true;
                sk.ride.class_skill             = true;
                sk.sleightofhand.class_skill    = true;
                sk.survival.class_skill         = true;
                sk.swim.class_skill             = true;
                // Ranks - 5 x 4 = 20
                sk.acrobatics.ranks     = 4;
                sk.bluff.ranks          = 1;
                sk.climb.ranks          = 2;
                sk.perception.ranks     = 4;
                sk.sleightofhand.ranks  = 2;
                sk.heal.ranks           = 1;
                sk.intimidate.ranks     = 1;
                sk.kengineering.ranks   = 1;
                sk.klocal.ranks         = 1;
                sk.profession1.ranks    = 2;
                sk.profession1.subskill = "Sailor";
                sk.swim.ranks           = 1;
                sk.stealth.ranks        = 1;
                sk.stealth.misc         = 4; // Chains of Stealth - to dynamize later
            }
            
            var ini = newChar.initiative;
            {
                
            }
            
            var aci = newChar.acitems;
            {
                aci.list.push({
                    item: "+1 studded leather",
                    bonus: 4,
                    slot: "armor",
                    type: "Light",
                    check: 0,
                    spellfailure: 0.15,
                    weight: "",
                    properties: "",
                    maxdex: 5
                });
                aci.totals.armor = 4;
                aci.totals.bonus = 4;
                aci.totals.type = "Light";
                aci.totals.check = 0;
                aci.totals.spellfailure = 0.15;
                aci.totals.maxdex = 5;
            }
            var ac = newChar.armorclass;
            {
                
            }
            
            var ts = newChar.savingthrows;
            {
                ts.list.fortitude.base  = "+4";
                ts.list.reflex.base     = "+4";
                ts.list.will.base       = "+1";
                ts.mod = [];
            }
            
            var bab = newChar.baseattack;
            {
                bab.base = "+4";
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
                wg["cat_two_handed_firearm"].depend("atk_bonuses", new Data({
                    "proficient": new Bonus({"proficiency": 0})
                }), "proficient");
            }
            
            var ml = newChar.attacks.melee;
            var rn = newChar.attacks.ranged;
            {
                var cutlass = new Attack({
                    weapon: newChar.rulesets.weapons.list.cutlass.clone(true), 
                    ability: newChar.stats.str, 
                    bab: newChar.baseattack
                });
                cutlass.depend("dmgbonus", cutlass.ability, "ability_mod");
                cutlass.weapon.masterwork = true;
                ml.push(cutlass);
                
                var musket = new Attack({
                    weapon: newChar.rulesets.weapons.list.musket.clone(true), 
                    ability: newChar.stats.dex, 
                    bab: newChar.baseattack
                });
                musket.weapon.masterwork = true;
                rn.push(musket);
            }
            
            var ln = newChar.languages;
            {
                ln.push("Common");
                ln.push("Dwarven");
            }
            
            var gr = newChar.gear;
            {
                gr.items.push({
                    "name": "Far-Reaching Sight (on musket)",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Masterwork musket",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Beneficial Bandolier",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Rope, silk (50ft)",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Waterskin",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Sea rations 1 week",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Flint & steel",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Grappling hook",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Gunsmithing Kit",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Chains of Stealth +4",
                    "weight": ""
                });
                gr.money.gold = "500";
            }
            
            var ft = newChar.feats;
            {
                ft.push(new Feat({
                    type: "General",
                    name: "Gunsmithing",
                    prereqs: "",
                    description: "If you have access to a gunsmith's kit, you can create and restore firearms, craft bullets, and mix black powder for all types of firearms. You do not need to make a Craft check to create firearms and ammunition or to restore firearms."
                }));
                ft.push(new Feat({
                    type: "Combat",
                    name: "Rapid Reload (muskets)",
                    prereqs: "",
                    description: "The time required for you to reload your chosen type of weapon is reduced to a free action (for a hand or light crossbow), a move action (for heavy crossbow or one-handed firearm), or a standard action (two-handed firearm). Reloading a crossbow or firearm still provokes attacks of opportunity."
                }));
                ft.push(new Feat({
                    type: "Combat",
                    name: "Weapon Focus (musket)",
                    prereqs: "",
                    description: "You gain a +1 bonus on all attack rolls you make using the selected weapon.",
                    value: new Bonus({untyped: 1}),
                    rules: ["char.rulesets.weapons.list.musket.atk_bonuses dp this.value"]
                }));
                ft.push(new Feat({
                    type: "Combat",
                    name: "Point Blank Shot",
                    prereqs: "",
                    description: "You get a +1 bonus on attack and damage rolls with ranged weapons at ranges of up to 30 feet.",
                    value: new Data({
                        atk: new Bonus({untyped: 1}),
                        dmg: new Bonus({untyped: 1})
                    }),
                    rules: ["char.rulesets.weapons.groups.cat_ranged_projectile.atk_bonuses dp this.value.atk",
                            "char.rulesets.weapons.groups.cat_ranged_projectile.dmg_bonuses dp this.value.dmg",
                            "char.rulesets.weapons.groups.cat_ranged_thrown.atk_bonuses dp this.value.atk",
                            "char.rulesets.weapons.groups.cat_ranged_thrown.dmg_bonuses dp this.value.dmg",
                            "char.rulesets.weapons.groups.cat_one_handed_firearm.atk_bonuses dp this.value.atk",
                            "char.rulesets.weapons.groups.cat_one_handed_firearm.dmg_bonuses dp this.value.dmg",
                            "char.rulesets.weapons.groups.cat_two_handed_firearm.atk_bonuses dp this.value.atk",
                            "char.rulesets.weapons.groups.cat_two_handed_firearm.dmg_bonuses dp this.value.dmg"]
                }));
                ft.push(new Feat({
                    type: "Grit",
                    name: "Extra Grit",
                    prereqs: "",
                    description: "You gain 2 extra grit points at the start of each day, and your maximum grit increases by 2."
                }));
            }
            
            var ab = newChar.abilities;
            {
                ab.push(new Ability({
                    "type": "Ex",
                    "name": "Nimble +1",
                    "description": "Starting at 2nd level, a gunslinger gains a +1 dodge bonus to AC while wearing light or no armor. Anything that causes the gunslinger to lose her Dexterity bonus to AC also causes the gunslinger to lose this dodge bonus. This bonus increases by +1 for every four levels beyond 2nd level (to a maximum of +5 at 20th level).",
                    "uses": "Dodge bonus to AC"
                }));
                ab.push(new Ability({
                    "type": "Ex",
                    "name": "Grit",
                    "uses": "4/day OOOO"
                }));
                ab.push(new Ability({
                    "type": "Ex",
                    "name": "[Deed] Deadeye",
                    "description": "At 1st level, the gunslinger can resolve an attack against touch AC instead of normal AC when firing beyond her firearm's first range increment. Performing this deed costs 1 grit point per range increment beyond the first. The gunslinger still takes the -2 penalty on attack rolls for each range increment beyond the first when she performs this deed.",
                    "uses": "Costs 1 grit/range increment"
                }));
                ab.push(new Ability({
                    "type": "Ex",
                    "name": "[Deed] Steady Aim",
                    "description": "At 1st level, as long as a musket master has at least 1 grit point, she can take a move-equivalent action to increase the accuracy of a two-handed firearm. When she does, she increases the range increment of the firearm she is firing by 10 feet. This stacks with other abilities that increase her range increment.",
                    "uses": "Has 1 grit"
                }));
                ab.push(new Ability({
                    "type": "Ex",
                    "name": "[Deed] Quick Clear",
                    "description": "At 1st level, as a standard action, the gunslinger can remove the broken condition from a single firearm she is currently wielding, as long as that condition was gained by a firearm misfire. The gunslinger must have at least 1 grit point to perform this deed. Alternatively, if the gunslinger spends 1 grit point to perform this deed, she can perform quick clear as a move-equivalent action instead of a standard action.",
                    "uses": "Has 1 grit OR costs 1 grit"
                }));
                ab.push(new Ability({
                    "type": "Ex",
                    "name": "[Deed] Gunslinger Initiative",
                    "description": "At 3rd level, as long as the gunslinger has at least 1 grit point, she gains the following benefits. First, she gains a +2 bonus on initiative checks. Furthermore, if she has the Quick Draw feat, her hands are free and unrestrained, and the firearm is not hidden, she can draw a single firearm as part of the initiative check.",
                    "uses": "Has 1 grit"
                }));
                ab.push(new Ability({
                    "type": "Ex",
                    "name": "[Deed] Pistol Whip",
                    "description": "At 3rd level, the gunslinger can make a surprise melee attack with the butt or handle of her firearm as a standard action. When she does, she is considered to be proficient with the firearm as a melee weapon and gains a bonus on the attack and damage rolls equal to the enhancement bonus of the firearm. The damage dealt by the pistol-whip is of the bludgeoning type, and is determined by the size of the firearm. One-handed firearms deal 1d6 points of damage (1d4 if wielded by Small creatures) and two-handed firearms deal 1d10 points of damage (1d8 if wielded by Small creatures). Regardless of the gunslinger's size, the critical multiplier of this attack is 20/x2. If the attack hits, the gunslinger can make a combat maneuver check to knock the target prone as a free action. Performing this deed costs 1 grit point.",
                    "uses": "Costs 1 grit"
                }));
                ab.push(new Ability({
                    "type": "Ex",
                    "name": "[Deed] Fast Musket",
                    "description": "At 3rd level, as long as the musket master has 1 grit point, she can reload any two-handed firearm as if it were a one-handed firearm.",
                    "uses": "Has 1 grit"
                }));
                ab.push(new Ability({
                    "type": "Ex",
                    "name": "[Item] Far-Reaching Sight",
                    "description": "This sight can be attached to a single two-handed firearm. When this is done, the sight becomes part of the weapon, but can be removed from that weapon with a full-round action. A firearm wielder can choose to spend a full-round action to make a single shot with a firearm that has this sight. When she does, she can resolve the attack against the touch AC of her target regardless of the range increment.",
                    "uses": "Target touch at any range"
                }));
            }
            
            var xp = newChar.xp;
            {
                xp.total        = "9,000";
                xp.nextlevel    = "15,000";
            }
        });
        
        return newChar;
    }
    return CurrentChar;
});