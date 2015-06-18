
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