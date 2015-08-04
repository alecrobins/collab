var socket = require('./socket');

var messageController = (function(){
	
	var messages;

	var setEvents = function(){

		$('#sendMessageBtn').click(function(){
			var message = $('#sendMsg').val();
			socket.emit('send', message);

			// reset teh send msg
			$('#sendMsg').val('');
		});
		
	};

	/**
	 * Set the people who are online
	 * 
	 * @param {Array} _people list of people on line
	 */
	var setPeople = function(_people){
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

		newMessage: function(person, msg){
			toastr.success("New message recieved");
			var username = person.name;
			$('#messages').append("<li><b>" + username + ": </b>" + msg + "</li>");
		}

	}

})();

module.exports = messageController;

