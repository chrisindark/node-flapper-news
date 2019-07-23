(function() {
    angular
        .module('flapperNews.controllers.auth', []);

    app.config([
        "$stateProvider",
        function($stateProvider) {
            $stateProvider
        }
    ]);

    app.controller("AuthController", [
        "$scope",
        "$state",
        "authService",
        function($scope, $state, authService) {
            $scope.user = {};

            function register() {
                authService.register($scope.user).error(function(error) {
                    $scope.error = error;
                }).then(function() {
                    $state.go("home");
                });
            }

            function logIn() {
                authService.logIn($scope.user).error(function(error) {
                    $scope.error = error;
                }).then(function() {
                    $state.go("home");
                });
            }

            $scope.register = register;
            $scope.logIn = logIn;
        }
    ]);
})();
