/*global angular*/
var csheetApp = angular.module('csheetApp', ['ngAnimate', 'ngMaterial']);
var pc;
var cdebug = {
    logs: {},
    times: {},
    log: function(name) {
        if (!this.logs.hasOwnProperty(name)) {
            this.logs[name] = 0;
        }
        this.logs[name] += 1;
    },
    timestart: function(name) {
        if (!this.times.hasOwnProperty(name)) {
            this.times[name] = {
                calcAverage: function() {
                    this.avg = this.calcSum() / this.totals.length;
                    return this.avg;
                },
                calcSum: function() {
                    this.sum = this.totals.reduce(function(a, b) { return a + b; });
                    return this.sum;
                },
                avg: 0,
                sum: 0,
                totals: [],
                currentTimer: new Date()
            };
        }
        else {
            this.times[name].currentTimer = new Date();
        }
    },
    timestop: function(name) {
        if (this.times.hasOwnProperty(name)) {
            this.times[name].totals.push(new Date() - this.times[name].currentTimer);
            this.times[name].currentTimer = null;
            //this.times[name].calcAverage();
        }
    }
};

csheetApp.controller("csheetControl", function($scope, $mdDialog, $mdMedia, CurrentChar, WeaponLib) {
    cdebug.scope = $scope;
    $scope.loading = {
        initialLoad: false,
        status: ""
    }
    pc = new CurrentChar($scope.loading);
    Object.observe(pc, function() {
        $scope.$apply();
    });
    $scope.character = pc;
    $scope.sheetsTemplate = "";
    $scope.hovering = {};
    $scope.title = "Loading Character Sheet";
    $scope.character.onLoaded((function($scope) {
        return function() {
            $scope.loading.initialLoad = true;
            $scope.sheetsTemplate = "templates/sheets.html";
            var titleElements = [];
            if ($scope.character.classrace.name) { titleElements.push($scope.character.classrace.name); }
            if ($scope.character.classrace.player) { titleElements.push($scope.character.classrace.player); }
            $scope.title = titleElements.join(" | ");
        };
    })($scope));
    $scope.resetHovers = function($event) {
        var reset = false;
        for (var i in $scope.hovering) {
            if ($scope.hovering[i]) {
                $scope.hovering[i] = false;
                reset = true;
            }
        }
        return reset;
    };
    $scope.mouseOut = function(name, $event) {
        if (!('ontouchstart' in window || 'onmsgesturechange' in window)) {
            $scope.resetHovers($event);
        }
    }
    $scope.mouseHover = function(name, $event) {
        if (!('ontouchstart' in window || 'onmsgesturechange' in window)) {
            if (!$scope.resetHovers($event)) {
                // Is not touch screen
                $scope.hovering[name] = true;
            }
        }
    };
    $scope.touchHover = function(name, $event) {
        if (('ontouchstart' in window || 'onmsgesturechange' in window)) {
            $scope.resetHovers($event);
            // Has touchscreen
            $scope.hovering[name] = true;
            if ($event) {
                $event.stopPropagation();
            }
        }
    };
    
    $scope.showStatEditor = function(ev) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
        $mdDialog.show({
            controller: statEditorController,
            templateUrl: 'templates/stats-editor.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: useFullScreen,
            locals: {
                character: $scope.character
            }
        });
    
    
    
        $scope.$watch(function() {
            return $mdMedia('xs') || $mdMedia('sm');
        }, function(wantsFullScreen) {
            $scope.customFullscreen = (wantsFullScreen === true);
        });
    };
    $scope.showClassraceEditor = function(ev) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
        $mdDialog.show({
            controller: classraceEditorController,
            templateUrl: 'templates/classrace-editor.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: useFullScreen,
            locals: {
                character: $scope.character,
                classes: $scope.character.rulesets.classes.list
            }
        });
    
    
    
        $scope.$watch(function() {
            return $mdMedia('xs') || $mdMedia('sm');
        }, function(wantsFullScreen) {
            $scope.customFullscreen = (wantsFullScreen === true);
        });
    };
});

function statEditorController($scope, $mdDialog, character) {
    $scope.character = character;
    $scope.current_stats = {
        str: $scope.character.stats.str.score.clone(),
        dex: $scope.character.stats.dex.score.clone(),
        con: $scope.character.stats.con.score.clone(),
        int: $scope.character.stats.int.score.clone(),
        wis: $scope.character.stats.wis.score.clone(),
        cha: $scope.character.stats.cha.score.clone(),
    }
    
    $scope.hide = function() {
        $mdDialog.hide();
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    
    $scope.debug = function() {
        console.log($scope);
    }

    $scope.save_stats = function() {
        $scope.character.stats.str.score.replace($scope.current_stats.str);
        $scope.character.stats.dex.score.replace($scope.current_stats.dex);
        $scope.character.stats.con.score.replace($scope.current_stats.con);
        $scope.character.stats.int.score.replace($scope.current_stats.int);
        $scope.character.stats.wis.score.replace($scope.current_stats.wis);
        $scope.character.stats.cha.score.replace($scope.current_stats.cha);
        $mdDialog.hide();
    };
}

function classraceEditorController($scope, $mdDialog, character, classes) {
    $scope.character = character;
    $scope.classrace = character.classrace.clone();
    $scope.classes = classes;
    $scope.alignments = [
        {id: "", name: ""},
        {id: "LG", name: "Lawful Good"},
        {id: "NG", name: "Neutral Good"},
        {id: "CG", name: "Chaotic Good"},
        {id: "LN", name: "Lawful Neutral"},
        {id: "TN", name: "True Neutral"},
        {id: "CN", name: "Chaotic Neutral"},
        {id: "LE", name: "Lawful Evil"},
        {id: "NE", name: "Neutral Evil"},
        {id: "CE", name: "Chaotic Evil"},
    ];
    $scope.sizes = [
        "Colossal",
        "Gargantuan",
        "Huge",
        "Large",
        "Medium",
        "Small",
        "Tiny",
        "Diminutive",
        "Fine"
    ];
    
    $scope.hide = function() {
        $mdDialog.hide();
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };
    
    $scope.debug = function() {
        console.log($scope);
    }

    $scope.save = function() {
        $scope.character.classrace.name                         = $scope.classrace.name;
        $scope.character.classrace.player                       = $scope.classrace.player;
        $scope.character.classrace.alignment                    = $scope.classrace.alignment;
        $scope.character.classrace.deity                        = $scope.classrace.deity;
        $scope.character.classrace.homeland                     = $scope.classrace.homeland;
        $scope.character.classrace.gender                       = $scope.classrace.gender;
        $scope.character.classrace.age                          = $scope.classrace.age;
        $scope.character.classrace.height                       = $scope.classrace.height;
        $scope.character.classrace.weight                       = $scope.classrace.weight;
        $scope.character.classrace.hair                         = $scope.classrace.hair;
        $scope.character.classrace.eyes                         = $scope.classrace.eyes;
        $scope.character.classrace.race                         = $scope.classrace.race;
        $scope.character.classrace.size                         = $scope.classrace.size;
        $scope.character.classrace.class_levels.favored_class   = $scope.classrace.class_levels.favored_class;
        $mdDialog.hide();
    };
    
    
    $scope.showClassLevelEditor = function(ev) {
        var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
        $mdDialog.show({
            controller: classraceEditorController,
            templateUrl: 'templates/classrace-editor.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: useFullScreen,
            locals: {
                character: $scope.character,
                classes: $scope.character.rulesets.classes.list
            }
        });
    
    
    
        $scope.$watch(function() {
            return $mdMedia('xs') || $mdMedia('sm');
        }, function(wantsFullScreen) {
            $scope.customFullscreen = (wantsFullScreen === true);
        });
    };
}