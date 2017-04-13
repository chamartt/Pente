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
	
	$scope.initPlateau = function() {
		for(var i = 0; i <= 18; ++i) {
			$scope.plateauJeu[i] = [];
			for(var j = 0; j <= 18; j++) {
				$scope.plateauJeu[i][j] = 0;
			}
		}
	};
	
	$scope.initPlateau();
	//TIMER 10M
	$scope.startGlobalTimer = function() {
		var countDownDate = new Date();
		countDownDate.setMinutes(countDownDate.getMinutes() + 10);

		var x = setInterval(function() {
		  var now = new Date().getTime();
		  var distance = countDownDate - now;
		  
		  if (distance < 0) {
			$scope.minuteGlobal = "00";
			$scope.secondGlobal = "00";
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
			$scope.errorMessage.message = "Mauvais nom d'équipe : 4 chiffres - 4 lettres";
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
				$scope.interval = $interval($scope.getTurnInfo,500);
				
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
		var choixX;
		var choixY;
		$scope.tempData = data;
		
		if ($scope.nbCoupJoue == 0) {
			choixX = choixY = 9;
		}
		else if ($scope.nbCoupJoue == 2) {
			choixX = Math.floor(Math.random() * 6) + 12;
			choixY = Math.floor(Math.random() * 6) + 12;
			while (tableau[choixX][choixY] != 0) {
				choixX = Math.floor(Math.random() * 6) + 12;
				choixY = Math.floor(Math.random() * 6) + 12;
			}
		}
		else {
			choixX = Math.floor(Math.random() * 18) + 0;
			choixY = Math.floor(Math.random() * 18) + 0;
			while (tableau[choixX][choixY] != 0) {
				choixX = Math.floor(Math.random() * 18) + 0;
				choixY = Math.floor(Math.random() * 18) + 0;
			}
		}
		// Decomenter cette ligne apres avoir joué le coup
		if (data.finPartie) {
			$interval.cancel($scope.interval);
		}
		else {
			$timeout(function() {
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
			}, 2000);
		}
	};
	
	$scope.getTurnInfo = function(){
        $http.get($scope.apiURL + "/turn/" + $scope.idJoueur)
        .then(function success(response) {
			$scope.plateauJeu = response.data.tableau != null ? response.data.tableau : $scope.plateauJeu;
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
}]);