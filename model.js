/*reactor.model(function(){
	return {
		name: 'Вася'
	}
});*/
code = function() {
	reactor.model('firstModel').name = '<b>Вася</b>';
	reactor.model('firstModel_1').name = '<a href="">Петя</a>';
	reactor.model('secondModel').name = '<i>Маша</i>';
}

document.addEventListener("DOMContentLoaded", code, false);
