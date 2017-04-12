var app = angular.module("penteApp", []); 

app.controller("penteCtrl", ['$scope', '$http', '$interval', function($scope, $http, $interval) {
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
	
	$scope.joinGame = function() {
		$http.get("http://localhost:8080/connect/" + $scope.nomJoueur)
		.then(function success(response) {
			var data = response.data;
			$scope.connected = true;
			$scope.idJoueur = data.idJoueur;
			$scope.numJoueur = data.numJoueur;
			$scope.interval = $interval($scope.getTurnInfo,500)
			
		}, function error(response) {
			console.log(response);
			$scope.errorMessage.error = true;
			$scope.errorMessage.message = response.data.error;
		});
	};
	
	$scope.myTurnToPlay = function(data) {
		console.log("myturn " + data);
		// Decomenter cette ligne apres avoir joué le coup
		// $scope.isPlaying = false;
	};
	
	$scope.getTurnInfo = function(){
        $http.get("http://localhost:8080/turn/" + $scope.idJoueur)
        .then(function success(response) {
			console.log("turnInfo " + response.data.status);
            if(response.data.status == 1 && !isPlaying) {
				$scope.isPlaying = true;
				$scope.myTurnToPlay(response.data);
			}   
        }, function error(reponse) {
		});
	}
}]);