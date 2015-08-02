'use strict';

function main() {
    var model   = reactor.model('threeModel');
    model.count = function() {
        return model.red + model.green + model.blue;
    };
}

document.addEventListener('DOMContentLoaded', main, false);
