var app = angular.module("penteApp", []); 

app.controller("penteCtrl", ['$scope', '$http', '$interval', '$timeout', function($scope, $http, $interval, $timeout) {
	$scope.connnected = false;
	$scope.apiURL = "http://localhost:8080/";
	$scope.idJoueur;
	$scope.numJoueur;
	$scope.nomJoueur;
	$scope.nbTenaillesJ1 = 0;
	$scope.nbTenaillesJ2 = 0;
	$scope.nbCoupJoue = 0;
	$scope.statusJoueur = 0;
	$scope.isPlaying = false;
	$scope.interval;
	$scope.errorMessage = {error : false, message: null};
	$scope.detailMessage = {active : false, message: null};
	$scope.errorInPlay = {active : false, message: null};
	$scope.plateauJeu;
	$scope.gameMode;
	$scope.tempData;
	$scope.isFinPartie = false;
	$scope.globalTimerStarted = false;
	$scope.minuteGlobal;
	$scope.secondGlobal;
	
	//TIMER 10M
	$scope.startGlobalTimer = function() {
		var countDownDate = new Date();
		countDownDate.setMinutes(countDownDate.getMinutes() + 10);

		var x = setInterval(function() {
		  var now = new Date().getTime();
		  var distance = countDownDate - now;
		  
		  if (distance < 0) {
			clearInterval(x);
		  }
		  
		  $scope.minuteGlobal = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
		  $scope.minuteGlobal < 10 ? $scope.minuteGlobal = "0"+$scope.minuteGlobal : $scope.minuteGlobal < 1 ? $scope.minuteGlobal = "00" : null;
		  $scope.secondGlobal = Math.floor((distance % (1000 * 60)) / 1000);
		  $scope.secondGlobal < 10 ? $scope.secondGlobal = "0"+$scope.secondGlobal : $scope.secondGlobal < 1 ? $scope.secondGlobal = "00" : null;
		}, 1000);
	}	
	
	$scope.joinGame = function(gameMode) {
		if ($scope.nomJoueur.length != 8 || isNaN($scope.nomJoueur.substring(0,4)) || $scope.nomJoueur.substring(4, 8).match(/\d+/g) != null) {
			$scope.errorMessage.error = true;
			$scope.errorMessage.message = "Le nom d'équipe doit être sous la forme : 4 chiffres - 4 lettres";
			$timeout(function() {
				$scope.errorMessage = {error: false, message: null};
			}, 3000);
		}
		else {
			$http.get($scope.apiURL + "/connect/" + $scope.nomJoueur)
			.then(function success(response) {
				var data = response.data;
				$scope.connected = true;
				$scope.idJoueur = data.idJoueur;
				$scope.gameMode = gameMode;
				$scope.numJoueur = data.numJoueur;
				$scope.interval = $interval($scope.getTurnInfo,500)
				
			}, function error(response) {
				if (response.data == undefined || response.data == null) {
					$scope.errorMessage.error = true;
					$scope.errorMessage.message = "Erreur inconnue / serveur indisponible";
				}
				else {
					$scope.errorMessage.error = true;
					$scope.errorMessage.message = response.data.error;
				}			
			});
		}
	};
	
	$scope.makeAPlay = function(x, y) {
		if ($scope.isPlaying) {
			$http.get($scope.apiURL + "/play/" + x + "/" + y + "/" + $scope.idJoueur)
			.then(function success(response) {
				$scope.isPlaying = false;
			}, function error(response) {
				$scope.errorInPlay.active = true;
				$scope.errorInPlay.message = response.data.error;
				$scope.isPlaying = true;
				$timeout(function() {
					$scope.errorInPlay = {active: false, message: null};
				}, 2000);
			});
		}
		
	}
	
	$scope.myTurnToPlay = function(data) {
		var tableau = data.tableau;
		var dernierCoupX = data.dernierCoupX;
		var dernierCoupY = data.dernierCoupY;
		var numJoueurAdverse = $scope.numJoueur == 1 ? 2 : 1;
		var choixX;
		var choixY;
		var retour = {'posX': null, 'posY': null};
		$scope.tempData = data;
		
		if ($scope.nbCoupJoue == 0) {
			choixX = 9; 
			choixY = 9;
		}
		else if ($scope.nbCoupJoue == 2) {
			choixX = Math.floor(Math.random() * 6) + 12; 
			choixY = Math.floor(Math.random() * 6) + 12;
		}
		else {
			choixX = Math.floor(Math.random() * 18) + 0;
			choixY = Math.floor(Math.random() * 18) + 0;

			retour = $scope.isPaireFormable(tableau, $scope.numJoueur);
			if (retour.posX != null && retour.posY != null) {
				console.log("Paire formable");
				choixX = retour.posX; 
				choixY = retour.posY;
			}
				
			retour = $scope.isPaireMangeable(tableau, $scope.numJoueur);
			if (retour.posX != null && retour.posY != null){
				console.log("Paire mangeable à nous");
				choixX = retour.posX; 
				choixY = retour.posY;
			}

			retour = $scope.isPaireMangeable(tableau, numJoueurAdverse);
			if (retour.posX != null && retour.posY != null){
				console.log("Paire formable de l'adversaire");
				choixX = retour.posX; 
				choixY = retour.posY;
			}

			retour = $scope.isLigneDeDeux(tableau, $scope.numJoueur);
			if (retour.posX != null && retour.posY != null){
				console.log("Ligne de deux");
				choixX = retour.posX; 
				choixY = retour.posY;
			}

			retour = $scope.isLigneDeTrois(tableau, numJoueurAdverse);
			if (retour.posX != null && retour.posY != null){
				console.log("Ligne de Trois adverse");
				choixX = retour.posX; 
				choixY = retour.posY;
			}

			retour = $scope.isLigneDeTrois(tableau, $scope.numJoueur);
			if (retour.posX != null && retour.posY != null){
				console.log("Ligne de deux");
				choixX = retour.posX; 
				choixY = retour.posY;
			}

			retour = $scope.isDeuxPionsEspacePion(tableau, $scope.numJoueur);
			if (retour.posX != null && retour.posY != null){
				console.log("DeuxPionsEspacePion");
				choixX = retour.posX; 
				choixY = retour.posY;
			}

			retour = $scope.isTroisPionsEspacePion(tableau, $scope.numJoueur);
			if (retour.posX != null && retour.posY != null){
				console.log("isTroisPionsEspacePion");
				choixX = retour.posX; 
				choixY = retour.posY;
			}

			retour = $scope.isDeuxPionsEspaceDeuxPions(tableau, $scope.numJoueur);
			if (retour.posX != null && retour.posY != null){
				console.log("isDeuxPionsEspaceDeuxPions");
				choixX = retour.posX; 
				choixY = retour.posY;
			}

			retour = $scope.isLigneDeQuatre(tableau, $scope.numJoueur);
			if (retour.posX != null && retour.posY != null){
				console.log("isLigneDeQuatre");
				choixX = retour.posX; 
				choixY = retour.posY;
			}
		}	

		if (data.finPartie) {
			$interval.cancel($scope.interval);
		}
		else {
			$http.get($scope.apiURL + "/play/" + choixX + "/" + choixY + "/" + $scope.idJoueur)
			.then(function success(response) {
				$scope.isPlaying = false;
			}, function error(response) {
				$scope.errorInPlay.active = true;
				$scope.errorInPlay.message = response.data.error;
				$scope.isPlaying = true;
				$scope.myTurnToPlay($scope.tempData);
				$timeout(function() {
					$scope.errorInPlay = {active: false, message: null};
				}, 2000);
			});
		}
	};
	
	$scope.isLigneDeDeux = function(tableau, numJoueur) {
		var retourSecond = {'posX': null, 'posY': null};
		var retourFinal = {'posX': null, 'posY': null};
		
		retourSecond = $scope.isLigneDeDeuxDiagonale(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		retourSecond = $scope.isLigneDeDeuxVerticale(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		retourSecond = $scope.isLigneDeDeuxHorizontale(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		
		return retourFinal;
	};
	$scope.isLigneDeTrois = function(tableau, numJoueur) {
		var retourSecond = {'posX': null, 'posY': null};
		var retourFinal = {'posX': null, 'posY': null};
		
		retourSecond = $scope.isLigneDeTroisDiagonale(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isLigneDeTroisDiagonale");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		retourSecond = $scope.isLigneDeTroisVerticale(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isLigneDeTroisVerticale");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		retourSecond = $scope.isLigneDeTroisHorizontale(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isLigneDeTroisHorizontale");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		
		return retourFinal;
	};
	$scope.isLigneDeQuatre = function(tableau, numJoueur) {
		var retourSecond = {'posX': null, 'posY': null};
		var retourFinal = {'posX': null, 'posY': null};
		
		retourSecond = $scope.isLigneDeQuatreDiagonale(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isLigneDeQuatreDiagonale");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		retourSecond = $scope.isLigneDeQuatreVerticale(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isLigneDeQuatreVerticale");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		retourSecond = $scope.isLigneDeQuatreHorizontale(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isLigneDeQuatreHorizontale");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		
		return retourFinal;
	};

	$scope.isPaireFormable = function(tableau, numJoueur) {
		var retourSecond = {'posX': null, 'posY': null};
		var retourFinal = {'posX': null, 'posY': null};
		
		retourSecond = $scope.isPaireFormableDiagonal(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isPaireFormableDiagonal");
			retourFinal.posX = retourSecond.posX;
			retourFinal.posY = retourSecond.posY;
		}

		retourSecond = $scope.isPaireFormableHorizontale(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isPaireFormableHorizontale");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}

		retourSecond = $scope.isPaireFormableVerticale(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isPaireFormableVerticale");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		
		return retourFinal;
	};
	$scope.isPaireMangeable = function(tableau, numJoueur) {
		var retourSecond = {'posX': null, 'posY': null};
		var retourFinal = {'posX': null, 'posY': null};
		
		retourSecond = $scope.isPaireMangeableDiagonale(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isPaireMangeableDiagonale");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		retourSecond = $scope.isPaireMangeableHorizontale(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isPaireMangeableHorizontale");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		retourSecond = $scope.isPaireMangeableVerticale(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isPaireMangeableVerticale");
			retourFinal.posX = retourSecond.posX;
			retourFinal.posY = retourSecond.posY;
		}
		
		return retourFinal;
	};
	$scope.isDeuxPionsEspacePion = function(tableau, numJoueur) {
		var retourSecond = {'posX': null, 'posY': null};
		var retourFinal = {'posX': null, 'posY': null};
		
		retourSecond = $scope.isDeuxPionsEspacePionDiagonal(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isDeuxPionsEspacePionDiagonal");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		retourSecond = $scope.isDeuxPionsEspacePionVertical(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isDeuxPionsEspacePionVertical");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		retourSecond = $scope.isDeuxPionsEspacePionHorizontal(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isDeuxPionsEspacePionHorizontal");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		
		return retourFinal;
	};
	$scope.isTroisPionsEspacePion = function(tableau, numJoueur) {
		var retourSecond = {'posX': null, 'posY': null};
		var retourFinal = {'posX': null, 'posY': null};
		
		retourSecond = $scope.isTroisPionsEspacePionDiagonal(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isTroisPionsEspacePionDiagonal");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		retourSecond = $scope.isTroisPionsEspacePionVertical(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isTroisPionsEspacePionVertical");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		retourSecond = $scope.isTroisPionsEspacePionHorizontal(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isTroisPionsEspacePionHorizontal");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		
		return retourFinal;
	};
	$scope.isDeuxPionsEspaceDeuxPions = function(tableau, numJoueur) {
		var retourSecond = {'posX': null, 'posY': null};
		var retourFinal = {'posX': null, 'posY': null};
		
		retourSecond = $scope.isDeuxPionsEspaceDeuxPionsVertical(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isDeuxPionsEspaceDeuxPionsVertical");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		retourSecond = $scope.isDeuxPionsEspaceDeuxPionsHorizontal(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isDeuxPionsEspaceDeuxPionsHorizontal");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		retourSecond = $scope.isDeuxPionsEspaceDeuxPionsDiagonal(tableau, numJoueur);
		if (retourSecond.posX != null && retourSecond.posY != null){
			console.log("isDeuxPionsEspaceDeuxPionsDiagonal");
			retourFinal.posX = retourSecond.posX; 
			retourFinal.posY = retourSecond.posY;
		}
		
		return retourFinal;
	};
	
	$scope.getTurnInfo = function(){
        $http.get($scope.apiURL + "/turn/" + $scope.idJoueur)
        .then(function success(response) {
			$scope.plateauJeu = response.data.tableau;
			$scope.nbCoupJoue = response.data.numTour;
			$scope.isFinPartie = response.data.finPartie;
			$scope.nbTenaillesJ1 = response.data.nbTenaillesJ1;
			$scope.nbTenaillesJ2 = response.data.nbTenaillesJ2;
			if (response.data.finPartie) {
				$interval.cancel($scope.interval);
				$scope.detailMessage.active = true;
				$scope.detailMessage.message = response.data.detailFinPartie;
			}
            if(response.data.status == 1 && !$scope.isPlaying) {
				$scope.isPlaying = true;
				if (!$scope.globalTimerStarted) {
					$scope.globalTimerStarted = true;
					$scope.startGlobalTimer();
				}
				if ($scope.gameMode == 'machine')
					$scope.myTurnToPlay(response.data);
			}   
        }, function error(response) {
			if ($scope.isFinPartie)
				$interval.cancel($scope.interval);
			else {
				$scope.errorInPlay.active = true;
				$scope.errorInPlay.message = response.data.error;
				$scope.isPlaying = true;
				$timeout(function() {
					$scope.errorInPlay = {active: false, message: null};
				}, 2000);
			}
		});
	}
	
	$scope.isLigneDeDeuxHorizontale = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++) {
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						if (plateauJeu[x][y] == numJoueur){
							// Scan vers la droite
							if((y+1)<=18 && plateauJeu[x][y+1] == numJoueur){
								if((y-1)>=0 && plateauJeu[x][y-1] == 0){
									pointX = x;
									pointY = y-1;
									trouve = true;
								}
								if((y+2)<=18 && plateauJeu[x][y+2] == 0){
									pointX = x;
									pointY = y+3;
									trouve = true;
								}
							}
							
							// Scan vers la gauche
							if((y-1)>=0 && plateauJeu[x][y-1] == numJoueur){
								if((y-2)>=0 && plateauJeu[x][y-2] == 0){
									pointX = x;
									pointY = y-2;
									trouve = true;
								}
								if((y+1)<=18 && plateauJeu[x][y+1] == 0){
									pointX = x;
									pointY = y+1;
									trouve = true;
								}
							}
						}
					}
				}
			}			
		}
		return {'posX': pointX, 'posY': pointY};
	};
	
	$scope.isLigneDeDeuxVerticale = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++){
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						if (plateauJeu[x][y] == numJoueur){
							// Scan vers le haut
							if((x-1)>=0 && plateauJeu[x-1][y] == numJoueur){
								if((x-2)>=0 && plateauJeu[x-2][y] == 0){
									pointX = x-2;
									pointY = y;
									trouve = true;
								}
								if((x+1)<=18 && plateauJeu[x+1][y] == 0){
									pointX = x+1;
									pointY = y;
									trouve = true;
								}
							}
							//Scan vers le bas
							if((x+1)<=18 && plateauJeu[x+1][y] == numJoueur){
								if((x-1)>=0 && plateauJeu[x-1][y] == 0){
									pointX = x-1;
									pointY = y;
									trouve = true;
								}
								if((x+2)<=18 && plateauJeu[x+2][y] == 0){
									pointX = x+2;
									pointY = y;
									trouve = true;
								}
							}
						}
					}
				}
			}			
		}
		return {'posX': pointX, 'posY': pointY};
	};
	
	$scope.isLigneDeDeuxDiagonale = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++){
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						// Diagonale haut gauche
						if (plateauJeu[x][y] == numJoueur){
							if((x-1)>=0 && (y-1)>=0 && plateauJeu[x-1][y-1] == numJoueur){
								if((x-2)>=0 && (y-2)>=0 && plateauJeu[x-2][y-2] == 0){
									pointX = x-2;
									pointY = y-2;
									trouve = true;
								}
								if((x+1)<=18 && (y+1)<=18 && plateauJeu[x+1][y+1] == 0){
									pointX = x+1;
									pointY = y+1;
									trouve = true;
								}
							}
						}
						
						// Diagonale haut droite
						if (plateauJeu[x][y] == numJoueur){
							if((x-1)>=0 && (y+1)<=18 && plateauJeu[x-1][y+1] == numJoueur){
								if((x-2)>=0 && (y+2)<=18 && plateauJeu[x-2][y+2] == 0){
									pointX = x-2;
									pointY = y+2;
									trouve = true;
								}
								if((x+1)>=0 && (y-1)>=0 && plateauJeu[x+1][y-1] == 0){
									pointX = x+1;
									pointY = y-1;
									trouve = true;
								}
							}
						}
						
						// Diagonale bas gauche
						if (plateauJeu[x][y] == numJoueur){
							if((x+1)<=18 && (y-1)>=0 && plateauJeu[x+1][y-1] == numJoueur){
								if((x+2)<=18 && (y-2)>=0 && plateauJeu[x+2][y-2] == 0){
									pointX = x+2;
									pointY = y-2;
									trouve = true;
								}
								if((x-1)>=0 && (y+1)<=18 && plateauJeu[x-1][y+1] == 0){
									pointX = x-1;
									pointY = y+1;
									trouve = true;
								}
							}
						}
						
						// Diagonale bas droite
						if (plateauJeu[x][y] == numJoueur){
							if((x+1)<=18 && (y+1)<=18 && plateauJeu[x+1][y+1] == numJoueur){
								if((x-1)>=0 && (y-1)>=0 && plateauJeu[x-1][y-1] == 0){
									pointX = x-1;
									pointY = y-1;
									trouve = true;
								}
									
								if((x+2)<=18 && (y+2)<=18 && plateauJeu[x+2][y+2] == 0){
									pointX = x+2;
									pointY = y+2;
									trouve = true;
								}
							}
						}
					}
				}
			}
		}
		return {'posX': pointX, 'posY': pointY};
	};
	
	$scope.isLigneDeTroisHorizontale = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++) {
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						if (plateauJeu[x][y] == numJoueur){
							// Scan vers la droite
							if((y+2) <=18 && plateauJeu[x][y+1] == numJoueur && plateauJeu[x][y+2] == numJoueur){
								if((y-1)>=0 && plateauJeu[x][y-1] == 0){
									pointX = x;
									pointY = y-1;
									trouve = true;
								}
								if((y+3)<=18 && plateauJeu[x][y+3] == 0){
									pointX = x;
									pointY = y+3;
									trouve = true;
								}
							}
							
							// Scan vers la gauche
							if((y-2)>=0 && plateauJeu[x][y-1] == numJoueur && plateauJeu[x][y-2] == numJoueur){
								if((y-3)>=0 && plateauJeu[x][y-3] == 0){
									pointX = x;
									pointY = y-3;
									trouve = true;
								}
								if((y+1)<=18 && plateauJeu[x][y+1] == 0){
									pointX = x;
									pointY = y+1;
									trouve = true;
								}
							}
							
							
						}
					}
				}
			}			
		}
		return {'posX': pointX, 'posY': pointY};
	};
	
	$scope.isLigneDeTroisVerticale = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++){
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						if (plateauJeu[x][y] == numJoueur){
							// Scan vers le haut
							if((x-2)>=0 && plateauJeu[x-1][y] == numJoueur && plateauJeu[x-2][y] == numJoueur){
								if((x-3)>=0 && plateauJeu[x-3][y] == 0){
									pointX= x-3;
									pointY = y;
									trouve = true;
								}
								if((x+1)<=18 && plateauJeu[x+1][y] == 0){
									pointX= x+1;
									pointY = y;
									trouve = true;
								}
							}
							
							//Scan vers le bas
							if((x+2)<=18 && plateauJeu[x+1][y] == numJoueur && plateauJeu[x+2][y] == numJoueur){
								if((x-1)>=0 && plateauJeu[x-1][y] == 0){
									pointX = x-1;
									pointY = y;
									trouve = true;
								}
								if((x+3)<=18 && plateauJeu[x+3][y] == 0){
									pointX = x+3;
									pointY = y;
									trouve = true;
								}
							}
						}
					}
				}
			}			
		}
		return {'posX': pointX, 'posY': pointY};
	};

	$scope.isLigneDeTroisDiagonale = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++){
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						// Diagonale haut gauche
						if (plateauJeu[x][y] == numJoueur){
							if((x-2)>=0 && (y-2)>=0 && plateauJeu[x-1][y-1] == numJoueur && plateauJeu[x-2][y-2] == numJoueur){
								if((x-3)>=0 && (y-3)>=0 && plateauJeu[x-3][y-3] == 0){
									pointX = x-3;
									pointY = y-3;
									trouve=true;
								}
								if((x+1)<=18 && (y+1)<=18 && plateauJeu[x+1][y+1] == 0){
									pointX = x+1;
									pointY = y+1;
									trouve=true;
								}
							}
						}
						
						// Diagonale haut droite
						if (plateauJeu[x][y] == numJoueur){
							if((x-2)>=0 && (y+2)<=18 && plateauJeu[x-1][y+1] == numJoueur && plateauJeu[x-2][y+2] == numJoueur){
								if((x-3)>=0 && (y+3)<=18 && plateauJeu[x-3][y+3] == 0){
									pointX = x-3;
									pointY = y+3;
									trouve = true;
								}
								if((x+1)>=0 && (y-1)>=0 && plateauJeu[x+1][y-1] == 0){
									pointX = x+1;
									pointY = y-1;
									trouve = true;
								}
							}
						}
						
						// Diagonale bas gauche
						if (plateauJeu[x][y] == numJoueur){
							if((x+2)<=18 && (y-2)>=0 && plateauJeu[x+1][y-1] == numJoueur && plateauJeu[x+2][y-2] == numJoueur){
								if((x+3)<=18 && (y-3)>=0 && plateauJeu[x+3][y-3] == 0){
									pointX = x+3;
									pointY = y-3;
									trouve = true;
								}
								if((x-1)>=0 && (y+1)<=18 && plateauJeu[x-1][y+1] == 0){
									pointX = x-1;
									pointY = y+1;
									trouve = true;
								}
							}
						}
						
						// Diagonale bas droite
						if (plateauJeu[x][y] == numJoueur){
							if((x+2)<=18 && (y+2)<=18 && plateauJeu[x+1][y+1] == numJoueur && plateauJeu[x+2][y+2] == numJoueur){
								if((x-1)>=0 && (y-1)>=0 && plateauJeu[x-1][y-1] == 0){
									pointX = x-1;
									pointY = y-1;
									trouve = true;
								}
								if((x+3)<=18 && (y+3)<=18 && plateauJeu[x+3][y+3] == 0){
									pointX = x+3;
									pointY = y+3;
									trouve = true;
								}
							}
						}
					}
				}
			}
		}
		return {'posX': pointX, 'posY': pointY};
	};
	
	$scope.isLigneDeQuatreHorizontale = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++) {
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						if (plateauJeu[x][y] == numJoueur){
							// Scan vers la droite
							if((y+3)<=18 && plateauJeu[x][y+1] == numJoueur && plateauJeu[x][y+2] == numJoueur && plateauJeu[x][y+3] == numJoueur){
								if((y-1)>=0 && plateauJeu[x][y-1] == 0){
									pointX = x;
									pointY = y-1;
									trouve = true;
								}
								if((y+4)<=18 && plateauJeu[x][y+4] == 0){
									pointX = x;
									pointY = y+4;
									trouve = true;
								}
							}
							
							// Scan vers la gauche
							if((y-3)>=0 && plateauJeu[x][y-1] == numJoueur && plateauJeu[x][y-2] == numJoueur && plateauJeu[x][y-3] == numJoueur){
								if((y-4)>=0 && plateauJeu[x][y-4] == 0){
									pointX = x;
									pointY = y-4;
									trouve = true;
								}
								if((y+1)<=18 && plateauJeu[x][y+1] == 0){
									pointX = x;
									pointY = y+1;
									trouve = true;
								}
							}
						}
					}
				}
			}			
		}
		return {'posX': pointX, 'posY': pointY};
	};

	$scope.isLigneDeQuatreVerticale = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++){
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						if (plateauJeu[x][y] == numJoueur){
							// Scan vers le haut
							if((x-3)>=0 && plateauJeu[x-1][y] == numJoueur && plateauJeu[x-2][y] == numJoueur && plateauJeu[x-3][y] == numJoueur){
								if((x-4)>=0 && plateauJeu[x-4][y] == 0){
									pointX = x-4;
									pointY = y;
									trouve = true;
								}
								if((x+1)<=18 && plateauJeu[x+1][y] == 0){
									pointX = x+1;
									pointY = y;
									trouve = true;
								}
							}
							//Scan vers le bas
							if((x+3)<=18 && plateauJeu[x+1][y] == numJoueur && plateauJeu[x+2][y] == numJoueur && plateauJeu[x+3][y] == numJoueur){
								if((x-1)>=0 && plateauJeu[x-1][y] == 0){
									pointX = x-1;
									pointY = y;
									trouve = true;
								}
								if((x+4)<=18 && plateauJeu[x+4][y] == 0){
									pointX = x+4;
									pointY = y;
									trouve = true;
								}
							}
						}
					}
				}
			}			
		}
		return {'posX': pointX, 'posY': pointY};
	};

	$scope.isLigneDeQuatreDiagonale = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++){
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						// Diagonale haut gauche
						if (plateauJeu[x][y] == numJoueur){
							if((x-3)>=0 && (y-3)>=0 && plateauJeu[x-1][y-1] == numJoueur && plateauJeu[x-2][y-2] == numJoueur && plateauJeu[x-3][y-3] == numJoueur){
								if((x-4)>=0 && (y-4)>=0 && plateauJeu[x-4][y-4] == 0){
									pointX = x-4;
									pointY = y-4;
									trouve = true;
								}
								if((x+1)<=18 && (y+1)<=18 && plateauJeu[x+1][y+1] == 0){
									pointX = x+1;
									pointY = y+1;
									trouve = true;
								}
							}
						}
						
						// Diagonale haut droite
						if (plateauJeu[x][y] == numJoueur){
							if((x-3)>=0 && (y+3)<=18 && plateauJeu[x-1][y+1] == numJoueur && plateauJeu[x-2][y+2] == numJoueur && plateauJeu[x-3][y+3] == numJoueur){
								if((x-4)>=0 && (y+4)<=18 && plateauJeu[x-4][y+4] == 0){
									pointX = x-4;
									pointY = y+4;
									trouve = true;
								}
								if((x+1)>=0 && (y-1)>=0 && plateauJeu[x+1][y-1] == 0){
									pointX = x+1;
									pointY = y-1;
									trouve = true;
								}
							}
						}
						
						// Diagonale bas gauche
						if (plateauJeu[x][y] == numJoueur){
							if((x+3)<=18 && (y-3)>=0 && plateauJeu[x+1][y-1] == numJoueur && plateauJeu[x+2][y-2] == numJoueur && plateauJeu[x+3][y-3] == numJoueur){
								if((x+4)<=18 && (y-4)>=0 && plateauJeu[x+4][y-4] == 0){
									pointX = x+4;
									pointY = y-4;
									trouve = true;
								}
								if((x-1)>=0 && (y+1)<=18 && plateauJeu[x-1][y+1] == 0){
									pointX = x-1;
									pointY = y+1;
									trouve = true;
								}
							}
						}
						
						// Diagonale bas droite
						if (plateauJeu[x][y] == numJoueur){
							if((x+3)<=18 && (y+3)<=18 && plateauJeu[x+1][y+1] == numJoueur && plateauJeu[x+2][y+2] == numJoueur && plateauJeu[x+3][y+3] == numJoueur){
								if((x-1)>=0 && (y-1)>=0 && plateauJeu[x-1][y-1] == 0){
									pointX = x-1;
									pointY = y-1;
									trouve = true;
								}
								if((x+4)<=18 && (y+4)<=18 && plateauJeu[x+4][y+4] == 0){
									pointX = x+4;
									pointY = y+4;
									trouve = true;
								}
							}
						}
					}
				}
			}
		}
		return {'posX': pointX, 'posY': pointY};
	};
	
	$scope.isDeuxPionsEspacePionHorizontal = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++) {
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						if (plateauJeu[x][y] == numJoueur){
							// Scan vers la droite
							if((y+3)<=18 && plateauJeu[x][y+1] == numJoueur && plateauJeu[x][y+2] == 0 && plateauJeu[x][y+3] == numJoueur){
								pointX = x;
								pointY = y+2;
								trouve = true;
							}
							
							// Scan vers la gauche
							if((y-3)>=0 && plateauJeu[x][y-1] == numJoueur && plateauJeu[x][y-2] == 0 && plateauJeu[x][y-3] == numJoueur){
								pointX = x;
								pointY = y-2;
								trouve = true;
							}
						}
					}
				}
			}			
		}
		return {'posX': pointX, 'posY': pointY};
	};

	$scope.isDeuxPionsEspacePionVertical = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++){
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						if (plateauJeu[x][y] == numJoueur){
							// Scan vers le haut
							if((x-3)>=0 && plateauJeu[x-1][y] == numJoueur && plateauJeu[x-2][y] == 0 && plateauJeu[x-3][y] == numJoueur ){
								pointX = x-2;
								pointY = y;
								trouve = true;
							}
							//Scan vers le bas
							if((x+3)<=18 && plateauJeu[x+1][y] == numJoueur && plateauJeu[x+2][y] == 0 && plateauJeu[x+3][y] == numJoueur){
								pointX = x+2;
								pointY = y;
								trouve = true;
							}
						}
					}
				}
			}			
		}
		return {'posX': pointX, 'posY': pointY};
	};

	$scope.isDeuxPionsEspacePionDiagonal = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++){
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						// Diagonale haut gauche
						if (plateauJeu[x][y] == numJoueur){
							if((x-3)>=0 && (y-3)>=0 && plateauJeu[x-1][y-1] == numJoueur && plateauJeu[x-2][y-2] == 0 && plateauJeu[x-3][y-3] == numJoueur){
								pointX = x-2;
								pointY = y-2;
								trouve = true;
							}
						}
						
						// Diagonale haut droite
						if (plateauJeu[x][y] == numJoueur){
							if((x-3)>=0 && (y+3)<=18 && plateauJeu[x-1][y+1] == numJoueur && plateauJeu[x-2][y+2] == 0 && plateauJeu[x-3][y+3] == numJoueur){
								pointX = x-2;
								pointY = y+2;
								trouve = true;
							}
						}
						
						// Diagonale bas gauche
						if (plateauJeu[x][y] == numJoueur){
							if((x+3)<=18 && (y-3)>=0 && plateauJeu[x+1][y-1] == numJoueur && plateauJeu[x+2][y-2] == 0 && plateauJeu[x+3][y-3] == numJoueur){
								pointX = x+2;
								pointY = y-2;
								trouve = true;
							}
						}
						
						// Diagonale bas droite
						if (plateauJeu[x][y] == numJoueur){
							if((x+3)<=18 && (y+3)<=18 && plateauJeu[x+1][y+1] == numJoueur && plateauJeu[x+2][y+2] == 0 && plateauJeu[x+3][y+3] == numJoueur){
								pointX = x+2;
								pointY = y+2;
								trouve = true;
							}
						}
					}
				}
			}
		}
		return {'posX': pointX, 'posY': pointY};
	};
	
	$scope.isDeuxPionsEspaceDeuxPionsHorizontal = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++) {
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						if (plateauJeu[x][y] == numJoueur){
							// Scan vers la droite
							if((y+4)<=18 && plateauJeu[x][y+1] == numJoueur && plateauJeu[x][y+2] == 0 && plateauJeu[x][y+3] == numJoueur && plateauJeu[x][y+4] == numJoueur){
								pointX = x;
								pointY = y+2;
								trouve = true;
							}
							
							// Scan vers la gauche
							if((y-4)>=0 && plateauJeu[x][y-1] == numJoueur && plateauJeu[x][y-2] == 0 && plateauJeu[x][y-3] == numJoueur && plateauJeu[x][y-4] == numJoueur){
								pointX = x;
								pointY = y-2;
								trouve = true;
							}
						}
					}
				}
			}			
		}
		return {'posX': pointX, 'posY': pointY};
	};

	$scope.isDeuxPionsEspaceDeuxPionsVertical = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++){
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						if (plateauJeu[x][y] == numJoueur){
							// Scan vers le haut
							if((x-4)>=0 && plateauJeu[x-1][y] == numJoueur && plateauJeu[x-2][y] == 0 && plateauJeu[x-3][y] == numJoueur && plateauJeu[x-4][y] == numJoueur ){
								pointX = x-2;
								pointY = y;
								trouve = true;
							}
							//Scan vers le bas
							if((x+4)<=18 && plateauJeu[x+1][y] == numJoueur && plateauJeu[x+2][y] == 0 && plateauJeu[x+3][y] == numJoueur && plateauJeu[x+4][y] == numJoueur){
								pointX = x+2;
								pointY = y;
								trouve = true;
							}
						}
					}
				}
			}			
		}
		return {'posX': pointX, 'posY': pointY};
	};

	$scope.isDeuxPionsEspaceDeuxPionsDiagonal = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++){
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						// Diagonale haut gauche
						if (plateauJeu[x][y] == numJoueur){
							if((x-4)>=0 && (y-4)>=0 && plateauJeu[x-1][y-1] == numJoueur && plateauJeu[x-2][y-2] == 0 && plateauJeu[x-3][y-3] == numJoueur && plateauJeu[x-4][y-4] == numJoueur){
								pointX = x-2;
								pointY = y-2;
								trouve = true;
							}
						}
						
						// Diagonale haut droite
						if (plateauJeu[x][y] == numJoueur){
							if((x-4)>=0 && (y+4)<=18 && plateauJeu[x-1][y+1] == numJoueur && plateauJeu[x-2][y+2] == 0 && plateauJeu[x-3][y+3] == numJoueur && plateauJeu[x-4][y+4] == numJoueur){
								pointX = x-2;
								pointY = y+2;
								trouve = true;
							}
						}
						
						// Diagonale bas gauche
						if (plateauJeu[x][y] == numJoueur){
							if((x+4)<=18 && (y-4)>=0 && plateauJeu[x+1][y-1] == numJoueur && plateauJeu[x+2][y-2] == 0 && plateauJeu[x+3][y-3] == numJoueur && plateauJeu[x+4][y-4] == numJoueur){
								pointX = x-2;
								pointY = y-2;
								trouve = true;
							}
						}
						
						// Diagonale bas droite
						if (plateauJeu[x][y] == numJoueur){
							if((x+4)<=18 && (y+4)<=18 && plateauJeu[x+1][y+1] == numJoueur && plateauJeu[x+2][y+2] == 0 && plateauJeu[x+3][y+3] == numJoueur && plateauJeu[x+4][y+4] == numJoueur){
								pointX = x+2;
								pointY = y+2;
								trouve = true;
							}
						}
					}
				}
			}
		}
		return {'posX': pointX, 'posY': pointY};
	};
	
	$scope.isTroisPionsEspacePionHorizontal = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++) {
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						if (plateauJeu[x][y] == numJoueur){
							// Scan vers la droite
							if((y+4)<=18 && plateauJeu[x][y+1] == numJoueur && plateauJeu[x][y+2] == numJoueur && plateauJeu[x][y+3] == 0 && plateauJeu[x][y+4] == numJoueur){
								pointX = x;
								pointY = y+3;
								trouve = true;
							}
							
							// Scan vers la gauche
							if((y-4)>=0 && plateauJeu[x][y-1] == numJoueur && plateauJeu[x][y-2] == numJoueur && plateauJeu[x][y-3] == 0 && plateauJeu[x][y-4] == numJoueur){
								pointX = x;
								pointY = y-3;
								trouve = true;
							}
						}
					}
				}
			}			
		}
		return {'posX': pointX, 'posY': pointY};
	};

	$scope.isTroisPionsEspacePionVertical = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++){
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						if (plateauJeu[x][y] == numJoueur){
							// Scan vers le haut
							if((x-4)>=0 && plateauJeu[x-1][y] == numJoueur && plateauJeu[x-2][y] == numJoueur && plateauJeu[x-3][y] == 0 && plateauJeu[x-4][y] == numJoueur ){
								pointX = x-3;
								pointY = y;
								trouve = true;
							}
							//Scan vers le bas
							if((x+4)<=18 && plateauJeu[x+1][y] == numJoueur && plateauJeu[x+2][y] == numJoueur && plateauJeu[x+3][y] == 0 && plateauJeu[x+4][y] == numJoueur){
								pointX = x+3;
								pointY = y;
								trouve = true;
							}
						}
					}
				}
			}			
		}
		return {'posX': pointX, 'posY': pointY};
	};

	$scope.isTroisPionsEspacePionDiagonal = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++){
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						// Diagonale haut gauche
						if (plateauJeu[x][y] == numJoueur){
							if((x-4)>=0 && (y-4)>=0 && plateauJeu[x-1][y-1] == numJoueur && plateauJeu[x-2][y-2] == numJoueur && plateauJeu[x-3][y-3] == 0 && plateauJeu[x-4][y-4] == numJoueur){
								pointX = x-3;
								pointY = y-3;
								trouve = true;
							}
						}
						
						// Diagonale haut droite
						if (plateauJeu[x][y] == numJoueur){
							if((x-4)>=0 && (y+4)<=18 && plateauJeu[x-1][y+1] == numJoueur && plateauJeu[x-2][y+2] == numJoueur && plateauJeu[x-3][y+3] == 0 && plateauJeu[x-4][y+4] == numJoueur){
								pointX = x-3;
								pointY = y-3;
								trouve = true;
							}
						}
						
						// Diagonale bas gauche
						if (plateauJeu[x][y] == numJoueur){
							if((x+4)<=18 && (y-4)>=0 && plateauJeu[x+1][y-1] == numJoueur && plateauJeu[x+2][y-2] == numJoueur && plateauJeu[x+3][y-3] == 0 && plateauJeu[x+4][y-4] == numJoueur){
								pointX = x+3;
								pointY = y-3;
								trouve = true;
							}
						}
						
						// Diagonale bas droite
						if (plateauJeu[x][y] == numJoueur){
							if((x+4)<=18 && (y+4)<=18 && plateauJeu[x+1][y+1] == numJoueur && plateauJeu[x+2][y+2] == numJoueur && plateauJeu[x+3][y+3] == 0 && plateauJeu[x+4][y+4] == numJoueur){
								pointX = x+3;
								pointY = y+3;
								trouve = true;
							}
						}
					}
				}
			}
		}
		return {'posX': pointX, 'posY': pointY};
	};
	
	$scope.isPaireFormableHorizontale = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++) {
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						if (plateauJeu[x][y] == numJoueur){
							// Scan vers la droite
							if((y+1)<=18 && plateauJeu[x][y+1] == 0){
								pointX = x;
								pointY = y+1;
								trouve = true;
							}
							
							// Scan vers la gauche
							if((y-1)>=0 && plateauJeu[x][y-1] == 0){
								pointX = x;
								pointY = y-1;
								trouve = true;
							}
						}
					}
				}
			}			
		}
		return {'posX': pointX, 'posY': pointY};
	};

	$scope.isPaireFormableVerticale = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++){
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						if (plateauJeu[x][y] == numJoueur){
							// Scan vers le haut
							if((x-1)>=0 && plateauJeu[x-1][y] == 0){
								console.log("paire formable trouvé si placé en haut");
								pointX = x-1;
								pointY = y;
								trouve = true;
							}
							//Scan vers le bas
							if((x+1)<=18 && plateauJeu[x+1][y] == 0){
								console.log("paire formable trouvé si placé en bas");
								pointX = x+1;
								pointY = y;
								trouve = true;
							}
						}
					}
				}
			}			
		}
		return {'posX': pointX, 'posY': pointY};
	};

	$scope.isPaireFormableDiagonal = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++){
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						// Diagonale haut gauche
						if (plateauJeu[x][y] == numJoueur){
							if((x-1)>=0 && (y-1)>=0 && plateauJeu[x-1][y-1] == 0){
								pointX = x-1;
								pointY = y-1;
								trouve = true;
							}
						}
						
						// Diagonale haut droite
						if (plateauJeu[x][y] == numJoueur){
							if((x-1)>=0 && (y+1)<=18 && plateauJeu[x-1][y+1] == 0){
								pointX = x-1;
								pointY = y+1;
								trouve = true;
							}
						}
						
						// Diagonale bas gauche
						if (plateauJeu[x][y] == numJoueur){
							if((x+1)<=18 && (y-1)>=0 && plateauJeu[x+1][y-1] == 0){
								pointX = x+1;
								pointY = y-1;
								trouve = true;
							}
						}
						
						// Diagonale bas droite
						if (plateauJeu[x][y] == numJoueur){
							if((x+1)<=18 && (y+1)<=18 && plateauJeu[x+1][y+1] == 0){
								pointX = x+1;
								pointY = y+1;
								trouve = true;
							}
						}
					}
				}
			}
		}
		return {'posX': pointX, 'posY': pointY};
	};
	
	$scope.isPaireMangeableHorizontale = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++) {
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						if (plateauJeu[x][y] == numJoueur){
							// Scan vers la droite
							if((y+3)<=18 && plateauJeu[x][y+1] != numJoueur && plateauJeu[x][y+1] != 0 && plateauJeu[x][y+2] != numJoueur && plateauJeu[x][y+2] != 0 && plateauJeu[x][y+3] == 0){
								pointX = x;
								pointY = y+3;
								trouve = true;
							}
							
							// Scan vers la gauche
							if((y-3)>=0 && plateauJeu[x][y-1] != numJoueur && plateauJeu[x][y-1] != 0 && plateauJeu[x][y-2] != numJoueur && plateauJeu[x][y-2] != 0 && plateauJeu[x][y-3] == 0){
								pointX = x;
								pointY = y-3;
								trouve = true;
							}
						}
					}
				}
			}			
		}
		return {'posX': pointX, 'posY': pointY};
	};

	$scope.isPaireMangeableVerticale = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++){
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						if (plateauJeu[x][y] == numJoueur){
							// Scan vers la bas
							if((x+3)<=18 && plateauJeu[x+1][y] != numJoueur && plateauJeu[x+1][y] != 0 && plateauJeu[x+2][y] != numJoueur && plateauJeu[x+2][y] != 0 && plateauJeu[x+3][y] == 0){
								pointX = x+3;
								pointY = y;
								trouve = true;
							}
							
							// Scan vers la bas
							if((x-3)>=0 && plateauJeu[x-1][y] != numJoueur && plateauJeu[x-1][y] != 0 && plateauJeu[x-2][y] != numJoueur && plateauJeu[x-2][y] != 0 && plateauJeu[x-3][y] == 0){
								pointX = x-3;
								pointY = y;
								trouve = true;
							}
						}
					}
				}
			}			
		}
		return {'posX': pointX, 'posY': pointY};
	};

	$scope.isPaireMangeableDiagonale = function(plateauJeu, numJoueur){
		trouve = false;
		pointX = null;
		pointY = null;
		for (var x = 0; x <= 18; x++){
			if(!trouve){
				for (var y = 0; y <= 18; y++) {
					if(!trouve){
						// Diagonale haut gauche
						if (plateauJeu[x][y] == numJoueur){
							if((x-3)>=0 && (y-3)>=0 && plateauJeu[x-1][y-1] != numJoueur && plateauJeu[x-1][y-1] != 0 && plateauJeu[x-2][y-2] != numJoueur && plateauJeu[x-2][y-2] != 0 && plateauJeu[x-3][y-3] == 0){
								pointX = x-3;
								pointY = y-3;
								trouve = true;
							}
						}
						
						// Diagonale haut droite
						if (plateauJeu[x][y] == numJoueur){
							if((x-3)>=0 && (y+3)<=18 && plateauJeu[x-1][y+1] != numJoueur && plateauJeu[x-1][y+1] != 0 && plateauJeu[x-2][y+2] != numJoueur && plateauJeu[x-2][y+2] != 0 && plateauJeu[x-3][y+3] == 0){
								pointX = x-3;
								pointY = y+3;
								trouve = true;
							}
						}
						
						// Diagonale bas gauche
						if (plateauJeu[x][y] == numJoueur){
							if((x+3)<=18 && (y-3)>=0 && plateauJeu[x+1][y-1] != numJoueur && plateauJeu[x+1][y-1] != 0 && plateauJeu[x+2][y-2] != numJoueur && plateauJeu[x+2][y-2] != 0  && plateauJeu[x+3][y-3] == 0){
								pointX = x+3;
								pointY = y-3;
								trouve = true;
							}
						}
						
						// Diagonale bas droite
						if (plateauJeu[x][y] == numJoueur){
							if((x+3)<=18 && (y+3)<=18 && plateauJeu[x+1][y+1] != numJoueur && plateauJeu[x+1][y+1] != 0 && plateauJeu[x+2][y+2] != numJoueur && plateauJeu[x+2][y+2] != 0 && plateauJeu[x+3][y+3] == 0){
								pointX = x+3;
								pointY = y+3;
								trouve = true;
							}
						}
					}
				}
			}
		}
		return {'posX': pointX, 'posY': pointY};
	};
}]);