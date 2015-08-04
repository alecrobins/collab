var socket = require('./socket');

var roomController = require('./roomController');

var videoController = (function(){

	var video, tempCount;

	var setEvents = function(){

		$('#sendVideoCall').click(function(){
			var currentRoom = roomController.getCurrentRoom();
			// gather the ids of all others in the group
			socket.emit('getPeerIDs', currentRoom.roomID);
		});

	}

	// public
	return{
		init: function(){
			video = {}; // canvas video
			tempCount = 0; // TODO: remove
			setEvents();
		}
	}

})();

module.exports = videoController;