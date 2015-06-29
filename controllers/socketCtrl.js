/**
 * Control socket events by returning
 * the proper handler of events
 */
var uuid = require('node-uuid'),
    Room = require('../models/room');

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

module.exports.join = function(io, socket){
    return function (name, peerID){
        var roomID = null;

        // add a new person to the people array on join
        people[socket.id] = {
            "name": name,
            "room": roomID,
            "peerID": peerID
        };

        io.sockets.emit("update", people[socket.id].name + "is online");
        io.sockets.emit("update-people", people);
        io.emit("roomList", {rooms: rooms});
        clients.push(socket); // populate the clients array with the socket object
    };
};

module.exports.createRoom = function(io, socket){
    return function(name){
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
            people[socket.id].inroom = id;
            socket.emit("sendRoomID", {id: id});

        }else{
            io.sockets.emit("update", "you have already created a room");
        }
    };
};

module.exports.getPeerIDs = function(io, socket){
    return function(roomID){
        console.log("sendingPeerIDs");

        var room = rooms[roomID];
        var _people = room.people;
        
        for(var p in _people){
            var personID = _people[p];
            // send to all except your self
            if(socket.id != personID){
                socket.emit('connectVideoCall', people[personID]);
            }
        }

    };
}

module.exports.joinRoom = function(io, socket){
    return function(id){
        var room = rooms[id];

        // check that the owner is not reentering the room
        if(socket.id == room.owner){
            socket.emit("update", "you are th owner of this room and you have already been joined");
        }else{
            room.people.contains(socket.id, function(found){
                if(found){
                    socket.emit("update", "You have already joined this room");
                }else{
                    if(people[socket.id] == undefined){
                        socket.emit("update", "You are not logged in. Log in to join a room");
                    }
                    else if(people[socket.id].inroom != null){
                        socket.emit("update", "You are already ina room (). Please leave it first to join another room");
                    }else{
                        room.addPerson(socket.id);
                        people[socket.id].inroom = id;
                        socket.room = room.name;

                        socket.join(socket.room); // add person to the room;
                        var user = people[socket.id];

                        io.sockets.in(socket.room).emit("update", user.name + "has connected to " + room.name + "room ");
                        socket.emit("update", "Welcome to " + room.name);
                        socket.emit("sendRoomID", {id: id});

                        // check if there are any canvas data
                        if(room.canvasData !== null){
                            socket.emit("recieveCanvasData", 
                                room.canvasData.currentClickX,
                                room.canvasData.currentClickY,
                                room.canvasData.currentClickDrag,
                                room.canvasData.currentClickColor);
                        }
                    }
                }
            });
        }
    }
}

module.exports.send = function(io, socket){
    return function(msg){
        if(io.sockets.adapter.rooms[socket.id][socket.id] != undefined){
            io.sockets.in(socket.room).emit("chat", people[socket.id], msg);
        }else{
            socket.emit("update", "Please connect to a room");
        }
    };
}

module.exports.leaveRoom = function(io, socket){
    return function(id){
        var room = rooms[id];

        if(socket.id == room.owner){
            var i = 0;

            // remove people from the room
            while ( i < clients.length){
                if(clients[i].id == room.people[i]){
                    people[clients[i].id].inroom = null;
                    clients[i].leave(room.name);
                }
                ++i;
            }

            delete rooms[id];

            people[room.owner].owns = null; // reset the owns object to null so a new room can be added

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
    };
}

module.exports.sendVideoCall = function(io, socket){
    return function(id){
      io.sockets.in(socket.room).emit("recieveVideoCall", id);
    };
}

module.exports.removeRoom = function(io, socket){
    return function(id){
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
                            people[clients[i].id].inroom = null;
                            clients[i].leave(room.name);
                        }
                        ++i;
                    }

                    delete rooms[id];

                    people[room.owner].owns = null; // reset the owns object to null so a new room can be added

                    // emit broadcast of new roomList
                    io.sockets.emit("roomList", {rooms: rooms});

                }
            }else{
                socket.emit("update", "only the owner can remove a room");
            }
        }
    }
}

module.exports.disconnect = function(io, socket){
    return function(){
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
    }
}

module.exports.sendCanvasData = function(io, socket){
    return function(clickX, clickY, clickDrag, clickColor){
        var room = rooms[people[socket.id].inroom];

        room.canvasData = {
            "currentClickX": clickX,
            "currentClickY": clickY,
            "currentClickDrag": clickDrag,
            "currentClickColor": clickColor
        };

        socket.broadcast.to(socket.room).emit("recieveCanvasData", clickX, clickY, clickDrag, clickColor);
    }
}