reactor.debuger = (function() {
    var colors = [];
    var domainsColors = {};

    (function generateColors() {
        for (var h = 0; h < 360; h+=36) {
            colors.push('color: hsl(' + h + ', 75%, 50%);');
        }
    })();

    function getColorForDomain(domain) {
        if (! domainsColors[domain]) {
            var currentColorIndex = getColorForDomain.lastColorIndex++;
            if (! colors[currentColorIndex]) {
                currentColorIndex = getColorForDomain.lastColorIndex = 0;
            }
            domainsColors[domain] = currentColorIndex;
        }

        return colors[domainsColors[domain]];
    }
    getColorForDomain.lastColorIndex = 0;

    function info(domain, name, info) {
        if (window.console && window.console.log) {
            console.log.apply(console, [
                ('%c[' + domain + '] ' + name + ' > '),
                getColorForDomain(domain),
                Array.prototype.slice.call(arguments, 2)
            ]);
        }
    }

    return {
        info : info
    }
})();
