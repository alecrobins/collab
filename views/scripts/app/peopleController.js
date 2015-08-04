var peopleController = (function(){
	
	var people;

	var setEvents = function(){
	};

	/**
	 * Set the people who are online
	 * 
	 * @param {Array} _people list of people on line
	 */
	var setPeople = function(_people){
		toastr.success("New user online!");
		
		var people = people;

		// reset people list
		$('.people').empty();

		for(var person in people){
		   $(".people").append("<li>" + people[person].name + "</li>");
		}
	}

	return {
		
		init: function(){
			people = [];
			setEvents();
		},

		setPeople: function(_people){
			setPeople(_people);
		}

	}

})();

module.exports = peopleController;