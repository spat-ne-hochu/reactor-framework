/* globals rc */

'use strict';

var myController = rc.controller('ExampleController', function() {
    this.number = 3;
    this.sum = null;

    this.inc = function() {
        this.number++;
    };

    this.dec = function() {
        this.number = this.number - 1;
    };

    this.calcSum = function() {
        this.sum = this.number * 2 + Math.PI / 4;
    }
});

myController.link('.tplOne', bindingOne);
