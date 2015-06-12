// intiliaze socket io
var socket = io();

$(document).ready(function(){
	console.log("working");
	getRooms();
});

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