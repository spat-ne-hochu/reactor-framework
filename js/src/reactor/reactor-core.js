/* exported rc, reactor */

'use strict';

window.rc = window.reactor = (function() {

    var rc = {
        parser : null
    };

    var __lastScopeId = 0;

    function isInteractiveNode(element) {
        return !! ~['INPUT', 'TEXTAREA'].indexOf(element[0].tagName);
    }

    function getNodeValue(element) {
        return isInteractiveNode(element) ? element.val() : element.text();
    }

    function setNodeValue(element, value) {
        isInteractiveNode(element) ? element.val(value) : element.text(value);
    }

    function __Scope() {
        this.__deps = {
            __f : true
        };
    }
    __Scope.prototype = {
        __before : function (path, value) {
            this.__diff[path] = value;
            rc.debuger.info('__before', 'call', path, this.__diff);
        },
        __after  : function (path, value) {
            if (this.__diff[path] !== value) {
                this.__changes[path] = value;
            }

            delete this.__diff[path];
            rc.debuger.info('__after', 'call', path, this.__changes, this.__diff);
            this.__apply();
        },
        __link   : function (element, path) {
            this.__out[path] = element;
            rc.debuger.info('__link', 'call', this.__out);

            var viewVal  = getNodeValue(this.__out[path]);
            var modelVal = this[path];

            if (viewVal !== '' && (modelVal === undefined || modelVal === null)) {
                this[path] = viewVal;
            } else {
                setNodeValue(this.__out[path], modelVal);
            }

            this.__changes[path] = this[path];
            this.__apply();
        },
        __twoWayBind : function(element, path) {
            this.__link(element, path);
            var scope = this;
            element.on('keydown paste', function() {
                setTimeout(function() {
                    scope[path] = getNodeValue(element);
                    scope.__changes[path] = scope[path];
                    scope.__apply();
                }, 0);
            })
        },
        __apply  : function () {
            for (var path in this.__changes) {
                if (this.__changes.hasOwnProperty(path) && this.__out[path]) {
                    rc.debuger.info('__apply', 'info', this.__out[path], this.__changes[path]);
                    setNodeValue(this.__out[path], this.__changes[path]);

                    delete this.__changes[path];

                    if (this.__deps[path]) {
                        rc.debuger.info('__apply', 'deps', this.__deps[path]);
                        this.__deps[path].forEach(function (method) {
                            this[method]();
                        }, this);
                    }
                }
            }
        },
        bind     : function (elementSelector, bindingData) {
            var root = $(elementSelector);

            bindingData.forEach(function (bind) {
                var element    = root.find(bind.selector);
                var controller = this;

                switch (bind.directive) {
                    case 'click':
                        element.click(function () {
                            controller[bind.path]();
                        });
                        break;
                    case 'bind':
                        this.__link(element, bind.path);
                        break;
                    case '<=>':
                        this.__twoWayBind(element, bind.path);
                        break;
                }
            }, this);
        }
    };

    function Controller(name) {
        this.__id      = ++__lastScopeId;
        this.__diff    = {};
        this.__changes = {};
        this.__out     = {};

        var ctrl = __parsedScopes[name];

        if (this.__deps.__f) {
            for (name in ctrl.__deps) if (ctrl.__deps.hasOwnProperty(name)) {
                this.__deps[name] = ctrl.__deps[name];
            }
            delete this.__deps.__f;
        }

        delete ctrl.__deps;
        $.extend(true, this, ctrl);
    }
    Controller.prototype = new __Scope();

    var __parsedScopes = {};

    rc.controller = function(name, factory) {
        if (! __parsedScopes[name]) {
            __parsedScopes[name] = rc.parser.parseObject(new factory());
        }
    };

    rc.getControllerInstance = function(name) {
        if (__parsedScopes[name]) {
            return new Controller(name);
        } else {
            throw 'controller ' + name + ' not found';
        }
    };

    rc.bingController = function(controllerName, rootElement, bindingScheme) {

    };

    rc.clone = function(object) {
        return Object.clone(object);
    };

    return rc;
})();
