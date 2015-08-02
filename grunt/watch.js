'use strict';

module.exports = function () {
    var watch = {
        options : {
            interval      : 200,
            debounceDelay : 500,
            spawn         : false,
            livereload    : true
        }
    };

    return watch;
};