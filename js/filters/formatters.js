/*global csheetApp*/
/*global angular*/

// Helper filters

csheetApp.filter('xsign', function() {
    return function(n) {
        if (n == 0 || isNaN(+n)) {
            return "+0";
        }
        return (+n>=0 ? '+' : '') + +n;
    }
});

csheetApp.filter('ignoreZero', function() {
    return function(n) {
        if (n == 0) {
            return "";
        }
        return n;
    }
});

csheetApp.filter('attacks', function() {
    return function(n) {
        if (n == 0 || isNaN(+n)) {
            return "";
        }
        var new_value = (+n>=0 ? '+' : '') + +n;
        var new_attacks = xsignFilter(new_value);
        if (n >= 6) {
            new_attacks += "/+" + (n - 5);
        }
        if (n >= 11) {
            new_attacks += "/+" + (n - 10);
        }
        if (n >= 16) {
            new_attacks += "/+" + (n - 15);
        }
        return ;
    }
});

csheetApp.filter('percentage', function() {
    return function(n) {
        if (isNaN(+n)) {
            return "";
        }
        return (+(n * 100).toFixed(2)) + "%";
    }
});

csheetApp.filter('keyString', function() {
    return function(n) {
        return n.trim().toLowerCase().replace(/[^A-Z0-9]+/ig, "_");
    }
});

csheetApp.filter('htmlsafe', function() {
    return function(text) {
        if (text) {
            return text.
                replace(/&/g, '&amp;').
                replace(/</g, '&lt;').
                replace(/>/g, '&gt;').
                replace(/'/g, '&#39;').
                replace(/"/g, '&quot;').
                replace(/`/g, '&#96;');
        }
        return '';
    }
});

