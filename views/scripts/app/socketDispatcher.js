var socket = require('./socket')
	roomController = require('./roomController'),
	messageController = require('./messageController'),
	whiteboardController = require('./whiteboardController'),
	peopleController = require('./peopleController'),
	peerController = require('./peerController');

var socketDispatcher = (function(){

	// Socket Events
	var setEvents = function(){
		
		// update of some message
		socket.on('update', function (data) {
			toastr.info(data);
		   console.log(data);
		});

		// when roomList is recieved
		socket.on('roomList', function(data){
			roomController.addRooms(data.rooms);
		});

		// when peopel are updated
		socket.on('update-people', function(people){
			peopleController.setPeople(people);		   
		});

		socket.on('chat', function(person, msg){
			messageController.newMessage(person, msg);
		});

		socket.on('recieveVideoID', function(_id){
			if(_id != peerID){
				peerController.recieveVideoID(_id);
			}
		});

		socket.on('connectVideoCall', function(person){
			peerController.setupVideo(person.peerID);
		});

		// get the room id
		socket.on('sendRoomID', function(_room){
			roomController.setCurrentRoom(_room);
		});

		// recieve canvas data
		socket.on('recieveCanvasData', function(_clickX, _clickY, _clickDrag, _clickColor){
			whiteboardController.redrawCanvas(_clickX, _clickY, _clickDrag, _clickColor);
		});
		
	}
	

	// public
	return{
		
		init: function(){
			setEvents();
		},
		
	}

})();

module.exports = socketDispatcher;