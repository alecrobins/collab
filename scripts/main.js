// intiliaze socket io
var socket = io();
// intiliaze peer
var peer = new Peer({key: 'v6uuhkcm835idx6r'});
var peerID = "";

var room = {};
var rooms = {};
var user = {};

var conn = {};

var video = {};

// temp
var tempCount = 0;

// globals
var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);

$(document).ready(function(){
	console.log("working");
	getRooms();

	// hide components when user is not logged in
	$('#roomContainer').hide();
	$('.room').hide();
	$('#login').hide();

	// Create a room once user is logged in  
	$( "#createRoomBtn" ).click(function() {
		var roomName = $('#roomName').val();
		$('#roomName').val('');

		socket.emit('createRoom', roomName);

		// show the rooms
		$('.room').show();
	});

	$('#login').click(function(){
		var username = $('#username').val();
		user.username = username;

		// join on login
		socket.emit('join', username, peerID);

		// show rooms / create room
		$('#roomContainer').show();
	});

	$('#sendMessageBtn').click(function(){
		var message = $('#sendMsg').val();
		socket.emit('send', message);

		// reset teh send msg
		$('#sendMsg').val('');
	});

	$('#sendVideoCall').click(function(){
		// gather the ids of all others in the group
		socket.emit('getPeerIDs', room.roomID);
	});

});

//Functions
function joinRoom (id){
	console.log(id);
	socket.emit('joinRoom', id);
	// show the rooms
	$('.room').show();
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

var addRooms = function(rooms){
	// reset rooms list
	$('#listOfRooms').empty();

	for(var room in rooms){
		var room = rooms[room];
		$("#listOfRooms").append("<li><button id='roomClick' class='btn btn-primary' onclick='joinRoom(\"" + room.id + "\")'>" + room.name + " +</button></li>");
	}
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
	addRooms(rooms);
});

// when peopel are updated
socket.on('update-people', function(people){
	// reset people list
	$('.people').empty();

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

socket.on('connectVideoCall', function(person){
	console.log("received video id");
	console.log(person);
	setupVideo(person.peerID);
	// conn = peer.connect(_id);
	// conn.on('open', function(){
	// 	conn.send('hi');
	// });
});

// get the room id
socket.on('sendRoomID', function(_room){
	console.log("room id: " + _room.id);
	room.roomID = _room.id;
});

var setupVideo = function (otherID) {
	getUserMedia({video: true, audio: true}, function(stream) {

		var call = peer.call(otherID, stream);

		// set up the local video
		$('#my-video').prop('src', URL.createObjectURL(stream));
		window.localStream = stream;

		call.on('stream', function(remoteStream) {
    		setupStream(remoteStream);
  		});
	}, function(err) {
	  console.log('Failed to get local stream' ,err);
	});
}

var setupStream = function(stream){
	// Show stream in some video/canvas element.
	$('#video-container').prepend('<video class="their-video" id="remote-video-'+tempCount+'" width="400px" height="300px" hidden autoplay></video>');

	var temp = "#remote-video-" + tempCount;
	$(temp).prop('src', URL.createObjectURL(stream));

	// increment temp count
	tempCount += 1;

	setupCanvas(temp);
}

var setupCanvas = function(canvasID){
		// 	<canvas id= "c" width = "400px" height = "300px">
		// </canvas>
		// 
	$('#video-container').prepend('<canvas id="'+canvasID+'" width="400px" height="300px"></canvas>');
	var canvas = document.getElementById(canvasID),
	context = canvas.getContext('2d');

		// update video variable
	// video = document.getElementById('remote-video-0');
	video = $(canvasID).get(0);

	video.addEventListener('play', function(){
		draw(this, context, 400, 300);
	}, false);

}

var draw = function(video, context, width, height){
	context.drawImage(video, 0, 0, width, height);
	setTimeout(draw, 10, video, context, width, height);
};

// Peer Events
/////////////////////////////////////////
peer.on('open', function(id) {
  console.log('My peer ID is: ' + id);
	peerID = id;
	// show login
	$('#login').show();
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

	// set up my local stream
	$('#my-video').prop('src', URL.createObjectURL(stream));
	window.localStream = stream;

    call.on('stream', function(remoteStream) {
      // Show stream in some video/canvas element.
		// $('#their-video').prop('src', URL.createObjectURL(remoteStream));
		// $('#video-container').prepend('<video class="their-video" id="remote-video-'+tempCount+'" width="400px" height="300px" autoplay></video>');
		// var temp = "#remote-video-" + tempCount;
		// $(temp).prop('src', URL.createObjectURL(remoteStream));
		// 
		setupStream(remoteStream);

    });
  }, function(err) {
    console.log('Failed to get local stream' ,err);
    toastr.fail('Failed to get local stream' ,err);
  });
});
