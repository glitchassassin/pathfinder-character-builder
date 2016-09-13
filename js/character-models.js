/*global csheetApp*/
/*global angular*/

csheetApp.factory("Classrace", function(Data, ClassLevels) {
    // Constructor:
    function Classrace(template, updaters) {
        // Default values are "empty," except for size, which has particular requirements.
        var newClassrace = {
            name:                 "",
            alignment:            "",
            player:               "",
            class_levels:         null,
            deity:                "",
            homeland:             "",
            race:                 "",
            size:                 "Medium",
            size_mod:             0,
            special_size_mod:     0,
            gender:               "",
            age:                  "",
            height:               "",
            weight:               "",
            hair:                 "",
            eyes:                 ""
        };
        var newUpdaters = {
            size_mod: function(dependencies) {
                var sizes = {
                    "colossal": -8,
                    "gargantuan": -4,
                    "huge": -2,
                    "large": -1,
                    "medium": 0,
                    "small": 1,
                    "tiny": 2,
                    "diminutive": 4,
                    "fine": 8
                }
                if (dependencies.length > 0) {
                    var new_value = 0;
                    for (var i = 0; i < dependencies.length; i++) {
                        var size = dependencies[i].toLowerCase()
                        if (sizes.hasOwnProperty(size)) {
                            new_value = sizes[size];
                        }
                    }
                }
                return new_value;
            },
            special_size_mod: function(dependencies) {
                var sizes = {
                    "colossal": 8,
                    "gargantuan": 4,
                    "huge": 2,
                    "large": 1,
                    "medium": 0,
                    "small": -1,
                    "tiny": -2,
                    "diminutive": -4,
                    "fine": -8
                }
                if (dependencies.length > 0) {
                    var new_value = 0;
                    for (var i = 0; i < dependencies.length; i++) {
                        var size = dependencies[i].toLowerCase()
                        if (sizes.hasOwnProperty(size)) {
                            new_value = sizes[size];
                        }
                    }
                }
                return new_value;
            }
        };
        
        angular.extend(newClassrace, template);
        angular.extend(newUpdaters, updaters);
        
        Data.call(this, newClassrace, newUpdaters);
        
        this.dataName = "classrace|" + this.name.toLowerCase();
        
        this.dependBatch({
            "size_mod":         [{obj: this, property: "size"}],
            "special_size_mod": [{obj: this, property: "size"}]
        });
    }
    
    // Inheritance from Data:
    Classrace.prototype = Object.create(Data.prototype);
    Classrace.prototype.constructor = Classrace;
    
    return Classrace;
});

csheetApp.factory("ClassLevels", function(Data, Bab) {
    // Constructor:
    function ClassLevels(template, updaters) {
        // Default values are "empty," except for size, which has particular requirements.
        var newClassLevels = {
            levels: [],
            favored_class: "",
            character_level: 0,
            leveling_hp: 0,
            hp_bonus: 0,
            leveling_skill_points: 0,
            skill_points_bonus: 0,
            class_skills: [],
            hp_ability: null,
            sp_ability: null,
            bab: null,
            fort_bonus: 0,
            ref_bonus: 0,
            will_bonus: 0,
            fort_save: null,
            ref_save: null,
            will_save: null,
            class_levels_string: {},
            feats: undefined,
            ability_scores: [],
            all_classes_list: null
        };
        var newUpdaters = {
            character_level: function(dependencies) {
                var cl_total = 0;
                for (var i = 0; i < dependencies.length; i++) {
                    var dep = dependencies[i];
                    if (dep.hasOwnProperty("length")) {
                        cl_total += dep.length;
                    }
                }
                return cl_total;
            },
            leveling_hp: function(deps) {
                // Deps:
                // -- ARRAY: Levels list
                // -- STRING: Favored class (class_id)
                // -- ANYTHING ELSE (that converts to a number): Per-level bonus
                var favored_class = [];
                var per_level_bonus = 0;
                var levels = [];
                
                var levelcount = 0;
                var hp_total = 0;
                for (var i = 0; i < deps.length; i++) {
                    var dep = deps[i];
                    if (typeof dep === 'string') {
                        favored_class.push(dep);
                    }
                    else if (dep.constructor && dep.constructor === Array) {
                        levels = dep;
                    }
                    else {
                        per_level_bonus += +dep;
                    }
                }
                levelcount = levels.length;
                // Sum up the skill points in the Levels array
                for (var j = 0; j < levelcount; j++) {
                    hp_total += +levels[j].rolled_hp;
                    if (favored_class.indexOf(levels[j].pf_class.class_id) != -1 && levels[j].favored_class_selection == "hp") {
                        hp_total += levels[j].favored_class_bonus.hp;
                    }
                }
                hp_total += per_level_bonus * levelcount;
                return hp_total;
            },
            leveling_skill_points: function(deps) {
                // Deps:
                // -- ARRAY: Levels list
                // -- STRING: Favored class (class_id)
                // -- ANYTHING ELSE (that converts to a number): Per-level bonus
                var favored_class = [];
                var per_level_bonus = 0;
                var levels = [];
                
                var levelcount = 0;
                var sp_total = 0;
                for (var i = 0; i < deps.length; i++) {
                    var dep = deps[i];
                    if (typeof dep === 'string') {
                        favored_class.push(dep);
                    }
                    else if (dep.constructor && dep.constructor === Array) {
                        levels = dep;
                    }
                    else {
                        per_level_bonus += +dep;
                    }
                }
                levelcount = levels.length;
                // Sum up the skill points in the Levels array
                for (var j = 0; j < levelcount; j++) {
                    sp_total += +levels[j].skill_points;
                    if (favored_class.indexOf(levels[j].pf_class.class_id) != -1 && levels[j].favored_class_selection == "skill_point") {
                        sp_total += levels[j].favored_class_bonus.skill_point;
                    }
                }
                sp_total += per_level_bonus * levelcount;
                return sp_total;
            },
            fort_bonus: function(deps) {
                var fort = 0;
                for (var i = 0; i < deps.length; i++) {
                    var dep = deps[i];
                    if (dep.hasOwnProperty("length")) {
                        // Sum up the fort bonuses in the Levels array
                        for (var j = 0; j < dep.length; j++) {
                            fort += +dep[j].fort;
                        }
                    }
                    else
                    {
                        fort += +dep;
                    }
                }
                return fort;
            },
            ref_bonus: function(deps) {
                var ref = 0;
                for (var i = 0; i < deps.length; i++) {
                    var dep = deps[i];
                    if (dep.hasOwnProperty("length")) {
                        // Sum up the reflex bonuses in the Levels array
                        for (var j = 0; j < dep.length; j++) {
                            ref += +dep[j].ref;
                        }
                    }
                    else
                    {
                        ref += +dep;
                    }
                }
                return ref;
            },
            will_bonus: function(deps) {
                var will = 0;
                for (var i = 0; i < deps.length; i++) {
                    var dep = deps[i];
                    if (dep.hasOwnProperty("length")) {
                        // Sum up the will bonuses in the Levels array
                        for (var j = 0; j < dep.length; j++) {
                            will += +dep[j].will;
                        }
                    }
                    else
                    {
                        will += +dep;
                    }
                }
                return will;
            },
            class_levels_string: function(deps) {
                var class_levels = {};
                var class_levels_string = "";
                for (var i = 0; i < deps.length; i++) {
                    var dep = deps[i];
                    if (dep.hasOwnProperty("length")) {
                        // Calculate the level by class
                        for (var j = 0; j < dep.length; j++) {
                            if (!class_levels.hasOwnProperty(dep[j].name)) {
                                class_levels[dep[j].name] = 0;
                            }
                            class_levels[dep[j].name]++;
                        }
                    }
                }
                return class_levels;
            },
            class_skills: function(d) {
                function arrayUnique(array) {
                    var a = array.concat();
                    for(var i=0; i<a.length; ++i) {
                        for(var j=i+1; j<a.length; ++j) {
                            if(a[i] === a[j])
                                a.splice(j--, 1);
                        }
                    }
                
                    return a;
                }
                var all_skills = [];
                for (var i = 0; i < d.length; i++) {
                    if (Array.isArray(d[i])) {
                        // Levels array
                        for (var j = 0; j < d[i].length; j++) {
                            all_skills = all_skills.concat(d[i][j].pf_class.class_skills)
                        }
                    }
                }
                return arrayUnique(all_skills);
            }
        };
        
        angular.extend(newClassLevels, template);
        angular.extend(newUpdaters, updaters);
        
        Data.call(this, newClassLevels, newUpdaters);
        
        this.dataName = "classlevels";
        
        this.dependBatch({
            "character_level":          [{obj: this, property: "levels"}],
            "hp_bonus":                 [{obj: this.hp_ability, property: "ability_mod"}],
            "skill_points_bonus":       [{obj: this.sp_ability, property: "ability_mod"}],
            "leveling_hp":              [{obj: this, property: "levels"},
                                         {obj: this, property: "favored_class"},
                                         {obj: this, property: "hp_bonus"}],
            "leveling_skill_points":    [{obj: this, property: "levels"},
                                         {obj: this, property: "skill_points_bonus"},
                                         {obj: this, property: "favored_class"}],
            "fort_bonus":               [{obj: this, property: "levels"}],
            "ref_bonus":                [{obj: this, property: "levels"}],
            "will_bonus":               [{obj: this, property: "levels"}],
            "class_levels_string":      [{obj: this, property: "levels"}],
            "class_skills":             [{obj: this, property: "levels"}],
        });
        this.bab.depend("base", this, "levels");
        
        this.fort_save.depend("base", this, "fort_bonus");
        this.ref_save.depend("base", this, "ref_bonus");
        this.will_save.depend("base", this, "will_bonus");
    }
    
    // Inheritance from Data:
    ClassLevels.prototype = Object.create(Data.prototype);
    ClassLevels.prototype.constructor = ClassLevels;
    
    /**
     * addLevelOfClass
     * 
     * @param details - Object with parameter definitions
     * @param details.class_id - Key of class to add (from rulesets.classes.list)
     * @param details.rolled_hp - Rolled hitpoints (by hit dice level)
     **/
    ClassLevels.prototype.addLevelOfClass = function(details) {
        if (this.all_classes_list.error) {
            throw "Classes not loaded yet";
        }
        if (typeof details != "object" || details == null || !details.hasOwnProperty("class_id") || !details.hasOwnProperty("rolled_hp")) {
            throw new TypeError("Details object invalid");
        }
        
        if (this.all_classes_list.list.hasOwnProperty(details.class_id)) {
            var new_level;
            var class_level = 1;
            var character_level = 1;
            for (var i = 0; i < this.levels.length; i++) {
                if (   this.levels[i].pf_class.class_id 
                    && this.levels[i].pf_class.class_id == details.class_id) {
                    class_level++;
                }
                character_level++;
            }
            new_level = this.all_classes_list.list[details.class_id].createLevel(class_level, details.archetype);
            new_level.rolled_hp = details.rolled_hp;
            new_level.favored_class_selection = details.favored_class_selection;
            if (character_level%2 > 0) {
                // Odd-numbered levels get a feat slot
                new_level.feat_slot = this.feats.newFeatSlot();
            }
            this.levels.push(new_level);
            this.bab.___.base.refresh();
        }
    };
    
    return ClassLevels;
});

csheetApp.factory("Stat", function(Data, Bonus) {
    // Constructor
    // - score : Integer
    // - temp_score : Integer
    function Stat(template, updaters) {
        var newStat = {
            name: "",
            score: new Bonus(),
            mod: 0,
            score_temp: new Bonus(),
            mod_temp: 0,
            ability_mod: new Bonus()
        }
        var newUpdaters = {
            "mod": function(dependencies) {
                // Add Bonus objects together, then calculate total value
                if (dependencies.length > 0) {
                    var total_bonus = new Bonus();
                    for (var i = 0; i < dependencies.length; i++) {
                        total_bonus = dependencies[i].add(total_bonus);
                    }
                    if (total_bonus === null) {
                        return null;
                    }
                    return Math.floor((total_bonus.valueOf()-10)/2);
                }
                return null;
            },
            "mod_temp": function(dependencies) {
                // Add Bonus objects together, then calculate total value
                if (dependencies.length > 0) {
                    var total_bonus = new Bonus();
                    for (var i = 0; i < dependencies.length; i++) {
                        total_bonus = dependencies[i].add(total_bonus);
                    }
                    if (total_bonus.valueOf() === null) {
                        return null;
                    }
                    return (total_bonus.valueOf() ? Math.floor((total_bonus.valueOf()-10)/2) : "");
                }
                return null;
            },
            "ability_mod": function(dependencies) {
                if (dependencies.length > 0) {
                    var new_value = null;
                    for (var i = 0; i < dependencies.length; i++) {
                        if (new_value === null) {
                            new_value = dependencies[i];
                            continue;
                        }
                        if (dependencies[i] !== null) {
                            new_value = (isNaN(dependencies[i]) ? new_value : Math.max(new_value, dependencies[i]));
                        }
                    }
                }
                return new Bonus({ability: new_value});
            }
        }
        
        angular.extend(newStat, template);
        angular.extend(newUpdaters, updaters);
        
        Data.call(this, newStat, newUpdaters);
        
        this.dataName = "stat|" + this.name.toLowerCase();
        
        this.dependBatch({
            "mod":              [{obj: this, property: "score"}],
            "mod_temp":         [{obj: this, property: "score_temp"}],
            "ability_mod":      [{obj: this, property: "mod"},
                                 {obj: this, property: "mod_temp"}]
        });
    }
    
    // Inheritance from Data:
    Stat.prototype = Object.create(Data.prototype);
    Stat.prototype.constructor = Stat;
    
    return Stat;
});

csheetApp.factory("Speed", function(Data) {
    // Constructor
    // - ft : Integer
    function Speed(template, updaters) {
        var newSpeed = {
            "name": "",
            "ft": 0,
            "sq": 0
        }
        var newUpdaters = {
            "sq": function(dependencies) {
                // Assume that dependencies feed in the total speed in feet
                // Sum any dependencies (most likely only one) and then
                // convert to modifier.
                if (dependencies.length > 0) {
                    var new_value = "";
                    for (var i = 0; i < dependencies.length; i++) {
                        new_value += dependencies[i];
                    }
                    new_value = Math.floor(new_value/5);
                }
                return new_value;
            }
        }
        
        angular.extend(newSpeed, template);
        angular.extend(newUpdaters, updaters);
        
        Data.call(this, newSpeed, newUpdaters);
        
        this.dataName = "speed|" + this.name.toLowerCase();
        
        this.depend("sq", this, "ft");
    }
    
    // Inheritance from Data:
    Speed.prototype = Object.create(Data.prototype);
    Speed.prototype.constructor = Speed;
    
    return Speed;
});

csheetApp.factory("Skill", function(Data) {
    // Constructor:
    function Skill(template, updaters) {
        // "Fake" constructor that actually just builds a specific 
        // kind of Data object
        
        // Skills are not created as an empty object. Ability at least is required.
        if (    typeof template !== 'object' || 
                typeof template.ability !== 'object' || 
                !template.ability.hasOwnProperty("ability_mod")) {
            throw new TypeError("ability expected to be Stat object");
        }
        if (    typeof template !== 'object' || 
                typeof template.class_levels !== 'object' || 
                !template.class_levels.hasOwnProperty("class_skills")) {
            throw new TypeError("class_levels expected to be ClassLevels object");
        }
        
        var newSkill = {
            "key_name": "",
            "name": "",
            "class_skill": false,
            "class_skill_bonus": 0,
            "all_class_skills": undefined,
            "total": 0,
            "ability": {}, // Actually an object
            "ranks": 0,
            "misc": 0,
            "trained_only": false,
            "subskill": ""
        };
        var newUpdaters = {
            "class_skill_bonus": function(dependencies) {
                // Assume that dependencies are boolean. If this is a
                // class skill (true > 0) and there are ranks in the skill (1 > 0), 
                // the bonus is +3.
                if (dependencies.length > 0) {
                    var class_skill = true;
                    for (var i = 0; i < dependencies.length; i++) {
                        class_skill &= (dependencies[i] > 0);
                    }
                    var new_value = (class_skill ? 3 : 0);
                }
                return new_value;
            },
            "class_skill": function(d) {
                var base = false;
                var name = "";
                var class_skills = "";
                // Depends on either a boolean or the class_levels.class_skills array
                for (var i = 0; i < d.length; i++) {
                    if (typeof d[i] === 'boolean') {
                        base = base || d[i];
                    }
                    else if (typeof d[i] === 'string') {
                        name = d[i].toLowerCase()
                    }
                    else if (Array.isArray(d[i])) {
                        // This is the class_skills array.
                        class_skills = d[i];
                    }
                }
                if (name != "" && class_skills.indexOf(name) != -1) {
                    base = true;
                }
                return base;
            }
        }
        
        angular.extend(newSkill, template);
        angular.extend(newUpdaters, updaters);
        
        Data.call(this, newSkill, newUpdaters);
        
        this.dataName = "skill|" + this.name.toLowerCase();
        
        // Total is the sum of class_skill_bonus, ability_modifier, ranks, and misc
        this.dependBatch({
            "total":                [{obj: this,                property: "class_skill_bonus"},
                                     {obj: this.ability,        property: "ability_mod"},
                                     {obj: this,                property: "ranks"},
                                     {obj: this,                property: "misc"}],
            // Class_skill_bonus is +3, if it's a class skill with ranks
            "class_skill_bonus":    [{obj: this,                property: "ranks"}, 
                                     {obj: this,                property: "class_skill"}],
            "class_skill":          [{obj: this,                property: "key_name"}, 
                                     {obj: this.class_levels,   property: "class_skills"}]
        });
    }
    
    // Inheritance from Data:
    Skill.prototype = Object.create(Data.prototype);
    Skill.prototype.constructor = Skill;
    
    return Skill;
});

csheetApp.factory("Skills", function(Data, Skill) {
    // Constructor:
    function Skills(template, updaters) {
        // "Fake" constructor that actually just builds a specific 
        // kind of Data object
        
        // Skills is not created as an empty object. class_levels at least is required.
        if (    typeof template !== 'object' || 
                typeof template.class_levels !== 'object' || 
                template.class_levels === null || 
                !template.class_levels.hasOwnProperty("levels")) {
            throw new TypeError("class_levels expected to be ClassLevels object");
        }
        if (    typeof template !== 'object' || 
                typeof template.stats !== 'object' || 
                template.stats === null || 
                !template.stats.hasOwnProperty("dex")) {
            throw new TypeError("stats expected to be Stats object");
        }
        
        var newSkills = {
            "class_levels": undefined,
            "stats": undefined,
            "list": new Data({
                "acrobatics": undefined,
                "appraise": undefined,
                "bluff": undefined,
                "climb": undefined,
                "craft1": undefined,
                "craft2": undefined,
                "craft3": undefined,
                "diplomacy": undefined,
                "disabledevice": undefined,
                "disguise": undefined,
                "escapeartist": undefined,
                "fly": undefined,
                "handleanimal": undefined,
                "heal": undefined,
                "intimidate": undefined,
                "karcana": undefined,
                "kdungeoneering": undefined,
                "kengineering": undefined,
                "kgeography": undefined,
                "khistory": undefined,
                "klocal": undefined,
                "knature": undefined,
                "knobility": undefined,
                "kplanes": undefined,
                "kreligion": undefined,
                "linguistics": undefined,
                "perception": undefined,
                "perform1": undefined,
                "perform2": undefined,
                "profession1": undefined,
                "profession2": undefined,
                "ride": undefined,
                "sensemotive": undefined,
                "sleightofhand": undefined,
                "spellcraft": undefined,
                "stealth": undefined,
                "survival": undefined,
                "swim": undefined,
                "usemagicdevice": undefined
            }),
            "modifiers": ""
        };
        var newUpdaters = {
            "modifiers": function(d) {
                // Returns an array of its dependencies (for display)
                return d;
            }
        }
        
        angular.extend(newSkills, template);
        angular.extend(newUpdaters, updaters);
        
        Data.call(this, newSkills, newUpdaters);
        
        this.dataName = "skills|list";
        
        this.list["acrobatics"] =       new Skill({name: "Acrobatics",                  key_name: "acrobatics",     class_levels: this.class_levels,    ability: this.stats.dex});
        this.list["appraise"] =         new Skill({name: "Appraise",                    key_name: "appraise",       class_levels: this.class_levels,    ability: this.stats.int});
        this.list["bluff"] =            new Skill({name: "Bluff",                       key_name: "bluff",          class_levels: this.class_levels,    ability: this.stats.cha});
        this.list["climb"] =            new Skill({name: "Climb",                       key_name: "climb",          class_levels: this.class_levels,    ability: this.stats.str});
        this.list["craft1"] =           new Skill({name: "Craft 1",                     key_name: "craft1",         class_levels: this.class_levels,    ability: this.stats.int});
        this.list["craft2"] =           new Skill({name: "Craft 2",                     key_name: "craft2",         class_levels: this.class_levels,    ability: this.stats.int});
        this.list["craft3"] =           new Skill({name: "Craft 3",                     key_name: "craft3",         class_levels: this.class_levels,    ability: this.stats.int});
        this.list["diplomacy"] =        new Skill({name: "Diplomacy",                   key_name: "diplomacy",      class_levels: this.class_levels,    ability: this.stats.cha});
        this.list["disabledevice"] =    new Skill({name: "Disable Device",              key_name: "disabledevice",  class_levels: this.class_levels,    ability: this.stats.dex,   trained_only: true});
        this.list["disguise"] =         new Skill({name: "Disguise",                    key_name: "disguise",       class_levels: this.class_levels,    ability: this.stats.cha});
        this.list["escapeartist"] =     new Skill({name: "Escape Artist",               key_name: "escapeartist",   class_levels: this.class_levels,    ability: this.stats.dex});
        this.list["fly"] =              new Skill({name: "Fly",                         key_name: "fly",            class_levels: this.class_levels,    ability: this.stats.dex});
        this.list["handleanimal"] =     new Skill({name: "Handle Animal",               key_name: "handleanimal",   class_levels: this.class_levels,    ability: this.stats.cha,   trained_only: true});
        this.list["heal"] =             new Skill({name: "Heal",                        key_name: "heal",           class_levels: this.class_levels,    ability: this.stats.wis});
        this.list["intimidate"] =       new Skill({name: "Intimidate",                  key_name: "intimidate",     class_levels: this.class_levels,    ability: this.stats.cha});
        this.list["karcana"] =          new Skill({name: "Knowledge (Arcana)",          key_name: "karcana",        class_levels: this.class_levels,    ability: this.stats.int,   trained_only: true});
        this.list["kdungeoneering"] =   new Skill({name: "Knowledge (Dungeoneering)",   key_name: "kdungeoneering", class_levels: this.class_levels,    ability: this.stats.int,   trained_only: true});
        this.list["kengineering"] =     new Skill({name: "Knowledge (Engineering)",     key_name: "kengineering",   class_levels: this.class_levels,    ability: this.stats.int,   trained_only: true});
        this.list["kgeography"] =       new Skill({name: "Knowledge (Geography)",       key_name: "kgeography",     class_levels: this.class_levels,    ability: this.stats.int,   trained_only: true});
        this.list["khistory"] =         new Skill({name: "Knowledge (History)",         key_name: "khistory",       class_levels: this.class_levels,    ability: this.stats.int,   trained_only: true});
        this.list["klocal"] =           new Skill({name: "Knowledge (Local)",           key_name: "klocal",         class_levels: this.class_levels,    ability: this.stats.int,   trained_only: true});
        this.list["knature"] =          new Skill({name: "Knowledge (Nature)",          key_name: "knature",        class_levels: this.class_levels,    ability: this.stats.int,   trained_only: true});
        this.list["knobility"] =        new Skill({name: "Knowledge (Nobility)",        key_name: "knobility",      class_levels: this.class_levels,    ability: this.stats.int,   trained_only: true});
        this.list["kplanes"] =          new Skill({name: "Knowledge (Planes)",          key_name: "kplanes",        class_levels: this.class_levels,    ability: this.stats.int,   trained_only: true});
        this.list["kreligion"] =        new Skill({name: "Knowledge (Religion)",        key_name: "kreligion",      class_levels: this.class_levels,    ability: this.stats.int,   trained_only: true});
        this.list["linguistics"] =      new Skill({name: "Linguistics",                 key_name: "linguistics",    class_levels: this.class_levels,    ability: this.stats.int,   trained_only: true});
        this.list["perception"] =       new Skill({name: "Perception",                  key_name: "perception",     class_levels: this.class_levels,    ability: this.stats.wis});
        this.list["perform1"] =         new Skill({name: "Perform 1",                   key_name: "perform1",       class_levels: this.class_levels,    ability: this.stats.cha});
        this.list["perform2"] =         new Skill({name: "Perform 2",                   key_name: "perform2",       class_levels: this.class_levels,    ability: this.stats.cha});
        this.list["profession1"] =      new Skill({name: "Profession 1",                key_name: "profession1",    class_levels: this.class_levels,    ability: this.stats.wis,   trained_only: true});
        this.list["profession2"] =      new Skill({name: "Profession 2",                key_name: "profession2",    class_levels: this.class_levels,    ability: this.stats.wis,   trained_only: true});
        this.list["ride"] =             new Skill({name: "Ride",                        key_name: "ride",           class_levels: this.class_levels,    ability: this.stats.dex});
        this.list["sensemotive"] =      new Skill({name: "Sense Motive",                key_name: "sensemotive",    class_levels: this.class_levels,    ability: this.stats.wis});
        this.list["sleightofhand"] =    new Skill({name: "Sleight of Hand",             key_name: "sleightofhand",  class_levels: this.class_levels,    ability: this.stats.dex,   trained_only: true});
        this.list["spellcraft"] =       new Skill({name: "Spellcraft",                  key_name: "spellcraft",     class_levels: this.class_levels,    ability: this.stats.int,   trained_only: true});
        this.list["stealth"] =          new Skill({name: "Stealth",                     key_name: "stealth",        class_levels: this.class_levels,    ability: this.stats.dex});
        this.list["survival"] =         new Skill({name: "Survival",                    key_name: "survival",       class_levels: this.class_levels,    ability: this.stats.wis});
        this.list["swim"] =             new Skill({name: "Swim",                        key_name: "swim",           class_levels: this.class_levels,    ability: this.stats.str});
        this.list["usemagicdevice"] =   new Skill({name: "Use Magic Device",            key_name: "usemagicdevice", class_levels: this.class_levels,    ability: this.stats.cha,   trained_only: true});
    }
    
    // Inheritance from Data:
    Skills.prototype = Object.create(Data.prototype);
    Skills.prototype.constructor = Skills;
    
    return Skills;
});

csheetApp.factory("Initiative", function(Data) {
    // Constructor
    // - ability : Stat
    // - misc : Integer
    function Initiative(template, updaters) {
        if (typeof template !== 'object' || typeof template.ability !== 'object' || !template.ability.hasOwnProperty("ability_mod")) {
            throw new TypeError("ability expected to be Stat object");
        }
        var newInit = {
            "total": "",
            "ability": {},
            "misc": 0
        }
        
        angular.extend(newInit, template);
        
        Data.call(this, newInit, updaters);
        
        this.dataName = "data|initiative";
        
        this.dependBatch({
            "total":    [{obj: this.ability, property: "ability_mod"},
                         {obj: this,         property: "misc"}]
        });
    }
    
    // Inheritance from Data:
    Initiative.prototype = Object.create(Data.prototype);
    Initiative.prototype.constructor = Initiative;
    
    return Initiative;
});

csheetApp.factory("Armorclass", function(Data, Bonus) {
    // Constructor:
    function Armorclass(template, updaters) {
        if (    typeof template !== 'object' || 
                typeof template.ability !== 'object' || 
                !template.ability.hasOwnProperty("ability_mod")) {
            throw new TypeError("ability expected to be Stat object");
        }
        if (    typeof template !== 'object' || 
                typeof template.classrace !== 'object' || 
                !template.classrace.hasOwnProperty("size_mod")) {
            throw new TypeError("classrace expected to be Classrace object");
        }
        if (    typeof template !== 'object' || 
                typeof template.equipment !== 'object' || 
                !template.equipment.hasOwnProperty("armor")) {
            throw new TypeError("equipment expected to be ACItems object");
        }
        var newAC = {
            bonuses: new Bonus({
                inherent: 10
            }),
            total: 0,
            touch: 0,
            flat: 0,
            ability: {},
            ability_mod: 0,
            classrace: {},
            misc: 0,
            other: "",
            equipment: {}
        }
        var newUpdaters = {
            ability_mod: function(dependencies) {
                if (dependencies.length > 0) {
                    var new_value = null;
                    var maxdex = null;
                    for (var i = 0; i < dependencies.length; i++) {
                        if (typeof dependencies[i] == 'object' && dependencies[i] !== null && dependencies[i].hasOwnProperty("maxdex")) {
                            maxdex = dependencies[i].maxdex;
                        }
                        else if (dependencies[i] !== null) {
                            new_value = (new_value == null ? dependencies[i] : Math.max(new_value, dependencies[i]));
                        }
                    }
                    if (maxdex !== null) {
                        new_value = Math.min(new_value, maxdex);
                    }
                }
                return new_value;
            }
        }
        
        angular.extend(newAC, template);
        angular.extend(newUpdaters, updaters);
        
        Data.call(this, newAC, newUpdaters);
        
        this.dataName = "data|armorclass"
        
        this.bonuses.dependBatch({
            "armor":    [{obj: this.equipment,       property: "armor"}],
            "shield":   [{obj: this.equipment,       property: "shield"}]
        })
        
        this.dependBatch({
            // Ability modifier is the greater of mod and mod_temp 
            // from the ability object, adjusted for max dex
            "ability_mod":  [{obj: this.ability,   property: "mod"},
                             {obj: this.ability,   property: "mod_temp"},
                             {obj: this,           property: "equipment"}],
            "misc":         [{obj: this.bonuses,   property: "dodge"},
                             {obj: this.bonuses,   property: "insight"},
                             {obj: this.bonuses,   property: "luck"},
                             {obj: this.bonuses,   property: "profane"},
                             {obj: this.bonuses,   property: "sacred"},
                             {obj: this.bonuses,   property: "trait"},
                             {obj: this.bonuses,   property: "untyped"}],
                             
            "touch":        [{obj: this.bonuses,   property: "deflection"},
                             {obj: this.bonuses,   property: "dodge"},
                             {obj: this.bonuses,   property: "inherent"},
                             {obj: this.bonuses,   property: "insight"},
                             {obj: this.bonuses,   property: "luck"},
                             {obj: this.bonuses,   property: "profane"},
                             {obj: this.bonuses,   property: "sacred"},
                             {obj: this.classrace, property: "size_mod"},
                             {obj: this.bonuses,   property: "trait"},
                             {obj: this.bonuses,   property: "untyped"},
                             {obj: this,           property: "ability_mod"}],
                             
            "flat":         [{obj: this.bonuses,   property: "armor"},
                             {obj: this.bonuses,   property: "deflection"},
                             {obj: this.bonuses,   property: "inherent"},
                             {obj: this.bonuses,   property: "insight"},
                             {obj: this.bonuses,   property: "luck"},
                             {obj: this.bonuses,   property: "natarmor"},
                             {obj: this.bonuses,   property: "profane"},
                             {obj: this.bonuses,   property: "sacred"},
                             {obj: this.bonuses,   property: "shield"},
                             {obj: this.classrace, property: "size_mod"},
                             {obj: this.bonuses,   property: "trait"},
                             {obj: this.bonuses,   property: "untyped"}],
                             
            "total":        [{obj: this.bonuses,   property: "armor"},
                             {obj: this.bonuses,   property: "deflection"},
                             {obj: this.bonuses,   property: "dodge"},
                             {obj: this.bonuses,   property: "inherent"},
                             {obj: this.bonuses,   property: "insight"},
                             {obj: this.bonuses,   property: "luck"},
                             {obj: this.bonuses,   property: "natarmor"},
                             {obj: this.bonuses,   property: "profane"},
                             {obj: this.bonuses,   property: "sacred"},
                             {obj: this.bonuses,   property: "shield"},
                             {obj: this.classrace, property: "size_mod"},
                             {obj: this.bonuses,   property: "trait"},
                             {obj: this.bonuses,   property: "untyped"},
                             {obj: this,           property: "ability_mod"}]
        });
    }
    
    // Inheritance from Data:
    Armorclass.prototype = Object.create(Data.prototype);
    Armorclass.prototype.constructor = Armorclass;
    
    return Armorclass;
});

csheetApp.factory("ACItems", function(Data, Bonus) {
    // Constructor:
    function ACItems(template, updaters) {
        var newAC = {
            list: [],
            totals: new Data({
                bonus: new Bonus(),
                armor: new Bonus(),
                shield: new Bonus(),
                atk_penalty: new Bonus(),
                slot: "",
                type: "",
                check: 0,
                spellfailure: 0,
                weight: "",
                properties: "",
                maxdex: 0
            },{
                bonus: function(d) {
                    var base = new Bonus()
                    for (var i = 0; i < d.length; i++) {
                        if (d[i].armor > 0) {
                            base.armor = d[i].valueOf();
                        }
                        else if (d[i].shield > 0) {
                            base.shield = d[i].valueOf();
                        }
                    }
                    return base;
                },
                armor: function(d) {
                    var base = new Bonus()
                    var list = d[0]
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].type == "armor") {
                            base = base.add(list[i].ac_bonuses);
                        }
                    }
                    return base;
                },
                shield: function(d) {
                    var base = new Bonus()
                    var list = d[0]
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].type == "shield") {
                            base = base.add(list[i].ac_bonuses);
                        }
                    }
                    return base;
                },
                atk_penalty: function(d) {
                    var base = 0
                    for (var i = 0; i < d.length; i++) {
                        if (Array.isArray(d[i])) {
                            var list = d[i]
                            // Cycle through each Armor in the array
                            for (var j = 0; j < list.length; j++) {
                                base += list[j].atk_penalty
                            }
                        }
                        else {
                            base += d[i];
                        }
                    }
                    return base;
                },
                check: function(d) {
                    var base = 0
                    for (var i = 0; i < d.length; i++) {
                        if (Array.isArray(d[i])) {
                            var list = d[i]
                            // Cycle through each Armor in the array
                            for (var j = 0; j < list.length; j++) {
                                base += list[j].acp
                            }
                        }
                        else {
                            base += d[i];
                        }
                    }
                    return base;
                },
                spellfailure: function(d) {
                    var base = 0
                    for (var i = 0; i < d.length; i++) {
                        if (Array.isArray(d[i])) {
                            var list = d[i]
                            // Cycle through each Armor in the array
                            for (var j = 0; j < list.length; j++) {
                                base += list[j].spellfailure
                            }
                        }
                        else {
                            base += d[i];
                        }
                    }
                    return base;
                },
                weight: function(d) {
                    var base = 0
                    for (var i = 0; i < d.length; i++) {
                        if (Array.isArray(d[i])) {
                            var list = d[i]
                            // Cycle through each Armor in the array
                            for (var j = 0; j < list.length; j++) {
                                base += list[j].weight
                            }
                        }
                        else {
                            base += d[i];
                        }
                    }
                    return base;
                },
                maxdex: function(d) {
                    var base = 1000;
                    for (var i = 0; i < d.length; i++) {
                        if (Array.isArray(d[i])) {
                            var list = d[i];
                            // Cycle through each Armor in the array
                            for (var j = 0; j < list.length; j++) {
                                if (list[j].maxdex !== null) { 
                                    base = Math.min(base, list[j].maxdex);
                                }
                            }
                        }
                        else {
                            if (d[i].maxdex !== null) {
                                base = Math.min(base, d[i].maxdex);
                            }
                        }
                    }
                    return base
                }
            })
        }
        var newUpdaters = {
            
        }
        
        angular.extend(newAC, template);
        angular.extend(newUpdaters, updaters);
        
        Data.call(this, newAC, newUpdaters);
        
        this.dataName = "data|acitems"
        
        this.totals.dependBatch({
            "bonus":        [{obj: this.totals,     property: "armor"},
                             {obj: this.totals,     property: "shield"}],
            "armor":        [{obj: this,            property: "list"}],
            "shield":       [{obj: this,            property: "list"}],
            "atk_penalty":  [{obj: this,            property: "list"}],
            "spellfailure": [{obj: this,            property: "list"}],
            "weight":       [{obj: this,            property: "list"}],
            "check":        [{obj: this,            property: "list"}],
            "maxdex":       [{obj: this,            property: "list"}]
        });
    }
    
    // Inheritance from Data:
    ACItems.prototype = Object.create(Data.prototype);
    ACItems.prototype.constructor = ACItems;
    
    return ACItems;
});

csheetApp.factory("Savingthrow", function(Data) {
    // Constructor
    // - base : Integer
    // - ability : Stat
    // - magic : Integer
    // - misc : Integer
    // - temp : Integer
    function Savingthrow(template, updaters) {
        if (typeof template !== 'object' || typeof template.ability !== 'object' || !template.ability.hasOwnProperty("ability_mod")) {
            throw new TypeError("ability expected to be Stat object");
        }
        var newSave = {
                "name": "",
                "total": 0,
                "base": 0,
                "ability": 0,
                "magic": 0,
                "misc": 0,
                "temp": 0
        };
        var newUpdaters = {
            /*
            base: function(deps) {
                var base = 0;
                for (var i = 0; i < deps.length; i++) {
                    var dep = deps[i];
                    if (dep.hasOwnProperty("length")) {
                        // Sum up the appropriate save bonus in the Levels array
                        for (var j = 0; j < dep.length; j++) {
                            base += dep[j].base;
                        }
                    }
                    else
                    {
                        base += dep;
                    }
                }
                return base;
            },*/
        };
        
        angular.extend(newSave, template);
        angular.extend(newUpdaters, updaters);
        
        Data.call(this, newSave, updaters);
        
        this.dataName = "saving throw|" + this.name.toLowerCase();
        
        this.dependBatch({
            "total":    [{obj: this,         property: "base"},
                         {obj: this.ability, property: "ability_mod"},
                         {obj: this,         property: "magic"},
                         {obj: this,         property: "misc"},
                         {obj: this,         property: "temp"}]
        });
    }
    
    // Inheritance from Data:
    Savingthrow.prototype = Object.create(Data.prototype);
    Savingthrow.prototype.constructor = Savingthrow;
    
    return Savingthrow;
});

csheetApp.factory("Bab", function(Data, xsignFilter) {
    // Constructor
    // - bab : Integer
    function Bab(template, updaters) {
        var newBab = {
            base: 0,
            attacks: "",
            class_levels: null
        };
        var newUpdaters = {
            attacks: function(dependencies) {
                var new_attacks;
                if (dependencies.length > 0) {
                    var new_value = 0;
                    for (var i = 0; i < dependencies.length; i++) {
                        new_value += +(dependencies[i]);
                    }
                    new_attacks = xsignFilter(new_value);
                    if (new_value >= 6) {
                        new_attacks += "/" + xsignFilter(new_value - 5);
                    }
                    if (new_value >= 11) {
                        new_attacks += "/" + xsignFilter(new_value - 10);
                    }
                    if (new_value >= 16) {
                        new_attacks += "/" + xsignFilter(new_value - 15);
                    }
                }
                return new_attacks;
            },
            base: function(deps) {
                var bab = 0;
                for (var i = 0; i < deps.length; i++) {
                    var dep = deps[i];
                    if (dep.hasOwnProperty("length")) {
                        // Sum up the BAB bonuses in the Levels array
                        for (var j = 0; j < dep.length; j++) {
                            bab += dep[j].bab;
                        }
                    }
                    else
                    {
                        bab += dep;
                    }
                }
                return bab;
            }
        }
        
        angular.extend(newBab, template);
        angular.extend(newUpdaters, updaters);
        
        Data.call(this, newBab, newUpdaters);
        
        this.dataName = "data|base attack bonus";
        
        this.depend("attacks", this, "base");
    }
    
    // Inheritance from Data:
    Bab.prototype = Object.create(Data.prototype);
    Bab.prototype.constructor = Bab;
    
    return Bab;
});

csheetApp.factory("Cmb", function(Data) {
    // Constructor
    // - bab : Bab
    // - ability : Stat
    // - classrace : Classrace
    // - other : String
    function Cmb(template, updaters) {
        if (    typeof template !== 'object' || 
                typeof template.bab !== 'object' || 
                !template.bab.hasOwnProperty("base")) {
            throw new TypeError("bab expected to be Bab object");
        }
        if (    typeof template !== 'object' || 
                typeof template.ability !== 'object' || 
                !template.ability.hasOwnProperty("ability_mod")) {
            throw new TypeError("ability expected to be Stat object");
        }
        if (    typeof template !== 'object' || 
                typeof template.classrace !== 'object' || 
                !template.classrace.hasOwnProperty("special_size_mod")) {
            throw new TypeError("classrace expected to be Classrace object");
        }
        var newCmb = {
            "total": 0,
            "bab": {},
            "ability": {},
            "size_mod": 0,
            "classrace": {},
            "other": ""
        };
        
        angular.extend(newCmb, template);
        
        Data.call(this, newCmb, updaters);
        
        this.dataName = "data|combat maneuver bonus";
        
        this.dependBatch({
            "total":    [{obj: this.bab,          property: "base"},
                         {obj: this.ability,      property: "ability_mod"},
                         {obj: this.classrace,    property: "special_size_mod"}],
            "size_mod":  [{obj: this.classrace,    property: "special_size_mod"}]
        });
    }
    
    // Inheritance from Data:
    Cmb.prototype = Object.create(Data.prototype);
    Cmb.prototype.constructor = Cmb;
    
    return Cmb;
});

csheetApp.factory("Cmd", function(Data) {
    // Constructor
    // - bab : Bab
    // - ability1 : Stat
    // - ability2 : Stat
    // - classrace : Classrace
    function Cmd(template, updaters) {
        if (    typeof template !== 'object' || 
                typeof template.bab !== 'object' || 
                !template.bab.hasOwnProperty("base")) {
            throw new TypeError("bab expected to be Bab object");
        }
        if (    typeof template !== 'object' || 
                typeof template.ability1 !== 'object' || 
                !template.ability1.hasOwnProperty("ability_mod")) {
            throw new TypeError("ability1 expected to be Stat object");
        }
        if (    typeof template !== 'object' || 
                typeof template.ability2 !== 'object' || 
                !template.ability2.hasOwnProperty("ability_mod")) {
            throw new TypeError("ability2 expected to be Stat object");
        }
        if (    typeof template !== 'object' || 
                typeof template.classrace !== 'object' || 
                !template.classrace.hasOwnProperty("special_size_mod")) {
            throw new TypeError("classrace expected to be Classrace object");
        }
        var newCmd = {
            "base": 10,
            "total": 0,
            "bab": {},
            "ability1": {},
            "ability2": {},
            "size_mod": 0,
            "classrace": {},
        };
        
        angular.extend(newCmd, template);
        
        Data.call(this, newCmd, updaters);
        
        this.dataName = "data|combat maneuver defense";
        
        this.dependBatch({
            "total":    [{obj: this,            property: "base"},
                         {obj: this.bab,        property: "base"},
                         {obj: this.ability1,   property: "ability_mod"},
                         {obj: this.ability2,   property: "ability_mod"},
                         {obj: this.classrace,  property: "special_size_mod"}],
            "size_mod":  [{obj: this.classrace,  property: "special_size_mod"}]
        });
    }
    
    // Inheritance from Data:
    Cmd.prototype = Object.create(Data.prototype);
    Cmd.prototype.constructor = Cmd;
    
    return Cmd;
});

csheetApp.factory("Abilities", function(Data, SelectorSlot) {
    function Abilities(template, updaters) {
        var newCmd = {
            "list": []
        };
        var updaters = {
            "list": function(d) {
                // Dependencies are either an Ability or a ClassLevels object with a list of abilities
                // Returns a flat list of Abilities
                var list = [];
                for (var i = 0; i < d.length; i++) {
                    if (typeof d[i] === "object" && "ability_id" in d[i]) {
                        list.push(d[i])
                    }
                    else if (typeof d[i] === "object" && "levels" in d[i] && Array.isArray(d[i]["levels"])) {
                        // Loop through the levels in the ClassLevels object
                        for (var j = 0; j < d[i]["levels"].length; j++) {
                            if (typeof d[i]["levels"][j] === "object" && "class_level" in d[i]["levels"][j]) {
                                // Loop through the abilities in the level
                                for (var k = 0; k < d[i]["levels"][j].abilities.length; k++) {
                                    if (typeof d[i]["levels"][j].abilities[k] === "object" && "ability_id" in d[i]["levels"][j].abilities[k]) {
                                        list.push(d[i]["levels"][j].abilities[k])
                                    }
                                }
                            }
                        }
                    }
                }
                return list;
            }
        }
        
        //angular.extend(newCmd, template);
        
        Data.call(this, newCmd, updaters);
        this.thisChar = template.thisChar;
        this.dataName = "data|abilities";
        
        this.___.list.refresh = (function(thisChar) {
            return function() {
                var dependencyList = [];
                var depLen = this.dependencies.length
                for (var i = 0; i < depLen; i++) {
                    dependencyList.push(this.dependencies[i].obj[this.dependencies[i].property]);
                }
                
                var oldList = this.value;
                var newList = this.update(dependencyList);
                
                for (var i = 0; i < oldList.length; i++) {
                    if (newList.indexOf(oldList[i]) == -1) {
                        oldList[i].remove(thisChar);
                    }
                }
                for (var j = 0; j < newList.length; j++) {
                    if (oldList.indexOf(newList[j]) == -1) {
                        newList[j].applyTo(thisChar);
                    }
                }
                
                this.value = newList;
            }
        })(this.thisChar)
        /*
        Object.observe(this, (function(abilities) {
            return function(e) {
                if (e[0].type == "update" && e[0].name == "list") {
                    var oldList = (Array.isArray(e[0].oldValue) ? e[0].oldValue : []);
                    for (var i = 0; i < oldList.length; i++) {
                        if (abilities.list.indexOf(oldList[i]) == -1) {
                            oldList[i].remove(abilities.thisChar)
                        }
                    }
                    for (var j = 0; j < abilities.list.length; j++) {
                        if (oldList.indexOf(abilities.list[j]) == -1) {
                            abilities.list[j].applyTo(abilities.thisChar)
                        }
                    }
                }
            }
        })(this));
        */
    }
    
    // Inheritance from Data:
    Abilities.prototype = Object.create(Data.prototype);
    Abilities.prototype.constructor = Abilities;
    
    Abilities.prototype.newAbilitySlot = function() {
        return new SelectorSlot({
            "selector_list": this.thisChar.rulesets.feats.list,
            "filter": function(obj) {
                if (obj != null && typeof obj === "object" && obj.hasOwnProperty("feat_id")) {
                    return obj;
                }
                return null;
            }
        });
    }
    Abilities.prototype.addAbility = function(ability) {
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i] != null && typeof this.list[i] == "object" && this.list[i].hasOwnProperty("slot")) {
                // SelectorSlot found. Try to assign the ability...
                if (this.list[i].isEmpty()) {
                    this.list[i].assignSlot(ability);
                    return true; // Success! The ability was assigned to the empty slot.
                }
                // Otherwise, the FeatSlot either had a ability already or the ability didn't match its filter.
            }
        }
        console.log("Unable to add ability", ability);
        return false;
    }
    Abilities.prototype.getAbility = function(ability_id) {
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i] != null && typeof this.list[i] == "object" && this.list[i].hasOwnProperty("ability_id")) {
                if (this.list[i].ability_id == ability_id) {
                    return this.list[i];
                }
            }
        }
        console.log("Unable to find ability", ability_id);
        return null;
    }
    return Abilities;
});

csheetApp.factory("Feats", function(Data, SelectorSlot) {
    function Feats(template, updaters) {
        var newCmd = {
            "list": []
        };
        var updaters = {
            "list": function(d) {
                // Dependencies are either a SelectorSlot or a "levels" array from the ClassLevels object
                // Returns a flat list of SelectorSlots
                var list = [];
                for (var i = 0; i < d.length; i++) {
                    if (d[i] !== null && typeof d[i] === "object" && "slot" in d[i]) {
                        list.push(d[i])
                    }
                    else if (d[i] !== null && Array.isArray(d[i])) {
                        // Loop through the levels in the ClassLevels object
                        for (var j = 0; j < d[i].length; j++) {
                            if (typeof d[i][j] === "object" && "class_level" in d[i][j] && d[i][j].hasOwnProperty("feat_slot") && d[i][j].feat_slot != null) {
                                list.push(d[i][j].feat_slot);
                            }
                        }
                    }
                }
                return list;
            }
        }
        
        //angular.extend(newCmd, template);
        
        Data.call(this, newCmd, updaters);
        this.thisChar = template.thisChar;
        this.dataName = "data|feats";
    }
    
    // Inheritance from Data:
    Feats.prototype = Object.create(Data.prototype);
    Feats.prototype.constructor = Feats;
    
    Feats.prototype.newFeatSlot = function() {
        return new SelectorSlot({
            "selector_list": this.thisChar.rulesets.feats.list,
            "filter": function(obj) {
                if (obj != null && typeof obj === "object" && obj.hasOwnProperty("feat_id")) {
                    return obj;
                }
                return null;
            }
        });
    }
    Feats.prototype.addFeat = function(feat, selections) {
        if (!feat.prereqsMet(this.thisChar)) {
            console.log("Prereqs not met for feat", feat);
            return false;
        }
        for (var i = 0; i < this.list.length; i++) {
            if (this.list[i] != null && typeof this.list[i] == "object" && this.list[i].hasOwnProperty("slot")) {
                // SelectorSlot found. Try to assign the feat...
                if (this.list[i].isEmpty()) {
                    this.list[i].assignSlot(feat);
                    feat.applyTo(this.thisChar);
                    if (selections) {
                        for (var selection in selections) {
                            if (    feat.hasOwnProperty(selection) 
                                    && typeof(feat[selection]) === 'object'
                                    && feat[selection].hasOwnProperty("slot")) {
                                feat[selection].assignSlot(selections[selection]);
                            }
                        }
                    }
                    return true; // Success! The feat was assigned to the empty slot.
                }
                // Otherwise, the FeatSlot either had a feat already or the feat didn't match its filter.
            }
        }
        console.log("Unable to add feat", feat);
        return false;
    }
    return Feats;
});

csheetApp.factory("Rulesets", function(Data, ArmorLib, WeaponLib, PFClassLib, PFFeatsLib, PFClassAbilitiesLib) {
    function Rulesets() {
        var newRulesets = {
            weapons: new WeaponLib("Data/Gear%20-%20Weapons.csv", (function(thisObj) {
                return function() {
                    
                    thisObj.loaded++;
                }
            })(this)),
            armors: new ArmorLib("Data/Gear%20-%20Armor.csv", (function(thisObj) {
                return function() {
                    thisObj.loaded++;
                }
            })(this)),
            classes: new PFClassLib("Data/Classes%20-%20Core_Data.csv", (function(thisObj) {
                return function() {
                    thisObj.loaded++;
                }
            })(this)),
            feats: new PFFeatsLib("Data/Feats%20-%20Feats.csv", (function(thisObj) {
                return function() {
                    thisObj.loaded++;
                }
            })(this)),
            loaded: 0,
            toLoad: 4,
            isLoaded: false
        };
        var updaters = {};
        
        Data.call(this, newRulesets, updaters);
        
        this.onLoaded = function(callback) {
            var self = this;
            if (!(callback && typeof callback == "function")) {
                throw new TypeError("callback expected to be function");
            }
            
            if (self.toLoad != self.loaded) {
                Object.observe(self, observer);
            }
            else {
                callback();
            }
            
            function observer(e) {
                for (var i = 0; i < e.length; i++) {
                    if (e[i].name == "loaded" && e[i].object.toLoad == e[i].object.loaded) 
                    {
                        e[i].object.isLoaded = true;
                        Object.unobserve(self, observer);
                        callback();
                        return;
                    }
                }
            };
        }
        
        return this;
    }
    
    // Inheritance from Data:
    Rulesets.prototype = Object.create(Data.prototype);
    Rulesets.prototype.constructor = Rulesets;
    
    return new Rulesets();
});

csheetApp.factory("Character", function(Data, Bonus, Abilities, Feats, Classrace, Stat, Speed, Skills, Initiative, Armorclass, ACItems, Savingthrow, Bab, Cmb, Cmd, ClassLevels, Rulesets) {
    // Constructor (empty)
    function Character(loading) {
        var newChar = {
            classrace: new Classrace(),
            stats: new Data({
                str: new Stat({"name": "str"}),
                dex: new Stat({"name": "dex"}),
                con: new Stat({"name": "con"}),
                int: new Stat({"name": "int"}),
                wis: new Stat({"name": "wis"}),
                cha: new Stat({"name": "cha"})
            }),
            hitpoints: new Data({
                "total_hp": "",
                "dr": "",
                "current_hp": "",
                "nonlethal_hp": ""
            }),
            speeds: new Data({
                "base":     new Speed({"name": "base"}),
                "armor":    new Speed({"name": "armor"}),
                "fly":      new Speed({"name": "fly"}),
                "swim":     new Speed({"name": "swim"}),
                "climb":    new Speed({"name": "climb"}),
                "burrow":   new Speed({"name": "burrow"}),
                "temp": ""
            }),
            skills: undefined,
            initiative: undefined,
            acitems: new ACItems(),
            armorclass: undefined,
            savingthrows: undefined,
            baseattack: new Bab(),
            spellresistance: new Data({"total": ""}), // TODO: Break out spell resistance
            cmb: undefined,
            cmd: undefined,
            attacks: new Data({
                "melee": [],
                "ranged": []
            }), // TODO: Break out Attacks
            languages: [],
            gear: new Data({
                "items": [],
                "encumbrance": new Data({
                    "weight": "",
                    "light_load": "",
                    "medium_load": "",
                    "heavy_load": "",
                    "light_lift": "",
                    "medium_lift": "",
                    "heavy_lift": ""
                }),
                "money": new Data({
                    "copper": "",
                    "silver": "",
                    "gold": "",
                    "platinum": ""
                })
            }),
            feats: undefined,
            abilities: undefined,
            xp: new Data({
                "total": "",
                "nextlevel": ""
            }),
            spells: new Data({
                "spellstats": {
                    "zero": {
                        "known": "",
                        "savedc": "",
                        "perday": "",
                        "bonus": ""
                    },
                    "one": {
                        "known": "",
                        "savedc": "",
                        "perday": "",
                        "bonus": ""
                    },
                    "two": {
                        "known": "",
                        "savedc": "",
                        "perday": "",
                        "bonus": ""
                    },
                    "three": {
                        "known": "",
                        "savedc": "",
                        "perday": "",
                        "bonus": ""
                    },
                    "four": {
                        "known": "",
                        "savedc": "",
                        "perday": "",
                        "bonus": ""
                    },
                    "five": {
                        "known": "",
                        "savedc": "",
                        "perday": "",
                        "bonus": ""
                    },
                    "six": {
                        "known": "",
                        "savedc": "",
                        "perday": "",
                        "bonus": ""
                    },
                    "seven": {
                        "known": "",
                        "savedc": "",
                        "perday": "",
                        "bonus": ""
                    },
                    "eight": {
                        "known": "",
                        "savedc": "",
                        "perday": "",
                        "bonus": ""
                    },
                    "nine": {
                        "known": "",
                        "savedc": "",
                        "perday": "",
                        "bonus": ""
                    },
                },
                "modifiers": "",
                "schools": [],
                "prepared": {
                    "zero": [],
                    "one": [],
                    "two": [],
                    "three": [],
                    "four": [],
                    "five": [],
                    "six": [],
                    "seven": [],
                    "eight": [],
                    "nine": [],
                }
            }),
            toLoad: 4, // number of library files to load
            loaded: 0,
            isLoaded: false,
            rulesets: undefined
        };
        var updaters = {
            
        }
        
        Data.call(this, newChar, updaters);
        
        this.rulesets = Rulesets
        console.log(this.rulesets)
        this.onLoaded = function(callback) {
            Rulesets.onLoaded(callback)
        }
        
        Rulesets.onLoaded((function(self) { return function() {
            Rulesets.weapons.groups.cat_light_melee.depend("atk_ability",           self.stats.str, "ability_mod")
            Rulesets.weapons.groups.cat_one_handed_firearm.depend("atk_ability",    self.stats.dex, "ability_mod")
            Rulesets.weapons.groups.cat_one_handed_melee.depend("atk_ability",      self.stats.str, "ability_mod")
            Rulesets.weapons.groups.cat_ranged_projectile.depend("atk_ability",     self.stats.dex, "ability_mod")
            Rulesets.weapons.groups.cat_ranged_thrown.depend("atk_ability",         self.stats.dex, "ability_mod")
            Rulesets.weapons.groups.cat_two_handed_firearm.depend("atk_ability",    self.stats.dex, "ability_mod")
            Rulesets.weapons.groups.cat_two_handed_melee.depend("atk_ability",      self.stats.str, "ability_mod")
            Rulesets.weapons.groups.cat_unarmed_attack.depend("atk_ability",        self.stats.str, "ability_mod")
            Rulesets.weapons.groups.cat_kinetic_blasts.depend("atk_ability",        self.stats.dex, "ability_mod")
            
            Rulesets.weapons.groups.cat_light_melee.depend("dmg_ability",           self.stats.str, "ability_mod")
            Rulesets.weapons.groups.cat_one_handed_melee.depend("dmg_ability",      self.stats.str, "ability_mod")
            Rulesets.weapons.groups.cat_ranged_thrown.depend("dmg_ability",         self.stats.str, "ability_mod")
            Rulesets.weapons.groups.cat_two_handed_melee.depend("dmg_ability",      self.stats.str, "ability_mod")
            Rulesets.weapons.groups.cat_unarmed_attack.depend("dmg_ability",        self.stats.str, "ability_mod")
            Rulesets.weapons.groups.cat_kinetic_blasts.depend("dmg_ability",        self.stats.con, "ability_mod")
            
            // Now that the base map is built and the rules are loaded, set up objects with internal linkages:
        
            self.feats = new Feats({"thisChar": self})
            self.abilities = new Abilities({"thisChar": self})
            self.initiative = new Initiative({ability: self.stats.dex});
            self.armorclass = new Armorclass({
                ability: self.stats.dex, 
                classrace: self.classrace, 
                equipment: self.acitems.totals
            });
            self.savingthrows = new Data({
                "list": {
                    "fortitude":    new Savingthrow({ability: self.stats.con, name: "fortitude"}),
                    "reflex":       new Savingthrow({ability: self.stats.dex, name: "reflex"}),
                    "will":         new Savingthrow({ability: self.stats.wis, name: "will"}),
                },
                "mod": []
            }, {
                "mod": function(d) {
                    var mods = [];
                    for (var i = 0; i < d.length; i++) {
                        if (typeof d[i] === 'string') {
                            mods.push(d[i]);
                        }
                    }
                    return mods;
                }
            });        
            self.cmb = new Cmb({
                bab: self.baseattack, 
                ability: self.stats.str, 
                classrace: self.classrace
            });
            self.cmd = new Cmd({
                bab: self.baseattack, 
                ability1: self.stats.str, 
                ability2: self.stats.dex, 
                classrace: self.classrace
            });
    
            self.classrace.class_levels = new ClassLevels({
                hp_ability: self.stats.con,
                sp_ability: self.stats.int,
                bab: self.baseattack,
                fort_save: self.savingthrows.list.fortitude,
                ref_save: self.savingthrows.list.reflex,
                will_save: self.savingthrows.list.will,
                all_classes_list: Rulesets.classes,
                feats: self.feats
            });
            self.feats.depend("list", self.classrace.class_levels, "levels");
            self.abilities.depend("list", self.classrace, "class_levels");
            self.skills = new Skills({
                class_levels: self.classrace.class_levels,
                stats: self.stats
            });
            self.hitpoints.dependBatch({
                total_hp: [{obj: self.classrace.class_levels, property: "leveling_hp"}]
            });
        }})(this));
        
        
    }
    
    // Inheritance from Data:
    Character.prototype = Object.create(Data.prototype);
    Character.prototype.constructor = Character;
    
    Character.prototype.onLoaded = function(callback) {
        var thisChar = this;
        if (!(callback && typeof callback == "function")) {
            throw new TypeError("callback expected to be function");
        }
        
        if (thisChar.toLoad != thisChar.loaded) {
            Object.observe(thisChar, observer);
        }
        else {
            callback();
        }
        
        function observer(e) {
            for (var i = 0; i < e.length; i++) {
                if (e[i].name == "loaded" && e[i].object.toLoad == e[i].object.loaded) 
                {
                    Object.unobserve(thisChar, observer);
                    callback();
                    return;
                }
            }
        };
    }
    
    return new Character();
});