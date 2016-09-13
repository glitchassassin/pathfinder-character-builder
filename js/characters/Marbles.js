/*global csheetApp*/
/*global angular*/

csheetApp.factory("CurrentChar", function(Character, Attack, WeaponAbility, Data, Bonus, Feat, Ability, Weapon) {
    function CurrentChar(loading) {
        var newChar = new Character(loading);
        newChar.onLoaded(function() {
            var cr = newChar.classrace;
            {
                cr.name                         = "Marbles";
                cr.alignment                    = "";
                cr.player                       = "Jon";
                cr.class_levels.favored_class   = "kineticist";
                cr.class_levels.addLevelOfClass({
                    class_id: "kineticist", 
                    rolled_hp: 8,
                    favored_class_selection: "hp"
                });
                cr.class_levels.addLevelOfClass({
                    class_id: "kineticist", 
                    rolled_hp: 7,
                    favored_class_selection: "hp"
                });
                cr.race                         = "Gnome";
                cr.size                         = "Small";
                cr.gender                       = "";
                cr.deity                        = "";
            }
            
            var st = newChar.stats;
            {
                st.str.score.inherent = 14;
                st.dex.score.inherent = 15;
                st.con.score.inherent = 17;
                st.int.score.inherent = 13;
                st.wis.score.inherent = 14;
                st.cha.score.inherent = 11;
                st.con.score.racial = 2;
                st.cha.score.racial = 2;
                st.str.score.racial = -2;
            }
            
            var sd = newChar.speeds;
            {
                sd.base.ft = "20";
            }
            
            var sk = newChar.skills.list;
            {
                /*
                // Class skills
                sk.acrobatics.class_skill       = true;
                sk.craft1.class_skill           = true;
                sk.craft2.class_skill           = true;
                sk.craft3.class_skill           = true;
                sk.escapeartist.class_skill     = true;
                sk.heal.class_skill             = true;
                sk.intimidate.class_skill       = true;
                sk.kengineering.class_skill     = true;
                sk.perception.class_skill       = true;
                sk.profession1.class_skill      = true;
                sk.profession2.class_skill      = true;
                sk.sensemotive.class_skill      = true;
                sk.sleightofhand.class_skill    = true;
                sk.stealth.class_skill          = true;
                sk.usemagicdevice.class_skill   = true;
                */
                // Ranks - 5 x 4 = 20
                sk.acrobatics.ranks     = 2;
                sk.escapeartist.ranks   = 1;
                sk.perception.ranks     = 2;
                sk.sleightofhand.ranks  = 2;
                sk.kengineering.ranks   = 1;
                sk.stealth.ranks        = 2;
                sk.kengineering.misc    = 2; // Racial
            }
            
            var aci = newChar.acitems;
            {
                
            }
            
            var wl = newChar.rulesets.weapons.list;
            var rn = newChar.attacks.ranged;
            {
                var aether_blast = new Attack({
                    weapon: wl["aether-blast"].clone(true).setup(newChar.rulesets.weapons.groups),
                    bab: newChar.baseattack
                });
                aether_blast.depend("dmgbonus", new Data({"physical_blast": 1}), "physical_blast");
                rn.push(aether_blast);
            }
            
            var ln = newChar.languages;
            {
                ln.push("Common");
                ln.push("Gnome");
                ln.push("Sylvan");
            }
            
            var gr = newChar.gear;
            {
                gr.items.push({
                    "name": "A sack of marbles",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Some worthless gemstones",
                    "weight": ""
                });
                gr.items.push({
                    "name": "A glass bottle of water",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Darkened fire elemental shards",
                    "weight": "2"
                });
            }
            
            var ft = newChar.feats;
            var fl = newChar.rulesets.feats.list;
            {
                ft.list.push(ft.newFeatSlot())
                ft.addFeat(fl["toughness"]);
            }
            
            var ab = newChar.abilities;
            var kineticist = newChar.rulesets.classes.list.kineticist;
            {
                ab.___.list.refresh(); // Hack to make sure the abilities list is up-to-date when this runs
                newChar.___.abilities.refresh();
                ab.getAbility("kineticist-elemental-focus").elemental_focus.assignSlot(kineticist.getAbility("kineticist-elemental-focus-aether"));
                //ab.getAbility("kineticist-infusion").infusion.assignSlot(abl["kineticist-infusion-extended-range"]);
            }
            
            var sp = newChar.spells;
            {
                sp.spellstats.zero.savedc = "13";
                sp.spellstats.zero.perday = "";
                sp.spellstats.one.savedc = "14";
                sp.spellstats.one.perday = "";
                sp.spellstats.one.bonus = "";
                // Level 0
                sp.prepared.zero.push({"name": "Bleed"});
                sp.prepared.zero.push({"name": "Touch of Fatigue"});
                sp.prepared.zero.push({"name": "Detect Poison"});
                // Level 1
                sp.prepared.one.push({"name": "Chill Touch"});
            }
            
            var xp = newChar.xp;
            {
                xp.total        = "3,405";
                xp.nextlevel    = "5,000";
            }
        });
        
        return newChar;
    }
    return CurrentChar;
});