var globals = require('./models/globals');

module.exports.set = function(app){
	app.get('/', function(req, res){
	  res.render('index');
	});

	app.get('/rooms', function(req, res){
	    res.json(globals.rooms);
	});

	app.get('/people', function(req, res){
	    res.json(people.getPeople());
	});
}