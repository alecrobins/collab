var socket = require('./socket');

var roomController = (function(){
	
	var rooms;
	var currentRoom;

	var setEvents = function(){
		$(".room-click").on("click", function(e){
			var roomID = $(this).data("room-id");
			socket.emit('joinRoom', roomID);
			
			console.log("JOINING ROOM");

			// set the current room
			currentRoom.roomID = roomID;

			console.log(currentRoom);

			// show the rooms
			$('.room').show();
		});

		// Create a room once user is logged in  
		$( "#createRoomBtn" ).click(function() {
			var roomName = $('#roomName').val();
			$('#roomName').val('');
			socket.emit('createRoom', roomName);
			// show the rooms
			$('.room').show();
		});

	}

	var getRooms = function() {
		$.ajax({
		   url: '/rooms',
		   data: {
		      format: 'json'
		   },
		   error: function() {
		     console.log("error");
		   },
		   success: function(rooms) {
		      console.log("rooms recieved");
		      addRooms(rooms);
		   },
		   type: 'GET'
		});
	}

	var addRooms = function(_rooms){
		// set rooms to the new rooms list
		rooms = _rooms;
		
		// reset rooms list
		$('#listOfRooms').empty();

		for(var i in rooms){
			var room = rooms[i];
			$("#listOfRooms").append("<li><button class='btn btn-primary room-click' data-room-id=\"" + room.id + "\" >" + room.name + " +</button></li>");
		}

		// reset events
		setEvents();
	}

	return {
		
		init: function(){

			// hide components when user is not logged in
			$('#roomContainer').hide();
			$('.room').hide();

			rooms = [];
			currentRoom = {};
			setEvents();
			getRooms();

		},

		addRooms: function(_rooms){
			addRooms(_rooms);
		},

		getCurrentRoom: function(){
			console.log("GETTING CURREINT ROOM");
			console.log(currentRoom);
			return currentRoom;
		},

		setCurrentRoom: function(_room){
			console.log("room id: " + _room.id);
			currentRoom.roomID = _room.id;
		}

	}

})();

module.exports = roomController;