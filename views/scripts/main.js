var peerController = require('./app/peerController'),
	socketDispatcher = require('./app/socketDispatcher'),
	authController = require('./app/authController'),
	messageController = require('./app/messageController'),
	roomController = require('./app/roomController'),
	videoController = require('./app/videoController'),
	whiteboardController = require('./app/whiteboardController');

$(document).ready(function(){

	console.log("initializing the app . . . ");

	// initialize all required
	peerController.init();
	socketDispatcher.init();
	authController.init();
	messageController.init();
	roomController.init();
	videoController.init();
	whiteboardController.init();

});

