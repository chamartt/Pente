// server.js

// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var firebase = require("firebase");

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

router.get('/connect/:groupName', function(req, res) {
	res.json({
		idJoueur: 'idJoueur',
		code: 'codeHTTP',
		nomJoueur: 'nomJoueur'
	});
});

router.get('/play/:posX/:posY/:idJoueur', function(req, res) {
	res.json({
		code: 'codeHTTP'
	}); 
});

router.get('/turn/:idJoueur', function(req, res) {
	res.json({
		status: 'turnStatus(0/1)', 
		tableau: 'tableau',
		nbTenaillesJ1: 'nbTenaillesJ1',
		nbTenaillesJ2: 'nbTenaillesJ2',
		dernierCoupX: 'dernierCoupX',
		dernierCoupY: 'dernierCoupY',
		prolongation: 'prolongation',
		finPartie: 'finPartie',
		detailFinPartie: 'detailFinPartie',
		numTour: 'numTour',
		code: 'codeHTTP'
	});
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);