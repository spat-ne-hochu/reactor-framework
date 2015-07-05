/* exported rc, reactor */

'use strict';

window.rc = window.reactor = (function() {

    var reactor = {};

    function parseController(ctrl) {
        console.time('parseController');

        var keys = Object.keys(ctrl),
            item, i;

        for (i = 0; i < keys.length; ++i) {
            item = ctrl[keys[i]];

            if (typeof item === 'function' && keys[i].substr(0,2) !== '__') {
                parseMethod(item, keys[i], ctrl);
            }
        }

        console.timeEnd('parseController');
    }

    function parseMethod(method, name, ctrl) {
        var syntaxTree   = esprima.parse('(' + method.toString() + ')'),
            body         = syntaxTree.body[0].expression.body.body,
            dependencies = [],
            changes      = [],
            i, current;

        for (i = 0; i < body.length; ++i) {
            current = body[i];

            if (current.type === 'ExpressionStatement') {
                switch (current.expression.type) {
                    case 'UpdateExpression':
                        parseUpdateExpression(dependencies, changes, current.expression);
                        break;
                    case 'AssignmentExpression':
                        parseAssignmentExpression(dependencies, changes, current.expression);
                        break;
                }
            }
        }

        dependencies.forEach(function(dependency, index) {
            if (changes.indexOf(dependency) !== -1) {
                dependencies.splice(index, 1);
            } else {
                if (! ctrl.__deps[dependency]) {
                    ctrl.__deps[dependency] = [];
                }

                ctrl.__deps[dependency].push(name);
            }
        });

        var regexp = /\{((.|\s)+)}$/m,
            code = regexp.exec(method.toString())[1].trim();

        code = 'this.__before(\'' + changes[0] + '\', this.' + changes[0] + ');' +
               code +
               (code.substr(-1, 1) === ';' ? '' : ';') +
               'this.__after(\'' + changes[0] + '\', this.' + changes[0] + ');';

        ctrl[name] = new Function(code);
    }

    function parseUpdateExpression(dependencies, changes, e) {
        var arg = e.argument;

        if (arg.type === 'MemberExpression') {
            parseMemberExpression(changes, arg);
        }
    }

    function parseAssignmentExpression(dependencies, changes, e) {
        var left = e.left,
            right = e.right;

        if (left.type === 'MemberExpression') {
            parseMemberExpression(changes, left);
        }

        if (right.type === 'BinaryExpression') {
            parseBinaryExpression(dependencies, changes, right);
        }
    }

    function parseBinaryExpression(dependencies, changes, e) {
        var list = [e.left, e.right];

        list.forEach(function(e) {
            if (e.type === 'MemberExpression') {
                parseMemberExpression(dependencies, e);
            }

            if (e.type === 'BinaryExpression') {
                parseBinaryExpression(dependencies, changes, e);
            }
        });
    }

    function parseMemberExpression(list, e) {
        if (e.object.type === 'ThisExpression') {
            if (e.property.type === 'Identifier') {
                list.push(e.property.name);
            }
        }
    }

    reactor.__lastNamespaceNumber = 0;

    reactor.controllerPrototype = {
        __diff    : {},
        __changes : {},
        __out     : {},
        __deps    : {},
        __before  : function(path, value) {
            this.__diff[path] = value;
            console.log('__before', path, this.__diff);
        },
        __after   : function(path, value) {
            if (this.__diff[path] !== value) {
                this.__changes[path] = value;
            }

            delete this.__diff[path];
            console.log('__after', path, this.__changes, this.__diff);
            this.__apply();
        },
        __link    : function(element, path) {
            this.__out[path] = element;
            console.log('__link', this.__out);

            var viewVal  = this.__out[path].text();
            var modelVal = this[path];

            if (viewVal !== '' && (modelVal === undefined || modelVal === null)) {
                this[path] = viewVal;
            } else {
                this.__out[path].text(modelVal);
            }

            this.__changes[path] = this.path;
            this.__apply();
        },
        __apply   : function() {
            for (var path in this.__changes) {
                if (this.__changes.hasOwnProperty(path) && this.__out[path]) {
                    console.log('__apply', this.__out[path], this.__changes[path]);
                    this.__out[path].text(this.__changes[path]);

                    delete this.__changes[path];

                    if (this.__deps[path]) {
                        console.log('__deps', this.__deps[path]);
                        this.__deps[path].forEach(function(method) {
                            this[method]();
                        }, this);
                    }
                }
            }
        },
        link     : function(elementSelector, bindingData) {
            var root = $(elementSelector);

            bindingData.forEach(function(bind) {
                var element = root.find(bind.selector);
                var controller = this;

                switch (bind.directive) {
                    case 'click':
                        element.click(function() {
                            controller[bind.path]();
                        });
                        break;
                    case 'bind':
                        this.__link(element, bind.path);
                        break;
                }
            }, this);
        }
    };

    reactor.__Controller = function() {
        this.__id      = ++reactor.__lastNamespaceNumber;
        this.__diff    = {};
        this.__changes = {};
        this.__out     = {};
        this.__deps    = {};
    };

    reactor.__Controller.prototype = reactor.controllerPrototype;

    reactor.controller = function(name, factory) {
        if (arguments.length === 1) {
            factory = name;
        }

        var ctrl = new reactor.__Controller();
        factory.call(ctrl);

        parseController(ctrl);

        return ctrl;
    };

    return reactor;
})();
