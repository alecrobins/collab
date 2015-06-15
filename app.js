var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Room = require('./room');
var uuid = require('node-uuid');

var people = {};
var rooms = {};
var clients = [];

// create a contiains function for arrays
Array.prototype.contains = function(k, callback) {
    var self = this;
    return (function check(i) {
        if (i >= self.length) {
            return callback(false);
        }
        if (self[i] === k) {
            return callback(true);
        }
        return process.nextTick(check.bind(null, i+1));
    }(0));
};

app.use('/assets', express.static(__dirname + '/node_modules/'));
app.use('/assets', express.static(__dirname + '/scripts/'));
app.use('/assets', express.static(__dirname + '/bower_components'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/rooms', function(req, res){
    res.json(rooms);
});

app.get('/people', function(req, res){
    res.json(people);
});

io.on('connection', function(socket){
  console.log('a user connected');

  // join a room
  socket.on("join", function(name){

    var roomID = null;

    people[socket.id] = {
        "name": name,
        "room": roomID,
    };

    io.sockets.emit("update", people[socket.id].name + "is online");
    io.sockets.emit("update-people", people);
    io.emit("roomList", {rooms: rooms});
    clients.push(socket); // populate the clients array with the socket object

    console.log(people);

  });

  // create a room
  socket.on("createRoom", function(name){
    console.log(people);
    // check if the person has not already created a room
    if(people[socket.id].room == null){
        // create the room id
        var id = uuid.v4();
        var room = new Room(name, id, socket.id);
        rooms[id] = room;

        io.sockets.emit("roomList", {rooms: rooms});

        // update the list of rooms on the frontend
        socket.room = name;
        socket.join(socket.room); // auto join creator to the room
        room.addPerson(socket.id); // add the person to the room object
        people[socket.id].room = id; // update the room key with the id of the created room
    }else{
        io.sockets.emit("update", "you have already created a room");
        }
    });

    // set up video callback
    socket.on("sendVideoID", function(id){
      console.log("RECIEVED video id");
      console.log(id);
      io.sockets.in(socket.room).emit("recieveVideoID", id);
    });

    // let others join the room
    socket.on("joinRoom", function(id){
        var room = rooms[id];

        // check that the owner is not reentering the room
        if(socket.id == room.owner){
            socket.emit("update", "you are th owner of this room and you have already been joined");
        }else{
            room.people.contains(socket.id, function(found){
                if(found){
                    socket.emit("update", "You have already joined this room");
                }else{
                    if(people[socket.id].inroom != null){
                        socket.emit("update", "You are already ina room (). Please leave it first to join another room");
                    }else{
                        room.addPerson(socket.id);
                        people[socket.id].inroom = id;
                        socket.room = room.name;

                        socket.join(socket.room); // ad person to the room;
                        user = people[socket.id];

                        io.sockets.in(socket.room).emit("update", user.name + "has connected to " + room.name + "room ");
                        socket.emit("update", "Welcome to " + room.name);
                        socket.emit("sendRoomID", {id: id});
                    }
                }
            });
        }
    });

    // send a message to the group
    socket.on("send", function(msg){
        if(io.sockets.adapter.rooms[socket.id][socket.id] != undefined){
            io.sockets.in(socket.room).emit("chat", people[socket.id], msg);
        }else{
            socket.emit("update", "Please connect to a room");
        }
    });

    socket.on("sendVideoCall", function(id){
      io.sockets.in(socket.room).emit("recieveVideoCall", id);
    });

    // leave a room event
    socket.on("leaveRoom", function(id){
        var room = rooms[id];

        if(socket.id == room.owner){
            var i = 0;

            // remove people from the room
            while ( i < clients.length){
                if(clients[i].id == room.people[i]){
                    peopel[clients[i].id].inroom = null;
                    clients[i].leave(room.name);
                }
                ++i;
            }

            delete rooms[id];

            peopel[room.owner].owns = null; // reset the owns object to null so a new room can be added

            // emit broadcast of new roomList
            io.sockets.emit("roomList", {rooms: rooms});

            io.sockets.in(socket.room).emit("update", "The owner is leaving the room. Thre room is removed");
        }else{
            room.people.contains(socket.id, function(found){
                if(found){
                    // make sure that the client is actually in the room
                    var personIndex = room.people.indexOf(socket.id);
                    room.people.splice(personIndex, 1);
                    io.socket.emit("update", "user " + people[socket.id].name + "has left he room");
                    socket.leave(room.name);
                }
            });
        }
    });

    // owner to remove a room (not just leave)
    socket.on("removeRoom", function(id){
        var room = rooms[id];

        if(room){
            if(socket.id == room.owner){
                var personCount = room.people.length;

                if(personCount > 2){
                    console.log('there are still people in the room');
                }else{
                    io.sockets.in(socket.room).emit("update", "the owner removed the room");

                    // remove people from the room
                    while ( i < clients.length){
                        if(clients[i].id == room.people[i]){
                            peopel[clients[i].id].inroom = null;
                            clients[i].leave(room.name);
                        }
                        ++i;
                    }

                    delete rooms[id];

                    peopel[room.owner].owns = null; // reset the owns object to null so a new room can be added

                    // emit broadcast of new roomList
                    io.sockets.emit("roomList", {rooms: rooms});

                }
            }else{
                socket.emit("update", "only the owner can remove a room");
            }
        }
    });

    // handle a user disconnect
    socket.on("disconnect", function(){
        if(people[socket.id]){
            if(people[socket.id].inroom == null){
                io.sockets.emit("update", people[socket.id].name + "has left the server");
                delete people[socket.io];
            }else{
                if(people[socket.id].owns != null){
                    var room = rooms[people[socket.id].owns];
                    if(socket.id == room.owner){
                        var i = 0;

                        while(i < clients.length) {
                          if (clients[i].id === room.people[i]) {
                            people[clients[i].id].inroom = null;
                            clients[i].leave(room.name);
                          }
                              ++i;
                        }

                        delete rooms[people[socket.id].owns];
                    }
                }

                io.sockets.emit("update", people[socket.id].name + "has left the server");
                delete people[socket.id];

                io.sockets.emit("update-people", people);
                io.sockets.emit("roomList", {rooms: rooms});

            }
        }
    });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
