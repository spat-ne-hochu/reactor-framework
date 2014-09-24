var reactorIsInit = false;
var reactor = {
	$models: {

	},
	start: function () {
		if (reactorIsInit) return;
		reactorIsInit = true;

		var elementList = document.querySelectorAll('[rc-model]'), i, currentModel, model;
		for (i=0; i<elementList.length; i++) {
			//console.log( reactor.$directives['rc-model'] );
			currentModel = reactor.$directives['rc-model'](undefined, elementList[i]);
			walkDom(elementList[i], currentModel);
		}

		function walkDom (node, currentModel) {
			var elementList = node.childNodes, i, k;
			//console.log(elementList);
			for (i=0; i < elementList.length; i++) {
				if (elementList[i].nodeType == 1) {

					var attrs = elementList[i].attributes;
					for (k=0; k < attrs.length; k++) {
						var attr = attrs[k].name;
						if (attr.indexOf('rc') === 0) {
							if (reactor.$directives[attr]) {
								var tmp = reactor.$directives[attr](currentModel, elementList[i]);
								if(attr == 'rc-model') {
									currentModel = tmp;
								}
							}
						}
					}
					if (elementList[i].childNodes.length > 0) {
						walkDom(elementList[i], currentModel);
					}
				}
			}
		}

	},
	model: function(name) {
		return this.$models[name];
	},
	$directives: {},
	directive: function (name, factory) {
		if(!this.$directives[name]) {
			this.$directives[name] = factory();
		}
	}
};

reactor.directive('rc-in', function() {
	return function(model, element) {
		//console.log('rc-in factory', model, element);
		var prop = element.getAttributeNode('rc-in').value;
		var inEvent = function() {
			setTimeout(function() {
				var value;
				if ('checkbox' === element.type) {
					value = element.checked;
				} else {
					value = element.value;
				}
				if (model[prop] != value) {
					model[prop] = value;
					if (model.$depend[prop]) {
						var depend = model.$depend[prop];
						for (var i=0; i<depend.length; i++) {
							for (var k=0; k<model.$out[depend[i]].length; k++) {
								model.$out[depend[i]][k].innerHTML = model[depend[i]]();
							}

						}
					}
				}
			}, 1);
		};
		element.addEventListener('keydown', inEvent);
		element.addEventListener('paste', inEvent);
		element.addEventListener('click', inEvent);
		inEvent();
	}
});

reactor.directive('rc-out', function() {
	return function(model, element) {
		//console.log('rc-out factory', model, element);
		var prop = element.getAttributeNode('rc-out').value;
		var funcReg = /([a-zA-Z0-9_$]+)\(\)(?:=\[((?:(?:[a-zA-Z0-9_$]+),)*(?:[a-zA-Z0-9_$]+)?)\])?/;
		if (funcReg.test(prop)) {
			var arr = funcReg.exec(prop);
			var propName = arr[1];
			var depend = (arr[2]) ? arr[2].split(',') : [];
			for (var i=0; i<depend.length; i++) {
				if(!model.$depend[depend[i]]){
					model.$depend[depend[i]] = [];
				}
				model.$depend[depend[i]].push(propName);
				if (!model.$out[prop]) {
					model.$out[propName] = [element];
				} else {
					model.$out[prop].push(element);
				}
			}
		} else {
			if (!model.$out[prop]) {
				model.$out[prop] = [element];
				model.__defineSetter__(prop, function (value) {
					for (var i=0; i<model.$out[prop].length; i++) {
						model.$out[prop][i].innerHTML = value;
					}
				});
			} else {
				model.$out[prop].push(element);
			}
		}
	}
});

reactor.directive('rc-model', function() {
	return function(model, element) {
		//console.log('rc-model factory', model, element);
		var modelName = element.getAttributeNode('rc-model').value;
		var newModel = {$out:{},$depend:{}};
		if (model !== undefined) {
			newModel.$parent = model;
		}
		var modelNameBase = modelName, num = 1;
		while (reactor.$models[modelName]) {
			modelName = modelNameBase + '_' + num;
			num++;
		}
		newModel.$name = modelName;
		reactor.$models[modelName] = newModel;
		return newModel;
	}
});

document.addEventListener("DOMContentLoaded", reactor.start, false);


