/* globals RC */

'use strict';

var controller = {
    number  : 1,
    sum     : 0,
    inc     : function() {
        this.number++;
    },
    dec     : function() {
        this.number = this.number - 1;
    },
    calcSum : function() {
        this.sum = this.number * 2 + 1;
    }
};

(function bind() {
    $('#plus').click(function() {
        controller.inc();
    });
    $('#minus').click(function() {
        controller.dec();
    });
    RC.$link('#number', 'controller/number');
})();

function parseController(object) {
    var keys = Object.keys(object),
        item, i;

    for (i = 0; i < keys.length; ++i) {
        item = object[keys[i]];

        if (typeof item === 'function') {
            parseMethod(item, keys[i], object);
        }
    }
}

function parseMethod(method, name, object) {
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
        }
    });

    var regexp = /\{((.|\s)+)}$/m,
        code = regexp.exec(method.toString())[1].trim();

    code = 'RC.$before(\'controller/' + changes[0] + '\', this.' + changes[0] + ');' +
           code +
           (code.substr(-1, 1) === ';' ? '' : ';') +
           'RC.$after(\'controller/' + changes[0] + '\', this.' + changes[0] + ');';

    object[name] = new Function(code);
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

parseController(controller);
