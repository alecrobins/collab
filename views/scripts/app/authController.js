var socket = require('./socket');
var peer = require('./peerController');

var authController = (function(){
	
	var user;

	var setEvents = function(){
		$('#login').click(function(){
			var username = $('#username').val();
			user.username = username;

			// join on login
			socket.emit('join', username, peer.getPeerID());

			// show rooms / create room
			$('#roomContainer').show();
		});
	};

	return {
		
		init: function(){
			$('#login').hide();
			user = {};
			setEvents();
		},

	}

})();

module.exports = authController;

