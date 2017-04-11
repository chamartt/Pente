// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var hat = require('hat');

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port
var playerTab = [];

// DEBUT FONCTION UTILES POUR LE CODE
function getPlayerWithGroupName(name) {
	for (var i = 0; i < playerTab.length; i++) {
		if (playerTab[i].groupName == name)
			return playerTab[i];
	}
	return;
}

function getPlayerWithToken(token) {
	for (var i = 0; i < playerTab.length; i++) {
		if (playerTab[i].idJoueur == token)
			return playerTab[i];
	}
	return;
}
// FIN FONCTION UTILES POUR LE CODE

// DEBUT ROUTE API
var router = express.Router();

router.get('/connect/:groupName', function(req, res) {
	if (playerTab.length >= 2) {
		res.status(401).send({error: "La partie a deja commencee"});
	}
	else {
		playerTab.push({groupName: req.params.groupName, idJoueur: hat()});
		res.status(200).send({
			idJoueur: getPlayerWithGroupName(req.params.groupName).idJoueur,
			code: 200,
			nomJoueur: req.params.groupName,
			playerTab: playerTab
		});
	}
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

app.use('/', router);
// FIN ROUTE API

// START THE SERVER
app.listen(port);
console.log('Magic happens on port ' + port);