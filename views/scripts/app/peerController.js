var getUserMedia = require('./getUserMedia');

var peerController = (function(){

	var peer, peerID, conn, tempCount;

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


	var setEvents = function(){
		peer.on('open', function(id) {
		  console.log('My peer ID is: ' + id);
			peerID = id;
			// show login
			$('#login').show();
		});

		peer.on('connection', function(conn) {
		  conn.on('data', function(data){
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

	}

	// public
	return{
		init: function(){
			
			// intiliaze peer
			peer = new Peer({key: 'v6uuhkcm835idx6r'});
			peerID = "";
			conn = {}; // the peerID connection
			tempCount = 0;

			setEvents();

		},

		getPeerID: function(){
			return peerID;
		},

		setupVideo: function(otherID){
			console.log("received video id");
			setupVideo(otherID);
		},

		recieveVideoID: function(_id){
			console.log("received video id");
			conn = peer.connect(_id);
			conn.on('open', function(){
				conn.send('hi');
			});
		}
	}

})();

module.exports = peerController;