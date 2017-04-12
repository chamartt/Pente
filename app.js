// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var hat = require('hat');
var http = require('http');
var server = {};
// configure app to use bodyParser()
// this will let us get the data from a POST
server = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// DEBUT VARIABLE DU JEU
var playerTab = [];
plateauJeu = [];
var nombreDeTour = 0;
var nbTenaillesJ1 = 0;
var nbTenaillesJ2 = 0;
var numJoueur = 1;
var dernierCoupX;
var dernierCoupY;
var tourJoueur;
var finDePartie = false;
var mortSubite = false;
var timeout = null;
var messageFinPartie = null;
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

function getPlayerWithNumber(nb) {
	for (var i = 0; i < playerTab.length; i++) {
		if (playerTab[i].number == nb)
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
		for (var j = 0; j < plateauJeu[i].length; j++) {
			console.log(plateauJeu[i][j]);
		}
	}
}

function generateJeu() {
	for(var i = 0; i <= 18; ++i) {
		plateauJeu[i] = [];
		for(var j = 0; j <= 18; j++) {
			plateauJeu[i][j] = 0;
		}
	}
}

function gestionTenaillesHaut(numeroJoueur, x, y) {
	x = parseInt(x);
	y = parseInt(y);
	if (numeroJoueur == 1) {
		if (x - 3 >= 0) {
			if (plateauJeu[x - 1][y] == 2 && plateauJeu[x - 2][y] == 2 && plateauJeu[x - 3][y] == 1) {
				// tenaille haut du pion posé
				nbTenaillesJ1++;
				if (mortSubite) {
					messageFinPartie = "Le joueur" + tourJoueur.groupName + " gagne en mort subite - tenaille";
					finDePartie = true;
				}
				plateauJeu[x - 1][y] = 0;
				plateauJeu[x - 2][y] = 0;
			}
		}
		if (x - 3 >= 0 && y + 3 <= 18) {
			if (plateauJeu[x - 1][y + 1] == 2 && plateauJeu[x - 2][y + 2] == 2 && plateauJeu[x - 3][y + 3] == 1) {
				// tenaille haut diagonale droite du pion posé
				nbTenaillesJ1++;
				if (mortSubite) {
					messageFinPartie = "Le joueur" + tourJoueur.groupName + " gagne en mort subite - tenaille";
					finDePartie = true;
				}
				plateauJeu[x - 1][y + 1] = 0;
				plateauJeu[x - 2][y + 2] = 0;
			}
		}
		if (x - 3 >= 0 && y - 3 >= 0) {
			if (plateauJeu[x - 1][y - 1] == 2 && plateauJeu[x - 2][y - 2] == 2 && plateauJeu[x - 3][y - 3] == 1) {
				// tenaille haut diagonale gauche du pion posé
				nbTenaillesJ1++;
				if (mortSubite) {
					messageFinPartie = "Le joueur" + tourJoueur.groupName + " gagne en mort subite - tenaille";
					finDePartie = true;
				}
				plateauJeu[x - 1][y - 1] = 0;
				plateauJeu[x - 2][y - 2] = 0;
			}
		}
	}
	else {
		if (x - 3 >= 0) {
			if (plateauJeu[x - 1][y] == 1 && plateauJeu[x - 2][y] == 1 && plateauJeu[x - 3][y] == 2) {
				// tenaille haut du pion posé
				nbTenaillesJ2++;
				if (mortSubite) {
					messageFinPartie = "Le joueur" + tourJoueur.groupName + " gagne en mort subite - tenaille";
					finDePartie = true;
				}
				plateauJeu[x - 1][y] = 0;
				plateauJeu[x - 2][y] = 0;
			}
		}
		if (x - 3 >= 0 && y + 3 <= 18) {
			if (plateauJeu[x - 1][y + 1] == 1 && plateauJeu[x - 2][y + 2] == 1 && plateauJeu[x - 3][y + 3] == 2) {
				// tenaille haut diagonale droite du pion posé
				nbTenaillesJ2++;
				if (mortSubite) {
					messageFinPartie = "Le joueur" + tourJoueur.groupName + " gagne en mort subite - tenaille";
					finDePartie = true;
				}
				plateauJeu[x - 1][y + 1] = 0;
				plateauJeu[x - 2][y + 2] = 0;
			}
		}
		if (x - 3 >= 0 && y - 3 >= 0) {
			if (plateauJeu[x - 1][y - 1] == 1 && plateauJeu[x - 2][y - 2] == 1 && plateauJeu[x - 3][y - 3] == 2) {
				// tenaille haut diagonale gauche du pion posé
				nbTenaillesJ2++;
				if (mortSubite) {
					messageFinPartie = "Le joueur" + tourJoueur.groupName + " gagne en mort subite - tenaille";
					finDePartie = true;
				}
				plateauJeu[x - 1][y - 1] = 0;
				plateauJeu[x - 2][y - 2] = 0;
			}
		}
	}
}
function gestionTenaillesBas(numeroJoueur, x, y) {
	x = parseInt(x);
	y = parseInt(y);
	if (numeroJoueur == 1) {
		if (x + 3 <= 18) {
			if (plateauJeu[x + 1][y] == 2 && plateauJeu[x + 2][y] == 2 && plateauJeu[x + 3][y] == 1) {
				// tenaille bas du pion posé
				nbTenaillesJ1++;
				if (mortSubite) {
					messageFinPartie = "Le joueur" + tourJoueur.groupName + " gagne en mort subite - tenaille";
					finDePartie = true;
				}
				plateauJeu[x + 1][y] = 0;
				plateauJeu[x + 2][y] = 0;
			}
		}
		if (x + 3 <= 18 && y + 3 <= 18) {
			if (plateauJeu[x + 1][y + 1] == 2 && plateauJeu[x + 2][y + 2] == 2 && plateauJeu[x + 3][y + 3] == 1) {
				// tenaille bas diagonale droite du pion posé
				nbTenaillesJ1++;
				if (mortSubite) {
					messageFinPartie = "Le joueur" + tourJoueur.groupName + " gagne en mort subite - tenaille";
					finDePartie = true;
				}
				plateauJeu[x + 1][y + 1] = 0;
				plateauJeu[x + 2][y + 2] = 0;
			}
		}
		if (x + 3 <= 18 && y - 3 >= 0) {
			if (plateauJeu[x + 1][y - 1] == 2 && plateauJeu[x + 2][y - 2] == 2 && plateauJeu[x + 3][y - 3] == 1) {
				// tenaille bas diagonale gauche du pion posé
				nbTenaillesJ1++;
				if (mortSubite) {
					messageFinPartie = "Le joueur" + tourJoueur.groupName + " gagne en mort subite - tenaille";
					finDePartie = true;
				}
				plateauJeu[x + 1][y - 1] = 0;
				plateauJeu[x + 2][y - 2] = 0;
			}
		}
	}
	else {
		if (x + 3 <= 18) {
			if (plateauJeu[x + 1][y] == 2 && plateauJeu[x + 2][y] == 2 && plateauJeu[x + 3][y] == 1) {
				// tenaille bas du pion posé
				nbTenaillesJ2++;
				if (mortSubite) {
					messageFinPartie = "Le joueur" + tourJoueur.groupName + " gagne en mort subite - tenaille";
					finDePartie = true;
				}
				plateauJeu[x + 1][y] = 0;
				plateauJeu[x + 2][y] = 0;
			}
		}
		if (x + 3 <= 18 && y + 3 <= 18) {
			if (plateauJeu[x + 1][y + 1] == 2 && plateauJeu[x + 2][y + 2] == 2 && plateauJeu[x + 3][y + 3] == 1) {
				// tenaille bas diagonale droite du pion posé
				nbTenaillesJ2++;
				if (mortSubite) {
					messageFinPartie = "Le joueur" + tourJoueur.groupName + " gagne en mort subite - tenaille";
					finDePartie = true;
				}
				plateauJeu[x + 1][y + 1] = 0;
				plateauJeu[x + 2][y + 2] = 0;
			}
		}
		if (x + 3 <= 18 && y - 3 >= 0) {
			if (plateauJeu[x + 1][y - 1] == 2 && plateauJeu[x + 2][y - 2] == 2 && plateauJeu[x + 3][y - 3] == 1) {
				// tenaille bas diagonale gauche du pion posé
				nbTenaillesJ2++;
				if (mortSubite) {
					messageFinPartie = "Le joueur" + tourJoueur.groupName + " gagne en mort subite - tenaille";
					finDePartie = true;
				}
				plateauJeu[x + 1][y - 1] = 0;
				plateauJeu[x + 2][y - 2] = 0;
			}
		}
	}
}
function gestionTenaillesCote(numeroJoueur, x, y) {
	x = parseInt(x);
	y = parseInt(y);
	if (numeroJoueur == 1) {
		if (y - 3 >= 0) {
			if (plateauJeu[x][y - 1] == 2 && plateauJeu[x][y - 2] == 2 && plateauJeu[x][y - 3] == 1) {
				// tenaille à gauche du pion posé
				nbTenaillesJ1++;
				if (mortSubite) {
					messageFinPartie = "Le joueur" + tourJoueur.groupName + " gagne en mort subite - tenaille";
					finDePartie = true;
				}
				plateauJeu[x][y - 1] = 0;
				plateauJeu[x][y - 2] = 0;
			}
		}
		if (y + 3 <= 18) {
			if (plateauJeu[x][y + 1] == 2 && plateauJeu[x][y + 2] == 2 && plateauJeu[x][y + 3] == 1) {
				// tenaille à droite du pion posé
				nbTenaillesJ1++;
				if (mortSubite) {
					messageFinPartie = "Le joueur" + tourJoueur.groupName + " gagne en mort subite - tenaille";
					finDePartie = true;
				}
				plateauJeu[x][y + 1] = 0;
				plateauJeu[x][y + 2] = 0;
			}
		}
	}
	else {
		if (y - 3 >= 0) {
			if (plateauJeu[x][y - 1] == 1 && plateauJeu[x][y - 2] == 1 && plateauJeu[x][y - 3] == 2) {
				// tenaille à gauche du pion posé
				nbTenaillesJ2++;
				if (mortSubite) {
					messageFinPartie = "Le joueur" + tourJoueur.groupName + " gagne en mort subite - tenaille";
					finDePartie = true;
				}
				plateauJeu[x][y - 1] = 0;
				plateauJeu[x][y - 2] = 0;
			}
		}
		if (y + 3 <= 18) {
			if (plateauJeu[x][y + 1] == 1 && plateauJeu[x][y + 2] == 1 && plateauJeu[x][y + 3] == 2) {
				// tenaille à droite du pion posé
				nbTenaillesJ2++;
				if (mortSubite) {
					messageFinPartie = "Le joueur" + tourJoueur.groupName + " gagne en mort subite - tenaille";
					finDePartie = true;
				}
				plateauJeu[x][y + 1] = 0;
				plateauJeu[x][y + 2] = 0;
			}
		}
	}
}

function gestionLigneVerticale(numeroJoueur, x, y) {
	var countConsecutive = 0;
	x = parseInt(x);
	y = parseInt(y);
	for (var i = x; i <= 18; i++) {
		if (plateauJeu[i][y] == numeroJoueur)
			countConsecutive++;
		else
			break;
	}
	if (x - 1 >= 0) {
		for (var i = x - 1; i >= 0; i--) {
			if (plateauJeu[i][y] == numeroJoueur)
				countConsecutive++;
			else
				break;
		}
	}
	if (countConsecutive >= 5) {
		messageFinPartie = "Le joueur " + tourJoueur.groupName + " gagne avec une ligne";
		finDePartie = true;
	}
}
function gestionLigneHorizontale(numeroJoueur, x, y) {
	var countConsecutive = 0;
	x = parseInt(x);
	y = parseInt(y);
	for (var i = y; i <= 18; i++) {
		if (plateauJeu[x][i] == numeroJoueur)
			countConsecutive++;
		else
			break;
	}
	if (y - 1 >= 0) {
		for (var i = y - 1; y >= 0; i--) {
			if (plateauJeu[x][i] == numeroJoueur)
				countConsecutive++;
			else
				break;
		}
	}
	if (countConsecutive >= 5) {
		messageFinPartie = "Le joueur " + tourJoueur.groupName + " gagne avec une ligne";
		finDePartie = true;
	}
}

function gestionLigneDiagonaleHautGaucheBasDroite(numeroJoueur, x, y) {
	var countConsecutive = 0;
	x = parseInt(x);
	y = parseInt(y);
	var i, j;
	for (i = x, j = y; i <= 18 && j <= 18; i++, j++) {
		if (plateauJeu[i][j] == numeroJoueur)
			countConsecutive++;
		else
			break;
	}
	if (y - 1 >= 0 && x - 1 >= 0) {
		for (i = x - 1, j = y - 1; i >= 0 && j >= 0; i--, j--) {
			if (plateauJeu[i][j] == numeroJoueur)
				countConsecutive++;
			else
				break;
		}
	}
	if (countConsecutive >= 5) {
		messageFinPartie = "Le joueur " + tourJoueur.groupName + " gagne avec une ligne";
		finDePartie = true;
	}
}
function gestionLigneDiagonaleHautDroiteBasGauche(numeroJoueur, x, y) {
	var countConsecutive = 0;
	var i, j;
	x = parseInt(x);
	y = parseInt(y);
	for (i = x, j = y; i >= 0 && j <= 18; i--, j++) {
		if (plateauJeu[i][j] == numeroJoueur)
			countConsecutive++;
		else
			break;
	}
	if (y - 1 >= 0 && x + 1 <= 18) {
		for (i = x + 1, j = y - 1; i <= 18 && j >= 0; i++, j--) {
			if (plateauJeu[i][j] == numeroJoueur)
				countConsecutive++;
			else
				break;
		}
	}
	if (countConsecutive >= 5) {
		messageFinPartie = "Le joueur " + tourJoueur.groupName + " gagne avec une ligne";
		finDePartie = true;
	}
}

function playerTooLong() {
	messageFinPartie = "Le joueur" + tourJoueur.groupName + " a perdu, temps d'attente trop long";
	finDePartie = true;
}
// FIN FONCTION UTILES POUR LE CODE

// DEBUT ROUTE API
var router = express.Router();

router.get('/connect/:groupName', function(req, res) {
	if (playerTab.length >= 2) {
		res.status(401).send({error: "La partie est en cours"});
	}
	else {
		playerTab.push({groupName: req.params.groupName, idJoueur: hat(), number: numJoueur});
		numJoueur++;
		if (playerTab.length == 2) {
			generateJeu();
			var randomStart = Math.floor(Math.random() * (1 - 0 + 1)) + 0;
			tourJoueur = playerTab[randomStart];
			setTimeout(function() {
				if (nbTenaillesJ1 == nbTenaillesJ2)
					mortSubite = true;
				else {
					messageFinPartie = "Le joueur " + nbTenaillesJ1 > nbTenaillesJ2 ? getPlayerWithNumber(1).groupName : getPlayerWithNumber(2).groupName+ " gagne au nombre de tenaille";
					finDePartie = true;
				}
			}, (1000*60*10));
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
		else if(nombreDeTour == 0 && (req.params.posX != 9 || req.params.posY != 9)) {
			res.status(406).send({error : "Premier coup au milieu : 9/9"});
		}
		else if(nombreDeTour == 2 && ((req.params.posX > 6 && req.params.posX < 12) || (req.params.posY > 6 && req.params.posY < 12))) {
			res.status(406).send({error: "Premier joueur doit jouer à l'exterieur du carré de son premier coup (3 intersections de marge)"});
		}
		else {
			// Place le pion
			plateauJeu[req.params.posX][req.params.posY] = getPlayerWithToken(req.params.idJoueur).number
			nombreDeTour++;
			dernierCoupX = req.params.posX;
			dernierCoupY = req.params.posY;
			// Gestion des tenailles - mort subite - fin du jeu
			gestionTenaillesHaut(getPlayerWithToken(req.params.idJoueur).number, req.params.posX, req.params.posY);
			gestionTenaillesBas(getPlayerWithToken(req.params.idJoueur).number, req.params.posX, req.params.posY);
			gestionTenaillesCote(getPlayerWithToken(req.params.idJoueur).number, req.params.posX, req.params.posY);		
			gestionLigneVerticale(getPlayerWithToken(req.params.idJoueur).number, req.params.posX, req.params.posY);
			gestionLigneHorizontale(getPlayerWithToken(req.params.idJoueur).number, req.params.posX, req.params.posY);
			gestionLigneDiagonaleHautGaucheBasDroite(getPlayerWithToken(req.params.idJoueur).number, req.params.posX, req.params.posY);
			gestionLigneDiagonaleHautDroiteBasGauche(getPlayerWithToken(req.params.idJoueur).number, req.params.posX, req.params.posY);
			if (nbTenaillesJ1 == 5 || nbTenaillesJ2 == 5) {
				messageFinPartie = "Le joueur " + tourJoueur.groupName + " gagne au nombre de tenailles";
				finDePartie = true;
			}
			res.status(200).send({success: "Pion mis en place"});
			tourJoueur = getOtherPlayer(req.params.idJoueur);
			clearTimeout(timeout)
			timeout = setTimeout(playerTooLong, 10000);
		}
	} 
});

router.get('/turn/:idJoueur', function(req, res) {
	res.status(200).send({
		status: (tourJoueur != undefined && tourJoueur !== null && tourJoueur.idJoueur !== null && tourJoueur.idJoueur == req.params.idJoueur) ? 1 : 0, 
		tableau: plateauJeu,
		nbTenaillesJ1: nbTenaillesJ1,
		nbTenaillesJ2: nbTenaillesJ2,
		dernierCoupX: dernierCoupX,
		dernierCoupY: dernierCoupY,
		prolongation: mortSubite,
		finPartie: finDePartie,
		detailFinPartie: messageFinPartie,
		numTour: nombreDeTour,
		code: 200
	});
});

/* CORS REQUEST */
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use('/', router);
// FIN ROUTE API

// START THE SERVER
// Run app on port 3000
server.listen('8080', function(){
    var host = server.address().address,
        port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);
});
