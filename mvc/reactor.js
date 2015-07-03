/* exported RC */

'use strict';

window.RC = {
    $before  : function(path, value) {
        this.$diff[path] = value;
        console.log('RC:before', this.$diff);
    },
    $after   : function(path, value) {
        if (this.$diff[path] !== value) {
            this.$changes[path] = value;
        }

        delete this.$diff[path];
        console.log('RC:after', this.$changes);
        this.$apply();
    },
    $diff    : {},
    $changes : {},
    $out     : {},
    $link    : function(selector, path) {
        this.$out[path] = $(selector);
        console.log(this.$out);
    },
    $apply   : function() {
        for (var path in this.$changes) {
            if (this.$changes.hasOwnProperty(path)) {
                console.log('RC:apply', this.$out[path], this.$changes[path]);
                this.$out[path].text(this.$changes[path]);
                console.log(this.$out[path]);
                delete this.$changes[path];
            }
        }
    }
};
