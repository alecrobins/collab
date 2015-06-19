var locals = require('./models/locals');

module.exports.set = function(app){
	app.get('/', function(req, res){
	  res.sendFile(__dirname + '/index.html');
	});

	app.get('/rooms', function(req, res){
	    res.json(locals.rooms);
	});

	app.get('/people', function(req, res){
	    res.json(people.getPeople());
	});
}