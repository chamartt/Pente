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

// DEBUT VARIABLE DU JEU
var playerTab = [];
var plateauJeu = [];
var nombreDeTour = 0;
var nbTenailleJ1 = 0;
var nbTenaillesJ2 = 0;
var numJoueur = 1;
var dernierCoupX;
var dernierCoupY;
var tourJoueur;
var finDePartie = false;
var mortSubite = false;
// FIN VARIABLE DU JEU

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

function getOtherPlayer(token) {
	for (var i = 0; i < playerTab.length; i++) {
		if (playerTab[i].idJoueur != token)
			return playerTab[i];
	}
	return;
}
function logPlateauJeu() {
	for (var i = 0; i < plateauJeu.length; i++) {
		console.log(plateauJeu[i]);
	}
}

function generateJeu() {
	for (var i = 0; i < 19; i++) {
		plateauJeu.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
	}
}
// FIN FONCTION UTILES POUR LE CODE

// DEBUT ROUTE API
var router = express.Router();

router.get('/connect/:groupName', function(req, res) {
	if (playerTab.length >= 2) {
		res.status(401).send({error: "La partie a deja commencee"});
	}
	else {
		playerTab.push({groupName: req.params.groupName, idJoueur: hat(), number: numJoueur});
		numJoueur++;
		if (playerTab.length == 2) {
			generateJeu();
			var randomStart = Math.floor(Math.random() * (1 - 0 + 1)) + 0;
			tourJoueur = playerTab[randomStart];
			setTimeout(function() {
				mortSubite = true;
			}, (1000*60*10);
		}
		res.status(200).send({
			idJoueur: getPlayerWithGroupName(req.params.groupName).idJoueur,
			code: 200,
			nomJoueur: req.params.groupName,
			numJoueur: getPlayerWithGroupName(req.params.groupName).number
		});
	}
});

router.get('/play/:posX/:posY/:idJoueur', function(req, res) {
	
	if (tourJoueur.idJoueur != req.params.idJoueur) {
		res.status(401).send({error: "Impossible, attendez votre tour"});
	}
	else {
		if (finDePartie) {
			res.status(406).send({error: "Partie finie"});
		}
		else if (isNaN(req.params.posX) || 
			isNaN(req.params.posY) || 
			req.params.posX < 0 || 
			req.params.posX > 18 || 
			req.params.posY < 0 || 
			req.params.posX > 18) {
			res.status(406).send({error: "Coup invalide, x et y compris entre 0 et 18"});
		}
		else if (plateauJeu[req.params.posX][req.params.posY] != 0) {
			res.status(406).send({error: "Coup invalide, place deja prise"});
		}
		else {
			// Place le pion
			plateauJeu[req.params.posX][req.params.posY] = getPlayerWithToken(req.params.idJoueur).number
			nombreDeTour++;
			dernierCoupX = req.params.posX;
			dernierCoupY = req.params.posY;
			tourJoueur = getOtherPlayer(req.params.idJoueur);
			res.status(200).send({success: "Pion mis en place"});
			// [TODO] Gestion des tenailles - mort subite - fin du jeu
			// ......
		}
	} 
});

router.get('/turn/:idJoueur', function(req, res) {
	res.status(200).send({
		status: tourJoueur.idJoueur == req.params.idJoueur ? 1 : 0, 
		tableau: plateauJeu,
		nbTenaillesJ1: nbTenailleJ1,
		nbTenaillesJ2: nbTenaillesJ2,
		dernierCoupX: dernierCoupX,
		dernierCoupY: dernierCoupY,
		prolongation: mortSubite,
		finPartie: finDePartie,
		detailFinPartie: 'detailFinPartie',
		numTour: nombreDeTour,
		code: 200
	});
});

app.use('/', router);
// FIN ROUTE API

// START THE SERVER
app.listen(port);
console.log('Magic happens on port ' + port);