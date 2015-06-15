// intiliaze socket io
var socket = io();

var peer = new Peer({key: 'v6uuhkcm835idx6r'});

var room = {};
var user = {};

var rooms = {};

var peerID = "";

var conn = {};

// globals
// var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);


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

	$('#videoIDBtn').click(function(){
		var _peerID = $('#videoID').val();
		socket.emit('sendVideoID', _peerID);
	});

	$('#sendVideoCall').click(function(){
		var _otherID = $('#sendVideoCallID').val();
		setupVideo(_otherID);
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
//////////////////////////////////////////

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

socket.on('recieveVideoID', function(_id){
	if(_id != peerID){
		console.log("received video id");
		conn = peer.connect(_id);
		conn.on('open', function(){
			conn.send('hi');
		});
	}

});

socket.on('recieveVideoCall', function(_id){
	if(_id != peerID){
		console.log("received video id");
		conn = peer.connect(_id);
		conn.on('open', function(){
			conn.send('hi');
		});
	}
});

var setupVideo = function (otherID) {
	getUserMedia({video: true, audio: true}, function(stream) {

		var call = peer.call(otherID, stream);

		$('#my-video').prop('src', URL.createObjectURL(stream));
		window.localStream = stream;

		call.on('stream', function(remoteStream) {
    	// Show stream in some video/canvas element.
			console.log("SHOW THE STREAM IN A VIDEO ELEMENT");
			$('#their-video').prop('src', URL.createObjectURL(remoteStream));

  	});
	}, function(err) {
	  console.log('Failed to get local stream' ,err);
	});
}

// Peer Events
/////////////////////////////////////////
peer.on('open', function(id) {
  console.log('My peer ID is: ' + id);
	peerID = id;

	$('#yourID').append("<p>" + id + "</p>");
});

peer.on('connection', function(conn) {
  conn.on('data', function(data){
    // Will print 'hi!'
    console.log(data);
  });
});

peer.on('call', function(call) {
  getUserMedia({video: true, audio: true}, function(stream) {
    call.answer(stream); // Answer the call with an A/V stream.
		$('#my-video').prop('src', URL.createObjectURL(stream));
		window.localStream = stream;

    call.on('stream', function(remoteStream) {
      // Show stream in some video/canvas element.
			$('#their-video').prop('src', URL.createObjectURL(remoteStream));
			
    });
  }, function(err) {
    console.log('Failed to get local stream' ,err);
  });
});
