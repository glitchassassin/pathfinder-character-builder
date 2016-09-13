csheetApp.factory("CurrentChar", function(Character, Attack, WeaponAbility, Data, Bonus, Feat, Ability) {
    function CurrentChar(loading) {
        var newChar = new Character(loading);
        
        newChar.onLoaded(function() {
            var cr = newChar.classrace;
            {
                cr.name         = "Blair Cliff";
                cr.alignment    = "NG";
                cr.player       = "Eileen";
                cr.classes.list.push("Warpriest");
                cr.levels.list.push("4");
                cr.race         = "Half-elf";
                cr.size         = "Medium";
                cr.gender       = "Female";
                cr.deity        = "Tymora";
            }
            
            var st = newChar.stats;
            {
                st.str.score.inherent = 15;
                st.dex.score.inherent = 18;
                st.con.score.inherent = 15;
                st.int.score.inherent = 14;
                st.wis.score.inherent = 17;
                st.cha.score.inherent = 13;
                st.dex.score.racial = 2;
                
                // 4th level bonus
                st.str.score.inherent += 1;
            }
            
            var hp = newChar.hitpoints;
            {
                hp.total_hp = "26";
            }
            
            var sd = newChar.speeds;
            {
                sd.base.ft = "30";
                sd.armor.ft = "20";
            }
            
            var sk = newChar.skills.list;
            {
                // Class skills
                sk.climb.class_skill            = true;
                sk.craft1.class_skill           = true;
                sk.craft2.class_skill           = true;
                sk.craft3.class_skill           = true;
                sk.diplomacy.class_skill        = true;
                sk.handleanimal.class_skill     = true;
                sk.heal.class_skill             = true;
                sk.intimidate.class_skill       = true;
                sk.kengineering.class_skill     = true;
                sk.kreligion.class_skill        = true;
                sk.profession1.class_skill      = true;
                sk.profession2.class_skill      = true;
                sk.ride.class_skill             = true;
                sk.sensemotive.class_skill      = true;
                sk.spellcraft.class_skill       = true;
                sk.survival.class_skill         = true;
                sk.swim.class_skill             = true;
                // Ranks
                sk.diplomacy.ranks      = 1;
                sk.heal.ranks           = 3;
                sk.intimidate.ranks     = 1;
                sk.kengineering.ranks   = 1;
                sk.kreligion.ranks      = 1;
                sk.perception.ranks     = 3;
                sk.sensemotive.ranks    = 1;
                sk.spellcraft.ranks     = 1;
                // Misc
                sk.perception.misc   = 2;
            }
            
            var aci = newChar.acitems;
            {
                aci.list.push({
                    item: "Mwk Full Plate",
                    bonus: 9,
                    slot: "armor",
                    type: "Heavy",
                    check: -5,
                    spellfailure: 0.75,
                    weight: "",
                    properties: "",
                    maxdex: 1
                });
                aci.list.push({
                    item: "+1 Buckler",
                    bonus: 2,
                    slot: "shield",
                    type: "Shield",
                    check: 0,
                    spellfailure: 0.15,
                    weight: "",
                    properties: ""
                });
                aci.totals.armor = 9;
                aci.totals.shield = 2;
                aci.totals.bonus = 11;
                aci.totals.type = "Heavy";
                aci.totals.check = -5;
                aci.totals.spellfailure = 0.9;
                aci.totals.maxdex = 1;
            }
            
            var ts = newChar.savingthrows;
            {
                ts.list.fortitude.base  = 4;
                ts.list.reflex.base     = 1;
                ts.list.will.base       = 4;
                ts.mod = ["immune sleep","+2 vs ench"];
            }
            
            var bab = newChar.baseattack;
            {
                bab.base = 3;
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
                wg["prof_early_firearms"].depend("atk_bonuses", new Data({
                    "proficient": new Bonus({"proficiency": 0})
                }), "proficient");
            }
            
            var ml = newChar.attacks.melee;
            var rn = newChar.attacks.ranged;
            {
                var longsword = new Attack({
                    weapon: wl.longsword.clone(true),
                    bab: newChar.baseattack
                });
                longsword.weapon.atk_bonuses.depend("enhancement", new Data({enhancement: 1}), "enhancement");
                longsword.weapon.dmg_bonuses.depend("enhancement", new Data({enhancement: 1}), "enhancement");
                longsword.weapon.masterwork = true;
                ml.push(longsword);
                
                var musket = new Attack({
                    weapon: wl.musket.clone(true),
                    bab: newChar.baseattack
                });
                musket.weapon.masterwork = true;
                rn.push(musket);
            }
            
            var ln = newChar.languages;
            {
                ln.push("Common");
                ln.push("Elven");
                ln.push("[2 more]");
            }
            
            var gr = newChar.gear;
            {
                gr.items.push({
                    "name": "Beneficial Bandolier",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Wand (Cure Light) [32]",
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
                    "name": "Flint & steel",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Grappling hook",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Blankets",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Trail rations 1 week",
                    "weight": ""
                });
                gr.items.push({
                    "name": "Horse (light)",
                    "weight": ""
                });
                gr.money.gold = "303";
            }
            
            var ft = newChar.feats;
            {
                ft.push(new Feat({
                    "type": "Combat",
                    "name": "Amateur Gunslinger",
                    "prereqs": "You have no levels in a class that has the grit class feature.",
                    "description": "You gain a small amount of grit and the ability to perform a single 1st-level deed from the gunslinger deed class feature. \n\n At the start of the day, you gain 1 grit point, though throughout the day you can gain grit points up to a maximum of your Wisdom modifier (minimum 1). You can regain grit using the rules for the gunslinger’s grit class feature. \n\n You can spend this grit to perform the 1st-level deed you chose upon taking this feat, and any other deed you have gained through feats or magic items."
                }));
                ft.push(new Feat({
                    "type": "General",
                    "name": "Gunsmithing",
                    "prereqs": "",
                    "description": "If you have access to a gunsmith's kit, you can create and restore firearms, craft bullets, and mix black powder for all types of firearms. You do not need to make a Craft check to create firearms and ammunition or to restore firearms."
                }));
                ft.push(new Feat({
                    "type": "Combat",
                    "name": "Point-Blank Shot",
                    "prereqs": "",
                    "value": new Bonus({untyped: 1}),
                    "description": "You get a +1 bonus on attack and damage rolls with ranged weapons at ranges of up to 30 feet.",
                    "rules": ["char.rulesets.weapons.groups.cat_ranged_projectile.atk_bonuses dp this.value",
                              "char.rulesets.weapons.groups.cat_ranged_projectile.dmg_bonuses dp this.value",
                              "char.rulesets.weapons.groups.cat_ranged_thrown.atk_bonuses dp this.value",
                              "char.rulesets.weapons.groups.cat_ranged_thrown.dmg_bonuses dp this.value",
                              "char.rulesets.weapons.groups.cat_two_handed_firearm.atk_bonuses dp this.value",
                              "char.rulesets.weapons.groups.cat_two_handed_firearm.dmg_bonuses dp this.value",
                              "char.rulesets.weapons.groups.cat_one_handed_firearm.atk_bonuses dp this.value",
                              "char.rulesets.weapons.groups.cat_one_handed_firearm.dmg_bonuses dp this.value",]
                }));
                ft.push(new Feat({
                    "type": "Combat",
                    "name": "Weapon Focus (musket)",
                    "prereqs": "",
                    "value": new Bonus({untyped: 1}),
                    "description": "You gain a +1 bonus on all attack rolls you make using the selected weapon.",
                    "rules": ["char.rulesets.weapons.list.musket.atk_bonuses dp this.value"]
                }));
            }
            
            var ab = newChar.abilities;
            {
                ab.push(new Ability({
                    "type": "Su",
                    "name": "Fervor [1d6]",
                    "uses": "5/day OOOOO",
                    "description": "At 2nd level, a warpriest can draw upon the power of his faith to heal wounds or harm foes. He can also use this ability to quickly cast spells that aid in his struggles. This ability can be used a number of times per day equal to 1/2 his warpriest level + his Wisdom modifier. By expending one use of this ability, a good warpriest (or one who worships a good deity) can touch a creature to heal it of 1d6 points of damage, plus an additional 1d6 points of damage for every 3 warpriest levels he possesses above 2nd (to a maximum of 7d6 at 20th level). Using this ability is a standard action (unless the warpriest targets himself, in which case it's a swift action). Alternatively, the warpriest can use this ability to harm an undead creature, dealing the same amount of damage he would otherwise heal with a melee touch attack. Using fervor in this way is a standard action that provokes an attack of opportunity. Undead do not receive a saving throw against this damage. This counts as positive energy.\n\nAn evil warpriest (or one who worships an evil deity) can use this ability to instead deal damage to living creatures with a melee touch attack and heal undead creatures with a touch. This counts as negative energy.\n\nA neutral warpriest who worships a neutral deity (or one who is not devoted to a particular deity) uses this ability as a good warpriest if he chose to spontaneously cast cure spells or as an evil warpriest if he chose to spontaneously cast inflict spells.\n\nAs a swift action, a warpriest can expend one use of this ability to cast any one warpriest spell he has prepared with a casting time of 1 round or shorter. When cast in this way, the spell can target only the warpriest, even if it could normally affect other or multiple targets. Spells cast in this way ignore somatic components and do not provoke attacks of opportunity. The warpriest does not need to have a free hand to cast a spell in this way."
                }));
                ab.push(new Ability({
                    "type": "Ex",
                    "name": "Grit",
                    "uses": "3/day OOO",
                    "description": "A gunslinger makes her mark upon the world with daring deeds. Some gunslingers claim they belong to a mystical way of the gun, but it’s more likely that the volatile nature of firearms simply prunes the unlucky and careless from their ranks. Whatever the reason, all gunslingers have grit. In game terms, grit is a fluctuating measure of a gunslinger’s ability to perform amazing actions in combat. At the start of each day, a gunslinger gains a number of grit points equal to her Wisdom modifier (minimum 1). Her grit goes up or down throughout the day, but usually cannot go higher than her Wisdom modifier (minimum 1), though some feats and magic items may affect this maximum. A gunslinger spends grit to accomplish deeds (see below), and regains grit in the following ways.\n\nCritical Hit with a Firearm: Each time the gunslinger confirms a critical hit with a firearm attack while in the heat of combat, she regains 1 grit point. Confirming a critical hit on a helpless or unaware creature or on a creature that has fewer Hit Dice than half the gunslinger’s character level does not restore grit.\n\nKilling Blow with a Firearm: When the gunslinger reduces a creature to 0 or fewer hit points with a firearm attack while in the heat of combat, she regains 1 grit point. Destroying an unattended object, reducing a helpless or unaware creature to 0 or fewer hit points, or reducing a creature that has fewer Hit Dice than half the gunslinger’s character level to 0 or fewer hit points does not restore any grit."
                }));
                ab.push(new Ability({
                    "type": "Su",
                    "name": "Blessings [Minor]",
                    "uses": "4/day OOOO",
                    "description": "A warpriest's deity influences his alignment, what magic he can perform, his values, and how others see him. Each warpriest can select two blessings from among those granted by his deity (each deity grants the blessings tied to its domains). A warpriest can select an alignment blessing (Chaos, Evil, Good, or Law) only if his alignment matches that domain. If a warpriest isn't devoted to a particular deity, he still selects two blessings to represent his spiritual inclinations and abilities, subject to GM approval. The restriction on alignment domains still applies.\n\nEach blessing grants a minor power at 1st level and a major power at 10th level. A warpriest can call upon the power of his blessings a number of times per day (in any combination) equal to 3 + 1/2 his warpriest level (to a maximum of 13 times per day at 20th level). Each time he calls upon any one of his blessings, it counts against his daily limit. The save DC for these blessings is equal to 10 + 1/2 the warpriest's level + the warpriest's Wisdom modifier.\n\nIf a warpriest also has levels in a class that grants cleric domains, the blessings chosen must match the domains selected by that class. Subject to GM discretion, the warpriest can change his former blessings or domains to make them conform."
                }));
                ab.push(new Ability({
                    "type": "Su",
                    "name": "Minor: Protection",
                    "description": "At 1st level, you can gain a +1 sacred bonus on saving throws and a +1 sacred bonus to AC for 1 minute. The bonus increases to +2 at 10th level and +3 at 20th level."
                }));
                ab.push(new Ability({
                    "type": "Su",
                    "name": "Minor: Luck",
                    "description": "At 1st level, you can touch an ally and grant it a lucky presence. The target of this luck can call upon it to roll any one ability check, attack roll, saving throw, or skill check twice and take the better result. The decision to use this ability must be made before the roll is made. Once used, or once 1 minute passes, the effect ends."
                }));
                ab.push(new Ability({
                    "type": "Su",
                    "name": "Sacred Weapon +1",
                    "uses": "4/day OOOO",
                    "description": "At 4th level, the warpriest gains the ability to enhance one of his sacred weapons with divine power as a swift action. This power grants the weapon a +1 enhancement bonus. For every 4 levels beyond 4th, this bonus increases by 1 (to a maximum of +5 at 20th level). If the warpriest has more than one sacred weapon, he can enhance another on the following round by using another swift action. The warpriest can use this ability a number of rounds per day equal to his warpriest level, but these rounds need not be consecutive. \n\n These bonuses stack with any existing bonuses the weapon might have, to a maximum of +5. The warpriest can enhance a weapon with any of the following weapon special abilities: brilliant energy, defending, disruption, flaming, frost, keen, and shock. In addition, if the warpriest is chaotic, he can add anarchic and vicious. If he is evil, he can add mighty cleaving and unholy. If he is good, he can add ghost touch and holy. If he is lawful, he can add axiomatic and merciful. If he is neutral (with no other alignment components), he can add spell storing and thundering. Adding any of these special abilities replaces an amount of bonus equal to the special ability's base cost. Duplicate abilities do not stack. The weapon must have at least a +1 enhancement bonus before any other special abilities can be added. \n\n If multiple weapons are enhanced, each one consumes rounds of use individually. The enhancement bonus and special abilities are determined the first time the ability is used each day, and cannot be changed until the next day. These bonuses do not apply if another creature is wielding the weapon, but they continue to be in effect if the weapon otherwise leaves the warpriest's possession (such as if the weapon is thrown). This ability can be ended as a free action at the start of the warpriest's turn (that round does not count against the total duration, unless the ability is resumed during the same round). If the warpriest uses this ability on a double weapon, the effects apply to only one end of the weapon."
                }));
                ab.push(new Ability({
                    "type": "Su",
                    "name": "Channel Energy",
                    "uses": "Costs 2 Fervor",
                    "description": "Starting at 4th level, a warpriest can release a wave of energy by channeling the power of his faith through his holy (or unholy) symbol. This energy can be used to deal or heal damage, depending on the type of energy channeled and the creatures targeted. Using this ability is a standard action that expends two uses of his fervor ability and doesn't provoke an attack of opportunity. The warpriest must present a holy (or unholy) symbol to use this ability. A good warpriest (or one who worships a good deity) channels positive energy and can choose to heal living creatures or to deal damage to undead creatures. An evil cleric (or one who worships an evil deity) channels negative energy and can choose to deal damage to living creatures or heal undead creatures. A neutral cleric who worships a neutral deity (or one who is not devoted to a particular deity) channels positive energy if he chose to spontaneously cast cure spells or negative energy if he chose to spontaneously cast inflict spells. \n\n Channeling energy causes a burst that affects all creatures of one type (either undead or living) in a 30-foot radius centered on the warpriest. The amount of damage dealt or healed is equal to the amount listed in the fervor ability. Creatures that take damage from channeled energy must succeed at a Will saving throw to halve the damage. The save DC is 10 + 1/2 the warpriest's level + the warpriest's Wisdom modifier. Creatures healed by channeled energy cannot exceed their maximum hit point total-all excess healing is lost. A warpriest can choose whether or not to include himself in this effect."
                }));
            }
            
            var xp = newChar.xp;
            {
                xp.total        = "9,000";
                xp.nextlevel    = "15,000";
            }
            
            var sp = newChar.spells;
            {
                sp.spellstats.zero.savedc = "13";
                sp.spellstats.zero.perday = "4";
                sp.spellstats.one.savedc = "14";
                sp.spellstats.one.perday = "3";
                sp.spellstats.one.bonus = "1";
                sp.spellstats.two.savedc = "15";
                sp.spellstats.two.perday = "1";
                sp.spellstats.two.bonus = "1";
                // Level 0
                sp.prepared.zero.push({"name": "Create Water"});
                sp.prepared.zero.push({"name": "Detect Magic"});
                sp.prepared.zero.push({"name": "Guidance"});
                sp.prepared.zero.push({"name": "Light"});
                // Level 1
                sp.prepared.one.push({"name": "Bless"});
                sp.prepared.one.push({"name": "Cure Light Wounds"});
                sp.prepared.one.push({"name": "Divine Favor"});
                sp.prepared.one.push({"name": "Protection from Evil"});
                // Level 2
                sp.prepared.two.push({"name": "Silence"});
                sp.prepared.two.push({"name": "Summon Monster II"});
            }
        });
        
        return newChar;
    }
    return CurrentChar;
});