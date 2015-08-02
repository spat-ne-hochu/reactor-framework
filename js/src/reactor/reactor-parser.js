reactor.parser = (function() {
    function parseController(ctrl) {
        console.time('parseController');

        var keys = Object.keys(ctrl),
            item, i;

        ctrl.__deps = {};

        for (i = 0; i < keys.length; ++i) {
            item = ctrl[keys[i]];

            if (typeof item === 'function' && keys[i].substr(0,2) !== '__') {
                parseMethod(item, keys[i], ctrl);
            }
        }

        console.timeEnd('parseController');

        return ctrl;
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

    function parseFunction(func) {
        
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

    return {
        parseObject   : parseController,
        parseFunction : parseFunction
    }
})();
