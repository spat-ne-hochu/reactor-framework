'use strict';

module.exports = function () {
    var uglify = {
        devBuild           : {},
        angularServices    : {
            options : {
                sourceMap : true
            },
            files   : [
                {
                    src  : [
                        src + 'angular/app.js',
                        src + 'angular/directives/**/*.js',
                        src + 'angular/filters/**/*.js',
                        src + 'angular/i18n/**/*.js',
                        src + 'angular/services/**/*.js',
                        src + 'angular/smsAccept/**/*.js'
                    ],
                    dest : dist + 'angular/services.min.js'
                }
            ]
        },
        angularControllers : {
            options : {
                sourceMap : true
            },
            files   : [
                {
                    src  : [
                        src + 'angular/controllers/user/settings/*.js'
                    ],
                    dest : dist + 'angular/controllers/user__settings.min.js'
                },
                {
                    src  : [
                        src + 'angular/controllers/campaigns/platforms/*.js'
                    ],
                    dest : dist + 'angular/controllers/campaigns__platforms.min.js'
                },
                {
                    src  : [
                        src + 'angular/controllers/campaigns/posts/*.js'
                    ],
                    dest : dist + 'angular/controllers/campaigns__posts.min.js'
                }
            ]
        }
    };

    uglify.sharedComponents = {
        options : {
            sourceMap : true
        },
        files   : [
            {
                src  : config.js.paths.sharedComponents.srcDir + '/**/*.js',
                dest : config.js.paths.sharedComponents.tmpDir + 'services.min.js'
            }
        ]
    };

    config.js.maps.getActionScripts().forEach(
        function (controller) {
            uglify[controller.name] = {
                options : {
                    sourceMap : true
                },
                files   : [
                    {
                        src  : controller.src,
                        dest : controller.dest
                    }
                ]
            };
        }
    );

    return uglify;
};