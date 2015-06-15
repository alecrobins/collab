// intiliaze socket io
var socket = io();

var room = {};
var user = {};

var rooms = {};

$(document).ready(function(){
	console.log("working");
	getRooms();

	// Events
	$( "#createRoomBtn" ).click(function() {
		var roomName = $('#roomName').val();
		$('#roomName').val('');

		socket.emit('createRoom', roomName);

		$('.room').css("display", "block");
	});

	$('#login').click(function(){
		var username = $('#username').val();

		user.username = username;

		socket.emit('join', username);
	});

	$('#sendMessageBtn').click(function(){
		var message = $('#sendMsg').val();
		socket.emit('send', message);
		$('#sendMsg').val('');
	});

	$('#roomClick').click(function(){
		$('.room').css("display", "block");
	});

});

//Functions
function joinRoom (id){
	console.log(id);
	socket.emit('joinRoom', id);
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
	   success: function(data) {
	      console.log("SUCCESS");
	      var rooms = data;
	      for(var room in rooms){
	      	$("#listOfRooms").append("<li>" + room + "</li>");
	      }
	   },
	   type: 'GET'
	});
}

// Socket Events

// update of some message
socket.on('update', function (data) {
	// Display an info toast with no title
	toastr.info(data);
    console.log(data);
});

// when roomList is recieved
socket.on('roomList', function(data){
  rooms = data.rooms;
	console.log(rooms);
   for(var room in rooms){
   	$("#listOfRooms").append("<li id='roomClick' onclick='joinRoom(\"" + rooms[room].id + "\")'>" + rooms[room].name + "</li>");
   }
});

// when peopel are updated
socket.on('update-people', function(people){
	toastr.success("New user online!");
   for(var person in people){
   	$(".people").append("<li>" + people[person].name + "</li>");
   }
});

socket.on('chat', function(person, msg){
	toastr.success("New message recieved");
	var username = person.name;
	$('#messages').append("<li><b>" + username + ": </b>" + msg + "</li>");
});
