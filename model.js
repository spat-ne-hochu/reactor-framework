/*reactor.model(function(){
	return {
		name: 'Вася'
	}
});*/
code = function() {
	var model = reactor.modelGet('firstModel');
	model.name = 'Вася';
}

document.addEventListener("DOMContentLoaded", code, false);
