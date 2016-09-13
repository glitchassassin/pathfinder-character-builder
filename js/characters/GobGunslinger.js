/*global csheetApp*/
/*global angular*/

csheetApp.factory("CurrentChar", function(Character, Attack, WeaponAbility, Data, Bonus, Feat, Ability) {
    function CurrentChar() {
        var newChar = new Character();
        
        newChar.onLoaded(function() {
            var cr = newChar.classrace;
            {
                cr.name         = "Shortstop";
                cr.alignment    = "";
                cr.player       = "";
                cr.classes.list.push("Gunslinger");
                cr.levels.list.push("1");
                cr.race         = "Goblin";
                cr.size         = "Small";
                cr.gender       = "";
                cr.deity        = "";
            }
            
            var st = newChar.stats;
            {
                st.str.score.inherent = 12;
                st.dex.score.inherent = 14;
                st.con.score.inherent = 14;
                st.int.score.inherent = 10;
                st.wis.score.inherent = 14;
                st.cha.score.inherent = 8;
                st.str.score.racial = -2;
                st.dex.score.racial = 4;
                st.cha.score.racial = -2;
            }
            
            var hp = newChar.hitpoints;
            {
                hp.total_hp = "13";
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
                // Ranks - 4
                sk.acrobatics.ranks     = 1;
                sk.craft1.ranks         = 1;
                sk.craft1.subskill      = "Alchemy";
                sk.intimidate.ranks     = 1;
                sk.perception.ranks     = 1;
            }
            
            var ini = newChar.initiative;
            {
                
            }
            
            var aci = newChar.acitems;
            {
                aci.list.push({
                    item: "studded leather",
                    bonus: 3,
                    slot: "armor",
                    type: "Light",
                    check: -1,
                    spellfailure: 0.15,
                    weight: "",
                    properties: "",
                    maxdex: 5
                });
                aci.totals.armor = 3;
                aci.totals.bonus = 3;
                aci.totals.type = "Light";
                aci.totals.check = -1;
                aci.totals.spellfailure = 0.15;
                aci.totals.maxdex = 5;
            }
            var ac = newChar.armorclass;
            {
                
            }
            
            var ts = newChar.savingthrows;
            {
                ts.list.fortitude.base  = "+2";
                ts.list.reflex.base     = "+2";
                ts.list.will.base       = "+0";
                ts.mod = [];
            }
            
            var bab = newChar.baseattack;
            {
                bab.base = "+1";
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
                wg["cat_one_handed_firearm"].depend("atk_bonuses", new Data({
                    "proficient": new Bonus({"proficiency": 0})
                }), "proficient");
            }
            
            var ml = newChar.attacks.melee;
            var rn = newChar.attacks.ranged;
            {
                var dogslicer = new Attack({
                    weapon: newChar.rulesets.weapons.list.dogslicer.clone(true), 
                    ability: newChar.stats.str, 
                    bab: newChar.baseattack
                });
                dogslicer.size = "Small";
                dogslicer.depend("dmgbonus", dogslicer.ability, "ability_mod");
                ml.push(dogslicer);
                
                var blunderbuss = new Attack({
                    weapon: newChar.rulesets.weapons.list.blunderbuss.clone(true), 
                    ability: newChar.stats.dex, 
                    bab: newChar.baseattack
                });
                rn.push(blunderbuss);
            }
            
            var ln = newChar.languages;
            {
                ln.push("Common");
                ln.push("Dwarven");
            }
            
            var gr = newChar.gear;
            {
                gr.items.push({
                    "name": "Battered blunderbuss",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Alchemical cartridges (20)",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Dogslicer",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Flint & steel",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Scraps of paper",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Bits of metal",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Pouch of metal bits",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Potion of cure light wounds (2)",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Stringy snake jerky",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Small flask of \"swamp water\"",
                    "weight": ""
                });
                gr.items.push({
                    "name": "String of shiny glass beads",
                    "weight": ""
                });
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
                    name: "Goblin Gunslinger",
                    prereqs: "Goblin",
                    description: "You can wield Medium firearms without taking the penalty for an inappropriately sized weapon."
                }));
            }
            
            var ab = newChar.abilities;
            {
                ab.push(new Ability({
                    "type": "Ex",
                    "name": "Grit",
                    "uses": "2/day",
                    "description": "Grit is a fluctuating measure of a gunslinger's ability to perform amazing actions in combat. At the start of each day, a gunslinger gains a number of grit points equal to her Wisdom modifier (minimum 1). Her grit goes up or down throughout the day, but usually cannot go higher than her Wisdom modifier (minimum 1), though some feats and magic items may affect this maximum."
                }));
                ab.push(new Ability({
                    "type": "Ex",
                    "name": "[Deed] Deadeye",
                    "description": "At 1st level, the gunslinger can resolve an attack against touch AC instead of normal AC when firing beyond her firearm's first range increment. Performing this deed costs 1 grit point per range increment beyond the first. The gunslinger still takes the -2 penalty on attack rolls for each range increment beyond the first when she performs this deed.",
                    "uses": "Costs 1 grit/range increment"
                }));
                ab.push(new Ability({
                    "type": "Ex",
                    "name": "[Deed] Gunslinger's Dodge",
                    "description": "At 1st level, the gunslinger gains an uncanny knack for getting out of the way of ranged attacks. When a ranged attack is made against the gunslinger, she can spend 1 grit point to move 5 feet as an immediate action; doing so grants the gunslinger a +2 bonus to AC against the triggering attack. This movement is not a 5-foot step, and provokes attacks of opportunity. Alternatively, the gunslinger can drop prone to gain a +4 bonus to AC against the triggering attack. The gunslinger can only perform this deed while wearing medium or light armor, and while carrying no more than a light load.",
                    "uses": "Costs 1 grit"
                }));
                ab.push(new Ability({
                    "type": "Ex",
                    "name": "[Deed] Quick Clear",
                    "description": "At 1st level, as a standard action, the gunslinger can remove the broken condition from a single firearm she is currently wielding, as long as that condition was gained by a firearm misfire. The gunslinger must have at least 1 grit point to perform this deed. Alternatively, if the gunslinger spends 1 grit point to perform this deed, she can perform quick clear as a move-equivalent action instead of a standard action.",
                    "uses": "Has 1 grit OR costs 1 grit"
                }));
            }
            
            var xp = newChar.xp;
            {
                xp.total        = "0";
                xp.nextlevel    = "2,000";
            }
        });
        
        return newChar;
    }
    return CurrentChar;
});