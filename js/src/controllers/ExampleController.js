/* globals rc */

'use strict';

var myController = rc.controller('ExampleController', function() {
    this.number = null;
    this.sum    = null;
    this.base   = 1;

    this.inc = function() {
        this.number++;
    };

    this.dec = function() {
        this.number = this.number - 1;
    };

    this.calcSum = function() {
        this.sum = this.number * this.base;
    }
});

rc.getControllerInstance('ExampleController').bind('.tplOne', bindingOne);
rc.getControllerInstance('ExampleController').bind('.tplTwo', bindingOne);
rc.getControllerInstance('ExampleController').bind('.tplThree', bindingOne);
