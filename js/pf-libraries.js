/*global angular*/
/*global cdebug*/
/*global csheetApp*/
/*global CurrentChar*/
csheetApp.factory("Weapon", function(Data, Bonus) {
    /**
     * Weapon describes an actual weapon (i.e., a longsword). This may be a 
     * template object in the Weapons library, or it may be an instantiated (and 
     * customized) object in the character's Gear.
     * 
     * @class Weapon
     * @param {Object} [template] - Template object to copy properties from
     * @param {Object} [updaters] - List of custom updater functions to apply to corresponding properties in template object (property names must match)
     * @param {Object} [dependencies] - List of arrays of dependency links to establish (property names must match)
     **/
    function Weapon(template, updaters, dependencies) {
        /**
         * Calculated prefix of the description (e.g., "flaming holy")
         * 
         * @name Weapon#prefix
         * @type String
         **/
        /**
         * The base name of the weapon (e.g., "longsword")
         * 
         * @name Weapon#name
         * @type String
         **/
        /**
         * The base cost of the weapon, in gp
         * 
         * @name Weapon#cost
         * @type Number
         **/
        /**
         * Numerical bonuses or penalties associated with the weapon (including 
         * enhancement, masterwork, and proficiency)
         * 
         * @name Weapon#bonuses
         * @type {Bonus}
         **/
        /**
         * Base damage for a medium-sized weapon
         * 
         * @name Weapon#med_base_dmg
         * @type String
         **/
        var Wpn = {
            prefix: "",
            name: "",
            cost: 0,
            atk_bonuses: new Bonus({
                proficiency: -4, // Non-proficiency penalty
                enhancement: 0,
                masterwork: 0
            }),
            med_base_dmg: "",
            dmg_bonuses: 0,
            abilities: [],
            atk_ability: new Bonus(),
            dmg_ability: new Bonus(),
            base_dmg: "",
            critical: "",
            range: "",
            misfire: "",
            capacity: "",
            weight: 0,
            type: "",
            special: [],
            source: "",
            category: "",
            proficiency: "",
            masterwork: false,
            enhancement: new Bonus(),
            touch: false,
            size: "Medium",
            dmg_scaling: "size"
        };
        
        var WpnUpdaters = {
            base_dmg: function(deps) {
                var size = "medium";
                var med_base_dmg = "";
                var scaling = "size";
                
                var sizes = ["medium", "small", "tiny", "large"];
                var scaling_types = ["size", "level"]
                var size_chart = {
                    "1d2":  {tiny: "0",    small: "1",    medium: "1d2",  large:"1d3"},
                    "1d3":  {tiny: "1",    small: "1d2",  medium: "1d3",  large:"1d4"},
                    "1d4":  {tiny: "1d2",  small: "1d3",  medium: "1d4",  large:"1d6"},
                    "1d6":  {tiny: "1d3",  small: "1d4",  medium: "1d6",  large:"1d8"},
                    "1d8":  {tiny: "1d4",  small: "1d6",  medium: "1d8",  large:"2d6"},
                    "1d10": {tiny: "1d6",  small: "1d8",  medium: "1d10", large:"2d8"},
                    "1d12": {tiny: "1d8",  small: "1d10", medium: "1d12", large:"3d6"},
                    "2d4":  {tiny: "1d4",  small: "1d6",  medium: "2d4",  large:"2d6"},
                    "2d6":  {tiny: "1d8",  small: "1d10", medium: "2d6",  large:"3d6"},
                    "2d8":  {tiny: "1d10", small: "2d6",  medium: "2d8",  large:"3d8"},
                    "2d10": {tiny: "2d6",  small: "2d8",  medium: "2d10", large:"4d8"}
                }
                for (var key in deps) {
                    var dep = deps[key];
                    if (typeof dep == "string") {
                        dep = dep.toLowerCase();
                        if (Object.keys(size_chart).indexOf(dep) != -1) {
                            var med_base_dmg = dep;
                        }
                        else if (dep in scaling_types) {
                            var scaling = dep;
                        }
                        else if (sizes.indexOf(dep) != -1) {
                            var size = dep;
                        }
                    }
                    else {
                        console.log(deps);
                        console.log("Expected string: ", dep)
                    }
                }
                if (size && med_base_dmg && scaling == "size") {
                    return size_chart[med_base_dmg][size];
                }
                else if (med_base_dmg && scaling == "level"){
                    // TODO: Once we implement levels, this will need to vary
                    // by level. Until then, it's stuck here.
                    return med_base_dmg;
                }
                else {
                    return "-";
                }
            },
            prefix: function(deps) {
                var prefixes = [];
                for (var i = 0; i < deps.length; i++) {
                    if (typeof deps[i] === "string" && deps[i].trim() !== "") { 
                        prefixes.push(deps[i]); 
                    }
                }
                return prefixes.sort().join("/");
                /*
                var prefixes = [];
                for (var i = 0; i < deps.length; i++) {
                    if (typeof deps[i] == "object" && deps[i] !== null && "prefix" in deps[i] && typeof deps[i].prefix == "string") {
                        prefixes.push(deps[i].prefix.toLowerCase());
                    }
                }
                prefixes.sort();
                return prefixes.join(" ");
                */
            },
            atk_bonuses: function(deps) {
                var base = new Bonus({
                    proficiency: -4, // Non-proficiency penalty
                    enhancement: 0,
                    masterwork: 0
                });
                for (var i = 0; i < deps.length; i++) {
                    if (typeof deps[i] == "object" && deps[i] !== null) {
                        if ("add" in deps[i]) {
                            base = base.add(deps[i]);
                        }
                    }
                    else if (typeof deps[i] === "boolean") {
                        base = base.add(new Bonus({
                            masterwork: (deps[i]? 1 : 0)
                        }));
                    }
                }
                return base;
            }
        }
        angular.extend(Wpn, template);
        angular.extend(WpnUpdaters, updaters);
        
        Data.call(this, Wpn, WpnUpdaters, dependencies);
        
        // Create name for object automatically from weapon name
        this.dataName = "weapon|" + this.name.toLowerCase();
        this.dependBatch({
            "base_dmg":     [{obj: this, property: "med_base_dmg"},
                             {obj: this, property: "size"}],
            "prefix":       [{obj: this, property: "abilities"}],
            "dmg_bonuses":  [{obj: this, property: "enhancement"},
                             {obj: this, property: "dmg_ability"}],
            "atk_bonuses":  [{obj: this, property: "masterwork"},
                             {obj: this, property: "enhancement"},
                             {obj: this, property: "atk_ability"}],
        });
    }
    
    // Inheritance from Data:
    Weapon.prototype = Object.create(Data.prototype);
    Weapon.prototype.constructor = Weapon;
    
    
    /**
     * The Setup function establishes links for the weapon to its respective groups, 
     * but only when called. 
     * */
    Weapon.prototype.setup = function(wlgroups) {
        for (var g in this.groups) {
            var group = this.groups[g];
            this.depend("atk_bonuses", wlgroups[g], "atk_bonuses");
            this.depend("dmg_bonuses", wlgroups[g], "dmg_bonuses");
        }
        return this;
    }
    
    return Weapon;
});

csheetApp.factory("WeaponGroup", function(Data, Bonus) {
    /**
     * <p>A category of weapons which may be enhanced by a feat or class feature.
     * For example, many classes have proficiencies with all "simple" or 
     * "martial" weapons; monks have proficiency with all "monk" weapons, and
     * brawlers have proficiency with "close" weapons. Fighters get bonuses to
     * particular fighter weapon groups.</p>
     * 
     * <p>A particular weapon may belong to more than one group, and bonuses
     * from different groups will be added together to calculate the final bonus
     * for the weapon.</p>
     * 
     * <p>References to weapon groups are usually assigned an abbreviation to
     * represent the type of group:</p>
     * 
     * <ol>
     *      <li>**fgroup:** Fighter weapon group (e.g., "axes")</li>
     *      <li>**prof:** Weapon proficiency group (e.g., "martial")</li>
     *      <li>**cat:** Weapon category (e.g., "two_handed_firearm")</li>
     * </ol>
     **/
    function WeaponGroup(template, updaters, dependencies) {
        /**
         * Attack bonuses for this group of weapons
         * 
         * @name WeaponGroup#atk_bonuses
         * @type Bonus
         **/
        /**
         * Damage bonuses for this group of weapons
         * 
         * @name WeaponGroup#atk_bonuses
         * @type Bonus
         **/
        var wpnGroup = {
            name: "",
            atk_ability: new Bonus(),
            dmg_ability: new Bonus(),
            atk_bonuses: new Bonus(),
            dmg_bonuses: new Bonus()
        };
        
        angular.extend(wpnGroup, template);
        
        Data.call(this, wpnGroup, updaters, dependencies);
        
        // Create name for object automatically from weapon name
        this.dataName = "weapon group|" + this.name.toLowerCase();
        
        this.dependBatch({
            "atk_bonuses": [{obj: this, property: "atk_ability"}],
            "dmg_bonuses": [{obj: this, property: "dmg_ability"}],
        })
    }
    
    // Inheritance from Data:
    WeaponGroup.prototype = Object.create(Data.prototype);
    WeaponGroup.prototype.constructor = WeaponGroup;
    
    return WeaponGroup;
});

csheetApp.factory("WeaponAbility", function(Data, Bonus) {
    /**
     * A kind of special weapon enchantment (e.g., "flaming") which may be 
     * applied to a weapon.
     * 
     * @class WeaponAbility
     * @param {Object} [template] - Template object to copy properties from
     * @param {Object} [updaters] - List of custom updater functions to apply to corresponding properties in template object (property names must match)
     * @param {Object} [dependencies] - List of arrays of dependency links to establish (property names must match)
     **/
     function WeaponAbility(template, updaters, dependencies) {
         var NewWpnAbility = {
             prefix: "",
             gp_cost: 0,
             enchantment_cost: 0,
             description: ""
         };
        
        angular.extend(NewWpnAbility, template);
        
        Data.call(this, NewWpnAbility, updaters, dependencies);
     }
    
    // Inheritance from Data:
    WeaponAbility.prototype = Object.create(Data.prototype);
    WeaponAbility.prototype.constructor = WeaponAbility;
     
     return WeaponAbility;
});

csheetApp.factory("Attack", function(Data, Bonus, xsignFilter) {
    // Attack
    //  -- has Weapon
    //  -- has Ability Modifier
    //  -- 
    function Attack(template, updaters, dependencies) {
        // Weapon is stored by value - a clone of the original object
        // Eventually this clone will actually be stored in Gear, and
        // the weapon here will reference that.
        var newAttack = {
            weapon: undefined,
            bab: undefined,
            acitems: undefined,
            dmgbonus: "",
            atkbonus: "",
            fullatk: "",
            type: "",
            touch: false
        };
        var newUpdaters = {
            fullatk: function(dep) {
                var newValue = "";
                var babAttacks = "";
                var bonus = 0;
                var totalAttacks = [];
                for (var i = 0; i < dep.length; i++) {
                    if (typeof dep[i] == "string" && dep[i].indexOf("/") != -1) {
                        // BAB attacks string
                        babAttacks = dep[i];
                    }
                    else {
                        // Attack bonus(es)
                        bonus += +dep[i];
                    }
                }
                var babAttacks = babAttacks.split("/");
                for (var j in babAttacks) {
                    totalAttacks.push(xsignFilter(+babAttacks[j] + bonus));
                }
                newValue = totalAttacks.join("/");
                return newValue;
            },
            dmgbonus: function(dep) {
                var dice = [];
                var flat = 0;
                for (var i = 0; i < dep.length; i++) {
                    if (typeof dep[i] == "string" && dep[i].indexOf("d") != -1) {
                        // This is a die roll
                        dice.push(dep[i]);
                    }
                    else {
                        flat += Number(dep[i]);
                    }
                }
                flat = xsignFilter(flat)
                var total = (dice.length > 0 ? dice.join("+") + flat : flat)
                return total;
            }
        };
        
        angular.extend(newAttack, template);
        angular.extend(newUpdaters, updaters);
        
        Data.call(this, newAttack, newUpdaters, dependencies)
        
        this.dataName = "attack|" + this.weapon.name.toLowerCase();
        
        this.dependBatch({
            atkbonus:   [{obj: this.weapon,         property: "atk_bonuses"},
                         /*{obj: this.acitems.totals, property: "atk_penalty"}*/],
            fullatk:    [{obj: this,                property: "atkbonus"},
                         {obj: this.bab,            property: "attacks"}],
            dmgbonus:   [{obj: this.weapon,         property: "dmg_bonuses"}]
        })
    }
    
    // Inheritance from Data:
    Attack.prototype = Object.create(Data.prototype);
    Attack.prototype.constructor = Attack;
    
    return Attack;
});

csheetApp.factory("WeaponLib", function($http, Data, Weapon, WeaponGroup, keyStringFilter) {
    function WeaponLib(source, callback) {
        var that = this;
        this.list = {error: "Not loaded yet"};
        this.groups = {error: "Not loaded yet"};
        $http.get(source).
            then(function(response) {
                var weaponsfile = $.csv.toObjects(response.data);
                var newlist = {};
                var newgroups = {};
                for (var i = 0; i < weaponsfile.length; i++) {
                    var fgs = weaponsfile[i].groups.split(";");
                    var groups = {};
                    for (var j = 0; j < fgs.length; j++) {
                        if (fgs[j].trim() != "") {
                            groups["fgroup_" + keyStringFilter(fgs[j])] = fgs[j];
                        }
                    }
                    groups["cat_" + keyStringFilter(weaponsfile[i].category)] = weaponsfile[i].category;
                    groups["prof_" + keyStringFilter(weaponsfile[i].proficiency)] = weaponsfile[i].proficiency;
                    for (var g in groups) {
                        var group = groups[g];
                        if (!(g in newgroups))
                        {
                            newgroups[g] = new WeaponGroup({
                                name: group
                            });
                        }
                    }
                    var wpn = new Weapon({
                        name: weaponsfile[i].weapon,
                        med_base_dmg: weaponsfile[i].base_dmg,
                        critical: weaponsfile[i].critical,
                        range: weaponsfile[i].range,
                        weight: weaponsfile[i].weight,
                        type: weaponsfile[i].type,
                        category: weaponsfile[i].category,
                        misfire: weaponsfile[i].misfire,
                        touch: false,
                        proficiency: weaponsfile[i].proficiency,
                        groups: groups
                    });
                    newlist[weaponsfile[i].weapon_id] = wpn;
                }
                that.groups = new Data(newgroups);
                that.list = new Data(newlist);
                if (callback && typeof(callback) == "function") { callback(); }
            });
        return this;
    }
    return WeaponLib;
});

csheetApp.factory("Feat", function(Data, DependencyModifier, $injector) {
    /**
     * 
     **/
    function Feat(template, updaters, dependencies) {
        var newFeat = {
            feat_id: "",
            name: "",
            type: "",
            uses: "",
            description: "",
            prereqs: "",
            display_prereqs: "",
            override_prereqs: false,
            rules: []
        };
        var newUpdaters = {
            display_prereqs: function(deps) {
                // Deps could include:
                //  - prereqs[] (array of prereq strings)
                
                var display_prereqs = []
                var Rulesets = $injector.get('Rulesets');
                if (!Rulesets.isLoaded) {
                    debugger;
                    console.log("Rulesets not loaded, can't display prereqs");
                    return;
                }
                
                for (var i = 0; i < deps.length; i++) {
                    if (Array.isArray(deps[i])) {
                        for (var j in deps[i]) {
                            var prereq = deps[i][j].trim();
                            if (prereq == "") {
                                continue;
                            }
                            else if (prereq.startsWith("stat:")) {
                                var stat = prereq.slice(5, 8).toUpperCase()
                                var value = +prereq.slice(8)
                                display_prereqs.push(stat + " " + value)
                            }
                            else if (prereq.startsWith("feat:")) {
                                var feat_id = prereq.slice(5);
                                console.log(feat_id);
                                if (Rulesets.feats.list.hasOwnProperty(feat_id)) {
                                    display_prereqs.push(Rulesets.feats.list[feat_id].name)
                                }
                            }
                            else if (prereq.startsWith("bab:")) {
                                var value = +prereq.slice(4) // Cast to Number
                                display_prereqs.push("BAB +" + value)
                            }
                        }
                    }
                }
                
                return display_prereqs
            }
        }
        
        angular.extend(newFeat, template);
        angular.extend(newUpdaters, updaters);
        // Change to newUpdaters when CurrentChar global issue is fixed
        DependencyModifier.call(this, newFeat, newUpdaters, dependencies);
        
        this.dataName = "feat|" + this.name.toLowerCase();
        this.dependBatch({
            "display_prereqs":     [{obj: this, property: "prereqs"}]
        });
    }
    
    // Inheritance from Data:
    Feat.prototype = Object.create(DependencyModifier.prototype);
    Feat.prototype.constructor = Feat;
    
    Feat.prototype.prereqsMet = function() {
        this.___.display_prereqs.refresh() // Update in case they weren't loaded
        if (this.override_prereqs) {
            // Sometimes a DM will allow a feat even if the character doesn't
            // technically meet the prerequisites. This will be an override
            // at the DM's discretion.
            return true;
        }
        
        var character = $injector.get('Character');
        
        for (var i = 0; i < this.prereqs.length; i++) {
            // Validate prereqs
            var prereq = this.prereqs[i];
            if (prereq == "") {
                // Prereq is blank
                continue;
            }
            else if (prereq.startsWith("stat:")) {
                var stat = prereq.slice(5, 8);
                var value = +prereq.slice(8); // Cast to Number
                
                if (character.stats[stat].score < value) {
                    // Stat requirement not met
                    return false;
                }
            }
            else if (prereq.startsWith("feat:")) {
                var feat = prereq.slice(5);
                var feat_found = false;
                
                for (var f = 0; f < character.feats.list.length; f++) {
                    var featSlot = character.feats.list[f];
                    //console.log(f, featSlot.slot);
                    if (featSlot && featSlot.hasOwnProperty("slot")
                        && typeof(featSlot.slot) === 'object' && featSlot.slot !== null
                        && featSlot.slot.hasOwnProperty('feat_id')
                        && featSlot.slot.feat_id == feat) {
                        
                        feat_found = true;
                        break;
                    }
                }
                if (!feat_found) {
                    return false;
                }
            }
            else if (prereq.startsWith("bab:")) {
                var value = +prereq.slice(4) // Cast to Number
                if (character.baseattack.base < value) {
                    console.log(character.baseattack.base, value)
                    return false;
                }
            }
        }
        return true
    }
    
    return Feat;
});

csheetApp.factory("Ability", function(Data, DependencyModifier) {
    /**
     * 
     **/
    function Ability(template, updaters, dependencies) {
        var newAbility = {
            ability_id: "",
            name: "",
            type: "",
            uses: "",
            description: "",
            prereqs: "",
            rules: []
        }
        
        angular.extend(newAbility, template);
        
        DependencyModifier.call(this, newAbility, updaters, dependencies);
        
        this.dataName = "ability|" + this.name.toLowerCase();
    }
    
    // Inheritance from DependencyModifier:
    Ability.prototype = Object.create(DependencyModifier.prototype);
    Ability.prototype.constructor = Ability;
    
    return Ability;
});

csheetApp.factory("Armor", function(Data, Bonus) {
    /**
     * Armor objects
     * 
     * @class Armor
     * @param {Object} [template] - Template object to copy properties from
     * @param {Object} [updaters] - List of custom updater functions to apply to corresponding properties in template object (property names must match)
     * @param {Object} [dependencies] - List of arrays of dependency links to establish (property names must match)
     **/
    function Armor(template, updaters, dependencies) {
        var Armr = {
            prefix: "",
            name: "",
            cost: 0,
            ac_bonuses: new Bonus(),
            abilities: [],
            acp: 0,
            acp_base: 0,
            ac_base: new Bonus(),
            atk_penalty: 0,
            proficient: false,
            maxdex: null,
            weight: 0,
            type: "",
            special: [],
            source: "",
            category: "",
            proficiency: "",
            masterwork: false,
            enhancement: new Bonus(),
            size: "Medium",
            spellfailure: 0,
            speed30: "",
            speed20: "",
            groups: []
        };
        
        var ArmrUpdaters = {
            prefix: function(deps) {
                var prefixes = [];
                for (var i = 0; i < deps.length; i++) {
                    if (typeof deps[i] === "string" && deps[i].trim() !== "") { 
                        prefixes.push(deps[i]); 
                    }
                }
                return prefixes.sort().join("/");
                /*
                var prefixes = [];
                for (var i = 0; i < deps.length; i++) {
                    if (typeof deps[i] == "object" && deps[i] !== null && "prefix" in deps[i] && typeof deps[i].prefix == "string") {
                        prefixes.push(deps[i].prefix.toLowerCase());
                    }
                }
                prefixes.sort();
                return prefixes.join(" ");
                */
            },
            acp: function(deps) {
                var base = 0
                for (var i = 0; i < deps.length; i++) {
                    if (typeof deps[i] === "number" && !isNaN(deps[i])) {
                        base += deps[i]
                    }
                    else if (typeof deps[i] === "boolean" && deps[i]) {
                        base += 1 // Masterwork bonus
                    }
                }
                return Math.min(0, base);
            },
            ac_bonuses: function(d) {
                var base = new Bonus();
                for (var i = 0; i < d.length; i++) {
                    base = base.add(d[i]);
                }
                return base;
            },
            proficient: function(d) {
                var base = false;
                for (var i = 0; i < d.length; i++) {
                    base = base || d[i];
                }
                return base;
            },
            atk_penalty: function(d) {
                var acp = 0;
                var proficient = false;
                for (var i = 0; i < d.length; i++) {
                    if (typeof d[i] == 'boolean') {
                        proficient = d[i];
                    }
                    else {
                        acp = d[i];
                    }
                }
                return (proficient ? 0 : acp);
            }
        }
        angular.extend(Armr, template);
        angular.extend(ArmrUpdaters, updaters);
        
        Data.call(this, Armr, ArmrUpdaters, dependencies);
        
        // Create name for object automatically from weapon name
        this.dataName = "armor|" + this.name.toLowerCase();
        this.dependBatch({
            "prefix":       [{obj: this, property: "abilities"}],
            "acp":          [{obj: this, property: "masterwork"},
                             {obj: this, property: "acp_base"}],
            "ac_bonuses":   [{obj: this, property: "enhancement"},
                             {obj: this, property: "ac_base"}],
            "atk_penalty":  [{obj: this, property: "acp"},
                             {obj: this, property: "proficient"}],
        });
    }
    
    // Inheritance from Data:
    Armor.prototype = Object.create(Data.prototype);
    Armor.prototype.constructor = Armor;
    
    
    /**
     * The Setup function establishes links for the weapon to its respective groups, 
     * but only when called. 
     * */
    Armor.prototype.setup = function(algroups) {
        for (var g in this.groups) {
            var group = this.groups[g];
            this.depend("proficient", algroups[g], "proficient");
        }
        return this;
    }
    
    return Armor;
});

csheetApp.factory("ArmorGroup", function(Data, Bonus) {
    /**
     * <p>References to armor groups are usually assigned an abbreviation to
     * represent the type of group:</p>
     * 
     * <ol>
     *      <li>**prof:** Armor proficiency group (e.g., "heavy armor" or "shield")</li>
     * </ol>
     **/
    function ArmorGroup(template, updaters, dependencies) {
        /**
         * AC bonuses for this group of armor (e.g., proficiency)
         * 
         * @type Bonus
         **/
        var armrGroup = {
            name: "",
            proficient: false
        };
        
        angular.extend(armrGroup, template);
        
        Data.call(this, armrGroup, updaters, dependencies);
        
        // Create name for object automatically from armor name
        this.dataName = "armor group|" + this.name.toLowerCase();
    }
    
    // Inheritance from Data:
    ArmorGroup.prototype = Object.create(Data.prototype);
    ArmorGroup.prototype.constructor = ArmorGroup;
    
    return ArmorGroup;
});

csheetApp.factory("ArmorLib", function($http, Data, Bonus, Armor, ArmorGroup, keyStringFilter) {
    function ArmorLib(source, callback) {
        var that = this;
        this.list = {error: "Not loaded yet"};
        this.groups = {error: "Not loaded yet"};
        $http.get(source).
            then(function(response) {
                var armorfile = $.csv.toObjects(response.data);
                var newlist = {};
                var newgroups = {};
                for (var i = 0; i < armorfile.length; i++) {
                    var groups = {};
                    groups["prof_" + keyStringFilter(armorfile[i].proficiency)] = armorfile[i].proficiency;
                    for (var g in groups) {
                        var group = groups[g];
                        if (!(g in newgroups))
                        {
                            newgroups[g] = new ArmorGroup({
                                name: group
                            });
                        }
                    }
                    if (armorfile[i].proficiency == "Shield") {
                        var ac_base = new Bonus({"shield": armorfile[i].bonus});
                        var type = "shield";
                    }
                    else {
                        var ac_base = new Bonus({"armor": armorfile[i].bonus});
                        var type = "armor";
                    }
                    var armr = new Armor({
                        name: armorfile[i].armor,
                        cost: armorfile[i].cost,
                        ac_base: ac_base,
                        maxdex: +armorfile[i].maxdex,
                        acp_base: +armorfile[i].acp,
                        type: type,
                        spellfailure: +armorfile[i].spellfailure,
                        speed30: +armorfile[i].speed30,
                        speed20: +armorfile[i].speed20,
                        weight: +armorfile[i].weight,
                        source: armorfile[i].source,
                        proficiency: armorfile[i].proficiency,
                        groups: groups
                    });
                    newlist[armorfile[i].armor_id] = armr;
                }
                that.groups = newgroups;
                that.list = new Data(newlist);
                if (callback && typeof(callback) == "function") { callback(); }
            });
        return this;
    }
    return ArmorLib;
});