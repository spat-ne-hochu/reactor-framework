'use strict';

window.bindingOne = [
    {
        selector  : '.cell > button:first-child',
        directive : 'click',
        path      : 'inc'
    },
    {
        selector  : '.cell > button:last-child',
        directive : 'click',
        path      : 'dec'
    },
    {
        selector  : '.cell > .monitor',
        directive : 'bind',
        path      : 'number'
    },
    {
        selector  : '.sum',
        directive : 'bind',
        path      : 'sum'
    }
];
