/*global csheetApp*/
/*global angular*/

csheetApp.factory("CurrentChar", function(Character, Attack, WeaponAbility, Data, Bonus, Feat, Ability, Weapon) {
    function CurrentChar(loading) {
        loading.status = "Setting up empty character...";
        var newChar = Character;
        newChar.onLoaded(function() {
            loading.status = "Restoring character details...";
            var cr = newChar.classrace;
            {
                cr.name                         = "Sir Mildred";
                cr.alignment                    = "LG";
                cr.player                       = "Jon";
                cr.class_levels.favored_class   = "paladin";
                cr.class_levels.addLevelOfClass({
                    class_id: "paladin", 
                    rolled_hp: 10,
                    favored_class_selection: "hp"
                }, newChar);
                cr.race                         = "Human";
                cr.size                         = "Medium";
                cr.gender                       = "";
                cr.deity                        = "";
                
                newChar.feats.depend("list", new Data({
                    "racialBonusFeat": newChar.feats.newFeatSlot()
                }), "racialBonusFeat");
            }
            
            var st = newChar.stats;
            {
                st.str.score.inherent = 18;
                st.dex.score.inherent = 11;
                st.con.score.inherent = 15;
                st.int.score.inherent = 7;
                st.wis.score.inherent = 12;
                st.cha.score.inherent = 16;
                st.str.score.racial = 2;
            }
            
            var sd = newChar.speeds;
            {
                sd.base.ft = "30";
            }
            
            var sk = newChar.skills.list;
            {
                // Ranks - 2 x 1 = 2
                sk.diplomacy.ranks      = 1;
                sk.handleanimal.ranks   = 1;
            }
            
            var ln = newChar.languages;
            {
                ln.push("Common");
            }
            
            // Feats
            
            var ft = newChar.feats;
            var fl = newChar.rulesets.feats.list;
            {
                console.log(newChar.baseattack.base)
                ft.addFeat(fl["power-attack"]);
                ft.addFeat(fl["weapon-focus"], {weapon: newChar.rulesets.weapons.list["greataxe"]});
            }
            
            // Gear
            
            var aci = newChar.acitems;
            {
                var chainmail = newChar.rulesets.armors.list["chainmail"].clone(false).setup(newChar.rulesets.armors.groups)
                
                aci.list.push(chainmail)
            }
            
            var wl = newChar.rulesets.weapons.list;
            var ml = newChar.attacks.melee;
            {
                var greataxe = new Attack({
                    weapon: wl["greataxe"].clone(true).setup(newChar.rulesets.weapons.groups),
                    bab: newChar.baseattack,
                    acitems: newChar.acitems
                });
                greataxe.masterwork = false;
                ml.push(greataxe);
            }
            var rn = newChar.attacks.ranged;
            {
                var throwingaxe = new Attack({
                    weapon: wl["axe-throwing"].clone(true).setup(newChar.rulesets.weapons.groups),
                    bab: newChar.baseattack,
                    acitems: newChar.acitems
                });
                var lighthammer = new Attack({
                    weapon: wl["hammer-light"].clone(true).setup(newChar.rulesets.weapons.groups),
                    bab: newChar.baseattack,
                    acitems: newChar.acitems
                });
                rn.push(throwingaxe);
                rn.push(lighthammer);
            }
            
            var gr = newChar.gear;
            {
                gr.items.push({
                    "name": "Backpack",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Traveler's Outfit",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Waterskin",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Rations (2 days)",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Torches (x10)",
                    "weight": ""
                });
                gr.items.push({
                    "name": "50-ft rope",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Canvas (20 sq yd)",
                    "weight": ""
                });
                gr.money.gold = 5
                gr.money.silver = 9
            }
            
            var xp = newChar.xp;
            {
                xp.total        = "0";
                xp.nextlevel    = "1,300";
            }
        });
        
        return newChar;
    }
    return CurrentChar;
});