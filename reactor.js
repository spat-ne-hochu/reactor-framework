var reactorIsInit = false;
var reactor = {
	$models: {

	},
	start: function () {
		if(reactorIsInit) return;
		reactorIsInit = true;
		reactor.createModel();
	},
	createModel: function () {

		var modelName = document.querySelector('[rc-model]').getAttributeNode('rc-model').value;

		var elemOut = document.querySelector('[rc-out]');
		var propOut = elemOut.getAttributeNode('rc-out').value;

		var elemIn = document.querySelector('[rc-in]');
		var propIn = elemIn.getAttributeNode('rc-in').value;

		var newModel = {
			$bind: {

			}
		};

		// Связывание в шаблон
		newModel.$bind[propOut] = [elemOut];
		newModel.__defineSetter__(propOut, function (value) {
			for (var i=0; i<newModel.$bind[propOut].length; i++) {
				newModel.$bind[propOut][i].innerHTML = value;
			}
		});

		// Связывание из шаблона
		var inEvent = function() {
			setTimeout(function(){
				newModel[propIn] = elemIn.value;
			}, 1);
		};

		elemIn.addEventListener('keydown', inEvent);
		elemIn.addEventListener('paste', inEvent);



		reactor.$models[modelName] = newModel;
	},
	model: function (declaredModel) {
		//declaredModel
	},
	modelGet: function(name) {
		return this.$models[name];
	}
};

document.addEventListener("DOMContentLoaded", reactor.start, false);


