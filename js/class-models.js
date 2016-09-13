/*global csheetApp*/
/*global angular*/
/*global $*/


csheetApp.factory("ClassLevel", function(Data) {
    // Constructor:
    function ClassLevel(template, updaters) {
        var newClassLevel = {
            rolled_hp: 0,
            class_level: 0,
            hp_total: 0,
            fort: 0,
            ref: 0,
            will: 0,
            skill_points: 0,
            archetype: "",
            abilities: [],
            spells_per_day: null,
            spells_known: null,
            pf_class: null,
            feat_slot: undefined,
            name: "",
            favored_class_selection: "",
            favored_class_bonus: "",
        };
        var newUpdaters = {
            favored_class_bonus: function(deps) {
                var bonuses = null;
                var selection = "";
                for (var i = 0; i < deps.length; i++) {
                    if (typeof deps[i] == 'object') {
                        bonuses = deps[i];
                    }
                    else if (typeof deps[i] === 'string') {
                        selection = deps[i];
                    }
                }
                if (bonuses !== null && bonuses.hasOwnProperty(selection)) {
                    var bonusObj = {};
                    bonusObj[selection] = bonuses[selection];
                    return bonusObj;
                }
                return {};
            }
        };
        
        angular.extend(newClassLevel, template);
        angular.extend(newUpdaters, updaters);
        
        Data.call(this, newClassLevel, newUpdaters);
        
        this.dataName = "level|" + this.name.toLowerCase();
        this.dependBatch({
            "hp_total":             [{obj: this, property: "rolled_hp"}],
            "favored_class_bonus":  [{obj: this, property: "favored_class_selection"},
                                     {obj: this.pf_class, property: "favored_class_bonuses"}]
        });
    }
    
    // Inheritance from Data:
    ClassLevel.prototype = Object.create(Data.prototype);
    ClassLevel.prototype.constructor = ClassLevel;
    
    return ClassLevel;
});

csheetApp.factory("PFClass", function(Data, ClassLevel) {
    // Constructor:
    function PFClass(template, updaters) {
        var newPFClass = {
            hit_dice: "",
            bab: "",
            fort: "",
            ref: "",
            will: "",
            skill_points: 0,
            class_skills: [],
            name: "",
            class_id: "",
            spells_per_day: "",
            spells_known: "",
            abilities: undefined,
            favored_class_bonuses: {
                hp: 1,
                skill_point: 1
            },
        };
        var newUpdaters = {
            hp_total: function(dependencies) {
                var hp_total = 0;
                for (var i = 0; i < dependencies.length; i++) {
                    hp_total += dependencies[i];
                }
                return hp_total;
            }
        };
        
        angular.extend(newPFClass, template);
        angular.extend(newUpdaters, updaters);
        
        Data.call(this, newPFClass, newUpdaters);
        
        this.dataName = "PFClass|" + this.name.toLowerCase();
        
        this.dependBatch({
            //"hp_total":  [{obj: this, property: "rolled_hp"}]
        });
    }
    
    // Inheritance from Data:
    PFClass.prototype = Object.create(Data.prototype);
    PFClass.prototype.constructor = PFClass;
    
    PFClass.prototype.createLevel = function(lvl, archetype) {
        function calc_save(level, save) {
            if (save == "good") {  
                if (lvl == 1) {
                    return 2;
                }
                return (lvl & 1) ? 0 : 1; 
            }
            return (lvl % 3 == 0) ? 1 : 0; 
        }
        function calc_bab(level, bab) {
            if (bab == "1")        { return 1; }
            else if (bab == "3/4") { return (((lvl - 1) % 4) == 0) ? 0 : 1; }
            else if (bab == "1/2") { return (lvl+1) % 2; }
        }
        function calc_spells_per_day(level, spells_per_day) {
            if (spells_per_day == "bard") {
                if (level == 1) {
                    return {
                        zero:   { perday: 4 },
                        one:    { perday: 2 },
                        two:    { perday: 0 },
                        three:  { perday: 0 },
                        four:   { perday: 0 },
                        five:   { perday: 0 },
                        six:    { perday: 0 }
                    }
                }
                return {
                    zero:   { perday: ([2, 3].indexOf(level) != -1 ? 1 : 0) },
                    one:    { perday: ([2, 3, 7, 11].indexOf(level) != -1 ? 1 : 0) },
                    two:    { perday: ([5, 6, 10, 14].indexOf(level) != -1 ? 1 : 0) },
                    three:  { perday: ([8, 9, 13, 17].indexOf(level) != -1 ? 1 : 0) },
                    four:   { perday: ([11, 12, 16, 20].indexOf(level) != -1 ? 1 : 0) },
                    five:   { perday: ([14, 15, 19].indexOf(level) != -1 ? 1 : 0) },
                    six:    { perday: ([17, 18, 20].indexOf(level) != -1 ? 1 : 0) },
                }
            }
            else if (spells_per_day == "cleric") {
                if (level == 1) {
                    return {
                        zero:   { perday: 3 },
                        one:    { perday: 1 },
                        two:    { perday: 0 },
                        three:  { perday: 0 },
                        four:   { perday: 0 },
                        five:   { perday: 0 },
                        six:    { perday: 0 },
                        seven:  { perday: 0 },
                        eight:  { perday: 0 },
                        nine:   { perday: 0 }
                    }
                }
                return {
                    zero:   { perday: ([2].indexOf(level) != -1 ? 1 : 0) },
                    one:    { perday: ([2, 4, 7].indexOf(level) != -1 ? 1 : 0),         domain: ([1].indexOf(level) != -1 ? 1 : 0) },
                    two:    { perday: ([3, 4, 6, 9].indexOf(level) != -1 ? 1 : 0),      domain: ([3].indexOf(level) != -1 ? 1 : 0) },
                    three:  { perday: ([5, 6, 8, 11].indexOf(level) != -1 ? 1 : 0),     domain: ([5].indexOf(level) != -1 ? 1 : 0) },
                    four:   { perday: ([7, 8, 10, 13].indexOf(level) != -1 ? 1 : 0),    domain: ([7].indexOf(level) != -1 ? 1 : 0) },
                    five:   { perday: ([9, 10, 12, 15].indexOf(level) != -1 ? 1 : 0),   domain: ([9].indexOf(level) != -1 ? 1 : 0) },
                    six:    { perday: ([11, 12, 14, 18].indexOf(level) != -1 ? 1 : 0),  domain: ([11].indexOf(level) != -1 ? 1 : 0) },
                    seven:  { perday: ([13, 14, 16, 19].indexOf(level) != -1 ? 1 : 0),  domain: ([13].indexOf(level) != -1 ? 1 : 0) },
                    eight:  { perday: ([15, 16, 18, 20].indexOf(level) != -1 ? 1 : 0),  domain: ([15].indexOf(level) != -1 ? 1 : 0) },
                    nine:   { perday: ([17, 18, 19, 20].indexOf(level) != -1 ? 1 : 0),  domain: ([17].indexOf(level) != -1 ? 1 : 0) },
                }
            }
            else if (spells_per_day == "ranger") {
                if (level == 1) {
                    return {
                        one:    { perday: 0 },
                        two:    { perday: 0 },
                        three:  { perday: 0 },
                        four:   { perday: 0 },
                    }
                }
                return {
                    one:    { perday: ([5, 9, 13, 17].indexOf(level) != -1 ? 1 : 0) },
                    two:    { perday: ([8, 12, 16, 20].indexOf(level) != -1 ? 1 : 0) },
                    three:  { perday: ([11, 15, 19].indexOf(level) != -1 ? 1 : 0) },
                    four:   { perday: ([14, 18, 20].indexOf(level) != -1 ? 1 : 0) },
                }
            }
            else if (spells_per_day == "sorcerer") {
                return {
                    one:    { perday: ([1].indexOf(level) != -1 ? 3 : 0) + ([2, 3, 4].indexOf(level) != -1 ? 1 : 0) },
                    two:    { perday: ([4].indexOf(level) != -1 ? 3 : 0) + ([5, 6, 7].indexOf(level) != -1 ? 1 : 0) },
                    three:  { perday: ([6].indexOf(level) != -1 ? 3 : 0) + ([7, 8, 9].indexOf(level) != -1 ? 1 : 0) },
                    four:   { perday: ([8].indexOf(level) != -1 ? 3 : 0) + ([9, 10, 11].indexOf(level) != -1 ? 1 : 0) },
                    five:   { perday: ([10].indexOf(level) != -1 ? 3 : 0) + ([11, 12, 13].indexOf(level) != -1 ? 1 : 0) },
                    six:    { perday: ([12].indexOf(level) != -1 ? 3 : 0) + ([13, 14, 15].indexOf(level) != -1 ? 1 : 0) },
                    seven:  { perday: ([14].indexOf(level) != -1 ? 3 : 0) + ([15, 16, 17].indexOf(level) != -1 ? 1 : 0) },
                    eight:  { perday: ([16].indexOf(level) != -1 ? 3 : 0) + ([17, 18, 19].indexOf(level) != -1 ? 1 : 0) },
                    nine:   { perday: ([18].indexOf(level) != -1 ? 3 : 0) + ([19].indexOf(level) != -1 ? 1 : 0) + ([20].indexOf(level) != -1 ? 2 : 0) },
                }
            }
            else if (spells_per_day == "wizard") {
                if (level == 1) {
                    return {
                        zero:   { perday: 3 },
                        one:    { perday: 1 },
                        two:    { perday: 0 },
                        three:  { perday: 0 },
                        four:   { perday: 0 },
                        five:   { perday: 0 },
                        six:    { perday: 0 },
                        seven:  { perday: 0 },
                        eight:  { perday: 0 },
                        nine:   { perday: 0 }
                    }
                }
                return {
                    zero:   { perday: ([2].indexOf(level) != -1 ? 1 : 0) },
                    one:    { perday: ([2, 4, 7].indexOf(level) != -1 ? 1 : 0) },
                    two:    { perday: ([3, 4, 6, 9].indexOf(level) != -1 ? 1 : 0) },
                    three:  { perday: ([5, 6, 8, 11].indexOf(level) != -1 ? 1 : 0) },
                    four:   { perday: ([7, 8, 10, 13].indexOf(level) != -1 ? 1 : 0) },
                    five:   { perday: ([9, 10, 12, 15].indexOf(level) != -1 ? 1 : 0) },
                    six:    { perday: ([11, 12, 14, 18].indexOf(level) != -1 ? 1 : 0) },
                    seven:  { perday: ([13, 14, 16, 19].indexOf(level) != -1 ? 1 : 0) },
                    eight:  { perday: ([15, 16, 18, 20].indexOf(level) != -1 ? 1 : 0) },
                    nine:   { perday: ([17, 18, 19, 20].indexOf(level) != -1 ? 1 : 0) },
                }
            }
        }
        function calc_class_abilities(level, abilities, archetype) {
            var abilities_list = []
            // First, add stock abilities
            for (var ab in abilities) {
                var ability = abilities[ab]
                if (   typeof ability === "object" 
                    && "ability_id" in ability 
                    && ability.level == level 
                    && ability.archetype == ""
                    && ability.slot_type == "") {
                    abilities_list.push(ability);
                }
            }
            
            // If there is an archetype defined, replace any stock abilities as needed
            if (archetype != "") {
                for (var ab in abilities) {
                    var ability = abilities[ab]
                    if (typeof ability === "object" && "ability_id" in ability && ability.level == level && ability.archetype == archetype) {
                        if (ability.archetype_replaces != "") {
                            for (var i in abilities_list) {
                                var rep_ab = abilities_list[i];
                                if (rep_ab.ability_id == ability.archetype_replaces) {
                                    // Remove the ability this one replaces
                                    abilities_list.splice(abilities_list.indexOf(rep_ab), 1);
                                }
                            }
                        }
                        // Add the new archetype ability
                        abilities_list.push(ability);
                    }
                }
            }
            return abilities_list;
        }
        return new ClassLevel({
            fort: calc_save(lvl, this.fort),
            ref: calc_save(lvl, this.ref),
            will: calc_save(lvl, this.will),
            bab: calc_bab(lvl, this.bab),
            skill_points: this.skill_points,
            abilities: calc_class_abilities(lvl, this.abilities, archetype),
            spells_per_day: calc_spells_per_day(lvl, this.spells_per_day),
            name: this.name,
            pf_class: this,
            class_level: lvl
        });
    };
    
    PFClass.prototype.getAbility = function(ability_id) {
        for (var i = 0; i < this.abilities.length; i++) {
            if (this.abilities[i] != null && typeof this.abilities[i] == "object" && this.abilities[i].hasOwnProperty("ability_id")) {
                if (this.abilities[i].ability_id == ability_id) {
                    return this.abilities[i];
                }
            }
        }
        console.log("Unable to find ability", ability_id);
        return null;
    }
    
    return PFClass;
});

csheetApp.factory("PFClassLib", function($http, Data, PFClass, PFClassAbilitiesLib, keyStringFilter) {
    function PFClassLib(source, callback) {
        var that = this;
        var abilities = null
        abilities = new PFClassAbilitiesLib("Data/Classes%20-%20Abilities.csv", function() {
            that.list = {error: "Not loaded yet"};
            $http.get(source).
                then(function(response) {
                    var classfile = $.csv.toObjects(response.data);
                    var newlist = {};
                    for (var i = 0; i < classfile.length; i++) {
                        // List abilities for this class
                        var class_abilities = []
                        for (var ab in abilities.list) {
                            var ability = abilities.list[ab]
                            if (typeof ability === "object" && "ability_id" in ability && ability.class == classfile[i].class_id) {
                                class_abilities.push(ability);
                            }
                        }
                        var class_template = {
                            name: classfile[i].class_name,
                            hit_dice: classfile[i].hit_dice,
                            bab: classfile[i].bab,
                            fort: classfile[i].fort,
                            ref: classfile[i].ref,
                            will: classfile[i].will,
                            skill_points: Number(classfile[i].skill_points),
                            class_skills: classfile[i].class_skills.split(","),
                            spells_per_day: classfile[i].spells_per_day,
                            spells_known: classfile[i].spells_known,
                            abilities: class_abilities,
                            class_id: classfile[i].class_id
                        }
                        newlist[classfile[i].class_id] = new PFClass(class_template);
                    }
                    that.list = new Data(newlist);
                    if (callback && typeof(callback) == "function") { callback(); }
                });
        });
        // Load class abilities first
        
        
        return this;
    }
    return PFClassLib;
});

csheetApp.factory("PFClassAbilitiesLib", function($http, Data, Bonus, SelectorSlot, Ability, keyStringFilter) {
    function PFClassAbilitiesLib(source, callback) {
        var that = this;
        this.list = {error: "Not loaded yet"};
        $http.get(source).
            then(function(response) {
                var classfile = $.csv.toObjects(response.data);
                var newlist = {};
                for (var i = 0; i < classfile.length; i++) {
                    var extra_fields = classfile[i].fields.split(",");
                    var template = {
                        name: classfile[i].name,
                        class: classfile[i].class,
                        slot_type: classfile[i].slot_type,
                        archetype: classfile[i].archetype,
                        archetype_replaces: classfile[i].replaces,
                        level: parseInt(classfile[i].levels, 10),
                        type: classfile[i].type,
                        uses: classfile[i].uses,
                        prereqs: classfile[i].prereqs,
                        description: classfile[i].description,
                        rules: classfile[i].rules.split("|"),
                        ability_id: classfile[i].ability_id,
                    };
                    /* Add any extra fields needed for the ability's rules */
                    for (var j = 0; j < extra_fields.length; j++) {
                        var segments = extra_fields[j].split("=");
                        var field_name = segments[0];
                        if (field_name == "") {
                            continue;
                        }
                        var field_value = (segments.length > 1 ? segments[1].replace("\"", "") : null);
                        template[field_name] = eval(field_value); // Yes, eval can be dangerous, but necessary for complex field values.
                    }
                    newlist[classfile[i].ability_id] = new Ability(template);
                }
                that.list = new Data(newlist);
                if (callback && typeof(callback) == "function") { callback(); }
            });
        return this;
    }
    return PFClassAbilitiesLib;
});

csheetApp.factory("PFFeatsLib", function($http, Data, Bonus, Feat, keyStringFilter) {
    function PFFeatsLib(source, callback) {
        var that = this;
        this.list = {error: "Not loaded yet"};
        $http.get(source).
            then(function(response) {
                var classfile = $.csv.toObjects(response.data);
                var newlist = {};
                for (var i = 0; i < classfile.length; i++) {
                    var extra_fields = classfile[i].fields.split();
                    var template = {
                        name: classfile[i].name,
                        type: classfile[i].type,
                        uses: classfile[i].uses,
                        prereqs: classfile[i].prereqs.split("|"),
                        description: classfile[i].description,
                        rules: classfile[i].rules.split("|"),
                        feat_id: classfile[i].feat_id,
                    };
                    /* Add any extra fields needed for the ability's rules */
                    for (var j = 0; j < extra_fields.length; j++) {
                        var segments = extra_fields[j].split("=");
                        var field_name = segments[0];
                        var field_value = (segments.length > 1 ? segments[1].replace("\"", "") : null);
                        template[field_name] = eval(field_value); // Yes, eval can be dangerous, but necessary for complex field values.
                    }
                    newlist[classfile[i].feat_id] = new Feat(template);
                }
                that.list = new Data(newlist);
                if (callback && typeof(callback) == "function") { callback(); }
            });
        return this;
    }
    return PFFeatsLib;
});