var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    routes = require('./routes.js'),
    socketCtrl = require('./controllers/socketCtrl');
    globals = require('./models/globals'),

    // variables used on callback functions 
    // for socket IO
    people = globals.people,
    rooms = globals.rooms,
    clients = globals.clients;

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/views'));
// routes for assets
app.use('/assets', express.static(__dirname + '/node_modules/'));
app.use('/assets', express.static(__dirname + '/views/scripts/'));
app.use('/assets', express.static(__dirname + '/bower_components'));

// set the routes
routes.set(app);

// socket io
io.on('connection', function(socket){

    socket.on("join", socketCtrl.join(io, socket));
    socket.on("createRoom", socketCtrl.createRoom(io, socket));
    socket.on("getPeerIDs", socketCtrl.getPeerIDs(io, socket));
    socket.on("joinRoom", socketCtrl.joinRoom(io, socket));
    socket.on("send", socketCtrl.send(io, socket));
    socket.on("sendVideoCall", socketCtrl.sendVideoCall(io, socket));
    socket.on("leaveRoom", socketCtrl.leaveRoom(io, socket));
    socket.on("removeRoom", socketCtrl.removeRoom(io, socket));
    socket.on("disconnect", socketCtrl.disconnect(io, socket));
    socket.on("sendCanvasData", socketCtrl.sendCanvasData(io, socket));

});

// start the server on port 3000
http.listen(3000, function(){
  console.log('listening on *:3000');
});
