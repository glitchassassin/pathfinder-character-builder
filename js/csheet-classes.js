/*global csheetApp*/
/*global angular*/

/**
 * @title General classes
 * @overview The "base" classes that the rest of the system relies on
 * @copyright (c) 2015 Greywether Games
 * @license MIT
 * @author Jon Winsley
*/

csheetApp.factory("Field", function() {
    /**
     * A Field object updates its *value* property automatically when its
     * dependencies change.
     * 
     * @class Field
     * @param {Any} newField Default field value may be any primitive or object type
     * @param {Function} [updater] Updater function to override default updater
     **/
    function Field(newField, updater) {
        /**
         * Array of dependencies to calculate field value from
         * 
         * @name Field#dependencies
         * @type Array
         **/
        this.dependencies = [];
        
        /**
         * Calculated data value
         * 
         * @name Field#value
         * @type Any
         **/
        this.value = newField;
        
        /**
         * Update() should be a stateless "pure" function. It takes an array 
         * as its argument, performs some calculations, and returns a value. 
         * To avoid complications, it should never reference any of the Field 
         * object's properties.
         * 
         * The default updater adds all dependencies together, either with an
         * add() function if the dependency is an object and has one, or by 
         * casting it as a number otherwise.
         * 
         * @memberof Field
         * @name update
         * @param {Array} List of values to calculate final value from. May be any kind of primitive or object.
         **/
        this.update = updater || function(dependencies) {
            var total = null;
            if (dependencies.length > 0) {
                var depLen = dependencies.length;
                for (var i = 0; i < depLen; i++) {
                    if (typeof dependencies[i] === "object" && dependencies[i] !== null && "add" in dependencies[i]) {
                        total = dependencies[i].add(total);
                    }
                    else if (dependencies[i] !== null && dependencies[i] !== undefined)  {
                        // Explicitly signed numbers are stored as strings. If
                        // this is an xsigned number, convert to a regular number
                        // instead of a string.
                        var unXsigned = (/^[\+\-]?\d+$/.test(dependencies[i]) ? Number(dependencies[i]) : dependencies[i]);
                        total = (total === null ? unXsigned : total + unXsigned);
                    }
                }
                return total;
            }
        };
    }
        
    /**
     * Recalculates the value property from the field's dependencies using 
     * the update() function.
     * 
     * @memberof Field
     **/
    Field.prototype.refresh = function() {
        var dependencyList = [];
        var depLen = this.dependencies.length
        for (var i = 0; i < depLen; i++) {
            dependencyList.push(this.dependencies[i].obj[this.dependencies[i].property]);
        }
        this.value = this.update(dependencyList);
        return this.value;
    };
        
    /**
     * If value is an object and has its own valueOf() function, return that.
     * Otherwise, return value cast as a Number.
     * 
     * @memberof Field
     **/
    Field.prototype.valueOf = function() {
        if (this.value === null) {
            return null;
        }
        else if (typeof this.value == "object" && this.value.hasOwnProperty('valueOf')) {
            return this.value.valueOf();
        }
        return Number(this.value);
    };
        
    /**
     * If value is an object and has its own toString() function, return that.
     * Otherwise, return value cast as a String.
     * 
     * @memberof Field
     **/
    Field.prototype.toString = function() {
        if (this.value === null) {
            return "";
        }
        else if (typeof this.value == "object" && this.value.hasOwnProperty('toString')) {
            return this.value.toString();
        }
        return String(this.value);
    };
    
    return Field;
});
    
csheetApp.factory("Data", function(Field) {
    /**
     * The Data class is a complex object that allows for data binding between
     * properties, so they update when their source properties change. 
     * Properties can only be defined during construction of the object, not
     * added after the fact.
     * 
     * @class Data
     * @param {Object} template - Template object to read properties from
     * @param {Object} [updaters] - List of custom updater functions to apply to corresponding properties in template object (property names must match)
     * @param {Object} [dependencies] - List of arrays of dependency links to establish (property names must match)
     **/
    function Data(template, updaters, dependencies) {
        /**
         * "Array" of fields that map to properties on the Data object.
         * 
         * @name Data#___
         * @type Object
         **/
        this.___ = new Object();
        Object.defineProperty(this, "___", { enumerable: false });
        
        /**
         * This property reserved for Angular (since Data objects don't support
         * on-the-fly extension).
         * 
         * @name Data#$$hashKey
         * @type undefined
         **/
        this.$$hashKey = undefined;
        Object.defineProperty(this, "$$hashKey", { enumerable: false });
        
        /**
         * A "name" to identify different objects/types. Formatted as `type|name`,
         * e.g., `feat|weapon finesse`. Should be unique per category|object;
         * dataName will be used to identify sources for bonuses to determine if
         * they stack.
         * 
         * @name Data#dataName
         * @type String
         **/
        this.dataName = "";
        Object.defineProperty(this, "dataName", { enumerable: false });
        
        
        // Functions to recursively observe changes to objects in child arrays
        function observeArray(field_value, notifier, fieldName) {
            Array.observe(field_value, (function(notifier, fieldName) {
                return function(e) {
                    if (fieldName == "levels") {
                        console.log(field_value, fieldName, e);
                    }
                    for (var i = 0; i < e.length; i++) {
                        notifier.notify({
                            type: "update",
                            name: fieldName
                        });
                        // If the field is an array, we also have to observe each object added to the array (and unobserve when it is removed):
                        if (e[i].type == "add" || (e[i].type == "splice" && e[i].addedCount == 1) && Array.isArray(e[i].object[e[i].index])) {
                            observeArray(e[i].object[e[i].index], notifier, fieldName)
                        }
                        else if (e[i].type == "add" || (e[i].type == "splice" && e[i].addedCount == 1) && typeof e[i].object[e[i].index] == "object" && e[i].object[e[i].index] !== null) {
                            observeObject(e[i].object[e[i].index], notifier, fieldName)
                        }
                        
                        // Okay, so I realize I can't properly unobserve with anonymous functions. This is a memory leak that I need to fix,
                        // but it works right now, so I'll put that off until later.
                        /*
                        if (e.type == "remove" && Array.isArray(e.object[e.name])) {
                            unobserveArray(e.object[e.name], notifier, fieldName)
                        }
                        else if (e.type == "remove" && typeof e.object[e.name] == "object" && e.object[e.name] !== null) {
                            unobserveObject(e.object[e.name], notifier, fieldName)
                        }
                        */
                    }
                }
            })(notifier, fieldName) );
        }
        function observeObject(field_value, notifier, fieldName) {
            Object.observe( field_value, (function(notifier, fieldName) {
                return function(e) {
                    for (var i = 0; i < e.length; i++) {
                        notifier.notify({
                            type: "update",
                            name: fieldName
                        });
                    }
                }
            })(notifier, fieldName) );
        }
        
        // Setup
        for (var field in template) {
            var updater = updaters && updaters.hasOwnProperty(field) ? updaters[field] : false;
            var deps = dependencies && dependencies.hasOwnProperty(field) ? dependencies[field] : [];
            
            // Set up new Field object with updater in internal this.___ object
            this.___[field] = new Field({}, updater);
            
            // Map field to property on that Data object
            Object.defineProperty(this, field, {
                get: (function(field) {
                        return function() { return field.value; }
                     })(this.___[field]),
                set: (function(field, fieldName) {
                        return function(newValue) { 
                            if (field.value != newValue) {
                                var oldValue = field.value;
                                field.value = newValue;
                                if (field.dependencies.length > 0) {
                                    // Field is being set to a particular value,
                                    // so should not be calculated from
                                    // dependencies.
                                    field.dependencies = [];
                                }
                                
                                // Send a notification to observers that this field was changed.
                                Object.getNotifier(this).notify({
                                    type: "update",
                                    name: fieldName,
                                    oldValue: oldValue
                                });
                                
                                // If this field is an object or array, we also have to observe that object (or child objects) for any updates and cascade them on down.
                                
                                
                                if (Array.isArray(field.value)) {
                                    observeArray(field.value, Object.getNotifier(this), fieldName)
                                }
                                else if (typeof field.value == "object" && field.value !== null) {
                                    observeObject(field.value, Object.getNotifier(this), fieldName)
                                }
                            }
                        }
                     })(this.___[field], field),
                enumerable: true
            });
            
            // Initialize field with stock value
            this[field] = template[field];
            
            // Set up any specified dependencies
            for (var i = 0; i < deps.length; i++) {
                this.depend(field, deps[i].obj, deps[i].property);
            }
            
        }
        
        // Lock the object and prevent future properties from being added.
        //Object.preventExtensions(this);
        
        
    }
    
    Data.prototype.dependsOn = function(obj) {
        for (var field in this.___) {
            if (typeof field == "object" && "dependencies" in field) {
                for (var dep in field.dependencies) {
                    if (dep.obj == obj || ("dependsOn" in dep.obj && dep.obj.dependsOn(obj))) {
                        return true;
                    }
                }
            }
        }
        return false;
    };
    
    /**
     * Adds a source to a field on a Data object. The field will monitor the
     * provided source object, and when it registers a change, it will call the
     * field's update() function to compile all its sources into a new value for
     * the field.
     * 
     * @memberof Data
     * @param {String} Field on this object to add a dependency for
     * @param {Object} Target object with property to observe
     * @param {String} Name of property on target object
     **/
    Data.prototype.depend = function(field, dataObject, property) {
        if (!this.___.hasOwnProperty(field)) {
            throw new TypeError("This object doesn't have a field \"" + field + "\"");
        }
        if (dataObject == null || !dataObject.hasOwnProperty("dataName")) {
            console.log(dataObject);
            throw new TypeError("dataObject expected to be Data object");
        }
        
        /*
        // Check if dependency is on a SelectorSlot
        // If so, and if the target property isn't on the object,
        // it's targeting the SelectorSlot's slotted object.
        if (dataObject.hasOwnProperty("slot") && !dataObject.hasOwnProperty(property)) {
            // Actually depending on the SelectorSlot's slotted object.
            // However, it might not be assigned (might be null). So,
            // watch the SelectorSlot object and assign (or destroy)
            // this dependency as the slot object is added or removed.
            Object.observe(dataObject, (function(self, field, property) {
                return function(events) {
                    for (var i in events) {
                        var e = events[i];
                        if (e.name == "slot") {
                            if ((e.type == "update" || e.type == "delete") && typeof(e.oldValue) === 'object' ) {
                                self.undepend(field, e.oldValue, property);
                            }
                            self.depend(field, e.object, property);
                        }
                    }
                };
            })(this, field, property));
            
            // Now, switch the SelectorSlot object out for the slotted object
            // itself, if it's set:
            
            if (dataObject.slot) {
                dataObject = dataObject.slot;
            }
            else {
                return // Nothing more to do until the slot object is assigned
            }
        }
        
        */
        
        
        // Check if dependency already exists
        for (var dep in this.___[field].dependencies) {
            if (typeof dep === "object" && dep.hasOwnProperty("obj")) {
                if (dataObject.dataName !== "" && dataObject.dataName == dep.obj.dataName) {
                    // dataObject has a dataName set, and it is the same as this
                    // dependency. Duplicate object detected. Check if property
                    // is the same.
                    if (dep.property == property) {
                        // This specific link already exists. No need to proceed.
                        return;
                    }
                }
            }
        }
        
        // Link does not exist. Check for dependency loops:
        
        if (dataObject.dependsOn(this)) {
            throw new ReferenceError("Dependency loop caught");
        }
        // Attach dependency to the field in question
        this.___[field].dependencies.push({
            obj: dataObject,
            property: property,
        });
        Object.observe(dataObject, (function(that, fields) {
            return function(e) {
                var recalcs = {};
                for (var event = 0; event < e.length; event++) {
                    for (var field in fields) {
                        if (typeof fields[field] !== "function") {
                            for (var j = 0; j < fields[field].dependencies.length; j++) {
                                if (e[event].name == fields[field].dependencies[j].property) {
                                    recalcs[field] = fields[field];
                                }
                            }
                        }
                    }
                }
            
                for (var field in recalcs) {
                    var notifier = Object.getNotifier(that);
                    var oldValue = recalcs[field].value;
                    var newValue = recalcs[field].refresh();
                    if (oldValue != newValue) {
                        // Values are different, but they could still be comparable
                        // objects with different references. Let's check.
                        if (((typeof oldValue != "object" || oldValue === null || !("equals" in oldValue) || !oldValue.equals(newValue)))) {
                            // Well, they definitely don't match. Notify.
                            notifier.notify({
                                type: 'update',
                                name: field,
                                oldValue: oldValue
                            });
                        }
                    }
                }
            }
        })(this, this.___));
        
        this.___[field].refresh();
        
        // Notify observers that this field has changed:
        Object.getNotifier(this).notify({
            type: "update",
            name: field
        });
    };
    
    /**
     * Removes a dependency from a field on a Data object, and recalculates the
     * field automatically. Identifies objects with dataName.
     * 
     * @memberof Data
     * @param {String} Field on this object to add a dependency for
     * @param {String} dataName of target object with linked property
     * @param {String} Name of property on target object
     **/
    Data.prototype.undepend = function(field, dataName, property) {
        if (!this.___.hasOwnProperty(field)) {
            throw new TypeError("This object doesn't have a field \"" + field + "\"");
        }
        
        if (dataName == "" || property == "") { return; }
        
        // Check if dependency exists. If so, remove it; if not, return quietly.
        for (var i in this.___[field].dependencies) {
            var dep = this.___[field].dependencies[i];
            if (typeof dep == "object" && dep.hasOwnProperty("obj")) {
                if (dataName != "" && dataName == dep.obj.dataName) {
                    if (dep.property == property) {
                        // Link exists. Remove from dependency list and 
                        // recalculate.
                        var idx = this.___[field].dependencies.indexOf(dep);
                        this.___[field].dependencies.splice(idx, 1);
                        this.___[field].refresh();
                        
                        // Notify observers that this field has changed:
                        Object.getNotifier(this).notify({
                            type: "update",
                            name: field
                        });
                        
                        // Since we're guaranteed not to have duplicate links
                        // by dataName, it's safe to return now.
                        return;
                    }
                }
            }
        }
    };
    
    /**
     * Shortcut form for depend() to set up multiple dependencies at once.
     * 
     * @memberof Data
     * @param {Object} fields - Basic object (properties named to match target properties on this Data object)
     * @param {Object} fields.any - Where *any* is a local property on this Data object
     * @param {Object} fields.any.obj - The target object with property to observe
     * @param {String} fields.any.property - The name of the property on the target object to observe
     **/
    Data.prototype.dependBatch = function(fields) {
        for (var field in fields) {
            var deplength = fields[field].length;
            for (var i = 0; i < deplength; i++) {
                this.depend(field, fields[field][i].obj, fields[field][i].property);
            }
        }
    };
    
    /**
     * Clones a Data object and any properties that are also objects. By default,
     * does not preserve dependency links. If preserve is true, individual 
     * properties are linked to the clone's parent object, so the clone will 
     * update when the parent does.
     * 
     * @memberof Data
     * @param {boolean} [preserve] - Preserve links?
     **/
    Data.prototype.clone = function(preserve) {
        var cloneFields = {};
        var cloneUpdaters = {};
        var cloneDependencies = {};
        for (var field in this.___) {
            // Clone field data...
            if (typeof this.___[field].value == "object" && this.___[field].value !== null && "clone" in this.___[field].value && typeof this.___[field].value.clone == "function") {
                // Object already has a clone() method (probably another Data 
                // object). Use that.
                cloneFields[field] = this.___[field].value.clone();
            }
            else if (typeof this.___[field].value == "object" && this.___[field].value !== null) {
                // "Extends" an empty object as an easy way to create a clone
                cloneFields[field] = angular.extend({}, this.___[field].value);
            }
            else {
                // Field value is not an object, so can be copied without issue.
                cloneFields[field] = this.___[field].value;
            }
            
            // Clone updater...
            cloneUpdaters[field] = this.___[field].update;
            
            if (preserve) {
                cloneDependencies[field] = [{obj: this, property: field}];
                /*
                for (var i = 0; i < this.___[field].dependencies.length; i++) {
                    if (this.___[field].dependencies[i].obj == this) {
                        cloneDependencies[field].push(this.___[field].dependencies[i]);
                    }
                }
                */
            }
        }
        var newClone = new this.constructor(cloneFields, cloneUpdaters, cloneDependencies);
        return newClone;
    };
    
    /**
     * Creates an object listing all the Data object's dependencies (by field).
     * 
     * @memberof Data
     * @param {String} [field] Field to list sources for
     * @returns Object
     **/
    Data.prototype.listSources = function(field) {
        if (typeof field != "string" || (!field in this.___)) {
            field = undefined;
        }
        var sources = {};
        var fields = (field? new Array(this.___[field]) : this.___);
        for (var field in fields) {
            if (fields[field].dependencies.length > 0) {
                sources[field] = [];
                for (var i = 0; i < fields[field].dependencies.length; i++) {
                    var dep = {
                        obj: fields[field].dependencies[i].obj,
                        name: fields[field].dependencies[i].obj.dataName,
                        property: fields[field].dependencies[i].property,
                        value: fields[field].dependencies[i].obj[fields[field].dependencies[i].property],
                        subdependencies: fields[field].dependencies[i].obj.listSources(fields[field].dependencies[i].property)
                    };
                    sources[field].push(dep);
                }
            }
        }
        return sources;
    };
    
    /**
     * Compares this object to the provided Data object
     * 
     * @memberof Data
     * @param {Data} dataObject - Object to compare with this
     * @return {boolean} True if data fields are identical, false otherwise
     **/
    Data.prototype.equals = function(dataObject) {
        if (typeof dataObject !== "object" || !(dataObject instanceof Data)) {
            return false; // Is not a data object
        }
        
        for (var field in dataObject) {
            if (!(field in this) ||
                (this[field] != dataObject[field]) ||
                (typeof this[field] == "object" && this[field] !== null && "equals" in this[field] && !this[field].equals(dataObject[field])) ||
                (typeof dataObject[field] == "object" && dataObject[field] !== null && "equals" in dataObject[field] && !dataObject[field].equals(this[field]))
                ) {
                return false;
            }
        }
        
        return true;
    };
    
    /**
     * Parses a string (e.g., "prop1.list.length") into an object reference
     * (this.prop1.list) and a property (length) and returns the object-property
     * pair referred to.
     * 
     * @memberof Data
     * @param {String} path - A path of property-objects to follow
     * @return {Object} pair - Target object-property pair (obj : property)
     **/
    Data.prototype.path = function(path) {
        var currentObj = this;
        var paths = path.split(".");
        var nextProp = paths[0];
        
        for (var i = 0; i < paths.length - 1; i++) {
            if (paths[i] in currentObj) {
                currentObj = currentObj[paths[i]];
                nextProp = paths[i+1];
            }
            else {
                throw new ReferenceError("Could not resolve invalid path " + path);
            }
        }
        
        return {
            obj: currentObj,
            property: nextProp
        }
    };
    
    /**
     * Provides an iterator for a Data object
     * 
     * @memberof Data
     **/
    Data.prototype[Symbol.iterator] = function* () {
        for (var field in this.___) {
            if (this.___[field] != null && typeof this.___[field] === "object" && this.___[field].hasOwnProperty("value")) {
                // field is a Field object.
                yield this.___[field].value;
            }
        }
    }
    
    Object.defineProperty(Data.prototype, "dependBatch", { enumerable: false });
    Object.defineProperty(Data.prototype, "depend", { enumerable: false });
    Object.defineProperty(Data.prototype, "dependsOn", { enumerable: false });
    Object.defineProperty(Data.prototype, "clone", { enumerable: false });
    Object.defineProperty(Data.prototype, "listSources", { enumerable: false });
    Object.defineProperty(Data.prototype, "equals", { enumerable: false });
    Object.defineProperty(Data.prototype, "path", { enumerable: false });
    
    return Data;
});

csheetApp.factory("Bonus", function(Data) {
    /**
     * A special kind of pre-defined Data class which calculates its total value
     * from its list of bonus types. Bonus objects can be added together, following
     * the Pathfinder rules for which bonus types stack and which do not.
     * 
     * @class Bonus
     * @param {Object} template - Template object to copy properties from
     * @param {Object} [updaters] - List of custom updater functions to apply to corresponding properties in template object (property names must match)
     * @param {Object} [dependencies] - List of arrays of dependency links to establish (property names must match)
     **/
    function Bonus(template, updaters, dependencies) {
        /**
         * An **ability bonus** comes from the character's inherent ability
         * score.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>Attacks</li>
         *      <li>Checks</li>
         *      <li>Damage</li>
         *      <li>Saves</li>
         *      <li>Etc.</li>
         * </ul>
         * 
         * @name Bonus#alchemical
         **/
        /**
         * An **alchemical bonus** is granted by the use of a non-magical, 
         * alchemical substance such as antitoxin.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>Ability scores</li>
         *      <li>Saves</li>
         * </ul>
         * 
         * @name Bonus#alchemical
         **/
        /**
         * An **armor bonus** applies to armor class and is granted by armor or 
         * by a spell or magical effect that mimics armor. Armor bonuses stack 
         * with all other bonuses to armor class (even with natural armor bonuses) 
         * except other armor bonuses. An armor bonus doesn't apply against touch 
         * attacks, except for armor bonuses granted by force effects (such as 
         * the mage armor spell) which apply against incorporeal touch attacks, 
         * such as that of a shadow.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>AC</li>
         * </ul>
         * 
         * @name Bonus#armor
         **/
        /**
         * A **Base Attack Bonus** is a modifier added to your attack rolls. A 
         * higher number means you're better at combat.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>Attacks</li>
         * </ul>
         * 
         * @name Bonus#baseattack
         **/
        /**
         * A **circumstance bonus (or penalty)** arises from specific conditional 
         * factors impacting the success of the task at hand. Circumstance bonuses 
         * stack with all other bonuses, including other circumstance bonuses, 
         * unless they arise from essentially the same source.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>Attacks</li>
         *      <li>Checks</li>
         * </ul>
         * 
         * @name Bonus#circumstance
         **/
        /**
         * A **competence bonus (or penalty)** affects a character's performance of 
         * a particular task, as in the case of the bardic ability to inspire 
         * competence. Such a bonus may apply on attack rolls, saving throws, 
         * skill checks, caster level checks, or any other checks to which a 
         * bonus relating to level or skill ranks would normally apply. It does 
         * not apply on ability checks, damage rolls, initiative checks, or other 
         * rolls that aren't related to a character's level or skill ranks. 
         * Multiple competence bonuses don't stack; only the highest bonus applies.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>Attacks</li>
         *      <li>Checks</li>
         *      <li>Saves</li>
         * </ul>
         * 
         * @name Bonus#competence
         **/
        /**
         * A **deflection bonus** affects armor class and is granted by a spell or 
         * magic effect that makes attacks veer off harmlessly. Deflection bonuses 
         * stack with all other bonuses to AC except other deflection bonuses. A 
         * deflection bonus applies against touch attacks.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>AC</li>
         * </ul>
         * 
         * @name Bonus#deflection
         **/
        /**
         * A **dodge bonus** improves armor class (and sometimes Reflex saves) 
         * resulting from physical skill at avoiding blows and other ill effects. 
         * Dodge bonuses are usually not granted by spells or magic items. 
         * Any situation or effect (except wearing armor) that negates a character's 
         * Dexterity bonus also negates any dodge bonuses the character may have. 
         * Dodge bonuses stack with all other bonuses to AC, even other dodge 
         * bonuses. Dodge bonuses apply against touch attacks.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>AC</li>
         * </ul>
         * 
         * @name Bonus#dodge
         **/
        /**
         * An **enhancement bonus** represents an increase in the sturdiness and/or 
         * effectiveness of armor or natural armor, or the effectiveness of a 
         * weapon, or a general bonus to an ability score. Multiple enhancement 
         * bonuses on the same object (in the case of armor and weapons), creature 
         * (in the case of natural armor), or ability score do not stack. Only 
         * the highest enhancement bonus applies. Since enhancement bonuses to 
         * armor or natural armor effectively increase the armor or natural 
         * armor's bonus to AC, they don't apply against touch attacks.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>Ability scores</li>
         *      <li>AC</li>
         *      <li>Attacks</li>
         *      <li>Damage</li>
         *      <li>Speed</li>
         * </ul>
         * 
         * @name Bonus#enhancement
         **/
        /**
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>Ability scores</li>
         * </ul>
         * 
         * @name Bonus#inherent
         **/
        /**
         * An **insight bonus** improves performance of a given activity by 
         * granting the character an almost precognitive knowledge of what might 
         * occur. Multiple insight bonuses on the same character or object do 
         * not stack. Only the highest insight bonus applies.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>AC</li>
         *      <li>Attacks</li>
         *      <li>Checks</li>
         *      <li>Saves</li>
         * </ul>
         * 
         * @name Bonus#insight
         **/
        /**
         * A **luck bonus** represents good (or bad) fortune. Multiple luck bonuses 
         * on the same character or object do not stack. Only the highest luck 
         * bonus applies.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>AC</li>
         *      <li>Attacks</li>
         *      <li>Checks</li>
         *      <li>Damage</li>
         *      <li>Saves</li>
         * </ul>
         * 
         * @name Bonus#luck
         **/
        /**
         * <p>A **masterwork weapon** is a finely crafted version of a normal weapon. 
         * Wielding it provides a +1 enhancement bonus on attack rolls. All magic 
         * weapons are automatically considered to be of masterwork quality. The 
         * enhancement bonus granted by the masterwork quality doesn't stack with 
         * the enhancement bonus provided by the weapon's magic.</p>
         * 
         * <p>Just as with weapons, you can purchase or craft **masterwork 
         * versions of armor or shields.** Such a well-made item functions like the 
         * normal version, except that its armor check penalty is lessened by 1. 
         * The masterwork quality of a suit of armor or shield never provides a 
         * bonus on attack or damage rolls, even if the armor or shield is used 
         * as a weapon.</p>
         * 
         * <p>A **masterwork tool** is perfect for its intended job. It grants a +2 
         * circumstance bonus on a related skill check (if any). The bonuses 
         * provided by multiple masterwork items do not stack.</p>
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>Attacks</li>
         *      <li>Checks</li>
         * </ul>
         * 
         * @name Bonus#masterwork
         **/
        /**
         * A **morale bonus** represents the effects of greater hope, courage, 
         * and determination (or hopelessness, cowardice, and despair in the 
         * case of a morale penalty). Multiple morale bonuses on the same 
         * character do not stack. Only the highest morale bonus applies. 
         * Non-intelligent creatures (creatures with an Intelligence of 0 or no 
         * Intelligence at all) cannot benefit from morale bonuses.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>Attacks</li>
         *      <li>Checks</li>
         *      <li>Damage</li>
         *      <li>Saves</li>
         *      <li>Str</li>
         *      <li>Dex</li>
         *      <li>Con</li>
         * </ul>
         * 
         * @name Bonus#morale
         **/
        /**
         * A **natural armor** bonus improves armor class resulting from a 
         * creature's naturally tough hide. Natural armor bonuses stack with all 
         * other bonuses to armor class (even with armor bonuses) except other 
         * natural armor bonuses. Some magical effects (such as the barkskin 
         * spell) grant an enhancement bonus to the creature's existing natural 
         * armor bonus, which has the effect of increasing the natural armor's 
         * overall bonus to armor class. A natural armor bonus doesn't apply 
         * against touch attacks.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>AC</li>
         * </ul>
         * 
         * @name Bonus#natarmor
         **/
        /**
         * A **profane bonus** (or penalty) stems from the power of evil. 
         * Multiple profane bonuses on the same character or object do not 
         * stack. Only the highest profane bonus applies.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>Attacks</li>
         *      <li>Checks</li>
         *      <li>Damage</li>
         *      <li>DCs</li>
         *      <li>Saves</li>
         * </ul>
         * 
         * @name Bonus#profane
         **/
        /**
         * Represents **proficiency penalties** for weapons and armor.
         * 
         * <p>When using a weapon with which you are not proficient, you take a 
         * –4 penalty on attack rolls.</p>
         * 
         * <p>A character who is wearing armor with which he is not proficient 
         * applies its armor check penalty to attack rolls and to all skill 
         * checks that involve moving.</p>
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>Attacks</li>
         *      <li>Checks</li>
         * </ul>
         * 
         * @name Bonus#proficiency
         **/
        /**
         * A **racial bonus** comes from the culture a particular creature was 
         * brought up in or because of innate characteristics of that type of 
         * creature. If a creature's race changes (for instance, if it dies and 
         * is reincarnated), it loses all racial bonuses it had in its previous 
         * form.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>--</li>
         * </ul>
         * 
         * @name Bonus#racial
         **/
        /**
         * A **resistance bonus** affects saving throws, providing extra protection 
         * against harm. Multiple resistance bonuses on the same character or 
         * object do not stack. Only the highest resistance bonus applies.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>Saves</li>
         * </ul>
         * 
         * @name Bonus#resistance
         **/
        /**
         * A **sacred bonus** (or penalty) stems from the power of good. 
         * Multiple sacred bonuses on the same character or object do not stack. 
         * Only the highest sacred bonus applies.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>Attacks</li>
         *      <li>Checks</li>
         *      <li>Damage</li>
         *      <li>DCs</li>
         *      <li>Saves</li>
         * </ul>
         * 
         * @name Bonus#sacred
         **/
        /**
         * A **shield bonus** improves armor class and is granted by a shield or 
         * by a spell or magic effect that mimics a shield. Shield bonuses stack 
         * with all other bonuses to AC except other shield bonuses. A magic 
         * shield typically grants an enhancement bonus to the shield's shield 
         * bonus, which has the effect of increasing the shield's overall bonus 
         * to AC. A shield bonus granted by a spell or magic item typically 
         * takes the form of an invisible, tangible field of force that protects 
         * the recipient. A shield bonus doesn't apply against touch attacks.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>AC</li>
         * </ul>
         * 
         * @name Bonus#shield
         **/
        /**
         * A **size bonus** or penalty is derived from a creature's size 
         * category. Size modifiers of different kinds apply to armor class, 
         * attack rolls, Stealth checks, combat maneuver checks, and various 
         * other checks.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>Ability scores</li>
         *      <li>AC</li>
         *      <li>Attacks</li>
         * </ul>
         * 
         * @name Bonus#size
         **/
        /**
         * A **trait bonus** is a bonus granted via a character trait. Character 
         * traits are an optional additional character defining feature like 
         * feats but less powerful (typically about half as strong as a feat.) 
         * As with other named bonuses, trait bonuses do not "stack" with other 
         * trait bonuses.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>--</li>
         * </ul>
         * 
         * @name Bonus#trait
         **/
        /**
         * An **untyped bonus** is rare, but generally stacks with all other 
         * bonuses except untyped bonuses from the same (or similar) sources.
         * 
         * <p>**Can affect:**</p>
         * <ul>
         *      <li>--</li>
         * </ul>
         * 
         * @name Bonus#untyped
         **/
        var bonus = {
            "ability": null,
            "alchemical": null,
            "armor": null,
            "baseattack": null,
            "circumstance": null,
            "competence": null,
            "deflection": null,
            "dodge": null,
            "enhancement": null,
            "inherent": null,
            "insight": null,
            "luck": null,
            "masterwork": null,
            "morale": null,
            "natarmor": null,
            "profane": null,
            "proficiency": null,
            "racial": null,
            "resistance": null,
            "sacred": null,
            "shield": null,
            "size": null,
            "trait": null,
            "untyped": null
        };
        
        for (var type in template) {
            if (!bonus.hasOwnProperty(type)) {
                throw new TypeError("Template: Unknown bonus type " + type);
            }
        }
        for (var type in updaters) {
            if (!bonus.hasOwnProperty(type)) {
                throw new TypeError("Updaters: Unknown bonus type " + type);
            }
        }
        for (var type in dependencies) {
            if (!bonus.hasOwnProperty(type)) {
                throw new TypeError("Dependencies: Unknown bonus type " + type);
            }
        }
        
        angular.extend(bonus, template);
        
        Data.call(this, bonus, updaters, dependencies);
    }
    
    // Inheritance from Data:
    Bonus.prototype = Object.create(Data.prototype);
    Bonus.prototype.constructor = Bonus;
    
    /**
     * Calculates the sum of all bonuses and returns as a Number
     * 
     * @memberof Bonus
     * @returns {Number}
     **/
    Bonus.prototype.valueOf = function(method) {
        var total = null;
        for (var type in this.___) {
            if (typeof this.___[type] == 'object' && this.___[type].value !== null) {
                total += Number(this.___[type].value);
            }
        }
        return total;
    };
    
    /**
     * Calculates the sum of all bonuses and returns as a String (or "" if zero)
     * 
     * @memberof Bonus
     * @returns {String}
     **/
    Bonus.prototype.toString = function(method) {
        var total = 0;
        for (var type in this.___) {
            if (typeof this.___[type] == 'object' && this.___[type].value !== null) {
                total += Number(this.___[type].value);
                
            }
        }
        return (total ? total.toString() : "");
    };
    
    /**
     * Adds two Bonus objects together, taking the sum of stackable bonus types
     * (like dodge) and the higher of non-stackable bonus types (like armor).
     * 
     * @memberof Bonus
     * @param {Bonus} otherBonus - Bonus object to add to this one
     * @returns {Bonus}
     **/
    Bonus.prototype.add = function(otherBonus) {
        if (typeof otherBonus === 'undefined') {
            throw new TypeError("otherBonus parameter required");
        }
        else if (otherBonus === null) {
            return this;
        }
        else if (typeof otherBonus === 'number') {
            return otherBonus + this.valueOf();
        }
        else if (!(typeof otherBonus == "object" && otherBonus.constructor.name == "Bonus")) {
            console.log(this)
            console.log(otherBonus);
            throw new TypeError("Cannot add Bonus and non-Bonus objects");
        }
        var newBonus = new Bonus()
        
        for (var type in this.___) {
                switch(type) {
                    case "circumstance":
                    case "dodge":
                    case "racial":
                    case "untyped":
                        if (this[type] === null) {
                            newBonus[type] = otherBonus[type];
                        }
                        else if (otherBonus[type] === null) {
                            newBonus[type] = this[type];
                        }
                        else {
                            newBonus[type] = Number(this[type]) + Number(otherBonus[type]);
                        }
                        break;
                    default:
                        if (this[type] === null) {
                            newBonus[type] = otherBonus[type];
                        }
                        else if (otherBonus[type] === null) {
                            newBonus[type] = this[type];
                        }
                        else {
                            newBonus[type] = Math.max(Number(this[type]), Number(otherBonus[type]));
                        }
                        break;
                }
        }
        return newBonus;
    };
    
    /**
     * Replaces values with another Bonus object (keeping dependencies where 
     * applicable).
     * 
     * @memberof Bonus
     * @param {Bonus} otherBonus - Bonus object with values to overwrite these ones
     * @returns {Bonus}
     **/
    Bonus.prototype.replace = function(otherBonus) {
        if (typeof otherBonus === 'undefined') {
            throw new TypeError("otherBonus parameter required");
        }
        else if (otherBonus === null) {
            return this;
        }
        else if (typeof otherBonus === 'number') {
            return otherBonus + this.valueOf();
        }
        else if (!(typeof otherBonus == "object" && otherBonus.constructor.name == "Bonus")) {
            console.log(otherBonus);
            throw new TypeError("Cannot add Bonus and non-Bonus objects");
        }
        var newBonus = new Bonus()
        
        for (var type in this.___) {
            this[type] = otherBonus[type];
        }
        return newBonus;
    };
    
    // And deliver the class:
    return Bonus;
});

csheetApp.factory("DependencyModifier", function(Data, SelectorSlot) {
    /**
     * <p>
     * The DependencyModifier class applies custom functionality to change the
     * way the character's default links are set up. This allows a feat to, e.g.,
     * replace the default stat mod with dexterity for a particular weapon, or
     * add a +4 bonus to the character's initiative.
     * </p>
     * 
     * <p>
     * The rules for these feats/abilities/class features/etc. are stored in a
     * kind of shorthand which is then interpreted to apply to the character
     * model. For more details, see the documentation for the parseRules() 
     * method.
     * </p>
     * 
     * @class DependencyModifier
     * @param {Object} template - Template object to read properties from
     * @param {Object} [updaters] - List of custom updater functions to apply to corresponding properties in template object (property names must match)
     * @param {Object} [dependencies] - List of arrays of dependency links to establish (property names must match)
     **/
    function DependencyModifier(template, updaters, dependencies) {
        var newDepMod = {
            rules: [],
            value: null,
            changedUpdaters: {}
        };
        
        angular.extend(newDepMod, template);
        
        Data.call(this, newDepMod, updaters, dependencies);
        
        this.dataName = "dependency modifier|";
        this.thisChar = undefined; // Don't want to monitor this for changes
        //this.parseRules(this.rules);
    }
    
    // Inheritance from Data:
    DependencyModifier.prototype = Object.create(Data.prototype);
    DependencyModifier.prototype.constructor = DependencyModifier;
    
    /**
     * <p>parseRules() interprets a string (or array of strings) as rules and
     * compiles them into a function (which it returns). The returned function
     * accepts one argument, char, which should be a Character object.</p>
     * 
     * <p>The rules may be one of the following formats:</p>
     * 
     * <ul>
     *    <li>`SUBJECT > DIRECTIVE > OBJECT` (e.g., `char.weapongroups.close.attack > dp > this.value`)</li>
     * </ul>
     * 
     * <p>`SUBJECT` and `OBJECT` follow the usual rules for identifying
     * properties in Javascript, but the root object must be either `this` (which 
     * represents the DependencyModifier object) or `char` (which represents the
     * Character object, to be passed in later). Anything else will throw an
     * exception.</p>
     * 
     * <p>The following are valid directives:</p>
     * 
     * <ul>
     *    <li>`dp` (executes depend() function on subject, splitting the object into its source object and property)</li>
     *    <li>`nd` (executes undepend() function on subject, splitting the object into its source object and property)</li>
     * </ul>
     * 
     * @memberof DependencyModifier
     * @param {Array} rules - List of rules to parse into a function
     * @returns {function} apply(char)
     **/
    DependencyModifier.prototype.parseRules = function(reverse) {
        var DEBUG = false
        if (this.dataName == "feat|weapon focus") {
            DEBUG = false
        }
        var that = this;
        if (Object.prototype.toString.call( that.rules ) !== '[object Array]') { throw new TypeError("rules should be an array"); }
        
        var re = {
            directive: /((?:char|this)\.[A-Za-z0-9\ \.\-\_]+) (dp|nd) ((?:char|this)\.[A-Za-z0-9\ \.\-\_]+)/,
            subobj: /(char|this)\.([A-Za-z0-9\ \.\-\_]+)/,
            updater: /((?:char|this)\.[A-Za-z0-9\ \.\-\_]+) upd \"(.+)\"/,
            selector: /select (.+) from ((?:char|this)\.[A-Za-z0-9\ \.\-\_]+) where \"(.+)\"/
        };
        
        
        for (var i in that.rules) {
            if (typeof that.rules[i] == "string") {
                var rule = that.rules[i].trim();
                // Skip blank rules
                if (rule == "") {
                    continue;
                }
                var directive = rule.match(re.directive);
                var updater = rule.match(re.updater);
                var selector = rule.match(re.selector);
                if (DEBUG) {
                    console.log(directive);
                    console.log(updater);
                    console.log(selector);
                }
                if (directive) {
                    // This line is a directive rule. Parse it:
                    var subj = parseSubObj(this.thisChar, directive[1]);
                    var dir_code = directive[2];
                    var obj = parseSubObj(this.thisChar, directive[3]);
                    if (dir_code == "dp" || (reverse && dir_code == "nd")) {
                        if (subj.obj instanceof Data) {
                            subj.obj.depend(subj.property, obj.obj, obj.property);
                        }
                        else {
                            throw new TypeError("Expected rule subject to be Data object");
                        }
                    }
                    else if (dir_code == "nd" || (reverse && dir_code == "dp")) {
                        if (subj.obj instanceof Data) {
                            subj.obj.undepend(subj.property, obj.obj, obj.property);
                        }
                        else {
                            throw new TypeError("Expected rule subject to be Data object");
                        }
                    }
                }
                else if (updater) {
                    // This line is an updater rule. Parse it:
                    var subj = parseSubObj(this.thisChar, updater[1]);
                    if (!reverse) {
                        this.changedUpdaters[updater[1]] = subj.obj.___[subj.property].update;
                        try {
                            subj.obj.___[subj.property].update = new Function("d", updater[2]);
                        }
                        catch(e) {
                            console.log("Error parsing updater for " + updater[1] + ": " + updater[2]);
                            throw e;
                        }
                    }
                    else if (this.updaters.hasOwnProperty(updater[1])) {
                        subj.obj.___[subj.property].update = this.updaters[updater[1]];
                    }
                    
                    subj.obj.___[subj.property].refresh();
                }
                else if (selector) {
                    // This is a selector (a specific kind of updater). Parse it:
                    // select LOCAL.REFERENCE from LIST where "FILTER"
                    var local_reference = parseSubObj(this.thisChar, selector[1]);
                    var list = parseSubObj(this.thisChar, selector[2]);
                    var filter = new Function("obj", selector[3]);
                    
                    //console.log(local_reference);
                    //console.log(list);
                    //console.log(filter);
                    
                    local_reference.obj[local_reference.property] = new SelectorSlot({
                        selector_list: list.obj[list.property],
                        filter: filter
                    })
                    
                    //console.log("Selector not implemented for rule: " + rule);
                }
                else {
                    console.log("Error parsing rule");
                    console.log(rule);
                }
            }
        }
        
        function parseSubObj(char, token) {
            var re = {
                subobj: /(char|this)\.([A-Za-z0-9\ \.\-\_]+)/
            };
            var objects = {
                "char": char,
                "this": that
            }
            var matches = token.match(re.subobj);
            if (matches) {
                return objects[matches[1]].path(matches[2]);
            }
            else {
                console.log("Error parsing subobject");
                console.log(token);
            }
            return null;
        }
    }
    
    /**
     * Accepts the Character object and applies the DependencyModifier's defined
     * rules to it.
     * 
     * @memberof DependencyModifier
     * @param {Character} char - Character to apply modifier rules to
     **/
    DependencyModifier.prototype.applyTo = function(char) {
        if (typeof char !== 'object' || char.constructor.name != "Character") {
            throw new TypeError("char expected to be Character object");
        }
        this.thisChar = char;
        this.parseRules();
    }
    
    /**
     * Accepts the Character object and reverses the DependencyModifier's defined
     * rules on it.
     * 
     * @memberof DependencyModifier
     * @param {Character} char - Character to apply modifier rules to
     **/
    DependencyModifier.prototype.remove = function(char) {
        if (typeof char !== 'object' || char.constructor.name != "Character") {
            throw new TypeError("char expected to be Character object");
        }
        this.thisChar = char;
        this.parseRules(true);
    }
    
    
    
    return DependencyModifier;
});

csheetApp.factory("SelectorSlot", function(Data) {
    /**
     * @class SelectorSlot
     * @param {Object} template - Template object to read properties from
     * @param {Object} [updaters] - List of custom updater functions to apply to corresponding properties in template object (property names must match)
     * @param {Object} [dependencies] - List of arrays of dependency links to establish (property names must match)
     **/
    function SelectorSlot(template, updaters, dependencies) {
        var newSelSlot = {
            name: "",
            slot: null,
            selector_list: null,
            filter: function(obj) {
                // Accepts an object, returns true if it's valid, else returns false.
                // By default, accepts any object.
                return true;
            },
            slot_valid: true
        };
        var newSelSlotUpdaters = {
            slot_valid: function(d) {
                var filter = null;
                var selector_list = null;
                var obj = null;
                for (var i = 0; i < d.length; i++) {
                    if (typeof d[i] === "function") {
                        filter = d[i];
                    }
                    else if (Array.isArray(d[i])) {
                        selector_list = d[i];
                    }
                    else {
                        obj = d[i];
                    }
                }
                if (obj == null) {
                    // Slot is allowed to be empty.
                    return true;
                }
                if (filter == null || selector_list == null) {
                    // Slot is not empty, but the filter or source list are undefined. That's bad.
                    return false;
                }
                for (var i = 0; i < selector_list.length; i++) {
                    if (filter(selector_list[i]) && selector_list[i] == obj) {
                        // Object exists in list and matches filter. Slot is valid.
                        return true;
                    }
                }
                // Slot is not empty, filter/source list are defined, but the object doesn't match the
                // filter/source list. Slot is not valid.
                return false;
            }
        }
        
        angular.extend(newSelSlot, template);
        angular.extend(newSelSlotUpdaters, updaters);
        
        Data.call(this, newSelSlot, updaters, dependencies);
        
        this.dependBatch({
            "slot_valid":  [{obj: this, property: "slot"},
                            {obj: this, property: "selector_list"},
                            {obj: this, property: "filterList"}]
        });
        
        this.dataName = "selector slot|" + this.name.toLowerCase();
        /*
        this.depend = function(field, dataObject, property) {
            // If this is `depending` a SelectorSlot field, pass through to
            // default Data depend() method. Otherwise, map to slot object's
            // depend() method.
            if (this.hasOwnProperty(field)) {
                return Object.getPrototypeOf(this).depend.call(this, field, dataObject, property)
            }
            // Actually a dependency for the slotted object.
            // However, it might not be assigned (might be null). So,
            // watch the SelectorSlot object and assign (or destroy)
            // this dependency as the slot object is added or removed.
            Object.observe(this, (function(self, field, dataObject, property) {
                return function(events) {
                    for (var i in events) {
                        var e = events[i]
                        if (e.name == "slot") {
                            if ((e.type == "update" || e.type == "delete") && typeof(e.oldValue) === 'object' && e.oldValue !== null) {
                                e.oldValue.slot.undepend(field, dataObject, property);
                            }
                            Object.getPrototypeOf(e.object.slot).depend.call(e.object.slot, field, dataObject, property);
                        }
                    }
                };
            })(this, field, dataObject, property));
            
            // Now, set the dependency for the slotted object:
            if (this.slot) {
                return this.slot.depend(field, dataObject, property)
            }
        }
        */
    }
    
    // Inheritance from Data:
    SelectorSlot.prototype = Object.create(Data.prototype);
    SelectorSlot.prototype.constructor = SelectorSlot;
    
    SelectorSlot.prototype.assignSlot = function(obj) {
        if (this.selector_list == null) {
            throw new TypeError("SelectorSlot tried to assign, but source list isn't set");
        }
        var found = false;
        for (var src_obj of this.selector_list) {
            if (src_obj == obj) {
                found = true;
            }
        }
        if (!found) {
            console.log(this.selector_list);
            console.log(obj);
            throw new TypeError("SelectorSlot tried to assign an object not in the selector list");
        }
        if (!this.filter(obj)) {
            console.log(obj);
            console.log(this.filter);
            throw new TypeError("SelectorSlot tried to assign an object that doesn't match the filter");
        }
        if (this.slot != null) {
            throw new TypeError("SelectorSlot tried to assign an object, but is already set. Call this.emptySlot() first to clear it.");
        }
        
        this.slot = obj;
    }
    
    SelectorSlot.prototype.emptySlot = function() {
        this.slot = null;
    }
    SelectorSlot.prototype.isEmpty = function() {
        return (this.slot == null);
    }
    SelectorSlot.prototype.filterList = function(d) {
        var filtered = [];
        for (var i in d) {
            if (this.filter(d[i])) {
                filtered.push(d[i]);
            }
        }
        return filtered;
    }
    return SelectorSlot;
});