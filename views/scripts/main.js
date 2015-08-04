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

/**
 * White board control
 */
var $_whiteboard = $(".whiteboard");
var $_whiteboardWidth = $_whiteboard.width();
var $_whiteboardHeight = $_whiteboard.height();
var $_whiteboardElement = $_whiteboard.get(0);
var $_whiteboardContext = $_whiteboardElement.getContext("2d");

var paint = false;
var color = "black"; 

// click arrays
var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var clickColor = new Array();

// globals
var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia).bind(navigator);

$(document).ready(function(){
	getRooms();

	// hide components when user is not logged in
	$('#roomContainer').hide();
	$('.room').hide();
	$('#login').hide();

	// Create a room once user is logged in  
	$( "#createRoomBtn" ).click(function() {
		var roomName = $('#roomName').val();
		$('#roomName').val('');
		console.log(socket);
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

// recieve canvas data
socket.on('recieveCanvasData', function(_clickX, _clickY, _clickDrag, _clickColor){
	clickX = _clickX;
	clickY = _clickY;
	clickDrag = _clickDrag;
	clickColor = _clickColor;

	console.log(_clickColor);

	redraw();
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
		setupStream(remoteStream);
    });
    
  }, function(err) {
    console.log('Failed to get local stream' ,err);
    toastr.fail('Failed to get local stream' ,err);
  });
});

// White board events
// ////////////////////////////

$_whiteboard.mousedown(function(e){
  var mouseX = e.pageX - this.offsetLeft;
  var mouseY = e.pageY - this.offsetTop;

  paint = true;
  addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
  redraw();
});

$_whiteboard.mousemove(function(e){
	var mouseX = e.pageX - this.offsetLeft;
  	var mouseY = e.pageY - this.offsetTop;

	if(paint){
		addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
    	redraw();
	}
});

$_whiteboard.mouseup(function(e){
	paint = false;
});

$_whiteboard.mouseleave(function(e){
	paint = false;
});

var addClick = function (x, y, dragging)
{
	clickX.push(x);
	clickY.push(y);
	clickDrag.push(dragging);
	clickColor.push(color);

	socket.emit('sendCanvasData', clickX, clickY, clickDrag, clickColor);

};
var redraw = function (){  
  $_whiteboardContext.clearRect(0, 0, $_whiteboardWidth, $_whiteboardHeight); // Clears the canvas

  $_whiteboardContext.lineJoin = "round";
  $_whiteboardContext.lineWidth = 5;
			
  for(var i=0; i < clickX.length; i++) {		
    $_whiteboardContext.beginPath();
    if(clickDrag[i] && i){
      $_whiteboardContext.moveTo(clickX[i-1], clickY[i-1]);
     }else{
       $_whiteboardContext.moveTo(clickX[i]-1, clickY[i]);
     }
     $_whiteboardContext.lineTo(clickX[i], clickY[i]);
     $_whiteboardContext.closePath();
     $_whiteboardContext.strokeStyle = clickColor[i];
     $_whiteboardContext.stroke();
  }

};

var changeColor = function (_color){
	color = _color;
};

var emptyPoints = function () {
	clickX = new Array();
	clickY = new Array();
	clickDrag = new Array();
	clickColor = new Array();
};

var clearScreen = function () {
  	$_whiteboardContext.clearRect(0, 0, $_whiteboardWidth, $_whiteboardHeight); // Clears the canvas
  	emptyPoints();
	redraw();
	socket.emit('sendCanvasData', clickX, clickY, clickDrag, clickColor);

}

