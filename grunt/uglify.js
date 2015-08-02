'use strict';

module.exports = function () {
    return {
        devBuild : {
            src  : [
                'vendor/jquery/dist/jquery.min.js',
                'vendor/esprima/esprima.js',
                'js/src/reactor/reactor-core.js',
                'js/src/reactor/reactor-debuger.js',
                'js/src/reactor/reactor-parser.js',
                'js/src/bindings/bind.js',
                'js/src/controllers/ExampleController.js'
            ],
            dest : 'js/site/build.js'
        }
    };
};