var app = angular.module("penteApp", []); 

app.controller("penteCtrl", ['$scope', '$http', '$interval', '$timeout', function($scope, $http, $interval, $timeout) {
	$scope.connnected = false;
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
	
	$scope.joinGame = function(gameMode) {
		$http.get("http://localhost:8080/connect/" + $scope.nomJoueur)
		.then(function success(response) {
			var data = response.data;
			$scope.connected = true;
			$scope.idJoueur = data.idJoueur;
			$scope.gameMode = gameMode;
			$scope.numJoueur = data.numJoueur;
			$scope.interval = $interval($scope.getTurnInfo,500)
			
		}, function error(response) {
			console.log(response);
			$scope.errorMessage.error = true;
			$scope.errorMessage.message = response.data.error;
		});
	};
	
	$scope.makeAPlay = function(x, y) {
		if ($scope.isPlaying) {
			$http.get("http://localhost:8080/play/" + x + "/" + y + "/" + $scope.idJoueur)
			.then(function success(response) {
				$scope.isPlaying = false;
			}, function error(reponse) {
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
		}
		else {
			choixX = Math.floor(Math.random() * 18) + 0;
			choixY = Math.floor(Math.random() * 18) + 0;
		}
		// Decomenter cette ligne apres avoir joué le coup
		if (data.finPartie) {
			$interval.cancel($scope.interval);
		}
		else {
			$http.get("http://localhost:8080/play/" + choixX + "/" + choixY + "/" + $scope.idJoueur)
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
	
	$scope.getTurnInfo = function(){
        $http.get("http://localhost:8080/turn/" + $scope.idJoueur)
        .then(function success(response) {
			$scope.plateauJeu = response.data.tableau;
			$scope.nbCoupJoue = response.data.numTour;
			$scope.finPartie = response.data.finPartie;
			$scope.nbTenaillesJ1 = response.data.nbTenaillesJ1;
			$scope.nbTenaillesJ2 = response.data.nbTenaillesJ2;
			if (response.data.finPartie) {
				$interval.cancel($scope.interval);
				$scope.detailMessage.active = true;
				$scope.detailMessage.message = response.data.detailFinPartie;
			}
            if(response.data.status == 1 && !$scope.isPlaying) {
				$scope.isPlaying = true;
				if ($scope.gameMode == 'machine')
					$scope.myTurnToPlay(response.data);
			}   
        }, function error(reponse) {
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